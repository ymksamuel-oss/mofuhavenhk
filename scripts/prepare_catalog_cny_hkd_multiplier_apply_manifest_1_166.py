#!/usr/bin/env python3
"""Build a strict, read-only Stripe snapshot manifest for the owner-approved repricing.

No Stripe object is created, changed, or deactivated. This program must run immediately
before the paired apply program. It limits scope to the 138 currently active,
storefront-sellable HKD Prices marked as changing in the reviewed 1.166 preview.
"""
from __future__ import annotations

import hashlib
import json
import os
from collections import defaultdict
from datetime import datetime, timezone
from decimal import Decimal, ROUND_CEILING
from pathlib import Path
from typing import Any

import requests

ROOT = Path(__file__).resolve().parents[1]
REPORTS = ROOT / "reports"
PREVIEW = REPORTS / "catalog_cny_hkd_multiplier_repricing_preview_1_166_2026-08-27.json"
MANIFEST = REPORTS / "catalog_cny_hkd_multiplier_apply_manifest_1_166_2026-08-27.json"
FX = Decimal("1.166")
MULTIPLIER = Decimal("1.76")
TAIL = Decimal("0.90")


def text(value: Any) -> str:
    return str(value).strip() if value is not None else ""


def request_get(api_key: str, path: str, params: dict[str, str] | None = None) -> dict[str, Any]:
    response = requests.get(
        f"https://api.stripe.com/v1/{path}",
        params=params or {},
        auth=(api_key, ""),
        timeout=60,
    )
    response.raise_for_status()
    payload = response.json()
    if not isinstance(payload, dict):
        raise RuntimeError(f"Unexpected Stripe response for {path}")
    return payload


def list_all(api_key: str, path: str, params: dict[str, str]) -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    cursor: str | None = None
    while True:
        query = dict(params)
        if cursor:
            query["starting_after"] = cursor
        page = request_get(api_key, path, query)
        data = page.get("data")
        if not isinstance(data, list):
            raise RuntimeError(f"Stripe pagination shape invalid for {path}")
        records.extend(item for item in data if isinstance(item, dict))
        if not page.get("has_more"):
            return records
        if not data or not isinstance(data[-1].get("id"), str):
            raise RuntimeError(f"Stripe pagination cursor invalid for {path}")
        cursor = data[-1]["id"]


def price_product_id(price: dict[str, Any]) -> str:
    product = price.get("product")
    if isinstance(product, str):
        return product
    if isinstance(product, dict):
        return text(product.get("id"))
    return ""


def declared_variant(price: dict[str, Any]) -> bool:
    metadata = price.get("metadata") or {}
    if not isinstance(metadata, dict):
        return False
    if text(metadata.get("variant_key")) or text(metadata.get("variant_label_zh")):
        return True
    try:
        return int(text(metadata.get("pack_count")) or "0") > 0
    except ValueError:
        return False


def storefront_price_ids(product: dict[str, Any], prices: list[dict[str, Any]]) -> set[str]:
    metadata = product.get("metadata") or {}
    variant_mode = text(metadata.get("variant_mode")) if isinstance(metadata, dict) else ""
    if variant_mode in {"pack_size", "option", "choice"}:
        return {text(price.get("id")) for price in prices if declared_variant(price)}
    default_price = text(product.get("default_price"))
    return {default_price} if default_price and any(text(price.get("id")) == default_price for price in prices) else set()


def expected_cents(cost_cny: str) -> int:
    cost = Decimal(cost_cny)
    raw = cost * FX * MULTIPLIER
    hkd = (raw - TAIL).to_integral_value(rounding=ROUND_CEILING) + TAIL
    return int(hkd * Decimal("100"))


def current_cost_matches_live(preview_record: dict[str, Any], price: dict[str, Any], product: dict[str, Any], active_price_count: int) -> bool:
    source = text(preview_record.get("cost_source"))
    try:
        expected = Decimal(text(preview_record.get("cost_cny")))
    except Exception:
        return False

    def same_decimal(value: Any) -> bool:
        try:
            return Decimal(text(value)) == expected
        except Exception:
            return False

    if source.startswith("live_price_metadata:"):
        field = source.split(":", 1)[1]
        return same_decimal((price.get("metadata") or {}).get(field))
    if source.startswith("live_product_metadata_single_price_only:"):
        field = source.split(":", 1)[1]
        return active_price_count == 1 and same_decimal((product.get("metadata") or {}).get(field))
    if source.startswith("prior_reviewed_preview_exact_price_match:"):
        return True
    return False


