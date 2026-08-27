# Mofu Haven 成功付款電子收據功能

**狀態：** 本機程式、測試及生產建置已完成；**尚未推送、尚未部署、尚未寄出真實電郵**。

**實作日期：** 2026-08-27

**作者：** Manus AI

## 功能摘要

本次實作在結帳「收件資料」中新增必填電子收據電郵地址。Stripe 確認付款成功後，既有的簽名驗證 webhook 會先維持原本店主 WhatsApp 訂單通知，再由同一份已確認的 PaymentIntent 產生一封 Mofu Haven 品牌 HTML 電子收據。前端成功頁或信用卡付款完成後的瀏覽器回調只作後備；付款與收據的權威判定仍由伺服器端 Stripe webhook 負責。[1]

收據使用現有的透明 Mofu Haven 貓狗 Logo，採用暖米白及棕色系、窄螢幕可閱讀的卡片式版面。內容包括訂單編號、收件人、聯絡電話、完整送貨地址、香港時區購買日期、實際付款方式、逐項商品名稱、變體、店內 SKU、數量、單價、行小計、運費及總金額。HTML 外亦提供純文字版本，方便不顯示 HTML 的電郵客戶端。

| 收據資料 | 資料來源 | 保護方式 |
| --- | --- | --- |
| 訂單編號、運費及總額 | PaymentIntent / Checkout Session metadata | 金額在建立付款時由伺服器端目錄重建，不信任前端總額。 |
| 商品行、變體、SKU、單價 | 付款時保存的 Stripe Price ID + quantity；付款後重新讀取不可變 Stripe Price | 不以後來可能改動的前端購物籃資料作收據依據。 |
| 收據收件電郵 | Hosted Checkout 的最終 customer email，或信用卡 PaymentIntent 關聯的 Stripe Customer | 電郵**不寫入 Stripe metadata**。 |
| 收件人、電話及送貨地址 | 建立付款時由結帳收件資料寫入 PaymentIntent / Checkout Session metadata；地址包含第二行、地區及填寫時的順豐站／智能櫃代碼 | 付款後只讀取該筆訂單保存的資料，以便客戶核對送貨資訊。 |
| 付款方式 | PaymentIntent 已展開 PaymentMethod | 顯示實際卡、Apple Pay、Google Pay 等付款標籤。 |
| 購買日期 | Stripe Charge 建立時間（暫時不可用時回退 PaymentIntent 建立時間） | 統一按 `Asia/Hong_Kong` 顯示。 |

## 發送與重試設計

自訂電郵以 Resend 的 `POST /emails` API 發送；每封電子收據的冪等鍵固定為 `mofu-payment-receipt/<PaymentIntent ID>`。Resend 對相同鍵在 24 小時內去重，而 PaymentIntent metadata 的 `receipt_email_sent=true` 在成功送達後再提供長期 webhook 重送保護。[4] [5]

若 WhatsApp 通知或收據寄送未成功，webhook 回傳 503，讓 Stripe 重送事件。顧客的付款不會因此被當作失敗或再次扣款；結帳畫面會分清楚「店主通知失敗」與「店主已收到通知但收據待重試」。系統並不把顧客電郵印在 log、Resend tags 或 Stripe metadata。

> 歷史訂單不會補發自訂收據。它們沒有本次新增的逐 Price 收據行項結構及保證可用的電郵來源；本功能只適用於部署後新建立的付款。

## Vercel 啟用步驟

在部署前，需先在 Resend 建立 API key 並驗證寄件網域。之後到 **Vercel → Project → Settings → Environment Variables → Production** 新增以下伺服器端變數；不可放入 Git 或任何 `NEXT_PUBLIC_` 變數。

