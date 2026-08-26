#!/usr/bin/env python3
"""Verify that pre-cutoff archive candidates are safe to deactivate.

This is read-only. It enriches the date-based candidate list with active HKD
Price checks, and asserts that no post-cutoff product has entered the manifest.
"""

from __future__ import annotations

import json
import os
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parents[1]
AUDIT_PATH = ROOT / "pre_aug25_product_archive_audit.json"
OUT_PATH = ROOT / "pre_aug25_product_archive_preflight.json"


def list_active_hkd_prices(api_key: str, product_id: str) -> list[dict]:
    params: dict[str, object] = {"product": product_id, "active": "true", "currency": "hkd", "limit": 100}
    prices: list[dict] = []
    while True:
        response = requests.get("https://api.stripe.com/v1/prices", params=params, auth=(api_key, ""), timeout=60)
        response.raise_for_status()
        page = response.json()
        prices.extend(page["data"])
        if not page.get("has_more"):
            return prices
        params["starting_after"] = page["data"][-1]["id"]


def main() -> None:
    api_key = os.environ.get("STRIPE_SECRET_KEY")
    if not api_key:
        raise SystemExit("STRIPE_SECRET_KEY is required")
    audit = json.loads(AUDIT_PATH.read_text(encoding="utf-8"))
    cutoff = int(audit["cutoff_unix"])
    candidates = audit["old_active_candidates"]
    protected = audit["protected_recent_products"]

    violations = [item for item in candidates if not item["active"] or int(item["created_unix"]) >= cutoff]
    protected_violations = [item for item in protected if int(item["created_unix"]) < cutoff]
    if violations or protected_violations:
        raise SystemExit(json.dumps({"candidate_violations": violations, "protected_violations": protected_violations}, ensure_ascii=False))

    verified: list[dict] = []
    for candidate in candidates:
        prices = list_active_hkd_prices(api_key, candidate["product_id"])
        default_price = candidate.get("default_price")
        verified.append({
            **candidate,
            "active_hkd_price_ids": [price["id"] for price in prices],
            "active_hkd_price_count": len(prices),
            "default_price_is_active_hkd": bool(default_price and any(price["id"] == default_price for price in prices)),
            "archive_action": "set_product_active_false",
            "recovery_action": "set_product_active_true",
        })

    payload = {
        "cutoff_hkt": audit["cutoff_hkt"],
        "cutoff_unix": cutoff,
        "candidate_count": len(verified),
        "protected_recent_count": len(protected),
        "all_candidates_pass_date_and_status_boundary": True,
        "all_protected_products_pass_date_boundary": True,
        "exact_name_duplicate_groups": audit["old_active_exact_name_duplicates"],
        "candidates": verified,
        "safety_rule": "Only these exact candidate IDs may be archived. Recovery is product.active=true; prices and metadata are untouched.",
    }
    OUT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "candidate_count": len(verified),
        "protected_recent_count": len(protected),
        "candidate_with_active_hkd_price": sum(1 for item in verified if item["active_hkd_price_count"] > 0),
        "candidate_with_missing_active_hkd_price": sum(1 for item in verified if item["active_hkd_price_count"] == 0),
        "default_price_active_hkd": sum(1 for item in verified if item["default_price_is_active_hkd"]),
        "exact_name_duplicate_groups": len(audit["old_active_exact_name_duplicates"]),
        "output": str(OUT_PATH),
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
