# AlipayHK／WeChat Pay 手機付款驗證

## 實作狀態

本專案採用 Stripe Hosted Checkout，沒有自訂 Stripe Element／Payment Element。Checkout Session 已改用 Stripe Dynamic Payment Methods，省略手動 `payment_method_types`，並設定：

- 所有 line items 必須是 active HKD Price。
- `success_url`: `/checkout/return?status=success&session_id={CHECKOUT_SESSION_ID}`。
- `cancel_url`: `/checkout/return?status=cancelled`。
- `CheckoutReturn` 頁面支援成功／取消狀態，手機版可正常顯示。

Stripe 官方文件指出，Alipay 在流動裝置會 redirect 至 Alipay app，完成授權後返回網站；此行為由 Hosted Checkout／Stripe 支付流程控制，不需要在前端自行拼接 Alipay deep link。Alipay HKD 支援及 Dashboard 啟用要求已記錄於 `stripe-payment-method-research.md`。

## Live Checkout 結果

- product API: HTTP 200
- checkout API: HTTP 200
- Stripe session lookup: HTTP 200
- livemode: true
- currency: hkd
- payment_status: unpaid（驗證只建立未付款 Session，沒有扣款）
- payment_method_types: `card`, `alipay`, `link`
- success_url 包含 `/checkout/return`
- cancel_url 指向 `/checkout/return?status=cancelled`

本次 Live Session 已證實 Alipay 已由 Dynamic Payment Methods 提供；WeChat Pay 沒有出現在 Session，代表該 Stripe 帳戶目前仍需在 Dashboard Payment methods 手動啟用 WeChat Pay，啟用後 Stripe 會按帳戶資格及 HKD 條件動態顯示。

## 前端互動結果

Chromium smoke test 通過：91 件商品載入；商品詳情 Modal／Lightbox／placeholder fallback 正常；加入購物車不呼叫 Checkout，購物車抽屜開啟並以 LocalStorage 保留；只有點擊購物車「前往結帳」才呼叫 Checkout；Header、Footer 及資訊頁路由正常。

手機 390x844 截圖已驗證 `/checkout/return?status=success`、`/checkout/return?status=cancelled` 及貓咪商品頁可顯示，返回頁在手機端沒有破版。

## 錯誤路徑

無效 priceId 的 Checkout 請求回傳 HTTP 500、被拒絕、沒有 Stripe Checkout URL，並包含錯誤訊息；沒有建立付款流程。

## 最新配送資料驗證

重新建立的 Live Checkout Session 已回傳 `shipping_address_collection.allowed_countries: ["HK"]` 及 `phone_number_collection.enabled: true`。因此顧客在 Stripe Checkout 頁面可填寫香港送貨地址及電話；實際顯示仍會受 Stripe Checkout 版面及帳戶設定影響。

最新 Session 仍回傳 `card`、`alipay`、`link`，而 `wechat_pay` 尚未出現；這是 Stripe Dashboard 尚未啟用 WeChat Pay 或帳戶尚未符合資格時的正常 Dynamic Payment Methods 行為，並非前端跳轉程式錯誤。
