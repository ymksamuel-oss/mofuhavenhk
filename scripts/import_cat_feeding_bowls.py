#!/usr/bin/env python3
"""Import the user-provided cat feeding bowls as clean-image Stripe products.

Safe to re-run: each product is identified by metadata[mofu_import_key]. Active
HKD Prices are reused only when the option key and unit amount match. Client
price is never trusted; Checkout continues to validate every Stripe Price ID.
"""
from __future__ import annotations

import json
import os
import re
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path

import requests

ROOT = Path("/home/ubuntu/mofuhavenhk-github")
MAPPING_PATH = ROOT / "cat_feeding_bowls_mapping.json"
MANIFEST_PATH = ROOT / "cat_feeding_bowls_stripe_manifest.json"
API_KEY = os.environ.get("STRIPE_SECRET_KEY")
if not API_KEY:
    raise SystemExit("STRIPE_SECRET_KEY is not set")


def cents(value: float) -> int:
    return int((Decimal(str(value)) * 100).quantize(Decimal("1"), rounding=ROUND_HALF_UP))


def slug(value: str) -> str:
    normalized = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return normalized or "option"


def request(method: str, path: str, *, data: dict[str, str] | None = None,
            params: dict[str, str] | None = None, key: str | None = None) -> dict:
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
        rows = page.get("data", [])
        if not page.get("has_more") or not rows:
            return None
        cursor = rows[-1]["id"]


def product_metadata(item: dict, pricing: dict) -> dict[str, str]:
    is_multi_option = len(item["variants"]) > 1
    return {
        "mofu_import_source": MAPPING_PATH.name,
        "mofu_import_key": item["import_key"],
        "variant_mode": "option" if is_multi_option else "single",
        "variant_schema": "v2",
        "variant_selection_type": "pattern_color",
        "variant_selection_label_zh": "選擇圖案／顏色",
        "variant_selection_label_en": "Choose pattern / colour",
        "category": "lifestyle",
        "subcategory": "食具及餵食",
        "pet_type": "cats",
        "product_type": "ceramic cat feeding bowl",
        "name_zh": item["name_zh"],
        "name_en": item["name_en"],
        "description_zh": item["description_zh"],
        "description_en": item["description_en"],
        "specs_zh": item["description_zh"],
        "specs_en": item["description_en"],
        "availability": "現貨",
        "availability_display_zh": "現貨｜陶瓷貓咪食具",
        "availability_display_en": "In stock | Ceramic cat feeding bowl",
        "in_stock": "true",
        "show_when_out_of_stock": "true",
        "image_mode": "cleaned_single_main_image",
        "image_pending": "false",
        "tags": "貓咪食盤,貓咪用品,陶瓷食具,食具及餵食",
        "pricing_currency": pricing["currency_cost"].lower(),
        "pricing_cny_to_hkd": str(pricing["cny_to_hkd"]),
        "pricing_target_product_gross_margin": str(pricing["target_product_margin"]),
        "pricing_ship_to_hk_hkd": str(pricing["source_shipping_hkd"]),
        "pricing_rounding": "upward .90",
        "compare_at_price_hkd": "0",
        "compare_at_price_schema": "v1",
        "compare_at_price_currency": "hkd",
    }


def update_or_create_product(item: dict, pricing: dict) -> dict:
    metadata = product_metadata(item, pricing)
    data = {
        "name": f"{item['name_zh']}｜{item['name_en']}",
        "description": item["description_zh"],
        "images[0]": item["source_image"],
    }
    data.update({f"metadata[{key}]": value for key, value in metadata.items()})
    existing = active_product_by_import_key(item["import_key"])
    if existing:
        return request("POST", f"products/{existing['id']}", data=data, key=f"{item['import_key']}-product-update-v1")
    return request("POST", "products", data=data, key=f"{item['import_key']}-product-create-v1")


