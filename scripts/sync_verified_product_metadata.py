#!/usr/bin/env python3
"""Sync a reviewed product-content batch to Stripe Product metadata.

Usage:
  python3 scripts/sync_verified_product_metadata.py data/<batch>.json --dry-run
  python3 scripts/sync_verified_product_metadata.py data/<batch>.json --apply

The script only updates Stripe Product descriptions and an explicit allow-list of
metadata keys. It never changes Prices, images, inventory, checkout settings, or
product active status. --apply is required for any Stripe write.
"""

from __future__ import annotations

import argparse
import json
import os
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

import requests

API_URL = "https://api.stripe.com/v1/products"
ALLOWED_METADATA_KEYS = {
    "brand",
    "description_zh",
    "description_en",
    "texture_zh",
    "texture_en",
    "specs_zh",
    "specs_en",
    "availability_display_zh",
    "availability_display_en",
    "product_format",
    "pet_suitability",
    "product_type_zh",
    "product_type_en",
    "ingredients_zh",
    "ingredients_en",
    "material_zh",
    "material_en",
    "guaranteed_analysis_zh",
    "guaranteed_analysis_en",
    "energy_zh",
    "energy_en",
    "country_of_origin_zh",
    "country_of_origin_en",
    "feeding_zh",
    "feeding_en",
    "care_zh",
    "care_en",
    "storage_zh",
    "storage_en",
    "notice_zh",
    "notice_en",
    "verification_note_zh",
    "verification_note_en",
    "official_source_url",
    "official_source_label_zh",
    "official_source_label_en",
    "product_content_version",
}


def require_string(value: Any, label: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{label} must be a non-empty string")
    return value.strip()


def read_batch(path: Path) -> tuple[str, dict[str, str], list[dict[str, Any]]]:
    document = json.loads(path.read_text(encoding="utf-8"))
    batch_name = require_string(document.get("batch"), "batch")
    defaults = document.get("metadata_defaults", {})
    if not isinstance(defaults, dict):
        raise ValueError("metadata_defaults must be an object")
    products = document.get("products")
    if not isinstance(products, list) or not products:
        raise ValueError("products must be a non-empty list")
    return batch_name, {str(key): str(value).strip() for key, value in defaults.items() if str(value).strip()}, products


def product_updates(product: dict[str, Any], defaults: dict[str, str]) -> tuple[str, str | None, dict[str, str]]:
    product_id = require_string(product.get("stripe_product_id"), "stripe_product_id")
    metadata = dict(defaults)
    row_metadata = product.get("metadata", {})
    if row_metadata:
        if not isinstance(row_metadata, dict):
            raise ValueError(f"{product_id}: metadata must be an object")
        metadata.update({str(key): str(value).strip() for key, value in row_metadata.items() if str(value).strip()})

    for content_key in (
        "description_zh", "description_en", "texture_zh", "texture_en",
        "specs_zh", "specs_en", "availability_zh", "availability_en",
        "product_format", "pet_suitability",
    ):
        value = product.get(content_key)
        if isinstance(value, str) and value.strip():
            metadata[content_key.replace("availability_", "availability_display_")] = value.strip()

    invalid_keys = sorted(set(metadata) - ALLOWED_METADATA_KEYS)
    if invalid_keys:
        raise ValueError(f"{product_id}: unsupported metadata keys: {', '.join(invalid_keys)}")
    if not metadata:
        raise ValueError(f"{product_id}: no reviewed fields to update")

    display_description = metadata.get("description_zh")
    return product_id, display_description, metadata


def build_form(description: str | None, metadata: dict[str, str]) -> dict[str, str]:
    form = {f"metadata[{key}]": value for key, value in metadata.items()}
    if description:
        form["description"] = description
    return form


def read_stripe_product(api_key: str, product_id: str) -> dict[str, Any]:
    response = requests.get(f"{API_URL}/{product_id}", auth=(api_key, ""), timeout=60)
    if not response.ok:
        raise RuntimeError(
            f"{product_id}: Stripe read failed with HTTP {response.status_code}: {response.text}"
        )
    return response.json()


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("batch_file", type=Path)
    parser.add_argument("--apply", action="store_true", help="perform Stripe writes")
    parser.add_argument("--dry-run", action="store_true", help="validate and print the planned updates")
    args = parser.parse_args()
    if args.apply == args.dry_run:
        raise SystemExit("Choose exactly one of --dry-run or --apply")

    api_key = os.environ.get("STRIPE_SECRET_KEY")
    if not api_key:
        raise SystemExit("STRIPE_SECRET_KEY is required")

    batch_name, defaults, products = read_batch(args.batch_file)
    seen_ids: set[str] = set()
    plan: list[tuple[str, str | None, dict[str, str]]] = []
    for product in products:
        if not isinstance(product, dict):
            raise ValueError("every products entry must be an object")
        item = product_updates(product, defaults)
        if item[0] in seen_ids:
            raise ValueError(f"duplicate stripe_product_id: {item[0]}")
        seen_ids.add(item[0])
        plan.append(item)

    preview = []
    for product_id, description, metadata in plan:
        existing = read_stripe_product(api_key, product_id)
        existing_metadata = existing.get("metadata") or {}
        final_metadata_key_count = len(set(existing_metadata) | set(metadata))
        if final_metadata_key_count > 50:
            raise ValueError(
                f"{product_id}: Stripe metadata would contain {final_metadata_key_count} keys; "
                "the maximum is 50. Remove a non-essential field before applying."
            )
        preview.append({
            "stripe_product_id": product_id,
            "metadata_keys": sorted(metadata),
            "description_updated": bool(description),
            "metadata_key_count_before": len(existing_metadata),
            "metadata_key_count_after": final_metadata_key_count,
        })
    if args.dry_run:
        print(json.dumps({"batch": batch_name, "mode": "dry-run", "count": len(preview), "products": preview}, ensure_ascii=False, indent=2))
        return

    updated: list[dict[str, Any]] = []
    for product_id, description, metadata in plan:
        response = requests.post(
            f"{API_URL}/{product_id}",
            auth=(api_key, ""),
            data=build_form(description, metadata),
            timeout=60,
        )
        if not response.ok:
            raise RuntimeError(
                f"{product_id}: Stripe update failed with HTTP {response.status_code}: {response.text}"
            )
        saved = response.json()
        saved_metadata = saved.get("metadata") or {}
        mismatched = [key for key, value in metadata.items() if saved_metadata.get(key) != value]
        if mismatched:
            raise RuntimeError(f"{product_id}: metadata mismatch after write: {', '.join(mismatched)}")
        if description and saved.get("description") != description:
            raise RuntimeError(f"{product_id}: description mismatch after write")
        updated.append({"stripe_product_id": product_id, "metadata_verified": True, "updated_keys": sorted(metadata)})

    manifest = {
        "batch": batch_name,
        "synced_at_utc": datetime.now(UTC).isoformat(),
        "count": len(updated),
        "updated": updated,
    }
    manifest_path = Path("reports") / f"{batch_name}_stripe_sync_manifest.json"
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({**manifest, "manifest_path": str(manifest_path)}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
