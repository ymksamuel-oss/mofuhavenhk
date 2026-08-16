# Mofu Haven HK

Mofu Haven（毛毛港）是以繁體中文／英文呈現的香港日本寵物用品網店，採用 Next.js 16、React 19、TypeScript strict mode 及 Tailwind CSS 4。介面沿用日系奶茶色設計 tokens；付款及通知流程保留 Stripe、Apple Pay、WeChat Pay、AlipayHK 與 WhatsApp 現有整合。

## 產品目錄

Google Sheet 是唯一產品主源。瀏覽目錄、分類頁、動態產品詳情、快速檢視、全站搜尋、購物車、結帳、Stripe PaymentIntent、收據及訂單通知全部使用同一份伺服器載入的 catalog。Stripe 與通知 API 會按該 catalog 在伺服器重新建立價錢及庫存，不信任瀏覽器傳入的價格。

網站不保留 hardcoded、mock 或 sample 產品資料。Sheet 下載、解析失敗或沒有有效商品時，catalog 會回傳空陣列並顯示 Empty State；不會展示舊產品。

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

Server 會直接讀取 Google Sheet CSV，使用每行的 `商品 ID`、`主分類代碼`、圖片、名稱、介紹、庫存及價錢建立完整 catalog；不會使用程式內靜態商品作 fallback。任何 Sheet 修改或刪除均會在下一個 request 直接反映。

Parser 會自動掃描前 20 個非空白行尋找表頭，所以第一行可以保留例如 `Mofu Haven HK | 178 項完整商品目錄` 嘅大標題，而第二行先放真正欄位。

建議表格格式：

```csv
Mofu Haven HK | 178 項完整商品目錄
商品 ID,主分類代碼,中文商品名稱,英文商品名稱,售價 (HKD),原價 (HKD),庫存狀態,中文描述,英文描述,本地圖片路徑,來源圖片 URL
dog-food-1-5kg,dogs,日本天然狗糧 1.5kg,Japanese Natural Dog Food 1.5kg,HK$100.00,,在售,日本配方天然狗糧。,Japanese-formula natural kibble.,/products/dog-food-1-5kg.webp,
```

亦支援英文欄位名稱：

```csv
id,categorySlug,title,titleEn,price,originalPrice,inStock,description,descriptionEn,image,sourceImageUrl
dog-food-1-5kg,dogs,日本天然狗糧 1.5kg,Japanese Natural Dog Food 1.5kg,100,,true,日本配方天然狗糧。,Japanese-formula natural kibble.,/products/dog-food-1-5kg.webp,
```

- Parser 會掃描前 20 個非空白行，所以第一行可以保留大標題，第二行才放欄位名稱。
- 必須有 ID、主分類代碼、圖片、名稱、介紹、庫存及售價欄位；`originalPrice`／`原價 (HKD)` 選填。
- `主分類代碼` 必須為 `cats`、`dogs`、`snacks`、`toys`、`health`、`cleaning`、`deals`、`bestsellers` 或 `outdoor`。
- 中文／英文名稱可只填其中一種，缺少的語言會使用另一種；介紹欄位可以留空，留空即網站不顯示舊介紹。
- 圖片可填 `/products/...` 或 `/images/...` 本地 public 路徑，亦可填 `http://`／`https://` 遠端圖片。危險相對路徑、`..`、反斜線及 protocol-relative URL 會被拒絕。
- 庫存值接受 `true/false`、`1/0`、`yes/no`、`有貨/售罄`、`在售/停售`、`上架/下架`。
- 價錢會自動移除 `HK$`、`$`、逗號及空格等非數字格式，例如 `HK$ 1,234.50` 會解析成 `1234.5`。
- 重複 ID、下載／CSV 錯誤或無有效資料時，catalog 會是空陣列；網站不會回退到程式內產品。
- catalog fetch 使用 `no-store`；每次 server request 都直接讀取 Sheet，毋須 rebuild 或手動清 cache。

程式已將原有「102 項保留商品核心目錄」分頁設為預設 CSV 來源，毋須填寫 `gid`：

```bash
GOOGLE_SHEET_CSV_URL=https://docs.google.com/spreadsheets/d/1zTZxk-cidcgcmGsM79jMQD72Fznmd7CfAQNS79pp6i0/export?format=csv
```

即使 Netlify 未設定 `GOOGLE_SHEET_CSV_URL`，server 亦會使用以上固定 URL。日後如要改用另一份 Sheet，先需要用環境變數覆蓋；亦可分開設定：

```bash
GOOGLE_SHEET_ID=your_spreadsheet_id
GOOGLE_SHEET_GID=0
```

`GOOGLE_SHEET_CSV_URL` 存在時會優先使用。首次加入或改動環境變數後要重新部署；其後 Sheet 的商品新增、修改及刪除會在下一個 server request 生效，毋須改程式碼或重新部署。

## 驗證

```bash
npm run validate:products
```

驗證會確認空目錄維持空陣列，以及空白 Google Sheet 不會產生產品資料。

## 本地開發

```bash
npm install
npm run dev
```

開啟 `http://localhost:3000`；`/menu` 是完整產品目錄，`/product/<id>` 是動態產品詳情，`/checkout` 是購物車與付款流程。
