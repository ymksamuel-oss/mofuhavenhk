# 全站固定倍率定價方程式 — 唯讀更新預覽

**產生時間（UTC）：** 2026-08-27T04:19:18.433330+00:00
**狀態：** **唯讀預覽及待批准清單**。沒有建立、更新或停用任何 Stripe Price，沒有更新 Product metadata，亦沒有改變網站前台售價。

## 指定定價方程式

> **HKD 零售價 = 向上取整至 `.90`（CNY 成本 × 1.1654 × 1.76）**

匯率 `1.1654` 及倍率 `1.76` 均按店主今輪指示固定，沒有使用匯率輪詢或自動排程。`cny_hkd_multiplier_pricing_policy.py` 已把這一條規則集中為可重用函式；日後新產品在輸入正確的每個 Price／變體 CNY 成本時，匯入流程應呼叫同一函式，避免手動重複方程式。

## 全站覆蓋結果

| 範圍 | 結果 |
| --- | ---: |
| 活躍 Stripe Product | 226 |
| 活躍 HKD Price（Stripe 全帳戶） | 399 |
| 隸屬這 226 件活躍 Product 的活躍 HKD Price | 255 |
| 指向非活躍／缺失 Product 的遺留活躍 Price | 144 |
| 有可信 CNY 成本並成功計算 | 150 Price／135 件產品 |
| 缺可信 CNY 成本，保留待輸入 | 105 Price／91 件產品 |
| 目前前台可售且可安全進入 replacement manifest 的 Price | 130 |
| Product 定價政策 metadata 容量受阻的有成本 Price | 8 |
| 方程式已等於目前售價，不需 replacement | 12 |

這個全站清單已涵蓋 **226 件活躍產品及其所有 255 項連結 Price**。144 項未連結至任何活躍 Product 的歷史／遺留 Price 只列為帳戶審計例外，不屬於前台產品，也沒有放入更新範圍。

## 成本資料來源與 91 件待處理項目

| 成本來源 | 已計算 Price |
| --- | ---: |
| 已在活躍 Stripe Price metadata 核實 `cost_cny` | 121 |
| 以供應商 SKU 從已核實本機對照檔找回 | 29 |
| **尚未有可信 CNY 成本** | **105** |

91 件缺成本的產品及其 105 項 Price 不會被倒推、猜測或加入更新 manifest。請使用已交付的 `cny_cost_input_template_91_2026-08-27.xlsx` 逐 Price 填入 CNY 成本及來源；填妥後必須重新生成預覽，才可安全納入全站更新。

## 售價變動摘要（有成本的 150 項 Price）

| 結果 | Price 數 | 說明 |
| --- | ---: | --- |
| 可安全進入待批准 replacement 清單的建議調整 | 130 | 全部為下調，因新固定倍率低於現時已設定售價。 |
| 因 Product metadata 容量而暫緩 | 8 | 已計算，但不會列入更新清單。 |
| 維持原價 | 12 | 按新方程式及 `.90` 取整後相同。 |
| 建議上調 | 0 | 無。 |
| 建議下調 | 130 | 合計 HK$-528.00；中位數 HK$-2.00；最大單項下調 HK$-16.00。 |
| 單項變幅 | — | 由 -6.71% 至 -2.13%。 |

| 品牌 | 有成本 Price | 擬議調整 Price | 擬議變動總額 |
| --- | --- | --- | --- |
| Sunrise AIM30 | 33 | 33 | HK$-152.00 |
| 銀之匙／三ツ星グルメ | 20 | 20 | HK$-71.00 |
| Purina Mon Petit | 14 | 14 | HK$-30.00 |
| 未標示品牌 | 13 | 13 | HK$-22.00 |
| CIAO | 12 | 12 | HK$-12.00 |
| COMBO Pure | 12 | 12 | HK$-97.00 |
| CIAO とろみ | 10 | 8 | HK$-8.00 |
| COMBO | 8 | 8 | HK$-98.00 |
| Inaba かつまぐろ | 6 | 1 | HK$-2.00 |
| Complete ytt | 5 | 5 | HK$-9.00 |
| 銀之匙 | 5 | 0 | HK$0.00 |
| PETLINE | 4 | 0 | HK$0.00 |
| PAMAX | 3 | 3 | HK$-24.00 |
| S.T. ニャンとも清潔トイレ | 3 | 0 | HK$0.00 |
| SNAPPY | 1 | 1 | HK$-3.00 |
| Unicharm Deotoilet | 1 | 0 | HK$0.00 |

## 最大 10 項擬議下調

