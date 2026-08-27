#!/usr/bin/env python3
"""Read-only audit of the initial FX repricing run started at 2026-08-27T11:21Z."""
from __future__ import annotations

import csv
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import requests

ROOT = Path(__file__).resolve().parents[1]
REPORTS = ROOT / "reports"
JSON_OUT = REPORTS / "fx_pricing_initial_apply_audit_2026-08-27.json"
CSV_OUT = REPORTS / "fx_pricing_initial_apply_audit_2026-08-27.csv"
MD_OUT = REPORTS / "fx_pricing_initial_apply_audit_2026-08-27.md"
START_EPOCH = 1787829650  # 2026-08-27T11:20:50Z, immediately before the owner-approved run
COST_KEYS = ("cost_cny", "cny_cost", "source_cost_cny", "cost_cny_per_product", "supplier_cost_cny", "unit_cost_cny")


def text(value: Any) -> str:
    return str(value).strip() if value is not None else ""


def hkd(cents: Any) -> str:
    return f"{int(cents) / 100:.2f}" if isinstance(cents, int) else ""


def list_all(session: requests.Session, resource: str, params: dict[str, str]) -> list[dict[str, Any]]:
    results: list[dict[str, Any]] = []
    cursor: str | None = None
    while True:
        query = {**params, "limit": "100"}
        if cursor:
            query["starting_after"] = cursor
        response = session.get(f"https://api.stripe.com/v1/{resource}", params=query, timeout=60)
        response.raise_for_status()
        page = response.json()
        data = page.get("data")
        if not isinstance(data, list):
            raise RuntimeError(f"Unexpected Stripe list response for {resource}")
        results.extend(item for item in data if isinstance(item, dict))
        if not page.get("has_more"):
            return results
        if not data or not text(data[-1].get("id")):
            raise RuntimeError(f"Stripe pagination cursor unavailable for {resource}")
        cursor = data[-1]["id"]


def same_metadata(left: Any, right: Any) -> bool:
    return isinstance(left, dict) and isinstance(right, dict) and left == right


def main() -> None:
    api_key = os.environ.get("STRIPE_SECRET_KEY")
    if not api_key:
        raise SystemExit("STRIPE_SECRET_KEY is required")
    session = requests.Session()
    session.auth = (api_key, "")
    replacements = list_all(session, "prices", {
        "active": "true",
        "currency": "hkd",
        "created[gte]": str(START_EPOCH),
    })
    candidates = [price for price in replacements if price.get("type") == "one_time"]
    if len(candidates) != 3:
        raise RuntimeError(f"Expected exactly 3 initial FX replacement Prices, found {len(candidates)}")

    rows: list[dict[str, Any]] = []
    for replacement in candidates:
        product_id = text(replacement.get("product"))
        product_response = session.get(f"https://api.stripe.com/v1/products/{product_id}", timeout=60)
        product_response.raise_for_status()
        product = product_response.json()
        all_product_prices = list_all(session, "prices", {"product": product_id, "currency": "hkd"})
        source_candidates = [
            price for price in all_product_prices
            if price.get("active") is False
            and price.get("type") == "one_time"
            and price.get("created", 0) < START_EPOCH
            and same_metadata(price.get("metadata"), replacement.get("metadata"))
        ]
        if len(source_candidates) != 1:
            raise RuntimeError(f"Could not identify exactly one metadata-matched inactive source for {replacement['id']}")
        source = source_candidates[0]
        default_id = text(product.get("default_price"))
        row = {
            "mofu_sku": text((product.get("metadata") or {}).get("mofu_sku")),
            "product_id": product_id,
            "product_name": text(product.get("name")),
            "source_price_id": source["id"],
            "replacement_price_id": replacement["id"],
            "old_hkd": hkd(source.get("unit_amount")),
            "new_hkd": hkd(replacement.get("unit_amount")),
            "cost_cny": next((text((replacement.get("metadata") or {}).get(key)) for key in COST_KEYS if text((replacement.get("metadata") or {}).get(key))), ""),
            "source_inactive": source.get("active") is False,
            "replacement_active": replacement.get("active") is True,
            "default_price_is_replacement": default_id == replacement["id"],
            "verified": source.get("active") is False and replacement.get("active") is True and default_id == replacement["id"],
        }
        if not row["verified"]:
            raise RuntimeError(f"Replacement relationship verification failed: {replacement['id']}")
        rows.append(row)

    rows.sort(key=lambda row: (row["mofu_sku"], row["replacement_price_id"]))
    payload = {
        "audited_at_utc": datetime.now(timezone.utc).isoformat(),
        "no_stripe_writes_performed": True,
        "rate_date": "2026-08-26",
        "rate_hkd_per_cny": "1.166292622",
        "replacement_price_count": len(rows),
        "passed_count": sum(bool(row["verified"]) for row in rows),
        "failed_count": sum(not bool(row["verified"]) for row in rows),
        "records": rows,
    }
    JSON_OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    with CSV_OUT.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0]), lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)
    lines = [
        "# Mofu Haven HK 首輪日結外匯定價同步審計\n",
        f"**審計時間（UTC）：** {payload['audited_at_utc']}\n",
        "**方式：** 只讀取 Stripe；本審計不會建立、更新或停用任何 Stripe 物件。\n",
        "\n| 項目 | 結果 |\n| --- | ---: |\n",
        "| 匯率來源 | Frankfurter 指定 ECB provider 的 EUR 交叉匯率 |\n",
        "| ECB 日結日期 | 2026-08-26 |\n",
        "| CNY/HKD | 1.166292622 |\n",
        f"| 已建立 replacement Price | {payload['replacement_price_count']} |\n",
        f"| 來源停用、新 Price 活躍及預設 Price 切換均通過 | {payload['passed_count']} |\n",
        f"| 核對失敗 | {payload['failed_count']} |\n",
        "\n完整逐項名單見 CSV。\n",
    ]
    MD_OUT.write_text("".join(lines), encoding="utf-8")
    print(json.dumps({
        "no_stripe_writes_performed": True,
        "replacement_price_count": len(rows),
        "passed_count": payload["passed_count"],
        "csv": str(CSV_OUT),
        "markdown": str(MD_OUT),
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