def manifest_digest(manifest: dict[str, Any]) -> str:
    copy = dict(manifest)
    copy.pop("integrity_sha256", None)
    return hashlib.sha256(
        json.dumps(copy, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")
    ).hexdigest()


def main() -> None:
    api_key = os.environ.get("STRIPE_SECRET_KEY")
    if not api_key:
        raise SystemExit("STRIPE_SECRET_KEY is required")
    preview = json.loads(PREVIEW.read_text(encoding="utf-8"))
    policy = preview.get("pricing_policy") if isinstance(preview.get("pricing_policy"), dict) else {}
    if policy.get("formula") != "retail_hkd = ceil_to_.90(cost_cny × 1.166 × 1.76)":
        raise RuntimeError("Preview policy is not the owner-approved 1.166 × 1.76 rule")
    source_records = preview.get("records")
    if not isinstance(source_records, list):
        raise RuntimeError("Preview record list is unavailable")
    approved = [
        record for record in source_records
        if isinstance(record, dict) and record.get("pricing_status") == "recalculable_preview_only"
    ]
    if len(approved) != 138:
        raise RuntimeError(f"Expected 138 approved changing Prices, found {len(approved)}")

    products = list_all(api_key, "products", {"active": "true", "limit": "100"})
    products_by_id = {text(product.get("id")): product for product in products if text(product.get("id"))}
    all_hkd_prices = list_all(api_key, "prices", {"active": "true", "currency": "hkd", "limit": "100"})
    prices_by_product: dict[str, list[dict[str, Any]]] = defaultdict(list)
    prices_by_id: dict[str, dict[str, Any]] = {}
    for price in all_hkd_prices:
        product_id = price_product_id(price)
        if product_id in products_by_id:
            prices_by_product[product_id].append(price)
            prices_by_id[text(price.get("id"))] = price

    errors: list[str] = []
    records: list[dict[str, Any]] = []
    for preview_record in approved:
        price_id = text(preview_record.get("price_id"))
        product_id = text(preview_record.get("product_id"))
        live_price = prices_by_id.get(price_id)
        product = products_by_id.get(product_id)
        if not live_price or not product:
            errors.append(f"missing_or_inactive_source:{price_id}")
            continue
        if price_product_id(live_price) != product_id:
            errors.append(f"product_mismatch:{price_id}")
            continue
        if live_price.get("currency") != "hkd" or live_price.get("type") != "one_time" or not live_price.get("active"):
            errors.append(f"invalid_source_price_type_or_status:{price_id}")
            continue
        old_cents = live_price.get("unit_amount")
        if not isinstance(old_cents, int) or old_cents <= 0 or old_cents != preview_record.get("current_cents"):
            errors.append(f"source_amount_changed:{price_id}")
            continue
        if price_id not in storefront_price_ids(product, prices_by_product[product_id]):
            errors.append(f"not_currently_storefront_sellable:{price_id}")
            continue
        if text(live_price.get("lookup_key")):
            errors.append(f"lookup_key_requires_manual_handling:{price_id}")
            continue
        if live_price.get("billing_scheme") not in {None, "per_unit"}:
            errors.append(f"unsupported_billing_scheme:{price_id}")
            continue
        if not current_cost_matches_live(preview_record, live_price, product, len(prices_by_product[product_id])):
            errors.append(f"cost_source_changed_or_unverifiable:{price_id}")
            continue
        expected_new_cents = expected_cents(text(preview_record.get("cost_cny")))
        if expected_new_cents != preview_record.get("proposed_cents") or expected_new_cents == old_cents:
            errors.append(f"formula_or_change_mismatch:{price_id}")
            continue
        source_metadata = dict(live_price.get("metadata") or {})
        replacement_metadata = dict(source_metadata)
        replacement_metadata.setdefault("cost_cny", text(preview_record.get("cost_cny")))
        if len(replacement_metadata) > 50:
            errors.append(f"replacement_metadata_capacity:{price_id}")
            continue
        records.append({
            "product_id": product_id,
            "product_name": text(product.get("name")),
            "mofu_sku": text((product.get("metadata") or {}).get("mofu_sku")),
            "price_id": price_id,
            "old_cents": old_cents,
            "new_cents": expected_new_cents,
            "cost_cny": text(preview_record.get("cost_cny")),
            "cost_source": text(preview_record.get("cost_source")),
            "was_default_price": text(product.get("default_price")) == price_id,
            "source_price_metadata": source_metadata,
            "replacement_price_metadata": replacement_metadata,
            "source_price_nickname": text(live_price.get("nickname")),
            "source_price_tax_behavior": text(live_price.get("tax_behavior")),
        })

    if errors:
        raise RuntimeError("Preflight blocked; no Stripe writes performed: " + "; ".join(errors))
    if len(records) != 138:
        raise RuntimeError(f"Preflight record count mismatch: {len(records)}")

    manifest = {
        "mode": "EXPLICIT_OWNER_APPROVAL_RECEIVED_READY_FOR_APPLY",
        "approval_evidence": "Owner explicitly approved updating the 138 changing Price records after reviewing the 1.166 preview in this conversation.",
        "no_stripe_writes_performed": True,
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "source_preview": str(PREVIEW),
        "policy": {
            "formula": "retail_hkd = ceil_to_.90(cost_cny × 1.166 × 1.76)",
            "cny_to_hkd": "1.166",
            "retail_multiplier": "1.76",
            "rounding": "upward .90",
        },
        "scope": "Only the 138 currently active, storefront-sellable, one-time HKD Price records with trusted positive CNY cost and a formula-driven change. No Product metadata policy changes are included, so Product metadata capacity cannot block approved Price changes.",
        "excluded": {
            "missing_cny_cost_price_count": 105,
            "formula_matches_current_price_count": 12,
            "orphaned_active_hkd_price_count": 144,
        },
        "record_count": len(records),
        "default_price_switch_count": sum(bool(record["was_default_price"]) for record in records),
        "records": records,
        "rollback_plan": "The paired apply result contains every source/replacement pair. A recovery run must re-activate the source Price, restore Product.default_price where it was switched, and deactivate the replacement Price after reviewing the desired rollback scope.",
    }
    manifest["integrity_sha256"] = manifest_digest(manifest)
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "no_stripe_writes_performed": True,
        "approved_record_count": len(records),
        "default_price_switch_count": manifest["default_price_switch_count"],
        "manifest": str(MANIFEST),
        "integrity_sha256": manifest["integrity_sha256"],
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
