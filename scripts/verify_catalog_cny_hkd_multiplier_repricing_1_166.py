#!/usr/bin/env python3
"""Read-only verification of the completed owner-approved 1.166 repricing run."""
from __future__ import annotations

import csv
import json
import os
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

ROOT = Path(__file__).resolve().parents[1]
REPORTS = ROOT / "reports"
MANIFEST_PATH = REPORTS / "catalog_cny_hkd_multiplier_apply_manifest_1_166_2026-08-27.json"
APPLY_PATH = REPORTS / "catalog_cny_hkd_multiplier_apply_result_1_166_2026-08-27.json"
JSON_OUT = REPORTS / "catalog_cny_hkd_multiplier_final_verification_1_166_2026-08-27.json"
CSV_OUT = REPORTS / "catalog_cny_hkd_multiplier_final_verification_1_166_2026-08-27.csv"
MD_OUT = REPORTS / "catalog_cny_hkd_multiplier_final_verification_1_166_2026-08-27.md"
STRIPE_BASE_URL = "https://api.stripe.com/v1"

SESSION = requests.Session()
SESSION.mount(
    "https://",
    HTTPAdapter(max_retries=Retry(total=3, connect=3, read=0, status=0, backoff_factor=0.5, allowed_methods=frozenset({"GET"}))),
)


def text(value: Any) -> str:
    return str(value).strip() if value is not None else ""


def get(api_key: str, path: str) -> dict[str, Any]:
    response = SESSION.get(f"{STRIPE_BASE_URL}/{path}", auth=(api_key, ""), timeout=60)
    response.raise_for_status()
    payload = response.json()
    if not isinstance(payload, dict):
        raise RuntimeError(f"Unexpected Stripe response: {path}")
    return payload


def hkd(cents: Any) -> str:
    return f"{int(cents) / 100:.2f}" if isinstance(cents, int) else ""


def main() -> None:
    api_key = os.environ.get("STRIPE_SECRET_KEY")
    if not api_key:
        raise SystemExit("STRIPE_SECRET_KEY is required")
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    apply = json.loads(APPLY_PATH.read_text(encoding="utf-8"))
    if apply.get("mode") != "apply" or apply.get("no_stripe_writes_performed") is not False:
        raise RuntimeError("Apply result does not prove a completed write run")
    operations = apply.get("price_operations")
    if not isinstance(operations, list) or len(operations) != 138:
        raise RuntimeError("Completed apply result does not contain exactly 138 operations")
    if any(operation.get("status") != "replaced" for operation in operations if isinstance(operation, dict)):
        raise RuntimeError("At least one recorded operation was not fully replaced")
    manifest_records = {record["price_id"]: record for record in manifest.get("records") or []}
    if len(manifest_records) != 138:
        raise RuntimeError("Manifest does not contain exactly 138 unique approved source Prices")

    verification_rows: list[dict[str, Any]] = []
    errors: list[str] = []
    for operation in operations:
        source_id = text(operation.get("source_price_id"))
        replacement_id = text(operation.get("replacement_price_id"))
        record = manifest_records.get(source_id)
        if not record or not replacement_id:
            errors.append(f"invalid_result_record:{source_id}")
            continue
        source = get(api_key, f"prices/{source_id}")
        replacement = get(api_key, f"prices/{replacement_id}")
        product = get(api_key, f"products/{record['product_id']}")
        checks = {
            "source_inactive": source.get("active") is False,
            "source_product_matches": text(source.get("product")) == record["product_id"],
            "source_amount_matches": source.get("unit_amount") == record["old_cents"],
            "replacement_active": replacement.get("active") is True,
            "replacement_product_matches": text(replacement.get("product")) == record["product_id"],
            "replacement_currency_hkd": replacement.get("currency") == "hkd",
            "replacement_one_time": replacement.get("type") == "one_time",
            "replacement_amount_matches": replacement.get("unit_amount") == record["new_cents"],
            "replacement_metadata_matches": (replacement.get("metadata") or {}) == record["replacement_price_metadata"],
            "product_active": product.get("active") is True,
            "default_price_matches": (
                text(product.get("default_price")) == replacement_id
                if record["was_default_price"]
                else text(product.get("default_price")) != source_id
            ),
        }
        passed = all(checks.values())
        if not passed:
            errors.append(f"verification_failed:{source_id}:" + ",".join(key for key, value in checks.items() if not value))
        verification_rows.append({
            "mofu_sku": record["mofu_sku"],
            "product_id": record["product_id"],
            "product_name": record["product_name"],
            "source_price_id": source_id,
            "replacement_price_id": replacement_id,
            "old_hkd": hkd(record["old_cents"]),
            "new_hkd": hkd(record["new_cents"]),
            "cost_cny": record["cost_cny"],
            "was_default_price": bool(record["was_default_price"]),
            "verification_status": "verified" if passed else "failed",
            "failed_checks": ";".join(key for key, value in checks.items() if not value),
        })

    status_counts = Counter(row["verification_status"] for row in verification_rows)
    result = {
        "verified_at_utc": datetime.now(timezone.utc).isoformat(),
        "no_stripe_writes_performed": True,
        "source_manifest": str(MANIFEST_PATH),
        "apply_result": str(APPLY_PATH),
        "approved_scope_price_count": 138,
        "verified_price_count": len(verification_rows),
        "verified_success_count": status_counts.get("verified", 0),
        "verified_failure_count": status_counts.get("failed", 0),
        "default_price_switch_count": sum(bool(row["was_default_price"]) for row in verification_rows),
        "passed": not errors and len(verification_rows) == 138,
        "errors": errors,
        "records": verification_rows,
    }
    JSON_OUT.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    with CSV_OUT.open("w", encoding="utf-8-sig", newline="") as handle:
        fields = list(verification_rows[0]) if verification_rows else ["verification_status"]
        writer = csv.DictWriter(handle, fieldnames=fields, lineterminator="\n")
        writer.writeheader()
        writer.writerows(verification_rows)
    lines = [
        "# Mofu Haven HK 定價更新最終 Stripe 核對\n",
        f"**核對時間（UTC）：** {result['verified_at_utc']}\n",
        "**核對方式：** 純讀取 Stripe；本核對不會建立、更新或停用任何 Stripe 物件。\n",
        "\n| 項目 | 結果 |\n| --- | ---: |\n",
        f"| 已批准 replacement Price 範圍 | {result['approved_scope_price_count']} |\n",
        f"| 已逐項核對完成 | {result['verified_price_count']} |\n",
        f"| replacement Price、預設價格及舊 Price 狀態全部通過 | {result['verified_success_count']} |\n",
        f"| 核對失敗 | {result['verified_failure_count']} |\n",
        f"| 已切換 Product.default_price | {result['default_price_switch_count']} |\n",
        f"| 最終結論 | {'通過' if result['passed'] else '失敗，請檢查 JSON 的 errors'} |\n",
        "\n完整逐項清單見同日 CSV，包含每個來源／replacement Price ID、舊新價格、成本、預設 Price 狀態與核對結果。\n",
    ]
    MD_OUT.write_text("".join(lines), encoding="utf-8")
    print(json.dumps({
        "no_stripe_writes_performed": True,
        "verified_price_count": result["verified_price_count"],
        "verified_success_count": result["verified_success_count"],
        "verified_failure_count": result["verified_failure_count"],
        "default_price_switch_count": result["default_price_switch_count"],
        "passed": result["passed"],
        "json": str(JSON_OUT),
        "csv": str(CSV_OUT),
        "markdown": str(MD_OUT),
    }, ensure_ascii=False, indent=2))
    if not result["passed"]:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
