# Mofu Haven 舊產品暫時歸檔報告

**執行日期：** 2026-08-26（香港時間）  
**歸檔邊界：** 2026-08-25 00:00:00 HKT 前建立的 Stripe Product  
**操作方式：** 將確認的舊產品設為 `active=false`；不刪除 Stripe Price、圖片、描述、庫存 metadata 或歷史資料。

## 結果摘要

| 項目 | 數量 | 結果 |
| --- | ---: | --- |
| Stripe 產品總數（歸檔前） | 264 | 已完成完整分頁盤點 |
| 舊有啟用產品候選 | 89 | 已全部暫時歸檔 |
| 舊有已歸檔產品 | 55 | 維持不變 |
| 受保護新產品（8 月 25 日起） | 120 | 全部維持啟用 |
| 同名舊產品候選群組 | 0 | 未發現同名重複風險 |
| 舊產品仍啟用的驗證失敗 | 0 | 通過 |
| 新產品被錯誤歸檔的驗證失敗 | 0 | 通過 |

## 安全措施

歸檔前先以唯讀方式檢查日期、啟用狀態、現行 HKD Price 與產品名稱。89 個候選均在日期邊界前建立，且每款都有啟用中的 HKD Price；沒有候選與 120 款新產品重疊。歸檔時只變更 Stripe Product 的 `active` 狀態，並加入 `mofu_archive_status=temporary_pre_20260825`、歸檔時間與原因 metadata，讓日後還原可被精確限制在本次批次。

## 前台抽查

| 抽查類型 | 商品 | 結果 |
| --- | --- | --- |
| 已歸檔舊產品 | 北海道帆立貝乾（`prod_V4htF8xn3apgbi`） | 商品頁回傳 404，不可加購。 |
| 受保護新產品 | 銀之匙 魚肉雞胸肉鰹魚節貓罐頭 70g（`prod_V8lATUvYyTfiyk`） | 正常顯示 HK$19.90、現貨、分類、圖片及加入購物籃。 |

## 還原方式

本次為可回復的暫時歸檔，而非刪除。專案內已保留 `scripts/restore_pre_aug25_archived_products.py`；該工具只會對持有本次精確 archive marker 的產品恢復 `active=true`，不會誤啟用其他產品。使用前會先進行唯讀預覽，只有在明確執行 `--apply` 時才會還原。

## 隨附稽核資料

- `pre_aug25_product_archive_audit.md`：歸檔前完整候選清單。
- `pre_aug25_product_archive_preflight.json`：日期／啟用／價格預檢。
- `pre_aug25_product_archive_apply.json`：歸檔結果與還原提示。
- `pre_aug25_product_archive_verification.json`：歸檔後 Stripe 直接驗證。
- `pre_aug25_product_archive_frontend_verification.md`：正式前台抽查結果。
