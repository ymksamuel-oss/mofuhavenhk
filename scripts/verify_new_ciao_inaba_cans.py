"""Read-only post-import verifier for the new CIAO/Inaba cat-can batch."""
from __future__ import annotations

import json
import os
from decimal import Decimal, ROUND_CEILING
from pathlib import Path

import requests

ROOT = Path("/home/ubuntu/mofuhavenhk-github")
MAPPING_PATH = ROOT / "new_ciao_inaba_cans_mapping.json"
MANIFEST_PATH = ROOT / "new_ciao_inaba_cans_stripe_manifest.json"
OUTPUT_PATH = ROOT / "new_ciao_inaba_cans_stripe_verification.json"
API_KEY = os.environ.get("STRIPE_SECRET_KEY")
if not API_KEY:
    raise SystemExit("STRIPE_SECRET_KEY is not set")


def get(path: str) -> dict:
    response = requests.get(f"https://api.stripe.com/v1/{path}", auth=(API_KEY, ""), timeout=60)
    response.raise_for_status()
    return response.json()


def main() -> None:
    mapping = json.loads(MAPPING_PATH.read_text(encoding="utf-8"))
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    result_by_key = {row["import_key"]: row for row in manifest["products"]}
    rows = []
    for item in mapping["products"]:
        result = result_by_key.get(item["mofu_import_key"])
        if not result:
            raise RuntimeError(f"Manifest missing {item['mofu_import_key']}")
        product = get(f"products/{result['stripe_product_id']}")
        price = get(f"prices/{result['stripe_price_id']}")
        md = product.get("metadata") or {}
        expected_amount = int(Decimal(item["retail_hkd"]) * 100)
        raw = Decimal(item["cny_cost"]) * Decimal(item["fx_cny_to_hkd"]) / (Decimal("1") - Decimal(item["target_product_margin"]))
        expected_retail = (raw - Decimal("0.90")).to_integral_value(rounding=ROUND_CEILING) + Decimal("0.90")
        checks = {
            "product_active": product.get("active") is True,
            "exact_import_key": md.get("mofu_import_key") == item["mofu_import_key"],
            "category": md.get("category") == "cats",
            "subcategory": md.get("subcategory") == "貓罐罐",
            "product_type": md.get("product_type") == "cat_wet_food",
            "in_stock": md.get("in_stock") == ("true" if item["in_stock"] else "false"),
            "one_expected_image": product.get("images") == [item["cdn_url"]],
            "default_price": product.get("default_price") == price["id"],
            "price_hkd": price.get("currency") == "hkd" and price.get("unit_amount") == expected_amount,
            "price_metadata_key": (price.get("metadata") or {}).get("mofu_import_key") == item["mofu_import_key"],
            "pricing_formula": Decimal(item["retail_hkd"]) == expected_retail,
        }
        if not all(checks.values()):
            raise RuntimeError(f"Verification failed for {item['sku']}: {checks}")
        rows.append({"sku": item["sku"], "product_id": product["id"], "price_id": price["id"], "checks": checks})
    output = {"verified_product_count": len(rows), "all_passed": True, "products": rows}
    OUTPUT_PATH.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"verified_product_count": len(rows), "all_passed": True, "output": str(OUTPUT_PATH)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
