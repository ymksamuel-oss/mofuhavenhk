"""Verify latest31 Stripe catalog writes against the approved mapping and manifest."""
from __future__ import annotations

import json
import os
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path
from typing import Any

import requests

ROOT = Path("/home/ubuntu/mofuhavenhk-github")
MAPPING = ROOT / "latest_31_product_mapping.json"
MANIFEST = ROOT / "latest31_stripe_manifest.json"
REPORT = ROOT / "latest31_stripe_verification.json"
API_KEY = os.environ.get("STRIPE_SECRET_KEY")
if not API_KEY:
    raise SystemExit("STRIPE_SECRET_KEY is not set")


def cents(value: str) -> int:
    return int((Decimal(value) * 100).quantize(Decimal("1"), rounding=ROUND_HALF_UP))


def api_get(path: str) -> dict[str, Any]:
    response = requests.get(f"https://api.stripe.com/v1/{path}", auth=(API_KEY, ""), timeout=60)
    if not response.ok:
        raise RuntimeError(f"Stripe GET {path} failed ({response.status_code}): {response.text}")
    return response.json()


def verify_new(item: dict[str, Any], row: dict[str, Any]) -> list[str]:
    product = api_get(f"products/{row['stripe_product_id']}")
    price = api_get(f"prices/{row['stripe_price_id']}")
    md = product.get("metadata") or {}
    pmd = price.get("metadata") or {}
    expected_name = f"{item['name_zh']}｜{item['name_en']}"
    errors = []
    checks = [
        (product.get("active") is True, "product is not active"),
        (product.get("name") == expected_name, "product name mismatch"),
        (md.get("mofu_import_key") == item["import_key"], "product import key mismatch"),
        (md.get("category") == "cats", "product category mismatch"),
        (md.get("subcategory") == item["subcategory"], "product subcategory mismatch"),
        (md.get("name_zh") == item["name_zh"], "Chinese product name metadata mismatch"),
        (md.get("name_en") == item["name_en"], "English product name metadata mismatch"),
        (product.get("images") == [item["image_cdn_url"]], "product must have exactly the approved one-image gallery"),
        (product.get("default_price") == row["stripe_price_id"], "default price mismatch"),
        (price.get("active") is True and price.get("currency") == "hkd", "price is not active HKD"),
        (price.get("unit_amount") == cents(item["retail_hkd"]), "price amount mismatch"),
        (pmd.get("mofu_import_key") == item["import_key"], "price import key mismatch"),
        (pmd.get("cost_cny") == item["source_cost_cny"], "price cost metadata mismatch"),
        (pmd.get("unrounded_retail_hkd") == item["unrounded_retail_hkd"], "price formula metadata mismatch"),
        (pmd.get("compare_at_price_hkd") == "0", "unsupported compare-at price found"),
    ]
    for passed, text in checks:
        if not passed:
            errors.append(text)
    return errors


def verify_update(item: dict[str, Any], row: dict[str, Any]) -> list[str]:
    product = api_get(f"products/{row['stripe_product_id']}")
    price = api_get(f"prices/{row['stripe_price_id']}")
    md = product.get("metadata") or {}
    expected_name = f"{item['expected_name_zh']}｜{item['expected_name_en']}"
    checks = [
        (product.get("active") is True, "existing product is not active"),
        (product.get("name") == expected_name, "existing product name changed"),
        (md.get("mofu_import_key") == item["existing_import_key"], "existing import key changed"),
        (product.get("images") == [item["image_cdn_url"]], "existing main image was not refreshed exactly"),
        (price.get("unit_amount") == cents(item["expected_retail_hkd"]), "existing price was changed"),
        ((price.get("metadata") or {}).get("mofu_import_key") == item["existing_import_key"], "existing price import key changed"),
    ]
    return [text for passed, text in checks if not passed]


def main() -> None:
    mapping = json.loads(MAPPING.read_text(encoding="utf-8"))
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    results = {row["import_key"]: row for row in manifest["products"]}
    records = []
    for item in mapping["created_products"]:
        row = results.get(item["import_key"])
        errors = ["missing manifest record"] if not row else verify_new(item, row)
        records.append({"import_key": item["import_key"], "kind": "new", "passed": not errors, "errors": errors})
    for item in mapping["existing_product_image_updates"]:
        row = results.get(item["existing_import_key"])
        errors = ["missing manifest record"] if not row else verify_update(item, row)
        records.append({"import_key": item["existing_import_key"], "kind": "image_update", "passed": not errors, "errors": errors})
    report = {
        "mapping_schema": mapping["schema"],
        "new_products_verified": sum(record["kind"] == "new" and record["passed"] for record in records),
        "existing_image_updates_verified": sum(record["kind"] == "image_update" and record["passed"] for record in records),
        "failed": [record for record in records if not record["passed"]],
        "records": records,
    }
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({key: report[key] for key in ["new_products_verified", "existing_image_updates_verified", "failed"]}, ensure_ascii=False, indent=2))
    if report["failed"]:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
