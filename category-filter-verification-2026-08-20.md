# Mofu Haven 分類篩選全量驗證紀錄

驗證日期：2026-08-20

## 商品快照分類結果

| Canonical category | 結果數量 | 驗證結論 |
|---|---:|---|
| all | 91 | 通過，完整商品目錄 |
| cats | 71 | 通過 |
| dogs | 17 | 通過 |
| treats | 61 | 通過，包含狗狗／貓咪零食但不回退至全部商品 |
| wet-cans | 9 | 通過，包含 CIAO 貓罐罐 |
| toys | 0 | 正確空狀態 |
| supplements | 12 | 通過 |
| small-pets | 6 | 通過 |
| deals | 0 | 正確空狀態 |
| bestsellers | 1 | 通過 |
| outdoor | 1 | 通過 |

## 前端／後端驗證

首頁分類卡及 `/products` 分類列使用 canonical `treats`、`cats`、`dogs` 等參數；後端接受 canonical 或舊版字串，並透過 `normalizeRequestedCategory` 統一映射。`snacks`、`snack`、`寵物零食`、`寵物小食`、`狗狗小食`、`貓咪小食` 均映射至 `treats`。

自動化回歸測試已逐一遍歷 11 個分類，確認每個結果集合只包含對應 category；空分類 `toys` 與 `deals` 保持正確空狀態。全套 Vitest 通過：5 個 test files、24 個 tests。

## 搜尋相關回歸

「罐罐」會展開匹配「罐頭」、「主食罐」、「副食罐」、「濕糧」、「濕食」及「濕罐」，並排除會把狗狗小食誤導成罐頭的舊版 `SubCategory`、`child_category`、`type`、`slug` 等技術欄位。「雞肉」會匹配雞胸肉、雞柳、雞肉味、雞肝、雞腎及雞冠等常見寫法。

## 前端 Preview 逐一驗證

已以 1280×720 Preview 逐一開啟以下 11 個商品頁 URL，確認分類列中相應按鈕呈現選中奶茶色狀態，右側數量與列表／空狀態一致：

| URL category | Preview 結果 |
|---|---|
| all | 顯示 91 件 |
| cats | 顯示 71 件 |
| dogs | 顯示 17 件 |
| treats | 顯示 61 件 |
| wet-cans | 顯示 9 件 |
| toys | 顯示 0 件及正確空狀態 |
| supplements | 顯示 12 件 |
| small-pets | 顯示 6 件 |
| deals | 顯示 0 件及正確空狀態 |
| bestsellers | 顯示 1 件 |
| outdoor | 顯示 1 件 |

截圖批次涵蓋 `/products?category=all|cats|dogs|treats|wet-cans|toys|supplements|small-pets|deals|bestsellers|outdoor`。實際畫面亦確認分類按鈕在搜尋框上方，並未因搜尋同義詞或前端防抖而重複或失去選中狀態。

## 首頁 CategoryGrid 點擊驗證

瀏覽器在首頁檢出 11 個可互動分類卡，href 逐一指向 canonical `/products?category=...`。已實際點擊「全部商品」分類卡，成功導航至 `/products?category=all`，頁面顯示「目前顯示 91 件／共 91 件」，並以「全部商品」按鈕呈現 active 狀態。

已實際點擊首頁「貓咪商品」分類卡，成功導航至 `/products?category=cats`；商品頁分類列顯示貓咪商品為 active，並載入貓咪商品結果。首頁重新載入後仍檢出全部 11 個分類卡及正確 canonical href。

已實際點擊首頁「狗狗商品」分類卡，成功導航至 `/products?category=dogs`；頁面顯示「目前顯示 17 件／共 91 件」，狗狗商品按鈕呈 active，列表內容為狗狗商品。

已實際點擊首頁「寵物零食」分類卡，成功導航至 `/products?category=treats`；頁面顯示「目前顯示 61 件／共 91 件」，寵物零食按鈕呈 active，列表載入狗狗及貓咪零食商品而非全目錄。

已實際點擊首頁「貓咪罐罐」分類卡，成功導航至 `/products?category=wet-cans`；頁面顯示「目前顯示 9 件／共 91 件」，結果集合均為 CIAO 罐罐／鮮肉杯商品，未混入一般狗狗商品。
