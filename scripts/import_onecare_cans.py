#!/usr/bin/env python3
"""Import ONE CARE 100g canned-food flavors as one Product per flavor and tiered HKD Prices.

Safe to re-run: Product identity is metadata[mofu_import_key], and each tier is
reused only when both pack_count and unit amount match. Checkout continues to
use server-validated Stripe Price IDs.
"""
from __future__ import annotations

import csv
import json
import os
from collections import defaultdict
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path

import requests

ROOT = Path("/home/ubuntu/mofuhavenhk-github")
CSV_PATH = Path("/home/ubuntu/upload/MofuHaven_7_Flavors_Tiered_Pricing.csv")
MANIFEST_PATH = ROOT / "onecared_cans_stripe_manifest.json"
API_KEY = os.environ.get("STRIPE_SECRET_KEY")
if not API_KEY:
    raise SystemExit("STRIPE_SECRET_KEY is not set")

IMAGE_URLS = {
    "牛肉口味罐頭 (Beef)": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663854897952/IJxLINXtHjqHVorG.png",
    "雞肉口味罐頭 (Chicken)": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663854897952/jBEHdqCLirHRjaHh.png",
    "雞肝口味罐頭 (Chicken Liver)": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663854897952/PsCfHEAFdUGVgqms.png",
    "新款 2個口味拼罐頭 (New 2-Flavor Mix)": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663854897952/IsrTZRaxQUuVIZPF.png",
    "新款牛肉米飯罐頭 (New Beef & Rice)": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663854897952/ipDIvZxPLDtNnIjD.png",
    "新款牛肉蔬菜罐頭 (New Beef & Vegetables)": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663854897952/NPiLARPuvhFChnOo.png",
    "白身魚口味罐頭 (White Fish)": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663854897952/oDFJcDYdmSXAKsIg.png",
}

CONTENT = {
    "牛肉口味罐頭 (Beef)": {
        "zh": "ONE CARE 牛肉口味 100g 濕糧罐頭，罐裝肉泥質地，適合日常配搭主食或作為餐點變化。提供 5、15 及 30 罐裝選擇。",
        "en": "ONE CARE Beef Flavor 100g wet food can with a smooth pâté-style texture. Choose a 5, 15, or 30-can pack for everyday meal rotation.",
    },
    "雞肉口味罐頭 (Chicken)": {
        "zh": "ONE CARE 雞肉口味 100g 濕糧罐頭，柔軟濕潤的肉泥型態，適合配合日常餵食。提供 5、15 及 30 罐裝選擇。",
        "en": "ONE CARE Chicken Flavor 100g wet food can in a soft, moist pâté-style format. Available in 5, 15, and 30-can packs for everyday feeding.",
    },
    "雞肝口味罐頭 (Chicken Liver)": {
        "zh": "ONE CARE 雞肝口味 100g 濕糧罐頭，細緻肉泥配合可見食材粒感，適合作為日常餐點選擇。提供 5、15 及 30 罐裝。",
        "en": "ONE CARE Chicken Liver Flavor 100g wet food can with a fine pâté texture and visible food pieces. Available in 5, 15, and 30-can packs.",
    },
    "新款 2個口味拼罐頭 (New 2-Flavor Mix)": {
        "zh": "ONE CARE 新款雙口味拼罐頭 100g，以牛肉蔬菜及牛肉米飯兩款口味組合，為日常餐點帶來不同選擇。提供 5、15 及 30 罐裝。",
        "en": "ONE CARE New 2-Flavor Mix 100g canned food combines Beef & Vegetables with Beef & Rice selections for more variety. Available in 5, 15, and 30-can packs.",
    },
    "新款牛肉米飯罐頭 (New Beef & Rice)": {
        "zh": "ONE CARE 新款牛肉米飯 100g 濕糧罐頭，牛肉與米飯配搭的濕潤餐點型態，適合日常輪換。提供 5、15 及 30 罐裝。",
        "en": "ONE CARE New Beef & Rice 100g wet food can, a moist beef-and-rice meal option for everyday rotation. Available in 5, 15, and 30-can packs.",
    },
    "新款牛肉蔬菜罐頭 (New Beef & Vegetables)": {
        "zh": "ONE CARE 新款牛肉蔬菜 100g 濕糧罐頭，牛肉配搭蔬菜的濕潤餐點型態，適合日常輪換。提供 5、15 及 30 罐裝。",
        "en": "ONE CARE New Beef & Vegetables 100g wet food can, a moist beef-and-vegetables meal option for everyday rotation. Available in 5, 15, and 30-can packs.",
    },
    "白身魚口味罐頭 (White Fish)": {
        "zh": "ONE CARE 白身魚口味 100g 濕糧罐頭，柔軟濕潤的魚肉餐點型態，適合配合日常餵食。提供 5、15 及 30 罐裝。",
        "en": "ONE CARE White Fish Flavor 100g wet food can in a soft, moist fish-based meal format. Available in 5, 15, and 30-can packs for everyday feeding.",
    },
}


