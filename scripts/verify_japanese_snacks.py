"""Verify the 20-product Japanese snack import directly against Stripe."""
from __future__ import annotations

import json
import os
from decimal import Decimal
from pathlib import Path
from typing import Any

import requests

ROOT = Path("/home/ubuntu/mofuhavenhk-github")
MAPPING_PATH = ROOT / "new_snacks_image_mapping.json"
CDN_MANIFEST_PATH = ROOT / "new_snacks_cdn_manifest.json"
IMPORT_MANIFEST_PATH = ROOT / "new_snacks_stripe_manifest.json"
REPORT_PATH = ROOT / "new_snacks_stripe_verification.json"
API_KEY = os.environ.get("STRIPE_SECRET_KEY")
if not API_KEY:
    raise SystemExit("STRIPE_SECRET_KEY is not set")


def get(path: str, params: dict[str, str] | None = None) -> dict[str, Any]:
    response = requests.get(
        f"https://api.stripe.com/v1/{path}",
        auth=(API_KEY, ""),
        params=params,
        timeout=60,
    )
    response.raise_for_status()
    return response.json()


def expected_cents(value: int | float | str) -> int:
    return int(Decimal(str(value)) * 100)


mapping = json.loads(MAPPING_PATH.read_text(encoding="utf-8"))
cdn_manifest = json.loads(CDN_MANIFEST_PATH.read_text(encoding="utf-8"))
import_manifest = json.loads(IMPORT_MANIFEST_PATH.read_text(encoding="utf-8"))
items = mapping["products"]
imported = import_manifest["products"]
if len(items) != 20 or len(imported) != 20:
    raise SystemExit("Expected exactly 20 mapping and imported records")
if mapping["excluded_images"][0]["file"] != "IMG_1521.PNG":
    raise SystemExit("Unexpected excluded image configuration")

by_key = {entry["source_key"]: entry for entry in imported}
if len(by_key) != 20:
    raise SystemExit("Import manifest has duplicate source keys")

verified: list[dict[str, Any]] = []
errors: list[str] = []
for item in items:
    expected_key = f"snack-order-2026::{item['name_en'].lower()}"
    # The exact canonical key is sourced from the manifest rather than derived from localized text.
    matching = [entry for entry in imported if entry["name_en"] == item["name_en"]]
    if len(matching) != 1:
        errors.append(f"Cannot identify imported manifest row for {item['name_en']}")
        continue
    record = matching[0]
    product = get(f"products/{record['stripe_product_id']}")
    price = get(f"prices/{record['stripe_price_id']}")
    metadata = product.get("metadata") or {}
    price_metadata = price.get("metadata") or {}
    image_url = cdn_manifest["images"][item["image"]]["cdn_url"]
    expected_subcategory = "狗狗小食" if item["category"] == "dogs" else "貓貓小食"

    checks = {
        "product_active": product.get("active") is True,
        "price_active": price.get("active") is True,
        "price_currency_hkd": price.get("currency") == "hkd",
        "price_amount_matches": price.get("unit_amount") == expected_cents(item["retail_hkd"]),
        "price_belongs_to_product": price.get("product") == product.get("id"),
        "default_price_matches": product.get("default_price") == price.get("id"),
        "image_matches_clean_cdn": product.get("images") == [image_url],
        "name_zh_matches": metadata.get("name_zh") == item["name_zh"],
        "name_en_matches": metadata.get("name_en") == item["name_en"],
        "category_matches": metadata.get("category") == item["category"],
        "subcategory_matches": metadata.get("subcategory") == expected_subcategory,
        "in_stock": metadata.get("in_stock") == "true",
        "image_not_pending": metadata.get("image_pending") == "false",
        "compare_at_matches": metadata.get("compare_at_price_hkd") == str(item["compare_at_hkd"]),
        "compare_at_schema": metadata.get("compare_at_price_schema") == "v1",
        "price_key_matches_product_key": price_metadata.get("mofu_import_key") == metadata.get("mofu_import_key"),
        "price_compare_at_matches": price_metadata.get("compare_at_price_hkd") == str(item["compare_at_hkd"]),
    }
    failed = [name for name, passed in checks.items() if not passed]
    if failed:
        errors.append(f"{product['id']} ({item['name_en']}): failed {', '.join(failed)}")
    verified.append({
        "source_image": item["image"],
        "name_zh": item["name_zh"],
        "name_en": item["name_en"],
        "category": item["category"],
        "subcategory": expected_subcategory,
        "retail_hkd": item["retail_hkd"],
        "compare_at_hkd": item["compare_at_hkd"],
        "stripe_product_id": product["id"],
        "stripe_price_id": price["id"],
        "image_url": image_url,
        "passed": not failed,
        "failed_checks": failed,
    })

report = {
    "expected_product_count": 20,
    "expected_price_count": 20,
    "verified_product_count": len(verified),
    "verified_price_count": len(verified),
    "excluded_image": "IMG_1521.PNG",
    "ok": not errors and len(verified) == 20,
    "errors": errors,
    "products": verified,
}
REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps({
    "ok": report["ok"],
    "verified_product_count": len(verified),
    "verified_price_count": len(verified),
    "error_count": len(errors),
    "report": str(REPORT_PATH),
    "excluded_image": "IMG_1521.PNG",
}, ensure_ascii=False))
if errors:
    raise SystemExit(1)
