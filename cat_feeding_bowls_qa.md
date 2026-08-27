# 貓咪食盤上架 QA

日期：2026-08-26（香港時間）

## 本機產品頁初步驗證

測試產品：`prod_V8szxN4qvZQyrJ`（貓耳斜口高腳陶瓷食盤 12cm）。

產品頁已由 Stripe 目錄讀取到四個真實圖案／顏色 Price 選擇：自在如風（藍色插畫）、柿柿如意（綠色插畫）、藍胖胖、綠胖胖，售價均為 HK$54.90。產品頁標題正確顯示為「選擇圖案／顏色」，而不是數量規格。

主圖 DOM 驗證結果：CDN 圖片已完成下載，`naturalWidth=640`、`naturalHeight=640`，顯示尺寸為 491px × 491px；需再以互動檢視確保畫面呈現與加入購物籃選取完全正常。


已在本機產品頁實際選取「柿柿如意（綠色插畫）」選項；UI 狀態正確轉移至該選項並顯示 HK$54.90。其後加入購物籃，購物籃數量由 2 增至 3，表示選取規格可正常傳遞到購物籃；未進入結帳或進行付款。

主圖在產品頁重新呈現後已正常顯示藍色插畫底座的完整食盤，沒有保留供應平台 UI、尺寸線或價格按鈕。


## 本機分類頁驗證

`/categories/lifestyle/feeding` 已只顯示本批六款食盤，沒有混入其他生活用品：藍貓圖案斜口高腳陶瓷食盤 M、高腳平口陶瓷貓咪食盤 250ml、貓耳斜口高腳陶瓷食盤 12cm、白貓海浪紋斜口高腳陶瓷食盤 M、深藍貓臉高腳陶瓷食盤 M、貓臉斜口高腳陶瓷食盤 350ml。

延遲載入完成後，六張清理後主圖均在分類商品格正常顯示；未顯示供應平台介面、價格標籤、尺寸標示或原始截圖邊框。


## Stripe 價格與重複執行驗證

食盤上架腳本重跑後，13 個既有 HKD Price 均回報 `reused`，沒有建立重複 Stripe Product 或 Price。前台同款圖案／顏色選項會保留各自 Price ID，而結帳仍會由伺服器按選取的 Price ID 重建及驗證金額。

## 自動檢查

`npm test`：9 個測試檔、45 項測試全部通過。

`npm run validate:products` 及 `npm run build`：均通過。建置期間出現遠端圖片 TLS 重試訊息，但最終編譯、靜態頁生成與 build 皆成功。


## 正式網站驗證

正式產品頁 `prod_V8szxN4qvZQyrJ` 已顯示唯一清理後主圖、HK$54.90 售價及四個可選圖案／顏色 Price：自在如風（藍色插畫）、柿柿如意（綠色插畫）、藍胖胖、綠胖胖。產品頁控制標題為「選擇圖案／顏色」，分類 breadcrumb 為「寵物生活用品」。延遲載入後主圖在正式環境正常呈現。


## 變體 v2 修正（本機 production branch working tree）

日期：2026-08-28（香港時間）

本次修正把食物碗 mapping 由依位置的 `option-N` 字串升級為穩定語義 key、雙語標籤及每項圖片。`catalog-server` 會先使用 Stripe Price metadata 的 `variant_image_url`，對尚未有 metadata 的既有食物碗 Price，才使用按 Product ID 及語義標籤核實的 fallback；未知選項不會猜用其他圖片。

產品詳情頁的圖案／顏色選項及食品口味家族選項現在會顯示對應商品縮圖；選取後主圖會以所選 variant image 更新，加入購物籃仍傳遞所選 Product ID 和 Price ID。食物碗匯入腳本也會按語義 key 重用舊 Price 並原地更新 metadata，避免重跑時建立重複 Price。

驗證結果：`npm test` 19 個測試檔、91 項測試全部通過；`npx tsc --noEmit`、`npm run validate:products`、變更檔案 targeted ESLint 及 Python `py_compile` 全部通過。完整 `npm run lint` 仍有 production 分支既有的 15 個 error／34 個 warning；未見本次變更檔案的 targeted lint 錯誤。`npm run build` 已成功編譯，但在既有 `/_global-error` prerender 階段因本機 React `useContext` 錯誤停止；這不是變體 TypeScript 編譯錯誤，且 Vercel 目前 production commit 已有成功部署記錄。

本節變更目前只存在於本機 `main` working tree，尚未推送至 GitHub，亦未觸發 Vercel 重新部署。