| 店內 SKU | 產品 | 規格 | 現價 | 方程式建議價 | 差額 | 變幅 |
| --- | --- | --- | --- | --- | --- | --- |
| MH-DOG-COMBO-013 | COMBO 捲心菜牛肉狗狗乾糧 720g｜COMBO Cabbage & Beef Dry Dog Food 720g | 720g（4 小包裝） | HK$249.90 | HK$233.90 | HK$-16.00 | -6.40% |
| MH-DOG-COMBO-014 | COMBO 牛肉小魚乾芝士蔬菜狗狗乾糧 720g｜COMBO Beef, Dried Small Fish, Cheese & Vegetable Blend Dry Dog Food 720g | 720g（4 小包裝） | HK$249.90 | HK$233.90 | HK$-16.00 | -6.40% |
| MH-DOG-COMBO-015 | COMBO 馬蘇里拉芝士角切狗狗乾糧 720g｜COMBO Mozzarella Cheese Cubes Dry Dog Food 720g | 720g（4 小包裝） | HK$249.90 | HK$233.90 | HK$-16.00 | -6.40% |
| MH-DOG-COMBO-016 | COMBO 低脂小魚乾雞肉狗狗乾糧 720g｜COMBO Low-Fat Dried Small Fish & Chicken Dry Dog Food 720g | 720g（4 小包裝） | HK$249.90 | HK$233.90 | HK$-16.00 | -6.40% |
| MH-DOG-COMBO-017 | COMBO 低脂 7歲以上狗狗乾糧 720g｜COMBO Low-Fat Senior Dry Dog Food 720g | 720g（4 小包裝；7 歲以上） | HK$249.90 | HK$233.90 | HK$-16.00 | -6.40% |
| MH-CAT-PAMAX-001 | PAMAX Miracle Series 生物酶除味貓砂 2.7kg｜PAMAX Miracle Series Enzyme Odour-Control Cat Litter 2.7kg | 6 包｜16.2kg | HK$472.90 | HK$457.90 | HK$-15.00 | -3.17% |
| MH-CAT-SNR-028 | AIM30 室內已絕育成貓 雞肉味乾糧 1.2kg｜AIM30 Indoor Spayed and Neutered Adult Cat Food Chicken Flavour 1.2kg | 已絕育成貓｜雞肉味｜1.2kg | HK$417.90 | HK$404.90 | HK$-13.00 | -3.11% |
| MH-CAT-SNR-025 | AIM30 室內成貓 雞肉味乾糧 600g｜AIM30 Indoor Adult Cat Food Chicken Flavour 600g | 雞肉味｜600g | HK$356.90 | HK$344.90 | HK$-12.00 | -3.36% |
| MH-CAT-SNR-026 | AIM30 室內成貓 鮮魚味乾糧 600g｜AIM30 Indoor Adult Cat Food Fish Flavour 600g | 鮮魚味｜600g | HK$356.90 | HK$344.90 | HK$-12.00 | -3.36% |
| MH-CAT-SNR-029 | AIM30 室內高齡貓 11 歲以上 雞肉味乾糧 600g｜AIM30 Indoor Senior Cat Food 11+ Chicken Flavour 600g | 11 歲以上｜雞肉味｜600g | HK$356.90 | HK$344.90 | HK$-12.00 | -3.36% |

## Stripe 手續費與「50% 淨毛利」核對

Stripe 香港官方標準本地卡收費為每筆成功交易 **3.4% + HK$2.35**；國際卡及貨幣兌換另有附加費。[1]

本預覽完全按指定的 `× 1.76` 方程式出價，**沒有再額外加一次 Stripe 手續費或包裝／物流雜費**，以免自行改寫店主已指定的倍率。報告中只以 `3.4% + HK$2.35` 作單件結帳的估算檢查；未假設國際卡、貨幣兌換、退款、爭議費、折扣、運費或多件同單分攤。

重要限制是：固定倍率 `1.76` 在未計 Stripe 固定費前，成本毛利約為 `1 − 1/1.76 = 43.18%`；再扣除 3.4% 及 HK$2.35 後，**不可能保證 50% 淨毛利**。本次有成本 Price 的單件本地卡費估算後淨毛利約為 **23.18% 至 39.33%**，中位數約 **36.30%**。因此，如「嚴格鎖定 50% 淨毛利」仍是必須目標，需先確認一條不同的方程式及固定費分攤假設，再重新預覽；不可把兩套規則視為相同。

## 待批准的更新清單與回復要求

`catalog_cny_hkd_multiplier_pending_approval_manifest_2026-08-27.json` 是**不可直接執行**的待批准清單，共 130 項可安全處理的擬議 replacement Price，以及 129 件 Product 的定價政策 metadata 操作。完整保留每項舊／新 cents、Product ID、Price ID、店內 SKU、變體、成本來源及原 Price metadata。另有 6 件 Product 因欄位容量而明確排除。其完整性 SHA-256 為 `d2be39cf9d5911ef94846cac9ffed698ff4fd93f1b0491edb27d35c110b7826c`。

如店主日後批准指定範圍，真正寫入時必須重新讀取 Stripe，再逐項核對舊 Price 仍屬活躍、金額未變、仍為前台可售 Price、成本及 metadata 容量未變；其後才可建立 replacement Price、複製必要 metadata、切換 `default_price`（如適用）、停用原 Price，並輸出含 replacement ID 的獨立回復 manifest。**這些寫入步驟本輪沒有執行。**

## 下一步

請先核對附件中的 130 項可安全調價清單及 6 件容量受阻產品，並確認下列其中一項：

1. 只保留預覽；
2. 批准指定 SKU／Price 的固定倍率結果；
3. 先填妥 91 件的 CNY 成本，重跑完整 226 件預覽；或
4. 將目標改回「扣 Stripe 後嚴格 50% 淨毛利」，並提供每件包裝／物流成本及 HK$2.35 的分攤方式後重算。

未有明確批准範圍前，所有 Stripe Price、Product metadata 與前台售價維持不變。

## 參考資料

[1]: https://stripe.com/hk/pricing "Stripe 香港定價：本地卡每筆成功交易 3.4% + HK$2.35"
