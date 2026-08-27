#!/usr/bin/env python3
"""Build a zero-write metadata sync preview for the 29 locally cost-verified products.

Only GET requests are issued to Stripe. The preview maps source_cost_cny to each
active HKD Price and maps FX/margin/freight/rounding to the Stripe Product.
"""
from __future__ import annotations

import csv
import json
import os
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import requests

ROOT = Path(__file__).resolve().parents[1]
REPORT_DIR = ROOT / "reports"
JSON_OUT = REPORT_DIR / "cny_pricing_metadata_sync_preview_29_2026-08-27.json"
CSV_OUT = REPORT_DIR / "cny_pricing_metadata_sync_preview_29_2026-08-27.csv"
SOURCE_FILES = ("batch24_product_mapping.json", "combo_dogfood_5_import_mapping.json")
REQUIRED_PRODUCT_METADATA = (
    "pricing_target_product_gross_margin",
    "pricing_cny_to_hkd",
    "pricing_ship_to_hk_hkd",
    "pricing_rounding",
)
PRICE_COST_FIELD = "cost_cny"


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
    raw = price.get("product")
    return raw if isinstance(raw, str) else text((raw or {}).get("id"))


def mapped_source_products() -> list[dict[str, Any]]:
    source_products: list[dict[str, Any]] = []
    for filename in SOURCE_FILES:
        payload = json.loads((ROOT / filename).read_text(encoding="utf-8"))
        if filename == "batch24_product_mapping.json":
            policy = payload["pricing_policy"]
            margin = text(policy["target_product_gross_margin"])
            fx = text(policy["exchange_rate_cny_hkd"])
            freight = text(policy["inbound_freight_hkd"])
            rounding_source = text(policy["retail_rounding_rule"])
        elif filename == "combo_dogfood_5_import_mapping.json":
            policy = payload["source_cost_policy"]
            margin = "0.45" if "45%" in text(policy["retail_pricing_note"]) else ""
            fx = text(policy["exchange_rate_cny_hkd"])
            freight = text(policy["freight_hkd"])
            rounding_source = text(policy["retail_pricing_note"])
        else:
            raise RuntimeError(f"Unsupported source file: {filename}")
        if margin != "0.45" or fx != "1.1654" or freight not in {"0", "0.0", "0.00"} or ".90" not in rounding_source:
            raise RuntimeError(f"Unexpected pricing policy in {filename}")
        for item in payload["products"]:
            source_cost = text(item.get("source_cost_cny"))
            sku = text(item.get("sku"))
            if not sku or not source_cost:
                raise RuntimeError(f"Missing supplier SKU or source CNY cost in {filename}: {item}")
            source_products.append({
                "source_file": filename,
                "supplier_sku": sku,
                "source_import_key": text(item.get("import_key")),
                "product_name_source": text(item.get("name_zh")),
                "cost_cny": source_cost,
                "target_margin": margin,
                "fx_cny_to_hkd": fx,
                "ship_to_hk_hkd": "0.00",
                "rounding": "upward .90",
                "source_cost_status": text(item.get("cost_status")),
                "source_pricing_basis": text(item.get("pricing_basis")),
            })
    duplicate_skus = [sku for sku, count in Counter(item["supplier_sku"] for item in source_products).items() if count > 1]
    if duplicate_skus:
        raise RuntimeError(f"Duplicate supplier SKUs in selected source data: {duplicate_skus}")
    if len(source_products) != 29:
        raise RuntimeError(f"Expected 29 source products, found {len(source_products)}")
    return source_products


def planned_metadata(current: dict[str, str], required: dict[str, str]) -> tuple[dict[str, str], dict[str, dict[str, str]]]:
    additions: dict[str, str] = {}
    conflicts: dict[str, dict[str, str]] = {}
    for key, expected in required.items():
        existing = text(current.get(key))
        if not existing:
            additions[key] = expected
        elif existing != expected:
            conflicts[key] = {"current": existing, "expected": expected}
    return additions, conflicts


