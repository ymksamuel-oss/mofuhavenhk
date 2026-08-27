# CIAO 高齡貓用燒鰹魚 50g 固定成本及售價更新核對

**核對時間（UTC）：** 2026-08-27

## 已確認輸入

| 欄位 | 店主確認值 |
| --- | --- |
| 產品 SKU | MH-CAT-CIAO-029 |
| 產品 | CIAO 炙烤盛宴｜香烤鰹魚干瑤柱（高齡貓用）｜50g |
| 真實成本 | CNY ¥11.70 |
| 固定售價 | HK$22.90 |

## Stripe 唯讀核對

| 項目 | 結果 |
| --- | --- |
| 新預設 Price | `price_1U933MRyM6dRKLtZPQyUhqZa` |
| 新 Price 狀態 | 活躍 |
| 新 Price 金額 | HK$22.90 |
| 新 Price `cost_cny` | 11.70 |
| 舊反向倒推基準 | 已從新 Price 移除 |
| 舊 HK$17.90 Price | `price_1U91tuRyM6dRKLtZ6qsNXQeF`，已停用 |
| Product.default_price | 已切換至新 Price |

## 公開網站核對

以唯讀方式開啟 `https://www.mofuhavenhk.com/product/prod_V8fduDqyGKiazf`。產品頁顯示 SKU `MH-CAT-CIAO-029`、現貨、50g，以及 **HK$22.90**；數量增減與加入購物籃按鈕可見。本次沒有加入購物籃、建立 Checkout 或付款。

**結論：** 店主指定的 CNY ¥11.70 與 HK$22.90 已在 Stripe 及公開網站生效。整個更新沒有讀取或使用外匯、反向倒推、取整或自動定價規則。
