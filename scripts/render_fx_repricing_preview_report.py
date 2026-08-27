#!/usr/bin/env python3
"""Render a concise owner-review report from the read-only FX preview JSON."""
from __future__ import annotations

import json
from collections import defaultdict
from decimal import Decimal
from pathlib import Path
from statistics import median

ROOT = Path(__file__).resolve().parents[1]
PREVIEW = ROOT / "reports" / "cny_hkd_sellable_repricing_preview_2026-08-27.json"
OUT = ROOT / "reports" / "cny_hkd_sellable_repricing_preview_2026-08-27.md"


def money(value: Decimal) -> str:
    return f"HK${value:,.2f}"


def decimal(record: dict[str, object], key: str) -> Decimal:
    return Decimal(str(record[key]))


def table(headers: list[str], rows: list[list[str]]) -> str:
    header = "| " + " | ".join(headers) + " |"
    divider = "| " + " | ".join(["---"] * len(headers)) + " |"
    body = ["| " + " | ".join(row) + " |" for row in rows]
    return "\n".join([header, divider, *body])


def main() -> None:
    data = json.loads(PREVIEW.read_text(encoding="utf-8"))
    summary = data["summary"]
    records: list[dict[str, object]] = data["records"]
    changed = [row for row in records if row["would_change_without_guard"]]
    unchanged = [row for row in records if not row["would_change_without_guard"]]
    source = data["rate_source"]
    old_fx = decimal(records[0], "stored_cny_to_hkd")
    new_fx = Decimal(str(source["rate"]))
    fx_delta = (new_fx - old_fx) / old_fx * Decimal("100")
    price_deltas = [decimal(row, "price_change_hkd") for row in changed]
    pct_deltas = [decimal(row, "price_change_percent") for row in changed]
    current_total = sum((decimal(row, "current_hkd") for row in records), Decimal("0"))
    proposed_total = sum((decimal(row, "proposed_hkd") for row in records), Decimal("0"))
    unique_changed_products = len({str(row["product_id"]) for row in changed})
    unique_changed_skus = len({str(row["mofu_sku"]) for row in changed})
    target_failures = [
        row for row in records
        if decimal(row, "proposed_margin_at_latest_fx") + Decimal("0.00005") < decimal(row, "target_product_margin")
    ]
    above_five_percent = [row for row in changed if abs(decimal(row, "price_change_percent")) > Decimal("5")]
    grouped: dict[tuple[str, str], list[dict[str, object]]] = defaultdict(list)
    for row in changed:
        grouped[(str(row["brand"]), str(row["category"]))].append(row)
    grouping_rows: list[list[str]] = []
    for (brand, category), group in sorted(grouped.items()):
        grouping_rows.append([
            brand,
            category,
            str(len({str(row["product_id"]) for row in group})),
            str(len(group)),
            money(sum((decimal(row, "price_change_hkd") for row in group), Decimal("0"))),
        ])
    status_groups: dict[str, int] = defaultdict(int)
    for row in changed:
        status_groups[str(row["potential_review_guard_status"])] += 1
    changed_rows: list[list[str]] = []
    for row in sorted(changed, key=lambda item: (str(item["mofu_sku"]), str(item["price_id"]))):
        variant = str(row["variant_label_zh"]) or "—"
        changed_rows.append([
            str(row["mofu_sku"]),
            str(row["product_name"]),
            variant,
            str(row["price_id"]),
            money(decimal(row, "current_hkd")),
            money(decimal(row, "proposed_hkd")),
            f"+{money(decimal(row, 'price_change_hkd'))}",
            f"+{decimal(row, 'price_change_percent'):.2f}%",
        ])
    report = f"""# CNY→HKD 售價重定價唯讀預覽

**產生時間（UTC）：** {data['generated_at_utc']}
**狀態：** **唯讀預覽**。本次只作公開匯率與 Stripe 現行資料的讀取及計算；**沒有建立、停用或切換任何 Stripe Price，亦沒有改動網站前台售價。**

本輪沿用已驗證的歷史定價公式：`CNY 成本 × CNY→HKD 匯率 ÷ (1 − 目標毛利率)`，並向上取整至 `.90`。所有 121 個納入的可售 HKD Price 均持有 `45%` 目標毛利、`1.1654` 的既存匯率基準及 `upward .90` 取整規則。既有匯入程式的驗證式並**沒有**把 `pricing_ship_to_hk_hkd` 另行加進公式；為避免任意改寫歷史成本定義，本次同樣不另加運費。此欄位是否已包含於 CNY 成本、或將來應獨立計入，仍須店主在任何實際套用前確認。

## 參考匯率與範圍

| 項目 | 結果 |
| --- | ---: |
| 公開參考匯率 | **1 CNY = {new_fx:.4f} HKD** |
| 匯率資料日期 | {source['date']} |
| 既存定價匯率 | 1 CNY = {old_fx:.4f} HKD |
| 相對變動 | {fx_delta:+.4f}% |
| 已檢查活躍 Stripe 產品 | {summary['active_product_count']} 件 |
| 已檢查活躍 HKD Price | {summary['active_hkd_price_count']} 項 |
| 具完整成本／毛利／匯率資料且前台可售 | **{summary['eligible_product_count']} 件產品／{summary['eligible_sellable_hkd_price_count']} 項 Price** |
| 未納入 | 120 件產品；其對應 {summary['skipped_counts'].get('incomplete_product_pricing_metadata', 0)} 項可售價缺少完整定價資料 |

資料來源為 Frankfurter 的 CNY/HKD 單日參考匯率端點；它是參考匯率而非可成交的即時報價，因此不應當作實時外匯交易價格。[1]

## 預覽結果

| 指標 | 結果 |
| --- | ---: |
| 不變價格 | {len(unchanged)} 項 |
| 原始建議變動（未套門檻） | **{len(changed)} 項 Price／{unique_changed_products} 件產品／{unique_changed_skus} 個店內 SKU** |
| 上調／下調 | {summary['price_increase_count']}／{summary['price_decrease_count']} |
| 價格合計：現行 → 建議 | {money(current_total)} → {money(proposed_total)} |
| 價格合計差額 | {money(proposed_total - current_total)} |
| 每項變幅中位數／最大值 | {money(Decimal(str(median(price_deltas))))}／{money(max(price_deltas))} |
| 百分比變幅中位數／最大值 | {Decimal(str(median(pct_deltas))):.2f}%／{max(pct_deltas):.2f}% |
| 建議價低於目標毛利的項目 | **{len(target_failures)}** |
| 單項變幅超過 5% 的項目 | **{len(above_five_percent)}** |

所有 15 項原始建議均為 **+HK$1.00**；這是匯率上升約 {fx_delta:.2f}% 後，部分現行價格剛好跌穿下一個 `.90` 向上取整門檻所致，而不是按匯率比例放大價格。

## 只供日後政策選擇的保護門檻

以下門檻**尚未啟用，亦沒有被用作改價**，只用來展示若日後採用「匯率絕對變動至少 0.5%，並限制每項價格變動不超過 5%」時的效果。

| 審核狀態 | 項數 |
| --- | ---: |
| 通過假設的 0.5% 匯率觸發及 5% 價格上限 | {summary['would_apply_with_potential_review_guards_count']} |
| 因匯率變動低於 0.5% 而暫緩 | {summary['held_for_fx_change_below_0_5_percent_count']} |
| 因單項變幅超過 5% 而暫緩 | {summary['held_for_price_change_above_5_percent_count']} |

換言之，如採用以上示例門檻，今次不會有任何價格進入可套用名單；但完整的 15 項候選變動仍保留於本報告及 CSV，讓店主決定是否要例外批准。

## 建議變動（未套門檻）

{table(['店內 SKU', '產品', '變體／規格', '現行 Price ID', '現價', '建議價', '變幅', '百分比'], changed_rows)}

## 按品牌及前台分類匯總

{table(['品牌', '分類', '受影響產品', 'Price 項數', '價格差額合計'], grouping_rows)}

## 人工批准前的執行與回復安排

若店主日後明確批准某個範圍，實際執行必須另行重新讀取 Stripe、比對這份預覽的舊 Price ID／金額／metadata，並以 Stripe 的不可變 Price 模式建立 replacement Price。流程會完整複製 metadata、保留變體鍵及排序、只在原 Price 為預設價時切換 `Product.default_price`，待逐項讀回驗證後才停用被取代的舊價。每項需寫入 idempotency key 及可回復 manifest。Stripe 的 Price 資源在建立後無法直接改變金額，這也是不能「原地覆寫」的原因。[2]

回復時會以 manifest 逐項重新啟用舊 Price、如有需要把 `default_price` 指回舊 Price，並停用新 replacement Price；回復前也必須先重讀確認，避免覆蓋其後的人手調整或新訂單配置。本輪**尚未**建立這些 replacement Price 或 manifest，因為店主只授權預覽。

## 可供決定的下一步

請選擇一項，屆時才會進入另一輪獨立的寫入前審核：

1. **維持預覽，不改價。**
2. **例外批准本報告列出的 15 項 +HK$1.00**，即使匯率變動低於示例 0.5% 門檻。
3. **只採用門檻政策**（今次結果為 0 項），並指定日後 FX 觸發百分比和每項價格上限。
4. **修改公式或運費定義後重新預覽**；尤其需要先確認 `pricing_ship_to_hk_hkd` 是否已包含在 `cost_cny`。

## 參考資料

[1]: https://frankfurter.dev/docs/ "Frankfurter API Documentation"
[2]: https://docs.stripe.com/api/prices/update "Stripe API – Update a price"
"""
    OUT.write_text(report, encoding="utf-8")
    print(OUT)


if __name__ == "__main__":
    main()
