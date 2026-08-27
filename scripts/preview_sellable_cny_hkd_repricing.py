#!/usr/bin/env python3
"""Read-only CNY→HKD retail-price preview for storefront-sellable Stripe Prices.

This script deliberately mirrors the catalog's price-selection semantics:
- Products without variant_mode: only the active default Price is in scope.
- Products with pack_size/option/choice variant_mode: only declared variant Prices
  (variant key/label or valid pack count) are in scope.
It never writes to Stripe.
"""
from __future__ import annotations

import csv
import json
import os
from collections import Counter, defaultdict
from datetime import datetime, timezone
from decimal import Decimal, ROUND_CEILING, InvalidOperation
from pathlib import Path
from typing import Any

import requests

ROOT = Path(__file__).resolve().parents[1]
REPORT_DIR = ROOT / "reports"
JSON_OUT = REPORT_DIR / "cny_hkd_sellable_repricing_preview_2026-08-27.json"
CSV_OUT = REPORT_DIR / "cny_hkd_sellable_repricing_preview_2026-08-27.csv"
RATE_URL = "https://api.frankfurter.dev/v2/rate/CNY/HKD"
SUPPORTED_ROUNDING_RULE = "upward .90"
POTENTIAL_FX_TRIGGER_PERCENT = Decimal("0.5")
POTENTIAL_PRICE_CHANGE_CAP_PERCENT = Decimal("5")


def to_decimal(value: Any, label: str) -> Decimal:
    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError) as error:
        raise RuntimeError(f"Invalid {label}: {value!r}") from error


def api_get(api_key: str, path: str, params: dict[str, str]) -> dict[str, Any]:
    response = requests.get(f"https://api.stripe.com/v1/{path}", params=params, auth=(api_key, ""), timeout=60)
    response.raise_for_status()
    return response.json()


def list_all(api_key: str, path: str, params: dict[str, str]) -> list[dict[str, Any]]:
    results: list[dict[str, Any]] = []
    cursor: str | None = None
    while True:
        page_params = dict(params)
        if cursor:
            page_params["starting_after"] = cursor
        page = api_get(api_key, path, page_params)
        results.extend(page["data"])
        if not page.get("has_more"):
            return results
        cursor = page["data"][-1]["id"]
        if not cursor:
            raise RuntimeError(f"{path} returned an incomplete pagination cursor")


def price_product_id(price: dict[str, Any]) -> str:
    product = price.get("product")
    return product if isinstance(product, str) else str((product or {}).get("id") or "")


def is_declared_variant(price: dict[str, Any]) -> bool:
    metadata = price.get("metadata") or {}
    if metadata.get("variant_key") or metadata.get("variant_label_zh"):
        return True
    try:
        return int(metadata.get("pack_count") or 0) > 0
    except (ValueError, TypeError):
        return False


def sellable_prices(product: dict[str, Any], all_prices: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], str | None]:
    metadata = product.get("metadata") or {}
    variant_mode = metadata.get("variant_mode")
    if variant_mode in {"pack_size", "option", "choice"}:
        declared = [price for price in all_prices if is_declared_variant(price)]
        return declared, None if declared else "variant_mode_without_declared_active_price"
    default_id = product.get("default_price")
    selected = [price for price in all_prices if price.get("id") == default_id]
    return selected, None if selected else "active_default_price_missing"


def round_up_to_90(value: Decimal) -> Decimal:
    return (value - Decimal("0.90")).to_integral_value(rounding=ROUND_CEILING) + Decimal("0.90")


def safe_str(value: Any) -> str:
    return str(value).strip() if value is not None else ""


def load_rate() -> dict[str, Any]:
    response = requests.get(RATE_URL, timeout=30)
    response.raise_for_status()
    payload = response.json()
    if payload.get("base") != "CNY" or payload.get("quote") != "HKD":
        raise RuntimeError(f"Unexpected FX pair: {payload}")
    rate = to_decimal(payload.get("rate"), "CNY→HKD rate")
    if rate <= 0:
        raise RuntimeError(f"Invalid CNY→HKD rate: {payload}")
    return {"source_url": RATE_URL, "provider": "Frankfurter", **payload, "decimal_rate": rate}


