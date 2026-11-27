# Mofu Haven HK 改動紀錄

> 新紀錄放最上方；時間一律為香港時間（HKT）。測試、庫存與部署狀態只記錄已查證內容。

## 2026-11-27 18:36 HKT — 同步 main SEO 修改至 P1 分支並建立改動紀錄

- **分支與 Commit Hash：** `feat/p1-conversion-boost` / `10bf7931`；整合來源為 `main` 的 `9c16c9f5`，P1 原始提交為 `e9d14c93`。
- **改動摘要：**
  - 把 `main` 最新 SEO 修改合併入 P1 分支，包含 `/menu` 頁面與商品目錄改善、sitemap、首頁 SEO 資訊及結帳頁 noindex 設定。
  - 整合涉及 `src/app/checkout/layout.tsx`、`src/app/menu/MenuCatalogClient.tsx`、`src/app/menu/page.tsx`、`src/app/page.tsx`、`src/app/sitemap.ts`。
  - 新增本紀錄檔 `docs/CHANGE_LOG.md`，並補錄 P0、SEO、P1 三筆關鍵歷史紀錄。
  - 即時資料庫查詢顯示，購物車空白且未滿 HK$399 時，符合目前 P1 條件的推薦前三項為：`4976064024442` 純野生鹿肉鬆伴糧撒粉（HK$49.90，庫存 20）、`4976064026552` 原肉風乾純馬肉條（HK$49.90，庫存 20）、`4976064023865` 國產純雞里肌一口肉塊（HK$49.90，庫存 20）。同價商品的資料建立時間相同，而程式沒有額外 SKU 排序，因此其先後可能受目錄原始排序影響。
- **安全與測試：** 沒有改動 Stripe 結帳金額／API、後端運費計算或 `products` 資料表；SEO 只涉及頁面與索引設定。`npm run lint` 通過；`npm run build` 通過；`npm test` 有 12/52 個測試檔失敗（37/210 項失敗、173 項通過）。在未合併的 `origin/main` 獨立 worktree 重跑亦為完全相同的 12 個檔案／37 項失敗，確認是合併前已存在的測試問題，非本次同步新增。
- **部署狀態與連結：** Preview 尚未提交及觸發部署；Vercel Connector 登入仍待完成，未確認 `BUILDING` 或 `READY`，目前沒有可驗證的 Preview 連結。
- **待跟進事項：** 完成 lint、test、build；提交並推送至 `feat/p1-conversion-boost`；查驗 Vercel Preview 真正轉為 `READY` 後補上連結。

## 2026-11-23 23:27:38 HKT — SEO 優化

- **分支與 Commit Hash：** `main` / `9c16c9f5`。
- **改動摘要：**
  - 改善 `/menu` 目錄頁面及商品瀏覽內容。
  - 加入／更新 sitemap 與站內 SEO metadata。
  - 對結帳頁加入 noindex 設定，避免結帳頁被搜尋引擎收錄。
  - 主要檔案：`src/app/menu/MenuCatalogClient.tsx`、`src/app/menu/page.tsx`、`src/app/sitemap.ts`、`src/app/page.tsx`、`src/app/checkout/layout.tsx`。
- **安全與測試：** 沒有改動 Stripe 結帳金額或 API、後端運費計算、`products` 資料表；當時 lint/build 結果未在目前可查的歷史中找到，不能當作已通過。
- **部署狀態與連結：** 目前只核實 `main` 提交為 `9c16c9f5`；該次部署的 READY 狀態及 Production／Preview 連結未有可核實紀錄。
- **待跟進事項：** 如需回顧該次發布，應以 Vercel 實際部署記錄確認狀態及網址。

## 2026-11-22 17:40:58 HKT — P1 商品頁與購物轉換優化

- **分支與 Commit Hash：** `feat/p1-conversion-boost` / `e9d14c93`。
- **改動摘要：**
  - 商品頁新增重點規格／購買決策卡，顯示適用對象、成分、重量及配送資訊（以可用商品資料為準）。
  - 購物車加入 HK$399 免運進度提示及小額加購區。
  - 涉及 `src/components/product/ProductDetail.tsx`、`src/components/cart/MobileCartDrawer.tsx`、`src/lib/i18n/translations.ts`。
  - 當時程式列有三個優先 SKU；本次即時查到其價格為 HK$32.90、HK$38.90、HK$42.90，低於加購區 HK$49.90–69.90 的範圍，因此目前不會被顯示。
- **安全與測試：** 此提交改動前端呈現，沒有改動 Stripe 結帳金額／API、後端運費計算或 `products` 資料表；該提交當時的 lint/build 結果未在目前可查歷史中找到。
- **部署狀態與連結：** 歷史紀錄指當時 Preview 尚待完成；本次需重新查驗，不能沿用舊狀態或舊連結。
- **待跟進事項：** 已按本次要求將 `main` SEO 修改同步至此功能分支；仍需完成檢查、推送及取得 READY Preview 連結。

## 2026-11-22 17:03–17:07 HKT — P0 信任與政策資訊統一

- **分支與 Commit Hash：** `main` / `f32845d8`、`006ad753`。`f32845d8` 涵蓋配送與信任資訊；`006ad753` 延續調整商品狀態及可用付款方式文案。
- **改動摘要：**
  - 統一香港現貨與日本預購配送時效，說明混合訂單安排。
  - 補齊 FAQ 常見問題，並移除未完成提示。
  - 同步商品頁與購物車的免運及配送說明。
  - 主要檔案：`src/components/FAQAccordion.tsx`、`src/components/cart/MobileCartDrawer.tsx`、`src/components/product/ProductDetail.tsx`、`src/lib/i18n/translations.ts`。
- **安全與測試：** 配送政策文案有更新，但沒有改動後端運費計算、Stripe 結帳金額／API 或 `products` 資料表；當時 lint/build 結果未在目前可查歷史中找到。
- **部署狀態與連結：** 使用者提供的歷史狀態為 Production `READY`；當時 Production 網址未附於可查紀錄。
- **待跟進事項：** 此為已上線歷史紀錄；目前後續改動均按本紀錄機制追蹤。
