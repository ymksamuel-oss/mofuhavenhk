"""Safely import the authoritative 20-item Japanese snack order into live Stripe.

The script never fuzzy-matches existing products. It identifies records only by the
exact metadata[mofu_import_key] value. Run without --apply for a read-only
preflight. Run with --apply only after the preflight confirms zero collisions.
"""
from __future__ import annotations

import argparse
import json
import os
import re
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path
from typing import Any

import requests

ROOT = Path("/home/ubuntu/mofuhavenhk-github")
MAPPING_PATH = ROOT / "new_snacks_image_mapping.json"
CDN_MANIFEST_PATH = ROOT / "new_snacks_cdn_manifest.json"
OUTPUT_MANIFEST_PATH = ROOT / "new_snacks_stripe_manifest.json"
SOURCE_DOCUMENT = "MofuHaven_Order_For_Boss.md"
API_KEY = os.environ.get("STRIPE_SECRET_KEY")
if not API_KEY:
    raise SystemExit("STRIPE_SECRET_KEY is not set")


def hkd_cents(value: int | float | str) -> int:
    return int((Decimal(str(value)) * 100).quantize(Decimal("1"), rounding=ROUND_HALF_UP))


def key_slug(value: str) -> str:
    cleaned = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    if not cleaned:
        raise ValueError(f"Cannot make import key from {value!r}")
    return cleaned


def import_key(item: dict[str, Any]) -> str:
    return f"snack-order-2026::{key_slug(item['name_en'])}"


def get(path: str, params: dict[str, str]) -> dict[str, Any]:
    response = requests.get(
        f"https://api.stripe.com/v1/{path}",
        auth=(API_KEY, ""),
        params=params,
        timeout=60,
    )
    response.raise_for_status()
    return response.json()


def post(path: str, data: dict[str, str], idempotency_key: str) -> dict[str, Any]:
    response = requests.post(
        f"https://api.stripe.com/v1/{path}",
        auth=(API_KEY, ""),
        data=data,
        headers={"Idempotency-Key": idempotency_key},
        timeout=60,
    )
    response.raise_for_status()
    return response.json()


def list_active_products_by_key() -> dict[str, dict[str, Any]]:
    by_key: dict[str, dict[str, Any]] = {}
    starting_after: str | None = None
    while True:
        params = {"active": "true", "limit": "100"}
        if starting_after:
            params["starting_after"] = starting_after
        page = get("products", params)
        products = page.get("data", [])
        for product in products:
            source_key = (product.get("metadata") or {}).get("mofu_import_key")
            if source_key:
                if source_key in by_key:
                    raise RuntimeError(f"Duplicate active Stripe products share mofu_import_key={source_key}")
                by_key[source_key] = product
        if not page.get("has_more") or not products:
            return by_key
        starting_after = products[-1]["id"]


def active_hkd_prices(product_id: str) -> list[dict[str, Any]]:
    page = get(
        "prices",
        {"product": product_id, "active": "true", "currency": "hkd", "limit": "100"},
    )
    if page.get("has_more"):
        raise RuntimeError(f"More than 100 active HKD prices found for {product_id}; aborting")
    return page.get("data", [])


def text_for_item(item: dict[str, Any]) -> tuple[str, str, str, str]:
    is_dog = item["category"] == "dogs"
    name_zh = item["name_zh"]
    name_en = item["name_en"]
    spec = item["spec"]
    if is_dog:
        description_zh = (
            f"{name_zh}為狗狗日常小食，規格 {spec}。包裝所示為雞肉風味夾心捲；"
            "請按原包裝建議份量餵食，並提供充足清水。"
        )
        description_en = (
            f"{name_en} is an everyday dog treat in a {spec} pack. The package identifies a chicken-flavour filled roll; "
            "follow the feeding guidance on the original packaging and provide fresh water."
        )
        texture_zh = "捲狀小食；實際口感請以原包裝為準。"
        texture_en = "Roll-style treat; refer to the original packaging for the actual texture."
    else:
        description_zh = (
            f"{name_zh}為貓咪日常小食，規格 {spec}。產品名稱沿用原包裝所示系列與口味標示；"
            "不作醫療或治療用途宣稱，請按原包裝建議份量餵食。"
        )
        description_en = (
            f"{name_en} is an everyday cat treat in a {spec} pack. Its series and flavour wording follows the original packaging; "
            "no medical or treatment claim is made. Follow the feeding guidance on the original packaging."
        )
        texture_zh = "獨立小包裝小食；實際口感請以原包裝為準。"
        texture_en = "Portioned mini-pack treats; refer to the original packaging for the actual texture."
    return description_zh, description_en, texture_zh, texture_en


