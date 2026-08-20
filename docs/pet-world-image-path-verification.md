# Pet World 圖片路徑驗證紀錄

## 根因

Pet World 原本將品種相片引用為相對的 `/manus-storage/...` 路徑。在 Vercel Production，這類未被明確處理的路徑會落入 SPA catch-all rewrite，回傳 `index.html`（`text/html`）而不是圖片，因而觸發前端 `onError` 並顯示「真實圖片準備中」。

## 修復方式

所有已核對的品種相片已改為 `/assets/pet/<檔名>`。Vercel 的 `/assets/*` rewrite 將請求交由 `api/asset.js`，再以 307 重新導向到原始持久儲存；此方式與既有商品圖片的 Production 相容層一致。

## 驗證結果（2026-08-20）

| 驗證項目 | 結果 |
| --- | --- |
| 英國短毛貓、美國短毛貓、布偶貓、暹羅貓、緬因貓、蘇格蘭摺耳貓受控端點 | `200 image/jpeg` |
| 新 Vercel Production 部署 | `https://mofuhavenhk-1731os192-ymksamuel-2362s-projects.vercel.app` 可用 |
| 正式 `https://www.mofuhavenhk.com/pet-world` | 頁面 DOM 不含「真實圖片準備中」文字 |
| 相片請求 | 由 `/assets/pet/...` 受控路由重新導向至真實 JPEG；因此 DOM 最終 `img.src` 為重新導向後 URL，而非原路徑 |
| 回歸測試與打包 | 46 項 Vitest 測試及 production build 通過 |
