#!/usr/bin/env python3
"""Read-only reconciliation of local cost mappings against active Stripe metadata."""
from __future__ import annotations

import csv
import json
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterator

ROOT = Path(__file__).resolve().parents[1]
GAP_AUDIT = ROOT / "reports" / "fx_pricing_metadata_gap_audit_2026-08-27.json"
JSON_OUT = ROOT / "reports" / "fx_pricing_local_source_reconciliation_2026-08-27.json"
CSV_OUT = ROOT / "reports" / "fx_pricing_local_source_reconciliation_2026-08-27.csv"
EXCLUDED_FILES = {GAP_AUDIT.name, JSON_OUT.name}
COST_KEYS = ("cost_cny", "cny_cost", "source_cost_cny", "cost_cny_per_product", "supplier_cost_cny", "unit_cost_cny")


def walk_dicts(value: Any) -> Iterator[dict[str, Any]]:
    if isinstance(value, dict):
        yield value
        for child in value.values():
            yield from walk_dicts(child)
    elif isinstance(value, list):
        for child in value:
            yield from walk_dicts(child)


def clean(value: Any) -> str:
    return str(value).strip() if value is not None else ""


def source_records() -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    for path in sorted(ROOT.glob("*.json")):
        if path.name in EXCLUDED_FILES:
            continue
        try:
            payload = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            continue
        pricing_rule = payload.get("pricing_rule") if isinstance(payload, dict) else None
        seen: set[tuple[str, str, str]] = set()
        for item in walk_dicts(payload):
            cost_key = next((key for key in COST_KEYS if clean(item.get(key))), "")
            if not cost_key:
                continue
            record = {
                "source_file": path.name,
                "source_cost_field": cost_key,
                "source_cost_cny": clean(item.get(cost_key)),
                "source_import_key": clean(item.get("mofu_import_key") or item.get("import_key")),
                "source_supplier_sku": clean(item.get("sku")),
                "source_name_zh": clean(item.get("name_zh")),
                "source_name": clean(item.get("name")),
                "source_retail_hkd": clean(item.get("retail_hkd")),
                "source_pricing_rule": pricing_rule if isinstance(pricing_rule, dict) else {},
            }
            fingerprint = (record["source_file"], record["source_import_key"], record["source_name_zh"])
            if fingerprint not in seen:
                records.append(record)
                seen.add(fingerprint)
    return records


def main() -> None:
    gap = json.loads(GAP_AUDIT.read_text(encoding="utf-8"))
    excluded: list[dict[str, Any]] = gap["excluded_products"]
    local_records = source_records()
    by_key: dict[str, list[dict[str, Any]]] = defaultdict(list)
    by_supplier_sku: dict[str, list[dict[str, Any]]] = defaultdict(list)
    by_name_zh: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for record in local_records:
        if record["source_import_key"]:
            by_key[record["source_import_key"]].append(record)
        if record["source_supplier_sku"]:
            by_supplier_sku[record["source_supplier_sku"]].append(record)
        if record["source_name_zh"]:
            by_name_zh[record["source_name_zh"]].append(record)

    reconciled: list[dict[str, Any]] = []
    match_counts: Counter[str] = Counter()
    for product in excluded:
        import_key = clean(product.get("mofu_import_key"))
        supplier_sku = clean(product.get("supplier_sku"))
        product_name_zh = clean(product.get("product_name"))
        candidates = by_key.get(import_key, []) if import_key else []
        match_type = "mofu_import_key" if candidates else ""
        if not candidates and supplier_sku:
            candidates = by_supplier_sku.get(supplier_sku, [])
            match_type = "supplier_sku" if candidates else ""
        if not candidates and product_name_zh:
            candidates = by_name_zh.get(product_name_zh, [])
            match_type = "exact_name_zh" if candidates else ""
        if not candidates:
            match_type = "not_found_in_local_cny_cost_mappings"
        match_counts[match_type] += 1
        reconciled.append({
            "product_id": product["product_id"],
            "mofu_sku": product["mofu_sku"],
            "product_name": product["product_name"],
            "mofu_import_key": import_key,
            "mofu_import_source": clean(product.get("mofu_import_source")),
            "supplier_sku": supplier_sku,
            "exclusion_reasons": product["exclusion_reasons"],
            "local_match_type": match_type,
            "local_cost_records": candidates,
        })

    flat_rows: list[dict[str, str]] = []
    for row in reconciled:
        records = row["local_cost_records"]
        flat_rows.append({
            "mofu_sku": row["mofu_sku"],
            "product_name": row["product_name"],
            "product_id": row["product_id"],
            "mofu_import_key": row["mofu_import_key"],
            "mofu_import_source": row["mofu_import_source"],
            "supplier_sku": row["supplier_sku"],
            "local_match_type": row["local_match_type"],
            "local_source_files": ";".join(sorted({record["source_file"] for record in records})),
            "local_cost_fields_and_values": json.dumps(
                [{"field": record["source_cost_field"], "cny": record["source_cost_cny"]} for record in records],
                ensure_ascii=False,
                separators=(",", ":"),
            ),
            "local_pricing_rules": json.dumps(
                [record["source_pricing_rule"] for record in records if record["source_pricing_rule"]],
                ensure_ascii=False,
                separators=(",", ":"),
            ),
        })

    payload = {
        "mode": "read_only_local_to_stripe_cost_reconciliation",
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "no_stripe_writes_performed": True,
        "source_scope": "Top-level local JSON mapping files with a recognized CNY cost field, including historical source_cost_cny aliases; not an assertion that every historic source file is present in this checkout.",
        "summary": {
            "excluded_stripe_product_count": len(excluded),
            "local_cny_cost_record_count": len(local_records),
            "match_counts": dict(sorted(match_counts.items())),
            "matched_excluded_product_count": sum(1 for row in reconciled if row["local_cost_records"]),
            "unmatched_excluded_product_count": sum(1 for row in reconciled if not row["local_cost_records"]),
            "local_source_file_counts": dict(sorted(Counter(row["source_file"] for row in local_records).items())),
        },
        "products": reconciled,
    }
    JSON_OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    with CSV_OUT.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(flat_rows[0]) if flat_rows else [], lineterminator="\n")
        writer.writeheader()
        writer.writerows(flat_rows)
    print(json.dumps({**payload["summary"], "json_output": str(JSON_OUT), "csv_output": str(CSV_OUT)}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
