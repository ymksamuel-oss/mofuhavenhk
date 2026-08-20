# 香港支付方式資格核對

## 已核對來源

Stripe 的付款方式總覽指出，每一種付款方式均有各自的支援幣別、國家／地區、產品及 API 選項限制；因此不可只因市場常用而直接把付款方式代碼加入 Hosted Checkout Session。[1]

香港金融管理局將 FPS 列於香港的「Payment and Transfer」消費者服務，顯示它是本地銀行及儲值支付工具網絡的一部分；是否可由單一收單服務商直接在網上 Checkout 使用，仍須由該服務商和商戶帳戶資格確認。[2]

Stripe 的付款方式支援矩陣列出 Alipay、Apple Pay、WeChat Pay，以及 **FPX**（馬來西亞銀行轉帳）等方式；其銀行轉帳與即時支付 API enum 列表中並沒有香港 FPS 的 `fps` 類型。因此不可把 `fpx` 當作香港「轉數快」加入此香港 HKD Checkout。[3]

## 本輪原則

| 支付方式 | 網站端處理 | 仍須核對的條件 |
| --- | --- | --- |
| Visa／Mastercard／Apple Pay | 保留 `card`；Apple Pay 由 Stripe 在符合帳戶、網域及 Safari／iOS 裝置資格時動態顯示 | Stripe Hosted Checkout 帳戶與裝置資格 |
| AlipayHK／支付寶 | 保留 `alipay`，由 Stripe Hosted Checkout 根據付款人、幣別和資格呈現 | Stripe 的當前付款人地區／產品資格 |
| WeChat Pay | 僅在開關開啟時嘗試 `wechat_pay` + `client: web`；若 Stripe Live 帳戶拒絕，安全降級為 `card` + `alipay` | Stripe Live 帳戶須先啟用 WeChat Pay |
| FPS | 不在未確認 Stripe 帳戶資格前硬加入 Session，避免令全部 Checkout 建立失敗 | Stripe 是否為此香港帳戶／HKD Hosted Checkout 提供 FPS；若不提供，須採用能接入 FPS 的獨立收單服務或人工轉數快流程 |

## 目前帳戶實測與實作

此 Stripe Live 帳戶已可透過 Hosted Checkout 建立 `card` 與 `alipay` 的 HKD Session。`card` 同時是 Stripe 對合資格 Apple Pay 裝置提供 Apple Pay 的基礎方式。當網站嘗試加入 `wechat_pay`（並傳送必要的 `client: "web"`）時，Stripe Live 目前回覆該付款方式未在帳戶啟用；網站因此已自動重試為 `card` 加 `alipay`，確保顧客仍可結帳。

AlipayHK、WeChat Pay 的身份驗證、可見性及付款人地區資格由支付錢包與 Stripe Hosted Checkout 依實際付款人資料判定，網站不能亦不應以自訂程式繞過或「過濾」第三方錢包的實名驗證要求。

## References

[1] [Stripe — Supported payment methods](https://docs.stripe.com/payments/payment-methods/overview)

[2] [Hong Kong Monetary Authority — Faster Payment System](https://www.hkma.gov.hk/eng/smart-consumers/faster-payment-system/)

[3] [Stripe — Payment method support](https://docs.stripe.com/payments/payment-methods/payment-method-support)
