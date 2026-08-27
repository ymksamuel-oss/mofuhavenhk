#!/usr/bin/env python3
"""Strict zero-write mapping from owner CSV Price IDs to current active Stripe Prices.

The CSV values are never recalculated. An inactive CSV source Price can map only to a
single active Price in the same Product with identical metadata, which is Stripe's exact
replacement-price lineage created by this store's prior price migration process.
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
JSON_OUT = REPORTS / "recalculated_pricing_output_current_price_mapping_2026-08-27.json"
CSV_OUT = REPORTS / "recalculated_pricing_output_current_price_mapping_2026-08-27.csv"
MD_OUT = REPORTS / "recalculated_pricing_output_current_price_mapping_2026-08-27.md"


def text(value: Any) -> str:
    return str(value).strip() if value is not None else ""


def get(session: requests.Session, path: str, params: dict[str, str] | None = None) -> dict[str, Any]:
    response = session.get(f"https://api.stripe.com/v1/{path}", params=params, timeout=60)
    response.raise_for_status()
    return response.json()


def hkd(cents: Any) -> str:
    return f"{int(cents) / 100:.2f}" if isinstance(cents, int) else ""


def active_hkd_prices_for_product(session: requests.Session, product_id: str) -> list[dict[str, Any]]:
    payload = get(session, "prices", {"product": product_id, "active": "true", "currency": "hkd", "limit": "100"})
    data = payload.get("data")
    return [price for price in data if isinstance(price, dict) and price.get("type") == "one_time"] if isinstance(data, list) else []


def decimal_cents(value: str) -> int:
    return int(Decimal(value) * 100)


def main() -> None:
    api_key = os.environ.get("STRIPE_SECRET_KEY")
    if not api_key:
        raise SystemExit("STRIPE_SECRET_KEY is required")
    with INPUT.open("r", encoding="utf-8-sig", newline="") as handle:
        csv_rows = list(csv.DictReader(handle))
    session = requests.Session()
    session.auth = (api_key, "")
    records: list[dict[str, Any]] = []
    for row_number, row in enumerate(csv_rows, start=2):
        product_id = text(row.get("product_id"))
        source_price_id = text(row.get("price_id"))
        record: dict[str, Any] = {
            "csv_row": row_number,
            "product_id": product_id,
            "source_csv_price_id": source_price_id,
            "current_active_price_id": "",
            "mofu_sku": text(row.get("mofu_sku")),
            "product_name": text(row.get("product_name")),
            "cost_cny": text(row.get("cost_cny")),
            "proposed_hkd": text(row.get("proposed_hkd")),
            "csv_target_cents": "",
            "current_live_hkd": "",
            "mapping_status": "blocked",
            "mapping_basis": "",
            "issue": "",
        }
        try:
            source = get(session, f"prices/{source_price_id}")
            product = get(session, f"products/{product_id}")
            if source.get("product") != product_id:
                raise ValueError("CSV Price.product does not match CSV product_id")
            if not product.get("active"):
                raise ValueError("Stripe Product is inactive")
            product_sku = text((product.get("metadata") or {}).get("mofu_sku"))
            if record["mofu_sku"] and product_sku and record["mofu_sku"] != product_sku:
                raise ValueError("CSV mofu_sku does not match active Stripe Product")
            candidates = active_hkd_prices_for_product(session, product_id)
            if source.get("active") is True and source.get("currency") == "hkd" and source.get("type") == "one_time":
                current = source
                record["mapping_status"] = "eligible_exact_active_price"
                record["mapping_basis"] = "exact CSV Price ID remains active"
            else:
                matching = [price for price in candidates if price.get("metadata") == source.get("metadata")]
                if len(matching) != 1:
                    raise ValueError(f"Expected one active metadata-identical replacement Price, found {len(matching)}")
                current = matching[0]
                record["mapping_status"] = "eligible_replacement_lineage"
                record["mapping_basis"] = "same Product plus metadata-identical active replacement Price"
            record["current_active_price_id"] = text(current.get("id"))
            record["current_live_hkd"] = hkd(current.get("unit_amount"))
            record["csv_target_cents"] = decimal_cents(record["proposed_hkd"])
        except requests.HTTPError as error:
            record["issue"] = f"Stripe HTTP {error.response.status_code} while reading CSV mapping"
        except (ValueError, ArithmeticError) as error:
            record["issue"] = str(error)
        records.append(record)

    eligible = [record for record in records if record["mapping_status"].startswith("eligible_")]
    duplicate_current_ids = [key for key, count in Counter(record["current_active_price_id"] for record in eligible).items() if key and count > 1]
    if duplicate_current_ids:
        for record in eligible:
            if record["current_active_price_id"] in duplicate_current_ids:
                record["mapping_status"] = "blocked"
                record["issue"] = "Multiple CSV rows map to the same current active Price"
        eligible = [record for record in records if record["mapping_status"].startswith("eligible_")]

    payload = {
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "mode": "strict_csv_replacement_lineage_mapping_no_writes",
        "no_stripe_writes_performed": True,
        "no_formula_recalculation_performed": True,
        "csv_record_count": len(records),
        "eligible_current_active_price_count": len(eligible),
        "blocked_count": len(records) - len(eligible),
        "status_counts": dict(Counter(record["mapping_status"] for record in records)),
        "records": records,
    }
    JSON_OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    with CSV_OUT.open("w", encoding="utf-8-sig", newline="") as handle:
        fields = list(dict.fromkeys(key for record in records for key in record))
        writer = csv.DictWriter(handle, fieldnames=fields, lineterminator="\n")
        writer.writeheader()
        writer.writerows(records)
    lines = [
        "# 固定定價 CSV 與現行 replacement Price 對照\n",
        f"**產生時間（UTC）：** {payload['generated_at_utc']}\n",
        "**方式：** 純讀取 Stripe。CSV 售價與成本保持原值，沒有重新計算、套用匯率或寫入 Stripe。\n",
        "\n| 項目 | 結果 |\n| --- | ---: |\n",
        f"| CSV 資料列 | {payload['csv_record_count']} |\n",
        f"| 可嚴格映射至現行活躍 Price | {payload['eligible_current_active_price_count']} |\n",
        f"| 已阻擋 | {payload['blocked_count']} |\n",
        "\n非活躍 CSV Price 只有在同一 Stripe Product 及完整 metadata 與唯一活躍 replacement Price 相同時，才可對照；任何模糊映射均會被阻擋。完整逐項結果見 CSV。\n",
    ]
    MD_OUT.write_text("".join(lines), encoding="utf-8")
    print(json.dumps({
        "no_stripe_writes_performed": True,
        "eligible_current_active_price_count": len(eligible),
        "blocked_count": len(records) - len(eligible),
        "status_counts": payload["status_counts"],
        "report": str(MD_OUT),
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
