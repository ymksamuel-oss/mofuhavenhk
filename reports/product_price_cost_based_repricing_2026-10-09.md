# 全站以日圓成本重算售價（2026-10-09）

## 修正範圍與依據

- 正式資料庫：`ymksamuel-oss's Project`（Supabase `hkuxxgduymkztkmyhhot`）。
- 商品總數：252；252 件均有正值成本。
- 後台成本來源：Admin API 將歷史欄位 `products.cost_price_rmb` 映射為 `cost_jpy`。資料庫中 75 筆私有成本覆寫均與該商品欄位一致；野菜小饅頭沒有私有覆寫，使用資料列 JPY 275。
- 不再把舊 `price` 或舊 `msrp_price` 當成計價基準。

## 公式

1. `成本港幣 = 來貨成本 (JPY) × 0.052`
2. `真・建議零售價 (HKD) = Math.round(成本港幣 × 2.2)`
3. `最終售價 (HKD) = Math.floor(真・建議零售價 × 1.12) + 0.90`

例如野菜小饅頭：`275 × 0.052 = HK$14.30`；`Math.round(14.30 × 2.2) = HK$31`；`floor(31 × 1.12) + 0.90 = HK$34.90`。

## 十款代表性商品價格對照

| 商品名稱 | JPY 成本 | 真・建議零售價 | 上輪錯誤售價 | 本次合理新售價 |
|---|---:|---:|---:|---:|
| 黃鰭金槍魚柴魚薄片 30g（SKU 4976064013736） | ¥220 | HK$25.00 | HK$55.90 | HK$28.90 |
| 可沖馬桶水溶性寵物拾便袋 100枚（SKU 4976064015013） | ¥600 | HK$69.00 | HK$145.90 | HK$77.90 |
| 純雞肉薄削花撒粉 20g（SKU 4976064015716） | ¥275 | HK$31.00 | HK$67.90 | HK$34.90 |
| 和風即食料理包・馬肉牛扒（SKU 4976064016485） | ¥360 | HK$41.00 | HK$89.90 | HK$45.90 |
| 五穀糙米養生格子鬆餅 6枚（SKU 4976064018397） | ¥440 | HK$50.00 | HK$111.90 | HK$56.90 |
| 慢燉馬肉時蔬 80g（SKU 4976064018854） | ¥420 | HK$48.00 | HK$100.90 | HK$53.90 |
| 冷凍生馬肉碎 500g（SKU 4976064020093） | ¥660 | HK$76.00 | HK$167.90 | HK$85.90 |
| 黑豚大豬耳特惠裝 5枚（SKU 4976064022301） | ¥900 | HK$103.00 | HK$223.90 | HK$115.90 |
| 防暴衝胸背帶 S 號（SKU 4976064023254） | ¥2,150 | HK$246.00 | HK$526.90 | HK$275.90 |
| **野菜小饅頭 50g（SKU 4976064025357）** | **¥275** | **HK$31.00** | **HK$67.90** | **HK$34.90** |

## 欄位與結帳行為

- Migration 將真 MSRP 寫入 `msrp_price`，最終售價同步寫入 `price`、`price_hkd`、`current_hkd`，並將全部舊 `original_price` 重置為 `NULL`。
- Stripe Checkout 會以商品目錄中的即時售價建立 HKD `price_data.unit_amount`，並透過 `toStripeAmountHkd` 轉成整數 cents；HK$34.90 對應 3490 cents，不需預先建立 Stripe Price。
- 順豐免運門檻 HK$399 由購物車小計另行計算，本次不改動。

## Migration

`supabase/migrations/20261009001200_cost_based_product_repricing.sql`

此 migration 會先確認商品數、成本完整性與目標 SKU 成本，再更新並驗證全商品價格；任何前置條件不符或結果不符時會回滾並報錯。

## 正式執行與驗收結果

- Migration 已正式套用：`cost_based_product_repricing_20261009`（Supabase 版本 `20261008162944`）。
- 套用後唯讀驗證：252 件商品；公式不符 0 件；`price_hkd`／`current_hkd` 不一致 0 件；仍有 `original_price` 的商品 0 件；非 `.90` 尾數 0 件。
- SKU `4976064025357`：成本 ¥275、`msrp_price` HK$31.00、`price`／`price_hkd`／`current_hkd` 均為 HK$34.90、`original_price = NULL`。
- 正式商品頁已即時顯示 HK$34.90，沒有虛高原價；正式首頁與商品目錄有顯示內容，瀏覽器 console 無錯誤。
- 驗證：Next.js production build 通過；`tsc --noEmit` 通過；定價、Stripe 金額與 HK$399 免運定向測試 8/8 通過；相關 ESLint 通過。全套測試的 28 個既有失敗在未修改的 HEAD 同樣重現（10 個測試檔），不是本次改動引入。

後續防回歸：Admin 試算已將 0.052 匯率及 2.2 倍率顯示為固定值；後端寫入成本設定時也強制使用這兩個標準值。平攤運費僅供毛利參考，不納入 MSRP；套用建議 MSRP／售價時會清除該商品殘留的舊 `original_price`。
