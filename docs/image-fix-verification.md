# 圖片路徑修復驗證紀錄

## 2026-08-20

- 修復前，`www.mofuhavenhk.com` 的 Header Logo、主 Banner 及熱門品種預覽均使用 `/manus-storage/...` 相對路徑；Vercel catch-all SPA rewrite 將該路徑錯誤回傳為 HTML，造成圖片破圖。
- 修復後已部署一個受控的 `/assets/:asset` → `/api/asset` 路由；該端點只允許已核對的品牌與 Banner 資產，並以 307 導向其正式 WebDev 靜態儲存來源。
- Production 部署完成後，瀏覽器檢查受到 Vercel Security Checkpoint 暫時攔截，因此將以 HTTP 回應、資產 MIME type 與部署 URL 進一步驗證。

直接 Vercel Production URL 已確認 `/assets/logo`、`/assets/main-banner`、`/assets/sub-banner` 與 `/assets/product-placeholder` 最終回應正確的 PNG／SVG MIME type。然而瀏覽器畫面仍未顯示 Logo 與 Banner，且 console 沒有錯誤；下一步會在頁面內檢查圖片的 `naturalWidth` 與網路請求結果，釐清是否為跨網域重新導向造成的載入問題。

頁面內檢查已確認 Header Logo 的 `naturalWidth` 為 948、主 Banner 為 1408，新的 `/assets` 路徑已成功載入。首批 Stripe 商品圖片亦回傳有效原始尺寸；其餘非首屏的 lazy-loaded 商品圖片在檢查當刻仍在載入中，並未出現前端錯誤訊息。
