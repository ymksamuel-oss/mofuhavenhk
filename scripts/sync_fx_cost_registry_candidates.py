#!/usr/bin/env python3
"""Safely persist five already-reviewed CNY costs to current Stripe Price metadata.

The default is a no-write preflight. --apply must only be used after the full
current-state checks succeed; it never changes unit_amount, Product data, or Price activity.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import requests

ROOT = Path(__file__).resolve().parents[1]
REPORTS = ROOT / "reports"
MANIFEST = REPORTS / "fx_cost_registry_sync_manifest_2026-08-27.json"
RESULT = REPORTS / "fx_cost_registry_sync_result_2026-08-27.json"
COST_KEYS = ("cost_cny", "cny_cost", "source_cost_cny", "cost_cny_per_product", "supplier_cost_cny", "unit_cost_cny")


def text(value: Any) -> str:
    return str(value).strip() if value is not None else ""


def get(session: requests.Session, path: str) -> dict[str, Any]:
    response = session.get(f"https://api.stripe.com/v1/{path}", timeout=60)
    response.raise_for_status()
    return response.json()


def post(session: requests.Session, path: str, data: list[tuple[str, str]], key: str) -> dict[str, Any]:
    response = session.post(
        f"https://api.stripe.com/v1/{path}",
        data=data,
        headers={"Idempotency-Key": key},
        timeout=60,
    )
    response.raise_for_status()
    return response.json()


def has_any_cost(metadata: Any) -> bool:
    return isinstance(metadata, dict) and any(text(metadata.get(key)) for key in COST_KEYS)


def persist(payload: dict[str, Any]) -> None:
    RESULT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    api_key = os.environ.get("STRIPE_SECRET_KEY")
    if not api_key:
        raise SystemExit("STRIPE_SECRET_KEY is required")
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    records = manifest.get("records")
    if not isinstance(records, list) or len(records) != 5 or not manifest.get("no_price_amount_change"):
        raise RuntimeError("Cost registry manifest is not the approved five-record no-price-change scope")
    session = requests.Session()
    session.auth = (api_key, "")
    result: dict[str, Any] = {
        "mode": "apply" if args.apply else "dry_run_preflight",
        "no_price_amount_change": True,
        "started_at_utc": datetime.now(timezone.utc).isoformat(),
        "records": [],
    }
    try:
        # All source objects must be valid before the first metadata write.
        for record in records:
            price = get(session, f"prices/{record['price_id']}")
            product = get(session, f"products/{record['product_id']}")
            if not price.get("active") or price.get("currency") != "hkd" or price.get("unit_amount") != record["expected_current_cents"]:
                raise RuntimeError(f"Source Price current state changed: {record['price_id']}")
            if price.get("product") != record["product_id"] or not product.get("active"):
                raise RuntimeError(f"Product relationship changed: {record['price_id']}")
            if has_any_cost(price.get("metadata")):
                raise RuntimeError(f"Cost now exists; no update required: {record['price_id']}")
        result["preflight_passed_at_utc"] = datetime.now(timezone.utc).isoformat()
        for record in records:
            item = {**record, "status": "would_write_cost_cny" if not args.apply else "started"}
            result["records"].append(item)
        if args.apply:
            for item in result["records"]:
                source_hash = hashlib.sha256(f"{item['price_id']}:{item['cost_cny']}".encode()).hexdigest()[:16]
                updated = post(
                    session,
                    f"prices/{item['price_id']}",
                    [("metadata[cost_cny]", item["cost_cny"])],
                    f"mofu-fx-cost-registry-{item['price_id']}-{source_hash}",
                )
                if updated.get("unit_amount") != item["expected_current_cents"] or text((updated.get("metadata") or {}).get("cost_cny")) != item["cost_cny"]:
                    raise RuntimeError(f"Cost metadata write did not persist: {item['price_id']}")
                item["status"] = "cost_cny_written"
                item["completed_at_utc"] = datetime.now(timezone.utc).isoformat()
                persist(result)
        result["completed_at_utc"] = datetime.now(timezone.utc).isoformat()
        persist(result)
        print(json.dumps({
            "mode": result["mode"],
            "no_price_amount_change": True,
            "preflight_passed": True,
            "records_processed": len(result["records"]),
            "result": str(RESULT),
        }, ensure_ascii=False, indent=2))
    except Exception as error:
        result["error"] = str(error)
        result["failed_at_utc"] = datetime.now(timezone.utc).isoformat()
        persist(result)
        raise


if __name__ == "__main__":
    main()
