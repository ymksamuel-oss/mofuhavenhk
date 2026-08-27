#!/usr/bin/env python3
"""Render an owner-readable report for the live Stripe pricing-metadata gap audit."""
from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GAP = ROOT / "reports" / "fx_pricing_metadata_gap_audit_2026-08-27.json"
RECON = ROOT / "reports" / "fx_pricing_local_source_reconciliation_2026-08-27.json"
OUT = ROOT / "reports" / "fx_pricing_metadata_gap_audit_2026-08-27.md"


def table(headers: list[str], rows: list[list[str]]) -> str:
    return "\n".join([
        "| " + " | ".join(headers) + " |",
        "| " + " | ".join(["---"] * len(headers)) + " |",
        *["| " + " | ".join(row) + " |" for row in rows],
    ])


def main() -> None:
    gap = json.loads(GAP.read_text(encoding="utf-8"))
    recon = json.loads(RECON.read_text(encoding="utf-8"))
    summary = gap["summary"]
    excluded = gap["excluded_products"]
    recon_by_product = {row["product_id"]: row for row in recon["products"]}
    source_groups: dict[str, list[dict[str, object]]] = defaultdict(list)
    for product in excluded:
        source_groups[product["mofu_import_source"] or "未標示匯入來源"].append(product)
    source_rows: list[list[str]] = []
    for source, products in sorted(source_groups.items()):
        matched = sum(bool(recon_by_product[product["product_id"]]["local_cost_records"]) for product in products)
        source_rows.append([source, str(len(products)), str(matched), str(len(products) - matched)])

    capacity_products = [product for product in excluded if product["product_metadata_key_count"] >= 50]
    capacity_rows = [
        [
            product["mofu_sku"], product["product_name"], product["mofu_import_source"] or "未標示",
            str(product["product_metadata_key_count"]),
            "本機有 CNY 成本" if recon_by_product[product["product_id"]]["local_cost_records"] else "本機未找到 CNY 成本",
        ]
        for product in capacity_products
    ]
    local_cost_products = [row for row in recon["products"] if row["local_cost_records"]]
    local_cost_capacity = sum(
        next(product for product in excluded if product["product_id"] == row["product_id"])["product_metadata_key_count"] >= 50
        for row in local_cost_products
    )
    report = f"""# Stripe CNY 定價 Metadata 欄位審計

**產生時間（UTC）：** {gap['generated_at_utc']}
**方式：** 只讀，即時讀取 Stripe 的活躍 Product、活躍 HKD Price 及停用 HKD Price，再與目前工作目錄的舊批次對照檔交叉核對。**沒有改動任何 Stripe metadata、Price 或前台售價。**

## 結論

> **目前的讀取程式沒有漏讀一個已存在的 CNY 定價欄位。** 120 件未納入產品在 Stripe 的活躍 Product metadata、活躍 HKD Price metadata，及其可查得的 102 項停用 HKD Price metadata，均找不到現行重定價所需的 CNY 成本、毛利、匯率或 `.90` 取整欄位。

換句話說，問題是 **資料未同步至 Stripe 的現行定價 metadata schema**，而不是 `catalog-server` 或預覽程式讀錯 Column／Field。這 120 件商品仍有產品內容、SKU、現有 HKD 售價、變體及部份原價比較資料，所以可以正常在網站銷售；只是不能安全地以 CNY 匯率重新計價。

| 即時讀取範圍 | 數量 |
| --- | ---: |
| 活躍 Stripe Product | {summary['active_product_count']} |
| 活躍 HKD Price | {summary['active_hkd_price_count']} |
| 停用 HKD Price（歷史核查） | {summary['inactive_hkd_price_count']} |
| 已具完整可讀 CNY 定價資料 | 106 件產品 |
| **缺完整 CNY 定價資料** | **120 件產品** |

## 現行讀取契約與實際結果

| 必需資料 | 現行接受的 Stripe 欄位 | 120 件的即時結果 |
| --- | --- | --- |
| CNY 成本 | `price.metadata.cost_cny`／`price.metadata.cny_cost`；後備為 Product 同名欄位 | **120/120 沒有** |
| 目標毛利 | `product.metadata.pricing_target_product_gross_margin`／`target_product_margin` | **120/120 沒有** |
| CNY→HKD 定價基準 | `product.metadata.pricing_cny_to_hkd`／`fx_cny_to_hkd` | **120/120 沒有** |
| 取整規則 | `product.metadata.pricing_rounding = upward .90` | **120/120 沒有** |
| 歷史停用 Price 的上述欄位 | 同上 | **0/120 找到** |

活躍 Price 的 `mofu_tail_rounding_*`、`compare_at_price_*`、`variant_*` 及 Product 的 `market_reference_price_hkd` 都已核查。它們是尾數調整、原價比較或變體資料，**不是 CNY 成本、毛利或 FX 定價欄位**，不能反推出安全的新零售價。

## 先前輸入的資料是否存在？

答案是：**部分存在於本機舊批次對照檔，但沒有被寫進 Stripe metadata。** 透過供應商 SKU 交叉比對，可明確找回 29 件產品的本機 CNY 成本資料；全部在 Stripe 中仍缺少上述四組定價 metadata。

| Stripe 匯入來源 | 未納入產品 | 本機找到 CNY 成本 | 本機未找到 CNY 成本 |
| --- | ---: | ---: | ---: |
{chr(10).join('| ' + ' | '.join(row) + ' |' for row in source_rows)}

已找回的 29 件包括 `batch24_product_mapping.json` 的 24 件（`source_cost_cny`，並有 `exchange_rate_cny_hkd = 1.1654`、45% 目標毛利與向上 `.90` 規則），以及 `combo_dogfood_5_import_mapping.json` 的 5 件（每件 `source_cost_cny = 114`，同樣記錄 1.1654、45% 和 `.90` 政策）。因此，使用者所指的「已輸入」資料**確有一部分保存在舊對照檔**；但它們當初並沒有進入目前前台實際讀取的 Stripe metadata 欄位。

其餘 91 件的 Stripe metadata 只記錄了原始來源檔名／批次名；目前工作目錄內沒有可與之匹配的 recognised CNY cost record。當中包括 20 件 `products_20_list.csv` 批次、21 件 `pet_products_clean_retail_only.csv` 批次、23 件 DBF 狗罐頭批次、7 件七口味分級定價批次及 20 件店主訂貨清單批次。這表示**目前 checkout 找不到可審計的 CNY 成本資料**；並不等於在其他未附上的原始檔、表格或供應商記錄中絕對不存在。

## Metadata 容量核查

120 件中 **111 件** Product metadata 未達 50 欄；因此不是容量問題。另有 **9 件** 已達 50 欄，新增 Product 層級的毛利、匯率及取整欄位前必須先作可回退的欄位整理。當中 4 件 PETLINE 已可在本機找回 CNY 成本，但因已滿欄位，不能直接補足 Product 層級資料。

{table(['店內 SKU', '產品', '匯入來源', '現有 metadata 欄位', '本機 CNY 成本狀態'], capacity_rows)}

## 安全後續處理

**29 件可找回成本的產品**可以準備一份獨立、完全 dry-run 的 metadata 同步清單：成本應寫在相應活躍 HKD Price 的 `cost_cny`，而毛利、匯率、取整規則應寫在 Product metadata。對於 metadata 已滿的 4 件 PETLINE，須先逐欄確認可安全移除或合併的展示重複欄位，不能強制覆寫。

**其餘 91 件**不應以現有 HKD 售價倒推 CNY 成本，也不應假設全部沿用同一成本或毛利。要納入未來 FX 重定價，須提供／找回每件或每個可售變體的 CNY 成本，再以來源包裝、供應商資料或原始批次檔作核對。完成後仍要先跑唯讀預覽，取得店主批准才可建立 replacement Stripe Price。

## 附件用途

CSV 列出全部 120 件的 Stripe product ID、店內 SKU、匯入鍵、供應商 SKU、metadata 欄位數、缺漏原因，以及在活躍／停用 Price metadata 找到的相關欄位。JSON 保留完整的逐件 metadata 位置與值，以便日後同步前作 preflight 比對。
"""
    OUT.write_text(report.replace("  \n", "\n"), encoding="utf-8")
    print(OUT)


if __name__ == "__main__":
    main()