def update_or_create_prices(product: dict, item: dict, pricing: dict) -> list[dict]:
    active_prices = request(
        "GET", "prices",
        params={"product": product["id"], "active": "true", "currency": "hkd", "limit": "100"},
    ).get("data", [])
    result: list[dict] = []
    for index, option in enumerate(item["variants"], start=1):
        # New mappings use semantic keys and explicit images. The string branch is
        # retained for backwards compatibility with older mapping files.
        if isinstance(option, str):
            variant_key = f"option-{index}"
            label_zh = option
            label_en = "Option " + str(index)
            image_url = ""
        else:
            variant_key = str(option.get("key", "")).strip()
            label_zh = str(option.get("label_zh", "")).strip()
            label_en = str(option.get("label_en", "")).strip() or "Option " + str(index)
            image_url = str(option.get("image", "")).strip()
        if not variant_key or not label_zh:
            raise SystemExit(f"{item['import_key']} option {index}: key and label_zh are required")

        amount = cents(item["retail_hkd"])
        existing = next(
            (price for price in active_prices
             if (price.get("metadata") or {}).get("variant_key") == variant_key
             and price.get("unit_amount") == amount),
            None,
        )
        # Reuse legacy index-key Prices by label once, then upgrade their metadata
        # in place. This keeps Stripe Price IDs and existing basket references safe.
        if not existing:
            existing = next(
                (price for price in active_prices
                 if (price.get("metadata") or {}).get("variant_label_zh", "").strip() == label_zh
                 and price.get("unit_amount") == amount),
                None,
            )
        action = "reused"
        if not existing:
            price_data = {
                "product": product["id"],
                "currency": "hkd",
                "unit_amount": str(amount),
                "metadata[mofu_import_source]": MAPPING_PATH.name,
                "metadata[mofu_import_key]": item["import_key"],
                "metadata[variant_key]": variant_key,
                "metadata[variant_sort]": str(index),
                "metadata[variant_label_zh]": label_zh,
                "metadata[variant_label_en]": label_en,
                "metadata[cost_cny]": f"{Decimal(str(item['cost_cny'])).quantize(Decimal('0.01'))}",
                "metadata[unrounded_retail_hkd]": f"{Decimal(str(item['base_price_hkd'])).quantize(Decimal('0.01'))}",
                "metadata[retail_pricing_rule]": "CNY×1.1654/(1-45%), upward .90",
                "metadata[compare_at_price_hkd]": "0",
            }
            if image_url:
                price_data["metadata[variant_image_url]"] = image_url
            existing = request("POST", "prices", data=price_data, key=f"{item['import_key']}-price-v2-{index}")
            action = "created"
        else:
            current_metadata = existing.get("metadata") or {}
            desired_metadata = {
                "mofu_import_source": MAPPING_PATH.name,
                "mofu_import_key": item["import_key"],
                "variant_key": variant_key,
                "variant_sort": str(index),
                "variant_label_zh": label_zh,
                "variant_label_en": label_en,
            }
            if image_url:
                desired_metadata["variant_image_url"] = image_url
            metadata_updates = {
                f"metadata[{key}]": value
                for key, value in desired_metadata.items()
                if current_metadata.get(key) != value
            }
            if metadata_updates:
                existing = request(
                    "POST",
                    f"prices/{existing['id']}",
                    data=metadata_updates,
                    key=f"{item['import_key']}-price-metadata-v2-{index}",
                )
                action = "metadata_updated"
        result.append({
            "variant_key": variant_key,
            "label_zh": label_zh,
            "label_en": label_en,
            "image": image_url or None,
            "retail_hkd": item["retail_hkd"],
            "stripe_price_id": existing["id"],
            "stripe_unit_amount": existing["unit_amount"],
            "price_action": action,
        })
    return result


def main() -> None:
    mapping = json.loads(MAPPING_PATH.read_text(encoding="utf-8"))
    pricing = mapping["pricing_basis"]
    records: list[dict] = []
    for item in mapping["products"]:
        product = update_or_create_product(item, pricing)
        variants = update_or_create_prices(product, item, pricing)
        default_price_id = variants[0]["stripe_price_id"]
        if (product.get("default_price") or "") != default_price_id:
            product = request(
                "POST", f"products/{product['id']}",
                data={"default_price": default_price_id},
                key=f"{item['import_key']}-default-price-v1",
            )
        records.append({
            "import_key": item["import_key"],
            "name_zh": item["name_zh"],
            "stripe_product_id": product["id"],
            "image_cdn_url": item["source_image"],
            "default_price_id": default_price_id,
            "variant_count": len(variants),
            "variants": variants,
        })
    manifest = {"source": MAPPING_PATH.name, "product_count": len(records), "products": records}
    MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(manifest, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
