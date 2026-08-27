# CNY→HKD 售價重定價唯讀預覽

**產生時間（UTC）：** 2026-08-27T02:13:13.428384+00:00
**狀態：** **唯讀預覽**。本次只作公開匯率與 Stripe 現行資料的讀取及計算；**沒有建立、停用或切換任何 Stripe Price，亦沒有改動網站前台售價。**

本輪沿用已驗證的歷史定價公式：`CNY 成本 × CNY→HKD 匯率 ÷ (1 − 目標毛利率)`，並向上取整至 `.90`。所有 121 個納入的可售 HKD Price 均持有 `45%` 目標毛利、`1.1654` 的既存匯率基準及 `upward .90` 取整規則。既有匯入程式的驗證式並**沒有**把 `pricing_ship_to_hk_hkd` 另行加進公式；為避免任意改寫歷史成本定義，本次同樣不另加運費。此欄位是否已包含於 CNY 成本、或將來應獨立計入，仍須店主在任何實際套用前確認。

## 參考匯率與範圍

| 項目 | 結果 |
| --- | ---: |
| 公開參考匯率 | **1 CNY = 1.1678 HKD** |
| 匯率資料日期 | 2026-08-27 |
| 既存定價匯率 | 1 CNY = 1.1654 HKD |
| 相對變動 | +0.2059% |
| 已檢查活躍 Stripe 產品 | 226 件 |
| 已檢查活躍 HKD Price | 399 項 |
| 具完整成本／毛利／匯率資料且前台可售 | **106 件產品／121 項 Price** |
| 未納入 | 120 件產品；其對應 134 項可售價缺少完整定價資料 |

資料來源為 Frankfurter 的 CNY/HKD 單日參考匯率端點；它是參考匯率而非可成交的即時報價，因此不應當作實時外匯交易價格。[1]

## 預覽結果

| 指標 | 結果 |
| --- | ---: |
| 不變價格 | 106 項 |
| 原始建議變動（未套門檻） | **15 項 Price／12 件產品／12 個店內 SKU** |
| 上調／下調 | 15／0 |
| 價格合計：現行 → 建議 | HK$10,571.90 → HK$10,586.90 |
| 價格合計差額 | HK$15.00 |
| 每項變幅中位數／最大值 | HK$1.00／HK$1.00 |
| 百分比變幅中位數／最大值 | 0.84%／4.37% |
| 建議價低於目標毛利的項目 | **0** |
| 單項變幅超過 5% 的項目 | **0** |

所有 15 項原始建議均為 **+HK$1.00**；這是匯率上升約 0.21% 後，部分現行價格剛好跌穿下一個 `.90` 向上取整門檻所致，而不是按匯率比例放大價格。

## 只供日後政策選擇的保護門檻

以下門檻**尚未啟用，亦沒有被用作改價**，只用來展示若日後採用「匯率絕對變動至少 0.5%，並限制每項價格變動不超過 5%」時的效果。

| 審核狀態 | 項數 |
| --- | ---: |
| 通過假設的 0.5% 匯率觸發及 5% 價格上限 | 0 |
| 因匯率變動低於 0.5% 而暫緩 | 15 |
| 因單項變幅超過 5% 而暫緩 | 0 |

換言之，如採用以上示例門檻，今次不會有任何價格進入可套用名單；但完整的 15 項候選變動仍保留於本報告及 CSV，讓店主決定是否要例外批准。

## 建議變動（未套門檻）

