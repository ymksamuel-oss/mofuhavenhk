"""Safely import the audited CIAO/Inaba cat-can batch into Stripe.

Default mode is read-only preflight. It creates or reuses records only by the
exact mofu_import_key from the mapping; it never fuzzy-matches a product name.
"""
from __future__ import annotations

import argparse
import json
import os
from decimal import Decimal, ROUND_CEILING, ROUND_HALF_UP
from pathlib import Path
from typing import Any

import requests

ROOT = Path("/home/ubuntu/mofuhavenhk-github")
MAPPING_PATH = ROOT / "new_ciao_inaba_cans_mapping.json"
MANIFEST_PATH = ROOT / "new_ciao_inaba_cans_stripe_manifest.json"
SCHEMA = "new-ciao-inaba-cans-v1"
SOURCE = MAPPING_PATH.name
API_KEY = os.environ.get("STRIPE_SECRET_KEY")
if not API_KEY:
    raise SystemExit("STRIPE_SECRET_KEY is not set")


def cents(value: str | Decimal) -> int:
    return int((Decimal(str(value)) * 100).quantize(Decimal("1"), rounding=ROUND_HALF_UP))


def api_get(path: str, params: dict[str, str]) -> dict[str, Any]:
    response = requests.get(f"https://api.stripe.com/v1/{path}", auth=(API_KEY, ""), params=params, timeout=60)
    if not response.ok:
        raise RuntimeError(f"Stripe GET {path} failed ({response.status_code}): {response.text}")
    return response.json()


def api_post(path: str, data: dict[str, str], idempotency_key: str) -> dict[str, Any]:
    response = requests.post(
        f"https://api.stripe.com/v1/{path}", auth=(API_KEY, ""), data=data,
        headers={"Idempotency-Key": idempotency_key}, timeout=60,
    )
    if not response.ok:
        raise RuntimeError(f"Stripe POST {path} failed ({response.status_code}): {response.text}")
    return response.json()


def form_metadata(values: dict[str, str]) -> dict[str, str]:
    return {f"metadata[{key}]": value for key, value in values.items()}


def active_products_by_key() -> dict[str, dict[str, Any]]:
    result: dict[str, dict[str, Any]] = {}
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
                if key in result:
                    raise RuntimeError(f"Duplicate active Stripe Product import key: {key}")
                result[key] = product
        if not page.get("has_more") or not products:
            return result
        cursor = products[-1]["id"]


def active_hkd_prices(product_id: str) -> list[dict[str, Any]]:
    page = api_get("prices", {"product": product_id, "active": "true", "currency": "hkd", "limit": "100"})
    if page.get("has_more"):
        raise RuntimeError(f"More than 100 active HKD prices found for {product_id}")
    return page.get("data", [])


def display_name(item: dict[str, Any]) -> str:
    return f"{item['brand']}｜{item['name_zh']}｜{item['spec']}"


def descriptions(item: dict[str, Any]) -> tuple[str, str, str, str]:
    age_note = ""
    if "11歲以上" in item["name_zh"] or "14歲以上" in item["name_zh"] or "高齡貓" in item["name_zh"]:
        age_note = "適用年齡及餵食安排請以原包裝標示為準。"
    if "隨機混拼" in item["name_zh"]:
        zh = (
            f"{item['brand']} {item['name_zh']}，規格 {item['spec']}。此組合為多口味隨機混拼，"
            "各款口味的實際分配不保證平均；請以實物包裝為準。"
        )
        en = (
            f"{item['brand']} {item['name_en']} in a {item['spec']} format. "
            "Flavours are assorted at random and the mix is not guaranteed to be even; refer to the actual pack."
        )
    else:
        zh = (
            f"{item['brand']} {item['name_zh']}，規格 {item['spec']}。"
            f"口味、成分與餵食指引請以原包裝標示為準，並請提供充足飲水。{age_note}"
        )
        en = (
            f"{item['brand']} {item['name_en']} in a {item['spec']} size. "
            "Refer to the original packaging for flavour, ingredients and feeding guidance, and provide fresh water."
        )
    return zh, en, f"規格：{item['spec']}｜類型：貓罐罐｜適用對象：貓咪", f"Size: {item['spec']} | Type: Cat can | For: Cats"


