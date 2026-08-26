#!/usr/bin/env python3
"""Read-only audit for temporary archival of products created before 2026-08-25 HKT.

The script deliberately never mutates Stripe. It writes a traceable audit of all
products, active old-product candidates, and protected recent products.
"""

from __future__ import annotations

import json
import os
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

import requests

ROOT = Path(__file__).resolve().parents[1]
OUT_JSON = ROOT / "pre_aug25_product_archive_audit.json"
OUT_MD = ROOT / "pre_aug25_product_archive_audit.md"
CUTOFF = datetime(2026, 8, 25, 0, 0, 0, tzinfo=ZoneInfo("Asia/Hong_Kong"))
CUTOFF_TS = int(CUTOFF.timestamp())


def list_all_products(api_key: str) -> list[dict]:
    products: list[dict] = []
    params: dict[str, object] = {"limit": 100}
    while True:
        response = requests.get(
            "https://api.stripe.com/v1/products",
            params=params,
            auth=(api_key, ""),
            timeout=60,
        )
        response.raise_for_status()
        page = response.json()
        products.extend(page["data"])
        if not page.get("has_more"):
            break
        params["starting_after"] = page["data"][-1]["id"]
    return products


def local_time(epoch: int) -> str:
    return datetime.fromtimestamp(epoch, tz=ZoneInfo("Asia/Hong_Kong")).isoformat()


def product_record(product: dict) -> dict:
    metadata = dict(product.get("metadata") or {})
    return {
        "product_id": product["id"],
        "name": product.get("name", ""),
        "active": bool(product.get("active")),
        "created_unix": int(product["created"]),
        "created_hkt": local_time(int(product["created"])),
        "default_price": product.get("default_price"),
        "category": metadata.get("category", ""),
        "subcategory": metadata.get("subcategory", ""),
        "stock_status": metadata.get("stock_status", ""),
        "in_stock": metadata.get("in_stock", ""),
        "mofu_import_key": metadata.get("mofu_import_key", ""),
        "source_product": metadata.get("source_product", ""),
    }


def main() -> None:
    api_key = os.environ.get("STRIPE_SECRET_KEY")
    if not api_key:
        raise SystemExit("STRIPE_SECRET_KEY is required")
    records = [product_record(product) for product in list_all_products(api_key)]
    records.sort(key=lambda item: (item["created_unix"], item["product_id"]))
    old_active = [item for item in records if item["created_unix"] < CUTOFF_TS and item["active"]]
    old_inactive = [item for item in records if item["created_unix"] < CUTOFF_TS and not item["active"]]
    protected_recent = [item for item in records if item["created_unix"] >= CUTOFF_TS]

    duplicate_name_groups: dict[str, list[str]] = {}
    for item in old_active:
        key = item["name"].strip().lower()
        if key:
            duplicate_name_groups.setdefault(key, []).append(item["product_id"])
    exact_name_duplicates = {
        name: ids for name, ids in duplicate_name_groups.items() if len(ids) > 1
    }

    payload = {
        "cutoff_hkt": CUTOFF.isoformat(),
        "cutoff_unix": CUTOFF_TS,
        "total_products": len(records),
        "old_active_candidates": old_active,
        "old_inactive_already_archived": old_inactive,
        "protected_recent_products": protected_recent,
        "old_active_exact_name_duplicates": exact_name_duplicates,
        "safety_rule": "Only active products created strictly before cutoff are archive candidates. No mutation was performed.",
    }
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# 舊產品歸檔唯讀稽核\n",
        f"- 日期邊界：**{CUTOFF.isoformat()}**（香港時間）\n",
        f"- Stripe 產品總數：**{len(records)}**\n",
        f"- 可暫時歸檔的舊有啟用產品：**{len(old_active)}**\n",
        f"- 已歸檔的舊有產品：**{len(old_inactive)}**\n",
        f"- 受保護的新產品（8 月 25 日起建立）：**{len(protected_recent)}**\n",
        "\n## 可暫時歸檔候選\n",
        "| Stripe Product | 名稱 | 建立時間（HKT） | 分類 | 庫存 | 匯入鍵 |\n",
        "| --- | --- | --- | --- | --- | --- |\n",
    ]
    for item in old_active:
        lines.append(
            "| `{product_id}` | {name} | {created_hkt} | {category}/{subcategory} | {stock_status} | {mofu_import_key} |\n".format(
                **{key: str(value).replace("|", "\\|") for key, value in item.items()}
            )
        )
    if exact_name_duplicates:
        lines.extend(["\n## 同名候選（需在歸檔前額外覆核）\n", "| 名稱 | Stripe Product IDs |\n", "| --- | --- |\n"])
        for name, ids in exact_name_duplicates.items():
            lines.append(f"| {name} | {', '.join(f'`{item}`' for item in ids)} |\n")
    OUT_MD.write_text("".join(lines), encoding="utf-8")
    print(json.dumps({
        "cutoff_hkt": CUTOFF.isoformat(),
        "total_products": len(records),
        "old_active_candidates": len(old_active),
        "old_inactive_already_archived": len(old_inactive),
        "protected_recent_products": len(protected_recent),
        "exact_name_duplicate_groups": len(exact_name_duplicates),
        "json": str(OUT_JSON),
        "markdown": str(OUT_MD),
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
