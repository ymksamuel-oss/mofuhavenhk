# 最終商品圖片 Production 驗證

最新 Vercel Production 部署：`https://mofuhavenhk-c8sokmdyc-ymksamuel-2362s-projects.vercel.app`。

2026-08-20 對 `https://www.mofuhavenhk.com/api/trpc/store.products` 的最終檢查結果如下：

- **75** 件商品回傳 `/assets/product/<StripeProductId>` 受控圖片路徑。
- **0** 個圖片 URL 指向舊 `mofuhavenhk.com` 根網域路徑。
- **0** 件商品的 `image` 欄位為 `null`。
- 先前使用 `public/products/bestseller-cat-food.webp` 與 `public/products/snack-scallop-jerky.webp` 的兩項舊根網域圖片已一併改為持久資產。

Production 商品頁已視覺確認顯示 Petio、Petzroute 等實體包裝圖片，不再顯示「圖片暫時不可用」或藍色問號圖示。
