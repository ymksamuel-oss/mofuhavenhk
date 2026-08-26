#!/usr/bin/env python3
"""Read-only Stripe audit for simplified/traditional freeze-dried terminology."""
from __future__ import annotations

import json
import os
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "freeze_dried_category_audit.json"
FREEZE_TERMS = ("凍乾", "冻干", "冷凍脫水", "冷冻脱水", "freeze-dried", "freeze dry")
CAT_TERMS = ("貓", "猫", "cat")
DOG_TERMS = ("狗", "犬", "dog", "canine")


def list_active_products() -> list[dict]:
    api_key = os.environ["STRIPE_SECRET_KEY"]
    records: list[dict] = []
    starting_after: str | None = None
    while True:
        params: dict[str, str | int] = {"active": "true", "limit": 100}
        if starting_after:
            params["starting_after"] = starting_after
        response = requests.get(
            "https://api.stripe.com/v1/products",
            params=params,
            auth=(api_key, ""),
            timeout=30,
        )
        response.raise_for_status()
        page = response.json()
        records.extend(page["data"])
        if not page.get("has_more"):
            return records
        starting_after = page["data"][-1]["id"]


def main() -> None:
    candidates = []
    for product in list_active_products():
        metadata = product.get("metadata") or {}
        text = " ".join([product.get("name") or "", product.get("description") or "", *metadata.values()]).lower()
        if not any(term in text for term in FREEZE_TERMS):
            continue
        has_cat = any(term in text for term in CAT_TERMS)
        has_dog = any(term in text for term in DOG_TERMS)
        pet_suitability = (metadata.get("pet_suitability") or "").strip().lower()
        product_type = (metadata.get("product_type") or "").strip().lower()
        is_dog_dry_food = product_type == "dog_dry_food"
        expected_category = (
            "dogs"
            if is_dog_dry_food or pet_suitability in {"dogs", "dog"} or (has_dog and not has_cat)
            else "cats"
        )
        expected_subcategory = (
            "狗狗乾糧"
            if is_dog_dry_food
            else "狗狗冷凍脫水食品"
            if expected_category == "dogs"
            else "冷凍脫水系列"
        )
        current_category = metadata.get("category") or metadata.get("category_slug") or ""
        current_subcategory = metadata.get("subcategory") or metadata.get("sub_category") or ""
        candidates.append({
            "id": product["id"],
            "name": product.get("name"),
            "mofu_import_key": metadata.get("mofu_import_key"),
            "pet_suitability": pet_suitability,
            "product_type": product_type,
            "current_category": current_category,
            "current_subcategory": current_subcategory,
            "expected_category": expected_category,
            "expected_subcategory": expected_subcategory,
            "needs_metadata_update": current_category != expected_category or current_subcategory != expected_subcategory,
        })
    report = {
        "matched_count": len(candidates),
        "needs_update_count": sum(item["needs_metadata_update"] for item in candidates),
        "products": candidates,
    }
    OUT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False))


if __name__ == "__main__":
    main()
