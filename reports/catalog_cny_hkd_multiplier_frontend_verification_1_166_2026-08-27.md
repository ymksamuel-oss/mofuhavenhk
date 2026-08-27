# Mofu Haven HK 定價更新前台核對（1.166 × 1.76）

**核對時間（UTC）：** 2026-08-27T10:29:22Z 至 2026-08-27T10:29:55Z

## 核對範圍

公開網站首頁 `https://www.mofuhavenhk.com/` 已在完成 Stripe replacement Price 寫入後載入。前台目錄由 Stripe 的活躍 HKD Price 資料生成。

| 核對項目 | 預期／資料來源 | 公開前台觀察 | 結論 |
| --- | --- | --- | --- |
| AIM30 室內高齡貓 11 歲以上 雞肉味乾糧 600g | 已核實的 replacement Price 為 HK$344.90；舊價 HK$356.90 | 首頁「好物持續流動中」公開卡片顯示 HK$344.90 | 通過 |
| Stripe 最終逐項核對 | 138 個 replacement Price、123 個預設價格切換、138 個來源 Price 停用 | `catalog_cny_hkd_multiplier_final_verification_1_166_2026-08-27.json` 逐項核對全部通過 | 通過 |
| 截圖所示 MH-CAT-CIAO-029 | 欠缺可信 CNY 成本，因此不屬於已批准的 138 個 Price 範圍 | 預覽列為 `awaiting_cny_cost`，無任何價格寫入 | 依批准範圍維持原價 |

## 限制

這是公開前台的代表性抽樣核對，而不是對 226 個產品頁逐頁手動瀏覽。最終 Stripe 核對已逐項覆蓋所有 138 個實際更換的 Price；公開網站所見的 AIM30 價格與該 replacement Price 完全一致。

## 詳情頁代表性核對

公開產品詳情頁 `https://www.mofuhavenhk.com/product/prod_V8xXaZ0jwFhqkT` 已於 2026-08-27T10:30:02Z 載入。

| 店內 SKU | 來源 Price | Replacement Price | Stripe 已核對新價 | 公開詳情頁顯示 | 結論 |
| --- | --- | --- | ---: | ---: | --- |
| MH-CAT-SNR-029 | `price_1U8fc2RyM6dRKLtZ3lk0Ei43` | `price_1U90VDRyM6dRKLtZsCZkGfIs` | HK$344.90 | HK$344.90 | 通過 |

該詳情頁可正常顯示產品資訊、數量控制與「加入購物籃」按鈕，沒有進行加入購物籃、結帳或付款操作。