def cents(value: str) -> int:
    return int((Decimal(value) * 100).quantize(Decimal("1"), rounding=ROUND_HALF_UP))


def post(path: str, data: dict[str, str], key: str) -> dict:
    response = requests.post(
        f"https://api.stripe.com/v1/{path}",
        auth=(API_KEY, ""),
        data=data,
        headers={"Idempotency-Key": key},
        timeout=60,
    )
    response.raise_for_status()
    return response.json()


def get(path: str, params: dict[str, str]) -> dict:
    response = requests.get(
        f"https://api.stripe.com/v1/{path}",
        auth=(API_KEY, ""),
        params=params,
        timeout=60,
    )
    response.raise_for_status()
    return response.json()


def all_active_products() -> dict[str, dict]:
    by_key: dict[str, dict] = {}
    cursor = None
    while True:
        params = {"active": "true", "limit": "100"}
        if cursor:
            params["starting_after"] = cursor
        payload = get("products", params)
        page = payload.get("data", [])
        for product in page:
            key = (product.get("metadata") or {}).get("mofu_import_key")
            if key:
                by_key[key] = product
        if not payload.get("has_more") or not page:
            return by_key
        cursor = page[-1]["id"]


def product_metadata(name: str, name_en: str) -> dict[str, str]:
    content = CONTENT[name]
    return {
        "mofu_import_source": CSV_PATH.name,
        "mofu_import_key": f"onecared-can::{name_en.lower().replace(' ', '-').replace('&', 'and')}",
        "variant_mode": "pack_size",
        "variant_schema": "v1",
        "pack_unit": "can",
        "can_weight": "100g",
        "brand": "ONE CARE",
        "category": "dogs",
        "category_zh": "狗狗",
        "subcategory": "狗狗食品",
        "product_type": "100g wet food can",
        "name_zh": name,
        "name_en": name_en,
        "description_zh": content["zh"],
        "description_en": content["en"],
        "specs_zh": "每罐淨含量：100g｜數量規格：5／15／30罐裝｜產品類型：濕糧罐頭",
        "specs_en": "Net weight: 100g per can | Pack sizes: 5 / 15 / 30 cans | Product type: wet food can",
        "availability": "現貨",
        "availability_display_zh": "現貨｜100g 濕糧罐頭｜可選 5／15／30 罐裝",
        "availability_display_en": "In stock | 100g wet food can | 5 / 15 / 30-can packs available",
        "in_stock": "true",
        "show_when_out_of_stock": "true",
        "image_pending": "false",
        "tags": "ONE CARE,寵物罐頭,濕糧,100g,5罐,15罐,30罐",
        "compare_at_price_hkd": "0",
        "compare_at_price_schema": "v1",
        "compare_at_price_currency": "hkd",
    }


with CSV_PATH.open("r", encoding="utf-8-sig", newline="") as handle:
    rows = list(csv.DictReader(handle))

