"""Import Complete ytt Chicken Tender Dog Treats as one Product with five real pack variants.

Safe to re-run: the Product is identified by metadata[mofu_import_key]. Each variant
reuses an active HKD Price only when variant_key and amount both match. Checkout
continues to use server-validated Stripe Price IDs.
"""
from __future__ import annotations

import json
import os
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path

import requests

ROOT = Path("/home/ubuntu/mofuhavenhk-github")
MAPPING_PATH = ROOT / "complete_ytt_chicken_tenders_mapping.json"
MANIFEST_PATH = ROOT / "complete_ytt_chicken_tenders_stripe_manifest.json"
API_KEY = os.environ.get("STRIPE_SECRET_KEY")
if not API_KEY:
    raise SystemExit("STRIPE_SECRET_KEY is not set")


def cents(value: float) -> int:
    return int((Decimal(str(value)) * 100).quantize(Decimal("1"), rounding=ROUND_HALF_UP))


def request(method: str, path: str, *, data: dict[str, str] | None = None, params: dict[str, str] | None = None, key: str | None = None) -> dict:
    headers = {"Idempotency-Key": key} if key else None
    response = requests.request(
        method,
        f"https://api.stripe.com/v1/{path}",
        auth=(API_KEY, ""),
        data=data,
        params=params,
        headers=headers,
        timeout=60,
    )
    if not response.ok:
        raise SystemExit(f"Stripe {method} {path} failed ({response.status_code}): {response.text}")
    return response.json()


def active_product_by_import_key(import_key: str) -> dict | None:
    cursor: str | None = None
    while True:
        params = {"active": "true", "limit": "100"}
        if cursor:
            params["starting_after"] = cursor
        page = request("GET", "products", params=params)
        for product in page.get("data", []):
            if (product.get("metadata") or {}).get("mofu_import_key") == import_key:
                return product
        items = page.get("data", [])
        if not page.get("has_more") or not items:
            return None
        cursor = items[-1]["id"]


def product_metadata(mapping: dict) -> dict[str, str]:
    product = mapping["product"]
    rule = mapping["pricing_rule"]
    return {
        "mofu_import_source": MAPPING_PATH.name,
        "mofu_import_key": product["import_key"],
        "variant_mode": "pack_size",
        "variant_schema": "v2",
        "variant_selection_label_zh": "選擇數量／組合",
        "variant_selection_label_en": "Choose quantity / mix",
        "pack_unit": "pack",
        "pack_weight": "20g",
        "brand": product["brand"],
        "category": product["category"],
        "category_zh": "狗狗",
        "subcategory": product["subcategory"],
        "product_type": "chicken tender dog treats",
        "name_zh": product["name_zh"],
        "name_en": product["name_en"],
        "description_zh": product["description_zh"],
        "description_en": product["description_en"],
        "specs_zh": product["specs_zh"],
        "specs_en": product["specs_en"],
        "availability": "現貨",
        "availability_display_zh": "現貨｜20g 犬用雞肉條｜可選不同數量及組合",
        "availability_display_en": "In stock | 20g chicken tender dog treats | Choose quantity and mixed-flavour packs",
        "in_stock": "true",
        "show_when_out_of_stock": "true",
        "image_pending": "false",
        "image_mode": product["image_mode"],
        "tags": "Complete ytt,狗狗小食,犬用雞肉條,20g,多規格",
        "pricing_currency": rule["currency"].lower(),
        "pricing_cny_to_hkd": str(rule["cny_to_hkd"]),
        "pricing_target_product_gross_margin": str(rule["target_product_gross_margin"]),
        "pricing_ship_to_hk_hkd": str(rule["supplier_to_hong_kong_shipping_hkd"]),
        "pricing_rounding": "upward .90",
        "compare_at_price_hkd": "0",
        "compare_at_price_schema": "v1",
        "compare_at_price_currency": "hkd",
    }


def update_or_create_product(mapping: dict) -> dict:
    product_data = mapping["product"]
    metadata = product_metadata(mapping)
    payload = {
        "name": f"{product_data['name_zh']}｜{product_data['name_en']}",
        "description": product_data["description_zh"],
        "images[0]": product_data["image_cdn_url"],
    }
    payload.update({f"metadata[{key}]": value for key, value in metadata.items()})

    existing = active_product_by_import_key(product_data["import_key"])
    if existing:
        return request(
            "POST",
            f"products/{existing['id']}",
            data=payload,
            key="complete-ytt-product-update-v1",
        )
    return request("POST", "products", data=payload, key="complete-ytt-product-create-v1")


def update_or_create_prices(product: dict, mapping: dict) -> list[dict]:
    active_prices = request(
        "GET",
        "prices",
        params={"product": product["id"], "active": "true", "currency": "hkd", "limit": "100"},
    ).get("data", [])

    manifest: list[dict] = []
    for number, variant in enumerate(mapping["variants"], start=1):
        amount = cents(variant["retail_hkd"])
        existing = next(
            (
                price
                for price in active_prices
                if (price.get("metadata") or {}).get("variant_key") == variant["variant_key"]
                and price.get("unit_amount") == amount
            ),
            None,
        )
        action = "reused"
        if not existing:
            price_data = {
                "product": product["id"],
                "currency": "hkd",
                "unit_amount": str(amount),
                "metadata[mofu_import_source]": MAPPING_PATH.name,
                "metadata[mofu_import_key]": mapping["product"]["import_key"],
                "metadata[variant_key]": variant["variant_key"],
                "metadata[variant_sort]": str(number),
                "metadata[pack_count]": str(variant["pack_count"]),
                "metadata[total_sticks]": str(variant["total_sticks"]),
                "metadata[variant_label_zh]": variant["label_zh"],
                "metadata[variant_label_en]": variant["label_en"],
                "metadata[cost_cny]": f"{Decimal(str(variant['cost_cny'])).quantize(Decimal('0.01'))}",
                "metadata[unrounded_retail_hkd]": f"{Decimal(str(variant['unrounded_retail_hkd'])).quantize(Decimal('0.01'))}",
                "metadata[retail_pricing_rule]": "CNY×1.1654/(1-45%), upward .90",
                "metadata[compare_at_price_hkd]": "0",
            }
            existing = request(
                "POST",
                "prices",
                data=price_data,
                key=f"complete-ytt-price-v1-{number}",
            )
            action = "created"
        manifest.append({
            "variant_key": variant["variant_key"],
            "label_zh": variant["label_zh"],
            "cost_cny": variant["cost_cny"],
            "retail_hkd": variant["retail_hkd"],
            "stripe_price_id": existing["id"],
            "stripe_unit_amount": existing["unit_amount"],
            "price_action": action,
        })
    return manifest


def main() -> None:
    mapping = json.loads(MAPPING_PATH.read_text(encoding="utf-8"))
    product = update_or_create_product(mapping)
    variants = update_or_create_prices(product, mapping)
    default_price = variants[0]["stripe_price_id"]
    if product.get("default_price") != default_price:
        product = request(
            "POST",
            f"products/{product['id']}",
            data={"default_price": default_price},
            key="complete-ytt-default-price-v1",
        )

    manifest = {
        "source": MAPPING_PATH.name,
        "image_cdn_url": mapping["product"]["image_cdn_url"],
        "stripe_product_id": product["id"],
        "default_price_id": default_price,
        "variant_count": len(variants),
        "variants": variants,
    }
    MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(manifest, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
