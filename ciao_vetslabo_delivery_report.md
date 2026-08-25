# CIAO 與 Vet's Labo 20 款商品上架交付報告

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
| Stripe 驗證 | `ok: True`；已驗證 20 個 Product 與 Price |
| Checkout 測試 | CIAOVL-01 使用指定 Price ID，商品 HK$16.00、連運費總額 HK$41.00；未付款 Session 已立即失效 |
| 前台驗證 | CIAO 小食與 Vet's Labo 貓罐罐商品頁均顯示清理圖 CDN URL、雙語資料、現價、劃線原價、折扣標籤及加購控制項 |

## 用戶確認的資料修正

> CSV 第 9 款最初寫為「鰹魚雞肉柴魚片高湯」。根據用戶其後提供的原包裝截圖，本批正式上架名稱已修正為 **「鮪魚雞肉柴魚片高湯 40g」**，並使用相符的 `IMG_1581.PNG` 清理後商品圖。

## 商品與 Stripe 對照

| SKU | 商品名稱 | 規格 | 前台子分類 | 現價 | 劃線原價 | Stripe Product | Stripe Price |
| --- | --- | --- | --- | ---: | ---: | --- | --- |
| CIAOVL-01 | 香烤鰹魚干瑤柱 (高齡貓用) | 50g | 貓貓小食 | HK$16.00 | HK$18.00 | `prod_V8fduDqyGKiazf` | `price_1U8OIeRyM6dRKLtZNHUpjECK` |
| CIAOVL-02 | 香烤扇貝柱 (高齡貓用) | 50g | 貓貓小食 | HK$16.00 | HK$18.00 | `prod_V8fd05UFEZNURC` | `price_1U8OIfRyM6dRKLtZtgeVxS5h` |
| CIAOVL-03 | 扇貝柱正宗高湯 | 50g | 貓貓小食 | HK$16.00 | HK$18.00 | `prod_V8fdpmkax4VOq1` | `price_1U8OIgRyM6dRKLtZ71U8A42R` |
| CIAOVL-04 | 烤鰹魚含小銀魚+扇貝柱 | 50g | 貓貓小食 | HK$16.00 | HK$18.00 | `prod_V8fdnUyX0IymBN` | `price_1U8OIhRyM6dRKLtZCFhTVvpP` |
| CIAOVL-05 | 炙烤雞胸肉含蟹肉棒+扇貝柱 | 50g | 貓貓小食 | HK$16.00 | HK$18.00 | `prod_V8fep70tdjHDoG` | `price_1U8OIjRyM6dRKLtZF9zEr29F` |
| CIAOVL-06 | 金槍魚雞肉鰹魚 | 40g | 貓貓小食 | HK$12.00 | HK$14.00 | `prod_V8feoZ4v72AX1T` | `price_1U8OIkRyM6dRKLtZqtC12lss` |
| CIAOVL-07 | 化毛呵護鰹魚片扇貝柱 | 50g | 貓貓小食 | HK$16.00 | HK$18.00 | `prod_V8fe010ZPXAJ1J` | `price_1U8OIlRyM6dRKLtZV4CPYsXS` |
| CIAOVL-08 | 雞胸肉扇貝柱 | 50g | 貓貓小食 | HK$16.00 | HK$18.00 | `prod_V8fe4RA15lCQZO` | `price_1U8OImRyM6dRKLtZVZ7dbbQE` |
| CIAOVL-09 | 鮪魚雞肉柴魚片高湯 | 40g | 貓貓小食 | HK$12.00 | HK$14.00 | `prod_V8feXQdvRNrV4B` | `price_1U8OInRyM6dRKLtZDcTgB24x` |
| CIAOVL-10 | 雞肉鰹魚干高湯 | 40g | 貓貓小食 | HK$12.00 | HK$14.00 | `prod_V8feeIGBK4DYB1` | `price_1U8OIoRyM6dRKLtZJY98Voqj` |
| CIAOVL-11 | 鰹魚干扇貝味 (香烤風味) | 30g | 貓貓小食 | HK$14.00 | HK$16.00 | `prod_V8fefdYTxUdNva` | `price_1U8OIpRyM6dRKLtZRiQbHNJo` |
| CIAOVL-12 | 北海道風味扇貝 (香烤風味) | 30g | 貓貓小食 | HK$14.00 | HK$16.00 | `prod_V8feNaBEY6Pn28` | `price_1U8OIqRyM6dRKLtZQnHygB0m` |
| CIAOVL-13 | 銀魚扇貝味 (香烤風味) | 30g | 貓貓小食 | HK$14.00 | HK$16.00 | `prod_V8fenfKdEjRnr7` | `price_1U8OIrRyM6dRKLtZwDgyu8Qz` |
| CIAOVL-14 | 正宗高湯味 (香烤風味) | 30g | 貓貓小食 | HK$14.00 | HK$16.00 | `prod_V8fe3PM27QjYNh` | `price_1U8OIsRyM6dRKLtZXP50wjXL` |
| CIAOVL-15 | 6種功能性成分 (鰹魚雞胸肉木魚花) | 30g | 貓貓小食 | HK$10.00 | HK$12.00 | `prod_V8fe1kWPFBfcKh` | `price_1U8OIuRyM6dRKLtZptCjy7AO` |
| CIAOVL-16 | 6種功能性成分 (雞胸肉扇貝味) | 30g | 貓貓小食 | HK$10.00 | HK$12.00 | `prod_V8feew2ryjD7ql` | `price_1U8OIvRyM6dRKLtZqxQP3gmh` |
| CIAOVL-17 | MediMousse 腸胃呵護慕斯 | 95g | 貓罐罐 | HK$38.00 | HK$42.00 | `prod_V8feViin1yPowA` | `price_1U8OIwRyM6dRKLtZIwxF2hDw` |
| CIAOVL-18 | MediMousse 健康支持慕斯 | 95g | 貓罐罐 | HK$38.00 | HK$42.00 | `prod_V8fexvyuSOogz8` | `price_1U8OIxRyM6dRKLtZGEbyPR7G` |
| CIAOVL-19 | MediMousse 皮膚維護慕斯 | 95g | 貓罐罐 | HK$38.00 | HK$42.00 | `prod_V8feexDq7xAidn` | `price_1U8OIyRyM6dRKLtZbljKKI6m` |
| CIAOVL-20 | MediMousse 減肥減脂慕斯 | 95g | 貓罐罐 | HK$38.00 | HK$42.00 | `prod_V8fe6YUsIrEf8Q` | `price_1U8OIzRyM6dRKLtZ2Fdzyhmv` |

## 驗證紀錄

現有自動測試已通過 **30 / 30**；商品資料驗證及 Next.js production build 均成功完成。正式前台核對頁面及 Stripe 驗證紀錄如下：

- `ciao_vetslabo_production_ui_verification.md`
- `ciao_vetslabo_stripe_verification.json`
- `ciao_vetslabo_checkout_verification.json`

