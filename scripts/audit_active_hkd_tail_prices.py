#!/usr/bin/env python3
"""Read-only audit for ceiling all sellable HKD prices to a .90 retail tail.

Only Prices belonging to active Products are included. The rule never lowers a
price: 32.30 -> 32.90, 55.00 -> 55.90, 32.95 -> 33.90, 32.90 -> unchanged.
"""

from __future__ import annotations

import json
import os
from collections import Counter
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parents[1]
OUT_JSON = ROOT / "active_hkd_tail_price_audit.json"
OUT_MD = ROOT / "active_hkd_tail_price_audit.md"


def list_all(api_key: str, endpoint: str, params: dict[str, object]) -> list[dict]:
    rows: list[dict] = []
    request_params = dict(params)
    while True:
        response = requests.get(f"https://api.stripe.com/v1/{endpoint}", params=request_params, auth=(api_key, ""), timeout=60)
        response.raise_for_status()
        payload = response.json()
        rows.extend(payload["data"])
        if not payload.get("has_more"):
            return rows
        request_params["starting_after"] = payload["data"][-1]["id"]


def rounded_up_to_90(amount_cents: int) -> int:
    whole, cents = divmod(amount_cents, 100)
    if cents <= 90:
        return whole * 100 + 90
    return (whole + 1) * 100 + 90


def parse_amount(value: object) -> int | None:
    try:
        text = str(value).strip()
        if not text:
            return None
        amount = float(text)
        cents = round(amount * 100)
        return cents if cents > 0 else None
    except (TypeError, ValueError):
        return None


def money(cents: int | None) -> str:
    return "" if cents is None else f"HK${cents / 100:.2f}"


def main() -> None:
    api_key = os.environ.get("STRIPE_SECRET_KEY")
    if not api_key:
        raise SystemExit("STRIPE_SECRET_KEY is required")

    products = list_all(api_key, "products", {"active": "true", "limit": 100})
    product_by_id = {product["id"]: product for product in products}
    prices = list_all(api_key, "prices", {"active": "true", "currency": "hkd", "limit": 100})

    records: list[dict] = []
    excluded_price_count = 0
    for price in prices:
        product_id = price.get("product")
        if isinstance(product_id, dict):
            product_id = product_id.get("id")
        product = product_by_id.get(product_id)
        if not product:
            excluded_price_count += 1
            continue
        old_cents = int(price.get("unit_amount") or 0)
        if old_cents <= 0 or price.get("type") != "one_time":
            excluded_price_count += 1
            continue
        new_cents = rounded_up_to_90(old_cents)
        price_metadata = price.get("metadata") or {}
        product_metadata = product.get("metadata") or {}
        price_compare = parse_amount(price_metadata.get("compare_at_price_hkd"))
        product_compare = parse_amount(product_metadata.get("compare_at_price_hkd"))
        comparison_source = "price" if price_compare is not None else "product" if product_compare is not None else ""
        comparison_cents = price_compare if price_compare is not None else product_compare
        records.append({
            "product_id": product_id,
            "product_name": product.get("name", ""),
            "price_id": price["id"],
            "is_default_price": product.get("default_price") == price["id"],
            "old_cents": old_cents,
            "old_price_hkd": old_cents / 100,
            "new_cents": new_cents,
            "new_price_hkd": new_cents / 100,
            "will_change": new_cents != old_cents,
            "category": product_metadata.get("category", ""),
            "mofu_import_key": product_metadata.get("mofu_import_key", ""),
            "comparison_source": comparison_source,
            "comparison_cents": comparison_cents,
            "comparison_price_hkd": comparison_cents / 100 if comparison_cents else None,
            "comparison_remains_valid_after": bool(comparison_cents and comparison_cents > new_cents),
            "comparison_will_hide_after": bool(comparison_cents and comparison_cents <= new_cents),
            "price_metadata": price_metadata,
            "product_metadata": product_metadata,
            "nickname": price.get("nickname"),
            "tax_behavior": price.get("tax_behavior"),
        })

    records.sort(key=lambda item: (item["product_name"], item["old_cents"], item["price_id"]))
    changing = [item for item in records if item["will_change"]]
    comparison_hide = [item for item in changing if item["comparison_will_hide_after"]]
    by_category = Counter(item["category"] or "unclassified" for item in records)
    payload = {
        "rule": "Ceiling to the nearest .90 without lowering any current HKD price.",
        "active_product_count": len(products),
        "active_hkd_price_records": len(records),
        "excluded_non_sellable_or_inactive_product_prices": excluded_price_count,
        "price_changes_required": len(changing),
        "prices_already_at_90": len(records) - len(changing),
        "comparison_prices_that_would_be_hidden": comparison_hide,
        "category_counts": dict(sorted(by_category.items())),
        "records": records,
    }
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# 現行可售產品 `.90` 尾數調價唯讀稽核\n",
        f"- 啟用產品數：**{len(products)}**\n",
        f"- 可售 HKD Price 規格數：**{len(records)}**\n",
        f"- 需要向上調整：**{len(changing)}**\n",
        f"- 已符合 `.90` 尾數：**{len(records) - len(changing)}**\n",
        f"- 調價後比較原價將失效／自動隱藏：**{len(comparison_hide)}**\n",
        "\n## 需要調整的 Price\n",
        "| 商品 | Stripe Price | 現價 | 新價 | 預設價格 | 比較價狀態 |\n",
        "| --- | --- | ---: | ---: | --- | --- |\n",
    ]
    for item in changing:
        compare_state = "無比較價"
        if item["comparison_cents"]:
            compare_state = f"保留 {money(item['comparison_cents'])}" if item["comparison_remains_valid_after"] else f"將隱藏 {money(item['comparison_cents'])}"
        lines.append(
            f"| {item['product_name'].replace('|', '\\|')} | `{item['price_id']}` | {money(item['old_cents'])} | {money(item['new_cents'])} | {'是' if item['is_default_price'] else '否'} | {compare_state} |\n"
        )
    OUT_MD.write_text("".join(lines), encoding="utf-8")
    print(json.dumps({
        "active_product_count": len(products),
        "active_hkd_price_records": len(records),
        "price_changes_required": len(changing),
        "prices_already_at_90": len(records) - len(changing),
        "comparison_prices_that_would_be_hidden": len(comparison_hide),
        "json": str(OUT_JSON),
        "markdown": str(OUT_MD),
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
