#!/usr/bin/env python3
"""Restore only products archived by archive_pre_aug25_products.py.

Default mode is dry-run. With --apply it restores product.active=true only when
Stripe metadata carries the exact temporary archive marker.
"""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parents[1]
APPLY_PATH = ROOT / "pre_aug25_product_archive_apply.json"
OUT_PATH = ROOT / "pre_aug25_product_archive_restore.json"
ARCHIVE_STATUS = "temporary_pre_20260825"


def get_product(api_key: str, product_id: str) -> dict:
    response = requests.get(f"https://api.stripe.com/v1/products/{product_id}", auth=(api_key, ""), timeout=60)
    response.raise_for_status()
    return response.json()


def restore_product(api_key: str, product_id: str) -> dict:
    response = requests.post(
        f"https://api.stripe.com/v1/products/{product_id}",
        auth=(api_key, ""),
        data={"active": "true", "metadata[mofu_archive_status]": ""},
        headers={"Idempotency-Key": f"mofu-preaug25-restore-v1-{product_id}"},
        timeout=60,
    )
    response.raise_for_status()
    return response.json()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    api_key = os.environ.get("STRIPE_SECRET_KEY")
    if not api_key:
        raise SystemExit("STRIPE_SECRET_KEY is required")
    archive = json.loads(APPLY_PATH.read_text(encoding="utf-8"))
    archived_ids = [item["product_id"] for item in archive["results"] if item["status"] == "archived"]
    results: list[dict] = []
    for product_id in archived_ids:
        product = get_product(api_key, product_id)
        status = (product.get("metadata") or {}).get("mofu_archive_status")
        if status != ARCHIVE_STATUS:
            results.append({"product_id": product_id, "status": "skipped_marker_mismatch"})
            continue
        if args.apply:
            updated = restore_product(api_key, product_id)
            results.append({"product_id": product_id, "status": "restored" if updated.get("active") else "restore_failed"})
        else:
            results.append({"product_id": product_id, "status": "would_restore"})
    payload = {"mode": "apply" if args.apply else "dry_run", "results": results}
    OUT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"mode": payload["mode"], "count": len(results), "output": str(OUT_PATH)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
