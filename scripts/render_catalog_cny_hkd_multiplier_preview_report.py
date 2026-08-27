#!/usr/bin/env python3
"""Render owner-review reports for the full catalog fixed-multiplier price preview."""
from __future__ import annotations

import json
from collections import defaultdict
from decimal import Decimal
from pathlib import Path
from statistics import median

ROOT = Path(__file__).resolve().parents[1]
REPORT_DIR = ROOT / "reports"
PREVIEW = REPORT_DIR / "catalog_cny_hkd_multiplier_repricing_preview_2026-08-27.json"
MANIFEST = REPORT_DIR / "catalog_cny_hkd_multiplier_pending_approval_manifest_2026-08-27.json"
OUT = REPORT_DIR / "catalog_cny_hkd_multiplier_repricing_preview_2026-08-27.md"


def dec(value: str) -> Decimal:
    return Decimal(str(value))


def money(value: Decimal) -> str:
    return f"HK${value:.2f}"


def pct(value: Decimal) -> str:
    return f"{value * Decimal('100'):.2f}%"


def table(headers: list[str], rows: list[list[str]]) -> str:
    return "\n".join([
        "| " + " | ".join(headers) + " |",
        "| " + " | ".join(["---"] * len(headers)) + " |",
        *["| " + " | ".join(row) + " |" for row in rows],
    ])


def summarize_group(records: list[dict[str, object]], field: str) -> list[list[str]]:
    groups: dict[str, list[dict[str, object]]] = defaultdict(list)
    for record in records:
        groups[str(record[field])].append(record)
    rows: list[list[str]] = []
    for name, items in sorted(groups.items(), key=lambda pair: (-len(pair[1]), pair[0])):
        changed = [item for item in items if item["approval_manifest_scope"]]
        rows.append([
            name,
            str(len(items)),
            str(len(changed)),
            money(sum(dec(str(item["price_change_hkd"])) for item in changed)) if changed else "HK$0.00",
        ])
    return rows


