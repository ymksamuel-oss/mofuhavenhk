# Mofu Haven HK

Mofu Haven（毛毛港）是以繁體中文／英文呈現的香港日本寵物用品網店，採用 Next.js 16、React 19、TypeScript strict mode 及 Tailwind CSS 4。介面沿用日系奶茶色設計 tokens；付款及通知流程只保留信用卡、Apple Pay、Google Pay、PayMe、AlipayHK 及 WhatsApp；內地版 Alipay 會被明確排除。

## 產品目錄

Google Sheet 是唯一產品主源。瀏覽目錄、分類頁、動態產品詳情、快速檢視、全站搜尋、購物車、結帳、Stripe hosted Checkout Session／PaymentIntent、收據及訂單通知全部使用同一份伺服器載入的 catalog。Stripe 與通知 API 會按該 catalog 在伺服器重新建立價錢及庫存，不信任瀏覽器傳入的價格。

Google Pay、PayMe 及 AlipayHK 入口會由結帳頁交由 Stripe hosted Checkout 處理。建立 Checkout Session 時不會硬編 `payment_method_types`，而是使用 Stripe Dashboard 的 dynamic payment methods；因此 Google Pay 會按已註冊 domain、瀏覽器／裝置、客戶地區及 HKD 資格自動出現。PayMe 及 AlipayHK 只有在 Stripe 帳戶實際提供、且指定 Payment Method Configuration 可用時才會出現，程式不會傳送未受 Stripe API 支援的 `payme` 或 `alipayhk` enum。

網站不保留 hardcoded、mock 或 sample 產品資料。Sheet 下載、解析失敗或沒有有效商品時，catalog 會回傳空陣列並顯示 Empty State；不會展示舊產品。

## 搜尋與庫存規則

`src/lib/searchProducts.ts` 搜尋完整 114 筆合併後 catalog，索引：

- ID、中英文名稱及描述
- 分類、子分類、品牌、供應商及系列
- tags、specs、product type、handle 及來源分類
- 適用品種 slug 與中英文品種名稱

搜尋建議使用統一 `Product` 欄位，顯示本地圖片、中英文名稱、價格、品牌／系列及適用時的「售罄／Sold out」標籤，並保留桌面鍵盤導覽、ARIA 與手機搜尋 modal。

### 付款設定

- 在 Stripe Dashboard 啟用 Google Pay，以及註冊所有會展示支付按鈕的正式及預覽 domain（例如 `mofuhavenhk.com` 及實際使用的 `*.vercel.app` domain）。
- Hosted Checkout API route 是 `src/app/api/stripe/create-checkout-session/route.ts`；成功後回傳 `/checkout/success?session_id={CHECKOUT_SESSION_ID}`，並由 `src/app/api/stripe/complete-order/route.ts` server-side 驗證付款狀態。
- Hosted Checkout Session 現在使用官方支援的 `wallet_options.link.display = "never"`，移除 Link 快速結帳按鈕；Apple Pay／Google Pay 仍留在 Dashboard dynamic payment methods 的資格判斷內。
- Stripe hosted Checkout API 沒有已確認的 per-session `express_checkout` 開關，不能保證在保留標準清單 Apple Pay／Google Pay 的同時，從程式碼隱藏整個頂部容器。若 Stripe Dashboard 顯示獨立的 Checkout／Express Checkout toggle，應在該處關閉；不能用商店 CSS 修改 `checkout.stripe.com`。
- 如帳戶使用自訂的 Stripe Payment Method Configuration，將 configuration ID 設定為 `STRIPE_PAYMENT_METHOD_CONFIGURATION_ID`；程式會把同一個 ID 傳入 Checkout Session 及 PaymentIntent，讓 Dashboard 設定同步生效。不要在程式碼中直接加入未獲 Stripe API 文件確認的 `payme` 或 `alipayhk` payment method type。
- Checkout Session 及 PaymentIntent 都會以 `excluded_payment_method_types` 排除 Stripe 的內地版 Alipay；hosted Checkout 同時排除 WeChat Pay，確保不會在動態付款清單中出現未指定方式。
Stripe 官方目前表示 AlipayHK 不支援作為同一個 `alipay` method；只有當您的帳戶／組態顯示真正獨立支援的 AlipayHK method 時，才應保留該入口。
- `STRIPE_LIVE_SECRET_KEY` 是目前 production 優先使用的 server-only secret；`STRIPE_PUBLISHABLE_KEY` 只供前台載入 Stripe.js。兩者都不可提交到 Git。

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
