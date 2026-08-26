#!/usr/bin/env python3
"""Normalize freeze-dried category metadata for already-active Stripe Products.

Safe scope: category/tags/display copy metadata only. This script never creates,
deletes, archives, or reprices Products or Prices.
"""
from __future__ import annotations

import argparse
import json
import os
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parents[1]
AUDIT_PATH = ROOT / "freeze_dried_category_audit.json"
MANIFEST_PATH = ROOT / "freeze_dried_category_normalization_manifest.json"


def api_request(method: str, endpoint: str, **kwargs):
    response = requests.request(
        method,
        f"https://api.stripe.com/v1/{endpoint}",
        auth=(os.environ["STRIPE_SECRET_KEY"], ""),
        timeout=30,
        **kwargs,
    )
    response.raise_for_status()
    return response.json()


def normalize_zh(value: str) -> str:
    return value.replace("冷冻脱水", "冷凍脫水").replace("凍干", "凍乾")


def merged_tags(existing: str, additions: list[str]) -> str:
    pieces = [item.strip() for item in existing.replace("，", ",").split(",") if item.strip()]
    return ",".join(dict.fromkeys([*pieces, *additions]))


def metadata_updates(product: dict, target_category: str, target_subcategory: str) -> dict[str, str]:
    metadata = product.get("metadata") or {}
    is_dog_dry = target_subcategory == "狗狗乾糧"
    is_dog_freeze = target_subcategory == "狗狗冷凍脫水食品"
    if is_dog_dry:
        tags = ["狗狗乾糧", "凍乾配料", "狗用"]
        category_zh = "狗狗"
        food_type_zh = "乾糧（含凍乾配料）"
    elif is_dog_freeze:
        tags = ["狗狗冷凍脫水食品", "凍乾糧", "狗用"]
        category_zh = "狗狗"
        food_type_zh = "凍乾糧"
    else:
        tags = ["冷凍脫水系列", "凍乾糧", "貓用"]
        category_zh = "貓咪"
        food_type_zh = "凍乾糧"

    updates = {
        "category": target_category,
        "category_zh": category_zh,
        "subcategory": target_subcategory,
        "food_type_zh": food_type_zh,
        "tags": merged_tags(metadata.get("tags", ""), tags),
    }
    if metadata.get("name_zh"):
        updates["name_zh"] = normalize_zh(metadata["name_zh"])
    if metadata.get("description_zh"):
        updates["description_zh"] = normalize_zh(metadata["description_zh"])
    if metadata.get("specs_zh"):
        updates["specs_zh"] = normalize_zh(metadata["specs_zh"])
    return updates


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="Apply only preflighted metadata updates.")
    args = parser.parse_args()
    audit = json.loads(AUDIT_PATH.read_text(encoding="utf-8"))
    targets = [item for item in audit["products"] if item["needs_metadata_update"]]
    if len(targets) != 22:
        raise SystemExit(f"Expected exactly 22 audited targets; found {len(targets)}. Re-audit before applying.")

    manifest = []
    for item in targets:
        product = api_request("GET", f"products/{item['id']}")
        metadata = product.get("metadata") or {}
        updates = metadata_updates(product, item["expected_category"], item["expected_subcategory"])
        changed = {key: value for key, value in updates.items() if metadata.get(key) != value}
        manifest.append({
            "id": item["id"],
            "name": product.get("name"),
            "target": f"{item['expected_category']}/{item['expected_subcategory']}",
            "changed_metadata": changed,
        })

    if args.apply:
        for entry in manifest:
            if entry["changed_metadata"]:
                form = {f"metadata[{key}]": value for key, value in entry["changed_metadata"].items()}
                api_request("POST", f"products/{entry['id']}", data=form)

    result = {
        "mode": "apply" if args.apply else "preflight",
        "target_count": len(manifest),
        "metadata_update_count": sum(bool(entry["changed_metadata"]) for entry in manifest),
        "products": manifest,
    }
    MANIFEST_PATH.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "mode": result["mode"],
        "target_count": result["target_count"],
        "metadata_update_count": result["metadata_update_count"],
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