def product_metadata(item: dict[str, Any]) -> dict[str, str]:
    description_zh, description_en, texture_zh, texture_en = text_for_item(item)
    is_dog = item["category"] == "dogs"
    subcategory = "狗狗小食" if is_dog else "貓貓小食"
    pet_label_zh = "狗狗" if is_dog else "貓咪"
    pet_label_en = "Dog" if is_dog else "Cat"
    brand = "DoggyMan" if is_dog else "COMBO Present"
    return {
        "mofu_import_source": SOURCE_DOCUMENT,
        "mofu_import_key": import_key(item),
        "mofu_import_schema": "japanese-snacks-v1",
        "brand": brand,
        "category": item["category"],
        "category_zh": pet_label_zh,
        "subcategory": subcategory,
        "product_type": item["type"],
        "name_zh": item["name_zh"],
        "name_en": item["name_en"],
        "description_zh": description_zh,
        "description_en": description_en,
        "texture_zh": texture_zh,
        "texture_en": texture_en,
        "specs_zh": f"規格：{item['spec']}｜類型：{subcategory}｜包裝：原裝零售包裝",
        "specs_en": f"Size: {item['spec']} | Type: {subcategory} | Packaging: original retail pack",
        "availability": "現貨",
        "availability_display_zh": f"現貨｜{item['spec']}｜適合{pet_label_zh}",
        "availability_display_en": f"In stock | {item['spec']} | For {pet_label_en}s",
        "in_stock": "true",
        "show_when_out_of_stock": "false",
        "image_pending": "false",
        "tags": f"{brand},{subcategory},{item['spec']},{pet_label_zh}小食,日本寵物小食",
        "compare_at_price_hkd": str(item["compare_at_hkd"]),
        "compare_at_price_schema": "v1",
        "compare_at_price_currency": "hkd",
    }


def display_name(item: dict[str, Any]) -> str:
    return f"{item['name_zh']}｜{item['name_en']}"


def expected_price(item: dict[str, Any]) -> int:
    return hkd_cents(item["retail_hkd"])


def validate_existing_product(product: dict[str, Any], item: dict[str, Any]) -> dict[str, Any] | None:
    key = import_key(item)
    metadata = product.get("metadata") or {}
    if metadata.get("mofu_import_key") != key:
        raise RuntimeError(f"Product {product['id']} does not carry its expected exact import key")
    if product.get("name") != display_name(item):
        raise RuntimeError(
            f"Collision: {key} is attached to {product['id']} with an unexpected name {product.get('name')!r}"
        )
    if metadata.get("name_zh") != item["name_zh"] or metadata.get("name_en") != item["name_en"]:
        raise RuntimeError(f"Collision: {key} has unexpected bilingual name metadata on {product['id']}")
    if metadata.get("compare_at_price_hkd") != str(item["compare_at_hkd"]):
        raise RuntimeError(f"Collision: {key} has an unexpected compare-at price on {product['id']}")

    prices = active_hkd_prices(product["id"])
    matching = [
        price for price in prices
        if (price.get("metadata") or {}).get("mofu_import_key") == key
        and price.get("unit_amount") == expected_price(item)
    ]
    if len(matching) > 1:
        raise RuntimeError(f"Collision: {key} has more than one matching active HKD price")
    unexpected = [price for price in prices if price not in matching]
    if unexpected:
        raise RuntimeError(f"Collision: {key} has unexpected active HKD prices; manual review required")
    return matching[0] if matching else None


def preflight(items: list[dict[str, Any]], cdn_images: dict[str, Any], existing: dict[str, dict[str, Any]]) -> list[dict[str, Any]]:
    if len(items) != 20:
        raise RuntimeError(f"Expected exactly 20 products, got {len(items)}")
    keys: set[str] = set()
    plan: list[dict[str, Any]] = []
    for item in items:
        key = import_key(item)
        if key in keys:
            raise RuntimeError(f"Duplicate import key: {key}")
        keys.add(key)
        image_ref = cdn_images.get(item["image"])
        if not image_ref or not image_ref.get("cdn_url"):
            raise RuntimeError(f"Missing cleaned CDN image URL for {item['image']}")
        if item["retail_hkd"] <= 0 or item["compare_at_hkd"] <= item["retail_hkd"]:
            raise RuntimeError(f"Invalid retail/compare-at prices for {key}")
        if item["category"] not in {"dogs", "cats"}:
            raise RuntimeError(f"Unsupported category for {key}")

        current = existing.get(key)
        current_price = validate_existing_product(current, item) if current else None
        plan.append({
            "source_key": key,
            "name_zh": item["name_zh"],
            "name_en": item["name_en"],
            "image": item["image"],
            "image_url": image_ref["cdn_url"],
            "retail_hkd": item["retail_hkd"],
            "compare_at_hkd": item["compare_at_hkd"],
            "category": item["category"],
            "existing_product_id": current["id"] if current else None,
            "existing_price_id": current_price["id"] if current_price else None,
            "planned_product_action": "update" if current else "create",
            "planned_price_action": "reuse" if current_price else "create",
        })
    return plan


