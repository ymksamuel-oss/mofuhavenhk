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
