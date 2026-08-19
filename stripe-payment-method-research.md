# Stripe AlipayHK／WeChat Pay 官方依據

資料來源：

- https://docs.stripe.com/payments/alipay
- https://docs.stripe.com/payments/alipay/accept-a-payment
- https://stripe.com/payment-method/alipay
- https://docs.stripe.com/payments/wechat-pay
- https://docs.stripe.com/payments/payment-methods/payment-method-support

Stripe 官方文件指出，Alipay 可支援 HKD（香港地區條件適用）；Alipay 是 customer-initiated、single-use wallet，使用者在網站或流動裝置授權後會返回網站。Stripe 的官方產品頁明確描述：桌面可掃描 QR code／輸入登入資料，流動裝置會 redirect 至 Alipay app。Hosted Checkout 可由 Stripe 自動顯示適用支付方式，並要求先在 Dashboard Payment methods 啟用 Alipay；若手動列出 payment_method_types，則需遵循 Stripe 的支付方式兼容性要求。

本專案目前沒有 Stripe Custom Element／Payment Element 程式；採用 Stripe Hosted Checkout。Checkout 路由因此改用省略 payment_method_types 的 Dynamic Payment Methods，並設定 success_url 為 `/checkout/return?status=success&session_id={CHECKOUT_SESSION_ID}`、cancel_url 為 `/checkout/return?status=cancelled`，讓 Stripe 負責手機 Alipay redirect，再返回網站回傳頁。

WeChat Pay 官方文件同樣列出 HKD 支援，並要求在 Stripe Dashboard Payment methods 啟用。若手動指定 payment_method_types，WeChat Pay 的 Checkout 需要 `payment_method_options[wechat_pay][client]=web`；本專案改用 Dynamic Payment Methods，避免帳戶尚未啟用 optional payment method 時令整個 Checkout 建立失敗。最後一次 Live Checkout 驗證回傳 HKD、livemode=true、payment_status=unpaid，並顯示 payment_method_types 包含 `card`、`alipay`、`link`；WeChat Pay 尚未在該帳戶的 Checkout Session 中顯示，仍需 Dashboard 啟用後再驗證。