def form_metadata(metadata: dict[str, str]) -> dict[str, str]:
    return {f"metadata[{key}]": value for key, value in metadata.items()}


def apply_item(item: dict[str, Any], image_url: str, current: dict[str, Any] | None, current_price: dict[str, Any] | None, index: int) -> dict[str, Any]:
    key = import_key(item)
    metadata = product_metadata(item)
    payload = {
        "name": display_name(item),
        "description": metadata["description_zh"],
        "images[0]": image_url,
    }
    payload.update(form_metadata(metadata))

    if current:
        product = post(f"products/{current['id']}", payload, f"mofu-japanese-snack-product-update-v1-{index}")
        product_action = "updated"
    else:
        product = post("products", payload, f"mofu-japanese-snack-product-create-v1-{index}")
        product_action = "created"

    if current_price:
        price = current_price
        price_action = "reused"
    else:
        price_payload = {
            "product": product["id"],
            "currency": "hkd",
            "unit_amount": str(expected_price(item)),
            "metadata[mofu_import_source]": SOURCE_DOCUMENT,
            "metadata[mofu_import_key]": key,
            "metadata[mofu_import_schema]": "japanese-snacks-v1",
            "metadata[compare_at_price_hkd]": str(item["compare_at_hkd"]),
            "metadata[variant_label_zh]": item["spec"],
            "metadata[variant_label_en]": item["spec"],
        }
        price = post("prices", price_payload, f"mofu-japanese-snack-price-create-v1-{index}")
        price_action = "created"

    if product.get("default_price") != price["id"]:
        product = post(
            f"products/{product['id']}",
            {"default_price": price["id"]},
            f"mofu-japanese-snack-default-price-v1-{index}",
        )

    return {
        "source_key": key,
        "name_zh": item["name_zh"],
        "name_en": item["name_en"],
        "source_image": item["image"],
        "clean_image_url": image_url,
        "retail_hkd": item["retail_hkd"],
        "compare_at_hkd": item["compare_at_hkd"],
        "category": item["category"],
        "subcategory": "狗狗小食" if item["category"] == "dogs" else "貓貓小食",
        "stripe_product_id": product["id"],
        "stripe_price_id": price["id"],
        "stripe_unit_amount": price["unit_amount"],
        "product_action": product_action,
        "price_action": price_action,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="Create/update Stripe records after preflight passes")
    args = parser.parse_args()

    mapping = json.loads(MAPPING_PATH.read_text(encoding="utf-8"))
    cdn_manifest = json.loads(CDN_MANIFEST_PATH.read_text(encoding="utf-8"))
    items = mapping.get("products", [])
    excluded = mapping.get("excluded_images", [])
    if [entry.get("file") for entry in excluded] != ["IMG_1521.PNG"]:
        raise RuntimeError("Unexpected excluded image list; refusing to import")

    existing = list_active_products_by_key()
    plan = preflight(items, cdn_manifest.get("images", {}), existing)
    summary = {
        "mode": "apply" if args.apply else "preflight",
        "expected_product_count": 20,
        "expected_price_count": 20,
        "excluded_image": "IMG_1521.PNG",
        "products_to_create": sum(entry["planned_product_action"] == "create" for entry in plan),
        "products_to_update": sum(entry["planned_product_action"] == "update" for entry in plan),
        "prices_to_create": sum(entry["planned_price_action"] == "create" for entry in plan),
        "prices_to_reuse": sum(entry["planned_price_action"] == "reuse" for entry in plan),
        "plan": plan,
    }
    if not args.apply:
        print(json.dumps(summary, ensure_ascii=False, indent=2))
        return

    imported = []
    for index, item in enumerate(items, start=1):
        source_key = import_key(item)
        existing_product = existing.get(source_key)
        existing_price = validate_existing_product(existing_product, item) if existing_product else None
        image_url = cdn_manifest["images"][item["image"]]["cdn_url"]
        imported.append(apply_item(item, image_url, existing_product, existing_price, index))

    output = {
        "source_document": SOURCE_DOCUMENT,
        "excluded_image": "IMG_1521.PNG",
        "product_count": len(imported),
        "price_count": len(imported),
        "products": imported,
    }
    OUTPUT_MANIFEST_PATH.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "product_count": len(imported),
        "price_count": len(imported),
        "manifest": str(OUTPUT_MANIFEST_PATH),
        "excluded_image": "IMG_1521.PNG",
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
