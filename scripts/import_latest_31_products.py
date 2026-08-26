"""Safely import the final 31-image Mofu Haven catalog batch into Stripe.

Default mode is a read-only preflight. --apply creates only mapping-approved new
products/prices and refreshes images only for exact, verified existing import keys.
No fuzzy matching is used, and client-side prices remain irrelevant to charging.
"""
from __future__ import annotations

import argparse
import json
import os
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path
from typing import Any

import requests

ROOT = Path("/home/ubuntu/mofuhavenhk-github")
MAPPING_PATH = ROOT / "latest_31_product_mapping.json"
MANIFEST_PATH = ROOT / "latest31_stripe_manifest.json"
SCHEMA = "latest31-product-import-v1"
SOURCE = MAPPING_PATH.name
API_KEY = os.environ.get("STRIPE_SECRET_KEY")
if not API_KEY:
    raise SystemExit("STRIPE_SECRET_KEY is not set")


def cents(value: str | float | int) -> int:
    return int((Decimal(str(value)) * 100).quantize(Decimal("1"), rounding=ROUND_HALF_UP))


def api_get(path: str, params: dict[str, str]) -> dict[str, Any]:
    response = requests.get(
        f"https://api.stripe.com/v1/{path}", auth=(API_KEY, ""), params=params, timeout=60
    )
    if not response.ok:
        raise RuntimeError(f"Stripe GET {path} failed ({response.status_code}): {response.text}")
    return response.json()


def api_post(path: str, data: dict[str, str], idempotency_key: str) -> dict[str, Any]:
    response = requests.post(
        f"https://api.stripe.com/v1/{path}",
        auth=(API_KEY, ""),
        data=data,
        headers={"Idempotency-Key": idempotency_key},
        timeout=60,
    )
    if not response.ok:
        raise RuntimeError(f"Stripe POST {path} failed ({response.status_code}): {response.text}")
    return response.json()


def form_metadata(values: dict[str, str]) -> dict[str, str]:
    return {f"metadata[{key}]": value for key, value in values.items()}


def active_products_by_key() -> dict[str, dict[str, Any]]:
    records: dict[str, dict[str, Any]] = {}
    cursor: str | None = None
    while True:
        params = {"active": "true", "limit": "100"}
        if cursor:
            params["starting_after"] = cursor
        page = api_get("products", params)
        products = page.get("data", [])
        for product in products:
            key = (product.get("metadata") or {}).get("mofu_import_key")
            if key:
                if key in records:
                    raise RuntimeError(f"Duplicate active Stripe Product import key: {key}")
                records[key] = product
        if not page.get("has_more") or not products:
            return records
        cursor = products[-1]["id"]


def active_hkd_prices(product_id: str) -> list[dict[str, Any]]:
    page = api_get("prices", {"product": product_id, "active": "true", "currency": "hkd", "limit": "100"})
    if page.get("has_more"):
        raise RuntimeError(f"More than 100 active HKD prices found for {product_id}")
    return page.get("data", [])


def display_name(item: dict[str, Any]) -> str:
    return f"{item['name_zh']}｜{item['name_en']}"


def product_metadata(item: dict[str, Any]) -> dict[str, str]:
    return {
        "mofu_import_source": SOURCE,
        "mofu_import_key": item["import_key"],
        "mofu_import_schema": SCHEMA,
        "sku": item["sku"],
        "brand": item["brand"],
        "category": "cats",
        "category_zh": "貓咪商品",
        "subcategory": item["subcategory"],
        "product_type": item["product_type"],
        "family": item["family"],
        "name_zh": item["name_zh"],
        "name_en": item["name_en"],
        "description_zh": item["description_zh"],
        "description_en": item["description_en"],
        "specs_zh": item["specs_zh"],
        "specs_en": item["specs_en"],
        "life_stage_zh": item["life_stage_zh"],
        "life_stage_en": item["life_stage_en"],
        "availability": "現貨",
        "availability_display_zh": f"現貨｜{item['specs_zh']}｜日本原裝",
        "availability_display_en": f"In stock | {item['specs_en']} | Japanese retail pack",
        "in_stock": "true",
        "show_when_out_of_stock": "false",
        "image_pending": "false",
        "image_mode": "faithful_clean_white_background",
        "tags": ",".join(item["tags"]),
        "pricing_currency": "hkd",
        "pricing_cny_to_hkd": "1.1654",
        "pricing_target_product_gross_margin": "0.45",
        "pricing_ship_to_hk_hkd": "0.00",
        "pricing_rounding": "upward .90",
        "compare_at_price_hkd": "0",
        "compare_at_price_schema": "v1",
        "compare_at_price_currency": "hkd",
    }