def main() -> None:
    preview = json.loads(PREVIEW.read_text(encoding="utf-8"))
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    records = preview["records"]
    computed = [item for item in records if item["cost_cny"]]
    candidates = [item for item in records if item["approval_manifest_scope"]]
    unchanged = [item for item in records if item["pricing_status"] == "formula_matches_current_price_no_replacement"]
    waiting = [item for item in records if not item["cost_cny"]]
    candidate_deltas = [dec(item["price_change_hkd"]) for item in candidates]
    candidate_delta_pct = [dec(item["price_change_percent"]) / Decimal("100") for item in candidates]
    net_margins = [dec(item["estimated_net_margin_after_domestic_stripe_fee"]) for item in computed]
    product_count_waiting = len({item["product_id"] for item in waiting})
    cost_by_source = preview["summary"]["cost_source_counts"]
    largest_decreases = sorted(candidates, key=lambda item: dec(item["price_change_hkd"]))[:10]
    largest_rows = [[
        str(item["mofu_sku"]), str(item["product_name"]), str(item["variant_label_zh"]),
        money(dec(item["current_hkd"])), money(dec(item["proposed_hkd"])),
        money(dec(item["price_change_hkd"])), f"{dec(item['price_change_percent']):.2f}%",
    ] for item in largest_decreases]

    report = f"""# 全站固定倍率定價方程式 — 唯讀更新預覽

**產生時間（UTC）：** {preview['generated_at_utc']}
**狀態：** **唯讀預覽及待批准清單**。沒有建立、更新或停用任何 Stripe Price，沒有更新 Product metadata，亦沒有改變網站前台售價。

## 指定定價方程式

> **HKD 零售價 = 向上取整至 `.90`（CNY 成本 × 1.1654 × 1.76）**

匯率 `1.1654` 及倍率 `1.76` 均按店主今輪指示固定，沒有使用匯率輪詢或自動排程。`cny_hkd_multiplier_pricing_policy.py` 已把這一條規則集中為可重用函式；日後新產品在輸入正確的每個 Price／變體 CNY 成本時，匯入流程應呼叫同一函式，避免手動重複方程式。

## 全站覆蓋結果

| 範圍 | 結果 |
| --- | ---: |
| 活躍 Stripe Product | 226 |
| 活躍 HKD Price（Stripe 全帳戶） | 399 |
| 隸屬這 226 件活躍 Product 的活躍 HKD Price | 255 |
| 指向非活躍／缺失 Product 的遺留活躍 Price | 144 |
| 有可信 CNY 成本並成功計算 | {len(computed)} Price／{len({item['product_id'] for item in computed})} 件產品 |
| 缺可信 CNY 成本，保留待輸入 | {len(waiting)} Price／{product_count_waiting} 件產品 |
| 目前前台可售且可安全進入 replacement manifest 的 Price | {len(candidates)} |
| Product 定價政策 metadata 容量受阻的有成本 Price | {preview['summary']['price_status_counts'].get('blocked_product_policy_metadata_capacity', 0)} |
| 方程式已等於目前售價，不需 replacement | {len(unchanged)} |

這個全站清單已涵蓋 **226 件活躍產品及其所有 255 項連結 Price**。144 項未連結至任何活躍 Product 的歷史／遺留 Price 只列為帳戶審計例外，不屬於前台產品，也沒有放入更新範圍。

## 成本資料來源與 91 件待處理項目

| 成本來源 | 已計算 Price |
| --- | ---: |
| 已在活躍 Stripe Price metadata 核實 `cost_cny` | {cost_by_source.get('stripe_price_metadata.cost_cny', 0)} |
| 以供應商 SKU 從已核實本機對照檔找回 | {cost_by_source.get('locally_recovered_supplier_sku', 0)} |
| **尚未有可信 CNY 成本** | **{cost_by_source.get('no_trusted_cny_cost', 0)}** |

91 件缺成本的產品及其 105 項 Price 不會被倒推、猜測或加入更新 manifest。請使用已交付的 `cny_cost_input_template_91_2026-08-27.xlsx` 逐 Price 填入 CNY 成本及來源；填妥後必須重新生成預覽，才可安全納入全站更新。

## 售價變動摘要（有成本的 150 項 Price）

| 結果 | Price 數 | 說明 |
| --- | ---: | --- |
| 可安全進入待批准 replacement 清單的建議調整 | {len(candidates)} | 全部為下調，因新固定倍率低於現時已設定售價。 |
| 因 Product metadata 容量而暫緩 | {preview['summary']['price_status_counts'].get('blocked_product_policy_metadata_capacity', 0)} | 已計算，但不會列入更新清單。 |
| 維持原價 | {len(unchanged)} | 按新方程式及 `.90` 取整後相同。 |
| 建議上調 | 0 | 無。 |
| 建議下調 | {len(candidates)} | 合計 {money(sum(candidate_deltas))}；中位數 {money(median(candidate_deltas))}；最大單項下調 {money(min(candidate_deltas))}。 |
| 單項變幅 | — | 由 {pct(min(candidate_delta_pct))} 至 {pct(max(candidate_delta_pct))}。 |

{table(['品牌', '有成本 Price', '擬議調整 Price', '擬議變動總額'], summarize_group(computed, 'brand'))}

## 最大 10 項擬議下調

{table(['店內 SKU', '產品', '規格', '現價', '方程式建議價', '差額', '變幅'], largest_rows)}

## Stripe 手續費與「50% 淨毛利」核對

Stripe 香港官方標準本地卡收費為每筆成功交易 **3.4% + HK$2.35**；國際卡及貨幣兌換另有附加費。[1]

本預覽完全按指定的 `× 1.76` 方程式出價，**沒有再額外加一次 Stripe 手續費或包裝／物流雜費**，以免自行改寫店主已指定的倍率。報告中只以 `3.4% + HK$2.35` 作單件結帳的估算檢查；未假設國際卡、貨幣兌換、退款、爭議費、折扣、運費或多件同單分攤。

重要限制是：固定倍率 `1.76` 在未計 Stripe 固定費前，成本毛利約為 `1 − 1/1.76 = 43.18%`；再扣除 3.4% 及 HK$2.35 後，**不可能保證 50% 淨毛利**。本次有成本 Price 的單件本地卡費估算後淨毛利約為 **{pct(min(net_margins))} 至 {pct(max(net_margins))}**，中位數約 **{pct(median(net_margins))}**。因此，如「嚴格鎖定 50% 淨毛利」仍是必須目標，需先確認一條不同的方程式及固定費分攤假設，再重新預覽；不可把兩套規則視為相同。

## 待批准的更新清單與回復要求

`catalog_cny_hkd_multiplier_pending_approval_manifest_2026-08-27.json` 是**不可直接執行**的待批准清單，共 {manifest['record_count']} 項可安全處理的擬議 replacement Price，以及 {manifest['product_policy_metadata_operation_count']} 件 Product 的定價政策 metadata 操作。完整保留每項舊／新 cents、Product ID、Price ID、店內 SKU、變體、成本來源及原 Price metadata。另有 {len(manifest['blocked_product_policy_metadata_operations'])} 件 Product 因欄位容量而明確排除。其完整性 SHA-256 為 `{manifest['integrity_sha256']}`。

如店主日後批准指定範圍，真正寫入時必須重新讀取 Stripe，再逐項核對舊 Price 仍屬活躍、金額未變、仍為前台可售 Price、成本及 metadata 容量未變；其後才可建立 replacement Price、複製必要 metadata、切換 `default_price`（如適用）、停用原 Price，並輸出含 replacement ID 的獨立回復 manifest。**這些寫入步驟本輪沒有執行。**

## 下一步

請先核對附件中的 {manifest['record_count']} 項可安全調價清單及 {len(manifest['blocked_product_policy_metadata_operations'])} 件容量受阻產品，並確認下列其中一項：

1. 只保留預覽；
2. 批准指定 SKU／Price 的固定倍率結果；
3. 先填妥 91 件的 CNY 成本，重跑完整 226 件預覽；或
4. 將目標改回「扣 Stripe 後嚴格 50% 淨毛利」，並提供每件包裝／物流成本及 HK$2.35 的分攤方式後重算。

未有明確批准範圍前，所有 Stripe Price、Product metadata 與前台售價維持不變。

## 參考資料

[1]: https://stripe.com/hk/pricing "Stripe 香港定價：本地卡每筆成功交易 3.4% + HK$2.35"
"""
    OUT.write_text(report, encoding="utf-8")
    print(OUT)


if __name__ == '__main__':
    main()
