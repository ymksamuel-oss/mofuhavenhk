#!/usr/bin/env python3
"""Persist owner-approved retail-price-derived FX baselines to Stripe Price metadata.

This script NEVER writes cost_cny/cny_cost, unit_amount, active status, or Product fields.
It writes only the explicit `pricing_cost_cny_baseline` fallback used by the automated
pricing policy when a true price/product CNY cost is absent.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from datetime import datetime, timezone
from decimal import Decimal
from pathlib import Path
from typing import Any

import requests

ROOT = Path(__file__).resolve().parents[1]
REPORTS = ROOT / "reports"
PREVIEW = REPORTS / "implied_cost_baseline_preview_1_166_2026-08-27.json"
RESULT = REPORTS / "implied_cost_baseline_registry_result_2026-08-27.json"
REAL_COST_KEYS = ("cost_cny", "cny_cost", "source_cost_cny", "cost_cny_per_product", "supplier_cost_cny", "unit_cost_cny")
BASELINE_KEY = "pricing_cost_cny_baseline"
BASELINE_METHOD_KEY = "pricing_cost_baseline_method"
BASELINE_METHOD_VALUE = "implied_current_retail_1.166_x_1.76_v1"


def text(value: Any) -> str:
    return str(value).strip() if value is not None else ""


def get(session: requests.Session, path: str) -> dict[str, Any]:
    response = session.get(f"https://api.stripe.com/v1/{path}", timeout=60)
    response.raise_for_status()
    return response.json()


def post(session: requests.Session, path: str, data: list[tuple[str, str]], idempotency_key: str) -> dict[str, Any]:
    response = session.post(
        f"https://api.stripe.com/v1/{path}",
        data=data,
        headers={"Idempotency-Key": idempotency_key},
        timeout=60,
    )
    response.raise_for_status()
    return response.json()


def has_real_cost(metadata: Any) -> bool:
    return isinstance(metadata, dict) and any(text(metadata.get(key)) for key in REAL_COST_KEYS)


def write_result(result: dict[str, Any]) -> None:
    RESULT.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="perform owner-approved metadata writes")
    args = parser.parse_args()
    api_key = os.environ.get("STRIPE_SECRET_KEY")
    if not api_key:
        raise SystemExit("STRIPE_SECRET_KEY is required")
    preview = json.loads(PREVIEW.read_text(encoding="utf-8"))
    records = preview.get("records")
    if not isinstance(records, list) or len(records) != 105:
        raise RuntimeError("Expected the approved 105-record implied-baseline preview")
    if any(record.get("data_classification") != "implied_from_current_retail_not_verified_purchase_cost" for record in records):
        raise RuntimeError("Preview includes an invalid data classification")

    session = requests.Session()
    session.auth = (api_key, "")
    result: dict[str, Any] = {
        "mode": "apply" if args.apply else "dry_run_preflight",
        "purpose": "owner-approved daily FX pricing fallback from existing retail price; not true purchase cost",
        "no_price_amount_change": True,
        "no_real_cost_metadata_written": True,
        "started_at_utc": datetime.now(timezone.utc).isoformat(),
        "records": [],
    }
    try:
        # Validate every target before the first write.
        for record in records:
            price = get(session, f"prices/{record['price_id']}")
            product = get(session, f"products/{record['product_id']}")
            metadata = price.get("metadata") or {}
            if not price.get("active") or price.get("currency") != "hkd" or not product.get("active"):
                raise RuntimeError(f"Product or Price is no longer active: {record['price_id']}")
            if price.get("product") != record["product_id"]:
                raise RuntimeError(f"Product/Price relationship changed: {record['price_id']}")
            expected_cents = int(Decimal(record["current_hkd"]) * 100)
            if price.get("unit_amount") != expected_cents:
                raise RuntimeError(f"Current price changed since preview: {record['price_id']}")
            if has_real_cost(metadata):
                raise RuntimeError(f"A true CNY cost now exists; inferred baseline must not replace it: {record['price_id']}")
            previous_baseline = text(metadata.get(BASELINE_KEY))
            if previous_baseline and previous_baseline != record["implied_cost_cny_baseline"]:
                raise RuntimeError(f"A different inferred baseline already exists: {record['price_id']}")

        result["preflight_passed_at_utc"] = datetime.now(timezone.utc).isoformat()
        for record in records:
            result["records"].append({
                "price_id": record["price_id"],
                "product_id": record["product_id"],
                "mofu_sku": record["mofu_sku"],
                "current_hkd": record["current_hkd"],
                "implied_cost_cny_baseline": record["implied_cost_cny_baseline"],
                "status": "would_write_baseline" if not args.apply else "pending",
            })

        if args.apply:
            for item in result["records"]:
                price = get(session, f"prices/{item['price_id']}")
                metadata = price.get("metadata") or {}
                if text(metadata.get(BASELINE_KEY)) == item["implied_cost_cny_baseline"]:
                    item["status"] = "already_written"
                else:
                    suffix = hashlib.sha256(f"{item['price_id']}:{item['implied_cost_cny_baseline']}".encode()).hexdigest()[:16]
                    updated = post(
                        session,
                        f"prices/{item['price_id']}",
                        [
                            (f"metadata[{BASELINE_KEY}]", item["implied_cost_cny_baseline"]),
                            (f"metadata[{BASELINE_METHOD_KEY}]", BASELINE_METHOD_VALUE),
                        ],
                        f"mofu-implied-fx-baseline-{item['price_id']}-{suffix}",
                    )
                    updated_metadata = updated.get("metadata") or {}
                    if updated.get("unit_amount") != price.get("unit_amount"):
                        raise RuntimeError(f"Unexpected amount change while writing baseline: {item['price_id']}")
                    if text(updated_metadata.get(BASELINE_KEY)) != item["implied_cost_cny_baseline"]:
                        raise RuntimeError(f"Baseline did not persist: {item['price_id']}")
                    if text(updated_metadata.get(BASELINE_METHOD_KEY)) != BASELINE_METHOD_VALUE:
                        raise RuntimeError(f"Baseline method did not persist: {item['price_id']}")
                    item["status"] = "baseline_written"
                item["completed_at_utc"] = datetime.now(timezone.utc).isoformat()
                write_result(result)

        result["completed_at_utc"] = datetime.now(timezone.utc).isoformat()
        result["status_counts"] = {
            status: sum(item["status"] == status for item in result["records"])
            for status in sorted({item["status"] for item in result["records"]})
        }
        write_result(result)
        print(json.dumps({
            "mode": result["mode"],
            "preflight_passed": True,
            "no_price_amount_change": True,
            "no_real_cost_metadata_written": True,
            "status_counts": result["status_counts"],
            "result": str(RESULT),
        }, ensure_ascii=False, indent=2))
    except Exception as error:
        result["error"] = str(error)
        result["failed_at_utc"] = datetime.now(timezone.utc).isoformat()
        write_result(result)
        raise


if __name__ == "__main__":
    main()
