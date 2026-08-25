#!/usr/bin/env python3
from __future__ import annotations

import csv
import json
import os
from decimal import Decimal, InvalidOperation
from pathlib import Path

import requests

ROOT = Path("/home/ubuntu/mofuhavenhk-github")
CSV_PATH = Path("/home/ubuntu/upload/onecare_compare_at_price_template.csv")
MANIFEST_PATH = ROOT / "onecared_cans_stripe_manifest.json"
RESULT_PATH = ROOT / "onecare_compare_at_sync_result.json"
API_KEY = os.environ.get("STRIPE_SECRET_KEY")
if not API_KEY:
    raise SystemExit("STRIPE_SECRET_KEY is not set")


def money(value: str) -> Decimal:
    try:
        return Decimal(str(value)).quantize(Decimal("0.01"))
    except (InvalidOperation, ValueError) as exc:
        raise ValueError(f"Invalid HKD amount: {value}") from exc


def pack_count(tier: str) -> int:
    digits = "".join(char for char in tier if char.isdigit())
    if not digits:
        raise ValueError(f"Tier has no pack count: {tier}")
    return int(digits)

manifest = json.loads(MANIFEST_PATH.read_text())
price_by_key: dict[tuple[str, int], dict] = {}
for flavor in manifest["flavors"]:
    for tier in flavor["tiers"]:
        price_by_key[(flavor["name_zh"], int(tier["pack_count"]))] = tier

rows: list[dict] = []
with CSV_PATH.open(newline="", encoding="utf-8-sig") as source:
    reader = csv.DictReader(source)
    expected_fields = {"Product_Name", "Tier", "Current_HKD", "Compare_At_HKD"}
    if not expected_fields.issubset(reader.fieldnames or []):
        raise ValueError(f"CSV fields must include {sorted(expected_fields)}")
    for row in reader:
        name = row["Product_Name"].split(" (")[0].strip()
        count = pack_count(row["Tier"])
        current = money(row["Current_HKD"])
        compare_at = money(row["Compare_At_HKD"])
        tier = price_by_key.get((name, count))
        if not tier:
            raise ValueError(f"No Stripe mapping for {name} / {count} cans")
        stripe_current = Decimal(tier["stripe_unit_amount"]) / Decimal(100)
        if current != stripe_current:
            raise ValueError(f"Current price mismatch for {name} / {count}: CSV {current}, Stripe {stripe_current}")
        if compare_at <= current:
            raise ValueError(f"Compare-at price must exceed current price for {name} / {count}")
        rows.append({"name_zh": name, "pack_count": count, "current_hkd": str(current), "compare_at_hkd": str(compare_at), "price_id": tier["stripe_price_id"]})

if len(rows) != 21 or len({entry["price_id"] for entry in rows}) != 21:
    raise ValueError(f"Expected 21 unique tiers, received {len(rows)}")

updated: list[dict] = []
for row in rows:
    response = requests.post(
        f"https://api.stripe.com/v1/prices/{row['price_id']}",
        auth=(API_KEY, ""),
        data={
            "metadata[compare_at_price_hkd]": row["compare_at_hkd"],
            "metadata[compare_at_price_currency]": "hkd",
            "metadata[compare_at_price_schema]": "v1",
        },
        timeout=30,
    )
    response.raise_for_status()
    price = response.json()
    metadata = price.get("metadata") or {}
    if metadata.get("compare_at_price_hkd") != row["compare_at_hkd"]:
        raise RuntimeError(f"Metadata verification failed for {row['price_id']}")
    updated.append({**row, "stripe_unit_amount": price.get("unit_amount")})

RESULT_PATH.write_text(json.dumps({"updated_count": len(updated), "tiers": updated}, ensure_ascii=False, indent=2) + "\n")
print(f"Updated {len(updated)} Stripe Price records")