def main() -> None:
    api_key = os.environ.get("STRIPE_SECRET_KEY")
    if not api_key:
        raise SystemExit("STRIPE_SECRET_KEY is required")
    sources = mapped_source_products()
    products = list_all(api_key, "products", {"active": "true", "limit": "100"})
    hkd_prices = list_all(api_key, "prices", {"active": "true", "currency": "hkd", "limit": "100"})
    product_by_supplier_sku: dict[str, dict[str, Any]] = {}
    for product in products:
        sku = text((product.get("metadata") or {}).get("sku"))
        if sku:
            if sku in product_by_supplier_sku:
                raise RuntimeError(f"Duplicate active Stripe Product supplier SKU: {sku}")
            product_by_supplier_sku[sku] = product
    prices_by_product: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for price in hkd_prices:
        product_id = product_id_for_price(price)
        if product_id:
            prices_by_product[product_id].append(price)

    records: list[dict[str, Any]] = []
    for source in sorted(sources, key=lambda item: item["supplier_sku"]):
        product = product_by_supplier_sku.get(source["supplier_sku"])
        if not product:
            records.append({**source, "status": "blocked_product_not_found_by_supplier_sku"})
            continue
        product_md: dict[str, str] = product.get("metadata") or {}
        active_prices = sorted(prices_by_product.get(product["id"], []), key=lambda price: price["id"])
        required_product = {
            "pricing_target_product_gross_margin": source["target_margin"],
            "pricing_cny_to_hkd": source["fx_cny_to_hkd"],
            "pricing_ship_to_hk_hkd": source["ship_to_hk_hkd"],
            "pricing_rounding": source["rounding"],
        }
        product_additions, product_conflicts = planned_metadata(product_md, required_product)
        product_key_count = len(product_md)
        product_capacity_after = product_key_count + len(product_additions)
        price_records: list[dict[str, Any]] = []
        price_blocked = False
        for price in active_prices:
            price_md: dict[str, str] = price.get("metadata") or {}
            price_additions, price_conflicts = planned_metadata(price_md, {PRICE_COST_FIELD: source["cost_cny"]})
            price_key_count = len(price_md)
            price_capacity_after = price_key_count + len(price_additions)
            blocked = price_capacity_after > 50 or bool(price_conflicts)
            price_blocked = price_blocked or blocked
            price_records.append({
                "price_id": price["id"],
                "is_default_price": str(product.get("default_price") == price["id"]).lower(),
                "current_hkd": f"{(price.get('unit_amount') or 0) / 100:.2f}",
                "variant_key": text(price_md.get("variant_key")),
                "variant_label_zh": text(price_md.get("variant_label_zh")),
                "metadata_key_count_before": price_key_count,
                "metadata_key_count_after_preview": price_capacity_after,
                "proposed_metadata_additions": price_additions,
                "metadata_conflicts": price_conflicts,
                "sync_status": "blocked" if blocked else "ready",
            })
        blocking_reasons: list[str] = []
        if not active_prices:
            blocking_reasons.append("no_active_hkd_price")
        if product_capacity_after > 50:
            blocking_reasons.append("product_metadata_capacity_exceeded")
        if product_conflicts:
            blocking_reasons.append("product_metadata_conflict")
        if price_blocked:
            blocking_reasons.append("active_price_metadata_capacity_or_conflict")
        status = "ready_for_future_apply" if not blocking_reasons else "blocked"
        records.append({
            **source,
            "status": status,
            "blocking_reasons": blocking_reasons,
            "product_id": product["id"],
            "mofu_sku": text(product_md.get("mofu_sku")),
            "product_name_stripe": text(product.get("name")),
            "product_metadata_key_count_before": product_key_count,
            "product_metadata_key_count_after_preview": product_capacity_after,
            "proposed_product_metadata_additions": product_additions,
            "product_metadata_conflicts": product_conflicts,
            "active_hkd_price_preview": price_records,
        })

    found = [record for record in records if record.get("status") != "blocked_product_not_found_by_supplier_sku"]
    ready = [record for record in records if record.get("status") == "ready_for_future_apply"]
    blocked = [record for record in records if record.get("status") == "blocked"]
    flat_rows: list[dict[str, str]] = []
    for record in records:
        for price in record.get("active_hkd_price_preview", []) or [{}]:
            flat_rows.append({
                "sync_status": record["status"],
                "blocking_reasons": ";".join(record.get("blocking_reasons", [])),
                "source_file": record["source_file"],
                "supplier_sku": record["supplier_sku"],
                "mofu_sku": record.get("mofu_sku", ""),
                "product_name": record.get("product_name_stripe", record["product_name_source"]),
                "product_id": record.get("product_id", ""),
                "cost_cny": record["cost_cny"],
                "target_margin": record["target_margin"],
                "fx_cny_to_hkd": record["fx_cny_to_hkd"],
                "ship_to_hk_hkd": record["ship_to_hk_hkd"],
                "rounding": record["rounding"],
                "product_metadata_before": str(record.get("product_metadata_key_count_before", "")),
                "product_metadata_after_preview": str(record.get("product_metadata_key_count_after_preview", "")),
                "proposed_product_metadata_additions": json.dumps(record.get("proposed_product_metadata_additions", {}), ensure_ascii=False, separators=(",", ":")),
                "product_metadata_conflicts": json.dumps(record.get("product_metadata_conflicts", {}), ensure_ascii=False, separators=(",", ":")),
                "price_id": price.get("price_id", ""),
                "price_current_hkd": price.get("current_hkd", ""),
                "price_variant_label_zh": price.get("variant_label_zh", ""),
                "price_metadata_before": str(price.get("metadata_key_count_before", "")),
                "price_metadata_after_preview": str(price.get("metadata_key_count_after_preview", "")),
                "proposed_price_metadata_additions": json.dumps(price.get("proposed_metadata_additions", {}), ensure_ascii=False, separators=(",", ":")),
                "price_metadata_conflicts": json.dumps(price.get("metadata_conflicts", {}), ensure_ascii=False, separators=(",", ":")),
            })

    payload = {
        "mode": "read_only_metadata_sync_preview",
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "no_stripe_writes_performed": True,
        "scope": "29 products cost-verified by supplier SKU against batch24_product_mapping.json and combo_dogfood_5_import_mapping.json only",
        "proposed_metadata_schema": {
            "price": {"cost_cny": "CNY product cost for that active HKD Price"},
            "product": {
                "pricing_target_product_gross_margin": "0.45",
                "pricing_cny_to_hkd": "1.1654",
                "pricing_ship_to_hk_hkd": "0.00",
                "pricing_rounding": "upward .90",
            },
        },
        "summary": {
            "expected_source_product_count": 29,
            "matched_active_stripe_product_count": len(found),
            "ready_for_future_apply_product_count": len(ready),
            "blocked_product_count": len(blocked),
            "blocked_reason_counts": dict(sorted(Counter(reason for record in blocked for reason in record["blocking_reasons"]).items())),
            "active_hkd_price_record_count_in_scope": sum(len(record.get("active_hkd_price_preview", [])) for record in found),
            "ready_active_hkd_price_record_count": sum(len(record.get("active_hkd_price_preview", [])) for record in ready),
            "blocked_product_metadata_capacity_count": sum("product_metadata_capacity_exceeded" in record["blocking_reasons"] for record in blocked),
            "conflict_product_count": sum(bool(record.get("product_metadata_conflicts")) for record in found),
            "conflict_active_hkd_price_count": sum(
                bool(price.get("metadata_conflicts"))
                for record in found for price in record.get("active_hkd_price_preview", [])
            ),
        },
        "records": records,
    }
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    JSON_OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    with CSV_OUT.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(flat_rows[0]) if flat_rows else [], lineterminator="\n")
        writer.writeheader()
        writer.writerows(flat_rows)
    print(json.dumps({**payload["summary"], "json_output": str(JSON_OUT), "csv_output": str(CSV_OUT)}, ensure_ascii=False, indent=2))
    if len(records) != 29 or len(found) != 29:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
