#!/usr/bin/env python3
"""Apply the fixed-multiplier catalog price manifest only after explicit owner approval.

Default mode is dry-run. `--apply` performs Stripe writes and must only be used
following an explicit owner confirmation in the active conversation. It requires
the exact pending manifest, strict source snapshots, idempotency keys, and a
local single-run lock. The result file is the input for the paired restore tool.
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
REPORT_DIR = ROOT / "reports"
MANIFEST_PATH = REPORT_DIR / "catalog_cny_hkd_multiplier_pending_approval_manifest_2026-08-27.json"
APPLY_PATH = REPORT_DIR / "catalog_cny_hkd_multiplier_apply_result_2026-08-27.json"
LOCK_PATH = REPORT_DIR / ".catalog_cny_hkd_multiplier_apply.lock"


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


def manifest_digest(manifest: dict[str, Any]) -> str:
    copy = dict(manifest)
    copy.pop("integrity_sha256", None)
    return hashlib.sha256(json.dumps(copy, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")).hexdigest()


def acquire_lock() -> None:
    try:
        fd = os.open(LOCK_PATH, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
    except FileExistsError as error:
        raise RuntimeError(f"Apply lock already exists: {LOCK_PATH}; inspect/remove only after confirming no run is active") from error
    with os.fdopen(fd, "w", encoding="utf-8") as handle:
        handle.write(f"pid={os.getpid()}\nstarted_at_utc={datetime.now(timezone.utc).isoformat()}\n")


def release_lock() -> None:
    LOCK_PATH.unlink(missing_ok=True)


def metadata_payload(metadata: dict[str, str]) -> list[tuple[str, str]]:
    return [(f"metadata[{key}]", str(value)) for key, value in sorted(metadata.items())]


def check_product_snapshot(live: dict[str, Any], operation: dict[str, Any]) -> None:
    if not live.get("active"):
        raise RuntimeError(f"Product inactive: {operation['product_id']}")
    if (live.get("metadata") or {}) != operation["source_product_metadata"]:
        raise RuntimeError(f"Product metadata changed since preview: {operation['product_id']}")
    proposed = operation["proposed_policy_metadata"]
    if len(live.get("metadata") or {}) + sum(key not in (live.get("metadata") or {}) for key in proposed) > 50:
        raise RuntimeError(f"Product metadata capacity changed/insufficient: {operation['product_id']}")


def check_price_snapshot(live: dict[str, Any], record: dict[str, Any]) -> None:
    if not live.get("active") or live.get("currency") != "hkd":
        raise RuntimeError(f"Source Price is not active HKD: {record['price_id']}")
    if live.get("product") != record["product_id"]:
        raise RuntimeError(f"Source Price Product mismatch: {record['price_id']}")
    if int(live.get("unit_amount") or 0) != int(record["old_cents"]):
        raise RuntimeError(f"Source Price amount changed since preview: {record['price_id']}")
    if (live.get("metadata") or {}) != record["source_price_metadata"]:
        raise RuntimeError(f"Source Price metadata changed since preview: {record['price_id']}")
    if len(record["replacement_price_metadata"]) > 50:
        raise RuntimeError(f"Replacement Price metadata would exceed capacity: {record['price_id']}")


def replacement_price_payload(record: dict[str, Any], source: dict[str, Any]) -> list[tuple[str, str]]:
    payload: list[tuple[str, str]] = [
        ("unit_amount", str(record["new_cents"])),
        ("currency", "hkd"),
        ("product", record["product_id"]),
        ("active", "true"),
    ]
    if source.get("nickname"):
        payload.append(("nickname", str(source["nickname"])))
    if source.get("tax_behavior"):
        payload.append(("tax_behavior", str(source["tax_behavior"])))
    payload.extend(metadata_payload(record["replacement_price_metadata"]))
    return payload


def persist_result(result: dict[str, Any]) -> None:
    APPLY_PATH.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Dry-run or apply an approved Mofu catalog price manifest")
    parser.add_argument("--apply", action="store_true", help="Perform Stripe writes after explicit owner approval")
    args = parser.parse_args()
    api_key = os.environ.get("STRIPE_SECRET_KEY")
    if not api_key:
        raise SystemExit("STRIPE_SECRET_KEY is required")
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    if manifest.get("mode") != "PENDING_EXPLICIT_OWNER_APPROVAL_ONLY" or not manifest.get("approval_required"):
        raise RuntimeError("Unexpected manifest approval state")
    expected_digest = manifest.get("integrity_sha256")
    if not expected_digest or expected_digest != manifest_digest(manifest):
        raise RuntimeError("Pending manifest integrity digest mismatch")
    result: dict[str, Any] = {
        "mode": "apply" if args.apply else "dry_run",
        "source_manifest": str(MANIFEST_PATH),
        "source_manifest_integrity_sha256": expected_digest,
        "no_stripe_writes_performed": not args.apply,
        "started_at_utc": datetime.now(timezone.utc).isoformat(),
        "product_policy_operations": [],
        "price_operations": [],
        "rollback_instructions": "Use restore_catalog_cny_hkd_multiplier_repricing.py with this completed apply result only after confirming the desired rollback scope.",
    }
    try:
        # Strictly preflight everything before any mutation.
        product_sources: dict[str, dict[str, Any]] = {}
        for operation in manifest["product_policy_metadata_operations"]:
            live = get(api_key, f"products/{operation['product_id']}")
            check_product_snapshot(live, operation)
            product_sources[operation["product_id"]] = live
        price_sources: dict[str, dict[str, Any]] = {}
        for record in manifest["records"]:
            source = get(api_key, f"prices/{record['price_id']}")
            check_price_snapshot(source, record)
            price_sources[record["price_id"]] = source
        if not args.apply:
            result["product_policy_operations"] = [{
                "product_id": operation["product_id"],
                "mofu_sku": operation["mofu_sku"],
                "status": "would_update_product_policy_metadata",
                "proposed_policy_metadata": operation["proposed_policy_metadata"],
            } for operation in manifest["product_policy_metadata_operations"]]
            result["price_operations"] = [{
                "product_id": record["product_id"],
                "source_price_id": record["price_id"],
                "mofu_sku": record["mofu_sku"],
                "old_cents": record["old_cents"],
                "new_cents": record["new_cents"],
                "status": "would_create_replacement_then_deactivate_source",
            } for record in manifest["records"]]
            result["completed_at_utc"] = datetime.now(timezone.utc).isoformat()
            persist_result(result)
            print(json.dumps({"mode": result["mode"], "would_update_products": len(result["product_policy_operations"]), "would_replace_prices": len(result["price_operations"]), "output": str(APPLY_PATH)}, ensure_ascii=False, indent=2))
            return

        acquire_lock()
        try:
            for operation in manifest["product_policy_metadata_operations"]:
                response = post(
                    api_key,
                    f"products/{operation['product_id']}",
                    metadata_payload(operation["proposed_policy_metadata"]),
                    f"mofu-policy-v1-product-{operation['product_id']}-{expected_digest[:12]}",
                )
                result["product_policy_operations"].append({
                    "product_id": operation["product_id"],
                    "mofu_sku": operation["mofu_sku"],
                    "status": "updated",
                    "source_product_metadata": operation["source_product_metadata"],
                    "proposed_policy_metadata": operation["proposed_policy_metadata"],
                    "updated_product_metadata": response.get("metadata") or {},
                })
                persist_result(result)
            for record in manifest["records"]:
                source = price_sources[record["price_id"]]
                replacement = post(
                    api_key,
                    "prices",
                    replacement_price_payload(record, source),
                    f"mofu-policy-v1-price-create-{record['price_id']}-{expected_digest[:12]}",
                )
                if record["was_default_price"]:
                    post(
                        api_key,
                        f"products/{record['product_id']}",
                        [("default_price", replacement["id"])],
                        f"mofu-policy-v1-default-{record['product_id']}-{record['price_id']}-{expected_digest[:12]}",
                    )
                post(
                    api_key,
                    f"prices/{record['price_id']}",
                    [("active", "false")],
                    f"mofu-policy-v1-price-deactivate-{record['price_id']}-{expected_digest[:12]}",
                )
                result["price_operations"].append({
                    "product_id": record["product_id"],
                    "mofu_sku": record["mofu_sku"],
                    "source_price_id": record["price_id"],
                    "replacement_price_id": replacement["id"],
                    "old_cents": record["old_cents"],
                    "new_cents": record["new_cents"],
                    "was_default_price": record["was_default_price"],
                    "source_price_metadata": record["source_price_metadata"],
                    "replacement_price_metadata": record["replacement_price_metadata"],
                    "status": "replaced",
                })
                persist_result(result)
        finally:
            release_lock()
        result["completed_at_utc"] = datetime.now(timezone.utc).isoformat()
        persist_result(result)
        print(json.dumps({"mode": result["mode"], "updated_products": len(result["product_policy_operations"]), "replaced_prices": len(result["price_operations"]), "output": str(APPLY_PATH)}, ensure_ascii=False, indent=2))
    except Exception as error:
        result["error"] = str(error)
        result["failed_at_utc"] = datetime.now(timezone.utc).isoformat()
        persist_result(result)
        raise


if __name__ == "__main__":
    main()
