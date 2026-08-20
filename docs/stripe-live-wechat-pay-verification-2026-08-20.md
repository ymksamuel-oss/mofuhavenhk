# Stripe Live WeChat Pay 重新驗證紀錄

> **驗證日期：** 2026-08-20（GMT+8）  
> **驗證範圍：** 只建立 `open`／`unpaid` 的 Live Checkout Session；沒有開啟 Checkout 頁面、沒有輸入付款資料、沒有完成付款或產生扣款。

## 驗證結果

商戶確認已在 Stripe Dashboard 啟用 WeChat Pay 後，網站先透過 `https://www.mofuhavenhk.com` 建立一筆一次性 HKD 的 Hosted Checkout Session。該 Session 可正常建立，但 Stripe 回傳的有效付款方式仍只有 `card` 及 `alipay`；Session 為 Live mode、`open`、`unpaid`，且成功返回網址仍正確指向 `/checkout/return`。

其後以相同的一次性 HKD 價格，直接向 Stripe Live Checkout Sessions API 請求 `card`、`alipay`、`wechat_pay`，並已提供 Stripe 對 Web Checkout 所需的 `payment_method_options[wechat_pay][client]=web`。Stripe 拒絕該請求，指出 `wechat_pay` 仍為無效 payment method type，並要求確認該方式在 Dashboard 啟用且帳戶具備相應資格。

| 檢查項目 | 結果 |
| --- | --- |
| Live mode | 通過 |
| Session 狀態 | `open`／`unpaid` |
| 結帳貨幣 | `hkd` |
| 卡片付款 | 可用（`card`） |
| Alipay | 可用（`alipay`） |
| WeChat Pay | **尚未獲 Stripe Live API 接受** |
| Web client 參數 | 已在直接驗證請求中提供 |
| 金錢影響 | 無付款、無扣款 |

## Stripe 回應摘要

> 「The payment method type provided: wechat_pay is invalid. Please ensure the provided type is activated in your dashboard … and your account is enabled for any preview features that you are trying to use.」

這表示網站程式、Vercel 環境開關與 Web client 參數都已送出，但 **與目前 Live secret key 對應的 Stripe 帳戶** 尚未向 Checkout API 提供 WeChat Pay。網站的安全回退機制因此正確維持客戶可使用 `card + alipay`，而不會令結帳失敗。

## 下一步：商戶需在 Dashboard 再確認的項目

請在 **Live mode** 的 **Settings → Product settings → Payments → Payment methods** 再次搜尋 WeChat Pay，確認狀態顯示 **Active**，而非 Pending、Requested 或只在 Test mode 啟用。亦請確認查看的是與 Mofu Haven 網站 Live 金鑰相同的 Stripe 帳戶，而非另一個帳戶或 Connected Account。如 Stripe 要求額外商戶資料、協議接受或資格審查，完成後請等待狀態切換為 Active，再回覆「Live WeChat Pay 已 Active」。

收到確認後，網站端只需再建立一筆無扣款 Session，即可完成驗證；無需重新部署，也不會需要開啟或登入商戶的 Dashboard。

## 參考資料

[1]: https://docs.stripe.com/payments/wechat-pay "Stripe Documentation — WeChat Pay payments"
[2]: https://docs.stripe.com/payments/checkout/payment-methods "Stripe Documentation — Manage payment methods for Checkout"
