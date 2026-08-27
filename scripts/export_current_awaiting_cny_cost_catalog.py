#!/usr/bin/env python3
"""Export a read-only, current Stripe list of storefront Prices awaiting trusted CNY cost."""
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
OUT_CSV = ROOT / "reports" / "current_awaiting_cny_cost_catalog_2026-08-27.csv"
OUT_JSON = ROOT / "reports" / "current_awaiting_cny_cost_catalog_2026-08-27.json"
OUT_MD = ROOT / "reports" / "current_awaiting_cny_cost_catalog_2026-08-27.md"
COST_KEYS = ("cost_cny", "cny_cost", "source_cost_cny", "cost_cny_per_product", "supplier_cost_cny", "unit_cost_cny")


def text(value: Any) -> str:
    return str(value).strip() if value is not None else ""


def list_all(session: requests.Session, resource: str, params: dict[str, str]) -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    cursor: str | None = None
    while True:
        query = {**params, "limit": "100"}
        if cursor:
            query["starting_after"] = cursor
        response = session.get(f"https://api.stripe.com/v1/{resource}", params=query, timeout=60)
        response.raise_for_status()
        payload = response.json()
        data = payload.get("data")
        if not isinstance(data, list):
            raise RuntimeError(f"Unexpected Stripe response for {resource}")
        records.extend(item for item in data if isinstance(item, dict))
        if not payload.get("has_more"):
            return records
        if not data or not text(data[-1].get("id")):
            raise RuntimeError(f"Stripe cursor unavailable for {resource}")
        cursor = data[-1]["id"]


def has_cost(metadata: Any) -> bool:
    return isinstance(metadata, dict) and any(text(metadata.get(key)) for key in COST_KEYS)


def declared_variant(price: dict[str, Any]) -> bool:
    metadata = price.get("metadata") or {}
    if text(metadata.get("variant_key")) or text(metadata.get("variant_label_zh")):
        return True
    try:
        return int(text(metadata.get("pack_count")) or "0") > 0
    except ValueError:
        return False


def storefront_ids(product: dict[str, Any], prices: list[dict[str, Any]]) -> set[str]:
    metadata = product.get("metadata") or {}
    mode = text(metadata.get("variant_mode"))
    if mode in {"pack_size", "option", "choice"}:
        return {price["id"] for price in prices if declared_variant(price)}
    default_id = text(product.get("default_price"))
    return {default_id} if default_id and any(price["id"] == default_id for price in prices) else set()


def hkd(cents: Any) -> str:
    return f"{int(cents) / 100:.2f}" if isinstance(cents, int) else ""


def main() -> None:
    api_key = os.environ.get("STRIPE_SECRET_KEY")
    if not api_key:
        raise SystemExit("STRIPE_SECRET_KEY is required")
    session = requests.Session()
    session.auth = (api_key, "")
    products = list_all(session, "products", {"active": "true"})
    products_by_id = {product["id"]: product for product in products}
    hkd_prices = list_all(session, "prices", {"active": "true", "currency": "hkd"})
    by_product: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for price in hkd_prices:
        product_id = text(price.get("product"))
        if product_id in products_by_id and price.get("type") == "one_time" and isinstance(price.get("unit_amount"), int):
            by_product[product_id].append(price)

    rows: list[dict[str, Any]] = []
    for product_id, product in sorted(products_by_id.items()):
        product_prices = by_product.get(product_id, [])
        selected = storefront_ids(product, product_prices)
        product_metadata = product.get("metadata") or {}
        for price in product_prices:
            if price["id"] not in selected or has_cost(price.get("metadata")):
                continue
            # A trustworthy product-level cost only applies to a single active price.
            safe_product_level_cost = len(product_prices) == 1 and has_cost(product_metadata)
            if safe_product_level_cost:
                continue
            price_metadata = price.get("metadata") or {}
            rows.append({
                "mofu_sku": text(product_metadata.get("mofu_sku")),
                "supplier_sku": text(product_metadata.get("sku")),
                "brand": text(product_metadata.get("brand")) or "未標示品牌",
                "product_id": product_id,
                "price_id": price["id"],
                "product_name": text(product.get("name")),
                "variant_label_zh": text(price_metadata.get("variant_label_zh")) or "單一規格",
                "pack_count": text(price_metadata.get("pack_count")),
                "current_hkd": hkd(price.get("unit_amount")),
                "variant_mode": text(product_metadata.get("variant_mode")) or "single",
                "known_reference_url": text(product_metadata.get("source_url") or product_metadata.get("official_url")),
                "missing_cost_status": "awaiting_verified_cny_cost",
                "acceptable_evidence": "supplier invoice, purchase order, wholesale quotation, or product-level cost record explicitly confirmed by store owner",
            })

    rows.sort(key=lambda row: (row["brand"], row["mofu_sku"], row["price_id"]))
    summary = {
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "no_stripe_writes_performed": True,
        "active_product_count": len(products),
        "active_storefront_hkd_price_count": sum(len(storefront_ids(product, by_product.get(product_id, []))) for product_id, product in products_by_id.items()),
        "awaiting_verified_cny_cost_price_count": len(rows),
        "awaiting_verified_cny_cost_product_count": len({row["product_id"] for row in rows}),
        "brand_counts": dict(Counter(row["brand"] for row in rows).most_common()),
        "records": rows,
    }
    OUT_JSON.write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    with OUT_CSV.open("w", encoding="utf-8-sig", newline="") as handle:
        fields = list(rows[0]) if rows else ["missing_cost_status"]
        writer = csv.DictWriter(handle, fieldnames=fields, lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)
    lines = [
        "# Mofu Haven HK 待補 CNY 成本即時清單\n",
        f"**產生時間（UTC）：** {summary['generated_at_utc']}\n",
        "**方式：** 純讀取 Stripe；本清單不會建立、更新或停用任何 Stripe 物件。\n",
        "\n| 項目 | 結果 |\n| --- | ---: |\n",
        f"| 活躍產品 | {summary['active_product_count']} |\n",
        f"| 活躍可售 HKD Price | {summary['active_storefront_hkd_price_count']} |\n",
        f"| 待補可信 CNY 成本 Price | {summary['awaiting_verified_cny_cost_price_count']} |\n",
        f"| 涉及產品 | {summary['awaiting_verified_cny_cost_product_count']} |\n",
        "\n成本資料只可採用供應商發票、採購單、批發報價，或店主明確確認的產品成本記錄。公開零售價、品牌常規或圖片不能作為真實採購成本。完整逐項清單見 CSV。\n",
    ]
    OUT_MD.write_text("".join(lines), encoding="utf-8")
    print(json.dumps({
        "no_stripe_writes_performed": True,
        "awaiting_cost_price_count": len(rows),
        "awaiting_cost_product_count": summary["awaiting_verified_cny_cost_product_count"],
        "markdown": str(OUT_MD),
        "csv": str(OUT_CSV),
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
