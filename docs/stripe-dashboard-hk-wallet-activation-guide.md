# Mofu Haven：Stripe Dashboard 香港電子錢包啟用指引

> **目的：** 在不改動現有網站程式的前提下，於 Stripe Live 帳戶中確認並啟用可供 Stripe Hosted Checkout 使用的 WeChat Pay 與 Alipay；同時保留信用卡與相容裝置上的 Apple Pay。

## 開始前確認

請先登入 **Mofu Haven 的 Stripe 帳戶**，並在 Dashboard 左側或頂部的模式切換中確認目前為 **Live mode**，而非 Test mode。兩個模式的付款方式啟用狀態互相獨立；在 Test mode 啟用不會讓正式顧客看到該付款方式。

啟用付款方式會影響實際收款、退款時限及商戶合規責任。請先確認商戶身分、業務網站、HKD 收款銀行資料、退款政策和客戶支援資料均已完成。WeChat Pay 與 Alipay 都有各自禁止或受限的業務類別要求；若 Dashboard 要求補充資料，請以實際業務資料提交。[1] [2]

| 目前網站端狀態 | 實際作用 | 商戶下一步 |
| --- | --- | --- |
| `card` 已啟用 | 支援 Visa／Mastercard 等卡片；Stripe 會在合資格裝置動態提供 Apple Pay | 在 iPhone Safari 或已設定 Apple Pay 的裝置上實測即可。 |
| `alipay` 已出現在 Live Session | Stripe Hosted Checkout 可向合資格客戶提供 Alipay；Stripe 文件中的名稱為 **Alipay** | 在 Dashboard 確認 Alipay 顯示為 **Active**。若要確認 AlipayHK App 實際交接，仍需真實香港裝置測試。 |
| WeChat Pay 網站開關已準備 | 帳戶獲批後，網站會以 Hosted Checkout 建立包含 WeChat Pay 的 Session | 必須先在 Stripe Live Dashboard 將 WeChat Pay 啟用為 **Active**。 |

## 最快 Dashboard 路徑

Stripe 官方目前的通用路徑如下：在右上角點擊 **Settings（齒輪）**，於 **Product settings** 下選擇 **Payments**，再開啟 **Payment methods**。也可以在登入後直接前往：<https://dashboard.stripe.com/settings/payment_methods>。[3]

進入後，請使用頁面內的搜尋或類型篩選，分別搜尋 **WeChat Pay** 與 **Alipay**。不要搜尋或強制加入 `AlipayHK` 作為獨立 API 種類；Stripe Hosted Checkout 與 API 文件目前以 `alipay` 名稱管理該錢包方式，客戶端實際可見的錢包與 App 流程由 Stripe 的地區、裝置、貨幣與帳戶資格決定。[2] [4]

| 要啟用的方式 | Dashboard 動作 | 正常完成後的狀態 | 若看不到或無法啟用 |
| --- | --- | --- | --- |
| **WeChat Pay** | 搜尋 **WeChat Pay**，點擊 **Turn on**／**Activate**，按提示接受條款及補齊資料 | 顯示 **Active** | 若顯示 **Pending**，請完成 Stripe 要求的額外資料；若根本沒有啟用按鈕，代表帳戶資格或所在地限制尚未符合，請使用頁面提供的支援入口詢問 Stripe。 |
| **Alipay** | 搜尋 **Alipay**，點擊 **Turn on**／**Activate**，完成頁面要求 | 顯示 **Active** | 若顯示 Pending，先完成額外資訊。Mofu Haven 的 Live Session 已回傳 `alipay`，因此目前應優先確認它沒有被關閉。 |
| **Apple Pay** | 維持 `card` 啟用；若 Payment methods 頁出現 Apple Pay／Wallets 項目，確保其為 Active | Stripe Hosted Checkout 在符合資格的 Safari／iOS 裝置以官方標誌呈現 | Apple Pay 不會固定出現在每一個桌面或非 Apple 裝置的 Checkout；這是 Stripe 的資格判定，而不是網站故障。 |

