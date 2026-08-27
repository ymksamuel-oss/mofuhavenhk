#!/usr/bin/env python3
"""Read-only audit of trusted CNY cost precision in the reviewed 1.166 preview."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PREVIEW = ROOT / "reports" / "catalog_cny_hkd_multiplier_repricing_preview_1_166_2026-08-27.json"

payload = json.loads(PREVIEW.read_text(encoding="utf-8"))
records = payload["records"]
computed = [record for record in records if record.get("cost_cny")]
over_precision = [
    record for record in computed
    if len(str(record["cost_cny"]).split(".", 1)[1]) > 4
]
print(json.dumps({
    "reviewed_computed_price_count": len(computed),
    "costs_with_more_than_four_decimals": len(over_precision),
    "records": [{
        "price_id": record["price_id"],
        "product_id": record["product_id"],
        "mofu_sku": record.get("mofu_sku"),
        "cost_cny": record["cost_cny"],
        "cost_source": record["cost_source"],
        "pricing_status": record["pricing_status"],
    } for record in over_precision],
}, ensure_ascii=False, indent=2))
