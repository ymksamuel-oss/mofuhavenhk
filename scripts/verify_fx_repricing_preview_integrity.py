#!/usr/bin/env python3
"""Independently verify the read-only FX repricing preview against live Stripe data."""
from __future__ import annotations

import json
import os
from decimal import Decimal, ROUND_CEILING
from pathlib import Path
from typing import Any

import requests

ROOT = Path(__file__).resolve().parents[1]
PREVIEW = ROOT / "reports" / "cny_hkd_sellable_repricing_preview_2026-08-27.json"
OUT = ROOT / "reports" / "cny_hkd_sellable_repricing_preview_integrity_2026-08-27.json"


def get_price(api_key: str, price_id: str) -> dict[str, Any]:
    response = requests.get(f"https://api.stripe.com/v1/prices/{price_id}", auth=(api_key, ""), timeout=30)
    response.raise_for_status()
    return response.json()


def round_up_to_90(value: Decimal) -> Decimal:
    return (value - Decimal("0.90")).to_integral_value(rounding=ROUND_CEILING) + Decimal("0.90")


def main() -> None:
    api_key = os.environ.get("STRIPE_SECRET_KEY")
    if not api_key:
        raise SystemExit("STRIPE_SECRET_KEY is required")
    preview = json.loads(PREVIEW.read_text(encoding="utf-8"))
    records: list[dict[str, Any]] = preview["records"]
    price_ids = [row["price_id"] for row in records]
    product_ids = {row["product_id"] for row in records}
    failures: list[dict[str, str]] = []
    for row in records:
        proposed = Decimal(row["proposed_hkd"])
        raw = Decimal(row["unrounded_proposed_hkd"])
        target_margin = Decimal(row["target_product_margin"])
        cost_cny = Decimal(row["cost_cny"])
        rate = Decimal(row["latest_cny_to_hkd"])
        recomputed_raw = cost_cny * rate / (Decimal("1") - target_margin)
        recomputed_price = round_up_to_90(recomputed_raw)
        if proposed != recomputed_price or proposed % Decimal("1") != Decimal("0.90"):
            failures.append({"price_id": row["price_id"], "issue": "formula_or_rounding_mismatch"})
            continue
        live = get_price(api_key, row["price_id"])
        live_hkd = Decimal(live["unit_amount"]) / Decimal("100")
        if not live.get("active"):
            failures.append({"price_id": row["price_id"], "issue": "live_price_inactive"})
        if live.get("currency") != "hkd":
            failures.append({"price_id": row["price_id"], "issue": "live_price_currency_changed"})
        if live_hkd != Decimal(row["current_hkd"]):
            failures.append({"price_id": row["price_id"], "issue": f"live_amount_{live_hkd}_does_not_match_preview_{row['current_hkd']}"})
    result = {
        "verification_mode": "read_only",
        "preview_mode": preview.get("mode"),
        "no_stripe_writes_performed_by_verifier": True,
        "expected_eligible_product_count": 106,
        "actual_unique_product_count": len(product_ids),
        "expected_sellable_hkd_price_count": 121,
        "actual_price_record_count": len(records),
        "actual_unique_price_id_count": len(set(price_ids)),
        "all_proposed_prices_use_upward_90": not any(item["issue"] == "formula_or_rounding_mismatch" for item in failures),
        "all_live_old_prices_remain_active_hkd_and_match_preview": not any(
            item["issue"] != "formula_or_rounding_mismatch" for item in failures
        ),
        "failure_count": len(failures),
        "failures": failures,
    }
    OUT.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(result, ensure_ascii=False, indent=2))
    if failures or len(product_ids) != 106 or len(records) != 121 or len(set(price_ids)) != 121:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
