#!/usr/bin/env python3
"""Verify old-product archival and recent-product protection after archive apply."""

from __future__ import annotations

import json
import os
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parents[1]
AUDIT_PATH = ROOT / "pre_aug25_product_archive_audit.json"
APPLY_PATH = ROOT / "pre_aug25_product_archive_apply.json"
OUT_PATH = ROOT / "pre_aug25_product_archive_verification.json"
ARCHIVE_STATUS = "temporary_pre_20260825"


def get_product(api_key: str, product_id: str) -> dict:
    response = requests.get(f"https://api.stripe.com/v1/products/{product_id}", auth=(api_key, ""), timeout=60)
    response.raise_for_status()
    return response.json()


def main() -> None:
    api_key = os.environ.get("STRIPE_SECRET_KEY")
    if not api_key:
        raise SystemExit("STRIPE_SECRET_KEY is required")
    audit = json.loads(AUDIT_PATH.read_text(encoding="utf-8"))
    apply = json.loads(APPLY_PATH.read_text(encoding="utf-8"))

    old_results: list[dict] = []
    for candidate in audit["old_active_candidates"]:
        product = get_product(api_key, candidate["product_id"])
        metadata = product.get("metadata") or {}
        old_results.append({
            "product_id": product["id"],
            "name": product.get("name", ""),
            "active": bool(product.get("active")),
            "archive_marker": metadata.get("mofu_archive_status", ""),
        })

    protected_results: list[dict] = []
    for protected in audit["protected_recent_products"]:
        product = get_product(api_key, protected["product_id"])
        protected_results.append({
            "product_id": product["id"],
            "name": product.get("name", ""),
            "active": bool(product.get("active")),
            "created_hkt": protected["created_hkt"],
        })

    old_failures = [item for item in old_results if item["active"] or item["archive_marker"] != ARCHIVE_STATUS]
    protected_failures = [item for item in protected_results if not item["active"]]
    payload = {
        "archive_apply_mode": apply.get("mode"),
        "old_candidate_count": len(old_results),
        "old_archived_verified": len(old_results) - len(old_failures),
        "old_archive_failures": old_failures,
        "protected_recent_count": len(protected_results),
        "protected_recent_active_verified": len(protected_results) - len(protected_failures),
        "protected_recent_failures": protected_failures,
        "old_product_sample": old_results[0] if old_results else None,
        "recent_product_sample": protected_results[-1] if protected_results else None,
        "success": not old_failures and not protected_failures,
    }
    OUT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "old_archived_verified": payload["old_archived_verified"],
        "old_archive_failures": len(old_failures),
        "protected_recent_active_verified": payload["protected_recent_active_verified"],
        "protected_recent_failures": len(protected_failures),
        "success": payload["success"],
        "output": str(OUT_PATH),
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
