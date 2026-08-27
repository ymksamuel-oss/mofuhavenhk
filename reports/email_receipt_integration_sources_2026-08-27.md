# 電子收據整合 — 官方來源要點

本文件保存本次實作所依據的官方服務文件要點。所有結論均用於伺服器端付款成功後的收據流程，而非客戶端付款判定。

| 來源 | 已核實要點 | 實作採用方式 |
| --- | --- | --- |
| [Stripe PaymentIntent 狀態與 webhook](https://docs.stripe.com/payments/payment-intents/verifying-status) | Stripe 明確建議以 `payment_intent.succeeded` webhook 處理付款後履約；客戶可在前端完成後離開頁面，不能只倚賴瀏覽器。 | 既有 `/api/stripe/webhook` 繼續作為主觸發點，付款狀態為 `succeeded` 才發送收據。 |
| [Stripe 收據](https://docs.stripe.com/receipts) | Stripe 可在成功付款後發送內建收據；Stripe 收據品牌可於 Dashboard 設定 Logo。 | 本功能以 Mofu 品牌 HTML 收據為唯一自訂收據來源；部署時應檢查 Stripe Dashboard 的「Successful payments」自動收據設定，避免顧客收到重複電郵。 |
| [Stripe PaymentIntent create](https://docs.stripe.com/api/payment_intents/create) | PaymentIntent 可關聯 Stripe Customer；官方另提供 `receipt_email` 原生收據欄位。 | 信用卡流程以 Stripe Customer 保存收件電郵，hosted Checkout 使用客戶在 Checkout 提供的最終電郵；不把顧客電郵寫入 metadata，也不設定會觸發第二封原生收據的 `receipt_email`。 |
| [Resend Send Email](https://resend.com/docs/api-reference/emails/send-email) | `POST /emails` 接受 `from`、`to`、`subject`、`html`、`text`；可設定 `reply_to`、標籤及 `Idempotency-Key`。 | 伺服器端以 `RESEND_API_KEY` 呼叫官方 API，寄出 HTML 與純文字備援收據。 |
| [Resend Idempotency Keys](https://resend.com/docs/dashboard/emails/idempotency-keys) | `Idempotency-Key` 支援 `POST /emails`，會在 24 小時內防止相同寄送請求重複發送。 | 以 PaymentIntent ID 產生收據冪等鍵，配合 Stripe metadata 的 `receipt_email_sent` 標記處理 webhook 重送。 |

> Resend 生產寄件需要已驗證的寄件網域及 `RESEND_API_KEY`。該密鑰不會寫入程式庫、Git 或本文件；僅應放入 Vercel Production environment variables。

## References

[1]: https://docs.stripe.com/payments/payment-intents/verifying-status "Stripe PaymentIntent payment status updates"
[2]: https://docs.stripe.com/receipts "Stripe Receipts and paid invoices"
[3]: https://docs.stripe.com/api/payment_intents/create "Stripe Create a PaymentIntent"
[4]: https://resend.com/docs/api-reference/emails/send-email "Resend Send Email API"
[5]: https://resend.com/docs/dashboard/emails/idempotency-keys "Resend Idempotency Keys"
