#!/usr/bin/env python3
"""Read-only audit: identify reviewed costs not persisted on current active Price/Product metadata."""
from __future__ import annotations

import json
import os
from collections import Counter
from pathlib import Path
from typing import Any

import requests

ROOT = Path(__file__).resolve().parents[1]
REPORTS = ROOT / "reports"
PREVIEW = REPORTS / "catalog_cny_hkd_multiplier_repricing_preview_1_166_2026-08-27.json"
APPLY = REPORTS / "catalog_cny_hkd_multiplier_apply_result_1_166_2026-08-27.json"
COST_KEYS = ("cost_cny", "cny_cost", "source_cost_cny", "cost_cny_per_product", "supplier_cost_cny", "unit_cost_cny")


def text(value: Any) -> str:
    return str(value).strip() if value is not None else ""


def cost(metadata: Any) -> str:
    if not isinstance(metadata, dict):
        return ""
    for key in COST_KEYS:
        value = text(metadata.get(key))
        if value:
            return value
    return ""


def list_all(session: requests.Session, resource: str, params: dict[str, str]) -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    cursor: str | None = None
    while True:
        query = {**params, "limit": "100"}
        if cursor:
            query["starting_after"] = cursor
        response = session.get(f"https://api.stripe.com/v1/{resource}", params=query, timeout=60)
        response.raise_for_status()
        payload = response.json()
        data = payload["data"]
        items.extend(data)
        if not payload.get("has_more"):
            return items
        cursor = data[-1]["id"]


api_key = os.environ.get("STRIPE_SECRET_KEY")
if not api_key:
    raise SystemExit("STRIPE_SECRET_KEY is required")
session = requests.Session()
session.auth = (api_key, "")
preview_records = json.loads(PREVIEW.read_text(encoding="utf-8"))["records"]
operation_by_source = {
    item["source_price_id"]: item
    for item in json.loads(APPLY.read_text(encoding="utf-8"))["price_operations"]
    if item.get("status") == "replaced"
}
products = {item["id"]: item for item in list_all(session, "products", {"active": "true"})}
prices = list_all(session, "prices", {"active": "true", "currency": "hkd"})
prices_by_id = {item["id"]: item for item in prices}
prices_per_product = Counter(item["product"] for item in prices if isinstance(item.get("product"), str))

candidates = []
for record in preview_records:
    if not record.get("cost_cny"):
        continue
    current_id = operation_by_source.get(record["price_id"], {}).get("replacement_price_id", record["price_id"])
    price = prices_by_id.get(current_id)
    product = products.get(record["product_id"])
    if not price or not product:
        continue
    live_cost = cost(price.get("metadata"))
    if not live_cost and prices_per_product[record["product_id"]] == 1:
        live_cost = cost(product.get("metadata"))
    if not live_cost:
        candidates.append({
            "current_price_id": current_id,
            "previous_price_id": record["price_id"],
            "product_id": record["product_id"],
            "mofu_sku": record.get("mofu_sku"),
            "product_name": record.get("product_name"),
            "trusted_cost_cny": record["cost_cny"],
            "trusted_cost_source": record["cost_source"],
            "current_price_cents": price.get("unit_amount"),
        })

print(json.dumps({
    "reviewed_computed_price_count": sum(bool(record.get("cost_cny")) for record in preview_records),
    "current_live_eligible_from_metadata_or_safe_single_product_cost": 150 - len(candidates),
    "registry_candidate_count": len(candidates),
    "candidates": candidates,
}, ensure_ascii=False, indent=2))
