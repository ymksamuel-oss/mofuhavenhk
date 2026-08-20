# Vercel Preview 部署診斷紀錄

## 2026-08-20

- 已成功登入並連結既有 Vercel 專案：`ymksamuel-2362s-projects/mofuhavenhk`。
- Vercel 專案既有 `STRIPE_SECRET_KEY` 與 `STRIPE_PUBLISHABLE_KEY`，並套用於 Production／Preview 環境。
- 最新網站已新增 `api/[...path].ts` 與 `vercel.json`，提供 Vercel Serverless tRPC API 與 Vite SPA 輸出設定。
- 首次直接 Preview 部署受提交作者電郵不符合 Git 帳戶阻擋，已改為 `ymksamuel-oss@users.noreply.github.com` 並解除該阻擋。
- 第二次 Preview 建置已成功進入 Vercel build，但既有專案的 Framework Preset 被固定為 Next.js；Vercel 因最新程式是 Vite／Express 架構、並未安裝 `next` 而停止建置。下一步須將此 Preview 部署的 Framework Preset 改為 Vite 或 Other，然後重新部署。
- Vercel Project Settings 的 Framework Preset 已改為 Vite，並已明確關閉 Preview 的 Vercel Authentication，讓手機可直接公開存取。
- 最新 Preview `https://mofuhavenhk-2m6gmjus7-ymksamuel-2362s-projects.vercel.app` 首頁回應 HTTP 200；但 `/api/trpc/store.products` 回應 HTTP 404，表示目前 Vercel output 未包含 catch-all Serverless API function，仍需修正 Vercel function routing 後才可進行 Stripe Checkout 測試。
