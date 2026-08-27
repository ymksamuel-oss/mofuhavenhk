# 電子收據結帳欄位 — 本機生產版核對

**核對日期：** 2026-08-27

**網址：** `http://localhost:3000/checkout`

**環境：** 本機 `next build` 後以 production server 渲染；未連接真實付款或電郵發送服務。

| 檢查項目 | 結果 |
| --- | --- |
| 新增收據電郵欄位 | 已於「收件資料」內顯示必填「電子收據電郵地址」欄位，使用 `type=email` 及 `autocomplete=email`。 |
| 付款安全提示 | 已顯示成功付款後會通知店主及寄送電子收據的提示。 |
| 原有付款方式 | Apple Pay、Google Pay、PayMe、AlipayHK、Visa、Mastercard 均繼續顯示。 |
| 原有訂單摘要 | 商品、數量調整、運費門檻、商品小計及總計均正常顯示。 |
| 真實交易與寄件 | 無。本項只是本機 UI 核對，未輸入真實顧客資料，未建立 PaymentIntent 或 Checkout Session。 |

> 本機畫面證明表單與現有結帳版面相容；真正向顧客寄件仍須在 Resend 驗證寄件網域，並在 Vercel Production 設定所需環境變數。
