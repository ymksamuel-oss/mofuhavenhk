# 前台分類過濾稽核

檢查時間：2026-09-03（GMT+8）

## 正式資料檢查

正式 `/api/store` 回傳的 CIAO 極強乳酸菌 Cranky 吞拿魚節混合味幼貓產品（`ead5a682-0931-473c-9bea-da6a1ca56270`）具有有效的 `category_id`：`6d7b832a-0035-44b1-b5a2-bc29350510a4`。此分類節點為「🐱凍乾食品」，slug 為 `cat-feezed-dried-food`，其父分類 ID 為 `7c790bd4-6ab9-473d-b591-0a2736d68d48`。因此產品資料已指派至單一分類節點，並非資料庫把產品重複指定到多個分類。

## 已

## 正式凍乾分類頁驗證

提交 `0880317e` 部署後，正式路徑 `/categories/cats/freeze-dried` 顯示 CIAO 極強乳酸菌 Cranky 產品。這確認產品由 Supabase 子分類「🐱凍乾食品」正確解析為父分類 `cats` 與前台子分類「冷凍脫水系列」。

正式路徑 `/categories/cats/dry-food` 及 `/categories/dogs/wet-cans` 均顯示空分類訊息，沒有出現 CIAO 產品。此結果與凍乾頁的正向驗證配對，確認該產品不再於貓乾糧或狗狗濕糧等非指定分類重複出現。

正式 `/categories/cats` 主分類頁會顯示 CIAO 產品，而正式 `/categories/dogs` 主分類頁則顯示空分類訊息。此結果確認子分類外鍵能正確追溯至貓咪父分類，且不會跨至狗狗主分類。
