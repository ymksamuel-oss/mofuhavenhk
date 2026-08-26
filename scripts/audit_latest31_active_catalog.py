"""Read-only audit of active Stripe products for the latest 31-image intake batch.

This script never writes to Stripe. It inventories active products, Product metadata,
active HKD prices, and candidate overlap evidence for deterministic SKU mapping.
"""
from __future__ import annotations

import json
import os
from pathlib import Path

import requests

ROOT = Path("/home/ubuntu/mofuhavenhk-github")
OUTPUT = ROOT / "latest31_active_catalog_audit.json"
API_KEY = os.environ.get("STRIPE_SECRET_KEY")
if not API_KEY:
    raise SystemExit("STRIPE_SECRET_KEY is not set")


def stripe_get(path: str, params: dict[str, str]) -> dict:
    response = requests.get(
        f"https://api.stripe.com/v1/{path}",
        auth=(API_KEY, ""),
        params=params,
        timeout=60,
    )
    if not response.ok:
        raise SystemExit(f"Stripe GET {path} failed ({response.status_code}): {response.text}")
    return response.json()


def list_active_products() -> list[dict]:
    products: list[dict] = []
    cursor: str | None = None
    while True:
        params = {"active": "true", "limit": "100"}
        if cursor:
            params["starting_after"] = cursor
        page = stripe_get("products", params)
        items = page.get("data", [])
        products.extend(items)
        if not page.get("has_more") or not items:
            return products
        cursor = items[-1]["id"]


def active_hkd_prices(product_id: str) -> list[dict]:
    page = stripe_get(
        "prices",
        {"product": product_id, "active": "true", "currency": "hkd", "limit": "100"},
    )
    return page.get("data", [])


def normalized_product(product: dict) -> dict:
    metadata = product.get("metadata") or {}
    prices = active_hkd_prices(product["id"])
    return {
        "id": product["id"],
        "active": product.get("active"),
        "name": product.get("name"),
        "description": product.get("description"),
        "images": product.get("images", []),
        "default_price": product.get("default_price"),
        "metadata": metadata,
        "active_hkd_prices": [
            {
                "id": price["id"],
                "unit_amount": price.get("unit_amount"),
                "metadata": price.get("metadata") or {},
            }
            for price in prices
        ],
    }


def main() -> None:
    products = [normalized_product(product) for product in list_active_products()]
    indexed = {
        item["metadata"].get("mofu_import_key"): item
        for item in products
        if item["metadata"].get("mofu_import_key")
    }
    data = {
        "active_product_count": len(products),
        "active_import_key_count": len(indexed),
        "products": products,
        "products_by_import_key": indexed,
    }
    OUTPUT.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "output": str(OUTPUT),
        "active_product_count": data["active_product_count"],
        "active_import_key_count": data["active_import_key_count"],
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
