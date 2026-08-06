# Mofu Haven HK

Mofu Haven（毛毛港）是以繁體中文／英文呈現的香港日本寵物用品網店，採用 Next.js 16、React 19、TypeScript strict mode 及 Tailwind CSS 4。介面沿用日系奶茶色設計 tokens；付款及通知流程保留 Stripe、Apple Pay、WeChat Pay、AlipayHK 與 WhatsApp 現有整合。

## 產品目錄

目前統一目錄共有 **166 筆產品**。`src/lib/products.ts` 匯出的 `PRODUCTS` 是店面所有產品功能的共同權威輸出，資料由以下受控來源組裝及分類：

- `src/lib/products.ts`：手寫店面商品。
- `src/data/productsData.ts`：39 筆 WT Japan 貓罐、乾糧及冷凍脫水商品。
- `src/data/catSnacksData.ts`：34 筆 WT Japan 貓小食。
- `public/wt_japan_products.json`：5 筆 WT Japan 狗小食；這是唯一保留的狗商品 JSON。

每組 WT Japan 資料只會在 `PRODUCTS_RAW` 加入一次，並由 `classifyCatalogProducts()` 統一分類。瀏覽目錄、分類頁、動態產品詳情、購物車、結帳、Stripe PaymentIntent、訂單通知及全站搜尋均使用同一 `PRODUCTS` 集合；不再存在客戶端 `fetch('/wt_japan_products.json')` 或手動 merge 旁路。

統一 `Product` 格式涵蓋 ID、中英文名稱、售價／原價、分類／子分類、本地圖片、中英文描述、規格、tags、系列、品牌、供應商、product type、handle、來源分類、來源頁、來源圖片、適用品種及 `inStock`。五筆狗商品使用 `public/images/products/wt-japan-001.webp` 至 `wt-japan-005.webp` 的穩定本地圖片。一般手寫商品圖片位於 `public/products/`；圖片治理記錄位於 `public/products/ATTRIBUTION.json`。

## 搜尋與庫存規則

`src/lib/searchProducts.ts` 搜尋完整 166 筆 `PRODUCTS`，索引：

- ID、中英文名稱及描述
- 分類、子分類、品牌、供應商及系列
- tags、specs、product type、handle 及來源分類
- 適用品種 slug 與中英文品種名稱

搜尋建議使用統一 `Product` 欄位，顯示本地圖片、中英文名稱、價格、品牌／系列及適用時的「售罄／Sold out」標籤，並保留桌面鍵盤導覽、ARIA 與手機搜尋 modal。

`inStock === false` 會在所有購買路徑生效：

- 商品卡、列表、快速檢視及詳情頁不能加入購物車；數量步進器禁用。
- 詳情頁不能透過結帳 CTA 繼續購買，並顯示雙語缺貨說明。
- `sanitizeLines()` 會在讀取舊 localStorage 時移除不存在或缺貨商品並合併重複行。
- `addItem()` 拒絕不存在或缺貨商品；`setQty()` 遇到這些商品會移除該行。
- `getOrderItems()` 不會預選缺貨商品。
- `buildOrderItemsFromLines()` 會排除不存在／缺貨商品、合併重複 SKU、限制每個 SKU 最多 20 件，並以伺服器目錄價格重建項目。Stripe PaymentIntent 與訂單通知 API 共用此防線。

## 驗證

資料完整性驗證直接編譯並執行真實 `PRODUCTS` 與搜尋／訂單模組，不以文字正則代替執行結果：

```bash
npm run validate:products
```

驗證涵蓋：166 筆產品、ID 唯一、必填欄位、中英文名稱、合理價格／原價、所有本地圖片存在、166/166 搜尋覆蓋、四筆已批准實驗商品不存在、五筆狗商品完整且分類／圖片正確、單一狗 JSON、無動態 fetch，以及伺服器訂單重建規則。

完整交付檢查：

```bash
npx tsc --noEmit
npm run lint
npm run validate:products
npm run build
```

## 本地開發

```bash
npm install
npm run dev
```

開啟 `http://localhost:3000`；`/menu` 是完整產品目錄，`/product/<id>` 是動態產品詳情，`/checkout` 是購物車與付款流程。

`scripts/fetch_real_product_photos.py` 只管理 `src/lib/products.ts` 內明確使用 `/products/<id>.webp` 的手寫 SKU，不會覆寫由 `src/data/` 或 `public/wt_japan_products.json` 匯入的 WT Japan 本地圖片。