def validate_new_product(existing: dict[str, Any], item: dict[str, Any]) -> dict[str, Any] | None:
    metadata = existing.get("metadata") or {}
    if metadata.get("mofu_import_key") != item["import_key"]:
        raise RuntimeError(f"Product {existing['id']} does not match expected import key")
    if existing.get("name") != display_name(item):
        raise RuntimeError(f"Collision: existing {item['import_key']} has a different name")
    for field in ("sku", "name_zh", "name_en", "category", "subcategory", "product_type"):
        expected = item[field] if field in item else "cats"
        if metadata.get(field) != expected:
            raise RuntimeError(f"Collision: {item['import_key']} has unexpected {field}")
    prices = active_hkd_prices(existing["id"])
    expected_cents = cents(item["retail_hkd"])
    matched = [
        price for price in prices
        if (price.get("metadata") or {}).get("mofu_import_key") == item["import_key"]
        and price.get("unit_amount") == expected_cents
    ]
    if len(matched) > 1:
        raise RuntimeError(f"Collision: {item['import_key']} has more than one matching active price")
    unrelated = [price for price in prices if price not in matched]
    if unrelated:
        raise RuntimeError(f"Collision: {item['import_key']} has an unexpected active HKD Price")
    return matched[0] if matched else None


def validate_existing_image_product(product: dict[str, Any], item: dict[str, Any]) -> dict[str, Any]:
    if not product:
        raise RuntimeError(f"Existing Product key is missing: {item['existing_import_key']}")
    md = product.get("metadata") or {}
    if md.get("mofu_import_key") != item["existing_import_key"]:
        raise RuntimeError(f"Unexpected import key on existing Product {product['id']}")
    if md.get("name_zh") != item["expected_name_zh"] or md.get("name_en") != item["expected_name_en"]:
        raise RuntimeError(f"Existing Product identity changed for {item['existing_import_key']}")
    expected_name = f"{item['expected_name_zh']}｜{item['expected_name_en']}"
    if product.get("name") != expected_name:
        raise RuntimeError(f"Existing Product display name changed for {item['existing_import_key']}")
    expected_cents = cents(item["expected_retail_hkd"])
    prices = active_hkd_prices(product["id"])
    matches = [price for price in prices if price.get("unit_amount") == expected_cents]
    if len(matches) != 1:
        raise RuntimeError(f"Expected exactly one HKD {item['expected_retail_hkd']} active price for {item['existing_import_key']}")
    return matches[0]


def validate_mapping(mapping: dict[str, Any], active: dict[str, dict[str, Any]]) -> list[dict[str, Any]]:
    if mapping.get("schema") != "latest31-product-mapping-v1":
        raise RuntimeError("Unexpected mapping schema")
    created = mapping.get("created_products") or []
    updates = mapping.get("existing_product_image_updates") or []
    if len(created) != 23 or len(updates) != 7:
        raise RuntimeError("Latest31 mapping count must remain 23 new products and 7 existing image updates")
    all_sources = [source for item in created for source in item["source_images"]] + [source for item in updates for source in item["source_images"]]
    if len(all_sources) != 31 or len(set(all_sources)) != 31:
        raise RuntimeError("Each of the 31 source images must be accounted for exactly once")
    plan: list[dict[str, Any]] = []
    for item in created:
        if item["category"] != "cats" or item["subcategory"] not in {"貓乾糧", "貓貓小食"}:
            raise RuntimeError(f"Invalid category route for {item['sku']}")
        if item["product_type"] == "cat dry food" and item["subcategory"] != "貓乾糧":
            raise RuntimeError(f"Dry food category mismatch for {item['sku']}")
        if item["product_type"] == "cat treats" and item["subcategory"] != "貓貓小食":
            raise RuntimeError(f"Treat category mismatch for {item['sku']}")
        if not item["image_cdn_url"].startswith("https://files.manuscdn.com/"):
            raise RuntimeError(f"Missing approved CDN image for {item['sku']}")
        exact = Decimal(item["source_cost_cny"]) * Decimal("1.1654") / Decimal("0.55")
        if f"{exact:.2f}" != item["unrounded_retail_hkd"]:
            raise RuntimeError(f"Incorrect pre-round price for {item['sku']}")
        required = (exact - Decimal("0.90")).to_integral_value(rounding="ROUND_CEILING") + Decimal("0.90")
        if Decimal(item["retail_hkd"]) != required:
            raise RuntimeError(f"Incorrect upward .90 retail price for {item['sku']}")
        current = active.get(item["import_key"])
        current_price = validate_new_product(current, item) if current else None
        plan.append({
            "action": "create_or_reuse_new_product",
            "sku": item["sku"],
            "import_key": item["import_key"],
            "name_zh": item["name_zh"],
            "category": item["category"],
            "subcategory": item["subcategory"],
            "retail_hkd": item["retail_hkd"],
            "image_cdn_url": item["image_cdn_url"],
            "product_action": "update" if current else "create",
            "price_action": "reuse" if current_price else "create",
            "existing_product_id": current["id"] if current else None,
            "existing_price_id": current_price["id"] if current_price else None,
        })
    for item in updates:
        product = active.get(item["existing_import_key"])
        price = validate_existing_image_product(product, item)
        plan.append({
            "action": "refresh_existing_image_only",
            "import_key": item["existing_import_key"],
            "name_zh": item["expected_name_zh"],
            "retail_hkd": item["expected_retail_hkd"],
            "image_cdn_url": item["image_cdn_url"],
            "product_action": "image_update",
            "price_action": "preserve",
            "existing_product_id": product["id"],
            "existing_price_id": price["id"],
        })
    return plan


