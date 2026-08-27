# Mofu Haven HK 全站 CNY 定價更新預覽（唯讀）
**產生時間（UTC）：** 2026-08-27T10:05:10.593460+00:00
**狀態：** **唯讀預覽**。程式只讀取 Stripe 的活躍 Products 與 HKD Prices；沒有建立、更新、停用任何 Stripe Price，亦沒有修改 Product metadata 或前台價格。

## 指定規則
> **HKD 零售價 = 向上取整至 `.90`（CNY 成本 × 1.166 × 1.76）**

精確取整定義為 `ceil(未取整價格 − 0.90) + 0.90`；例如 HK$16.90 維持 HK$16.90，而 HK$16.91 會向上成為 HK$17.90。

## 即時 Stripe 盤點
| 項目 | 數量 |
| --- | ---: |
| 活躍 Stripe Products | 226 |
| 全帳戶活躍 HKD Prices | 399 |
| 屬於活躍 Products 的活躍 HKD Prices | 255 |
| 遺留／非活躍 Product 的活躍 HKD Prices（只作審計，不納入更新） | 144 |
| 有可追溯 CNY 成本、可計算的 Price | 150 |
| 有價格變動建議（只作預覽） | 138 |
| 按公式後維持現價 | 12 |
| 欠缺可信 CNY 成本、不可估算 | 105 |
| 沒有任何活躍 HKD Price 的活躍 Product | 0 |
| 可計算項目的合計價格差額（非銷售額） | HK$-560.00 |

## 成本資料處理原則
只有現行 Price metadata 的 CNY 成本、僅有一個活躍 HKD Price 時的 Product metadata 成本，或與先前已核實預覽完全相同的 Product ID 與 Price ID 成本紀錄，才會納入計算。沒有可信成本的 Price 會保留原價，絕不從現價反推或猜測成本。