## WeChat Pay 的逐步操作

第一步，請在 **Live mode** 的 Payment methods 頁面輸入 `WeChat Pay` 搜尋。第二步，按 **Turn on**。第三步，按照 Stripe 畫面要求填寫或確認商戶資料；如出現條款、受限業務或額外驗證提醒，請如實完成，勿以測試資料代替。第四步，回到 Payment methods 列表確認狀態是 **Active**，不是 Pending。

Stripe 文件列出 WeChat Pay 可使用 HKD 作為香港商戶的呈現貨幣，但同時說明其主要客群為中國消費者、海外華人及旅客；不應將它宣傳為所有香港本地客戶必然可用的方式。[1] Mofu Haven 的網站已避免在帳戶未啟用前主動顯示 WeChat Pay 品牌標誌；啟用後才應透過新的 Live Checkout Session 確認它是否實際出現。

## Alipay／AlipayHK 的逐步操作

第一步，仍在 **Live mode** 的 Payment methods 頁搜尋 `Alipay`。第二步，按 **Turn on** 或確認狀態為 **Active**。第三步，如 Stripe 要求補充資料或接受條款，請完成後再返回列表確認狀態。Stripe 文件指出香港商戶可使用 HKD 建立 Alipay 付款，並建議使用 Hosted Checkout 讓 Stripe 根據客戶資格顯示最相關的方式。[2]

在網站文案與測試紀錄中，可把面向客戶的描述寫成「Alipay／AlipayHK（視 Stripe 與錢包資格而定）」，但不要把 Dashboard 裡的 `alipay` 狀態誤解為 Stripe 為每個裝置保證提供 AlipayHK App 深層連結。最可靠的確認方式是以已登入 AlipayHK 的真實手機打開一筆未付款 Checkout，選擇可見的 Alipay 項目，完成授權後觀察是否回到 `https://www.mofuhavenhk.com/checkout/return`；不要提交真實付款作為設定測試。

## 儲存後的網站端驗證

完成以上設定後，請只回覆「**WeChat Pay／Alipay 已在 Live mode 顯示 Active**」。Mofu Haven 網站端已準備好以下驗證：

| 驗證項目 | 預期結果 |
| --- | --- |
| 新建一筆無扣款 Live Checkout Session | Session 維持 `open`／`unpaid`，不會建立付款或扣款。 |
| `payment_method_types` | 最少保留 `card` 與 `alipay`；Stripe 帳戶成功啟用 WeChat Pay 後，應可加入 `wechat_pay`。 |
| 品牌圖示 | Visa／Mastercard、Apple Pay、Alipay 與 WeChat Pay 的圖示僅由 Stripe Hosted Checkout 原生提供，避免網站自訂圖示變形或顯示未啟用方式。 |
| 失敗保護 | 若 Stripe 仍拒絕 WeChat Pay，網站會回退至 `card + alipay`，不會令客人無法付款。 |

## 請勿做的操作

請勿把馬來西亞的 **FPX** 誤當成香港 **FPS（轉數快）** 加入 `payment_method_types`。Stripe 的 Hosted Checkout 支援矩陣不列出香港 FPS 作為可直接啟用的 payment method type；錯誤加入會令 Session 建立失敗。也請勿關閉 `card`，否則信用卡及相容裝置的 Apple Pay 都會失效。

## 參考資料

[1]: https://docs.stripe.com/payments/wechat-pay "Stripe Documentation — WeChat Pay payments"
[2]: https://docs.stripe.com/payments/alipay "Stripe Documentation — Alipay payments"
[3]: https://support.stripe.com/questions/activate-a-new-payment-method "Stripe Support — Activate a new payment method"
[4]: https://docs.stripe.com/payments/checkout/payment-methods "Stripe Documentation — Manage payment methods for Checkout"