def main() -> None:
    api_key = os.environ.get("STRIPE_SECRET_KEY")
    if not api_key:
        raise SystemExit("STRIPE_SECRET_KEY is required")
    rate_data = load_rate()
    latest_rate: Decimal = rate_data.pop("decimal_rate")
    products = list_all(api_key, "products", {"active": "true", "limit": "100"})
    active_hkd_prices = list_all(api_key, "prices", {"active": "true", "currency": "hkd", "limit": "100"})
    prices_by_product: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for price in active_hkd_prices:
        product_id = price_product_id(price)
        if product_id:
            prices_by_product[product_id].append(price)

    rows: list[dict[str, Any]] = []
    skipped: Counter[str] = Counter()
    eligible_product_ids: set[str] = set()
    for product in products:
        metadata = product.get("metadata") or {}
        candidates, selection_error = sellable_prices(product, prices_by_product.get(product["id"], []))
        if selection_error:
            skipped[selection_error] += 1
            continue
        target_margin_raw = metadata.get("pricing_target_product_gross_margin") or metadata.get("target_product_margin")
        stored_fx_raw = metadata.get("pricing_cny_to_hkd") or metadata.get("fx_cny_to_hkd")
        try:
            margin = to_decimal(target_margin_raw, "target margin")
            stored_fx = to_decimal(stored_fx_raw, "stored FX")
        except RuntimeError:
            skipped["incomplete_product_pricing_metadata"] += len(candidates)
            continue
        if not (Decimal("0") < margin < Decimal("1")) or stored_fx <= 0:
            skipped["invalid_product_pricing_metadata"] += len(candidates)
            continue
        rounding_rule = safe_str(metadata.get("pricing_rounding")) or SUPPORTED_ROUNDING_RULE
        if rounding_rule != SUPPORTED_ROUNDING_RULE:
            skipped["unsupported_rounding_rule"] += len(candidates)
            continue
        category = (
            safe_str(metadata.get("category"))
            or safe_str(metadata.get("category_slug"))
            or safe_str(metadata.get("category_code"))
            or safe_str(metadata.get("主分類代碼"))
            or "unclassified"
        )
        shipping_hkd = safe_str(metadata.get("pricing_ship_to_hk_hkd"))
        for price in candidates:
            price_metadata = price.get("metadata") or {}
            cost_raw = price_metadata.get("cost_cny") or price_metadata.get("cny_cost") or metadata.get("cost_cny") or metadata.get("cny_cost")
            try:
                cost_cny = to_decimal(cost_raw, "cost CNY")
            except RuntimeError:
                skipped["cost_cny_missing_or_invalid"] += 1
                continue
            if cost_cny < 0 or not isinstance(price.get("unit_amount"), int) or price["unit_amount"] <= 0:
                skipped["invalid_price_or_cost"] += 1
                continue
            current_hkd = Decimal(price["unit_amount"]) / Decimal("100")
            unrounded_hkd = cost_cny * latest_rate / (Decimal("1") - margin)
            proposed_hkd = round_up_to_90(unrounded_hkd)
            current_margin = Decimal("1") - (cost_cny * latest_rate / current_hkd)
            proposed_margin = Decimal("1") - (cost_cny * latest_rate / proposed_hkd)
            change_hkd = proposed_hkd - current_hkd
            change_percent = change_hkd / current_hkd * Decimal("100")
            fx_change_percent = (latest_rate - stored_fx) / stored_fx * Decimal("100")
            would_change = proposed_hkd != current_hkd
            passes_fx_trigger = abs(fx_change_percent) >= POTENTIAL_FX_TRIGGER_PERCENT
            within_price_cap = abs(change_percent) <= POTENTIAL_PRICE_CHANGE_CAP_PERCENT
            guard_status = (
                "no_price_change"
                if not would_change
                else "would_apply_within_review_guards"
                if passes_fx_trigger and within_price_cap
                else "hold_fx_change_below_0.5_percent"
                if not passes_fx_trigger
                else "hold_price_change_above_5_percent"
            )
            rows.append({
                "product_id": product["id"],
                "price_id": price["id"],
                "is_default_price": str(product.get("default_price") == price["id"]).lower(),
                "variant_mode": safe_str(metadata.get("variant_mode")) or "single",
                "variant_label_zh": safe_str(price_metadata.get("variant_label_zh")),
                "mofu_sku": safe_str(metadata.get("mofu_sku")),
                "product_name": safe_str(product.get("name")),
                "brand": safe_str(metadata.get("brand")) or "未標示品牌",
                "category": category,
                "current_hkd": f"{current_hkd:.2f}",
                "cost_cny": f"{cost_cny:.4f}",
                "target_product_margin": f"{margin:.4f}",
                "stored_cny_to_hkd": f"{stored_fx:.4f}",
                "latest_cny_to_hkd": f"{latest_rate:.4f}",
                "fx_change_percent": f"{fx_change_percent:.4f}",
                "rounding_rule": rounding_rule,
                "pricing_ship_to_hk_hkd": shipping_hkd,
                "retail_pricing_rule": safe_str(price_metadata.get("retail_pricing_rule")),
                "unrounded_proposed_hkd": f"{unrounded_hkd:.4f}",
                "proposed_hkd": f"{proposed_hkd:.2f}",
                "price_change_hkd": f"{change_hkd:.2f}",
                "price_change_percent": f"{change_percent:.4f}",
                "current_margin_at_latest_fx": f"{current_margin:.4f}",
                "proposed_margin_at_latest_fx": f"{proposed_margin:.4f}",
                "would_change_without_guard": would_change,
                "passes_potential_fx_trigger_0_5_percent": passes_fx_trigger,
                "within_potential_price_change_cap_5_percent": within_price_cap,
                "potential_review_guard_status": guard_status,
            })
            eligible_product_ids.add(product["id"])

    rows.sort(key=lambda row: (row["mofu_sku"], row["price_id"]))
    changed = [row for row in rows if row["would_change_without_guard"]]
    increases = [row for row in changed if Decimal(row["price_change_hkd"]) > 0]
    decreases = [row for row in changed if Decimal(row["price_change_hkd"]) < 0]
    guard_approved = [row for row in changed if row["potential_review_guard_status"] == "would_apply_within_review_guards"]
    guard_held_low_fx = [row for row in changed if row["potential_review_guard_status"] == "hold_fx_change_below_0.5_percent"]
    guard_held_cap = [row for row in changed if row["potential_review_guard_status"] == "hold_price_change_above_5_percent"]
    payload = {
        "mode": "read_only_preview",
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "rate_source": rate_data,
        "price_selection_policy": "default price for single products; declared active variant prices for variant_mode products",
        "potential_review_guards_only": {
            "minimum_absolute_fx_change_percent": f"{POTENTIAL_FX_TRIGGER_PERCENT:.1f}",
            "maximum_absolute_price_change_percent": f"{POTENTIAL_PRICE_CHANGE_CAP_PERCENT:.1f}",
            "note": "These review thresholds do not write or suppress the unguarded candidate list; the owner must approve a later apply scope.",
        },
        "pricing_formula": "retail_hkd = ceil((cost_cny × latest_cny_to_hkd ÷ (1 - target_product_margin)) - 0.90) + 0.90",
        "shipping_handling": "pricing_ship_to_hk_hkd is retained for review but not separately added, matching the verified existing CNY-import formula.",
        "no_stripe_writes_performed": True,
        "summary": {
            "active_product_count": len(products),
            "active_hkd_price_count": len(active_hkd_prices),
            "eligible_product_count": len(eligible_product_ids),
            "eligible_sellable_hkd_price_count": len(rows),
            "unchanged_sellable_hkd_price_count": len(rows) - len(changed),
            "price_change_count": len(changed),
            "price_increase_count": len(increases),
            "price_decrease_count": len(decreases),
            "would_apply_with_potential_review_guards_count": len(guard_approved),
            "held_for_fx_change_below_0_5_percent_count": len(guard_held_low_fx),
            "held_for_price_change_above_5_percent_count": len(guard_held_cap),
            "skipped_counts": dict(sorted(skipped.items())),
        },
        "records": rows,
    }
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    JSON_OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    with CSV_OUT.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0]) if rows else [], lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)
    print(json.dumps({"rate_source": rate_data, **payload["summary"], "json_output": str(JSON_OUT), "csv_output": str(CSV_OUT)}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
