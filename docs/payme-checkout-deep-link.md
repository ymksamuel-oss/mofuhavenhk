# PayMe Checkout 官方 Deep Link 付款

**作者：Manus AI**  
**狀態：已部署並完成正式前台驗證**  
**最新主分支提交：`9340296f`**

## 實作概要

Mofu Haven 的 Checkout 已將 PayMe 從 Stripe hosted Checkout 的候選方法拆分為獨立付款流程。顧客選擇 PayMe 後，頁面只會呈現一個清晰的「開啟 PayMe 付款」按鈕，並顯示訂單金額與訂單編號。按鈕使用店主提供、且經前台格式驗證的 `https://qr.payme.hsbc.com.hk/...` 官方付款連結；任何其他網域的連結都不會被展示。

| 情境 | 顧客體驗 | 現行行為 |
|---|---|---|
| 手機結帳 | 點擊「開啟 PayMe 付款」 | 開啟官方 PayLink；如裝置已安裝 PayMe App，系統可依 PayMe 與裝置的連結處理機制交接至 App。 |
| 桌面結帳 | 點擊相同按鈕 | 開啟官方付款連結；沒有顯示 QR Code、PayCode 或掃碼內容。 |
| 付款後 | 點擊「我已付款，通知店主核對」 | 使用既有 WhatsApp 訂單通知流程發送訂單資料，讓店主人工核對入帳。 |
| 收款資訊變更 | 後台 CMS 設定 | 只需管理 `payme_pay_link` 及 `payme_merchant_name`。 |

> **重要限制：** 現時使用店主提供的靜態 PayLink，並不會為每張訂單建立由 PayMe 簽發、附帶鎖定金額的動態付款請求。因此付款後會由店主核對，系統不會聲稱自動入帳或自動確認。

## 正式驗證

正式 Checkout 已驗證：PayMe 不會開啟 Stripe Checkout；選取後只顯示金額、訂單編號、官方付款按鈕與付款後核對按鈕；QR Code 圖片、掃碼文案、PayCode 資產與 CMS 圖片設定均已移除；PayMe 模式下不會顯示 Stripe 的開始付款按鈕；瀏覽器主控台沒有新增錯誤。本機生產建置成功，PayMe 設定回歸測試 2 項全部通過。

## 日後升級為動態 PayMe API 付款的條件

如需每張訂單都有鎖定金額、可自動回調及可自動確認付款的原生 PayMe 體驗，店主需取得 PayMe for Business API 的 `client_id`、`client_secret`、`signing_key_id` 及 `signing_key`，並完成 Sandbox 整合與上線審核。官方 API 的 `POST /payments/paymentrequests` 可回傳 `webLink`；舊的 `appLink` 已標示為淘汰。動態流程應驗證 PayMe webhook 的簽章與付款狀態，而不能以顧客前台點擊作為付款成功依據。[1] [2]

| 項目 | 現行靜態 Deep Link 流程 | 原生 PayMe API 動態流程 |
|---|---|---|
| 付款連結 | 店主提供的固定官方 PayLink | 每張訂單由伺服器建立的 `webLink` |
| 訂單金額 | 顧客在 PayMe App 內自行核對 | 由 API 請求的 `totalAmount` 鎖定 |
| 成功確認 | 店主人工核對 | 已驗證 webhook／付款狀態查詢 |
| 所需憑證 | 無 | PayMe for Business API 憑證及簽章金鑰 |

## 參考資料

[1]: https://develop.hsbc.com/api-overview/how-get-started-21 "HSBC PayMe APIs for Business — How to get started"
[2]: https://develop.hsbc.com/api-overview/payme-business "HSBC PayMe for Business — API access and credential management"
