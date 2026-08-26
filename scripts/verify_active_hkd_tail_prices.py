#!/usr/bin/env python3
"""Verify applied .90 tail-price replacements and all active sellable HKD prices."""

from __future__ import annotations

import json
import os
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parents[1]
APPLY_PATH = ROOT / "active_hkd_tail_price_apply.json"
OUT_PATH = ROOT / "active_hkd_tail_price_verification.json"
RULE = "ceil_to_90_v1"


def get(api_key: str, path: str) -> dict:
    response = requests.get(f"https://api.stripe.com/v1/{path}", auth=(api_key, ""), timeout=60)
    response.raise_for_status()
    return response.json()


def list_all(api_key: str, endpoint: str, params: dict[str, object]) -> list[dict]:
    rows: list[dict] = []
    query = dict(params)
    while True:
        response = requests.get(f"https://api.stripe.com/v1/{endpoint}", params=query, auth=(api_key, ""), timeout=60)
        response.raise_for_status()
        page = response.json()
        rows.extend(page["data"])
        if not page.get("has_more"):
            return rows
        query["starting_after"] = page["data"][-1]["id"]


def as_cents(value: object) -> int | None:
    try:
        text = str(value).strip()
        if not text:
            return None
        cents = round(float(text) * 100)
        return cents if cents > 0 else None
    except (TypeError, ValueError):
        return None


def main() -> None:
    api_key = os.environ.get("STRIPE_SECRET_KEY")
    if not api_key:
        raise SystemExit("STRIPE_SECRET_KEY is required")
    apply = json.loads(APPLY_PATH.read_text(encoding="utf-8"))
    replacements = [item for item in apply["results"] if item["status"] == "replaced"]
    replacement_failures: list[dict] = []
    verified: list[dict] = []

    for item in replacements:
        old = get(api_key, f"prices/{item['source_price_id']}")
        new = get(api_key, f"prices/{item['replacement_price_id']}")
        product = get(api_key, f"products/{item['product_id']}")
        checks = {
            "source_inactive": not bool(old.get("active")),
            "replacement_active": bool(new.get("active")),
            "replacement_amount_matches": int(new.get("unit_amount") or 0) == int(item["new_cents"]),
            "replacement_tail_is_90": int(new.get("unit_amount") or 0) % 100 == 90,
            "replacement_marker": (new.get("metadata") or {}).get("mofu_tail_rounding_rule") == RULE,
            "product_active": bool(product.get("active")),
            "default_switched": (not item.get("was_default_price")) or product.get("default_price") == new["id"],
        }
        comparison = as_cents((new.get("metadata") or {}).get("compare_at_price_hkd"))
        if comparison is None:
            comparison = as_cents((product.get("metadata") or {}).get("compare_at_price_hkd"))
        checks["comparison_valid_or_absent"] = comparison is None or comparison > int(new.get("unit_amount") or 0)
        result = {"product_id": item["product_id"], "source_price_id": old["id"], "replacement_price_id": new["id"], "checks": checks}
        verified.append(result)
        if not all(checks.values()):
            replacement_failures.append(result)

    active_products = list_all(api_key, "products", {"active": "true", "limit": 100})
    active_product_ids = {product["id"] for product in active_products}
    active_prices = list_all(api_key, "prices", {"active": "true", "currency": "hkd", "limit": 100})
    sellable_prices = []
    for price in active_prices:
        product_id = price.get("product") if isinstance(price.get("product"), str) else price.get("product", {}).get("id")
        if product_id in active_product_ids:
            sellable_prices.append(price)
    tail_failures = [
        {"price_id": price["id"], "product_id": price.get("product"), "unit_amount": price.get("unit_amount")}
        for price in sellable_prices
        if int(price.get("unit_amount") or 0) % 100 != 90
    ]

    payload = {
        "replacement_count": len(replacements),
        "replacement_verified": len(replacements) - len(replacement_failures),
        "replacement_failures": replacement_failures,
        "sellable_active_product_count": len(active_products),
        "sellable_active_hkd_price_count": len(sellable_prices),
        "sellable_prices_without_90_tail": tail_failures,
        "sample": verified[0] if verified else None,
        "success": not replacement_failures and not tail_failures,
    }
    OUT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "replacement_verified": payload["replacement_verified"],
        "replacement_failures": len(replacement_failures),
        "sellable_active_hkd_price_count": len(sellable_prices),
        "sellable_prices_without_90_tail": len(tail_failures),
        "success": payload["success"],
        "output": str(OUT_PATH),
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
