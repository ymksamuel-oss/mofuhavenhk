# 銀之匙／三ツ星グルメ貓咪乾糧 QA

## 本機驗證日期

2026-08-26（香港時間）

## 已核對項目

| 範圍 | 結果 |
|---|---|
| 產品頁：夾心奶油金槍魚雞里脊 180g | 顯示兩個真正配方選擇：金槍魚・雞里脊味、魚肉・雞里脊三拼；兩者均為 HK$99.90。 |
| 配方切換 | 點選「魚肉・雞里脊三拼」後，產品頁切換至獨立 Stripe Product `prod_V8th4gMOUDUrzu`，並更新產品名稱、描述及 CDN 主圖網址。 |
| 圖片載入 | 產品頁 `img` 已完成載入，natural size 為 640 × 640、visibility=visible、opacity=1；圖片由 Next Image 優化路徑載入對應 files.manuscdn.com 主圖。 |
| 嚴格分類 | `/categories/cats/dry-food` 顯示十款新銀之匙乾糧，連同現有 COMBO 貓乾糧；沒有混入貓罐罐、貓零食、狗狗或生活用品。 |
| 特殊配方分組 | 幼貓、10歲起腎臟健康維護、毛球護理及餐後吐毛輕減配方保留獨立產品，沒有被納入普通成貓配方按鈕。 |
| 日常配方分組 | 僅日常夾心奶油 180g 與日常鮮旨香 192g 各自建立雙配方切換群組。 |

## Stripe 與價格

共建立 10 個 active Stripe Product 及 10 個 active HKD Price。毛球護理 240g 以使用者截圖所示的 ¥44.80 成本計算，建議零售 HK$95.90；其餘九款的來源成本為 ¥46.80，建議零售均為 HK$99.90。所有產品保留 `category=cats` 及 `subcategory=貓乾糧` metadata；所有價格保持由 Stripe Price ID 及伺服器端結帳重建作為付款權威。

## 未進行的操作

未建立、提交或付款任何 Stripe Checkout Session。

## 自動化驗證

銀之匙上架腳本已在首次建立十款產品及十個 HKD Price 後重跑；第二次輸出均重用既有 Product／Price，沒有建立重複項目。`npm test` 共 49 項通過；`npm run validate:products` 通過；`npm run build` 通過。建置過程有既有遠端圖片 TLS retry 訊息，但最後編譯、靜態頁生成及 trace 收集均成功完成。
