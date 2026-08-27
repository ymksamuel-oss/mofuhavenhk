#!/usr/bin/env python3
"""Update MH-CAT-CIAO-029 using owner-supplied fixed values only.

No FX endpoint, formula, rounding policy, implied-cost logic, or pricing automation is
used. This script accepts no calculated values: its two constants are the exact values
confirmed by the store owner in this conversation.
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

PRODUCT_ID = "prod_V8fduDqyGKiazf"
SOURCE_PRICE_ID = "price_1U91tuRyM6dRKLtZ6qsNXQeF"
EXPECTED_SKU = "MH-CAT-CIAO-029"
EXPECTED_SOURCE_CENTS = 1790
OWNER_COST_CNY = "11.70"
OWNER_PRICE_CENTS = 2290
ROOT = Path(__file__).resolve().parents[1]
RESULT = ROOT / "reports" / "ciao_029_fixed_price_update_result_2026-08-27.json"
REMOVE_KEYS = (
    "pricing_cost_cny_baseline",
    "pricing_cost_baseline_method",
    "cost_cny",
    "cny_cost",
    "source_cost_cny",
    "cost_cny_per_product",
    "supplier_cost_cny",
    "unit_cost_cny",
)


def text(value: Any) -> str:
    return str(value).strip() if value is not None else ""


def get(session: requests.Session, path: str) -> dict[str, Any]:
    response = session.get(f"https://api.stripe.com/v1/{path}", timeout=60)
    response.raise_for_status()
    return response.json()


def post(session: requests.Session, path: str, data: list[tuple[str, str]], idempotency_key: str) -> dict[str, Any]:
    response = session.post(
        f"https://api.stripe.com/v1/{path}",
        data=data,
        headers={"Idempotency-Key": idempotency_key},
        timeout=60,
    )
    response.raise_for_status()
    return response.json()


def write_result(result: dict[str, Any]) -> None:
    RESULT.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    api_key = os.environ.get("STRIPE_SECRET_KEY")
    if not api_key:
        raise SystemExit("STRIPE_SECRET_KEY is required")
    session = requests.Session()
    session.auth = (api_key, "")
    result: dict[str, Any] = {
        "mode": "apply" if args.apply else "dry_run_preflight",
        "input_rule": "owner fixed cost_cny=11.70 and proposed_hkd=22.90 only; no FX/formula/rounding/automation",
        "product_id": PRODUCT_ID,
        "source_price_id": SOURCE_PRICE_ID,
        "owner_cost_cny": OWNER_COST_CNY,
        "owner_price_hkd": "22.90",
        "started_at_utc": datetime.now(timezone.utc).isoformat(),
    }
    try:
        product = get(session, f"products/{PRODUCT_ID}")
        source = get(session, f"prices/{SOURCE_PRICE_ID}")
        if not product.get("active") or text((product.get("metadata") or {}).get("mofu_sku")) != EXPECTED_SKU:
            raise RuntimeError("Product identity or active state changed")
        if source.get("product") != PRODUCT_ID or not source.get("active") or source.get("currency") != "hkd" or source.get("type") != "one_time":
            raise RuntimeError("Source Price relationship or active state changed")
        if source.get("unit_amount") != EXPECTED_SOURCE_CENTS:
            raise RuntimeError("Source Price amount changed; abort without any write")
        if text(product.get("default_price")) != SOURCE_PRICE_ID:
            raise RuntimeError("Source Price is no longer Product.default_price; abort without any write")
        result["preflight_passed_at_utc"] = datetime.now(timezone.utc).isoformat()
        result["source_hkd"] = f"{source['unit_amount'] / 100:.2f}"

        if args.apply:
            suffix = hashlib.sha256(f"{PRODUCT_ID}:{SOURCE_PRICE_ID}:{OWNER_COST_CNY}:{OWNER_PRICE_CENTS}".encode()).hexdigest()[:16]
            metadata = source.get("metadata") or {}
            fields: list[tuple[str, str]] = [
                ("unit_amount", str(OWNER_PRICE_CENTS)),
                ("currency", "hkd"),
                ("product", PRODUCT_ID),
                ("active", "true"),
            ]
            for key, value in metadata.items():
                if key not in REMOVE_KEYS and text(value):
                    fields.append((f"metadata[{key}]", text(value)))
            fields.append(("metadata[cost_cny]", OWNER_COST_CNY))
            replacement = post(session, "prices", fields, f"mofu-ciao029-fixed-create-{suffix}")
            post(session, f"products/{PRODUCT_ID}", [("default_price", replacement["id"])], f"mofu-ciao029-fixed-default-{suffix}")
            try:
                post(session, f"prices/{SOURCE_PRICE_ID}", [("active", "false")], f"mofu-ciao029-fixed-deactivate-{suffix}")
            except Exception:
                current_source = get(session, f"prices/{SOURCE_PRICE_ID}")
                if current_source.get("active"):
                    post(session, f"products/{PRODUCT_ID}", [("default_price", SOURCE_PRICE_ID)], f"mofu-ciao029-fixed-restore-default-{suffix}")
                    post(session, f"prices/{replacement['id']}", [("active", "false")], f"mofu-ciao029-fixed-compensate-{suffix}")
                raise
            result["replacement_price_id"] = replacement["id"]
            result["replacement_hkd"] = f"{replacement['unit_amount'] / 100:.2f}"
            result["source_price_deactivated"] = True
            result["default_price_switched"] = True
            result["cost_cny_written"] = text((replacement.get("metadata") or {}).get("cost_cny")) == OWNER_COST_CNY
            result["implied_baseline_removed"] = not any(text((replacement.get("metadata") or {}).get(key)) for key in REMOVE_KEYS[:2])
            if replacement.get("unit_amount") != OWNER_PRICE_CENTS or not result["cost_cny_written"] or not result["implied_baseline_removed"]:
                raise RuntimeError("Replacement Price did not preserve the owner-specified fixed values")
            result["status"] = "updated"
        else:
            result["status"] = "would_create_fixed_hkd_22_90_replacement"
        result["completed_at_utc"] = datetime.now(timezone.utc).isoformat()
        write_result(result)
        print(json.dumps(result, ensure_ascii=False, indent=2))
    except Exception as error:
        result["error"] = str(error)
        result["failed_at_utc"] = datetime.now(timezone.utc).isoformat()
        write_result(result)
        raise


if __name__ == "__main__":
    main()
