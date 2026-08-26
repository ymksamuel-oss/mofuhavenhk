# Mofu Haven 可售產品 `.90` 尾數批量調價報告

**執行日期：** 2026-08-26（香港時間）  
**定價規則：** 只向上調整至最近的 `.90` 價格帶，絕不下調任何現行售價。

> 例子：HK$32.30 → HK$32.90；HK$55.00 → HK$55.90；HK$32.95 → HK$33.90；原本為 HK$32.90 的產品保持不變。

## 調價結果

| 項目 | 數量 | 結果 |
| --- | ---: | --- |
| 可售 Stripe Product | 120 | 只處理此範圍 |
| 可售 HKD Price 規格 | 134 | 包含 ONE CARE 多件裝規格 |
| 已符合 `.90` 尾數 | 32 | 保持不變 |
| 建立替代 Price 並向上調整 | 102 | 全部成功 |
| 調價後仍非 `.90` 的可售 Price | 0 | 驗證通過 |
| 調價後失效／隱藏的比較原價 | 0 | 驗證通過 |
| 已歸檔舊產品被改價 | 0 | 完整排除 |

## Stripe 安全處理

Stripe Price 的金額不可直接修改。本次每一個需調整的 Price 均先建立一個金額較高的新 HKD Price，保留原有 metadata、比較原價與變體資料；如該 Price 為商品預設價格，則更新 Product 的 `default_price`；最後才停用舊 Price。此流程確保既有 Product、圖片、描述、庫存及支付邏輯均不會遺失。

所有 102 個替代 Price 已通過直接 Stripe 核對：來源 Price 已停用、替代 Price 啟用、新價格正確、尾數為 `.90`、Product 預設價格已在需要時指向新 Price，且比較原價仍高於現價或不存在。

## 前台與 Checkout 核對

| 驗證項目 | 結果 |
| --- | --- |
| 商品詳情頁 | CIAO Premium 6種功能性成分（雞胸肉扇貝味）由 HK$10.00 顯示為 HK$10.90；HK$12.00 原價及 -9% 優惠仍正常。 |
| 加購控制項 | 正常顯示。 |
| Stripe Checkout | 指定商品建立的未付款測試 Session 使用新 Price `price_1U8VfGRyM6dRKLtZqnZL6lHd`，單件金額 HK$10.90。 |
| 測試付款安全 | Session 已立即失效，狀態為 `expired`／`unpaid`。 |

## 可回復方式

專案內已保留 `scripts/restore_active_hkd_tail_prices.py`。該工具只讀取本次 `active_hkd_tail_price_apply.json` 中已替換的精確來源 Price；先以唯讀模式預覽，只有帶入 `--apply` 時才會重新啟用舊 Price、還原 Product 預設價格，並停用本次替代 Price。

## 隨附資料

- `active_hkd_tail_price_audit.md`：調價前唯讀稽核。
- `active_hkd_tail_price_audit.json`：完整 Price 級別稽核資料。
- `active_hkd_tail_price_apply.json`：102 個替代 Price 對照與結果。
- `active_hkd_tail_price_verification.json`：Stripe 歸屬、金額、比較價與尾數驗證。
