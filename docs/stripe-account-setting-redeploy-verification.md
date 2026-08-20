# Stripe 帳戶設定後重新部署與前端驗證

## 發佈結果

已將既有已驗證的 Vercel Production 部署重新發佈，新的 Production URL 為 `https://mofuhavenhk-a4jylsvjl-ymksamuel-2362s-projects.vercel.app`，並已指派至生產別名。

商品頁已確認正常載入 **91** 件商品，商品卡片、加入購物車按鈕與購物車入口均可見，且沒有開啟任何 Stripe Dashboard 頁面。

## 無扣款 Checkout Session

新建立的 Live Session 狀態為 `open`／`unpaid`，付款方式參數仍是：

| 項目 | 結果 |
|---|---|
| `payment_method_types` | `card`、`alipay` |
| 3D Secure | 卡片使用 `request_three_d_secure: any` |
| Stripe 送貨地址收集 | 未啟用，使用網站自有香港收貨資料 |
| 付款／扣款 | 未輸入任何付款資料，沒有付款或扣款 |

## 前端 Hosted Checkout 實際呈現

完整 Checkout 頁面可正常載入，標準卡片欄位及 Visa、Mastercard、American Express、UnionPay、JCB 官方標誌正常顯示。此測試情境的前端只顯示卡片，**沒有顯示 Alipay／AlipayHK 或 WeChat Pay**；亦未出現頂部 Apple Pay 快捷按鈕。

網站目前的程式僅在 `STRIPE_ENABLE_WECHAT_PAY=true` 時才會將 `wechat_pay` 放入新 Session。這個 Vercel 生產環境變數目前尚未啟用，因此 Stripe 帳戶層級調整尚未傳遞至網站建立的 Session。Alipay 的最終顯示同時受付款人地區、幣別與 Stripe eligibility 動態決定。

## 2026-08-20 WeChat Pay 網站端更新

已於 Vercel **Production** 加入 `STRIPE_ENABLE_WECHAT_PAY=true`。首次以這個開關建立 Live Checkout Session 時，Stripe 明確回傳：`WeChat Pay requires payment_method_options[wechat_pay][client] to be set to web.`

亦已於 Vercel **Production** 加入 `STRIPE_ENABLE_APPLE_PAY=true`。Stripe Hosted Checkout 不把 Apple Pay 作為獨立 `payment_method_type`；它透過 `card` 支付方式在合資格的 Safari／iOS 裝置、網域與帳戶設定下由 Stripe 原生提供。因此網站端保留 `card`，同時支援信用卡及符合資格的 Apple Pay wallet。

因此，網站後端的兩個 Checkout 入口（`api/index.js` 與 `server/routers.ts`）已同步改為：僅於 WeChat Pay 開關啟用時加入 `wechat_pay`，並一併傳送 `payment_method_options.wechat_pay.client = 'web'`。本地完整測試與 production build 已通過（**44** 項 Vitest 測試）。

目前仍待 Vercel 接受新版建置，才能建立新的無扣款 Live Checkout Session，確認 Stripe 回傳 `card`、`alipay` 與 `wechat_pay`。本輪 Vercel 連續提交的部署均停留在 `UNKNOWN`／Building 狀態，故已停止重複提交；`www.mofuhavenhk.com` 仍維持前一個正常 Production 版本，商品 API 回應 **200** 並載入 **91** 件商品，未將未完成部署指派為正式網域。

## 合法 Git 提交後的 Production 結果

已以合法提交者 `ymksamuel-oss <ymksamuel@gmail.com>` 建立並推送新的安全 Production 分支 `production/apple-wechat-20260820`，避免覆寫與本機歷史分叉的 GitHub `main`。其後 Vercel Production 已成功完成部署，網址為 `https://mofuhavenhk-36eqod3ow-ymksamuel-2362s-projects.vercel.app`，而正式入口 `https://www.mofuhavenhk.com` 已建立並驗證新的 Hosted Checkout Session。

正式 `www` 入口建立的 Live Session 為 `open`／`unpaid`，金額及付款資料均未提交，沒有扣款。Session 回傳 `payment_method_types: ["card", "alipay"]`，且卡片選項保留 3D Secure；Hosted Checkout 對於合資格的 Safari／iOS 裝置會由 Stripe 在 `card` 流程下動態提供 Apple Pay。成功與取消回傳網址均正確使用 `https://www.mofuhavenhk.com/checkout/return`。

Stripe Live 目前仍回覆 `wechat_pay` 尚未在帳戶啟用。網站現已採用保護性機制：先在開關啟用時以 `wechat_pay`（並指定 `client: "web"`）建立 Session；若 Stripe 回覆帳戶未啟用，便自動改用 `card` 與 `alipay` 重試。因此顧客不會因 WeChat Pay 尚未具備帳戶資格而無法結帳；待 Stripe 帳戶真正啟用 WeChat Pay 後，無須再改程式即可納入新 Session。
