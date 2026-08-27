#!/usr/bin/env python3
"""Dry-run or restore a completed fixed-multiplier pricing apply result.

This tool accepts only an apply result created with --apply. It is deliberately
separate from the preview and requires --apply before it changes Stripe.
"""
from __future__ import annotations

import argparse
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import requests

ROOT = Path(__file__).resolve().parents[1]
REPORT_DIR = ROOT / "reports"
APPLY_PATH = REPORT_DIR / "catalog_cny_hkd_multiplier_apply_result_2026-08-27.json"
RESTORE_PATH = REPORT_DIR / "catalog_cny_hkd_multiplier_restore_result_2026-08-27.json"


def get(api_key: str, path: str) -> dict[str, Any]:
    response = requests.get(f"https://api.stripe.com/v1/{path}", auth=(api_key, ""), timeout=60)
    response.raise_for_status()
    return response.json()


def post(api_key: str, path: str, data: list[tuple[str, str]], idempotency: str) -> dict[str, Any]:
    response = requests.post(
        f"https://api.stripe.com/v1/{path}",
        auth=(api_key, ""),
        data=data,
        headers={"Idempotency-Key": idempotency},
        timeout=60,
    )
    response.raise_for_status()
    return response.json()


def persist(payload: dict[str, Any]) -> None:
    RESTORE_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Dry-run or restore an applied Mofu fixed-multiplier price update")
    parser.add_argument("--apply", action="store_true", help="Perform a Stripe rollback after explicit owner approval")
    args = parser.parse_args()
    api_key = os.environ.get("STRIPE_SECRET_KEY")
    if not api_key:
        raise SystemExit("STRIPE_SECRET_KEY is required")
    applied = json.loads(APPLY_PATH.read_text(encoding="utf-8"))
    if applied.get("mode") != "apply" or applied.get("no_stripe_writes_performed") is not False:
        raise RuntimeError("Restore requires a completed apply result created with --apply; preview/dry-run files are invalid")
    replacements = [record for record in applied.get("price_operations", []) if record.get("status") == "replaced"]
    policy_updates = [record for record in applied.get("product_policy_operations", []) if record.get("status") == "updated"]
    result: dict[str, Any] = {
        "mode": "restore" if args.apply else "dry_run",
        "source_apply_result": str(APPLY_PATH),
        "no_stripe_writes_performed": not args.apply,
        "started_at_utc": datetime.now(timezone.utc).isoformat(),
        "product_policy_restorations": [],
        "price_restorations": [],
    }
    try:
        # Verify every replacement still exists before starting a rollback.
        replacement_live: dict[str, dict[str, Any]] = {}
        for record in replacements:
            source = get(api_key, f"prices/{record['source_price_id']}")
            replacement = get(api_key, f"prices/{record['replacement_price_id']}")
            if source.get("active"):
                raise RuntimeError(f"Source Price unexpectedly active: {record['source_price_id']}")
            if not replacement.get("active") or int(replacement.get("unit_amount") or 0) != int(record["new_cents"]):
                raise RuntimeError(f"Replacement Price no longer matches apply result: {record['replacement_price_id']}")
            replacement_live[record["replacement_price_id"]] = replacement
        if not args.apply:
            result["price_restorations"] = [{
                "source_price_id": record["source_price_id"],
                "replacement_price_id": record["replacement_price_id"],
                "status": "would_reactivate_source_switch_default_if_needed_then_deactivate_replacement",
            } for record in replacements]
            result["product_policy_restorations"] = [{
                "product_id": record["product_id"],
                "status": "would_restore_original_policy_metadata_values",
            } for record in policy_updates]
            result["completed_at_utc"] = datetime.now(timezone.utc).isoformat()
            persist(result)
            print(json.dumps({"mode": result["mode"], "would_restore_prices": len(replacements), "would_restore_products": len(policy_updates), "output": str(RESTORE_PATH)}, ensure_ascii=False, indent=2))
            return
        for record in replacements:
            post(api_key, f"prices/{record['source_price_id']}", [("active", "true")], f"mofu-policy-v1-restore-source-{record['source_price_id']}")
            if record["was_default_price"]:
                post(api_key, f"products/{record['product_id']}", [("default_price", record["source_price_id"])], f"mofu-policy-v1-restore-default-{record['product_id']}-{record['source_price_id']}")
            post(api_key, f"prices/{record['replacement_price_id']}", [("active", "false")], f"mofu-policy-v1-restore-deactivate-{record['replacement_price_id']}")
            result["price_restorations"].append({
                "source_price_id": record["source_price_id"],
                "replacement_price_id": record["replacement_price_id"],
                "status": "restored",
            })
            persist(result)
        for record in policy_updates:
            original = record["source_product_metadata"]
            changed_keys = record["proposed_policy_metadata"].keys()
            payload = [(f"metadata[{key}]", str(original.get(key, ""))) for key in changed_keys]
            post(api_key, f"products/{record['product_id']}", payload, f"mofu-policy-v1-restore-metadata-{record['product_id']}")
            result["product_policy_restorations"].append({"product_id": record["product_id"], "status": "restored"})
            persist(result)
        result["completed_at_utc"] = datetime.now(timezone.utc).isoformat()
        persist(result)
        print(json.dumps({"mode": result["mode"], "restored_prices": len(replacements), "restored_products": len(policy_updates), "output": str(RESTORE_PATH)}, ensure_ascii=False, indent=2))
    except Exception as error:
        result["error"] = str(error)
        result["failed_at_utc"] = datetime.now(timezone.utc).isoformat()
        persist(result)
        raise


if __name__ == "__main__":
    main()
