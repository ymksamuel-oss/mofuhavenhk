#!/usr/bin/env python3
"""Apply owner-supplied fixed CNY costs and HKD prices exactly as written in CSV.

No FX lookup, formula, rounding, pricing guard, or inferred-cost computation exists in
this script. It reads only the exact `cost_cny` and `proposed_hkd` strings provided by
the owner-uploaded CSV after a strict current-Price mapping preflight.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
import os
from datetime import datetime, timezone
from decimal import Decimal
from pathlib import Path
from typing import Any

import requests

ROOT = Path(__file__).resolve().parents[1]
INPUT = Path("/home/ubuntu/upload/recalculated_pricing_output.csv")
MAPPING = ROOT / "reports" / "recalculated_pricing_output_current_price_mapping_2026-08-27.json"
RESULT = ROOT / "reports" / "recalculated_pricing_output_apply_result_2026-08-27.json"
IMPLIED_KEYS = ("pricing_cost_cny_baseline", "pricing_cost_baseline_method")
REAL_COST_KEYS = ("cost_cny", "cny_cost", "source_cost_cny", "cost_cny_per_product", "supplier_cost_cny", "unit_cost_cny")


def text(value: Any) -> str:
    return str(value).strip() if value is not None else ""


def cents(hkd_value: str) -> int:
    return int(Decimal(hkd_value) * 100)


def get(session: requests.Session, path: str) -> dict[str, Any]:
    response = session.get(f"https://api.stripe.com/v1/{path}", timeout=60)
    response.raise_for_status()
    return response.json()


def post(session: requests.Session, path: str, data: list[tuple[str, str]], idempotency_key: str) -> dict[str, Any]:
    response = session.post(
        f"https://api.stripe.com/v1/{path}",
        data=data,
        headers={"Idempotency-Key": idempotency_key},
        timeout=60,
    )
    response.raise_for_status()
    return response.json()


def write_result(payload: dict[str, Any]) -> None:
    RESULT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def create_metadata(source_metadata: Any, cost_cny: str) -> list[tuple[str, str]]:
    metadata = source_metadata if isinstance(source_metadata, dict) else {}
    fields = []
    for key, value in metadata.items():
        if key in IMPLIED_KEYS or key in REAL_COST_KEYS:
            continue
        if text(value):
            fields.append((f"metadata[{key}]", text(value)))
    fields.append(("metadata[cost_cny]", cost_cny))
    return fields


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    api_key = os.environ.get("STRIPE_SECRET_KEY")
    if not api_key:
        raise SystemExit("STRIPE_SECRET_KEY is required")
    with INPUT.open("r", encoding="utf-8-sig", newline="") as handle:
        csv_by_source = {text(row.get("price_id")): row for row in csv.DictReader(handle)}
    mapping = json.loads(MAPPING.read_text(encoding="utf-8"))
    mapped = [row for row in mapping.get("records", []) if text(row.get("mapping_status")).startswith("eligible_")]
    if len(mapped) != 121 or len(csv_by_source) != 121:
        raise RuntimeError("Expected exactly 121 validated owner CSV mappings")
    if any(text(row.get("source_csv_price_id")) not in csv_by_source for row in mapped):
        raise RuntimeError("Mapping includes a source Price absent from the owner CSV")

    session = requests.Session()
    session.auth = (api_key, "")
    result: dict[str, Any] = {
        "mode": "apply" if args.apply else "dry_run_preflight",
        "input_rule": "CSV cost_cny and proposed_hkd used exactly; no FX, formula, rounding, or inferred-cost logic",
        "started_at_utc": datetime.now(timezone.utc).isoformat(),
        "records": [],
    }
    try:
        # Full revalidation before any write: mapping must still hold at execution time.
        for mapped_row in mapped:
            csv_row = csv_by_source[text(mapped_row["source_csv_price_id"])]
            current_id = text(mapped_row["current_active_price_id"])
            price = get(session, f"prices/{current_id}")
            product = get(session, f"products/{text(mapped_row['product_id'])}")
            if not price.get("active") or price.get("currency") != "hkd" or price.get("type") != "one_time":
                raise RuntimeError(f"Current mapped Price is no longer active HKD one-time: {current_id}")
            if price.get("product") != text(mapped_row["product_id"]) or not product.get("active"):
                raise RuntimeError(f"Mapped Product/Price relationship changed: {current_id}")
            if int(price.get("unit_amount", -1)) != cents(text(mapped_row["current_live_hkd"])):
                raise RuntimeError(f"Current Price amount changed since mapping: {current_id}")
            if text(csv_row.get("product_id")) != text(mapped_row["product_id"]):
                raise RuntimeError(f"CSV product mismatch in mapping: {current_id}")

            target_cents = cents(text(csv_row.get("proposed_hkd")))
            result["records"].append({
                "csv_row": mapped_row["csv_row"],
                "product_id": text(mapped_row["product_id"]),
                "source_csv_price_id": text(mapped_row["source_csv_price_id"]),
                "source_current_price_id": current_id,
                "mofu_sku": text(csv_row.get("mofu_sku")),
                "product_name": text(csv_row.get("product_name")),
                "cost_cny": text(csv_row.get("cost_cny")),
                "old_hkd": f"{price['unit_amount'] / 100:.2f}",
                "new_hkd": text(csv_row.get("proposed_hkd")),
                "old_cents": price["unit_amount"],
                "new_cents": target_cents,
                "status": "would_update_metadata_only" if price["unit_amount"] == target_cents else "would_create_replacement_price",
            })
        result["preflight_passed_at_utc"] = datetime.now(timezone.utc).isoformat()

        if args.apply:
            for item in result["records"]:
                source = get(session, f"prices/{item['source_current_price_id']}")
                product = get(session, f"products/{item['product_id']}")
                suffix = hashlib.sha256(f"{item['source_current_price_id']}:{item['cost_cny']}:{item['new_cents']}".encode()).hexdigest()[:16]
                source_was_default = text(product.get("default_price")) == item["source_current_price_id"]
                if source["unit_amount"] == item["new_cents"]:
                    fields = [("metadata[cost_cny]", item["cost_cny"])]
                    fields.extend((f"metadata[{key}]", "") for key in IMPLIED_KEYS)
                    fields.extend((f"metadata[{key}]", "") for key in REAL_COST_KEYS if key != "cost_cny")
                    updated = post(session, f"prices/{source['id']}", fields, f"mofu-fixed-csv-metadata-{source['id']}-{suffix}")
                    if updated.get("unit_amount") != item["new_cents"] or text((updated.get("metadata") or {}).get("cost_cny")) != item["cost_cny"]:
                        raise RuntimeError(f"CSV metadata-only update did not persist: {source['id']}")
                    item["result_price_id"] = source["id"]
                    item["status"] = "updated_metadata_only"
                else:
                    create_fields: list[tuple[str, str]] = [
                        ("unit_amount", str(item["new_cents"])),
                        ("currency", "hkd"),
                        ("product", item["product_id"]),
                        ("active", "true"),
                    ]
                    create_fields.extend(create_metadata(source.get("metadata"), item["cost_cny"]))
                    if text(source.get("nickname")):
                        create_fields.append(("nickname", text(source["nickname"])))
                    if text(source.get("tax_behavior")) in {"inclusive", "exclusive"}:
                        create_fields.append(("tax_behavior", text(source["tax_behavior"])))
                    replacement = post(session, "prices", create_fields, f"mofu-fixed-csv-create-{source['id']}-{suffix}")
                    try:
                        if source_was_default:
                            post(session, f"products/{item['product_id']}", [("default_price", replacement["id"])], f"mofu-fixed-csv-default-{item['product_id']}-{suffix}")
                        post(session, f"prices/{source['id']}", [("active", "false")], f"mofu-fixed-csv-deactivate-{source['id']}-{suffix}")
                    except Exception:
                        # Never retire a replacement when Stripe may have completed source deactivation.
                        current_source = get(session, f"prices/{source['id']}")
                        if current_source.get("active"):
                            if source_was_default:
                                post(session, f"products/{item['product_id']}", [("default_price", source["id"])], f"mofu-fixed-csv-restore-default-{item['product_id']}-{suffix}")
                            post(session, f"prices/{replacement['id']}", [("active", "false")], f"mofu-fixed-csv-compensate-{replacement['id']}-{suffix}")
                        raise
                    item["result_price_id"] = replacement["id"]
                    item["source_price_deactivated"] = True
                    item["default_price_switched"] = source_was_default
                    item["status"] = "replacement_price_created"
                item["completed_at_utc"] = datetime.now(timezone.utc).isoformat()
                write_result(result)

        result["completed_at_utc"] = datetime.now(timezone.utc).isoformat()
        counts: dict[str, int] = {}
        for item in result["records"]:
            counts[item["status"]] = counts.get(item["status"], 0) + 1
        result["status_counts"] = counts
        write_result(result)
        print(json.dumps({
            "mode": result["mode"],
            "preflight_passed": True,
            "records": len(result["records"]),
            "status_counts": counts,
            "result": str(RESULT),
        }, ensure_ascii=False, indent=2))
    except Exception as error:
        result["error"] = str(error)
        result["failed_at_utc"] = datetime.now(timezone.utc).isoformat()
        write_result(result)
        raise


if __name__ == "__main__":
    main()