def apply_new(item: dict[str, Any], current: dict[str, Any] | None, price: dict[str, Any] | None, index: int) -> dict[str, Any]:
    product_payload = {
        "name": display_name(item),
        "description": item["description_zh"],
        "images[0]": item["image_cdn_url"],
        "active": "true",
    }
    product_payload.update(form_metadata(product_metadata(item)))
    if current:
        product = api_post(f"products/{current['id']}", product_payload, f"latest31-product-update-v1-{index}")
        product_action = "updated"
    else:
        product = api_post("products", product_payload, f"latest31-product-create-v1-{index}")
        product_action = "created"
    if price:
        selected_price = price
        price_action = "reused"
    else:
        price_payload = {
            "product": product["id"],
            "currency": "hkd",
            "unit_amount": str(cents(item["retail_hkd"])),
            "metadata[mofu_import_source]": SOURCE,
            "metadata[mofu_import_key]": item["import_key"],
            "metadata[mofu_import_schema]": SCHEMA,
            "metadata[sku]": item["sku"],
            "metadata[variant_key]": "single",
            "metadata[variant_sort]": "1",
            "metadata[variant_label_zh]": item["option_label_zh"],
            "metadata[variant_label_en]": item["option_label_en"],
            "metadata[cost_cny]": item["source_cost_cny"],
            "metadata[unrounded_retail_hkd]": item["unrounded_retail_hkd"],
            "metadata[retail_pricing_rule]": "CNY×1.1654/(1-45%), upward .90",
            "metadata[compare_at_price_hkd]": "0",
        }
        selected_price = api_post("prices", price_payload, f"latest31-price-create-v1-{index}")
        price_action = "created"
    if product.get("default_price") != selected_price["id"]:
        product = api_post(
            f"products/{product['id']}",
            {"default_price": selected_price["id"]},
            f"latest31-default-price-v1-{index}",
        )
    return {
        "import_key": item["import_key"], "sku": item["sku"], "name_zh": item["name_zh"],
        "stripe_product_id": product["id"], "stripe_price_id": selected_price["id"],
        "retail_hkd": item["retail_hkd"], "image_cdn_url": item["image_cdn_url"],
        "product_action": product_action, "price_action": price_action,
    }


def apply_image_update(item: dict[str, Any], product: dict[str, Any], price: dict[str, Any], index: int) -> dict[str, Any]:
    payload = {
        "images[0]": item["image_cdn_url"],
        "metadata[latest31_image_refreshed]": "true",
        "metadata[latest31_image_source]": SOURCE,
        "metadata[latest31_image_file]": item["image_file"],
    }
    updated = api_post(f"products/{product['id']}", payload, f"latest31-image-refresh-v1-{index}")
    return {
        "import_key": item["existing_import_key"], "name_zh": item["expected_name_zh"],
        "stripe_product_id": updated["id"], "stripe_price_id": price["id"],
        "retail_hkd": item["expected_retail_hkd"], "image_cdn_url": item["image_cdn_url"],
        "product_action": "image_updated", "price_action": "preserved",
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="Write the mapping-approved changes to Stripe.")
    args = parser.parse_args()
    mapping = json.loads(MAPPING_PATH.read_text(encoding="utf-8"))
    active = active_products_by_key()
    plan = validate_mapping(mapping, active)
    summary = {
        "mode": "apply" if args.apply else "preflight",
        "new_products": sum(item["product_action"] == "create" for item in plan),
        "new_product_updates": sum(item["product_action"] == "update" for item in plan),
        "new_prices": sum(item["price_action"] == "create" for item in plan),
        "reused_new_prices": sum(item["price_action"] == "reuse" for item in plan),
        "existing_image_updates": sum(item["action"] == "refresh_existing_image_only" for item in plan),
        "preserved_existing_prices": sum(item["price_action"] == "preserve" for item in plan),
        "plan": plan,
    }
    if not args.apply:
        print(json.dumps(summary, ensure_ascii=False, indent=2))
        return
    results: list[dict[str, Any]] = []
    for index, item in enumerate(mapping["created_products"], start=1):
        current = active.get(item["import_key"])
        current_price = validate_new_product(current, item) if current else None
        results.append(apply_new(item, current, current_price, index))
    offset = len(mapping["created_products"])
    for index, item in enumerate(mapping["existing_product_image_updates"], start=1):
        product = active[item["existing_import_key"]]
        price = validate_existing_image_product(product, item)
        results.append(apply_image_update(item, product, price, offset + index))
    manifest = {
        "schema": SCHEMA,
        "source": SOURCE,
        "result_count": len(results),
        "summary": {key: value for key, value in summary.items() if key != "plan"},
        "products": results,
    }
    MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"manifest": str(MANIFEST_PATH), **manifest["summary"]}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
