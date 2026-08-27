"""Backfill verified variant image metadata for the cat-bowl catalog.

This migration is intentionally metadata-only: it never changes price amounts,
product images, or active/inactive state. It matches products by the stable
mofu_import_key and prices by semantic variant_key, with a label fallback for
legacy option-N prices created by the v1 importer.
"""
from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parents[1]
MAPPING_PATH = ROOT / "cat_feeding_bowls_mapping.json"
OUT = ROOT / "reports" / "cat_bowl_variant_image_binding_latest.json"


def request(session: requests.Session, method: str, path: str, *, data: dict[str, str] | None = None,
            params: dict[str, str] | None = None, key: str | None = None) -> dict:
    response = session.request(
        method,
        f"https://api.stripe.com/v1/{path}",
        data=data,
        params=params,
        headers={"Idempotency-Key": key} if key else None,
        timeout=60,
    )
    response.raise_for_status()
    return response.json()


def active_products(session: requests.Session) -> list[dict]:
    products: list[dict] = []
    cursor: str | None = None
    while True:
        params: dict[str, str] = {"active": "true", "limit": "100"}
        if cursor:
            params["starting_after"] = cursor
        page = request(session, "GET", "products", params=params)
        products.extend(page.get("data", []))
        rows = page.get("data", [])
        if not page.get("has_more") or not rows:
            return products
        cursor = rows[-1]["id"]


def active_prices(session: requests.Session, product_id: str) -> list[dict]:
    return request(
        session,
        "GET",
        "prices",
        params={"product": product_id, "active": "true", "currency": "hkd", "limit": "100"},
    ).get("data", [])


def variant_fields(option: dict | str, index: int) -> tuple[str, str, str, str]:
    if isinstance(option, str):
        return f"option-{index}", option, f"Option {index}", ""
    return (
        str(option["key"]).strip(),
        str(option["label_zh"]).strip(),
        str(option.get("label_en") or f"Option {index}").strip(),
        str(option.get("image") or "").strip(),
    )


def main() -> None:
    key = os.environ.get("STRIPE_SECRET_KEY")
    if not key:
        raise SystemExit("STRIPE_SECRET_KEY is required")

    mapping = json.loads(MAPPING_PATH.read_text(encoding="utf-8"))
    session = requests.Session()
    session.auth = (key, "")
    products = active_products(session)
    by_import_key = {
        (product.get("metadata") or {}).get("mofu_import_key"): product
        for product in products
    }
    records: list[dict] = []

    for item in mapping["products"]:
        product = by_import_key.get(item["import_key"])
        if not product:
            raise SystemExit(f"Missing active Stripe product: {item['import_key']}")
        prices = active_prices(session, product["id"])
        for index, option in enumerate(item["variants"], start=1):
            variant_key, label_zh, label_en, image_url = variant_fields(option, index)
            if not image_url:
                continue
            matches = [
                price for price in prices
                if (price.get("metadata") or {}).get("variant_key") == variant_key
            ]
            if not matches:
                matches = [
                    price for price in prices
                    if (price.get("metadata") or {}).get("variant_label_zh", "").strip() == label_zh
                ]
            if len(matches) != 1:
                raise SystemExit(
                    f"{item['import_key']} {label_zh}: expected 1 active Price, got {len(matches)}"
                )
            price = matches[0]
            metadata = {
                "metadata[mofu_import_key]": item["import_key"],
                "metadata[variant_key]": variant_key,
                "metadata[variant_sort]": str(index),
                "metadata[variant_label_zh]": label_zh,
                "metadata[variant_label_en]": label_en,
                "metadata[variant_image_url]": image_url,
            }
            updated = request(
                session,
                "POST",
                f"prices/{price['id']}",
                data=metadata,
                key=f"{item['import_key']}-variant-image-v2-{index}",
            )
            verified = (updated.get("metadata") or {}).get("variant_image_url")
            if verified != image_url:
                raise SystemExit(f"Image metadata verification failed for {price['id']}")
            records.append({
                "product_id": product["id"],
                "import_key": item["import_key"],
                "price_id": price["id"],
                "variant_key": variant_key,
                "variant_label_zh": label_zh,
                "variant_image_url": image_url,
                "verified_metadata_value": verified,
            })

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(
        json.dumps(
            {
                "updated_at_utc": datetime.now(timezone.utc).isoformat(),
                "operation": "bind_variant_images_only_no_price_or_cost_change",
                "record_count": len(records),
                "records": records,
            },
            ensure_ascii=False,
            indent=2,
        ) + "\n",
        encoding="utf-8",
    )
    print(json.dumps({"bound": len(records), "report": str(OUT)}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
