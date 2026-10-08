# 全站售價重算預覽（尚未套用）

- **基準欄位：** `public.products.price`；不以 `products.original_price` 計算或寫入本次價格資料。
- **公式：** `floor(基準價 × 1.12) + 0.90`；運算使用 PostgreSQL `numeric` 精確小數。
- **預計覆蓋：** 全部商品列；包括上架有庫存與未上架／封存項目。
- **價錢備份：** 舊 `price` 複製至 `msrp_price`；重算結果同步寫入 `price`、`price_hkd`、`current_hkd`。
- **比較價展示：** 現有 `original_price` 保留在資料庫，但前台商品卡／詳情不再輸出劃線比較價。
- **狀態：** 此為預覽，尚未修改 Supabase、Stripe 或正式商品價；Stripe Checkout 由 Supabase 商品價即時計價，不需手動建立 Stripe Price。

## 數量與總體差異

| 項目 | 值 |
|---|---:|
| 商品資料列 | 252 |
| 上架且有庫存 | 209 |
| 其餘未上架／封存／停售 | 43 |
| 現價資料列加總 | HK$33,369.80 |
| 預覽新價資料列加總 | HK$37,504.80 |
| 每筆商品各計一次的差額加總 | HK$4,135.00 |
| 平均單品價格上調 | 12.62% |
| 單品上調範圍 | 12.01%–13.36% |

## 五款抽查

| SKU | 商品 | 現價／備份 MSRP | 預覽新價 | 差額 |
|---|---|---:|---:|---:|
| `MOFU-BUNDLE-SEAFOOD-03` | 【限時特惠・現省$72】深海美毛亮眼・Omega-3 全魚滋補 4 件套裝（三文魚肉棒＋黑鮪赤身片＋北海道姬鱈魚乾＋無鹽丁香魚） | HK$267.90 | HK$300.90 | +HK$33.00 |
| `MOFU-BUNDLE-DENTAL-02` | 【限時特惠・現省$61】室內放電防拆家・物理潔齒耐咬 3 件套裝（天然原隻牛蹄＋特長牛大筋＋高山犛牛芝士棒M） | HK$298.90 | HK$334.90 | +HK$36.00 |
| `MOFU-BUNDLE-PICKY-01` | 【限時特惠・現省$51】挑食怪終結者・日系拌糧誘食 4 件套裝（純雞雪花碎＋黑鮪魚碎＋安納芋粉＋熟成起司粉） | HK$198.90 | HK$222.90 | +HK$24.00 |
| `4976064013897` | 【極致薄削】黃鰭金槍魚柴魚薄片 30g | HK$49.90 | HK$55.90 | +HK$6.00 |
| `4976064024725` | 【補鈣無鹽】無添加天然小魚乾 70g | HK$59.90 | HK$67.90 | +HK$8.00 |

## 完整逐項 payload

- [完整 252 筆 CSV](/home/ubuntu/mofuhavenhk/data/product_price_repricing_preview_2026-10-08.csv)
- [機器可讀 JSON](/home/ubuntu/mofuhavenhk/data/product_price_repricing_preview_2026-10-08.json)

以下 SQL 為草稿；只有收到最終確認後才會套用到正式 Supabase。
