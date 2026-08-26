#!/usr/bin/env python3
"""Ceil sellable active HKD Prices to a .90 tail without ever lowering.

Price amounts in Stripe are immutable. This script creates a replacement Price,
updates Product.default_price when applicable, then deactivates the source Price.
Default mode is dry-run. It processes only exact records produced by the
read-only active_hkd_tail_price_audit.json audit.
"""

from __future__ import annotations

import argparse
import json
import os
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

import requests

ROOT = Path(__file__).resolve().parents[1]
AUDIT_PATH = ROOT / "active_hkd_tail_price_audit.json"
OUT_PATH = ROOT / "active_hkd_tail_price_apply.json"
RULE = "ceil_to_90_v1"


def api_get(api_key: str, path: str) -> dict:
    response = requests.get(f"https://api.stripe.com/v1/{path}", auth=(api_key, ""), timeout=60)
    response.raise_for_status()
    return response.json()


def api_post(api_key: str, path: str, data: list[tuple[str, str]], idempotency: str) -> dict:
    response = requests.post(
        f"https://api.stripe.com/v1/{path}",
        auth=(api_key, ""),
        data=data,
        headers={"Idempotency-Key": idempotency},
        timeout=60,
    )
    response.raise_for_status()
    return response.json()


def price_create_payload(record: dict, source: dict) -> list[tuple[str, str]]:
    data: list[tuple[str, str]] = [
        ("unit_amount", str(record["new_cents"])),
        ("currency", "hkd"),
        ("product", record["product_id"]),
        ("active", "true"),
    ]
    if source.get("nickname"):
        data.append(("nickname", str(source["nickname"])))
    if source.get("tax_behavior"):
        data.append(("tax_behavior", str(source["tax_behavior"])))
    metadata = dict(source.get("metadata") or {})
    metadata.update({
        "mofu_tail_rounding_rule": RULE,
        "mofu_tail_rounding_source_price_id": record["price_id"],
        "mofu_tail_rounding_old_hkd": f"{record['old_cents'] / 100:.2f}",
        "mofu_tail_rounding_new_hkd": f"{record['new_cents'] / 100:.2f}",
    })
    for key, value in sorted(metadata.items()):
        data.append((f"metadata[{key}]", str(value)))
    return data


def preflight_record(api_key: str, record: dict) -> tuple[dict, dict]:
    product = api_get(api_key, f"products/{record['product_id']}")
    price = api_get(api_key, f"prices/{record['price_id']}")
    if not product.get("active"):
        raise RuntimeError(f"{record['product_id']} is not active")
    if not price.get("active") or price.get("currency") != "hkd":
        raise RuntimeError(f"{record['price_id']} is not active HKD")
    if int(price.get("unit_amount") or 0) != int(record["old_cents"]):
        raise RuntimeError(f"{record['price_id']} amount changed since audit")
    if price.get("product") != record["product_id"]:
        raise RuntimeError(f"{record['price_id']} product mismatch")
    if int(record["new_cents"]) <= int(record["old_cents"]):
        raise RuntimeError(f"{record['price_id']} would not increase")
    return product, price


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="Create new Prices and deactivate source Prices")
    args = parser.parse_args()
    api_key = os.environ.get("STRIPE_SECRET_KEY")
    if not api_key:
        raise SystemExit("STRIPE_SECRET_KEY is required")
    audit = json.loads(AUDIT_PATH.read_text(encoding="utf-8"))
    records = [item for item in audit["records"] if item["will_change"]]
    timestamp = datetime.now(ZoneInfo("Asia/Hong_Kong")).isoformat()
    results: list[dict] = []

    for record in records:
        product, source = preflight_record(api_key, record)
        if not args.apply:
            results.append({
                "source_price_id": record["price_id"],
                "product_id": record["product_id"],
                "product_name": record["product_name"],
                "status": "would_replace",
                "old_cents": record["old_cents"],
                "new_cents": record["new_cents"],
                "was_default_price": product.get("default_price") == record["price_id"],
            })
            continue

        new_price = api_post(
            api_key,
            "prices",
            price_create_payload(record, source),
            f"mofu-tail90-create-v1-{record['price_id']}",
        )
        was_default = product.get("default_price") == record["price_id"]
        if was_default:
            api_post(
                api_key,
                f"products/{record['product_id']}",
                [("default_price", new_price["id"])],
                f"mofu-tail90-default-v1-{record['product_id']}-{record['price_id']}",
            )
        api_post(
            api_key,
            f"prices/{record['price_id']}",
            [("active", "false")],
            f"mofu-tail90-deactivate-v1-{record['price_id']}",
        )
        results.append({
            "source_price_id": record["price_id"],
            "replacement_price_id": new_price["id"],
            "product_id": record["product_id"],
            "product_name": record["product_name"],
            "status": "replaced",
            "old_cents": record["old_cents"],
            "new_cents": record["new_cents"],
            "was_default_price": was_default,
            "comparison_source": record["comparison_source"],
            "comparison_price_hkd": record["comparison_price_hkd"],
            "applied_at_hkt": timestamp,
        })

    payload = {
        "mode": "apply" if args.apply else "dry_run",
        "rule": "ceil current active sellable HKD Price to .90 without lowering",
        "source_audit": str(AUDIT_PATH),
        "records_requested": len(records),
        "results": results,
        "summary": {
            "replaced": sum(1 for item in results if item["status"] == "replaced"),
            "would_replace": sum(1 for item in results if item["status"] == "would_replace"),
        },
        "recovery": "restore_active_hkd_tail_prices.py restores source Prices from this apply file.",
    }
    OUT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"mode": payload["mode"], **payload["summary"], "output": str(OUT_PATH)}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
