#!/usr/bin/env python3
"""Create zero-write HKD price quotes for new or existing products from a CNY-cost CSV.

Input requires `cny_cost` (or `待輸入 CNY 成本（此 Price）`) and preserves all
other columns. It uses the central cny_hkd_multiplier_pricing_policy module and
never calls Stripe.
"""
from __future__ import annotations

import argparse
import csv
from pathlib import Path

from cny_hkd_multiplier_pricing_policy import (
    CNY_TO_HKD,
    POLICY_VERSION,
    RETAIL_MULTIPLIER,
    ROUNDING_RULE,
    decimal_cost,
    retail_hkd_from_cny_cost,
    unrounded_retail_hkd,
)

COST_COLUMNS = ("cny_cost", "待輸入 CNY 成本（此 Price）", "待輸入 CNY 成本（如各變體相同）")


def cost_from_row(row: dict[str, str]) -> str:
    for name in COST_COLUMNS:
        if row.get(name, "").strip():
            return row[name].strip()
    return ""


def main() -> None:
    parser = argparse.ArgumentParser(description="Quote HKD retail prices from CNY costs without changing Stripe")
    parser.add_argument("input_csv", type=Path, help="CSV with cny_cost or the supplied Chinese CNY-cost input column")
    parser.add_argument("output_csv", type=Path, help="CSV that will contain the deterministic HKD quote")
    args = parser.parse_args()
    with args.input_csv.open("r", encoding="utf-8-sig", newline="") as source:
        reader = csv.DictReader(source)
        if not reader.fieldnames:
            raise SystemExit("Input CSV has no header row")
        rows = list(reader)
        source_fields = list(reader.fieldnames)
    output_fields = source_fields + [
        "pricing_policy_version", "pricing_cny_to_hkd", "pricing_retail_multiplier",
        "pricing_rounding", "unrounded_proposed_hkd", "proposed_hkd", "quote_status",
    ]
    quoted = 0
    failed = 0
    for row in rows:
        value = cost_from_row(row)
        row["pricing_policy_version"] = POLICY_VERSION
        row["pricing_cny_to_hkd"] = f"{CNY_TO_HKD:.4f}"
        row["pricing_retail_multiplier"] = f"{RETAIL_MULTIPLIER:.2f}"
        row["pricing_rounding"] = ROUNDING_RULE
        try:
            cost = decimal_cost(value)
            row["unrounded_proposed_hkd"] = f"{unrounded_retail_hkd(cost):.4f}"
            row["proposed_hkd"] = f"{retail_hkd_from_cny_cost(cost):.2f}"
            row["quote_status"] = "quoted_read_only"
            quoted += 1
        except ValueError:
            row["unrounded_proposed_hkd"] = ""
            row["proposed_hkd"] = ""
            row["quote_status"] = "awaiting_valid_positive_cny_cost"
            failed += 1
    with args.output_csv.open("w", encoding="utf-8-sig", newline="") as destination:
        writer = csv.DictWriter(destination, fieldnames=output_fields, lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)
    print(f"Read-only quote complete: {quoted} quoted, {failed} awaiting cost, output={args.output_csv}")


if __name__ == "__main__":
    main()