def metadata(item: dict[str, Any]) -> dict[str, str]:
    description_zh, description_en, specs_zh, specs_en = descriptions(item)
    in_stock = item["in_stock"] is True
    availability_zh = "現貨" if in_stock else "暫時缺貨"
    availability_en = "In stock" if in_stock else "Temporarily out of stock"
    return {
        "mofu_import_source": SOURCE,
        "mofu_import_key": item["mofu_import_key"],
        "mofu_import_schema": SCHEMA,
        "sku": item["sku"],
        "brand": item["brand"],
        "category": "cats",
        "category_zh": "貓咪商品",
        "subcategory": "貓罐罐",
        "product_type": "cat_wet_food",
        "name_zh": item["name_zh"],
        "name_en": item["name_en"],
        "description_zh": description_zh,
        "description_en": description_en,
        "specs_zh": specs_zh,
        "specs_en": specs_en,
        "availability": availability_zh,
        "availability_display_zh": f"{availability_zh}｜{item['spec']}｜貓罐罐",
        "availability_display_en": f"{availability_en} | {item['spec']} | Cat can",
        "in_stock": "true" if in_stock else "false",
        "show_when_out_of_stock": "false",
        "image_pending": "false",
        "image_mode": "faithful_clean_white_background",
        "tags": f"{item['brand']},貓咪,貓罐罐,{item['spec']},日本寵物食品",
        "pricing_currency": "hkd",
        "pricing_cny_to_hkd": item["fx_cny_to_hkd"],
        "pricing_target_product_gross_margin": item["target_product_margin"],
        "pricing_ship_to_hk_hkd": item["direct_to_hk_cost_hkd"],
        "pricing_rounding": "upward .90",
    }


def validate_item(item: dict[str, Any]) -> None:
    if item["category"] != "cats" or item["subcategory"] != "貓罐罐" or item["product_type"] != "cat_wet_food":
        raise RuntimeError(f"Category mismatch for {item['sku']}")
    if not item["cdn_url"].startswith("https://files.manuscdn.com/"):
        raise RuntimeError(f"Missing approved CDN image for {item['sku']}")
    if item["image_state"] != "cleaned_pure_white_cdn_uploaded":
        raise RuntimeError(f"Image state is not approved for {item['sku']}")
    raw = Decimal(item["cny_cost"]) * Decimal(item["fx_cny_to_hkd"]) / (Decimal("1") - Decimal(item["target_product_margin"]))
    if f"{raw:.6f}" != item["unrounded_retail_hkd"]:
        raise RuntimeError(f"Incorrect unrounded retail calculation for {item['sku']}")
    expected = (raw - Decimal("0.90")).to_integral_value(rounding=ROUND_CEILING) + Decimal("0.90")
    if Decimal(item["retail_hkd"]) != expected:
        raise RuntimeError(f"Incorrect upward .90 retail price for {item['sku']}")
    if item.get("compare_at_price_hkd") is not None:
        raise RuntimeError(f"Compare-at price must remain unset for {item['sku']}")


def validate_existing(existing: dict[str, Any], item: dict[str, Any]) -> dict[str, Any] | None:
    md = existing.get("metadata") or {}
    if md.get("mofu_import_key") != item["mofu_import_key"]:
        raise RuntimeError(f"Product {existing['id']} has unexpected import key")
    if existing.get("name") != display_name(item):
        raise RuntimeError(f"Collision: {item['mofu_import_key']} has a different Stripe Product name")
    for field in ("sku", "brand", "name_zh", "name_en", "category", "subcategory", "product_type"):
        if md.get(field) != item[field]:
            raise RuntimeError(f"Collision: {item['mofu_import_key']} has unexpected {field}")
    prices = active_hkd_prices(existing["id"])
    expected_cents = cents(item["retail_hkd"])
    matching = [
        price for price in prices
        if (price.get("metadata") or {}).get("mofu_import_key") == item["mofu_import_key"]
        and price.get("unit_amount") == expected_cents
    ]
    if len(matching) > 1:
        raise RuntimeError(f"Collision: more than one matching active HKD price for {item['sku']}")
    if any(price not in matching for price in prices):
        raise RuntimeError(f"Collision: unexpected active HKD price for {item['sku']}")
    return matching[0] if matching else None


