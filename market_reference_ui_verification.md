# 市場參考價前台驗證紀錄

驗證日期：2026-08-26（本機 Next.js 預覽）

| 產品 | 商品頁 | 現價 | 市場參考價 | 驗證結果 |
| --- | --- | ---: | ---: | --- |
| Mama Cook 雞胸肉雞肫凍干 18g | `/product/prod_V8W072ieTWyOZ7?lang=zh` | HK$62.40 | HK$75.00 | 商品頁成功載入；「市場參考價」以中性資料列顯示，不含刪除線或折扣百分比。 |
| d.b.f 牛肉奶酪 85g | `/product/prod_V8e2EKKmnHUR8w?lang=zh` | HK$27.20 | HK$37.00 | 商品頁成功載入；現價、規格、加購控制項維持正常，市場參考價未改變 Stripe Price ID。 |

## 語意檢查

市場參考價元件僅會讀取 `market_reference_price_hkd`，且只在數值高於現價時顯示。既有 `compare_at_price_hkd`／`originalPrice` 仍保留給本店已驗證原價與折扣顯示；兩者不共用刪除線、折扣標籤或 Checkout 金額。

## 已修復的既有載入問題

本機驗證最初發現 `ProductDetail` 缺少 `ProductGallery` 匯入，造成商品頁暫時性錯誤。已補回既有元件匯入後重新驗證兩個商品頁，均成功載入。

## Stripe Checkout 安全核對

已以 Mama Cook 雞胸肉雞肫凍干 18g 建立指定商品的未付款 Hosted Checkout Session，並立即失效。Session 明細使用既有 Stripe Price `price_1U8Ey2RyM6dRKLtZnfFC1DjA`，商品金額 HK$62.40（`unit_amount` 6240），總額 HK$87.40（含系統 HK$25 運費）。Session 最終狀態為 `expired`／`unpaid`。市場參考價只存在於產品展示 metadata，未傳入 Checkout、未改動 Stripe Price ID，亦未改動付款金額。
