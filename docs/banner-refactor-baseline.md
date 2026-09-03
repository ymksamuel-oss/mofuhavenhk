# Banner 重構前檢查紀錄

檢查時間：2026-09-03（GMT+8）

已檢查正式 Vercel 部署的 `/api/store` 回應；其 `banners` 陣列為空（`[]`）。因此該網站目前沒有可由前台讀取的既有 Banner 記錄，桌面版 `image_url` 與手機版 `mobile_image_url` 的公開 Banner 資料均已處於清空狀態。

後續重構將移除前台的靜態 Banner 備援，使輪播內容完全以 Supabase `banners` 資料表為準；當資料表沒有 Banner 時，前台將不顯示虛構或殘留的輪播內容。

## 本機生產版介面驗證

本機生產建置的 `/admin` 頁面已成功載入「Banner 輪播」分頁。頁面一次展示 4 個獨立欄位組，每組均包含桌面版圖片上載與 URL、手機版圖片上載與 URL、點擊連結、標題及排序；並提供單一「儲存全部 Banner」按鈕。由於本機未配置 Supabase，資料請求顯示 `supabase_not_configured`，但這不影響已編譯的表單結構驗證。

## 本機首頁空狀態驗證

在未設定 Supabase 的本機生產環境，首頁沒有渲染任何靜態或假資料 Banner，並直接顯示後續商品區塊。這確認首頁輪播不再依賴舊的內建 Banner 陣列，會完全以 Supabase `banners` 回傳資料為準。
