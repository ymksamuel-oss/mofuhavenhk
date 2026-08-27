#!/usr/bin/env python3
"""Read-only catalog-wide CNY→HKD multiplier repricing preview.

This tool never creates, updates, deactivates, or otherwise writes Stripe objects.
It classifies every active HKD Price (including non-storefront residual prices),
calculates only when a trusted CNY cost is available, and creates a non-executable
approval manifest for currently storefront-sellable prices that would change.
"""
from __future__ import annotations

import csv
import hashlib
import json
import os
from collections import Counter, defaultdict
from datetime import datetime, timezone
from decimal import Decimal
from pathlib import Path
from typing import Any

import requests

from cny_hkd_multiplier_pricing_policy import (
    CNY_TO_HKD,
    POLICY_VERSION,
    RETAIL_MULTIPLIER,
    ROUNDING_RULE,
    decimal_cost,
    policy_metadata,
    retail_cents_from_cny_cost,
    retail_hkd_from_cny_cost,
    unrounded_retail_hkd,
)

ROOT = Path(__file__).resolve().parents[1]
REPORT_DIR = ROOT / "reports"
LOCAL_COST_RECOVERY = REPORT_DIR / "cny_pricing_metadata_sync_preview_29_2026-08-27.json"
PREVIEW_JSON = REPORT_DIR / "catalog_cny_hkd_multiplier_repricing_preview_2026-08-27.json"
PREVIEW_CSV = REPORT_DIR / "catalog_cny_hkd_multiplier_repricing_preview_2026-08-27.csv"
PENDING_MANIFEST = REPORT_DIR / "catalog_cny_hkd_multiplier_pending_approval_manifest_2026-08-27.json"
DOMESTIC_STRIPE_PERCENT = Decimal("0.034")
DOMESTIC_STRIPE_FIXED_HKD = Decimal("2.35")


def text(value: Any) -> str:
    return str(value).strip() if value is not None else ""


def api_get(api_key: str, path: str, params: dict[str, str]) -> dict[str, Any]:
    response = requests.get(f"https://api.stripe.com/v1/{path}", params=params, auth=(api_key, ""), timeout=60)
    response.raise_for_status()
    return response.json()


def list_all(api_key: str, path: str, params: dict[str, str]) -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    cursor: str | None = None
    while True:
        page_params = dict(params)
        if cursor:
            page_params["starting_after"] = cursor
        page = api_get(api_key, path, page_params)
        records.extend(page["data"])
        if not page.get("has_more"):
            return records
        cursor = page["data"][-1]["id"]
        if not cursor:
            raise RuntimeError(f"Incomplete Stripe pagination for {path}")


def product_id_for_price(price: dict[str, Any]) -> str:
    product = price.get("product")
    return product if isinstance(product, str) else text((product or {}).get("id"))


def is_declared_variant(price: dict[str, Any]) -> bool:
    metadata = price.get("metadata") or {}
    if metadata.get("variant_key") or metadata.get("variant_label_zh"):
        return True
    try:
        return int(metadata.get("pack_count") or 0) > 0
    except (ValueError, TypeError):
        return False


def storefront_price_ids(product: dict[str, Any], prices: list[dict[str, Any]]) -> tuple[set[str], str | None]:
    metadata = product.get("metadata") or {}
    variant_mode = text(metadata.get("variant_mode"))
    if variant_mode in {"pack_size", "option", "choice"}:
        selected = {price["id"] for price in prices if is_declared_variant(price)}
        return selected, None if selected else "variant_mode_without_declared_active_price"
    default_id = text(product.get("default_price"))
    if default_id and any(price["id"] == default_id for price in prices):
        return {default_id}, None
    return set(), "active_default_price_missing"


def local_recovered_costs() -> dict[str, dict[str, str]]:
    """Read the prior zero-write SKU-matched local cost recovery record."""
    payload = json.loads(LOCAL_COST_RECOVERY.read_text(encoding="utf-8"))
    recovered: dict[str, dict[str, str]] = {}
    for record in payload["records"]:
        for price in record.get("active_hkd_price_preview", []):
            price_id = price["price_id"]
            if price_id in recovered:
                raise RuntimeError(f"Duplicate recovered local cost for Price {price_id}")
            recovered[price_id] = {
                "cost_cny": text(record["cost_cny"]),
                "source_file": text(record["source_file"]),
                "supplier_sku": text(record["supplier_sku"]),
            }
    if len(recovered) != 29:
        raise RuntimeError(f"Expected 29 recovered local-cost Price records, found {len(recovered)}")
    return recovered


