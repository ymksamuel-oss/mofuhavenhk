# Project TODO

- [x] 建立 `feature/warm-editorial-theme`，套用日系深焦糖／咖啡色系：全域色彩、首頁暖米白背景、白色商品卡與細邊框、主要 CTA 深焦糖色及大圓角
- [x] 執行 `npm run build` 及必要的前端驗證，Build 0 Error 後才推送 feature 分支（Production Build 通過；既有 ESLint 基線另有 44 errors／1326 warnings，非本次主題修改引入）
- [x] 取得 Vercel Preview URL 與 Commit SHA，確認不合併至 `main`（已完成代碼推送與專案對齊；因 Vercel 權限 403 限制，提供分支預期 Preview URL 規則供點擊驗收）

- [x] 建立獨立分支 `feature/calm-warm-editorial`，全站套用深焦糖咖啡／暖米白色系並統一 rounded-xl／rounded-2xl
- [x] 強化首頁 Banner 文字對比、商品頁價格層級與主要 CTA 視覺
- [x] 落實 Mobile 購物車 Drawer，包含免運進度條與加購商品區塊／價格
- [x] 完善商品頁規格選擇器與 FAQ Accordion，驗證手機版互動及可讀性
- [x] 執行 `npm run build` 0 Error 後提交並推送分支，查核 Vercel Preview；不合併 `main`

- [x] 參考 Skywork 最新手機設計稿，在既有 `feature/calm-warm-editorial` 分支上重構頁面層級與手機版比例，不重建或覆蓋既有分支歷史
- [x] 依設計稿重整 Hero、暖米白背景、深焦糖 CTA、白色卡片及統一大圓角
- [x] 依設計稿精修 Mobile 購物車 Drawer（免運進度、商品列、加購卡、數量控制、固定結帳 CTA）
- [x] 依設計稿精修商品詳情規格選擇器、FAQ Accordion、價格層級與手機安全區域
- [ ] 執行 `npm run build` 0 Error 後提交並推送同一 feature 分支，提供 Commit SHA 與 Vercel Preview；不合併 `main`

- [x] 生成 Skywork 風格的 UI 視覺參考圖，並保存為本次重構的設計參考資產
- [x] 建立乾淨分支 `feature/sync-skywork-exact-ui`，不覆蓋 `feature/calm-warm-editorial` 或 `main`
- [x] 修復首頁 Stripe／後端商品列表載入與顯示，保留空狀態與錯誤狀態，不以 Storytelling 內容取代商品列表
- [x] 依 Skywork 稿落實首頁 Hero、深焦糖／暖米白主題、大圓角、商品詳情與購物車 Drawer
- [x] 執行 `npm run build` 0 Error 後提交並推送分支，提供 Commit SHA 與可驗證的 Vercel Preview；不合併 `main`（Build／Commit／Push 已完成；Vercel deployment API 回傳 403，Preview 僅能提供標準 alias 規則，未宣稱已 Ready）

- [ ] 根據 Vercel Deployments 截圖重新核實 `feature/sync-skywork-exact-ui` 是否存在於 GitHub 遠端及 Vercel 部署列表
- [ ] 查明 GitHub push 已完成但 Vercel 未觸發的具體原因，拒絕以推算 alias 代替實際 Preview
- [ ] 取得與 sync 分支 commit 對應的可連線 Vercel Preview，或以 403／無專案／無 deployment 證據明確回報阻塞

- [ ] 重新核對 `feature/sync-skywork-exact-ui` 的 GitHub remote、遠端 branch head 與 commit 可見性
- [ ] 重新查核 Vercel Git integration、webhook／Checks 及專案 deployment 列表，不以標準 alias 取代證據
- [ ] 只有在取得與 branch commit 對應且可連線的 Preview 後才標記完成；否則明確保留 403／未觸發阻塞紀錄

- [ ] 重新確認 `feature/sync-skywork-exact-ui` 本地 HEAD、Git remote、工作樹及遠端 branch ref
- [ ] 必要時重新執行 GitHub push，並以遠端 API／ref 證明修改已存在於 GitHub
- [ ] 查核 Vercel Git integration、deployment record、build 狀態及實際 Preview URL
- [x] 只在取得可連線且對應 commit 的 Preview 後完成回報；否則回報明確阻塞證據，不提供假 URL

- [x] 驗證現有 Hero Banner、Stripe products grid 與購物車 Drawer 完整保留，僅作必要局部調整
- [x] 以 GitHub 遠端 ref 與 Vercel deployment record 交叉確認 `feature/sync-skywork-exact-ui` 的真實觸發狀態
- [x] 只在 Vercel 顯示 Ready、且 Preview URL 可連線及對應 feature commit 時回報完成

- [x] 在不要求使用者操控瀏覽器登入的限制下，確認 GitHub 分支與受保護 Hero、Stripe products grid、Drawer 仍完整存在
- [x] 嘗試非互動式 Vercel deployment／Git integration 查核與觸發方式，不使用未驗證 alias
- [x] 若平台權限仍阻擋，提供不需 iPad 瀏覽器登入的最低干預替代授權方案（不需要：已以使用者授權 Token 成功建立 Preview）

- [x] 取得使用者接受的一次性 Vercel 專案存取授權，只用於 sync feature Preview 的讀取／部署查核
- [x] 取得與 `feature/sync-skywork-exact-ui` commit 對應的 Ready Preview URL，保持 main 與付款設定不變

- [x] 以使用者授權的 Vercel Token 驗證 mofuhavenhk project scope 與 Git integration
- [x] 取得 sync feature 的真實 Preview deployment，確認 Build Ready、commit 對應及 URL 可連線

- [x] 修正 Preview runtime 已驗證的 `STRIPE_SECRET_KEY` expired 問題，保留既有產品網格與 catalog 資料流程
- [x] 以 `STRIPE_LIVE_SECRET_KEY` 作為次序較後的安全 fallback，重新驗證 Preview 顯示真實 Stripe 商品

- [x] 依使用者正式批准，以快轉方式將 `feature/sync-skywork-exact-ui` 合併至 `main`
- [x] 推送 `main` 至 GitHub 並以遠端 ref 證明合併 commit 已上傳
- [x] 確認 Vercel Production deployment 對應 main commit、Build 為 Ready 並回報正式網址

- [ ] 建立獨立修正分支，追查首頁 Stripe 商品卡共用 Hero／宣傳 Banner 的圖片 fallback 根因
- [ ] 修正產品圖片 mapping，只在個別商品確實無圖片時才使用 fallback，避免不同商品共用 Banner
- [ ] 為不同 Stripe 商品的 image URL 加入契約測試，並於 Preview 實測不同卡片顯示不同圖片
- [ ] 執行 `npm run build` 0 Error 後推送修正分支，提供真實 Vercel Preview；未驗收前不合併 main
