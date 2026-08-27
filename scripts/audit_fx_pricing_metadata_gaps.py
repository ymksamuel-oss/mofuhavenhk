#!/usr/bin/env python3
"""Read-only metadata-location audit for active Stripe Products and HKD Prices.

It explains why products were excluded from the CNY→HKD price preview and
checks both active and inactive HKD Price metadata for pricing information that
is not consumed by the current reader. No Stripe write requests are made.
"""
from __future__ import annotations

import csv
import json
import os
from collections import Counter, defaultdict
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation
from pathlib import Path
from typing import Any

import requests

ROOT = Path(__file__).resolve().parents[1]
REPORT_DIR = ROOT / "reports"
JSON_OUT = REPORT_DIR / "fx_pricing_metadata_gap_audit_2026-08-27.json"
CSV_OUT = REPORT_DIR / "fx_pricing_metadata_gap_audit_2026-08-27.csv"

COST_KEYS = ("cost_cny", "cny_cost")
MARGIN_KEYS = ("pricing_target_product_gross_margin", "target_product_margin")
FX_KEYS = ("pricing_cny_to_hkd", "fx_cny_to_hkd")
ROUNDING_KEYS = ("pricing_rounding",)
PRICING_TERMS = ("cost", "cny", "margin", "fx", "rate", "pricing", "retail", "price", "round", "ship")


def numeric(value: Any, *, minimum: Decimal | None = None, maximum: Decimal | None = None) -> bool:
    try:
        parsed = Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError):
        return False
    return (minimum is None or parsed >= minimum) and (maximum is None or parsed <= maximum)


def first_present(metadata: dict[str, str], keys: tuple[str, ...]) -> tuple[str, str]:
    for key in keys:
        value = str(metadata.get(key) or "").strip()
        if value:
            return key, value
    return "", ""


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
    return product if isinstance(product, str) else str((product or {}).get("id") or "")


def relevant_metadata(metadata: dict[str, str]) -> dict[str, str]:
    return {key: value for key, value in sorted(metadata.items()) if any(term in key.lower() for term in PRICING_TERMS)}


def values_with_locations(prices: list[dict[str, Any]], keys: tuple[str, ...]) -> list[dict[str, str]]:
    matches: list[dict[str, str]] = []
    for price in prices:
        key, value = first_present(price.get("metadata") or {}, keys)
        if key:
            matches.append({"price_id": price["id"], "field": f"price.metadata.{key}", "value": value})
    return matches


