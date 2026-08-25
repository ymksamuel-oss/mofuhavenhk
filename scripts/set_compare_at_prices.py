#!/usr/bin/env python3
"""Set non-binding storefront compare-at prices on Stripe Products from CSV.

Required CSV columns (any supported spelling):
- stripe_product_id / product_id / 商品 ID / 產品 ID
- compare_at_price_hkd / compare_at_price / original_price / 原價 / 原價 (HKD)

Example:
  stripe_product_id,compare_at_price_hkd
  prod_ABC123,128

This updates Product metadata only. Stripe checkout continues using the active
Stripe Price ID and its current price. A compare-at price appears on the
storefront only when it is greater than the current price.
"""

import argparse
import csv
import os
import re
from pathlib import Path

import requests

API_URL = "https://api.stripe.com/v1/products"
ID_HEADERS = {"stripeproductid", "productid", "商品id", "產品id"}
PRICE_HEADERS = {"compareatpricehkd", "compareatprice", "originalprice", "原價", "原價hkd"}


def normalized(value: str) -> str:
    return re.sub(r"[\s_\-()（）【】:/\\]+", "", value.strip().lower())


def parse_hkd(value: str) -> str:
    numeric = re.sub(r"[^0-9.]", "", value or "")
    amount = float(numeric) if numeric else 0
    if amount <= 0 or amount >= 1_000_000:
        raise ValueError(f"invalid compare-at amount: {value!r}")
    return f"{amount:.2f}"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("csv_file", type=Path)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    api_key = os.environ.get("STRIPE_SECRET_KEY")
    if not api_key:
        raise SystemExit("STRIPE_SECRET_KEY is required")

    with args.csv_file.open(newline="", encoding="utf-8-sig") as handle:
        reader = csv.DictReader(handle)
        headers = {normalized(header): header for header in (reader.fieldnames or [])}
        id_header = next((headers[key] for key in ID_HEADERS if key in headers), None)
        price_header = next((headers[key] for key in PRICE_HEADERS if key in headers), None)
        if not id_header or not price_header:
            raise SystemExit("CSV needs a Stripe Product ID and a compare-at / original-price column")
        rows = list(reader)

    updated = []
    for row in rows:
        product_id = (row.get(id_header) or "").strip()
        if not product_id:
            continue
        amount = parse_hkd(row.get(price_header) or "")
        updated.append({"id": product_id, "compare_at_price_hkd": amount})
        if args.dry_run:
            continue
        response = requests.post(
            f"{API_URL}/{product_id}",
            auth=(api_key, ""),
            data={
                "metadata[compare_at_price_hkd]": amount,
                "metadata[compare_at_price_schema]": "v1",
                "metadata[compare_at_price_currency]": "hkd",
            },
            timeout=60,
        )
        response.raise_for_status()

    print({"processed": len(updated), "dry_run": args.dry_run, "products": updated})


if __name__ == "__main__":
    main()
