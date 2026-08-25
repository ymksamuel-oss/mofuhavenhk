#!/usr/bin/env python3
"""Sync verified Mama Cook bilingual copy to Stripe Product metadata.

This script updates Product descriptions and display metadata only. It never
creates or changes Stripe Price objects, images, inventory flags, or checkout
configuration.
"""

import json
import os
from pathlib import Path

import requests

API_URL = "https://api.stripe.com/v1/products"
CONTENT_PATH = Path("data/mamacook_product_content.json")


def main():
    api_key = os.environ.get("STRIPE_SECRET_KEY")
    if not api_key:
        raise SystemExit("STRIPE_SECRET_KEY is required")
    payload = json.loads(CONTENT_PATH.read_text())
    products = payload.get("products", [])
    if len(products) != 21:
        raise SystemExit(f"Expected 21 Mama Cook products, received {len(products)}")

    updated = []
    for product in products:
        product_id = product["stripe_product_id"]
        data = {
            "description": product["description_zh"],
            "metadata[description_zh]": product["description_zh"],
            "metadata[description_en]": product["description_en"],
            "metadata[texture_zh]": product["texture_zh"],
            "metadata[texture_en]": product["texture_en"],
            "metadata[specs_zh]": product["specs_zh"],
            "metadata[specs_en]": product["specs_en"],
            "metadata[availability_display_zh]": product["availability_zh"],
            "metadata[availability_display_en]": product["availability_en"],
            "metadata[product_format]": product["product_format"],
            "metadata[pet_suitability]": product["pet_suitability"],
            "metadata[product_content_version]": "mamacook-v1",
        }
        response = requests.post(
            f"{API_URL}/{product_id}", auth=(api_key, ""), data=data, timeout=60
        )
        response.raise_for_status()
        saved = response.json()
        metadata = saved.get("metadata") or {}
        required = [
            "description_zh", "description_en", "texture_zh", "texture_en",
            "specs_zh", "specs_en", "availability_display_zh",
            "availability_display_en", "product_content_version",
        ]
        missing = [key for key in required if not metadata.get(key)]
        if missing:
            raise RuntimeError(f"{product_id} missing metadata after write: {missing}")
        updated.append({
            "stripe_product_id": product_id,
            "name_zh": product["name_zh"],
            "metadata_verified": True,
        })

    output = {"count": len(updated), "updated": updated}
    Path("mamacook_content_sync_manifest.json").write_text(
        json.dumps(output, ensure_ascii=False, indent=2) + "\n"
    )
    print(json.dumps(output, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
