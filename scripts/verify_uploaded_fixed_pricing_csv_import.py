#!/usr/bin/env python3
"""Read-only verification of the owner-supplied fixed pricing CSV Stripe import."""
from __future__ import annotations

import csv
import json
import os
from datetime import datetime, timezone
from decimal import Decimal
from pathlib import Path
from typing import Any

import requests

ROOT = Path(__file__).resolve().parents[1]
INPUT = Path("/home/ubuntu/upload/recalculated_pricing_output.csv")
RESULT = ROOT / "reports" / "recalculated_pricing_output_apply_result_2026-08-27.json"
JSON_OUT = ROOT / "reports" / "recalculated_pricing_output_final_verification_2026-08-27.json"
CSV_OUT = ROOT / "reports" / "recalculated_pricing_output_final_verification_2026-08-27.csv"
MD_OUT = ROOT / "reports" / "recalculated_pricing_output_final_verification_2026-08-27.md"
IMPLIED_KEYS = ("pricing_cost_cny_baseline", "pricing_cost_baseline_method")


def text(value: Any) -> str:
    return str(value).strip() if value is not None else ""


def get(session: requests.Session, path: str) -> dict[str, Any]:
    response = session.get(f"https://api.stripe.com/v1/{path}", timeout=60)
    response.raise_for_status()
    return response.json()


def hkd(cents: int) -> str:
    return f"{cents / 100:.2f}"


def main() -> None:
    api_key = os.environ.get("STRIPE_SECRET_KEY")
    if not api_key:
        raise SystemExit("STRIPE_SECRET_KEY is required")
    with INPUT.open("r", encoding="utf-8-sig", newline="") as handle:
        csv_by_source = {text(row.get("price_id")): row for row in csv.DictReader(handle)}
    apply = json.loads(RESULT.read_text(encoding="utf-8"))
    records = apply.get("records")
    if apply.get("mode") != "apply" or not isinstance(records, list) or len(records) != 121:
        raise RuntimeError("Expected a completed 121-record fixed CSV import result")

    session = requests.Session()
    session.auth = (api_key, "")
    verification: list[dict[str, Any]] = []
    for item in records:
        source_csv_id = text(item.get("source_csv_price_id"))
        csv_row = csv_by_source.get(source_csv_id)
        if not csv_row:
            raise RuntimeError(f"Missing source CSV row: {source_csv_id}")
        product = get(session, f"products/{text(item['product_id'])}")
        result_price = get(session, f"prices/{text(item['result_price_id'])}")
        source = get(session, f"prices/{text(item['source_current_price_id'])}")
        metadata = result_price.get("metadata") or {}
        expected_cents = int(Decimal(text(csv_row["proposed_hkd"])) * 100)
        was_replacement = item.get("status") == "replacement_price_created"
        expected_default = text(product.get("default_price")) == result_price["id"] if bool(item.get("default_price_switched")) else True
        verified = (
            product.get("active") is True
            and result_price.get("active") is True
            and result_price.get("currency") == "hkd"
            and result_price.get("unit_amount") == expected_cents
            and text(metadata.get("cost_cny")) == text(csv_row["cost_cny"])
            and not any(text(metadata.get(key)) for key in IMPLIED_KEYS)
            and (not was_replacement or source.get("active") is False)
            and expected_default
        )
        verification.append({
            "csv_row": item["csv_row"],
            "product_id": item["product_id"],
            "mofu_sku": text(csv_row.get("mofu_sku")),
            "product_name": text(csv_row.get("product_name")),
            "source_csv_price_id": source_csv_id,
            "result_price_id": result_price["id"],
            "csv_cost_cny": text(csv_row["cost_cny"]),
            "stripe_cost_cny": text(metadata.get("cost_cny")),
            "csv_proposed_hkd": text(csv_row["proposed_hkd"]),
            "stripe_hkd": hkd(int(result_price["unit_amount"])),
            "write_action": item["status"],
            "source_inactive_when_replaced": (not was_replacement) or source.get("active") is False,
            "default_price_correct": expected_default,
            "implied_baseline_removed": not any(text(metadata.get(key)) for key in IMPLIED_KEYS),
            "verified": verified,
        })

    verification.sort(key=lambda row: (row["mofu_sku"], row["result_price_id"]))
    payload = {
        "verified_at_utc": datetime.now(timezone.utc).isoformat(),
        "mode": "read_only_fixed_csv_import_verification",
        "no_stripe_writes_performed": True,
        "no_formula_recalculation_performed": True,
        "input_csv_record_count": len(verification),
        "verified_count": sum(bool(row["verified"]) for row in verification),
        "failed_count": sum(not bool(row["verified"]) for row in verification),
        "replacement_price_created_count": sum(row["write_action"] == "replacement_price_created" for row in verification),
        "metadata_only_updated_count": sum(row["write_action"] == "updated_metadata_only" for row in verification),
        "records": verification,
    }
    if payload["failed_count"]:
        raise RuntimeError(f"Final fixed CSV verification failed for {payload['failed_count']} record(s)")
    JSON_OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    with CSV_OUT.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(verification[0]), lineterminator="\n")
        writer.writeheader()
        writer.writerows(verification)
    lines = [
        "# 店主固定售價 CSV 匯入最終核對\n",
        f"**核對時間（UTC）：** {payload['verified_at_utc']}\n",
        "**方式：** 唯讀 Stripe 核對；沒有重新計算、不讀取匯率、沒有建立、更新或停用任何 Stripe 物件。\n",
        "\n| 項目 | 結果 |\n| --- | ---: |\n",
        f"| CSV 匯入記錄 | {payload['input_csv_record_count']} |\n",
        f"| replacement Price 已建立 | {payload['replacement_price_created_count']} |\n",
        f"| 現有 Price metadata 已更新 | {payload['metadata_only_updated_count']} |\n",
        f"| 售價、cost_cny、Price 狀態及預設價格關係全部通過 | {payload['verified_count']} |\n",
        f"| 核對失敗 | {payload['failed_count']} |\n",
        "\n每項 `proposed_hkd` 及 `cost_cny` 均直接等於上載 CSV 原值；既有反向定價基準 metadata 已移除。完整逐項清單見 CSV。\n",
    ]
    MD_OUT.write_text("".join(lines), encoding="utf-8")
    print(json.dumps({
        "no_stripe_writes_performed": True,
        "verified_count": payload["verified_count"],
        "failed_count": payload["failed_count"],
        "csv": str(CSV_OUT),
        "markdown": str(MD_OUT),
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
