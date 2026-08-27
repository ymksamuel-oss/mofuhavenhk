#!/usr/bin/env python3
"""Verify that the 29-product metadata sync preview did not mutate live Stripe data."""
from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

import requests

ROOT = Path(__file__).resolve().parents[1]
PREVIEW = ROOT / "reports" / "cny_pricing_metadata_sync_preview_29_2026-08-27.json"
OUT = ROOT / "reports" / "cny_pricing_metadata_sync_preview_29_integrity_2026-08-27.json"


def get(api_key: str, path: str) -> dict[str, Any]:
    response = requests.get(f"https://api.stripe.com/v1/{path}", auth=(api_key, ""), timeout=30)
    response.raise_for_status()
    return response.json()


def main() -> None:
    api_key = os.environ.get("STRIPE_SECRET_KEY")
    if not api_key:
        raise SystemExit("STRIPE_SECRET_KEY is required")
    preview = json.loads(PREVIEW.read_text(encoding="utf-8"))
    records: list[dict[str, Any]] = preview["records"]
    errors: list[dict[str, str]] = []
    checked_prices = 0
    for record in records:
        product_id = record.get("product_id")
        if not product_id:
            errors.append({"supplier_sku": record["supplier_sku"], "issue": "missing_product_id_in_preview"})
            continue
        product = get(api_key, f"products/{product_id}")
        product_metadata = product.get("metadata") or {}
        for field in record["proposed_product_metadata_additions"]:
            if product_metadata.get(field):
                errors.append({"product_id": product_id, "issue": f"preview_addition_already_present:{field}"})
        for price_preview in record["active_hkd_price_preview"]:
            price = get(api_key, f"prices/{price_preview['price_id']}")
            checked_prices += 1
            if not price.get("active") or price.get("currency") != "hkd":
                errors.append({"price_id": price_preview["price_id"], "issue": "price_no_longer_active_hkd"})
            for field in price_preview["proposed_metadata_additions"]:
                if (price.get("metadata") or {}).get(field):
                    errors.append({"price_id": price_preview["price_id"], "issue": f"preview_addition_already_present:{field}"})
    result = {
        "verification_mode": "read_only",
        "no_stripe_writes_performed_by_verifier": True,
        "expected_product_count": 29,
        "preview_product_count": len(records),
        "expected_active_hkd_price_count": 29,
        "checked_active_hkd_price_count": checked_prices,
        "pending_metadata_fields_remain_unwritten": not errors,
        "failure_count": len(errors),
        "failures": errors,
    }
    OUT.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(result, ensure_ascii=False, indent=2))
    if errors or len(records) != 29 or checked_prices != 29:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
