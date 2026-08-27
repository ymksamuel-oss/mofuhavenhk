#!/usr/bin/env python3
"""Create a read-only, current Stripe catalog preview for a specified CNY pricing rule.

This program never creates, edits, deactivates, or otherwise writes Stripe Products or
Prices. It retrieves live active Products and active HKD Prices, then calculates only
when a positive CNY cost is found in current metadata or in the prior reviewed preview
for the same Product ID and Price ID.
"""
from __future__ import annotations

import csv
import json
import os
from collections import Counter, defaultdict
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation, ROUND_CEILING
from pathlib import Path
from typing import Any, Iterator

import requests

ROOT = Path(__file__).resolve().parents[1]
PRIOR_PREVIEW = ROOT / "reports" / "catalog_cny_hkd_multiplier_repricing_preview_2026-08-27.json"
DATE_TAG = "2026-08-27"
CSV_OUT = ROOT / "reports" / f"catalog_cny_hkd_multiplier_repricing_preview_1_166_{DATE_TAG}.csv"
JSON_OUT = ROOT / "reports" / f"catalog_cny_hkd_multiplier_repricing_preview_1_166_{DATE_TAG}.json"
MD_OUT = ROOT / "reports" / f"catalog_cny_hkd_multiplier_repricing_preview_1_166_{DATE_TAG}.md"

STRIPE_BASE_URL = "https://api.stripe.com/v1"
CNY_TO_HKD = Decimal("1.166")
RETAIL_MULTIPLIER = Decimal("1.76")
TAIL = Decimal("0.90")
COST_KEYS = (
    "cost_cny",
    "cny_cost",
    "source_cost_cny",
    "cost_cny_per_product",
    "supplier_cost_cny",
    "unit_cost_cny",
)


def decimal_cost(value: Any) -> Decimal | None:
    try:
        cost = Decimal(str(value).strip())
    except (InvalidOperation, AttributeError, TypeError):
        return None
    return cost if cost > 0 else None


def round_up_to_90(value: Decimal) -> Decimal:
    if value <= 0:
        raise ValueError("Retail value must be positive")
    return (value - TAIL).to_integral_value(rounding=ROUND_CEILING) + TAIL


def text(value: Any) -> str:
    return str(value).strip() if value is not None else ""


def money_from_cents(value: Any) -> Decimal | None:
    if not isinstance(value, int) or value < 0:
        return None
    return Decimal(value) / Decimal("100")


def stripe_list(session: requests.Session, resource: str, params: dict[str, str]) -> list[dict[str, Any]]:
    endpoint = f"{STRIPE_BASE_URL}/{resource}"
    query = {**params, "limit": "100"}
    records: list[dict[str, Any]] = []
    while True:
        response = session.get(endpoint, params=query, timeout=60)
        response.raise_for_status()
        payload = response.json()
        batch = payload.get("data")
        if not isinstance(batch, list):
            raise RuntimeError(f"Unexpected Stripe response shape for {resource}")
        records.extend(item for item in batch if isinstance(item, dict))
        if not payload.get("has_more"):
            return records
        if not batch or not isinstance(batch[-1].get("id"), str):
            raise RuntimeError(f"Stripe pagination missing final ID for {resource}")
        query["starting_after"] = batch[-1]["id"]


def walk_objects(value: Any) -> Iterator[dict[str, Any]]:
    if isinstance(value, dict):
        yield value
        for item in value.values():
            yield from walk_objects(item)
    elif isinstance(value, list):
        for item in value:
            yield from walk_objects(item)


def historical_costs() -> dict[str, dict[str, str]]:
    """Use only exact historical Price-ID matches with a documented cost source."""
    if not PRIOR_PREVIEW.exists():
        return {}
    try:
        payload = json.loads(PRIOR_PREVIEW.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}

    results: dict[str, dict[str, str]] = {}
    for item in walk_objects(payload):
        price_id = text(item.get("price_id"))
        product_id = text(item.get("product_id"))
        cost = decimal_cost(item.get("cost_cny"))
        source = text(item.get("cost_source"))
        if not price_id or not product_id or cost is None or not source:
            continue
        results[price_id] = {
            "product_id": product_id,
            "cost_cny": f"{cost:.4f}",
            "cost_source": f"prior_reviewed_preview_exact_price_match:{source}",
        }
    return results


