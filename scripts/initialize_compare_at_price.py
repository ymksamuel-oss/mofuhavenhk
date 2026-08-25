#!/usr/bin/env python3
"""Initialize non-binding compare-at price metadata on Stripe Products.

Usage:
  STRIPE_SECRET_KEY=... python3 scripts/initialize_compare_at_price.py

The script never changes Stripe Price objects or checkout amounts. It only adds
Product metadata defaults for an optional storefront display price.
"""

import json
import os
from pathlib import Path

import requests

API_URL = "https://api.stripe.com/v1/products"
COMPARE_AT_KEY = "compare_at_price_hkd"
SCHEMA_KEY = "compare_at_price_schema"
CURRENCY_KEY = "compare_at_price_currency"
SCHEMA_VERSION = "v1"


def list_all_products(api_key: str):
    products = []
    starting_after = None
    while True:
        params = {"limit": 100}
        if starting_after:
            params["starting_after"] = starting_after
        response = requests.get(API_URL, auth=(api_key, ""), params=params, timeout=60)
        response.raise_for_status()
        page = response.json()
        products.extend(page["data"])
        if not page.get("has_more"):
            return products
        starting_after = page["data"][-1]["id"]


def main():
    api_key = os.environ.get("STRIPE_SECRET_KEY")
    if not api_key:
        raise SystemExit("STRIPE_SECRET_KEY is required")

    updated = []
    skipped = []
    for product in list_all_products(api_key):
        metadata = product.get("metadata") or {}
        patch = {}
        if COMPARE_AT_KEY not in metadata:
            # 0 is the explicit unset state. The storefront only renders a
            # compare-at price when its value is greater than the current price.
            patch[f"metadata[{COMPARE_AT_KEY}]"] = "0"
        if SCHEMA_KEY not in metadata:
            patch[f"metadata[{SCHEMA_KEY}]"] = SCHEMA_VERSION
        if CURRENCY_KEY not in metadata:
            patch[f"metadata[{CURRENCY_KEY}]"] = "hkd"

        if not patch:
            skipped.append({"id": product["id"], "name": product.get("name")})
            continue

        response = requests.post(
            f"{API_URL}/{product['id']}", auth=(api_key, ""), data=patch, timeout=60
        )
        response.raise_for_status()
        saved = response.json()
        saved_metadata = saved.get("metadata") or {}
        if saved_metadata.get(COMPARE_AT_KEY) is None:
            raise RuntimeError(f"compare-at field missing after update: {product['id']}")
        updated.append(
            {
                "id": product["id"],
                "name": product.get("name"),
                "active": product.get("active"),
                "compare_at_price_hkd": saved_metadata.get(COMPARE_AT_KEY),
            }
        )

    output = {"updated_count": len(updated), "skipped_count": len(skipped), "updated": updated}
    Path("compare_at_initialization_manifest.json").write_text(
        json.dumps(output, ensure_ascii=False, indent=2) + "\n"
    )
    print(json.dumps(output, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