def trusted_cost(price: dict[str, Any], product: dict[str, Any], recovered: dict[str, dict[str, str]]) -> tuple[str, str, str]:
    price_md = price.get("metadata") or {}
    product_md = product.get("metadata") or {}
    for field in ("cost_cny", "cny_cost"):
        value = text(price_md.get(field))
        if value:
            return value, f"stripe_price_metadata.{field}", ""
    for field in ("cost_cny", "cny_cost"):
        value = text(product_md.get(field))
        if value:
            return value, f"stripe_product_metadata.{field}", ""
    local = recovered.get(price["id"])
    if local:
        return local["cost_cny"], "locally_recovered_supplier_sku", local["source_file"]
    return "", "", ""


def category(product: dict[str, Any]) -> str:
    metadata = product.get("metadata") or {}
    return text(metadata.get("category") or metadata.get("category_slug") or metadata.get("category_code") or metadata.get("主分類代碼")) or "未分類"


def product_metadata_capacity_after_price_replacement(price: dict[str, Any], cost_source: str) -> tuple[int, int]:
    """Preview only: each replacement copies its old Price metadata and adds cost if absent."""
    current = price.get("metadata") or {}
    added_cost = bool(cost_source == "locally_recovered_supplier_sku" and not text(current.get("cost_cny")))
    before = len(current)
    return before, before + int(added_cost)


def proposed_product_policy_metadata(current: dict[str, str]) -> tuple[dict[str, str], dict[str, dict[str, str]], int]:
    """Return metadata additions, replacements, and resulting key count for the canonical policy."""
    additions: dict[str, str] = {}
    replacements: dict[str, dict[str, str]] = {}
    for key, value in policy_metadata().items():
        existing = text(current.get(key))
        if not existing:
            additions[key] = value
        elif existing != value:
            replacements[key] = {"current": existing, "proposed": value}
    return additions, replacements, len(current) + len(additions)


def quant(value: Decimal) -> str:
    return f"{value:.4f}"


