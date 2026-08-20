# Checkout 付款呈現稽核

## 網站自訂介面

正式首頁 Footer 已移除先前以文字膠囊形式顯示的 WeChat Pay、AlipayHK、Visa 與 Mastercard。該做法容易把尚未由帳戶資格確認的方式呈現為可用。現已改為中性提示：Stripe 官方託管結帳頁會根據裝置與帳戶資格顯示各支付品牌的官方圖標。

## 最新無扣款 Live Session

於 2026-08-20 透過 `www.mofuhavenhk.com` 建立的 Live Checkout Session 為 `open`／`unpaid`，未提交任何付款。Session 使用 `card` 與 `alipay`，其中 card 設定 3D Secure 為 `any`。Apple Pay 由 Stripe 在相容裝置、已驗證網域及帳戶資格成立時在 card 流程動態顯示；WeChat Pay 尚未在此 Live 帳戶啟用，因此網站會安全降級，而不會誤導為已可使用。

## 品牌標誌原則

Stripe Hosted Checkout 是唯一呈現信用卡、Apple Pay 與其他支付方式官方品牌 Logo 的介面。網站自訂 UI 不重繪或變形任何支付品牌商標，也不宣告未經 Live Session 確認的支付方式。

## 正式購物車互動驗證

在正式商品頁加入一件 Petio 商品後，右上角購物車數量由 0 更新為 1，頁面只顯示「已加入購物車」提示並留在商品列表，沒有自動進入付款或跳轉至 Stripe。這符合先收集購物車內容、由使用者主動開啟購物車及提交香港收貨資料後才進入 Hosted Checkout 的流程。

購物車抽屜中的按鈕清楚標示為「填寫收貨資料並結帳」，而資料表格另以「確認資料並前往付款」表達下一步。正式桌面檢查確認表格包含收件人姓名、聯絡電話、送貨上門、順豐站及智能櫃選項；兩個彈層均沒有自訂支付品牌商標、錯位元件或殘留的付款方式文案。

資料表格目前在正式頁面具有 `overflow-y: auto`，可在較小視窗中保持垂直滑動。DOM 驗證亦確認所有香港收貨資料欄位與清晰的付款前按鈕均存在，且正文不含未經帳戶資格確認的 WeChat Pay、AlipayHK、Visa 或 Mastercard 自訂文字膠囊。
