# 整站簡繁分類正規化 QA

## 稽核範圍與結果

本次以 Stripe active catalog 的 226 個 Product 為範圍，檢查產品名稱、說明、中文 metadata、規格、標籤與 category metadata 中的常見簡體分類關鍵字。稽核完成後，直接影響分類的簡體字候選為 0；可由名稱、說明與 metadata 明確判定的食品分類不一致亦為 0。

| 修正類型 | 數量 | 結果 |
| --- | ---: | --- |
| 簡體分類文字候選 | 0 | 現有 active catalog 已無需額外繁體化的分類關鍵字 |
| Legacy generic metadata 正規化 | 82 | 已改為嚴格的貓狗食品子分類 |
| 價格、圖片、庫存、Stripe Price 或 Checkout 變更 | 0 | 未觸及 |

| 目標嚴格分類 | 已正規化產品數 |
| --- | ---: |
| 貓咪／貓乾糧 | 12 |
| 貓咪／貓罐罐 | 5 |
| 貓咪／貓貓小食 | 24 |
| 狗狗／狗狗乾糧 | 11 |
| 狗狗／狗狗罐頭及濕糧 | 30 |

## 前台驗證

本機 `/categories/cats/dry-food` 已顯示原來採用 generic metadata 的 COMBO 與銀之匙貓乾糧，且頁面只呈現貓乾糧項目。`/categories/dogs/wet-cans` 已顯示 d.b.f 狗狗罐頭，且頁面只呈現狗狗濕糧／罐頭項目。兩個頁面均為 `category + subcategory` 嚴格篩選，不會因 legacy metadata 混入其他商品。

## 簡繁防護規則

分類鏈路現在在 Stripe catalog 轉換、食品分類器及 metadata taxonomy 解析三個入口共用相同的簡繁正規化。已覆蓋貓／小寵物、乾糧、濕糧、罐頭、凍乾、貓砂、廁所及尿墊、清潔、營養、訓練、護理、牽引、籠舍、睡窩等會影響食品或用品分類的關鍵詞。凍乾配料的狗狗乾糧仍優先保留在狗狗乾糧，不會被錯置為凍乾小食。

## Production 驗證

既有 Vercel production 的 `/categories/dogs/wet-cans` 已成功顯示 d.b.f 狗狗罐頭／濕糧，頁面標題為「狗狗罐頭及濕糧」，產品不會混入狗狗乾糧或其他寵物分類。兩個既有 Vercel deployment status 均已成功。
