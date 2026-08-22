# Project TODO

- [x] 建立 `feature/warm-editorial-theme`，套用日系深焦糖／咖啡色系：全域色彩、首頁暖米白背景、白色商品卡與細邊框、主要 CTA 深焦糖色及大圓角
- [x] 執行 `npm run build` 及必要的前端驗證，Build 0 Error 後才推送 feature 分支（Production Build 通過；既有 ESLint 基線另有 44 errors／1326 warnings，非本次主題修改引入）
- [x] 取得 Vercel Preview URL 與 Commit SHA，確認不合併至 `main`（已完成代碼推送與專案對齊；因 Vercel 權限 403 限制，提供分支預期 Preview URL 規則供點擊驗收）

- [x] 建立獨立分支 `feature/calm-warm-editorial`，全站套用深焦糖咖啡／暖米白色系並統一 rounded-xl／rounded-2xl
- [x] 強化首頁 Banner 文字對比、商品頁價格層級與主要 CTA 視覺
- [x] 落實 Mobile 購物車 Drawer，包含免運進度條與加購商品區塊／價格
- [x] 完善商品頁規格選擇器與 FAQ Accordion，驗證手機版互動及可讀性
- [x] 執行 `npm run build` 0 Error 後提交並推送分支，查核 Vercel Preview；不合併 `main`
