"""Import new cat litter and Gin no Spoon dry-food products from the approved mapping.

Safe to re-run. Each Stripe Product is identified by metadata[mofu_import_key].
Each active HKD Price is reused only when the variant key and amount both match.
Checkout continues to rebuild all charges from Stripe Price IDs on the server.
"""
from __future__ import annotations

import json
import os
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path

import requests

ROOT = Path("/home/ubuntu/mofuhavenhk-github")
MAPPING_PATH = ROOT / "new_batch_cat_litter_and_dry_food_mapping.json"
IMAGE_URLS_PATH = ROOT / "new_batch_cat_litter_and_dry_food_image_urls.json"
MANIFEST_PATH = ROOT / "new_batch_cat_litter_and_dry_food_stripe_manifest.json"
API_KEY = os.environ.get("STRIPE_SECRET_KEY")
if not API_KEY:
    raise SystemExit("STRIPE_SECRET_KEY is not set")


def cents(value: float) -> int:
    return int((Decimal(str(value)) * 100).quantize(Decimal("1"), rounding=ROUND_HALF_UP))


def request(method: str, path: str, *, data: dict[str, str] | None = None, params: dict[str, str] | None = None, key: str | None = None) -> dict:
    response = requests.request(
        method,
        f"https://api.stripe.com/v1/{path}",
        auth=(API_KEY, ""),
        data=data,
        params=params,
        headers={"Idempotency-Key": key} if key else None,
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


def choice_labels(product: dict) -> tuple[str, str, str]:
    if product["import_key"] == "nyantomo-wood-litter-4-4l-v1":
        return "choice", "選擇顆粒大小", "Choose granule size"
    if product["import_key"] == "pamax-miracle-enzyme-cat-litter-v1":
        return "pack_size", "選擇數量", "Choose quantity"
    return "single", "選擇規格", "Choose specification"


def product_metadata(product: dict, rule: dict) -> dict[str, str]:
    variant_mode, label_zh, label_en = choice_labels(product)
    variant_count = len(product["variants"])
    metadata = {
        "mofu_import_source": MAPPING_PATH.name,
        "mofu_import_key": product["import_key"],
        "variant_mode": variant_mode,
        "variant_schema": "v2",
        "brand": product["brand"],
        "category": product["category"],
        "category_zh": "貓咪",
        "subcategory": product["subcategory"],
        "name_zh": product["name_zh"],
        "name_en": product["name_en"],
        "description_zh": product["description_zh"],
        "description_en": product["description_en"],
        "availability": "現貨",
        "availability_display_zh": "現貨｜日本包裝正品",
        "availability_display_en": "In stock | Original Japanese package",
        "in_stock": "true",
        "show_when_out_of_stock": "true",
        "image_pending": "false",
        "image_mode": "single_clean_main_image",
        "tags": product["tags"],
        "pricing_currency": rule["currency"].lower(),
        "pricing_cny_to_hkd": str(rule["cny_to_hkd"]),
        "pricing_target_product_gross_margin": str(rule["target_product_gross_margin"]),
        "pricing_ship_to_hk_hkd": str(rule["supplier_to_hong_kong_shipping_hkd"]),
        "pricing_rounding": "upward .90",
        "compare_at_price_hkd": "0",
        "compare_at_price_schema": "v1",
        "compare_at_price_currency": "hkd",
    }
    if variant_count > 1:
        metadata["variant_selection_label_zh"] = label_zh
        metadata["variant_selection_label_en"] = label_en
    return metadata


def update_or_create_product(product_data: dict, rule: dict, image_url: str, index: int) -> dict:
    metadata = product_metadata(product_data, rule)
    payload = {
        "name": f"{product_data['name_zh']}｜{product_data['name_en']}",
        "description": product_data["description_zh"],
        "images[0]": image_url,
    }
    payload.update({f"metadata[{key}]": value for key, value in metadata.items()})
    existing = active_product_by_import_key(product_data["import_key"])
    if existing:
        return request("POST", f"products/{existing['id']}", data=payload, key=f"new-batch-product-update-v1-{index}")
    return request("POST", "products", data=payload, key=f"new-batch-product-create-v1-{index}")


def update_or_create_prices(product: dict, product_data: dict, rule: dict, product_index: int) -> list[dict]:
    active_prices = request(
        "GET", "prices", params={"product": product["id"], "active": "true", "currency": "hkd", "limit": "100"}
    ).get("data", [])
    rows: list[dict] = []
    for variant in product_data["variants"]:
        amount = cents(variant["retail_hkd"])
        existing = next(
            (
                price for price in active_prices
                if (price.get("metadata") or {}).get("variant_key") == variant["key"]
                and price.get("unit_amount") == amount
            ),
            None,
        )
        action = "reused"
        if not existing:
            unrounded = Decimal(str(variant["cost_cny"])) * Decimal(str(rule["cny_to_hkd"])) / (Decimal("1") - Decimal(str(rule["target_product_gross_margin"])))
            data = {
                "product": product["id"],
                "currency": "hkd",
                "unit_amount": str(amount),
                "metadata[mofu_import_source]": MAPPING_PATH.name,
                "metadata[mofu_import_key]": product_data["import_key"],
                "metadata[variant_key]": variant["key"],
                "metadata[variant_sort]": str(variant["sort"]),
                "metadata[variant_label_zh]": variant["label_zh"],
                "metadata[variant_label_en]": variant["label_en"],
                "metadata[cost_cny]": f"{Decimal(str(variant['cost_cny'])).quantize(Decimal('0.01'))}",
                "metadata[unrounded_retail_hkd]": f"{unrounded.quantize(Decimal('0.01'))}",
                "metadata[retail_pricing_rule]": "CNY×1.1654/(1-45%), upward .90",
                "metadata[compare_at_price_hkd]": "0",
            }
            existing = request("POST", "prices", data=data, key=f"new-batch-price-v1-{product_index}-{variant['sort']}")
            action = "created"
        rows.append({
            "variant_key": variant["key"],
            "label_zh": variant["label_zh"],
            "cost_cny": variant["cost_cny"],
            "retail_hkd": variant["retail_hkd"],
            "stripe_price_id": existing["id"],
            "stripe_unit_amount": existing["unit_amount"],
            "price_action": action,
        })
    return rows


def main() -> None:
    mapping = json.loads(MAPPING_PATH.read_text(encoding="utf-8"))
    images = json.loads(IMAGE_URLS_PATH.read_text(encoding="utf-8"))
    manifest_products: list[dict] = []
    for index, product_data in enumerate(mapping["products"], start=1):
        image_url = images[product_data["image_output"]]
        product = update_or_create_product(product_data, mapping["pricing_rule"], image_url, index)
        variants = update_or_create_prices(product, product_data, mapping["pricing_rule"], index)
        default_price = variants[0]["stripe_price_id"]
        if product.get("default_price") != default_price:
            product = request(
                "POST", f"products/{product['id']}", data={"default_price": default_price}, key=f"new-batch-default-price-v1-{index}"
            )
        manifest_products.append({
            "import_key": product_data["import_key"],
            "name_zh": product_data["name_zh"],
            "category": product_data["category"],
            "subcategory": product_data["subcategory"],
            "image_cdn_url": image_url,
            "stripe_product_id": product["id"],
            "default_price_id": default_price,
            "variant_count": len(variants),
            "variants": variants,
        })
    manifest = {"source": MAPPING_PATH.name, "product_count": len(manifest_products), "products": manifest_products}
    MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(manifest, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
