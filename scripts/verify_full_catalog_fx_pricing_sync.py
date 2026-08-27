#!/usr/bin/env python3
"""Read-only verification for the latest owner-approved full catalog FX sync."""
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
SYNC_RESULT = REPORTS / "fx_pricing_sync_20260826_applied.json"
JSON_OUT = REPORTS / "fx_pricing_full_catalog_verification_2026-08-27.json"
CSV_OUT = REPORTS / "fx_pricing_full_catalog_verification_2026-08-27.csv"
MD_OUT = REPORTS / "fx_pricing_full_catalog_verification_2026-08-27.md"
BASELINE_KEY = "pricing_cost_cny_baseline"
REAL_COST_KEYS = ("cost_cny", "cny_cost", "source_cost_cny", "cost_cny_per_product", "supplier_cost_cny", "unit_cost_cny")


def text(value: Any) -> str:
    return str(value).strip() if value is not None else ""


def hkd(cents: Any) -> str:
    return f"{int(cents) / 100:.2f}" if isinstance(cents, int) else ""


def get(session: requests.Session, path: str) -> dict[str, Any]:
    response = session.get(f"https://api.stripe.com/v1/{path}", timeout=60)
    response.raise_for_status()
    return response.json()


def main() -> None:
    api_key = os.environ.get("STRIPE_SECRET_KEY")
    if not api_key:
        raise SystemExit("STRIPE_SECRET_KEY is required")
    sync = json.loads(SYNC_RESULT.read_text(encoding="utf-8"))
    operations = sync.get("operations")
    if sync.get("mode") != "applied" or not isinstance(operations, list):
        raise RuntimeError("Expected an applied FX pricing result with operation records")
    changed = [operation for operation in operations if operation.get("status") == "replaced"]
    if len(changed) != 105 or sync.get("failedPriceCount") != 0:
        raise RuntimeError(f"Expected 105 successful replacements and zero failures, found {len(changed)}")

    session = requests.Session()
    session.auth = (api_key, "")
    records: list[dict[str, Any]] = []
    for operation in changed:
        source = get(session, f"prices/{operation['sourcePriceId']}")
        replacement = get(session, f"prices/{operation['replacementPriceId']}")
        product = get(session, f"products/{operation['productId']}")
        replacement_metadata = replacement.get("metadata") or {}
        has_price_input = bool(text(replacement_metadata.get(BASELINE_KEY))) or any(text(replacement_metadata.get(key)) for key in REAL_COST_KEYS)
        default_id = text(product.get("default_price"))
        default_ok = default_id == replacement["id"] if operation.get("defaultPriceSwitched") else True
        verified = (
            source.get("active") is False
            and replacement.get("active") is True
            and replacement.get("currency") == "hkd"
            and replacement.get("unit_amount") == operation["newCents"]
            and source.get("unit_amount") == operation["oldCents"]
            and default_ok
            and has_price_input
        )
        records.append({
            "product_id": operation["productId"],
            "mofu_sku": text((product.get("metadata") or {}).get("mofu_sku")),
            "product_name": text(product.get("name")),
            "source_price_id": source["id"],
            "replacement_price_id": replacement["id"],
            "old_hkd": hkd(source.get("unit_amount")),
            "new_hkd": hkd(replacement.get("unit_amount")),
            "pricing_input_kind": "implied_cost_cny_baseline" if text(replacement_metadata.get(BASELINE_KEY)) else "verified_cny_cost",
            "source_inactive": source.get("active") is False,
            "replacement_active": replacement.get("active") is True,
            "default_price_correct": default_ok,
            "price_amount_correct": replacement.get("unit_amount") == operation["newCents"],
            "verified": verified,
        })

    records.sort(key=lambda row: (row["mofu_sku"], row["replacement_price_id"]))
    payload = {
        "audited_at_utc": datetime.now(timezone.utc).isoformat(),
        "no_stripe_writes_performed": True,
        "rate_date": sync.get("rateDate"),
        "rate_hkd_per_cny": sync.get("rateHkdPerCny"),
        "active_product_count": sync.get("activeProductCount"),
        "eligible_price_count": sync.get("eligiblePriceCount"),
        "missing_cost_price_count": sync.get("missingCostPriceCount"),
        "unchanged_price_count": sync.get("unchangedPriceCount"),
        "replacement_price_count": len(records),
        "verified_count": sum(bool(record["verified"]) for record in records),
        "failed_count": sum(not bool(record["verified"]) for record in records),
        "records": records,
    }
    if payload["failed_count"]:
        raise RuntimeError(f"Verification failed for {payload['failed_count']} Price records")
    JSON_OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    with CSV_OUT.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(records[0]), lineterminator="\n")
        writer.writeheader()
        writer.writerows(records)
    lines = [
        "# Mofu Haven HK 全站外匯定價同步最終核對\n",
        f"**核對時間（UTC）：** {payload['audited_at_utc']}\n",
        "**方式：** 唯讀 Stripe 核對；本程序不會建立、更新或停用任何 Stripe 物件。\n",
        "\n| 項目 | 結果 |\n| --- | ---: |\n",
        f"| 活躍產品 | {payload['active_product_count']} |\n",
        f"| 自動定價可計算 Price | {payload['eligible_price_count']} |\n",
        f"| 仍未納入定價範圍 | {payload['missing_cost_price_count']} |\n",
        f"| 本次 replacement Price | {payload['replacement_price_count']} |\n",
        f"| 來源停用、新 Price 活躍、金額及預設價格關係均通過 | {payload['verified_count']} |\n",
        f"| 核對失敗 | {payload['failed_count']} |\n",
        "\n反向推算基準以獨立 `pricing_cost_cny_baseline` metadata 記錄；真實 CNY 成本保持優先。完整逐項清單見 CSV。\n",
    ]
    MD_OUT.write_text("".join(lines), encoding="utf-8")
    print(json.dumps({
        "no_stripe_writes_performed": True,
        "replacement_price_count": len(records),
        "verified_count": payload["verified_count"],
        "failed_count": payload["failed_count"],
        "csv": str(CSV_OUT),
        "markdown": str(MD_OUT),
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