def preflight(mapping: dict[str, Any], active: dict[str, dict[str, Any]]) -> list[dict[str, Any]]:
    if mapping.get("schema") != SCHEMA or mapping.get("mapped_product_count") != 28:
        raise RuntimeError("Unexpected mapping schema or product count")
    products = mapping.get("products") or []
    skipped = mapping.get("skipped_sources") or []
    if len(products) != 28 or len(skipped) != 7:
        raise RuntimeError("Expected 28 mapped products and 7 skipped source records")
    sources = [item["source_image"] for item in products] + [item["source_image"] for item in skipped]
    if len(sources) != 35 or len(set(sources)) != 35:
        raise RuntimeError("Every source image must be accounted for exactly once")
    keys: set[str] = set()
    plan = []
    for item in products:
        validate_item(item)
        key = item["mofu_import_key"]
        if key in keys:
            raise RuntimeError(f"Duplicate import key: {key}")
        keys.add(key)
        current = active.get(key)
        price = validate_existing(current, item) if current else None
        plan.append({
            "sku": item["sku"], "import_key": key, "name_zh": item["name_zh"],
            "retail_hkd": item["retail_hkd"], "in_stock": item["in_stock"],
            "image_cdn_url": item["cdn_url"],
            "product_action": "update" if current else "create",
            "price_action": "reuse" if price else "create",
            "existing_product_id": current["id"] if current else None,
            "existing_price_id": price["id"] if price else None,
        })
    return plan


def apply_item(item: dict[str, Any], current: dict[str, Any] | None, current_price: dict[str, Any] | None, index: int) -> dict[str, Any]:
    md = metadata(item)
    payload = {"name": display_name(item), "description": md["description_zh"], "images[0]": item["cdn_url"], "active": "true"}
    payload.update(form_metadata(md))
    if current:
        product = api_post(f"products/{current['id']}", payload, f"new-ciao-inaba-product-update-v1-{index}")
        product_action = "updated"
    else:
        product = api_post("products", payload, f"new-ciao-inaba-product-create-v1-{index}")
        product_action = "created"
    if current_price:
        price = current_price
        price_action = "reused"
    else:
        price_payload = {
            "product": product["id"], "currency": "hkd", "unit_amount": str(cents(item["retail_hkd"])),
            "metadata[mofu_import_source]": SOURCE,
            "metadata[mofu_import_key]": item["mofu_import_key"],
            "metadata[mofu_import_schema]": SCHEMA,
            "metadata[sku]": item["sku"],
            "metadata[variant_key]": "single",
            "metadata[variant_sort]": "1",
            "metadata[variant_label_zh]": item["spec"],
            "metadata[variant_label_en]": item["spec"],
            "metadata[cost_cny]": item["cny_cost"],
            "metadata[unrounded_retail_hkd]": item["unrounded_retail_hkd"],
            "metadata[retail_pricing_rule]": "CNY×1.1654/(1-45%), upward .90",
        }
        price = api_post("prices", price_payload, f"new-ciao-inaba-price-create-v1-{index}")
        price_action = "created"
    if product.get("default_price") != price["id"]:
        product = api_post(f"products/{product['id']}", {"default_price": price["id"]}, f"new-ciao-inaba-default-price-v1-{index}")
    return {
        "sku": item["sku"], "import_key": item["mofu_import_key"], "name_zh": item["name_zh"],
        "retail_hkd": item["retail_hkd"], "in_stock": item["in_stock"],
        "stripe_product_id": product["id"], "stripe_price_id": price["id"], "stripe_unit_amount": price["unit_amount"],
        "image_cdn_url": item["cdn_url"], "product_action": product_action, "price_action": price_action,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="Write mapping-approved products and prices to Stripe after preflight.")
    args = parser.parse_args()
    mapping = json.loads(MAPPING_PATH.read_text(encoding="utf-8"))
    active = active_products_by_key()
    plan = preflight(mapping, active)
    summary = {
        "mode": "apply" if args.apply else "preflight",
        "products_to_create": sum(row["product_action"] == "create" for row in plan),
        "products_to_update": sum(row["product_action"] == "update" for row in plan),
        "prices_to_create": sum(row["price_action"] == "create" for row in plan),
        "prices_to_reuse": sum(row["price_action"] == "reuse" for row in plan),
        "out_of_stock_products": sum(not row["in_stock"] for row in plan),
        "plan": plan,
    }
    if not args.apply:
        print(json.dumps(summary, ensure_ascii=False, indent=2))
        return
    results = []
    for index, item in enumerate(mapping["products"], start=1):
        current = active.get(item["mofu_import_key"])
        price = validate_existing(current, item) if current else None
        results.append(apply_item(item, current, price, index))
    manifest = {"schema": SCHEMA, "source": SOURCE, "result_count": len(results), "summary": {k: v for k, v in summary.items() if k != "plan"}, "products": results}
    MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"manifest": str(MANIFEST_PATH), **manifest["summary"]}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
