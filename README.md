# Mofu Haven HK

Mofu Haven（毛毛港）是以繁體中文／英文呈現的香港日本寵物用品網店，採用 Next.js 16、React 19、TypeScript strict mode 及 Tailwind CSS 4。介面沿用日系奶茶色設計 tokens；付款及通知流程保留 Stripe、Apple Pay、WeChat Pay、AlipayHK 與 WhatsApp 現有整合。

## 產品目錄

目前統一目錄共有 **114 筆產品**。`src/lib/products.ts` 匯出的 `PRODUCTS` 定義商品 ID、分類、tags、規格等結構資料，亦是 Google Sheet 失效時的完整安全 fallback。正常運作時，五項客戶可見及交易相關欄位會由 Google Sheet 統一提供：

- Image：產品圖片
- Title：中英文產品名稱
- Description：中英文詳細介紹（可留空）
- Stock：庫存／上架狀態
- Price：售價及選填原價

瀏覽目錄、分類頁、動態產品詳情、快速檢視、全站搜尋、購物車、結帳、Stripe PaymentIntent、收據及訂單通知全部使用同一份伺服器合併後 catalog。Stripe 與通知 API 會按該 catalog 在伺服器重新建立價錢及庫存，不信任瀏覽器傳入的價格。

Sheet 只需讀取，不會由網站寫回。新增或刪除商品 ID、改分類／規格等結構資料仍需程式更新；現有 114 個 ID 的五類展示／交易欄位則全部由 Sheet 管理。

新增的「投藥餵藥專用小食」在貓咪及狗狗商品各有 6 款，可透過以下固定路徑瀏覽：

- `/categories/cats/pill-treats`
- `/categories/dogs/pill-treats`

12 款商品全部使用 `/products/<商品-id>.webp` 穩定本地路徑。ZIP 內可可靠對應的 4 張產品圖已使用原圖；其餘 8 張因 ZIP 沒有精確品牌／口味對應，暫時沿用中性小食圖，待同名正確圖片直接覆蓋即可，毋須再修改商品資料。

## 搜尋與庫存規則

`src/lib/searchProducts.ts` 搜尋完整 114 筆合併後 catalog，索引：

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

## Google Sheet 單一主源

Server 會讀取以下 Google Sheet CSV，按 `商品 ID` 對應現有 114 個商品，並一次過套用圖片、名稱、介紹、庫存及價錢。只要 Sheet 完整通過驗證，這五類欄位就以 Sheet 為唯一主源；程式內舊值只會在整份 Sheet 失效時作 fallback。

Parser 會自動掃描前 20 個非空白行尋找表頭，所以第一行可以保留例如 `Mofu Haven HK | 114 項保留商品核心目錄` 嘅大標題，而第二行先放真正欄位。

建議表格格式：

```csv
Mofu Haven HK | 114 項保留商品核心目錄
商品 ID,中文商品名稱,英文商品名稱,售價 (HKD),原價 (HKD),庫存狀態,中文描述,英文描述,本地圖片路徑,來源圖片 URL
dog-food-1-5kg,日本天然狗糧 1.5kg,Japanese Natural Dog Food 1.5kg,HK$100.00,,在售,日本配方天然狗糧。,Japanese-formula natural kibble.,/products/dog-food-1-5kg.webp,
```

亦支援英文欄位名稱：

```csv
id,title,titleEn,price,originalPrice,inStock,description,descriptionEn,image,sourceImageUrl
dog-food-1-5kg,日本天然狗糧 1.5kg,Japanese Natural Dog Food 1.5kg,100,,true,日本配方天然狗糧。,Japanese-formula natural kibble.,/products/dog-food-1-5kg.webp,
```

- Parser 會掃描前 20 個非空白行，所以第一行可以保留大標題，第二行才放欄位名稱。
- 必須有 ID、圖片、名稱、介紹、庫存及售價欄位；`originalPrice`／`原價 (HKD)` 選填。
- `商品 ID` 必須同 `src/lib/products.ts` 的既有 ID 完全一致。114 個既有 ID 必須全部有一筆有效資料。
- 中文／英文名稱可只填其中一種，缺少的語言會使用另一種；介紹欄位可以留空，留空即網站不顯示舊介紹。
- 圖片可填 `/products/...` 或 `/images/...` 本地 public 路徑，亦可填 `http://`／`https://` 遠端圖片。危險相對路徑、`..`、反斜線及 protocol-relative URL 會被拒絕。
- 庫存值接受 `true/false`、`1/0`、`yes/no`、`有貨/售罄`、`在售/停售`、`上架/下架`。
- 價錢會自動移除 `HK$`、`$`、逗號及空格等非數字格式，例如 `HK$ 1,234.50` 會解析成 `1234.5`。
- 重複 ID、下載／CSV 錯誤、缺少任何既有商品、或任何既有商品的必要欄位無效時，整份 catalog 會退回靜態 `PRODUCTS`；不會把部分 Sheet 商品同部分舊資料混合。
- 預設快取 60 秒。設定 `GOOGLE_SHEET_CACHE_SECONDS=0` 可每次 server request 重新讀取；舊的 `GOOGLE_SHEET_PRICE_CACHE_SECONDS` 仍兼容。

程式已將原有「102 項保留商品核心目錄」分頁設為預設 CSV 來源，毋須填寫 `gid`：

```bash
GOOGLE_SHEET_CSV_URL=https://docs.google.com/spreadsheets/d/1zTZxk-cidcgcmGsM79jMQD72Fznmd7CfAQNS79pp6i0/export?format=csv
```

即使 Netlify 未設定 `GOOGLE_SHEET_CSV_URL`，server 亦會使用以上固定 URL。日後如要改用另一份 Sheet，先需要用環境變數覆蓋；亦可分開設定：

```bash
GOOGLE_SHEET_ID=your_spreadsheet_id
GOOGLE_SHEET_GID=0
GOOGLE_SHEET_CACHE_SECONDS=60
```

`GOOGLE_SHEET_CSV_URL` 存在時會優先使用。首次加入或改動環境變數後要重新部署 Netlify；之後 Sheet 五類欄位會按快取時間自動更新，毋須再次改程式碼。

加入本批 12 款商品後，Google Sheet 必須補上相同 12 個商品 ID，令有效資料由 102 行增至 114 行；未補齊之前，完整覆蓋檢查會按設計退回 114 款靜態 catalog，避免新舊資料混合。

## 驗證

資料完整性驗證直接編譯並執行真實 `PRODUCTS` 與搜尋／訂單模組，不以文字正則代替執行結果：

```bash
npm run validate:products
```

驗證涵蓋：114 筆產品、ID 唯一、必填欄位、中英文名稱、合理價格／原價、所有靜態 fallback 圖片存在、114/114 搜尋覆蓋、貓狗各 6 款投藥餵藥專用小食、Sheet 第二行中文表頭、五類欄位覆蓋、遠端圖片、空白介紹、價錢格式清理、不安全圖片路徑、重複 ID、fallback 不變性，以及伺服器訂單重建規則。

完整交付檢查：

```bash
./node_modules/.bin/tsc --noEmit
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
