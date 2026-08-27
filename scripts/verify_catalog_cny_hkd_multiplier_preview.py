#!/usr/bin/env python3
"""Independently verify the full catalog fixed-multiplier preview remains read-only."""
from __future__ import annotations

import hashlib
import json
import os
from collections import defaultdict
from pathlib import Path
from typing import Any

import requests

from cny_hkd_multiplier_pricing_policy import retail_cents_from_cny_cost

ROOT = Path(__file__).resolve().parents[1]
REPORT_DIR = ROOT / "reports"
PREVIEW = REPORT_DIR / "catalog_cny_hkd_multiplier_repricing_preview_2026-08-27.json"
MANIFEST = REPORT_DIR / "catalog_cny_hkd_multiplier_pending_approval_manifest_2026-08-27.json"
OUT = REPORT_DIR / "catalog_cny_hkd_multiplier_repricing_preview_integrity_2026-08-27.json"


def api_get(api_key: str, path: str, params: dict[str, str]) -> dict[str, Any]:
    response = requests.get(f"https://api.stripe.com/v1/{path}", params=params, auth=(api_key, ""), timeout=60)
    response.raise_for_status()
    return response.json()


def list_all(api_key: str, path: str, params: dict[str, str]) -> list[dict[str, Any]]:
    output: list[dict[str, Any]] = []
    cursor: str | None = None
    while True:
        page_params = dict(params)
        if cursor:
            page_params["starting_after"] = cursor
        page = api_get(api_key, path, page_params)
        output.extend(page["data"])
        if not page.get("has_more"):
            return output
        cursor = page["data"][-1]["id"]


def product_id(price: dict[str, Any]) -> str:
    product = price.get("product")
    return product if isinstance(product, str) else str((product or {}).get("id") or "")


def main() -> None:
    api_key = os.environ.get("STRIPE_SECRET_KEY")
    if not api_key:
        raise SystemExit("STRIPE_SECRET_KEY is required")
    preview = json.loads(PREVIEW.read_text(encoding="utf-8"))
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    expected_digest = manifest.pop("integrity_sha256", "")
    calculated_digest = hashlib.sha256(
        json.dumps(manifest, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")
    ).hexdigest()
    manifest["integrity_sha256"] = expected_digest
    products = list_all(api_key, "products", {"active": "true", "limit": "100"})
    prices = list_all(api_key, "prices", {"active": "true", "currency": "hkd", "limit": "100"})
    price_by_id = {price["id"]: price for price in prices}
    active_product_ids = {product["id"] for product in products}
    linked_prices = [price for price in prices if product_id(price) in active_product_ids]
    failures: list[dict[str, str]] = []
    if len(products) != 226:
        failures.append({"scope": "product_count", "detail": f"expected 226, got {len(products)}"})
    if len(prices) != 399:
        failures.append({"scope": "global_hkd_price_count", "detail": f"expected 399, got {len(prices)}"})
    if len(linked_prices) != 255:
        failures.append({"scope": "linked_hkd_price_count", "detail": f"expected 255, got {len(linked_prices)}"})
    if len(preview["records"]) != 255:
        failures.append({"scope": "preview_record_count", "detail": f"expected 255, got {len(preview['records'])}"})
    if expected_digest != calculated_digest:
        failures.append({"scope": "manifest_digest", "detail": "pending approval manifest SHA-256 mismatch"})

    calculated = 0
    awaiting = 0
    for record in preview["records"]:
        live_price = price_by_id.get(record["price_id"])
        if not live_price:
            failures.append({"scope": "price", "detail": f"price absent or inactive: {record['price_id']}"})
            continue
        if int(live_price.get("unit_amount") or 0) != int(record["current_cents"]):
            failures.append({"scope": "price", "detail": f"price changed since preview: {record['price_id']}"})
        if product_id(live_price) != record["product_id"]:
            failures.append({"scope": "price", "detail": f"product mismatch: {record['price_id']}"})
        if record["cost_cny"]:
            calculated += 1
            expected_cents = retail_cents_from_cny_cost(record["cost_cny"])
            if int(record["proposed_cents"]) != expected_cents:
                failures.append({"scope": "formula", "detail": f"formula mismatch: {record['price_id']}"})
            if int(record["proposed_cents"]) % 100 != 90:
                failures.append({"scope": "rounding", "detail": f"not .90 tail: {record['price_id']}"})
        else:
            awaiting += 1
    manifest_price_ids = {record["price_id"] for record in manifest["records"]}
    if len(manifest_price_ids) != manifest["record_count"]:
        failures.append({"scope": "manifest", "detail": "duplicate or incorrect price record count"})
    for record in manifest["records"]:
        live_price = price_by_id.get(record["price_id"])
        if not live_price or int(live_price.get("unit_amount") or 0) != int(record["old_cents"]):
            failures.append({"scope": "manifest_price", "detail": f"source price no longer matches: {record['price_id']}"})
        if int(record["new_cents"]) % 100 != 90:
            failures.append({"scope": "manifest_rounding", "detail": f"new price not .90: {record['price_id']}"})
    if calculated != 150 or awaiting != 105:
        failures.append({"scope": "cost_coverage", "detail": f"expected 150 calculated/105 awaiting, got {calculated}/{awaiting}"})
    if manifest["record_count"] != 130:
        failures.append({"scope": "manifest_scope", "detail": f"expected 130, got {manifest['record_count']}"})
    if len(manifest["product_policy_metadata_operations"]) != 129:
        failures.append({"scope": "product_policy_scope", "detail": "expected 129 product metadata operations"})
    if len(manifest["blocked_product_policy_metadata_operations"]) != 6:
        failures.append({"scope": "product_policy_capacity", "detail": "expected 6 capacity-blocked products"})
    payload = {
        "verification_mode": "read_only",
        "no_stripe_writes_performed_by_verifier": True,
        "products_checked": len(products),
        "global_active_hkd_prices_checked": len(prices),
        "linked_active_hkd_prices_checked": len(linked_prices),
        "preview_records_checked": len(preview["records"]),
        "calculated_price_records_checked": calculated,
        "awaiting_cost_price_records_checked": awaiting,
        "pending_price_replacements_checked": manifest["record_count"],
        "pending_product_policy_operations_checked": len(manifest["product_policy_metadata_operations"]),
        "blocked_product_policy_operations_checked": len(manifest["blocked_product_policy_metadata_operations"]),
        "manifest_integrity_sha256_verified": expected_digest == calculated_digest,
        "failure_count": len(failures),
        "failures": failures,
    }
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    if failures:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
