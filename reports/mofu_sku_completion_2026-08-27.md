# Mofu Haven 店內 SKU：全站完成記錄

**完成日期：2026-08-27**

## 結果摘要

全部 **226 件啟用 Stripe 產品**已獲分配一個固定、易讀且唯一的店內 SKU。格式為 `MH-{CATEGORY}-{BRAND}-{NNN}`，例如 `MH-CAT-CIAO-001`。Stripe 原有的 `prod_...` 系統 ID、既有供應商 `sku`、價格、圖片、庫存與付款設定均未被改寫。

| 檢查項目 | 結果 |
|---|---:|
| Stripe 啟用產品 | 226 |
| 已寫入 `mofu_sku` | 226 |
| 缺少店內 SKU | 0 |
| 格式錯誤 | 0 |
| SKU 重複 | 0 |
| 對照表與 Stripe 不一致 | 0 |
| 同步批次 | 6 |

## 例外處理

Nyantomo 清潔貓廁所木質貓砂 4.4L 在更新前已佔用 Stripe metadata 的 50 個欄位。為新增店內 SKU，僅移除了可由既有中文欄位回退的 `texture_en`；其中文口感欄位、材料、使用、保存、安全提示、官方來源及營運欄位均保留。同步工具在寫入前已驗證鍵數不超過 Stripe 上限。

## 前台與訂單流程整合

產品詳情頁會優先顯示「店內貨號：`MH-...`」，不再向一般顧客展示複雜的 Stripe Product ID。缺貨商品的 WhatsApp 訂貨查詢會預填店內 SKU 與商品名稱。一般訂單的客戶 WhatsApp 訊息及可傳送項目資料的店主通知 API，均會把店內 SKU 放在商品行中。

## 營運使用方法

| 場景 | 建議使用方式 |
|---|---|
| WhatsApp 客戶查詢 | 以 `MH-...` 店內貨號搜尋、回覆及記錄。 |
| 揀貨／補貨 | 按店內 SKU 排序；SKU 永不重用，即使停售或缺貨亦不更改。 |
| Stripe 除錯／退款／付款對帳 | 使用保留的 Stripe `prod_...`／Payment ID。 |
| 供應商採購 | 同時保留原有供應商 `sku`（如已有），與 Mofu 店內 SKU 分開管理。 |

## 產出檔案

- `data/mofu_sku_mapping_2026-08-27/mofu_sku_mapping.csv`：供營運人員開啟的完整對照表。
- `data/mofu_sku_mapping_2026-08-27/mofu_sku_mapping.json`：完整機器可讀對照及 metadata 上限狀態。
- `reports/mofu_sku_mapping_verification_2026-08-27.json`：Stripe 逐件讀回驗證結果。
- `reports/mofu_sku_assignment_*_stripe_sync_manifest.json`：六個同步批次的逐件寫入核對結果。

> 對照表是目前有效產品的快照。日後新增產品時，應先以相同規則產生並核對新 SKU，再寫入 Stripe，切勿人手重用已存在的貨號。
