# CIAO／Inaba 新罐頭批次 QA

## 本機前台驗證

| 項目 | 結果 |
| --- | --- |
| 代表產品 | CIAO とろみ 鮪魚魷魚濃湯貓罐頭（CIC-01） |
| Stripe Product | `prod_V90yLm2ySqOvLR` |
| 正確售價 | HK$25.90 |
| 分類 | 貓咪商品 → 貓罐罐 |
| 圖片 | 一張已清理 CDN 主圖；首次請求短暫延遲後已正常載入，沒有供應平台介面或水印 |
| 商品狀態 | 現貨；可正常加入購物籃 |

## Stripe 回查

28 款可確認成本產品均已逐項驗證其 exact import key、貓罐罐分類、庫存 metadata、唯一 CDN 圖片、default HKD Price 與公式計算價格。重跑 preflight 後為 0 新建 Product、0 新建 Price、28 重用 Price，確認匯入器冪等。

## 暫不處理來源

`IMG_1786.PNG`、`IMG_1790.PNG`、`IMG_1802.PNG`、`IMG_1803.PNG`、`IMG_1805.PNG`、`IMG_1808.PNG` 因成本未能確認，按用戶指示未建立產品或價格。`IMG_1815.PNG` 已合併至與 `IMG_1812.PNG` 相同的 CIC-24，未重複建立。

## 嚴格分類頁驗證

本機 `/categories/cats/wet-cans?ciao-inaba=local` 已顯示新批次的 CIAO 濃湯罐頭及 Inaba 85g 罐頭，例如 CIC-03（HK$22.90）、CIC-26（HK$14.90）、CIC-22（HK$33.90）及 CIC-27（HK$62.90）。頁面內容僅為「罐罐／濕糧」項目；新批次沒有進入乾糧或小食分類。

## 缺貨保護

CIC-10（來源標示缺貨）以 direct product URL 讀取時由 storefront catalog 排除並返回 404；因此不會出現在商品目錄或提供加入購物籃按鈕。Stripe Product／Price 仍保留供日後補貨時沿用，無需重建價格。CIC-19 採用相同 `in_stock=false` 規則。

## 購物籃驗證

Inaba かつまぐろ 鮪魚貓罐頭 85g（CIC-24）本機商品頁已確認主圖、現貨標籤及 HK$14.90。按「加入購物籃」後，購物籃計數由 4 增至 5，按鈕顯示「已加入購物籃 ✓」；未進入付款、未提交訂單、未建立 Stripe Checkout Session。

## 正式部署驗證

既有 Vercel production 網址已確認 CIC-01 正確呈現：`https://mofuhavenhk.vercel.app/product/prod_V90yLm2ySqOvLR?ciao-inaba=7f4a60e4`。商品頁顯示已清理的 CIAO 主圖、名稱「鮪魚魷魚濃湯貓罐頭」、HK$25.90、現貨及「貓罐罐」規格狀態；主圖在首次遠端請求的短暫延遲後正常載入。