def metadata_cost(metadata: Any) -> tuple[Decimal | None, str]:
    if not isinstance(metadata, dict):
        return None, ""
    for key in COST_KEYS:
        cost = decimal_cost(metadata.get(key))
        if cost is not None:
            return cost, key
    return None, ""


def product_id_from_price(price: dict[str, Any]) -> str:
    product = price.get("product")
    if isinstance(product, str):
        return product
    if isinstance(product, dict):
        return text(product.get("id"))
    return ""


def product_sku(product: dict[str, Any]) -> str:
    metadata = product.get("metadata")
    if not isinstance(metadata, dict):
        return ""
    for key in ("mofu_sku", "sku", "store_sku"):
        candidate = text(metadata.get(key))
        if candidate:
            return candidate
    return ""


def product_brand(product: dict[str, Any]) -> str:
    metadata = product.get("metadata")
    if not isinstance(metadata, dict):
        return ""
    return text(metadata.get("brand"))


def format_hkd(value: Decimal | None) -> str:
    return f"{value:.2f}" if value is not None else ""


def markdown_escape(value: str) -> str:
    return value.replace("|", "\\|").replace("\n", " ")


def main() -> None:
    api_key = os.environ.get("STRIPE_SECRET_KEY")
    if not api_key:
        raise SystemExit("STRIPE_SECRET_KEY is not set")

    session = requests.Session()
    session.auth = (api_key, "")

    products = stripe_list(session, "products", {"active": "true"})
    live_products = {text(product.get("id")): product for product in products if text(product.get("id"))}
    all_active_hkd_prices = stripe_list(session, "prices", {"active": "true", "currency": "hkd"})
    attached_prices = [
        price for price in all_active_hkd_prices
        if product_id_from_price(price) in live_products
    ]
    attached_prices.sort(key=lambda price: (product_id_from_price(price), text(price.get("id"))))

    price_count_by_product = Counter(product_id_from_price(price) for price in attached_prices)
    historic = historical_costs()
    records: list[dict[str, Any]] = []

    for price in attached_prices:
        product_id = product_id_from_price(price)
        product = live_products[product_id]
        price_id = text(price.get("id"))
        price_metadata = price.get("metadata") if isinstance(price.get("metadata"), dict) else {}
        product_metadata = product.get("metadata") if isinstance(product.get("metadata"), dict) else {}

        cost, cost_key = metadata_cost(price_metadata)
        cost_source = f"live_price_metadata:{cost_key}" if cost is not None else ""
        if cost is None and price_count_by_product[product_id] == 1:
            cost, cost_key = metadata_cost(product_metadata)
            cost_source = f"live_product_metadata_single_price_only:{cost_key}" if cost is not None else ""
        if cost is None:
            historical = historic.get(price_id)
            if historical and historical["product_id"] == product_id:
                cost = decimal_cost(historical["cost_cny"])
                cost_source = historical["cost_source"] if cost is not None else ""

        current = money_from_cents(price.get("unit_amount"))
        status = "awaiting_cny_cost"
        unrounded: Decimal | None = None
        proposed: Decimal | None = None
        change: Decimal | None = None
        change_percent: Decimal | None = None
        if cost is not None and current is not None:
            unrounded = cost * CNY_TO_HKD * RETAIL_MULTIPLIER
            proposed = round_up_to_90(unrounded)
            change = proposed - current
            change_percent = (change / current * Decimal("100")) if current else None
            status = "no_change" if change == 0 else "recalculable_preview_only"
        elif cost is not None:
            status = "invalid_or_non_unit_price"

        records.append({
            "product_id": product_id,
            "price_id": price_id,
            "mofu_sku": product_sku(product),
            "product_name": text(product.get("name")),
            "brand": product_brand(product),
            "product_active": bool(product.get("active")),
            "price_active": bool(price.get("active")),
            "currency": text(price.get("currency")).upper(),
            "price_type": text(price.get("type")),
            "is_default_price": text(product.get("default_price")) == price_id,
            "active_hkd_price_count_for_product": price_count_by_product[product_id],
            "current_hkd": format_hkd(current),
            "current_cents": price.get("unit_amount") if isinstance(price.get("unit_amount"), int) else "",
            "cost_cny": f"{cost:.4f}" if cost is not None else "",
            "cost_source": cost_source,
            "unrounded_proposed_hkd": format_hkd(unrounded.quantize(Decimal("0.0001")) if unrounded is not None else None),
            "proposed_hkd": format_hkd(proposed),
            "proposed_cents": int(proposed * 100) if proposed is not None else "",
            "price_change_hkd": format_hkd(change),
            "price_change_percent": f"{change_percent:.4f}" if change_percent is not None else "",
            "pricing_status": status,
            "write_action": "preview_only_no_stripe_write",
        })

    recalculable = [row for row in records if row["pricing_status"] in {"recalculable_preview_only", "no_change"}]
    changing = [row for row in records if row["pricing_status"] == "recalculable_preview_only"]
    missing_cost = [row for row in records if row["pricing_status"] == "awaiting_cny_cost"]
    price_change_total = sum((Decimal(row["price_change_hkd"]) for row in changing), Decimal("0"))
    by_brand = defaultdict(lambda: {"price_count": 0, "recalculable": 0, "changing": 0, "missing_cost": 0})
    for row in records:
        brand = row["brand"] or "未標示品牌"
        bucket = by_brand[brand]
        bucket["price_count"] += 1
        if row["pricing_status"] in {"recalculable_preview_only", "no_change"}:
            bucket["recalculable"] += 1
        if row["pricing_status"] == "recalculable_preview_only":
            bucket["changing"] += 1
        if row["pricing_status"] == "awaiting_cny_cost":
            bucket["missing_cost"] += 1

    payload = {
        "mode": "read_only_current_stripe_catalog_preview",
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "no_stripe_writes_performed": True,
        "pricing_policy": {
            "formula": "retail_hkd = ceil_to_.90(cost_cny × 1.166 × 1.76)",
            "cny_to_hkd": "1.166",
            "retail_multiplier": "1.76",
            "rounding": "upward .90",
            "rounding_definition": "ceil(unrounded_hkd - 0.90) + 0.90",
        },
        "scope": {
            "active_product_count": len(live_products),
            "active_hkd_price_count_global": len(all_active_hkd_prices),
            "active_hkd_price_count_attached_to_active_products": len(attached_prices),
            "orphaned_active_hkd_price_count": len(all_active_hkd_prices) - len(attached_prices),
            "cost_recalculable_price_count": len(recalculable),
            "price_change_preview_count": len(changing),
            "no_change_price_count": sum(1 for row in recalculable if row["pricing_status"] == "no_change"),
            "awaiting_cny_cost_price_count": len(missing_cost),
            "products_with_no_attached_active_hkd_price": sum(1 for product_id in live_products if not price_count_by_product[product_id]),
            "aggregate_price_change_hkd": f"{price_change_total:.2f}",
        },
        "cost_source_policy": {
            "current_price_metadata": list(COST_KEYS),
            "current_product_metadata": "used only where exactly one active HKD Price belongs to the Product",
            "historical_fallback": "used only for an exact match of both current Price ID and Product ID, with documented prior cost source",
            "missing_cost": "never inferred from current retail price; no update is proposed",
        },
        "records": records,
        "brand_summary": [
            {"brand": brand, **counts}
            for brand, counts in sorted(by_brand.items(), key=lambda item: (-item[1]["price_count"], item[0]))
        ],
    }

    CSV_OUT.parent.mkdir(parents=True, exist_ok=True)
    fields = list(records[0]) if records else ["product_id"]
    with CSV_OUT.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields, lineterminator="\n")
        writer.writeheader()
        writer.writerows(records)
    JSON_OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    largest_abs_change = sorted(
        changing,
        key=lambda row: abs(Decimal(row["price_change_hkd"])),
        reverse=True,
    )[:25]
    lines = [
        "# Mofu Haven HK 全站 CNY 定價更新預覽（唯讀）\n",
        f"**產生時間（UTC）：** {payload['generated_at_utc']}\n",
        "**狀態：** **唯讀預覽**。程式只讀取 Stripe 的活躍 Products 與 HKD Prices；沒有建立、更新、停用任何 Stripe Price，亦沒有修改 Product metadata 或前台價格。\n",
        "\n## 指定規則\n",
        "> **HKD 零售價 = 向上取整至 `.90`（CNY 成本 × 1.166 × 1.76）**\n",
        "\n精確取整定義為 `ceil(未取整價格 − 0.90) + 0.90`；例如 HK$16.90 維持 HK$16.90，而 HK$16.91 會向上成為 HK$17.90。\n",
        "\n## 即時 Stripe 盤點\n",
        "| 項目 | 數量 |\n| --- | ---: |\n",
        f"| 活躍 Stripe Products | {len(live_products)} |\n",
        f"| 全帳戶活躍 HKD Prices | {len(all_active_hkd_prices)} |\n",
        f"| 屬於活躍 Products 的活躍 HKD Prices | {len(attached_prices)} |\n",
        f"| 遺留／非活躍 Product 的活躍 HKD Prices（只作審計，不納入更新） | {len(all_active_hkd_prices) - len(attached_prices)} |\n",
        f"| 有可追溯 CNY 成本、可計算的 Price | {len(recalculable)} |\n",
        f"| 有價格變動建議（只作預覽） | {len(changing)} |\n",
        f"| 按公式後維持現價 | {sum(1 for row in recalculable if row['pricing_status'] == 'no_change')} |\n",
        f"| 欠缺可信 CNY 成本、不可估算 | {len(missing_cost)} |\n",
        f"| 沒有任何活躍 HKD Price 的活躍 Product | {sum(1 for product_id in live_products if not price_count_by_product[product_id])} |\n",
        f"| 可計算項目的合計價格差額（非銷售額） | HK${price_change_total:.2f} |\n",
        "\n## 成本資料處理原則\n",
        "只有現行 Price metadata 的 CNY 成本、僅有一個活躍 HKD Price 時的 Product metadata 成本，或與先前已核實預覽完全相同的 Product ID 與 Price ID 成本紀錄，才會納入計算。沒有可信成本的 Price 會保留原價，絕不從現價反推或猜測成本。\n",
        "\n## 價格變動幅度最大的 25 項（唯讀）\n",
        "| 店內 SKU | 產品 | Price ID | 現價 | CNY 成本 | 建議價 | 差額 | 成本來源 |\n| --- | --- | --- | ---: | ---: | ---: | ---: | --- |\n",
    ]
    for row in largest_abs_change:
        lines.append(
            f"| {markdown_escape(row['mofu_sku'])} | {markdown_escape(row['product_name'])} | {row['price_id']} | "
            f"HK${row['current_hkd']} | ¥{row['cost_cny']} | HK${row['proposed_hkd']} | "
            f"HK${row['price_change_hkd']} | {markdown_escape(row['cost_source'])} |\n"
        )
    lines.extend([
        "\n## 完整清單\n",
        f"完整逐 Price 清單位於同日 CSV：`{CSV_OUT.name}`；其機讀版本位於 `{JSON_OUT.name}`。兩者均列出產品、Price ID、現價、成本、成本來源、未取整價格、建議價、差額與狀態。\n",
        "\n## 下一步\n",
        "在店主確認完整預覽前，不應寫入 Stripe。確認時必須明確指定：是否只批准有可信成本的 Price、如何處理欠缺成本的項目，以及是否把遺留／未連結的活躍 Price 排除於本次變更。寫入前亦必須重新讀取 Stripe，核對每個來源 Price 仍為活躍、產品關係與金額不變。\n",
    ])
    MD_OUT.write_text("".join(lines), encoding="utf-8")

    print(json.dumps({
        "no_stripe_writes_performed": True,
        "active_product_count": len(live_products),
        "active_hkd_price_count_global": len(all_active_hkd_prices),
        "active_hkd_price_count_attached_to_active_products": len(attached_prices),
        "cost_recalculable_price_count": len(recalculable),
        "price_change_preview_count": len(changing),
        "awaiting_cny_cost_price_count": len(missing_cost),
        "csv": str(CSV_OUT),
        "json": str(JSON_OUT),
        "markdown": str(MD_OUT),
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
