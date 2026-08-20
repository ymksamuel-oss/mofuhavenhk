# Stripe Hosted Checkout 付款設定稽核

## 無扣款 Live Session 驗證

以一項 HKD 商品與測試收貨資料建立了未付款的 Live Checkout Session。Session 狀態為 `open`／`unpaid`，並確認以下設定：

| 項目 | 已驗證狀態 |
|---|---|
| 付款模式 | `payment` |
| 標準付款方式 | `card`、`alipay` |
| 3D Secure | 卡片使用 `request_three_d_secure: any` |
| Stripe 再次收集送貨地址 | 未啟用；香港本地收貨資料由網站表格處理 |
| WeChat Pay | 尚未列入 Live Session，僅在 `STRIPE_ENABLE_WECHAT_PAY=true` 且帳戶已啟用後才加入 |

## 控制範圍

網站程式已明確指定 `payment_method_types: ['card', 'alipay']`，因此不會意外將其他非預期付款方法加入這次結帳。Alipay／AlipayHK 由 Stripe Hosted Checkout 依帳戶資格、付款人地點及 HKD 交易條件呈現。

Stripe 官方文件指出，Apple Pay、Google Pay 與 Link 無法透過 Checkout 的每筆交易 `excluded_payment_method_types` 排除；Apple Pay 在 Hosted Checkout 的顯示需於 Stripe Checkout Settings 關閉。WeChat Pay 則需先在 Stripe Dashboard 的 Payment methods／配置內啟用，之後才可安全設定 `STRIPE_ENABLE_WECHAT_PAY=true` 並重新驗證。

## 下一步

本輪未修改任何支付方式或建立付款。下一步可由帳戶管理者在 Stripe Dashboard 啟用 WeChat Pay，或關閉 Hosted Checkout 的 Apple Pay，然後再回到網站進行無扣款 Live Session 驗證。

## 參考資料

- [Stripe：Disable Apple Pay for Stripe Checkout](https://support.stripe.com/questions/disable-apple-pay-for-stripe-checkout)
- [Stripe：Payment method configurations](https://docs.stripe.com/payments/payment-method-configurations)
