# Stripe Live 金流驗證紀錄

日期：2026-08-19

已透過安全環境變數套用 `STRIPE_LIVE_SECRET_KEY` 及 `VITE_STRIPE_LIVE_PUBLISHABLE_KEY`；金鑰值沒有寫入檔案或輸出到終端。Stripe Balance API 回應 HTTP 200，並回報 `livemode: true`。

伺服器 Stripe client 已更新為優先使用 `STRIPE_LIVE_SECRET_KEY`，再回退至既有 `STRIPE_SECRET_KEY`。本地網站商品 API 回應 HTTP 200。端到端 Checkout 驗證成功建立 Live Checkout Session，Stripe 查詢回應 HTTP 200，Session `livemode: true`、`payment_status: unpaid`；這次驗證只建立未付款的 Checkout 工作階段，沒有扣款。

完整 Vitest 通過 17 項，包含 Live Secret Key 的 Balance API 驗證；production build 通過。

另外使用無效 `priceId` 實測 Live Checkout 錯誤路徑：API 回應 HTTP 500、沒有回傳 Stripe Checkout 成功網址，並包含可辨識的錯誤訊息；未建立付款工作階段，沒有扣款。
