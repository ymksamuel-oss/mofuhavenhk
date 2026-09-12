#!/usr/bin/env python3
"""Normalize storefront compare-at prices to a meaningful 1.30x multiplier.

The script is dry-run by default. It reads a CSV exported from the products table
with at least: id, price, original_price. Use --apply with the generated update
CSV after review, or use the same calculation helper from an admin job.
"""
from __future__ import annotations

import argparse
import csv
import math
from decimal import Decimal, ROUND_CEILING
from pathlib import Path

MIN_MULTIPLIER = Decimal("1.20")
MAX_MULTIPLIER = Decimal("1.50")
TARGET_MULTIPLIER = Decimal("1.30")
STEP = Decimal("0.10")


def money(value: Decimal) -> Decimal:
    return value.quantize(Decimal("0.01"), rounding=ROUND_CEILING)


def recommended_original_price(current_price: Decimal) -> Decimal:
    """Return a visible compare-at price safely inside the required range."""
    if current_price <= 0:
        raise ValueError("current price must be positive")
    # Round upward to a customer-friendly tenth, never down to a token discount.
    candidate = (current_price * TARGET_MULTIPLIER / STEP).to_integral_value(rounding=ROUND_CEILING) * STEP
    candidate = money(candidate)
    ratio = candidate / current_price
    if ratio < MIN_MULTIPLIER:
        candidate = money(current_price * MIN_MULTIPLIER)
    if candidate / current_price > MAX_MULTIPLIER:
        candidate = money(current_price * MAX_MULTIPLIER)
    if not MIN_MULTIPLIER <= candidate / current_price <= MAX_MULTIPLIER:
        raise ValueError(f"calculated ratio out of range: {current_price} -> {candidate}")
    return candidate


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("input_csv", type=Path, help="CSV export containing id and price")
    parser.add_argument("--output", type=Path, default=Path("normalized_original_prices.csv"))
    args = parser.parse_args()

    updates: list[dict[str, str]] = []
    with args.input_csv.open(newline="", encoding="utf-8-sig") as handle:
        for row in csv.DictReader(handle):
            product_id = (row.get("id") or "").strip()
            raw_price = (row.get("price") or "").strip()
            if not product_id or not raw_price:
                continue
            current = Decimal(raw_price)
            if current <= 0:
                # Draft/archived placeholders without a sale price are not
                # storefront products and cannot have a meaningful discount.
                continue
            original = recommended_original_price(current)
            ratio = original / current
            updates.append({
                "id": product_id,
                "price": f"{current:.2f}",
                "original_price": f"{original:.2f}",
                "ratio": f"{ratio:.4f}",
            })

    args.output.write_text(
        "id,price,original_price,ratio\n" + "\n".join(
            f"{row['id']},{row['price']},{row['original_price']},{row['ratio']}" for row in updates
        ) + "\n",
        encoding="utf-8",
    )
    assert all(MIN_MULTIPLIER <= Decimal(row["ratio"]) <= MAX_MULTIPLIER for row in updates)
    print(f"prepared {len(updates)} updates -> {args.output}")
    print(f"formula: ceil(price * {TARGET_MULTIPLIER} to ${STEP})")


if __name__ == "__main__":
    main()