groups: dict[str, list[dict[str, str]]] = defaultdict(list)
for row in rows:
    groups[row["Product_Name"].strip()].append(row)

existing = all_active_products()
manifest = []
for number, (name, tiers) in enumerate(groups.items(), start=1):
    if len(tiers) != 3 or name not in IMAGE_URLS or name not in CONTENT:
        raise SystemExit(f"Invalid flavor configuration: {name}")
    name_zh, name_en = name.rsplit(" (", 1)
    name_en = name_en.rstrip(")")
    metadata = product_metadata(name, name_en)
    source_key = metadata["mofu_import_key"]
    product = existing.get(source_key)
    product_action = "reused"
    if not product:
        payload = {"name": f"{name_zh}（{name_en}）", "description": metadata["description_zh"], "images[0]": IMAGE_URLS[name]}
        payload.update({f"metadata[{key}]": value for key, value in metadata.items()})
        product = post("products", payload, f"onecared-can-product-v1-{number}")
        product_action = "created"
    else:
        payload = {"name": f"{name_zh}（{name_en}）", "description": metadata["description_zh"], "images[0]": IMAGE_URLS[name]}
        payload.update({f"metadata[{key}]": value for key, value in metadata.items()})
        product = post(f"products/{product['id']}", payload, f"onecared-can-product-update-v1-{number}")

    active_prices = get("prices", {"product": product["id"], "active": "true", "currency": "hkd", "limit": "100"}).get("data", [])
    tier_manifest = []
    for tier_row in sorted(tiers, key=lambda row: int(row["Tier"].replace("罐裝", ""))):
        pack_count = int(tier_row["Tier"].replace("罐裝", ""))
        price_cents = cents(tier_row["Retail_HKD"])
        existing_price = next(
            (price for price in active_prices
             if (price.get("metadata") or {}).get("pack_count") == str(pack_count)
             and price.get("unit_amount") == price_cents),
            None,
        )
        price_action = "reused"
        if not existing_price:
            price_data = {
                "product": product["id"],
                "currency": "hkd",
                "unit_amount": str(price_cents),
                "metadata[mofu_import_source]": CSV_PATH.name,
                "metadata[mofu_import_key]": source_key,
                "metadata[pack_count]": str(pack_count),
                "metadata[variant_label_zh]": f"{pack_count}罐裝",
                "metadata[variant_label_en]": f"{pack_count} Cans",
                "metadata[per_can_hkd]": f"{Decimal(tier_row['Per_Can_Retail']).quantize(Decimal('0.01'))}",
                "metadata[compare_at_price_hkd]": "0",
            }
            existing_price = post("prices", price_data, f"onecared-can-price-v1-{number}-{pack_count}")
            price_action = "created"
        tier_manifest.append({
            "pack_count": pack_count,
            "retail_hkd": tier_row["Retail_HKD"],
            "per_can_hkd": tier_row["Per_Can_Retail"],
            "stripe_price_id": existing_price["id"],
            "stripe_unit_amount": existing_price["unit_amount"],
            "price_action": price_action,
        })

    default_price_id = next(item["stripe_price_id"] for item in tier_manifest if item["pack_count"] == 5)
    if product.get("default_price") != default_price_id:
        product = post(
            f"products/{product['id']}",
            {"default_price": default_price_id},
            f"onecared-can-default-v1-{number}",
        )
    manifest.append({
        "name_zh": name_zh,
        "name_en": name_en,
        "source_key": source_key,
        "stripe_product_id": product["id"],
        "image_url": IMAGE_URLS[name],
        "product_action": product_action,
        "tiers": tier_manifest,
    })

MANIFEST_PATH.write_text(json.dumps({"source": CSV_PATH.name, "flavors": manifest}, ensure_ascii=False, indent=2))
print(json.dumps({"flavor_count": len(manifest), "tier_count": sum(len(item["tiers"]) for item in manifest), "manifest": str(MANIFEST_PATH)}, ensure_ascii=False))
