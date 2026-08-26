#!/usr/bin/env python3
"""Temporarily archive only pre-2026-08-25 HKT Stripe products.

This switches Product.active to false for exact, audited candidates. It never
archives a post-cutoff product, deletes a Price, or changes any monetary value.
Run with --apply to mutate; default mode is a dry run.
"""

from __future__ import annotations

import argparse
import json
import os
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

import requests

ROOT = Path(__file__).resolve().parents[1]
PREFLIGHT_PATH = ROOT / "pre_aug25_product_archive_preflight.json"
OUT_PATH = ROOT / "pre_aug25_product_archive_apply.json"
ARCHIVE_STATUS = "temporary_pre_20260825"


def stripe_get(api_key: str, product_id: str) -> dict:
    response = requests.get(
        f"https://api.stripe.com/v1/products/{product_id}",
        auth=(api_key, ""),
        timeout=60,
    )
    response.raise_for_status()
    return response.json()


def archive_product(api_key: str, product_id: str, archived_at_hkt: str) -> dict:
    response = requests.post(
        f"https://api.stripe.com/v1/products/{product_id}",
        auth=(api_key, ""),
        data={
            "active": "false",
            "metadata[mofu_archive_status]": ARCHIVE_STATUS,
            "metadata[mofu_archived_at_hkt]": archived_at_hkt,
            "metadata[mofu_archive_reason]": "catalog_cleanup_pre_20260825",
        },
        headers={"Idempotency-Key": f"mofu-preaug25-archive-v1-{product_id}"},
        timeout=60,
    )
    response.raise_for_status()
    return response.json()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="Actually archive verified candidates")
    args = parser.parse_args()

    api_key = os.environ.get("STRIPE_SECRET_KEY")
    if not api_key:
        raise SystemExit("STRIPE_SECRET_KEY is required")
    preflight = json.loads(PREFLIGHT_PATH.read_text(encoding="utf-8"))
    cutoff = int(preflight["cutoff_unix"])
    archived_at_hkt = datetime.now(ZoneInfo("Asia/Hong_Kong")).isoformat()

    results: list[dict] = []
    for candidate in preflight["candidates"]:
        product_id = candidate["product_id"]
        live = stripe_get(api_key, product_id)
        live_created = int(live["created"])
        if live_created >= cutoff:
            raise SystemExit(f"REFUSED: {product_id} is post-cutoff ({live_created} >= {cutoff})")
        if not live.get("active"):
            results.append({"product_id": product_id, "status": "already_inactive", "name": live.get("name", "")})
            continue
        if not args.apply:
            results.append({"product_id": product_id, "status": "would_archive", "name": live.get("name", "")})
            continue
        updated = archive_product(api_key, product_id, archived_at_hkt)
        if updated.get("active"):
            raise SystemExit(f"FAILED: {product_id} remained active after archive request")
        results.append({"product_id": product_id, "status": "archived", "name": updated.get("name", "")})

    summary = {
        "mode": "apply" if args.apply else "dry_run",
        "cutoff_hkt": preflight["cutoff_hkt"],
        "archive_status": ARCHIVE_STATUS,
        "archived_at_hkt": archived_at_hkt if args.apply else None,
        "candidate_count": len(preflight["candidates"]),
        "protected_recent_count": preflight["protected_recent_count"],
        "results": results,
        "summary": {
            "archived": sum(1 for item in results if item["status"] == "archived"),
            "would_archive": sum(1 for item in results if item["status"] == "would_archive"),
            "already_inactive": sum(1 for item in results if item["status"] == "already_inactive"),
        },
        "recovery": "Use restore_pre_aug25_archived_products.py to set only archive-tagged products active again.",
    }
    OUT_PATH.write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"mode": summary["mode"], **summary["summary"], "output": str(OUT_PATH)}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
