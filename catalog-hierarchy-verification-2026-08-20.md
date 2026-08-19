
## Preview 驗證

- Desktop `/products`：顯示 3 個主分類按鈕「貓咪商品／狗狗商品／小寵物商品」，不再渲染舊的全部商品分類列。
- Desktop `/products?category=cat`：貓咪主分類 active，顯示 71 件，並出現 5 個子分類按鈕：貓罐頭／濕糧、乾糧／主食糧、貓砂／清潔用品、貓咪零食／凍乾、用品／玩具／保健。
- Desktop `/products?category=cat-wet-food`：顯示 8 件貓咪濕糧商品。
- Desktop `/products?category=dog`：狗狗主分類 active，顯示 14 件，並出現 4 個狗狗子分類按鈕。
- Desktop `/products?category=dog-treats`：顯示 14 件狗狗零食／骨頭商品。
- Desktop `/products?category=small-pets`：小寵物主分類 active，顯示 6 件，並出現 3 個小寵物子分類按鈕。
- Desktop `/products?category=small-pet-supplies`：顯示 6 件墊材／用品相關商品。
- Mobile 390px：主分類及選中主分類的子分類列均可在商品列表頂部水平瀏覽，搜尋框及商品卡片正常顯示；手機版沒有出現舊的 legacy 全部商品按鈕。

## 最終路由清理與建置

- Header 產品／搜尋入口、SubBanner CTA 及 CheckoutReturn「繼續購物」均已改為 `/products`，不再產生新的 `category=all` URL。
- 最終 Vitest：7 個 test files、32 tests 全部通過。
- 最終 production build：Vite client 及 server bundle 均成功完成；只保留既有資產解析提示及 chunk size warning，沒有編譯錯誤。

路由清理後的 390px Preview 顯示 `/products` 商品目錄及 `/checkout/return?status=cancelled` 返回頁均正常；結帳返回頁的「繼續購物」按鈕已對應新 `/products` 根路由。
