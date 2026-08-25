#!/usr/bin/env python3
from __future__ import annotations

import json
import os
from pathlib import Path

import requests

ROOT = Path("/home/ubuntu/mofuhavenhk-github")
MANIFEST = ROOT / "onecared_cans_stripe_manifest.json"
API_KEY = os.environ.get("STRIPE_SECRET_KEY")
if not API_KEY:
    raise SystemExit("STRIPE_SECRET_KEY is not set")

payload = json.loads(MANIFEST.read_text())
verified = []
for flavor in payload["flavors"]:
    product_id = flavor["stripe_product_id"]
    product = requests.get(
        f"https://api.stripe.com/v1/products/{product_id}", auth=(API_KEY, ""), timeout=30
    )
    product.raise_for_status()
    product_data = product.json()
    assert product_data.get("images", [None])[0] == flavor["image_url"], f"image mismatch {product_id}"
    assert (product_data.get("metadata") or {}).get("variant_mode") == "pack_size", f"mode mismatch {product_id}"

    prices = requests.get(
        "https://api.stripe.com/v1/prices",
        auth=(API_KEY, ""),
        params={"product": product_id, "active": "true", "currency": "hkd", "limit": 100},
        timeout=30,
    )
    prices.raise_for_status()
    by_id = {item["id"]: item for item in prices.json().get("data", [])}
    for tier in flavor["tiers"]:
        price = by_id.get(tier["stripe_price_id"])
        assert price, f"missing price {tier['stripe_price_id']}"
        assert price.get("unit_amount") == tier["stripe_unit_amount"], f"amount mismatch {price['id']}"
        assert (price.get("metadata") or {}).get("pack_count") == str(tier["pack_count"]), f"pack mismatch {price['id']}"
    verified.append({"product": product_id, "name": flavor["name_zh"], "tiers": len(flavor["tiers"])})

print(json.dumps({"flavor_count": len(verified), "tier_count": sum(x["tiers"] for x in verified), "verified": verified}, ensure_ascii=False))
