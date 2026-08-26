# Complete ytt 犬用雞肉條小食 20g — 上架 QA

日期：2026-08-26（香港時間）

## 產品與圖片

| 項目 | 驗證結果 |
|---|---|
| Stripe Product | `prod_V8sFjjO8IgpPvO` |
| 前台主圖 | 一張清理後的 Complete ytt 真實包裝純白背景圖。 |
| 圖片 CDN | `https://files.manuscdn.com/user_upload_by_module/session_file/310519663854897952/tAVnWbJFNUyySvTK.png` |
| 多圖處理 | 沒有建立重複圖片、不同數量選項圖片或原始供應頁截圖。 |

## 多規格與定價

| 規格 | 供應成本（CNY） | 未取整建議價（HKD） | 已上架零售價（HKD） | Stripe Price ID |
|---|---:|---:|---:|---|
| 體驗裝｜三文魚海苔味 1 包（8 根） | 6.74 | 14.28 | 14.90 | `price_1U8aVNRyM6dRKLtZ7S60votS` |
| 隨機 2 包／可自選（16 根） | 12.90 | 27.33 | 27.90 | `price_1U8aVNRyM6dRKLtZqwr4DE1J` |
| 4 口味各 2 包（共 64 根） | 32.90 | 69.71 | 69.90 | `price_1U8aVORyM6dRKLtZyvltXD1x` |
| 混合口味 8 包／可自選（共 64 根） | 32.90 | 69.71 | 69.90 | `price_1U8aVORyM6dRKLtZ8BiiBL40` |
| 混合口味 10 包（共 80 根） | 36.70 | 77.76 | 78.90 | `price_1U8aVORyM6dRKLtZIb6ivl1D` |

定價採用既定規則：`CNY 成本 × 1.1654 ÷ (1 − 45%)`，供應方至香港運費為 HK$0，然後只向上取 `.90`。顧客訂單層運費並未混入產品採購成本。

## 本機產品頁驗證

測試入口：`http://localhost:3102/product/prod_V8sFjjO8IgpPvO?completeytt=20260826`

前台只呈現上述五個真實數量／組合選項。兩項同為 8 包、同價的組合，各自使用獨立 `variant_key` 與 Stripe Price，故不會因相同包數而互相覆寫。產品預設選擇為體驗裝 HK$14.90；所有規格按鈕均已讀取對應產品內的活躍 HKD Price。

## 規格切換與購物籃驗證

本機頁面重新載入後，唯一清理後主圖已正常顯示。已選取「混合口味 8 包／可自選（共 64 根）」；主價格由 HK$14.90 更新為 HK$69.90，選取狀態落在該自選混合口味選項，而非同為 8 包的「4 口味各 2 包」。點選加入購物籃後，頁面確認「已加入購物籃」，本機購物籃項目由 1 增至 2。未進行任何支付或實際結帳提交。

## Stripe 及建置驗證

第二次執行上架腳本後，產品仍為 `prod_V8sFjjO8IgpPvO`，五個 `price_action` 均為 `reused`；確認腳本不會建立重複 Stripe Product 或 Price。現有伺服器訂單重建及 Stripe Price 所屬產品驗證保持不變。

`npm test` 共 42 項通過（新增 3 項單圖多規格回歸測試）；`npm run validate:products` 及 `npm run build` 均通過。建置期間有遠端圖片 TLS 重試紀錄，但最終編譯及 65 個頁面建置成功。

## 正式網站驗證

測試入口：`https://www.mofuhavenhk.com/product/prod_V8sFjjO8IgpPvO?completeytt=3a59a47d`

正式頁面已顯示唯一清理後的 Complete ytt 包裝主圖，並列出五個實際數量／組合選擇：HK$14.90、HK$27.90、HK$69.90、HK$69.90 及 HK$78.90。已在正式頁選取「混合口味 8 包／可自選（共 64 根）」；主價格即時更新至 HK$69.90，而「4 口味各 2 包」維持為另一個可選項，確認兩者沒有因同樣 8 包而混同。未進行付款或送出結帳。
