#!/usr/bin/env python3
"""Normalize audited legacy category metadata without touching commercial data."""
from __future__ import annotations

import argparse
import json
import os
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parents[1]
AUDIT_PATH = ROOT / "simplified_catalog_classification_audit.json"
MANIFEST_PATH = ROOT / "catalog_classification_normalization_manifest.json"
EXPECTED_GROUPS = {
    "cats/貓乾糧": 12,
    "cats/貓罐罐": 5,
    "cats/貓貓小食": 24,
    "dogs/狗狗乾糧": 11,
    "dogs/狗狗罐頭及濕糧": 30,
}


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


def merge_tags(existing: str, additions: list[str]) -> str:
    parts = [part.strip() for part in existing.replace("，", ",").split(",") if part.strip()]
    return ",".join(dict.fromkeys([*parts, *additions]))


def updates_for(product: dict, category: str, subcategory: str) -> dict[str, str]:
    metadata = product.get("metadata") or {}
    is_cat = category == "cats"
    return {
        "category": category,
        "category_zh": "貓咪" if is_cat else "狗狗",
        "subcategory": subcategory,
        "tags": merge_tags(metadata.get("tags", ""), [subcategory, "貓用" if is_cat else "狗用"]),
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    audit = json.loads(AUDIT_PATH.read_text(encoding="utf-8"))
    targets = audit["classification_mismatches"]
    observed = {}
    for target in targets:
        expected = target["expected"]
        key = f"{expected['category']}/{expected['subcategory']}"
        observed[key] = observed.get(key, 0) + 1
    if observed != EXPECTED_GROUPS:
        raise SystemExit(f"Unexpected audit group counts: {observed}; re-review before applying.")

    manifest = []
    for target in targets:
        product = api_request("GET", f"products/{target['id']}")
        expected = target["expected"]
        updates = updates_for(product, expected["category"], expected["subcategory"])
        metadata = product.get("metadata") or {}
        changed = {key: value for key, value in updates.items() if metadata.get(key) != value}
        manifest.append({
            "id": target["id"],
            "name": product.get("name"),
            "target": expected,
            "changed_metadata": changed,
        })

    if args.apply:
        for entry in manifest:
            if entry["changed_metadata"]:
                payload = {f"metadata[{key}]": value for key, value in entry["changed_metadata"].items()}
                api_request("POST", f"products/{entry['id']}", data=payload)

    result = {
        "mode": "apply" if args.apply else "preflight",
        "target_count": len(manifest),
        "group_counts": observed,
        "metadata_update_count": sum(bool(row["changed_metadata"]) for row in manifest),
        "products": manifest,
    }
    MANIFEST_PATH.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "mode": result["mode"],
        "target_count": result["target_count"],
        "group_counts": result["group_counts"],
        "metadata_update_count": result["metadata_update_count"],
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
