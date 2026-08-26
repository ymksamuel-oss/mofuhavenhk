# 市場參考價上線報告

**日期：** 2026-08-26  
**範圍：** 最近兩日新增產品中，具同規格公開市場證據且無 SKU 對應疑慮的產品。  
**原則：** 「市場參考價」是外部同規格市場資料，並非 Mofu Haven 曾經的原價；因此不使用刪除線、折扣百分比或「限時優惠」標籤。

## 已套用產品

| 產品 | Stripe Product | 本店現價 | 市場參考價 | 資料日期 | 前台處理 |
| --- | --- | ---: | ---: | --- | --- |
| Mama Cook 雞胸肉雞肫凍干 18g | `prod_V8W072ieTWyOZ7` | HK$62.40 | HK$75.00 | 2026-08-25 | 以中性「市場參考價」資訊列顯示。 |
| d.b.f 牛肉奶酪 85g | `prod_V8e2EKKmnHUR8w` | HK$27.20 | HK$37.00 | 2026-08-25 | 以中性「市場參考價」資訊列顯示。 |
| d.b.f 高齡犬之食事 雞肉紅薯 85g | `prod_V8e2hvyqfhk59B` | HK$27.20 | HK$36.00 | 2026-08-25 | 以中性「市場參考價」資訊列顯示。 |

市場參考價只存於以下 Stripe Product metadata：`market_reference_price_hkd`、`market_reference_as_of`、`market_reference_schema` 及內部證據編號。來源平台名稱及連結**不會**寫入 Stripe metadata 或前台，避免對顧客披露來源資訊。

## 已排除產品

| 項目 | 原因 | 處理 |
| --- | --- | --- |
| 兩個 d.b.f D1104 85g 候選 | 兩個已匯入產品名稱不同，但同時指向同一公開 SKU。 | 未顯示市場參考價，等待包裝／SKU 對應覆核。 |
| 其餘外部資料候選 | 未能同時達到同規格、HKD 參考價高於本店現價及可直接覆核三項要求。 | 不新增市場參考價。 |

## 前台與 Checkout 驗證

本機商品頁已核對 Mama Cook 及 d.b.f 牛肉奶酪：市場參考價為獨立文字列，不含刪除線、折扣標籤或價格計算功能。商品詳情頁原有 `ProductGallery` 匯入缺失已修復。

另以 Mama Cook 雞胸肉雞肫凍干 18g 建立未付款 Hosted Checkout 測試；Stripe 明細仍使用既有 Price `price_1U8Ey2RyM6dRKLtZnfFC1DjA`、商品 HK$62.40，總額 HK$87.40（含 HK$25 運費）。測試 Session 已立即失效，狀態為 `expired`／`unpaid`。市場參考價沒有影響 Stripe Payment、Price ID 或購物籃金額。

## 資料來源與覆核

所有已採用數值均來自同規格公開頁面的人工覆核；詳細來源證據見 `recent_48h_compare_at_source_notes.md`。市場資料具有時效性，應在價格有大幅調整或重新採購前重新覆核。

## 正式部署結果

GitHub `main` 提交 `cd9e1bcc` 已由 Vercel 以 Production 環境部署為 Current。以快取繞過參數重新請求正式自訂網域後，Mama Cook 商品頁已顯示「市場參考價 HK$75.00 · 2026-08-25」，本店現價仍為 HK$62.40，且頁面未顯示市場來源平台、刪除線或折扣百分比。
