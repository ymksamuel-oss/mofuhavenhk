# Latest 31 圖片批次 — 進貨與上架紀錄

## 來源、定價與圖片

本批以來源清單的 31 個產品列為準，並以 **CNY × 1.1654 ÷ (1 − 45%)** 計算零售基準；供應方直運至香港成本為 HK$0，售價只向上取至下一個 `.90`，絕不低於計算結果。每一款上架商品只使用一張保真清理後、純白背景的主圖，圖片透過 Manus CDN 寫入 Stripe；原始來源圖及本地大圖均不納入版本控制。

## 去重與既有商品處理

`IMG_1754.jpg` 與 `IMG_1746.jpg` 同為 AIM30 15 歲以上室內貓腎臟健康照護鮮魚味 600g，因此合併為同一 SKU，並選用已核對的 `aim30-senior-15plus-fish-600g-v2.png` CDN 主圖。故 31 個來源列去重後為 30 個候選 SKU，而不是按暫存圖片檔案數量計算。

已透過 Stripe active catalog 實查 7 個既有 SKU：AIM30 Karitto 80g 鮮魚／雞肉／四種魚味、AIM30 鰹魚削節 12g、AIM30 雞肉絲 25g、AIM30 吞拿魚片 30g，以及銀之匙鮪魚白蝦 180g。這些商品僅更新已核對的主圖並保留既有 Product、Price 與價格；沒有重建或改價。

## 實際上架結果

| 項目 | 數量 | 處理方式 |
|---|---:|---|
| 來源產品列 | 31 | 逐列追溯至正式映射 |
| 合併重複 SKU | 1 組 | AIM30 15+ 鮮魚 600g，採 v2 主圖 |
| 新建 Stripe Product 與 active HKD Price | 23 | 以獨立 `latest31-2026::` import key 冪等建立 |
| 既有 Stripe Product 主圖更新 | 7 | 保留既有 Price，不建立新 Price |
| 最終處理商品 | 30 | 已經 Stripe post-import 逐項驗證 |

最新批次的正式來源為 `latest_31_product_mapping.json`；`scripts/import_latest_31_products.py` 先執行唯讀 preflight，才允許 apply，重跑時會重用既有 Product 與 active HKD Price。前台僅為確實可互換的同系列、同重量口味加入切換，年齡與功能照護配方則保持獨立商品。