def main() -> None:
    api_key = os.environ.get("STRIPE_SECRET_KEY")
    if not api_key:
        raise SystemExit("STRIPE_SECRET_KEY is required")
    recovered = local_recovered_costs()
    products = list_all(api_key, "products", {"active": "true", "limit": "100"})
    active_hkd_prices = list_all(api_key, "prices", {"active": "true", "currency": "hkd", "limit": "100"})
    product_by_id = {product["id"]: product for product in products}
    prices_by_product: dict[str, list[dict[str, Any]]] = defaultdict(list)
    orphaned_active_hkd_prices: list[dict[str, str]] = []
    for price in active_hkd_prices:
        product_id = product_id_for_price(price)
        if product_id not in product_by_id:
            orphaned_active_hkd_prices.append({
                "price_id": price["id"],
                "product_id": product_id,
                "reason": "price_points_to_missing_or_inactive_product",
            })
            continue
        prices_by_product[product_id].append(price)

    rows: list[dict[str, Any]] = []
    errors: list[str] = []
    for product in sorted(products, key=lambda item: item["id"]):
        product_md = product.get("metadata") or {}
        product_policy_additions, product_policy_replacements, product_policy_key_count_after = proposed_product_policy_metadata(product_md)
        product_policy_capacity_blocked = product_policy_key_count_after > 50
        product_prices = sorted(prices_by_product.get(product["id"], []), key=lambda item: item["id"])
        selected_ids, selection_issue = storefront_price_ids(product, product_prices)
        if not product_prices:
            errors.append(f"Active Product without active HKD Price: {product['id']}")
            continue
        for price in product_prices:
            price_md = price.get("metadata") or {}
            current_cents = price.get("unit_amount")
            if not isinstance(current_cents, int) or current_cents <= 0:
                errors.append(f"Invalid active HKD Price amount: {price['id']}")
                continue
            cost_raw, cost_source, local_source_file = trusted_cost(price, product, recovered)
            is_storefront_sellable = price["id"] in selected_ids
            row: dict[str, Any] = {
                "product_id": product["id"],
                "price_id": price["id"],
                "mofu_sku": text(product_md.get("mofu_sku")),
                "supplier_sku": text(product_md.get("sku")),
                "product_name": text(product.get("name")),
                "brand": text(product_md.get("brand")) or "未標示品牌",
                "category": category(product),
                "variant_mode": text(product_md.get("variant_mode")) or "single",
                "variant_key": text(price_md.get("variant_key")),
                "variant_label_zh": text(price_md.get("variant_label_zh")) or "單一規格",
                "is_default_price": product.get("default_price") == price["id"],
                "is_storefront_sellable_price": is_storefront_sellable,
                "storefront_selection_issue": selection_issue or "",
                "current_hkd": f"{Decimal(current_cents) / Decimal('100'):.2f}",
                "current_cents": current_cents,
                "cost_cny": "",
                "cost_source": cost_source,
                "local_cost_source_file": local_source_file,
                "cost_hkd_at_fixed_fx": "",
                "unrounded_proposed_hkd": "",
                "proposed_hkd": "",
                "proposed_cents": "",
                "price_change_hkd": "",
                "price_change_percent": "",
                "estimated_domestic_stripe_fee_hkd": "",
                "estimated_net_margin_after_domestic_stripe_fee": "",
                "replacement_price_metadata_key_count_before": "",
                "replacement_price_metadata_key_count_after": "",
                "product_policy_metadata_key_count_before": len(product_md),
                "product_policy_metadata_key_count_after": product_policy_key_count_after,
                "proposed_product_policy_metadata_additions": product_policy_additions,
                "proposed_product_policy_metadata_replacements": product_policy_replacements,
                "product_policy_metadata_capacity_blocked": product_policy_capacity_blocked,
                "pricing_status": "",
                "approval_manifest_scope": False,
            }
            try:
                cost = decimal_cost(cost_raw)
            except ValueError:
                row["pricing_status"] = (
                    "awaiting_cny_cost_for_storefront_price"
                    if is_storefront_sellable
                    else "not_storefront_sellable_and_no_trusted_cny_cost"
                )
                rows.append(row)
                continue
            raw = unrounded_retail_hkd(cost)
            proposed = retail_hkd_from_cny_cost(cost)
            proposed_cents = retail_cents_from_cny_cost(cost)
            current_hkd = Decimal(current_cents) / Decimal("100")
            change = proposed - current_hkd
            stripe_fee = proposed * DOMESTIC_STRIPE_PERCENT + DOMESTIC_STRIPE_FIXED_HKD
            net_margin = Decimal("1") - ((cost * CNY_TO_HKD) + stripe_fee) / proposed
            metadata_before, metadata_after = product_metadata_capacity_after_price_replacement(price, cost_source)
            row.update({
                "cost_cny": quant(cost),
                "cost_hkd_at_fixed_fx": quant(cost * CNY_TO_HKD),
                "unrounded_proposed_hkd": quant(raw),
                "proposed_hkd": f"{proposed:.2f}",
                "proposed_cents": proposed_cents,
                "price_change_hkd": f"{change:.2f}",
                "price_change_percent": quant(change / current_hkd * Decimal("100")),
                "estimated_domestic_stripe_fee_hkd": quant(stripe_fee),
                "estimated_net_margin_after_domestic_stripe_fee": quant(net_margin),
                "replacement_price_metadata_key_count_before": metadata_before,
                "replacement_price_metadata_key_count_after": metadata_after,
            })
            if metadata_after > 50:
                row["pricing_status"] = "blocked_replacement_price_metadata_capacity"
            elif product_policy_capacity_blocked:
                row["pricing_status"] = "blocked_product_policy_metadata_capacity"
            elif not is_storefront_sellable:
                row["pricing_status"] = "calculated_but_not_storefront_sellable_active_price"
            elif proposed_cents == current_cents:
                row["pricing_status"] = "formula_matches_current_price_no_replacement"
            else:
                row["pricing_status"] = "would_replace_after_explicit_approval"
                row["approval_manifest_scope"] = True
            rows.append(row)

    if errors:
        raise RuntimeError("; ".join(errors))
    if len(products) != 226:
        raise RuntimeError(f"Expected 226 active Products, found {len(products)}")
    if len(rows) + len(orphaned_active_hkd_prices) != len(active_hkd_prices):
        raise RuntimeError(f"Active HKD Price reconciliation failed: API={len(active_hkd_prices)}, catalog={len(rows)}, orphaned={len(orphaned_active_hkd_prices)}")
    if len({row["price_id"] for row in rows}) != len(rows):
        raise RuntimeError("Duplicate active Price ID in preview")
    if len({row["product_id"] for row in rows}) != 226:
        raise RuntimeError("Preview does not include every active Product")

    rows.sort(key=lambda row: (row["mofu_sku"], row["price_id"]))
    candidates = [row for row in rows if row["approval_manifest_scope"]]
    computed_storefront_by_product: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in rows:
        if row["cost_cny"] and row["is_storefront_sellable_price"]:
            computed_storefront_by_product[row["product_id"]].append(row)
    product_policy_operations: list[dict[str, Any]] = []
    blocked_product_policy_operations: list[dict[str, Any]] = []
    for product_id, product_rows in sorted(computed_storefront_by_product.items()):
        exemplar = product_rows[0]
        operation = {
            "product_id": product_id,
            "mofu_sku": exemplar["mofu_sku"],
            "product_name": exemplar["product_name"],
            "source_product_metadata": product_by_id[product_id].get("metadata") or {},
            "metadata_key_count_before": exemplar["product_policy_metadata_key_count_before"],
            "metadata_key_count_after": exemplar["product_policy_metadata_key_count_after"],
            "metadata_additions": exemplar["proposed_product_policy_metadata_additions"],
            "metadata_replacements": exemplar["proposed_product_policy_metadata_replacements"],
            "proposed_policy_metadata": policy_metadata(),
            "storefront_price_ids_with_trusted_cost": [row["price_id"] for row in product_rows],
        }
        if exemplar["product_policy_metadata_capacity_blocked"]:
            blocked_product_policy_operations.append(operation)
        elif operation["metadata_additions"] or operation["metadata_replacements"]:
            product_policy_operations.append(operation)
    manifest_records = []
    for row in candidates:
        price = next(item for item in active_hkd_prices if item["id"] == row["price_id"])
        source_metadata = price.get("metadata") or {}
        replacement_metadata = dict(source_metadata)
        if not text(replacement_metadata.get("cost_cny")):
            replacement_metadata["cost_cny"] = row["cost_cny"]
        manifest_records.append({
            "product_id": row["product_id"],
            "price_id": row["price_id"],
            "old_cents": row["current_cents"],
            "new_cents": row["proposed_cents"],
            "was_default_price": row["is_default_price"],
            "is_storefront_sellable_price": True,
            "mofu_sku": row["mofu_sku"],
            "product_name": row["product_name"],
            "variant_label_zh": row["variant_label_zh"],
            "cost_cny": row["cost_cny"],
            "cost_source": row["cost_source"],
            "source_price_metadata": source_metadata,
            "replacement_price_metadata": replacement_metadata,
        })
    manifest = {
        "mode": "PENDING_EXPLICIT_OWNER_APPROVAL_ONLY",
        "approval_required": True,
        "no_stripe_writes_performed": True,
        "policy": {
            "version": POLICY_VERSION,
            "formula": "retail_hkd = ceil_to_.90(cost_cny × 1.1654 × 1.76)",
            **policy_metadata(),
        },
        "scope": "Only active HKD Prices that are currently storefront-sellable, have a trusted positive CNY cost, change under the fixed multiplier formula, and whose Product policy metadata remains within capacity.",
        "product_policy_metadata_operations": product_policy_operations,
        "blocked_product_policy_metadata_operations": blocked_product_policy_operations,
        "excluded_from_apply": {
            "prices_without_trusted_cny_cost": sum(not row["cost_cny"] for row in rows),
            "calculated_but_not_storefront_sellable_active_prices": sum(row["pricing_status"] == "calculated_but_not_storefront_sellable_active_price" for row in rows),
            "formula_matches_current_price": sum(row["pricing_status"] == "formula_matches_current_price_no_replacement" for row in rows),
            "replacement_price_metadata_capacity_blocked": sum(row["pricing_status"] == "blocked_replacement_price_metadata_capacity" for row in rows),
            "product_policy_metadata_capacity_blocked": len(blocked_product_policy_operations),
        },
        "record_count": len(manifest_records),
        "product_policy_metadata_operation_count": len(product_policy_operations),
        "records": manifest_records,
        "rollback_plan": "A future apply must retain this manifest, create replacement Prices with cloned metadata, switch Product.default_price where applicable, deactivate source Prices, and write the resulting replacement IDs to a separate reversible apply manifest. No apply path exists in this preview file.",
    }
    digest_source = json.dumps(manifest, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")
    manifest["integrity_sha256"] = hashlib.sha256(digest_source).hexdigest()

    cost_sources = Counter(row["cost_source"] or "no_trusted_cny_cost" for row in rows)
    statuses = Counter(row["pricing_status"] for row in rows)
    computed_rows = [row for row in rows if row["cost_cny"]]
    payload = {
        "mode": "read_only_full_catalog_preview",
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "no_stripe_writes_performed": True,
        "rate_mode": "fixed_user_specified_rate_not_live_fx_polling",
        "pricing_policy": {
            "version": POLICY_VERSION,
            "formula": "retail_hkd = ceil_to_.90(cost_cny × 1.1654 × 1.76)",
            "cny_to_hkd": f"{CNY_TO_HKD:.4f}",
            "retail_multiplier": f"{RETAIL_MULTIPLIER:.2f}",
            "rounding": ROUNDING_RULE,
            "stripe_fee_note": "The 1.76 multiplier is applied exactly as owner-specified. The 3.4% + HK$2.35 domestic-card fee is shown only as a post-price estimate and is not added again to avoid double-counting.",
        },
        "scope": "226 active Stripe Products and every active HKD Price, including currently non-storefront-sellable residual active Prices for audit visibility.",
        "summary": {
            "active_product_count": len(products),
            "active_hkd_price_count_global": len(active_hkd_prices),
            "active_hkd_price_count_attached_to_active_products": len(rows),
            "orphaned_active_hkd_price_count": len(orphaned_active_hkd_prices),
            "orphaned_active_hkd_prices": orphaned_active_hkd_prices,
            "computed_price_count": len(computed_rows),
            "computed_product_count": len({row["product_id"] for row in computed_rows}),
            "awaiting_trusted_cny_cost_price_count": sum(not row["cost_cny"] for row in rows),
            "awaiting_trusted_cny_cost_product_count": len({row["product_id"] for row in rows if not row["cost_cny"]}),
            "storefront_sellable_price_count": sum(row["is_storefront_sellable_price"] for row in rows),
            "approval_manifest_price_replacement_count": len(candidates),
            "pending_product_policy_metadata_operation_count": len(product_policy_operations),
            "blocked_product_policy_metadata_operation_count": len(blocked_product_policy_operations),
            "price_status_counts": dict(sorted(statuses.items())),
            "cost_source_counts": dict(sorted(cost_sources.items())),
            "current_to_proposed_increase_count": sum(Decimal(row["price_change_hkd"]) > 0 for row in candidates),
            "current_to_proposed_decrease_count": sum(Decimal(row["price_change_hkd"]) < 0 for row in candidates),
            "current_to_proposed_unchanged_count": sum(row["pricing_status"] == "formula_matches_current_price_no_replacement" for row in rows),
        },
        "records": rows,
        "orphaned_active_hkd_prices": orphaned_active_hkd_prices,
        "pending_approval_manifest": str(PENDING_MANIFEST),
    }
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    PREVIEW_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    with PREVIEW_CSV.open("w", encoding="utf-8-sig", newline="") as handle:
        fieldnames = list(rows[0])
        writer = csv.DictWriter(handle, fieldnames=fieldnames, lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)
    PENDING_MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({**payload["summary"], "preview_json": str(PREVIEW_JSON), "preview_csv": str(PREVIEW_CSV), "pending_manifest": str(PENDING_MANIFEST)}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
