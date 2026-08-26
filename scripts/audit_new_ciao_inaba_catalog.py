"""Read-only audit of active Stripe products potentially matching the new CIAO/Inaba can batch."""
from __future__ import annotations

import json
import os
from pathlib import Path

import requests

ROOT = Path("/home/ubuntu/mofuhavenhk-github")
OUTPUT_PATH = ROOT / "new_ciao_inaba_active_catalog_audit.json"
API_KEY = os.environ.get("STRIPE_SECRET_KEY")
if not API_KEY:
    raise SystemExit("STRIPE_SECRET_KEY is not set")

KEYWORDS = (
    "ciao",
    "チャオ",
    "とろみ",
    "inaba",
    "いなば",
    "かつまぐろ",
    "katsumaguro",
)


def list_active_products() -> list[dict]:
    products: list[dict] = []
    starting_after: str | None = None
    while True:
        params = {"active": "true", "limit": "100"}
        if starting_after:
            params["starting_after"] = starting_after
        response = requests.get(
            "https://api.stripe.com/v1/products",
            auth=(API_KEY, ""),
            params=params,
            timeout=60,
        )
        response.raise_for_status()
        page = response.json()
        data = page.get("data", [])
        products.extend(data)
        if not page.get("has_more") or not data:
            return products
        starting_after = data[-1]["id"]


def searchable_text(product: dict) -> str:
    metadata = product.get("metadata") or {}
    fields = [product.get("name", ""), product.get("description", "")]
    fields.extend(str(value) for value in metadata.values())
    return " ".join(fields).lower()


def price_summary(product_id: str) -> list[dict]:
    response = requests.get(
        "https://api.stripe.com/v1/prices",
        auth=(API_KEY, ""),
        params={"product": product_id, "active": "true", "currency": "hkd", "limit": "100"},
        timeout=60,
    )
    response.raise_for_status()
    return [
        {"id": price["id"], "unit_amount": price.get("unit_amount"), "metadata": price.get("metadata") or {}}
        for price in response.json().get("data", [])
    ]


def main() -> None:
    active = list_active_products()
    matches = []
    for product in active:
        if not any(keyword in searchable_text(product) for keyword in KEYWORDS):
            continue
        metadata = product.get("metadata") or {}
        matches.append(
            {
                "product_id": product["id"],
                "name": product.get("name"),
                "default_price": product.get("default_price"),
                "mofu_import_key": metadata.get("mofu_import_key"),
                "sku": metadata.get("sku"),
                "name_zh": metadata.get("name_zh"),
                "name_en": metadata.get("name_en"),
                "subcategory": metadata.get("subcategory"),
                "images": product.get("images", []),
                "active_hkd_prices": price_summary(product["id"]),
            }
        )
    output = {"active_product_count": len(active), "matching_product_count": len(matches), "matches": matches}
    OUTPUT_PATH.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(OUTPUT_PATH), "matching_product_count": len(matches)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