## 價格變動幅度最大的 25 項（唯讀）
| 店內 SKU | 產品 | Price ID | 現價 | CNY 成本 | 建議價 | 差額 | 成本來源 |
| --- | --- | --- | ---: | ---: | ---: | ---: | --- |
| MH-DOG-COMBO-015 | COMBO 馬蘇里拉芝士角切狗狗乾糧 720g｜COMBO Mozzarella Cheese Cubes Dry Dog Food 720g | price_1U8SsoRyM6dRKLtZv82WvY8y | HK$249.90 | ¥114.0000 | HK$234.90 | HK$-15.00 | prior_reviewed_preview_exact_price_match:locally_recovered_supplier_sku |
| MH-DOG-COMBO-013 | COMBO 捲心菜牛肉狗狗乾糧 720g｜COMBO Cabbage & Beef Dry Dog Food 720g | price_1U8SspRyM6dRKLtZdI80zla7 | HK$249.90 | ¥114.0000 | HK$234.90 | HK$-15.00 | prior_reviewed_preview_exact_price_match:locally_recovered_supplier_sku |
| MH-DOG-COMBO-014 | COMBO 牛肉小魚乾芝士蔬菜狗狗乾糧 720g｜COMBO Beef, Dried Small Fish, Cheese & Vegetable Blend Dry Dog Food 720g | price_1U8SsmRyM6dRKLtZ3iaLqEV5 | HK$249.90 | ¥114.0000 | HK$234.90 | HK$-15.00 | prior_reviewed_preview_exact_price_match:locally_recovered_supplier_sku |
| MH-DOG-COMBO-016 | COMBO 低脂小魚乾雞肉狗狗乾糧 720g｜COMBO Low-Fat Dried Small Fish & Chicken Dry Dog Food 720g | price_1U8SsqRyM6dRKLtZP2yQef0B | HK$249.90 | ¥114.0000 | HK$234.90 | HK$-15.00 | prior_reviewed_preview_exact_price_match:locally_recovered_supplier_sku |
| MH-DOG-COMBO-017 | COMBO 低脂 7歲以上狗狗乾糧 720g｜COMBO Low-Fat Senior Dry Dog Food 720g | price_1U8SsrRyM6dRKLtZoKEOSOWV | HK$249.90 | ¥114.0000 | HK$234.90 | HK$-15.00 | prior_reviewed_preview_exact_price_match:locally_recovered_supplier_sku |
| MH-CAT-PAMAX-001 | PAMAX Miracle Series 生物酶除味貓砂 2.7kg｜PAMAX Miracle Series Enzyme Odour-Control Cat Litter 2.7kg | price_1U8cU7RyM6dRKLtZu7s2FINt | HK$472.90 | ¥223.0000 | HK$457.90 | HK$-15.00 | live_price_metadata:cost_cny |
| MH-CAT-SNR-028 | AIM30 室內已絕育成貓 雞肉味乾糧 1.2kg｜AIM30 Indoor Spayed and Neutered Adult Cat Food Chicken Flavour 1.2kg | price_1U8fcCRyM6dRKLtZhVXn5d9C | HK$417.90 | ¥197.0000 | HK$404.90 | HK$-13.00 | live_price_metadata:cost_cny |
| MH-CAT-SNR-026 | AIM30 室內成貓 鮮魚味乾糧 600g｜AIM30 Indoor Adult Cat Food Fish Flavour 600g | price_1U8fc4RyM6dRKLtZnmbBZ59U | HK$356.90 | ¥168.0000 | HK$344.90 | HK$-12.00 | live_price_metadata:cost_cny |
| MH-CAT-SNR-030 | AIM30 室內高齡貓 11 歲以上 鮮魚味乾糧 600g｜AIM30 Indoor Senior Cat Food 11+ Fish Flavour 600g | price_1U8fcBRyM6dRKLtZpuYulJ4J | HK$356.90 | ¥168.0000 | HK$344.90 | HK$-12.00 | live_price_metadata:cost_cny |
| MH-CAT-SNR-032 | AIM30 室內高齡貓 15 歲以上 腎臟健康照護 鮮魚味乾糧 600g｜AIM30 Indoor Senior Cat Food 15+ Kidney Health Care Fish Flavour 600g | price_1U8fc8RyM6dRKLtZkNh900Ke | HK$356.90 | ¥168.0000 | HK$344.90 | HK$-12.00 | live_price_metadata:cost_cny |
| MH-CAT-SNR-033 | AIM30 室內高齡貓 15 歲以上 腎臟健康照護 雞肉味乾糧 600g｜AIM30 Indoor Senior Cat Food 15+ Kidney Health Care Chicken Flavour 600g | price_1U8fc6RyM6dRKLtZ8UU70tzG | HK$356.90 | ¥168.0000 | HK$344.90 | HK$-12.00 | live_price_metadata:cost_cny |
| MH-CAT-SNR-029 | AIM30 室內高齡貓 11 歲以上 雞肉味乾糧 600g｜AIM30 Indoor Senior Cat Food 11+ Chicken Flavour 600g | price_1U8fc2RyM6dRKLtZ3lk0Ei43 | HK$356.90 | ¥168.0000 | HK$344.90 | HK$-12.00 | live_price_metadata:cost_cny |
| MH-CAT-SNR-025 | AIM30 室內成貓 雞肉味乾糧 600g｜AIM30 Indoor Adult Cat Food Chicken Flavour 600g | price_1U8fc3RyM6dRKLtZ8kbEZQmk | HK$356.90 | ¥168.0000 | HK$344.90 | HK$-12.00 | live_price_metadata:cost_cny |
| MH-CAT-SNR-031 | AIM30 室內高齡貓 15 歲以上 雞肉味乾糧 600g｜AIM30 Indoor Senior Cat Food 15+ Chicken Flavour 600g | price_1U8fc9RyM6dRKLtZcSJjz0IP | HK$356.90 | ¥168.0000 | HK$344.90 | HK$-12.00 | live_price_metadata:cost_cny |
| MH-DOG-COMBO-012 | COMBO Pure 魚肉米狗狗乾糧 540g｜COMBO Pure Fish & Rice Dry Dog Food 540g | price_1U8TeHRyM6dRKLtZVgeSBzyq | HK$189.90 | ¥87.0000 | HK$178.90 | HK$-11.00 | prior_reviewed_preview_exact_price_match:locally_recovered_supplier_sku |
| MH-DOG-COMBO-008 | COMBO Pure 嚴選芝士日本產雞肉狗狗乾糧 600g｜COMBO Pure Selected Cheese & Japanese Chicken Dry Dog Food 600g | price_1U8TeCRyM6dRKLtZj8yHgAgF | HK$189.90 | ¥87.0000 | HK$178.90 | HK$-11.00 | prior_reviewed_preview_exact_price_match:locally_recovered_supplier_sku |
| MH-DOG-COMBO-006 | COMBO Pure 日本產雞肉蔬菜狗狗乾糧 600g｜COMBO Pure Japanese Chicken & Vegetable Dry Dog Food 600g | price_1U8TeARyM6dRKLtZQu5zOWNW | HK$189.90 | ¥87.0000 | HK$178.90 | HK$-11.00 | prior_reviewed_preview_exact_price_match:locally_recovered_supplier_sku |
| MH-DOG-COMBO-007 | COMBO Pure 蔬菜嚴選芝士狗狗乾糧 600g｜COMBO Pure Vegetable & Selected Cheese Dry Dog Food 600g | price_1U8TeBRyM6dRKLtZzFpXrLkJ | HK$189.90 | ¥87.0000 | HK$178.90 | HK$-11.00 | prior_reviewed_preview_exact_price_match:locally_recovered_supplier_sku |
| MH-DOG-COMBO-010 | COMBO Pure 低脂日本產雞肉蔬菜狗狗乾糧 600g｜COMBO Pure Low-Fat Japanese Chicken & Vegetable Dry Dog Food 600g | price_1U8TeERyM6dRKLtZkFfIYDtC | HK$189.90 | ¥87.0000 | HK$178.90 | HK$-11.00 | prior_reviewed_preview_exact_price_match:locally_recovered_supplier_sku |
| MH-DOG-COMBO-011 | COMBO Pure 凍乾配料日本產雞肉蔬菜狗狗乾糧 540g｜COMBO Pure Freeze-Dried Topping Japanese Chicken & Vegetable Dry Dog Food 540g | price_1U8TeFRyM6dRKLtZuol9PSsc | HK$189.90 | ¥87.0000 | HK$178.90 | HK$-11.00 | prior_reviewed_preview_exact_price_match:locally_recovered_supplier_sku |
| MH-DOG-COMBO-009 | COMBO Pure 超小粒日本產雞肉蔬菜狗狗乾糧 600g｜COMBO Pure Extra-Small Kibble Japanese Chicken & Vegetable Dry Dog Food 600g | price_1U8TeDRyM6dRKLtZlJaNJ6sH | HK$189.90 | ¥87.0000 | HK$178.90 | HK$-11.00 | prior_reviewed_preview_exact_price_match:locally_recovered_supplier_sku |
| MH-DOG-PTL-004 | PETLINE 盛宴時光 雞肉泥牛奶果凍芝士包 25g×4｜PETLINE Gochisou Time Chicken Paste Milk Jelly with Cheese Pouches 25g×4 | price_1U8Te1RyM6dRKLtZhKa7smDU | HK$49.90 | ¥19.7000 | HK$40.90 | HK$-9.00 | prior_reviewed_preview_exact_price_match:locally_recovered_supplier_sku |
| MH-DOG-PTL-001 | PETLINE 盛宴時光 雞胸肉蔬菜牛肉風味果凍包 25g×4｜PETLINE Gochisou Time Chicken Breast, Vegetable & Beef-Style Jelly Pouches 25g×4 | price_1U8TdxRyM6dRKLtZS4vQb2w7 | HK$49.90 | ¥19.7000 | HK$40.90 | HK$-9.00 | prior_reviewed_preview_exact_price_match:locally_recovered_supplier_sku |
| MH-DOG-PTL-003 | PETLINE 盛宴時光 雞胸肉牛奶燉芝士包 25g×4｜PETLINE Gochisou Time Chicken Breast Milk-Stew with Cheese Pouches 25g×4 | price_1U8TdzRyM6dRKLtZcZlk1ao4 | HK$49.90 | ¥19.7000 | HK$40.90 | HK$-9.00 | prior_reviewed_preview_exact_price_match:locally_recovered_supplier_sku |
| MH-DOG-PTL-002 | PETLINE 盛宴時光 雞胸肉芝士果凍包 25g×4｜PETLINE Gochisou Time Chicken Breast & Cheese Jelly Pouches 25g×4 | price_1U8TdyRyM6dRKLtZYeTThu5A | HK$49.90 | ¥19.7000 | HK$40.90 | HK$-9.00 | prior_reviewed_preview_exact_price_match:locally_recovered_supplier_sku |

## 完整清單
完整逐 Price 清單位於同日 CSV：`catalog_cny_hkd_multiplier_repricing_preview_1_166_2026-08-27.csv`；其機讀版本位於 `catalog_cny_hkd_multiplier_repricing_preview_1_166_2026-08-27.json`。兩者均列出產品、Price ID、現價、成本、成本來源、未取整價格、建議價、差額與狀態。

## 下一步
在店主確認完整預覽前，不應寫入 Stripe。確認時必須明確指定：是否只批准有可信成本的 Price、如何處理欠缺成本的項目，以及是否把遺留／未連結的活躍 Price 排除於本次變更。寫入前亦必須重新讀取 Stripe，核對每個來源 Price 仍為活躍、產品關係與金額不變。
