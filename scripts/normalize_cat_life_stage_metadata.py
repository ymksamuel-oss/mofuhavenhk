#!/usr/bin/env python3
"""Assign verified cat life-stage metadata without changing commercial data."""
from __future__ import annotations

import argparse
import json
import os
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parents[1]
AUDIT_PATH = ROOT / "cat_life_stage_audit.json"
MANIFEST_PATH = ROOT / "cat_life_stage_normalization_manifest.json"
EXPECTED_COUNTS = {"kitten": 1, "adult": 12, "senior": 15}
LABELS = {"kitten": "幼貓", "adult": "成貓", "senior": "老貓"}


def request(method: str, endpoint: str, **kwargs):
    response = requests.request(
        method,
        f"https://api.stripe.com/v1/{endpoint}",
        auth=(os.environ["STRIPE_SECRET_KEY"], ""),
        timeout=30,
        **kwargs,
    )
    response.raise_for_status()
    return response.json()


def merge_tags(existing: str, stage: str) -> str:
    tags = [tag.strip() for tag in existing.replace("，", ",").split(",") if tag.strip()]
    return ",".join(dict.fromkeys([*tags, LABELS[stage]]))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    audit = json.loads(AUDIT_PATH.read_text(encoding="utf-8"))
    observed = {stage: len(audit["products"].get(stage, [])) for stage in EXPECTED_COUNTS}
    if observed != EXPECTED_COUNTS:
        raise SystemExit(f"Unexpected stage counts: {observed}; re-audit before applying.")

    manifest = []
    for stage in EXPECTED_COUNTS:
        for audited in audit["products"][stage]:
            product = request("GET", f"products/{audited['id']}")
            metadata = product.get("metadata") or {}
            desired = {
                "life_stage": stage,
                "life_stage_zh": LABELS[stage],
                "tags": merge_tags(metadata.get("tags", ""), stage),
            }
            changed = {key: value for key, value in desired.items() if metadata.get(key) != value}
            manifest.append({
                "id": product["id"],
                "name": product.get("name"),
                "life_stage": stage,
                "changed_metadata": changed,
            })

    if args.apply:
        for item in manifest:
            if item["changed_metadata"]:
                payload = {f"metadata[{key}]": value for key, value in item["changed_metadata"].items()}
                request("POST", f"products/{item['id']}", data=payload)

    result = {
        "mode": "apply" if args.apply else "preflight",
        "stage_counts": observed,
        "target_count": len(manifest),
        "metadata_update_count": sum(bool(item["changed_metadata"]) for item in manifest),
        "products": manifest,
    }
    MANIFEST_PATH.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "mode": result["mode"],
        "stage_counts": result["stage_counts"],
        "target_count": result["target_count"],
        "metadata_update_count": result["metadata_update_count"],
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