| 環境變數 | 必需 | 建議值／用途 |
| --- | --- | --- |
| `RESEND_API_KEY` | 是 | Resend 生產 API key，格式通常為 `re_...`。 |
| `RECEIPT_FROM_EMAIL` | 是 | 已驗證網域的寄件者，例如 `Mofu Haven <receipts@mofuhavenhk.com>`。 |
| `RECEIPT_REPLY_TO_EMAIL` | 否 | 顧客回覆收據時的客服地址，例如 `MofuHavenHK@gmail.com`。 |
| `STRIPE_WEBHOOK_SECRET` | 已有／仍必需 | 既有 `/api/stripe/webhook` 的簽名驗證密鑰。 |
| `NEXT_PUBLIC_SITE_URL` | 已有／建議 | `https://www.mofuhavenhk.com`，用於電郵內的 Logo 絕對網址。 |

現有 Stripe webhook endpoint 應繼續訂閱 `checkout.session.completed`、`checkout.session.async_payment_succeeded` 及 `payment_intent.succeeded`。[1] Hosted Checkout 和信用卡 PaymentIntent 流程都已帶入收據所需的 server-validated Price 行項資料。

如只想寄出這封 Mofu Haven 品牌化收據，部署前請檢查 **Stripe Dashboard → Customer emails → Successful payments**，避免同時啟用 Stripe 的另一封通用成功付款收據。Stripe 的內建收據是獨立功能，可能造成顧客收到兩封確認電郵。[2]

## 已完成驗證

| 檢查 | 結果 |
| --- | --- |
| 電子收據專屬單元測試 | 6 項全數通過：Logo／內容、HTML escaping、Resend 請求、冪等鍵、缺設定不寄信、Stripe Price 重建及 sent flag。 |
| Stripe webhook 契約測試 | 7 項全數通過：raw-body 簽名、三種成功事件、付款方式／Customer 展開、WhatsApp 與收據統一處理。 |
| 全專案測試 | 17 個測試檔、81 項測試全數通過。 |
| TypeScript | `tsc --noEmit` 通過。 |
| Next.js 生產建置 | `next build` 通過；付款與 webhook routes 均成功建立。 |
| 收據視覺預覽 | 已以虛構訂單在瀏覽器渲染，Logo、收件人、電話、完整送貨地址、產品表格、付款資料與總額均清楚。 |
| 結帳 UI 預覽 | 本機 production build 顯示必填電子收據電郵欄位，原有 Apple Pay、Google Pay、PayMe、AlipayHK、Visa、Mastercard 及訂單摘要仍正常。 |
| 真實電郵寄送 | 尚未執行；本機沒有 Resend 生產設定，並且不會在未驗證寄件網域前寄信。 |

## 程式檔案

| 檔案 | 作用 |
| --- | --- |
| `src/lib/orderReceiptEmail.ts` | Mofu 品牌 HTML／純文字收據及 Resend API 發送。 |
| `src/lib/receiptLineMetadata.ts` | 付款時以分段 metadata 保存 Price ID、產品 ID 及數量。 |
| `src/lib/stripeOrderReceipt.ts` | 付款後重建收據資料、發送及寫入長期 sent flag。 |
| `src/lib/stripePaidOrderProcessing.ts` | 將既有 WhatsApp 通知與收據處理串成同一個已付款流程。 |
| `src/app/api/stripe/webhook/route.ts` | Stripe 成功付款的主要伺服器端觸發點。 |
| `src/app/api/stripe/create-checkout-session/route.ts` | Hosted Checkout 的客戶電郵及收據行項資料。 |
| `src/app/api/stripe/create-payment-intent/route.ts` | 信用卡流程建立 Stripe Customer 並保存收件電郵。 |
| `src/components/checkout/ShippingContactForm.tsx` | 結帳必填電子收據電郵輸入與驗證。 |
| `.env.example` | Resend／Vercel 設定說明。 |

## References

[1]: https://docs.stripe.com/payments/payment-intents/verifying-status "Stripe PaymentIntent payment status updates"
[2]: https://docs.stripe.com/receipts "Stripe Receipts and paid invoices"
[3]: https://docs.stripe.com/api/payment_intents/create "Stripe Create a PaymentIntent"
[4]: https://resend.com/docs/api-reference/emails/send-email "Resend Send Email API"
[5]: https://resend.com/docs/dashboard/emails/idempotency-keys "Resend Idempotency Keys"
