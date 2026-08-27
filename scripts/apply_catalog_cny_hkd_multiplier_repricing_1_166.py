#!/usr/bin/env python3
"""Apply the owner-approved 1.166 × 1.76 CNY repricing manifest to Stripe.

Default operation is a zero-write preflight. The --apply option is only for the
explicitly approved 138-record scope. Each source Price is re-read and checked
before *any* writes. For every Price, Stripe's immutable-price model is respected:
create a metadata-preserving replacement, switch default_price when necessary, then
deactivate the source Price. A granular local result file supports controlled recovery.
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
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

ROOT = Path(__file__).resolve().parents[1]
REPORTS = ROOT / "reports"
MANIFEST_PATH = REPORTS / "catalog_cny_hkd_multiplier_apply_manifest_1_166_2026-08-27.json"
RESULT_PATH = REPORTS / "catalog_cny_hkd_multiplier_apply_result_1_166_2026-08-27.json"
LOCK_PATH = REPORTS / ".catalog_cny_hkd_multiplier_apply_1_166.lock"
STRIPE_BASE_URL = "https://api.stripe.com/v1"
STRIPE_SESSION = requests.Session()
STRIPE_SESSION.mount(
    "https://",
    HTTPAdapter(
        max_retries=Retry(
            total=3,
            connect=3,
            read=0,
            status=0,
            backoff_factor=0.5,
            allowed_methods=frozenset({"GET", "POST"}),
        )
    ),
)


def text(value: Any) -> str:
    return str(value).strip() if value is not None else ""


def manifest_digest(manifest: dict[str, Any]) -> str:
    copy = dict(manifest)
    copy.pop("integrity_sha256", None)
    return hashlib.sha256(
        json.dumps(copy, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")
    ).hexdigest()


def get(api_key: str, path: str) -> dict[str, Any]:
    response = STRIPE_SESSION.get(f"{STRIPE_BASE_URL}/{path}", auth=(api_key, ""), timeout=60)
    response.raise_for_status()
    payload = response.json()
    if not isinstance(payload, dict):
        raise RuntimeError(f"Unexpected Stripe response for {path}")
    return payload


def post(api_key: str, path: str, data: list[tuple[str, str]], idempotency_key: str) -> dict[str, Any]:
    response = STRIPE_SESSION.post(
        f"{STRIPE_BASE_URL}/{path}",
        auth=(api_key, ""),
        data=data,
        headers={"Idempotency-Key": idempotency_key},
        timeout=60,
    )
    response.raise_for_status()
    payload = response.json()
    if not isinstance(payload, dict):
        raise RuntimeError(f"Unexpected Stripe response for {path}")
    return payload


def metadata_payload(metadata: dict[str, str]) -> list[tuple[str, str]]:
    return [(f"metadata[{key}]", text(value)) for key, value in sorted(metadata.items())]


def replacement_payload(record: dict[str, Any]) -> list[tuple[str, str]]:
    payload: list[tuple[str, str]] = [
        ("unit_amount", str(record["new_cents"])),
        ("currency", "hkd"),
        ("product", record["product_id"]),
        ("active", "true"),
    ]
    if text(record.get("source_price_nickname")):
        payload.append(("nickname", text(record["source_price_nickname"])))
    if text(record.get("source_price_tax_behavior")):
        payload.append(("tax_behavior", text(record["source_price_tax_behavior"])))
    payload.extend(metadata_payload(record["replacement_price_metadata"]))
    return payload


def verify_record(api_key: str, record: dict[str, Any]) -> tuple[dict[str, Any], dict[str, Any]]:
    price = get(api_key, f"prices/{record['price_id']}")
    product = get(api_key, f"products/{record['product_id']}")
    if not price.get("active") or price.get("currency") != "hkd" or price.get("type") != "one_time":
        raise RuntimeError(f"Source Price no longer active one-time HKD: {record['price_id']}")
    if text(price.get("product")) != record["product_id"]:
        raise RuntimeError(f"Source Product mismatch: {record['price_id']}")
    if price.get("unit_amount") != record["old_cents"]:
        raise RuntimeError(f"Source amount changed: {record['price_id']}")
    if (price.get("metadata") or {}) != record["source_price_metadata"]:
        raise RuntimeError(f"Source Price metadata changed: {record['price_id']}")
    if not product.get("active"):
        raise RuntimeError(f"Product inactive: {record['product_id']}")
    default_id = text(product.get("default_price"))
    if bool(record["was_default_price"]) != (default_id == record["price_id"]):
        raise RuntimeError(f"Default Price relationship changed: {record['price_id']}")
    if len(record["replacement_price_metadata"]) > 50:
        raise RuntimeError(f"Replacement metadata capacity exceeded: {record['price_id']}")
    return price, product


def acquire_lock() -> None:
    try:
        fd = os.open(LOCK_PATH, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
    except FileExistsError as error:
        raise RuntimeError(f"Apply lock already exists: {LOCK_PATH}") from error
    with os.fdopen(fd, "w", encoding="utf-8") as handle:
        handle.write(f"pid={os.getpid()}\nstarted_at_utc={datetime.now(timezone.utc).isoformat()}\n")


def release_lock() -> None:
    LOCK_PATH.unlink(missing_ok=True)


def persist(result: dict[str, Any]) -> None:
    RESULT_PATH.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Preflight or apply approved Mofu CNY 1.166 repricing")
    parser.add_argument("--apply", action="store_true", help="Perform Stripe writes after explicit owner approval")
    args = parser.parse_args()

    api_key = os.environ.get("STRIPE_SECRET_KEY")
    if not api_key:
        raise SystemExit("STRIPE_SECRET_KEY is required")
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    if manifest.get("mode") != "EXPLICIT_OWNER_APPROVAL_RECEIVED_READY_FOR_APPLY":
        raise RuntimeError("Manifest is not approved for apply")
    if manifest.get("record_count") != 138 or len(manifest.get("records") or []) != 138:
        raise RuntimeError("Approved record count is not exactly 138")
    expected_digest = text(manifest.get("integrity_sha256"))
    if not expected_digest or expected_digest != manifest_digest(manifest):
        raise RuntimeError("Manifest integrity digest mismatch")
    if (manifest.get("policy") or {}).get("formula") != "retail_hkd = ceil_to_.90(cost_cny × 1.166 × 1.76)":
        raise RuntimeError("Manifest does not match the approved pricing formula")

    result: dict[str, Any] = {
        "mode": "apply" if args.apply else "dry_run_preflight",
        "no_stripe_writes_performed": not args.apply,
        "started_at_utc": datetime.now(timezone.utc).isoformat(),
        "source_manifest": str(MANIFEST_PATH),
        "source_manifest_integrity_sha256": expected_digest,
        "expected_record_count": 138,
        "price_operations": [],
        "rollback_instructions": "For each fully replaced record: re-activate source_price_id; if default_price_was_switched is true restore Product.default_price to source_price_id; then deactivate replacement_price_id. First inspect every listed operation status and only reverse completed replacements.",
    }

    try:
        # Atomicity guard: every record must still match its preview snapshot before the first write.
        for record in manifest["records"]:
            verify_record(api_key, record)
        result["preflight_passed_at_utc"] = datetime.now(timezone.utc).isoformat()
        if not args.apply:
            result["price_operations"] = [{
                "source_price_id": record["price_id"],
                "product_id": record["product_id"],
                "mofu_sku": record["mofu_sku"],
                "old_cents": record["old_cents"],
                "new_cents": record["new_cents"],
                "was_default_price": record["was_default_price"],
                "status": "would_create_replacement_then_deactivate_source",
            } for record in manifest["records"]]
            result["completed_at_utc"] = datetime.now(timezone.utc).isoformat()
            persist(result)
            print(json.dumps({
                "mode": result["mode"],
                "preflight_passed": True,
                "would_replace_prices": len(result["price_operations"]),
                "result": str(RESULT_PATH),
            }, ensure_ascii=False, indent=2))
            return

        acquire_lock()
        try:
            for record in manifest["records"]:
                operation: dict[str, Any] = {
                    "product_id": record["product_id"],
                    "product_name": record["product_name"],
                    "mofu_sku": record["mofu_sku"],
                    "source_price_id": record["price_id"],
                    "old_cents": record["old_cents"],
                    "new_cents": record["new_cents"],
                    "cost_cny": record["cost_cny"],
                    "cost_source": record["cost_source"],
                    "default_price_was_switched": bool(record["was_default_price"]),
                    "status": "started",
                }
                result["price_operations"].append(operation)
                persist(result)
                replacement = post(
                    api_key,
                    "prices",
                    replacement_payload(record),
                    f"mofu-cny1166-create-{record['price_id']}-{expected_digest[:12]}",
                )
                replacement_id = text(replacement.get("id"))
                if not replacement_id or replacement.get("unit_amount") != record["new_cents"]:
                    raise RuntimeError(f"Replacement Price invalid: {record['price_id']}")
                operation["replacement_price_id"] = replacement_id
                operation["status"] = "replacement_created"
                persist(result)
                if record["was_default_price"]:
                    updated = post(
                        api_key,
                        f"products/{record['product_id']}",
                        [("default_price", replacement_id)],
                        f"mofu-cny1166-default-{record['product_id']}-{record['price_id']}-{expected_digest[:12]}",
                    )
                    if text(updated.get("default_price")) != replacement_id:
                        raise RuntimeError(f"Default Price switch did not persist: {record['product_id']}")
                    operation["status"] = "default_price_switched"
                    persist(result)
                deactivated = post(
                    api_key,
                    f"prices/{record['price_id']}",
                    [("active", "false")],
                    f"mofu-cny1166-deactivate-{record['price_id']}-{expected_digest[:12]}",
                )
                if deactivated.get("active") is not False:
                    raise RuntimeError(f"Source Price deactivation did not persist: {record['price_id']}")
                operation["status"] = "replaced"
                operation["completed_at_utc"] = datetime.now(timezone.utc).isoformat()
                persist(result)
        finally:
            release_lock()
        result["completed_at_utc"] = datetime.now(timezone.utc).isoformat()
        persist(result)
        print(json.dumps({
            "mode": result["mode"],
            "preflight_passed": True,
            "replaced_prices": sum(item["status"] == "replaced" for item in result["price_operations"]),
            "default_prices_switched": sum(bool(item["default_price_was_switched"]) for item in result["price_operations"] if item["status"] == "replaced"),
            "result": str(RESULT_PATH),
        }, ensure_ascii=False, indent=2))
    except Exception as error:
        result["error"] = str(error)
        result["failed_at_utc"] = datetime.now(timezone.utc).isoformat()
        persist(result)
        raise


if __name__ == "__main__":
    main()
