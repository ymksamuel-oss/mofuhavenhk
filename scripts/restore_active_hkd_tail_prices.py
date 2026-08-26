#!/usr/bin/env python3
"""Restore exact source Prices from a completed .90 tail-price apply file."""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parents[1]
APPLY_PATH = ROOT / "active_hkd_tail_price_apply.json"
OUT_PATH = ROOT / "active_hkd_tail_price_restore.json"
RULE = "ceil_to_90_v1"


def api_get(api_key: str, path: str) -> dict:
    response = requests.get(f"https://api.stripe.com/v1/{path}", auth=(api_key, ""), timeout=60)
    response.raise_for_status()
    return response.json()


def api_post(api_key: str, path: str, data: list[tuple[str, str]], idempotency: str) -> dict:
    response = requests.post(
        f"https://api.stripe.com/v1/{path}",
        auth=(api_key, ""),
        data=data,
        headers={"Idempotency-Key": idempotency},
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
    apply = json.loads(APPLY_PATH.read_text(encoding="utf-8"))
    replaced = [item for item in apply["results"] if item["status"] == "replaced"]
    results: list[dict] = []
    for item in replaced:
        replacement = api_get(api_key, f"prices/{item['replacement_price_id']}")
        marker = (replacement.get("metadata") or {}).get("mofu_tail_rounding_rule")
        if marker != RULE:
            results.append({"replacement_price_id": replacement["id"], "status": "skipped_marker_mismatch"})
            continue
        if not args.apply:
            results.append({"replacement_price_id": replacement["id"], "source_price_id": item["source_price_id"], "status": "would_restore"})
            continue
        api_post(api_key, f"prices/{item['source_price_id']}", [("active", "true")], f"mofu-tail90-restore-source-v1-{item['source_price_id']}")
        if item.get("was_default_price"):
            api_post(api_key, f"products/{item['product_id']}", [("default_price", item["source_price_id"])], f"mofu-tail90-restore-default-v1-{item['product_id']}")
        api_post(api_key, f"prices/{replacement['id']}", [("active", "false")], f"mofu-tail90-restore-deactivate-v1-{replacement['id']}")
        results.append({"replacement_price_id": replacement["id"], "source_price_id": item["source_price_id"], "status": "restored"})
    payload = {"mode": "apply" if args.apply else "dry_run", "results": results}
    OUT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"mode": payload["mode"], "count": len(results), "output": str(OUT_PATH)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
