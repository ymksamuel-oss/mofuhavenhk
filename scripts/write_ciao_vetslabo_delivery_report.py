from __future__ import annotations

import json
from pathlib import Path

ROOT = Path('/home/ubuntu/mofuhavenhk-github')
MANIFEST = json.loads((ROOT / 'ciao_vetslabo_stripe_manifest.json').read_text(encoding='utf-8'))
VERIFICATION = json.loads((ROOT / 'ciao_vetslabo_stripe_verification.json').read_text(encoding='utf-8'))
OUTPUT = ROOT / 'ciao_vetslabo_delivery_report.md'

rows = []
for item in MANIFEST['products']:
    rows.append(
        f"| {item['sku']} | {item['name_zh']} | {item['spec']} | {item['subcategory']} | "
        f"HK${item['retail_hkd']:.2f} | HK${item['compare_at_hkd']:.2f} | "
        f"`{item['stripe_product_id']}` | `{item['stripe_price_id']}` |"
    )

report = f"""# CIAO 與 Vet's Labo 20 款商品上架交付報告

**處理日期：** 2026-08-25（GMT+8）  
**資料來源：** `products_20_list.csv`  
**上架狀態：** 完成

本批商品已嚴格按既定流程處理：原始手機截圖先逐張核對包裝與 CSV 對應，再清理成 **1920 × 1920、純白背景、包裝保真** 的電商主圖；只有清理後圖片才被上傳至 CDN、Stripe 及前台。原始截圖並未被使用作公開商品圖。

## 匯入摘要

| 項目 | 結果 |
| --- | --- |
| 商品／HKD Price | 20 / 20 已建立並直接驗證 |
| 產品類別 | 16 款「貓貓小食」、4 款「貓罐罐」 |
| 庫存 | 全數按 CSV 設為現貨 |
| 劃線原價 | 20 / 20 已寫入 Product 及 Price metadata，且均高於現價 |
| 商品圖片 | 20 / 20 清理後純白主圖已上傳 CDN 並設為 Stripe 首圖 |
| Stripe 驗證 | `ok: {VERIFICATION['ok']}`；已驗證 {VERIFICATION['verified_products']} 個 Product 與 Price |
| Checkout 測試 | CIAOVL-01 使用指定 Price ID，商品 HK$16.00、連運費總額 HK$41.00；未付款 Session 已立即失效 |
| 前台驗證 | CIAO 小食與 Vet's Labo 貓罐罐商品頁均顯示清理圖 CDN URL、雙語資料、現價、劃線原價、折扣標籤及加購控制項 |

## 用戶確認的資料修正

> CSV 第 9 款最初寫為「鰹魚雞肉柴魚片高湯」。根據用戶其後提供的原包裝截圖，本批正式上架名稱已修正為 **「鮪魚雞肉柴魚片高湯 40g」**，並使用相符的 `IMG_1581.PNG` 清理後商品圖。

## 商品與 Stripe 對照

| SKU | 商品名稱 | 規格 | 前台子分類 | 現價 | 劃線原價 | Stripe Product | Stripe Price |
| --- | --- | --- | --- | ---: | ---: | --- | --- |
{chr(10).join(rows)}

## 驗證紀錄

現有自動測試已通過 **30 / 30**；商品資料驗證及 Next.js production build 均成功完成。正式前台核對頁面及 Stripe 驗證紀錄如下：

- `ciao_vetslabo_production_ui_verification.md`
- `ciao_vetslabo_stripe_verification.json`
- `ciao_vetslabo_checkout_verification.json`

"""
OUTPUT.write_text(report, encoding='utf-8')
print(OUTPUT)
