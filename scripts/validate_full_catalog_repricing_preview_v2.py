#!/usr/bin/env python3
"""Validate the read-only full-catalog repricing preview without calling Stripe."""
from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from decimal import Decimal, ROUND_CEILING
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATE_TAG = "2026-08-27"
PREVIEW_JSON = ROOT / "reports" / f"catalog_cny_hkd_multiplier_repricing_preview_1_166_{DATE_TAG}.json"
PREVIEW_CSV = ROOT / "reports" / f"catalog_cny_hkd_multiplier_repricing_preview_1_166_{DATE_TAG}.csv"
OUT = ROOT / "reports" / f"catalog_cny_hkd_multiplier_repricing_preview_1_166_{DATE_TAG}_integrity.json"
FX = Decimal("1.166")
MULTIPLIER = Decimal("1.76")
TAIL = Decimal("0.90")


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def expected_price(cost: Decimal) -> Decimal:
    raw = cost * FX * MULTIPLIER
    return (raw - TAIL).to_integral_value(rounding=ROUND_CEILING) + TAIL


def main() -> None:
    payload = json.loads(PREVIEW_JSON.read_text(encoding="utf-8"))
    records = payload.get("records")
    if not isinstance(records, list):
        raise SystemExit("Preview records are missing or invalid")

    errors: list[str] = []
    price_ids: set[str] = set()
    product_ids: set[str] = set()
    recalculable = 0
    changing = 0
    missing_cost = 0

    for index, row in enumerate(records, start=1):
        if not isinstance(row, dict):
            errors.append(f"row {index}: not an object")
            continue
        price_id = str(row.get("price_id", ""))
        product_id = str(row.get("product_id", ""))
        if not price_id or not product_id:
            errors.append(f"row {index}: missing product_id or price_id")
            continue
        if price_id in price_ids:
            errors.append(f"row {index}: duplicate price_id {price_id}")
        price_ids.add(price_id)
        product_ids.add(product_id)

        status = row.get("pricing_status")
        cost_text = str(row.get("cost_cny", ""))
        proposed_text = str(row.get("proposed_hkd", ""))
        if status in {"recalculable_preview_only", "no_change"}:
            recalculable += 1
            try:
                cost = Decimal(cost_text)
                current = Decimal(str(row.get("current_hkd", "")))
                proposed = Decimal(proposed_text)
                actual_change = Decimal(str(row.get("price_change_hkd", "")))
            except Exception:
                errors.append(f"row {index}: non-numeric calculable record")
                continue
            expected = expected_price(cost)
            if proposed != expected:
                errors.append(f"row {index}: proposed {proposed} != expected {expected}")
            if actual_change != proposed - current:
                errors.append(f"row {index}: change {actual_change} != proposed-current")
            if proposed.as_tuple().exponent != Decimal("0.90").as_tuple().exponent or proposed % Decimal("1") != TAIL:
                errors.append(f"row {index}: proposed price is not a .90-tail amount")
            if status == "no_change":
                if actual_change != 0:
                    errors.append(f"row {index}: no_change record has non-zero delta")
            else:
                changing += 1
                if actual_change == 0:
                    errors.append(f"row {index}: changing record has zero delta")
        elif status == "awaiting_cny_cost":
            missing_cost += 1
            if cost_text or proposed_text or str(row.get("price_change_hkd", "")):
                errors.append(f"row {index}: missing-cost record contains calculated pricing")
        else:
            errors.append(f"row {index}: unexpected status {status!r}")

    scope = payload.get("scope") if isinstance(payload.get("scope"), dict) else {}
    expected_records = scope.get("active_hkd_price_count_attached_to_active_products")
    if expected_records != len(records):
        errors.append(f"scope attached price count {expected_records} != records {len(records)}")
    if scope.get("cost_recalculable_price_count") != recalculable:
        errors.append("scope recalculable count disagrees with records")
    if scope.get("price_change_preview_count") != changing:
        errors.append("scope changing count disagrees with records")
    if scope.get("awaiting_cny_cost_price_count") != missing_cost:
        errors.append("scope missing-cost count disagrees with records")

    result = {
        "validated_at_utc": datetime.now(timezone.utc).isoformat(),
        "no_stripe_writes_performed": True,
        "preview_json_sha256": sha256(PREVIEW_JSON),
        "preview_csv_sha256": sha256(PREVIEW_CSV),
        "record_count": len(records),
        "unique_product_count_in_price_scope": len(product_ids),
        "unique_price_count": len(price_ids),
        "recalculable_price_count": recalculable,
        "changing_price_count": changing,
        "awaiting_cny_cost_price_count": missing_cost,
        "passed": not errors,
        "errors": errors,
    }
    OUT.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(result, ensure_ascii=False, indent=2))
    if errors:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