def json_cell(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def main() -> None:
    api_key = os.environ.get("STRIPE_SECRET_KEY")
    if not api_key:
        raise SystemExit("STRIPE_SECRET_KEY is required")

    products = list_all(api_key, "products", {"active": "true", "limit": "100"})
    active_hkd_prices = list_all(api_key, "prices", {"active": "true", "currency": "hkd", "limit": "100"})
    inactive_hkd_prices = list_all(api_key, "prices", {"active": "false", "currency": "hkd", "limit": "100"})
    prices_by_product: dict[str, list[dict[str, Any]]] = defaultdict(list)
    inactive_prices_by_product: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for price in active_hkd_prices:
        product_id = product_id_for_price(price)
        if product_id:
            prices_by_product[product_id].append(price)
    for price in inactive_hkd_prices:
        product_id = product_id_for_price(price)
        if product_id:
            inactive_prices_by_product[product_id].append(price)

    eligible_products: list[dict[str, Any]] = []
    excluded: list[dict[str, Any]] = []
    excluded_product_key_counts: Counter[str] = Counter()
    excluded_price_key_counts: Counter[str] = Counter()
    excluded_inactive_price_key_counts: Counter[str] = Counter()
    unconsumed_key_counts: Counter[str] = Counter()

    for product in products:
        product_metadata: dict[str, str] = product.get("metadata") or {}
        prices = prices_by_product.get(product["id"], [])
        inactive_prices = inactive_prices_by_product.get(product["id"], [])
        margin_key, margin_value = first_present(product_metadata, MARGIN_KEYS)
        fx_key, fx_value = first_present(product_metadata, FX_KEYS)
        rounding_key, rounding_value = first_present(product_metadata, ROUNDING_KEYS)
        product_cost_key, product_cost_value = first_present(product_metadata, COST_KEYS)
        price_cost_locations = values_with_locations(prices, COST_KEYS)
        all_price_costs_valid = bool(prices) and len(price_cost_locations) == len(prices) and all(
            numeric(item["value"], minimum=Decimal("0")) for item in price_cost_locations
        )
        product_cost_valid = numeric(product_cost_value, minimum=Decimal("0"))
        cost_complete = all_price_costs_valid or product_cost_valid
        margin_valid = numeric(margin_value, minimum=Decimal("0.0000001"), maximum=Decimal("0.9999999"))
        fx_valid = numeric(fx_value, minimum=Decimal("0.0000001"))
        rounding_valid = rounding_value == "upward .90"
        reasons: list[str] = []
        if not prices:
            reasons.append("no_active_hkd_price")
        if not cost_complete:
            reasons.append("cost_cny_not_found_in_supported_product_or_active_price_fields")
        if not margin_valid:
            reasons.append("target_margin_not_found_or_invalid_in_supported_product_metadata")
        if not fx_valid:
            reasons.append("cny_to_hkd_not_found_or_invalid_in_supported_product_metadata")
        if not rounding_valid:
            reasons.append("upward_90_rounding_not_found_or_unsupported_in_product_metadata")

        record = {
            "product_id": product["id"],
            "mofu_sku": product_metadata.get("mofu_sku") or "",
            "mofu_import_key": product_metadata.get("mofu_import_key") or "",
            "mofu_import_source": product_metadata.get("mofu_import_source") or "",
            "mofu_import_schema": product_metadata.get("mofu_import_schema") or "",
            "supplier_sku": product_metadata.get("sku") or "",
            "product_name": product.get("name") or "",
            "brand": product_metadata.get("brand") or "未標示品牌",
            "category": (
                product_metadata.get("category")
                or product_metadata.get("category_slug")
                or product_metadata.get("category_code")
                or product_metadata.get("主分類代碼")
                or "unclassified"
            ),
            "active_hkd_price_count": len(prices),
            "inactive_hkd_price_count": len(inactive_prices),
            "product_metadata_key_count": len(product_metadata),
            "active_hkd_price_metadata_key_counts": [len(price.get("metadata") or {}) for price in prices],
            "inactive_hkd_price_metadata_key_counts": [len(price.get("metadata") or {}) for price in inactive_prices],
            "supported_cost_product_field": f"product.metadata.{product_cost_key}" if product_cost_key else "",
            "supported_cost_product_value": product_cost_value,
            "supported_cost_active_price_locations": price_cost_locations,
            "supported_cost_inactive_price_locations": values_with_locations(inactive_prices, COST_KEYS),
            "supported_margin_active_price_locations": values_with_locations(prices, MARGIN_KEYS),
            "supported_margin_inactive_price_locations": values_with_locations(inactive_prices, MARGIN_KEYS),
            "supported_fx_active_price_locations": values_with_locations(prices, FX_KEYS),
            "supported_fx_inactive_price_locations": values_with_locations(inactive_prices, FX_KEYS),
            "supported_rounding_active_price_locations": values_with_locations(prices, ROUNDING_KEYS),
            "supported_rounding_inactive_price_locations": values_with_locations(inactive_prices, ROUNDING_KEYS),
            "supported_margin_product_field": f"product.metadata.{margin_key}" if margin_key else "",
            "supported_margin_product_value": margin_value,
            "supported_fx_product_field": f"product.metadata.{fx_key}" if fx_key else "",
            "supported_fx_product_value": fx_value,
            "supported_rounding_product_field": f"product.metadata.{rounding_key}" if rounding_key else "",
            "supported_rounding_product_value": rounding_value,
            "pricing_related_product_metadata": relevant_metadata(product_metadata),
            "pricing_related_active_price_metadata": [
                {"price_id": price["id"], "metadata": relevant_metadata(price.get("metadata") or {})}
                for price in prices
                if relevant_metadata(price.get("metadata") or {})
            ],
            "pricing_related_inactive_price_metadata": [
                {"price_id": price["id"], "metadata": relevant_metadata(price.get("metadata") or {})}
                for price in inactive_prices
                if relevant_metadata(price.get("metadata") or {})
            ],
            "eligible_under_current_reader": not reasons,
            "exclusion_reasons": reasons,
        }
        if not reasons:
            eligible_products.append(record)
            continue
        excluded.append(record)
        excluded_product_key_counts.update(product_metadata.keys())
        for price in prices:
            excluded_price_key_counts.update((price.get("metadata") or {}).keys())
        for price in inactive_prices:
            excluded_inactive_price_key_counts.update((price.get("metadata") or {}).keys())
        supported = set(COST_KEYS + MARGIN_KEYS + FX_KEYS + ROUNDING_KEYS)
        for key in list(record["pricing_related_product_metadata"].keys()):
            if key not in supported:
                unconsumed_key_counts[f"product.metadata.{key}"] += 1
        for item in record["pricing_related_active_price_metadata"]:
            for key in item["metadata"]:
                if key not in supported:
                    unconsumed_key_counts[f"active_price.metadata.{key}"] += 1
        for item in record["pricing_related_inactive_price_metadata"]:
            for key in item["metadata"]:
                if key not in supported:
                    unconsumed_key_counts[f"inactive_price.metadata.{key}"] += 1

    excluded.sort(key=lambda row: (row["mofu_sku"], row["product_id"]))
    flat_rows: list[dict[str, str]] = []
    for row in excluded:
        flat_rows.append({
            "mofu_sku": row["mofu_sku"],
            "product_name": row["product_name"],
            "product_id": row["product_id"],
            "mofu_import_key": row["mofu_import_key"],
            "mofu_import_source": row["mofu_import_source"],
            "mofu_import_schema": row["mofu_import_schema"],
            "supplier_sku": row["supplier_sku"],
            "brand": row["brand"],
            "category": row["category"],
            "active_hkd_price_count": str(row["active_hkd_price_count"]),
            "inactive_hkd_price_count": str(row["inactive_hkd_price_count"]),
            "product_metadata_key_count": str(row["product_metadata_key_count"]),
            "active_hkd_price_metadata_key_counts": json_cell(row["active_hkd_price_metadata_key_counts"]),
            "inactive_hkd_price_metadata_key_counts": json_cell(row["inactive_hkd_price_metadata_key_counts"]),
            "exclusion_reasons": ";".join(row["exclusion_reasons"]),
            "supported_cost_product_field": row["supported_cost_product_field"],
            "supported_cost_product_value": row["supported_cost_product_value"],
            "supported_cost_active_price_locations": json_cell(row["supported_cost_active_price_locations"]),
            "supported_cost_inactive_price_locations": json_cell(row["supported_cost_inactive_price_locations"]),
            "supported_margin_active_price_locations": json_cell(row["supported_margin_active_price_locations"]),
            "supported_margin_inactive_price_locations": json_cell(row["supported_margin_inactive_price_locations"]),
            "supported_fx_active_price_locations": json_cell(row["supported_fx_active_price_locations"]),
            "supported_fx_inactive_price_locations": json_cell(row["supported_fx_inactive_price_locations"]),
            "supported_rounding_active_price_locations": json_cell(row["supported_rounding_active_price_locations"]),
            "supported_rounding_inactive_price_locations": json_cell(row["supported_rounding_inactive_price_locations"]),
            "supported_margin_product_field": row["supported_margin_product_field"],
            "supported_margin_product_value": row["supported_margin_product_value"],
            "supported_fx_product_field": row["supported_fx_product_field"],
            "supported_fx_product_value": row["supported_fx_product_value"],
            "supported_rounding_product_field": row["supported_rounding_product_field"],
            "supported_rounding_product_value": row["supported_rounding_product_value"],
            "pricing_related_product_metadata": json_cell(row["pricing_related_product_metadata"]),
            "pricing_related_active_price_metadata": json_cell(row["pricing_related_active_price_metadata"]),
            "pricing_related_inactive_price_metadata": json_cell(row["pricing_related_inactive_price_metadata"]),
        })

    historical_cost_product_count = sum(bool(row["supported_cost_inactive_price_locations"]) for row in excluded)
    excluded_import_source_counts = Counter(row["mofu_import_source"] or "未標示匯入來源" for row in excluded)
    excluded_product_key_count_distribution = Counter(row["product_metadata_key_count"] for row in excluded)
    excluded_import_schema_counts = Counter(row["mofu_import_schema"] or "未標示匯入 schema" for row in excluded)
    historical_margin_product_count = sum(bool(row["supported_margin_inactive_price_locations"]) for row in excluded)
    historical_fx_product_count = sum(bool(row["supported_fx_inactive_price_locations"]) for row in excluded)
    historical_rounding_product_count = sum(bool(row["supported_rounding_inactive_price_locations"]) for row in excluded)
    payload = {
        "mode": "read_only_live_stripe_metadata_audit",
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "reader_contract": {
            "cost_fields": ["price.metadata.cost_cny", "price.metadata.cny_cost", "product.metadata.cost_cny", "product.metadata.cny_cost"],
            "margin_fields": ["product.metadata.pricing_target_product_gross_margin", "product.metadata.target_product_margin"],
            "fx_fields": ["product.metadata.pricing_cny_to_hkd", "product.metadata.fx_cny_to_hkd"],
            "rounding_field": "product.metadata.pricing_rounding (must equal upward .90)",
        },
        "no_stripe_writes_performed": True,
        "summary": {
            "active_product_count": len(products),
            "active_hkd_price_count": len(active_hkd_prices),
            "inactive_hkd_price_count": len(inactive_hkd_prices),
            "eligible_product_count": len(eligible_products),
            "excluded_product_count": len(excluded),
            "exclusion_reason_counts": dict(sorted(Counter(reason for row in excluded for reason in row["exclusion_reasons"]).items())),
            "historical_inactive_price_cost_found_for_excluded_product_count": historical_cost_product_count,
            "historical_inactive_price_margin_found_for_excluded_product_count": historical_margin_product_count,
            "historical_inactive_price_fx_found_for_excluded_product_count": historical_fx_product_count,
            "historical_inactive_price_rounding_found_for_excluded_product_count": historical_rounding_product_count,
            "unconsumed_pricing_looking_field_counts": dict(sorted(unconsumed_key_counts.items())),
            "excluded_product_metadata_key_counts": dict(sorted(excluded_product_key_counts.items())),
            "excluded_active_hkd_price_metadata_key_counts": dict(sorted(excluded_price_key_counts.items())),
            "excluded_inactive_hkd_price_metadata_key_counts": dict(sorted(excluded_inactive_price_key_counts.items())),
            "excluded_product_import_source_counts": dict(sorted(excluded_import_source_counts.items())),
            "excluded_product_metadata_key_count_distribution": {str(key): value for key, value in sorted(excluded_product_key_count_distribution.items())},
            "excluded_product_at_or_above_50_metadata_keys_count": sum(1 for row in excluded if row["product_metadata_key_count"] >= 50),
            "excluded_product_import_schema_counts": dict(sorted(excluded_import_schema_counts.items())),
        },
        "excluded_products": excluded,
    }
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    JSON_OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    with CSV_OUT.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(flat_rows[0]) if flat_rows else [], lineterminator="\n")
        writer.writeheader()
        writer.writerows(flat_rows)
    print(json.dumps({**payload["summary"], "json_output": str(JSON_OUT), "csv_output": str(CSV_OUT)}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
