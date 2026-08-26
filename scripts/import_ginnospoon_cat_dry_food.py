"""Import Gin no Spoon Mitsuboshi Gourmet dry cat food from the approved mapping.

Safe to re-run: active products are identified by metadata[mofu_import_key]. Each
product reuses its active HKD Price only if the import key and amount still match.
Checkout continues to use server-validated Stripe Price IDs.
"""
from __future__ import annotations

import json
import os
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path

import requests

ROOT = Path("/home/ubuntu/mofuhavenhk-github")
MAPPING_PATH = ROOT / "ginnospoon_cat_dry_food_mapping.json"
MANIFEST_PATH = ROOT / "ginnospoon_cat_dry_food_stripe_manifest.json"
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


def product_metadata(item: dict, pricing_rule: dict) -> dict[str, str]:
    return {
        "mofu_import_source": MAPPING_PATH.name,
        "mofu_import_key": item["import_key"],
        "brand": item["brand"],
        "category": "cats",
        "category_zh": "貓咪商品",
        "subcategory": "貓乾糧",
        "product_type": "cat dry food",
        "name_zh": item["name_zh"],
        "name_en": item["name_en"],
        "description_zh": item["description_zh"],
        "description_en": item["description_en"],
        "specs_zh": item["specs_zh"],
        "specs_en": item["specs_en"],
        "life_stage_zh": item["life_stage_zh"],
        "life_stage_en": item["life_stage_en"],
        "availability": "現貨",
        "availability_display_zh": f"現貨｜{item['weight']}｜日本包裝小袋分裝",
        "availability_display_en": f"In stock | {item['weight']} | Japanese small-portion packs",
        "in_stock": "true",
        "show_when_out_of_stock": "true",
        "image_pending": "false",
        "image_mode": "faithful_clean_white_background",
        "tags": item["tags"],
        "pricing_currency": pricing_rule["currency"].lower(),
        "pricing_cny_to_hkd": str(pricing_rule["cny_to_hkd"]),
        "pricing_target_product_gross_margin": str(pricing_rule["target_product_gross_margin"]),
        "pricing_ship_to_hk_hkd": str(pricing_rule["supplier_to_hong_kong_shipping_hkd"]),
        "pricing_rounding": pricing_rule["rounding"],
        "compare_at_price_hkd": "0",
        "compare_at_price_schema": "v1",
        "compare_at_price_currency": "hkd",
    }


def update_or_create_product(item: dict, pricing_rule: dict, index: int) -> dict:
    metadata = product_metadata(item, pricing_rule)
    payload = {
        "name": f"{item['name_zh']}｜{item['name_en']}",
        "description": item["description_zh"],
        "images[0]": item["image_cdn_url"],
    }
    payload.update({f"metadata[{key}]": value for key, value in metadata.items()})
    existing = active_product_by_import_key(item["import_key"])
    if existing:
        return request("POST", f"products/{existing['id']}", data=payload, key=f"ginnospoon-product-update-v1-{index}")
    return request("POST", "products", data=payload, key=f"ginnospoon-product-create-v1-{index}")


def update_or_create_price(product: dict, item: dict, pricing_rule: dict, index: int) -> tuple[dict, str]:
    amount = cents(item["retail_hkd"])
    active_prices = request(
        "GET",
        "prices",
        params={"product": product["id"], "active": "true", "currency": "hkd", "limit": "100"},
    ).get("data", [])
    existing = next(
        (
            price for price in active_prices
            if (price.get("metadata") or {}).get("mofu_import_key") == item["import_key"]
            and price.get("unit_amount") == amount
        ),
        None,
    )
    if existing:
        return existing, "reused"

    price_data = {
        "product": product["id"],
        "currency": "hkd",
        "unit_amount": str(amount),
        "metadata[mofu_import_source]": MAPPING_PATH.name,
        "metadata[mofu_import_key]": item["import_key"],
        "metadata[variant_key]": "single",
        "metadata[variant_sort]": "1",
        "metadata[variant_label_zh]": item["weight"],
        "metadata[variant_label_en]": item["weight"],
        "metadata[cost_cny]": f"{Decimal(str(item['cost_cny'])).quantize(Decimal('0.01'))}",
        "metadata[unrounded_retail_hkd]": f"{Decimal(str(item['unrounded_retail_hkd'])).quantize(Decimal('0.01'))}",
        "metadata[retail_pricing_rule]": "CNY×1.1654/(1-45%), upward .90",
        "metadata[compare_at_price_hkd]": "0",
    }
    return request("POST", "prices", data=price_data, key=f"ginnospoon-price-create-v1-{index}"), "created"


def main() -> None:
    mapping = json.loads(MAPPING_PATH.read_text(encoding="utf-8"))
    pricing_rule = mapping["pricing_rule"]
    manifest_items: list[dict] = []

    for index, item in enumerate(mapping["products"], start=1):
        product = update_or_create_product(item, pricing_rule, index)
        price, price_action = update_or_create_price(product, item, pricing_rule, index)
        if product.get("default_price") != price["id"]:
            product = request(
                "POST",
                f"products/{product['id']}",
                data={"default_price": price["id"]},
                key=f"ginnospoon-default-price-v1-{index}",
            )
        manifest_items.append({
            "import_key": item["import_key"],
            "name_zh": item["name_zh"],
            "stripe_product_id": product["id"],
            "stripe_price_id": price["id"],
            "retail_hkd": item["retail_hkd"],
            "price_action": price_action,
            "image_cdn_url": item["image_cdn_url"],
        })

    manifest = {
        "source": MAPPING_PATH.name,
        "product_count": len(manifest_items),
        "products": manifest_items,
    }
    MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(manifest, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
