#!/usr/bin/env python3
"""Create a zero-write preview of implied CNY cost baselines from existing retail prices.

Important: an implied baseline is a mathematical input derived from the current retail
price. It is not a supplier cost, purchase cost, wholesale quote, or verified margin input.
It must never be written into `cost_cny` / `cny_cost` metadata.
"""
from __future__ import annotations

import csv
import json
from datetime import datetime, timezone
from decimal import Decimal, ROUND_CEILING, ROUND_FLOOR
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INPUT = ROOT / "reports" / "current_awaiting_cny_cost_catalog_2026-08-27.json"
CSV_OUT = ROOT / "reports" / "implied_cost_baseline_preview_1_166_2026-08-27.csv"
JSON_OUT = ROOT / "reports" / "implied_cost_baseline_preview_1_166_2026-08-27.json"
MD_OUT = ROOT / "reports" / "implied_cost_baseline_preview_1_166_2026-08-27.md"
FX = Decimal("1.166")
MULTIPLIER = Decimal("1.76")
TAIL = Decimal("0.90")
COST_QUANTUM = Decimal("0.00000001")


def retail_from_cost(cost_cny: Decimal) -> Decimal:
    raw = cost_cny * FX * MULTIPLIER
    return (raw - TAIL).to_integral_value(rounding=ROUND_CEILING) + TAIL


def implied_cost_from_current_retail(current_hkd: Decimal) -> Decimal:
    # Floor preserves `forward(implied) <= current` despite finite decimal storage.
    # Because prices are .90-ending and the error is below one cent, forward pricing
    # remains the current price. This is a price baseline, never an actual cost claim.
    return (current_hkd / (FX * MULTIPLIER)).quantize(COST_QUANTUM, rounding=ROUND_FLOOR)


def main() -> None:
    source = json.loads(INPUT.read_text(encoding="utf-8"))
    rows = []
    for record in source["records"]:
        current = Decimal(record["current_hkd"])
        implied_cost = implied_cost_from_current_retail(current)
        forward = retail_from_cost(implied_cost)
        if forward != current:
            raise RuntimeError(f"Reverse/forward reconciliation failed for {record['price_id']}: {current} -> {implied_cost} -> {forward}")
        rows.append({
            "mofu_sku": record["mofu_sku"],
            "brand": record["brand"],
            "product_id": record["product_id"],
            "price_id": record["price_id"],
            "product_name": record["product_name"],
            "variant_label_zh": record["variant_label_zh"],
            "current_hkd": f"{current:.2f}",
            "formula_fx_cny_to_hkd": f"{FX:.3f}",
            "formula_retail_multiplier": f"{MULTIPLIER:.2f}",
            "implied_cost_cny_baseline": f"{implied_cost:.8f}",
            "forward_formula_hkd_at_same_fx": f"{forward:.2f}",
            "price_change_hkd_at_same_fx": f"{forward - current:.2f}",
            "data_classification": "implied_from_current_retail_not_verified_purchase_cost",
            "must_not_write_as": "cost_cny / cny_cost",
            "write_action": "preview_only_no_stripe_write",
        })
    if len(rows) != 105:
        raise RuntimeError(f"Expected 105 missing-cost Prices, found {len(rows)}")
    payload = {
        "mode": "zero_write_implied_cost_baseline_preview",
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "no_stripe_writes_performed": True,
        "formula": "retail_hkd = ceil_to_.90(implied_cost_cny_baseline × 1.166 × 1.76)",
        "method": "implied_cost_cny_baseline = floor_to_8_decimals(current_retail_hkd ÷ 1.76 ÷ 1.166)",
        "data_governance": "The resulting value is mathematically implied by the current retail price. It is not a real purchase cost and must not be stored in cost_cny/cny_cost or used as an actual margin input.",
        "input_missing_cost_price_count": len(rows),
        "same_fx_price_change_count": sum(row["price_change_hkd_at_same_fx"] != "0.00" for row in rows),
        "records": rows,
    }
    JSON_OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    with CSV_OUT.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0]), lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)
    lines = [
        "# Mofu Haven HK 反向推算成本基準預覽\n",
        f"**產生時間（UTC）：** {payload['generated_at_utc']}\n",
        "**執行狀態：** 純預覽；沒有建立、更新或停用 Stripe 物件。\n",
        "\n> 此清單的 `implied_cost_cny_baseline` 僅由現有零售價數學倒推。它不是實際採購成本，不能寫入 `cost_cny` 或 `cny_cost`，亦不能用作真實毛利、成本或財務報告。\n",
        "\n| 項目 | 結果 |\n| --- | ---: |\n",
        f"| 缺成本 Price 納入預覽 | {len(rows)} |\n",
        "| 指定固定匯率 | 1 CNY = HK$1.166 |\n",
        "| 指定倍率 | 1.76 |\n",
        "| 正向代回相同公式後的價格變動 | 0 項 |\n",
        "\n這表示把現價反向倒推後再以**同一匯率、同一方程式**正向計算，只會回到原價，無法改善現時成本資料缺口。完整逐項清單見 CSV。\n",
    ]
    MD_OUT.write_text("".join(lines), encoding="utf-8")
    print(json.dumps({
        "no_stripe_writes_performed": True,
        "implied_baseline_price_count": len(rows),
        "same_fx_price_change_count": payload["same_fx_price_change_count"],
        "csv": str(CSV_OUT),
        "markdown": str(MD_OUT),
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