| 店內 SKU | 產品 | 變體／規格 | 現行 Price ID | 現價 | 建議價 | 變幅 | 百分比 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| MH-CAT-CIAO-003 | CIAO とろみ｜鰹魚高湯雞肉鰹魚扇貝濃湯貓罐頭｜單罐 | 單罐 | price_1U8iwXRyM6dRKLtZywWN34fZ | HK$22.90 | HK$23.90 | +HK$1.00 | +4.37% |
| MH-CAT-CIAO-005 | CIAO とろみ｜鰹魚高湯雞肉鮪魚魷魚濃湯貓罐頭｜單罐 | 單罐 | price_1U8iwZRyM6dRKLtZc4a9huRq | HK$22.90 | HK$23.90 | +HK$1.00 | +4.37% |
| MH-CAT-PAMAX-001 | PAMAX Miracle Series 生物酶除味貓砂 2.7kg｜PAMAX Miracle Series Enzyme Odour-Control Cat Litter 2.7kg | 2 包｜5.4kg | price_1U8cU6RyM6dRKLtZIwFymbls | HK$190.90 | HK$191.90 | +HK$1.00 | +0.52% |
| MH-CAT-PAMAX-001 | PAMAX Miracle Series 生物酶除味貓砂 2.7kg｜PAMAX Miracle Series Enzyme Odour-Control Cat Litter 2.7kg | 6 包｜16.2kg | price_1U8cU7RyM6dRKLtZu7s2FINt | HK$472.90 | HK$473.90 | +HK$1.00 | +0.21% |
| MH-CAT-SNR-005 | AIM30 Karitto Treats 酥脆貓咪零食 牧場美味四種綜合包 80g｜AIM30 Karitto Treats 酥脆貓咪零食 牧場美味四種綜合包 80g | 日本包裝規格 | price_1U8e0IRyM6dRKLtZYfKTJ5RW | HK$118.90 | HK$119.90 | +HK$1.00 | +0.84% |
| MH-CAT-SNR-006 | AIM30 Karitto Treats 酥脆貓咪零食 吞拿魚及雞肉雙拼綜合包 80g｜AIM30 Karitto Treats 酥脆貓咪零食 吞拿魚及雞肉雙拼綜合包 80g | 日本包裝規格 | price_1U8e0LRyM6dRKLtZDV8NlhJy | HK$118.90 | HK$119.90 | +HK$1.00 | +0.84% |
| MH-CAT-SNR-007 | AIM30 Karitto Treats 酥脆貓咪零食 吞拿魚及三文魚味 25g｜AIM30 Karitto Treats 酥脆貓咪零食 吞拿魚及三文魚味 25g | 日本包裝規格 | price_1U8e0NRyM6dRKLtZOs14Trkd | HK$118.90 | HK$119.90 | +HK$1.00 | +0.84% |
| MH-CAT-SNR-013 | AIM30 Karitto Treats 酥脆貓咪零食 雞肉味 80g｜AIM30 Karitto Treats Crispy Cat Treats Chicken Flavour 80g | 雞肉味｜80g | price_1U8dzwRyM6dRKLtZ7ujj8KaR | HK$118.90 | HK$119.90 | +HK$1.00 | +0.84% |
| MH-CAT-SNR-015 | AIM30 Karitto Treats 酥脆貓咪零食 鮮魚味 80g｜AIM30 Karitto Treats Crispy Cat Treats Fish Flavour 80g | 鮮魚味｜80g | price_1U8dztRyM6dRKLtZ3WxywbNW | HK$118.90 | HK$119.90 | +HK$1.00 | +0.84% |
| MH-CAT-SNR-016 | AIM30 Karitto Treats 酥脆貓咪零食 魚味四種綜合包 80g｜AIM30 Karitto Treats Crispy Cat Treats Four Fish Flavours Assortment 80g | 魚味四種綜合｜80g | price_1U8dzzRyM6dRKLtZyAr6CctM | HK$118.90 | HK$119.90 | +HK$1.00 | +0.84% |
| MH-CAT-SNR-027 | AIM30 室內成貓 腎臟健康照護 雞肉味乾糧 600g｜AIM30 Indoor Adult Cat Food Kidney Health Care Chicken Flavour 600g | 腎臟健康照護｜雞肉味｜600g | price_1U8fc5RyM6dRKLtZ1foJPEVT | HK$222.90 | HK$223.90 | +HK$1.00 | +0.45% |
| MH-CAT-SNR-028 | AIM30 室內已絕育成貓 雞肉味乾糧 1.2kg｜AIM30 Indoor Spayed and Neutered Adult Cat Food Chicken Flavour 1.2kg | 已絕育成貓｜雞肉味｜1.2kg | price_1U8fcCRyM6dRKLtZhVXn5d9C | HK$417.90 | HK$418.90 | +HK$1.00 | +0.24% |
| MH-LIF-GEN-004 | 高腳平口陶瓷貓咪食盤 250ml｜Raised Flat-Rim Ceramic Cat Bowl 250ml | 魚圖案 | price_1U8bDzRyM6dRKLtZ4X3eofhW | HK$38.90 | HK$39.90 | +HK$1.00 | +2.57% |
| MH-LIF-GEN-004 | 高腳平口陶瓷貓咪食盤 250ml｜Raised Flat-Rim Ceramic Cat Bowl 250ml | 綠葉圖案 | price_1U8bE0RyM6dRKLtZEhY45gCA | HK$38.90 | HK$39.90 | +HK$1.00 | +2.57% |
| MH-LIF-GEN-004 | 高腳平口陶瓷貓咪食盤 250ml｜Raised Flat-Rim Ceramic Cat Bowl 250ml | 羽毛圖案 | price_1U8bE0RyM6dRKLtZMRGdUPd6 | HK$38.90 | HK$39.90 | +HK$1.00 | +2.57% |

## 按品牌及前台分類匯總

| 品牌 | 分類 | 受影響產品 | Price 項數 | 價格差額合計 |
| --- | --- | --- | --- | --- |
| CIAO とろみ | cats | 2 | 2 | HK$2.00 |
| PAMAX | cats | 1 | 2 | HK$2.00 |
| Sunrise AIM30 | cats | 8 | 8 | HK$8.00 |
| 未標示品牌 | lifestyle | 1 | 3 | HK$3.00 |

## 人工批准前的執行與回復安排

若店主日後明確批准某個範圍，實際執行必須另行重新讀取 Stripe、比對這份預覽的舊 Price ID／金額／metadata，並以 Stripe 的不可變 Price 模式建立 replacement Price。流程會完整複製 metadata、保留變體鍵及排序、只在原 Price 為預設價時切換 `Product.default_price`，待逐項讀回驗證後才停用被取代的舊價。每項需寫入 idempotency key 及可回復 manifest。Stripe 的 Price 資源在建立後無法直接改變金額，這也是不能「原地覆寫」的原因。[2]

回復時會以 manifest 逐項重新啟用舊 Price、如有需要把 `default_price` 指回舊 Price，並停用新 replacement Price；回復前也必須先重讀確認，避免覆蓋其後的人手調整或新訂單配置。本輪**尚未**建立這些 replacement Price 或 manifest，因為店主只授權預覽。

## 可供決定的下一步

請選擇一項，屆時才會進入另一輪獨立的寫入前審核：

1. **維持預覽，不改價。**
2. **例外批准本報告列出的 15 項 +HK$1.00**，即使匯率變動低於示例 0.5% 門檻。
3. **只採用門檻政策**（今次結果為 0 項），並指定日後 FX 觸發百分比和每項價格上限。
4. **修改公式或運費定義後重新預覽**；尤其需要先確認 `pricing_ship_to_hk_hkd` 是否已包含在 `cost_cny`。

## 參考資料

[1]: https://frankfurter.dev/docs/ "Frankfurter API Documentation"
[2]: https://docs.stripe.com/api/prices/update "Stripe API – Update a price"
