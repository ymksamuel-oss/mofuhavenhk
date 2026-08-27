#!/usr/bin/env python3
"""Strict, zero-write reconciliation of an owner-supplied fixed pricing CSV against Stripe.

No formula, FX value, rounding rule, current Price amount, or CSV value is transformed.
A row becomes eligible only when its exact CSV `price_id` is an active HKD one-time Price
that remains attached to its exact CSV `product_id`, and that Product remains active.
"""
from __future__ import annotations

import csv
import json
import os
from collections import Counter
from datetime import datetime, timezone
from decimal import Decimal
from pathlib import Path
from typing import Any

import requests

ROOT = Path(__file__).resolve().parents[1]
INPUT = Path("/home/ubuntu/upload/recalculated_pricing_output.csv")
REPORTS = ROOT / "reports"
MANIFEST = REPORTS / "recalculated_pricing_output_stripe_preflight_2026-08-27.json"
MD_OUT = REPORTS / "recalculated_pricing_output_stripe_preflight_2026-08-27.md"
CSV_OUT = REPORTS / "recalculated_pricing_output_stripe_preflight_2026-08-27.csv"


def text(value: Any) -> str:
    return str(value).strip() if value is not None else ""


def get(session: requests.Session, path: str) -> dict[str, Any]:
    response = session.get(f"https://api.stripe.com/v1/{path}", timeout=60)
    response.raise_for_status()
    return response.json()


def cents(value: str) -> int:
    return int(Decimal(value) * 100)


def hkd(value: Any) -> str:
    return f"{int(value) / 100:.2f}" if isinstance(value, int) else ""


def main() -> None:
    api_key = os.environ.get("STRIPE_SECRET_KEY")
    if not api_key:
        raise SystemExit("STRIPE_SECRET_KEY is required")
    with INPUT.open("r", encoding="utf-8-sig", newline="") as handle:
        rows = list(csv.DictReader(handle))
    if not rows:
        raise SystemExit("CSV contains no data rows")
    session = requests.Session()
    session.auth = (api_key, "")
    records: list[dict[str, Any]] = []
    for row_number, row in enumerate(rows, start=2):
        product_id = text(row.get("product_id"))
        price_id = text(row.get("price_id"))
        record: dict[str, Any] = {
            "csv_row": row_number,
            "product_id": product_id,
            "price_id": price_id,
            "mofu_sku": text(row.get("mofu_sku")),
            "product_name": text(row.get("product_name")),
            "csv_cost_cny": text(row.get("cost_cny")),
            "csv_proposed_hkd": text(row.get("proposed_hkd")),
            "status": "pending",
            "current_live_hkd": "",
            "issue": "",
        }
        try:
            price = get(session, f"prices/{price_id}")
            product = get(session, f"products/{product_id}")
            if price.get("product") != product_id:
                raise ValueError("csv product_id does not match Stripe Price.product")
            if price.get("currency") != "hkd" or price.get("type") != "one_time":
                raise ValueError("Stripe Price is not an HKD one-time Price")
            if not price.get("active"):
                raise ValueError("Stripe Price is inactive; exact CSV Price ID cannot be changed safely")
            if not product.get("active"):
                raise ValueError("Stripe Product is inactive")
            record["current_live_hkd"] = hkd(price.get("unit_amount"))
            record["csv_target_cents"] = cents(record["csv_proposed_hkd"])
            record["status"] = "eligible_exact_active_match"
        except requests.HTTPError as error:
            record["status"] = "blocked"
            record["issue"] = f"Stripe HTTP {error.response.status_code} while retrieving exact CSV mapping"
        except (ValueError, ArithmeticError) as error:
            record["status"] = "blocked"
            record["issue"] = str(error)
        records.append(record)

    status_counts = dict(Counter(record["status"] for record in records))
    eligible = [record for record in records if record["status"] == "eligible_exact_active_match"]
    payload = {
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "mode": "strict_csv_to_live_stripe_preflight_no_writes",
        "no_stripe_writes_performed": True,
        "no_formula_recalculation_performed": True,
        "csv_record_count": len(records),
        "eligible_exact_active_match_count": len(eligible),
        "blocked_count": len(records) - len(eligible),
        "status_counts": status_counts,
        "records": records,
    }
    MANIFEST.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    with CSV_OUT.open("w", encoding="utf-8-sig", newline="") as handle:
        fieldnames = list(dict.fromkeys(key for record in records for key in record))
        writer = csv.DictWriter(handle, fieldnames=fieldnames, lineterminator="\n")
        writer.writeheader()
        writer.writerows(records)
    lines = [
        "# 固定定價 CSV 與 Stripe 嚴格預檢\n",
        f"**預檢時間（UTC）：** {payload['generated_at_utc']}\n",
        "**方式：** 逐項讀取 CSV 指定的精確 Stripe Product／Price ID；沒有重新計算、不套用匯率、沒有建立或修改 Stripe 物件。\n",
        "\n| 項目 | 結果 |\n| --- | ---: |\n",
        f"| CSV 資料列 | {payload['csv_record_count']} |\n",
        f"| 精確對應且現行活躍、可匯入 | {payload['eligible_exact_active_match_count']} |\n",
        f"| 已阻擋，需修正 CSV 指向的現行 Price | {payload['blocked_count']} |\n",
        "\n只有 `eligible_exact_active_match` 項目可在不猜測或映射新 Price ID 的情況下，嚴格按 CSV 原值匯入。完整逐項結果見 CSV。\n",
    ]
    MD_OUT.write_text("".join(lines), encoding="utf-8")
    print(json.dumps({
        "no_stripe_writes_performed": True,
        "csv_record_count": len(records),
        "eligible_exact_active_match_count": len(eligible),
        "blocked_count": len(records) - len(eligible),
        "manifest": str(MANIFEST),
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
