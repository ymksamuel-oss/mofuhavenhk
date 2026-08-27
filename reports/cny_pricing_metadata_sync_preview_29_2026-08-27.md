# 29 件產品 CNY 定價 Metadata 同步唯讀預覽

**產生時間（UTC）：** 2026-08-27T02:31:57.100093+00:00
**狀態：** **唯讀預覽**。本次重新讀取 Stripe 的活躍 Product 及 HKD Price，將已在本機來源檔核實的 29 件成本資料逐項配對；**沒有更新任何 Stripe metadata、建立／停用 Price 或改動網站前台售價。**

## 本輪同步資料設計

如日後獲店主明確批准，29 件產品將依照以下既有批次定價資料補齊 metadata。成本只會寫在各自的**活躍 HKD Price**，而毛利、匯率、運費和取整政策只會寫在**Stripe Product**；這與現時唯讀重定價預覽的讀取規則一致。

| 層級 | 建議欄位 | 建議值 |
| --- | --- | --- |
| 活躍 HKD Price | `cost_cny` | 每件／變體的本機已核實 CNY 成本 |
| Stripe Product | `pricing_target_product_gross_margin` | `0.45` |
| Stripe Product | `pricing_cny_to_hkd` | `1.1654` |
| Stripe Product | `pricing_ship_to_hk_hkd` | `0.00` |
| Stripe Product | `pricing_rounding` | `upward .90` |

以上資料來自 `batch24_product_mapping.json` 或 `combo_dogfood_5_import_mapping.json` 的既有成本、匯率、毛利及取整記錄。這不是今輪重新定價；它只會讓產品在未來**再經過獨立唯讀 FX 預覽及批准**後，才可能進入安全改價流程。

## 預覽結果

| 項目 | 結果 |
| --- | ---: |
| 已核對來源產品 | 29 |
| 與活躍 Stripe Product 成功以供應商 SKU 對應 | 29 |
| 日後可進入同步前審核 | **25 件／25 項活躍 HKD Price** |
| 因 Product metadata 已滿而暫緩 | **4 件** |
| 欄位值衝突 | **0** |
| 活躍 Price metadata 容量衝突 | **0** |
| Stripe 寫入 | **0** |

25 件可準備同步的範圍如下：

| 本機來源檔 | 產品數 | 活躍 HKD Price 數 |
| --- | --- | --- |
| batch24_product_mapping.json | 20 | 20 |
| combo_dogfood_5_import_mapping.json | 5 | 5 |

## 暫緩項目：Product metadata 欄位容量

下列 4 件 PETLINE 的 Product metadata 目前正好有 50 個欄位。要補上 4 個 Product 層級定價欄位會增至 54 個，故本次預覽**明確封鎖**同步。其活躍 Price 尚有空位可放入成本，但不能只寫成本而缺少毛利、匯率和取整規則，因此應整組維持暫緩。

| 店內 SKU | 產品 | 供應商 SKU | 現有欄位 | 補後欄位 | 暫緩原因 |
| --- | --- | --- | --- | --- | --- |
| MH-DOG-PTL-001 | PETLINE 盛宴時光 雞胸肉蔬菜牛肉風味果凍包 25g×4｜PETLINE Gochisou Time Chicken Breast, Vegetable & Beef-Style Jelly Pouches 25g×4 | B24-01 | 50 | 54 | product_metadata_capacity_exceeded |
| MH-DOG-PTL-002 | PETLINE 盛宴時光 雞胸肉芝士果凍包 25g×4｜PETLINE Gochisou Time Chicken Breast & Cheese Jelly Pouches 25g×4 | B24-02 | 50 | 54 | product_metadata_capacity_exceeded |
| MH-DOG-PTL-003 | PETLINE 盛宴時光 雞胸肉牛奶燉芝士包 25g×4｜PETLINE Gochisou Time Chicken Breast Milk-Stew with Cheese Pouches 25g×4 | B24-03 | 50 | 54 | product_metadata_capacity_exceeded |
| MH-DOG-PTL-004 | PETLINE 盛宴時光 雞肉泥牛奶果凍芝士包 25g×4｜PETLINE Gochisou Time Chicken Paste Milk Jelly with Cheese Pouches 25g×4 | B24-04 | 50 | 54 | product_metadata_capacity_exceeded |

日後如要處理這 4 件，須先逐欄比較、確認可安全刪除或合併的非關鍵重複展示 metadata，產生回復清單後才可再次預覽。不可覆寫現有內容或移除官方產品資料來騰出位置。

## 下一步選項

1. **維持預覽**，不作任何 Stripe metadata 寫入。
2. **批准只同步 25 件 ready 項目**：屆時會先以最新 Stripe 資料再做 preflight，逐件確認 SKU、Price ID、欄位值與容量後才寫入；不會更改 HKD 售價。
3. **先為 4 件 PETLINE 設計 metadata 欄位整理預覽**，再決定是否與上述 25 件分批同步。

完整 29 件逐項欄位、現有／預計 metadata key 數、活躍 Price ID、CNY 成本、來源檔及阻擋原因，請見 CSV 與 JSON 附件。
