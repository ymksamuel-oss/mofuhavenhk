#!/usr/bin/env python3
"""Canonical CNY-cost retail pricing policy for Mofu Haven HK.

The policy is intentionally deterministic and contains no Stripe writes. Import
or approval-controlled apply scripts must call `retail_hkd_from_cny_cost` rather
than duplicating the formula.
"""
from __future__ import annotations

from decimal import Decimal, InvalidOperation, ROUND_CEILING
from typing import Any

POLICY_VERSION = "mofu-cny-hkd-multiplier-v1"
CNY_TO_HKD = Decimal("1.1654")
RETAIL_MULTIPLIER = Decimal("1.76")
ROUNDING_RULE = "upward .90"
TAIL = Decimal("0.90")


def decimal_cost(value: Any) -> Decimal:
    """Parse a positive CNY cost without binary-float rounding."""
    try:
        cost = Decimal(str(value).strip())
    except (InvalidOperation, AttributeError, TypeError) as error:
        raise ValueError(f"Invalid CNY cost: {value!r}") from error
    if cost <= 0:
        raise ValueError(f"CNY cost must be positive: {value!r}")
    return cost


def round_up_to_90(value: Decimal) -> Decimal:
    """Round a positive HKD retail amount upward to the next price ending .90."""
    if value <= 0:
        raise ValueError(f"Price must be positive: {value}")
    return (value - TAIL).to_integral_value(rounding=ROUND_CEILING) + TAIL


def unrounded_retail_hkd(cost_cny: Any) -> Decimal:
    return decimal_cost(cost_cny) * CNY_TO_HKD * RETAIL_MULTIPLIER


def retail_hkd_from_cny_cost(cost_cny: Any) -> Decimal:
    return round_up_to_90(unrounded_retail_hkd(cost_cny))


def retail_cents_from_cny_cost(cost_cny: Any) -> int:
    return int(retail_hkd_from_cny_cost(cost_cny) * Decimal("100"))


def policy_metadata() -> dict[str, str]:
    """Metadata values for a future, explicitly approved Stripe sync."""
    return {
        "pricing_policy_version": POLICY_VERSION,
        "pricing_cny_to_hkd": f"{CNY_TO_HKD:.4f}",
        "pricing_retail_multiplier": f"{RETAIL_MULTIPLIER:.2f}",
        "pricing_rounding": ROUNDING_RULE,
        "retail_pricing_rule": "retail_hkd = ceil_to_.90(cost_cny × 1.1654 × 1.76)",
    }


if __name__ == "__main__":
    import argparse
    import json

    parser = argparse.ArgumentParser(description="Calculate a Mofu HKD retail price from a CNY cost")
    parser.add_argument("cost_cny", help="Positive CNY product cost")
    args = parser.parse_args()
    cost = decimal_cost(args.cost_cny)
    raw = unrounded_retail_hkd(cost)
    price = retail_hkd_from_cny_cost(cost)
    print(json.dumps({
        "policy_version": POLICY_VERSION,
        "cost_cny": f"{cost:.4f}",
        "cny_to_hkd": f"{CNY_TO_HKD:.4f}",
        "retail_multiplier": f"{RETAIL_MULTIPLIER:.2f}",
        "unrounded_hkd": f"{raw:.4f}",
        "rounded_hkd": f"{price:.2f}",
        "rounding": ROUNDING_RULE,
    }, ensure_ascii=False, indent=2))
