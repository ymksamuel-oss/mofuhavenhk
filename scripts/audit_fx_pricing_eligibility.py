#!/usr/bin/env python3
"""Read-only audit of active Stripe prices for CNY→HKD repricing eligibility."""
from __future__ import annotations

import json
import os
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import requests

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "reports" / "fx_pricing_eligibility_audit_2026-08-27.json"


def get(path: str, params: dict[str, str] | None = None) -> dict[str, Any]:
    key = os.environ.get("STRIPE_SECRET_KEY")
    if not key:
        raise SystemExit("STRIPE_SECRET_KEY is required")
    response = requests.get(
        f"https://api.stripe.com/v1/{path}",
        params=params,
        auth=(key, ""),
        timeout=60,
    )
    response.raise_for_status()
    return response.json()


def numeric(value: str | None, *, positive: bool = False) -> bool:
    try:
        parsed = float(value or "")
        return parsed > 0 if positive else parsed >= 0
    except (TypeError, ValueError):
        return False


def margin_string(value: str | None) -> bool:
    try:
        return 0 < float(value or "") < 1
    except (TypeError, ValueError):
        return False


def list_paginated(path: str, params: dict[str, str]) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    cursor: str | None = None
    while True:
        page_params = dict(params)
        if cursor:
            page_params["starting_after"] = cursor
        page = get(path, page_params)
        rows.extend(page["data"])
        if not page.get("has_more"):
            return rows
        cursor = page["data"][-1]["id"]


def product_id_for_price(price: dict[str, Any]) -> str:
    raw = price.get("product")
    return raw if isinstance(raw, str) else raw.get("id", "")


def main() -> None:
    products = list_paginated("products", {"active": "true", "limit": "100"})
    prices = list_paginated("prices", {"active": "true", "currency": "hkd", "limit": "100"})
    prices_by_product: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for price in prices:
        product_id = product_id_for_price(price)
        if product_id:
            prices_by_product[product_id].append(price)

    eligible_prices: list[dict[str, Any]] = []
    eligible_product_ids: set[str] = set()
    missing_cost_prices: list[dict[str, str]] = []
    missing_margin_products: list[dict[str, str]] = []
    missing_fx_products: list[dict[str, str]] = []
    key_counts: Counter[str] = Counter()

    for product in products:
        product_metadata = product.get("metadata") or {}
        key_counts.update(product_metadata.keys())
        product_prices = prices_by_product.get(product["id"], [])
        common = {
            "product_id": product["id"],
            "name": product.get("name") or "",
            "mofu_sku": product_metadata.get("mofu_sku") or "",
            "brand": product_metadata.get("brand") or "",
        }
        margin = product_metadata.get("pricing_target_product_gross_margin") or product_metadata.get("target_product_margin")
        fx = product_metadata.get("pricing_cny_to_hkd") or product_metadata.get("fx_cny_to_hkd")
        if not margin_string(margin):
            missing_margin_products.append(common)
            continue
        if not numeric(fx, positive=True):
            missing_fx_products.append(common)
            continue
        for price in product_prices:
            price_metadata = price.get("metadata") or {}
            key_counts.update(price_metadata.keys())
            cost = price_metadata.get("cost_cny") or price_metadata.get("cny_cost") or product_metadata.get("cost_cny") or product_metadata.get("cny_cost")
            price_common = {
                **common,
                "price_id": price["id"],
                "current_hkd": f"{(price.get('unit_amount') or 0) / 100:.2f}",
            }
            if not numeric(cost):
                missing_cost_prices.append(price_common)
                continue
            eligible_product_ids.add(product["id"])
            eligible_prices.append({
                **price_common,
                "cost_cny": cost,
                "target_product_margin": margin,
                "stored_cny_to_hkd": fx,
                "rounding_rule": product_metadata.get("pricing_rounding") or "",
                "is_default_price": str(product.get("default_price") == price["id"]).lower(),
            })

    payload = {
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "active_product_count": len(products),
        "active_hkd_price_count": len(prices),
        "reprice_eligible_product_count": len(eligible_product_ids),
        "reprice_eligible_hkd_price_count": len(eligible_prices),
        "missing_cost_hkd_price_count": len(missing_cost_prices),
        "missing_margin_product_count": len(missing_margin_products),
        "missing_fx_product_count": len(missing_fx_products),
        "recognized_pricing_metadata_key_counts": {
            key: key_counts[key]
            for key in [
                "cost_cny", "cny_cost", "pricing_target_product_gross_margin",
                "target_product_margin", "pricing_cny_to_hkd", "fx_cny_to_hkd",
                "pricing_rounding", "pricing_ship_to_hk_hkd", "retail_pricing_rule",
            ]
        },
        "eligible_price_records": eligible_prices,
        "missing_cost_hkd_price_records": missing_cost_prices,
        "missing_margin_product_records": missing_margin_products,
        "missing_fx_product_records": missing_fx_products,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        key: payload[key]
        for key in [
            "active_product_count", "active_hkd_price_count", "reprice_eligible_product_count",
            "reprice_eligible_hkd_price_count", "missing_cost_hkd_price_count",
            "missing_margin_product_count", "missing_fx_product_count", "recognized_pricing_metadata_key_counts",
        ]
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
