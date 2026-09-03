# PayMe Checkout 快捷付款與 PayCode

**作者：Manus AI**  
**狀態：已部署並完成前台驗證**  
**主分支提交：`56a2cf46`**

## 實作概要

Mofu Haven 的 Checkout 已把 PayMe 從原有 Stripe hosted Checkout 的候選方法拆分為獨立付款流程。顧客選擇 PayMe 後，頁面會直接呈現官方 PayLink 按鈕、訂單金額與訂單編號，並以用戶提供的正式 PayCode 作為桌面版掃碼備援。前台只使用由店主提供、且經格式驗證的 `https://qr.payme.hsbc.com.hk/...` 官方連結；任何其他網域的付款連結都不會被展示。

| 情境 | 顧客體驗 | 目前行為 |
|---|---|---|
| 手機結帳 | 點擊「開啟 PayMe 付款」 | 開啟官方 PayMe PayLink；已安裝 PayMe App 的裝置會依其系統與 PayMe 的處理機制交接。 |
| 桌面結帳 | 掃描 PayCode | 以 PayMe App 掃描店主提供的收款碼，並於 App 內核對商戶、金額與訂單編號。 |
| 付款後 | 點擊「我已付款，通知店主核對」 | 以既有 WhatsApp 訂單通知流程發送訂單資料，供店主人工核對入帳。 |
| 收款資訊變更 | 後台 CMS 設定 | `payme_pay_link`、`payme_paycode_image` 及 `payme_merchant_name` 儲存在 `store_settings`，前台不使用假資料或未驗證付款網址。 |

> **重要限制：** 現時使用的是店主提供的靜態 PayLink／PayCode，並不會為每一張訂單建立由 PayMe 簽發的動態金額請求，因此付款後採用人工核對。不要把這個流程描述為自動入帳或自動確認。

## 正式驗證

正式 Checkout 已驗證以下內容：PayMe 選項不再開啟 Stripe Checkout；選取後顯示付款總額與訂單編號；官方 PayLink 的網域為 `qr.payme.hsbc.com.hk`；收款碼正常載入；「開始安全付款」Stripe 按鈕在 PayMe 模式不會顯示；付款面板載入時瀏覽器主控台沒有新增錯誤。本機生產建置成功，回歸測試共 6 項全部通過。

## 日後升級為動態 PayMe API 付款的條件

如需每張訂單都有鎖定金額、可自動回調及可自動確認付款的完整原生 PayMe 體驗，店主需取得 PayMe for Business API 的 `client_id`、`client_secret`、`signing_key_id` 及 `signing_key`，並完成 Sandbox 整合及上線審核。官方 API 的 `POST /payments/paymentrequests` 會回傳可產生 PayCode 的 `webLink`；回應中的舊 `appLink` 已標示為 deprecated。動態流程亦應驗證 PayMe webhook 的簽章及狀態，而不是只根據前台點擊或顧客回報判定付款成功。[1] [2]

| 項目 | 現行靜態流程 | 原生 PayMe API 動態流程 |
|---|---|---|
| 付款網址／碼 | 店主提供的固定 PayLink／PayCode | 每張訂單由伺服器建立的 `webLink`／PayCode |
| 訂單金額 | 顧客於 PayMe App 內自行核對 | 由 API 請求的 `totalAmount` 鎖定 |
| 成功確認 | 店主人工核對 | 已驗證 webhook／付款狀態查詢 |
| 所需憑證 | 無 | PayMe for Business API 憑證及簽章金鑰 |

## 參考資料

[1]: https://develop.hsbc.com/api-overview/how-get-started-21 "HSBC PayMe APIs for Business — How to get started"
[2]: https://develop.hsbc.com/api-overview/payme-business "HSBC PayMe for Business — API access and credential management"
