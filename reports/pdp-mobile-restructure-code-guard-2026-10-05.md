# Mofu Haven PDP 手機端重構報告與 Code Diff

日期：2026-10-05  
審核用途：Code Guard / Mobile PDP QA

## 1. 修改涉及檔案

| 檔案 | 修改內容 |
|---|---|
| `src/components/product/ProductDetail.tsx` | 移除 Product Details 內重複產品小圖、取消 Details/Shopping Notes Tab、加入頂部 chips、配送 Trust Bar、直接外露雙語規格卡、JAN `<details>` 收合及 Sticky Bar safe-area 適配。 |
| `reports/pdp-mobile-restructure-code-guard-2026-10-05.md` | 本修改報告及關鍵 Code Diff。 |

沒有修改 Stripe API、checkout API、購物車金額計算或現有運費門檻邏輯。

## 2. 完成項目對照

### 2.1 移除中間贅圖與空間優化

已移除 `RichProductContent` 內的中間 `ProductImage` 產品小圖卡片及其固定 `h-[320px]` 容器。原本圖片右上角的日文／日本特色標籤改為規格卡頂部的 responsive chips：

```tsx
<div className="flex flex-wrap gap-2 px-4 pt-4 sm:px-5">
  {[/* locale-specific badges */].map((badge) => (
    <span className="rounded-full ... text-[11px] ...">
      {badge}
    </span>
  ))}
</div>
```

這會釋放手機首屏約 250–300px 的垂直空間，並讓特色訊息先於規格出現。

### 2.2 Shopping Notes 直接外露

已移除原有：

```tsx
<div role="tablist">
  <button>Product Details</button>
  <button>Shopping Notes</button>
</div>
```

改為固定直接顯示的 Trust Bar，三欄在桌面版、單欄堆疊於 375–430px 手機版：

```tsx
<section aria-label={locale === "en"
  ? "Delivery trust information"
  : "配送信任資訊"}
  className="grid grid-cols-1 ... sm:grid-cols-3 ...">
  <div>🚚 滿 HK$399 順豐免運 / Free SF shipping</div>
  <div>⚡ 1–2 天現貨發貨 / Ships in 1–2 days</div>
  <div>🇯🇵 100% 日本原廠正貨 / Genuine Japan source</div>
</section>
```

購物須知仍保留在頁面後段，但不再需要切換 Tab 才能看到；核心配送信任資訊在規格卡前已直接露出。

### 2.3 True i18n 規格展示

新增 `localiseSpecLabel()` 與 locale-aware `productSpecifications()` 整合：

```tsx
{locale === "en"
  ? "📋 Specifications & Guaranteed Analysis"
  : "📋 產品規格與保證營養分析"}
```

欄位標籤映射：

| 中文 `zh-HK` | English `en` |
|---|---|
| 主要成分 | Ingredients |
| 產地來源 | Origin |
| 粗蛋白質 | Crude Protein |
| 粗纖維 | Crude Fiber |
| 粗脂肪 | Crude Fat |
| 水分 | Moisture |
| 粗灰分 | Crude Ash |
| 熱量 | Energy |

English renderer 會過濾含有中日文字元的規格 row，避免 `English label + Chinese value` 的混語拼裝；若沒有安全英文資料，顯示 `Specification / Not provided`，而不是洩漏中文內容。

### 2.4 Mobile-first 卡片規格

規格由傳統表格式展示改為圓角微卡片：

```tsx
<div className="divide-y divide-stone-100 overflow-hidden rounded-xl
  bg-white shadow-sm ring-1 ring-stone-100">
  <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]
    gap-3 px-3 py-3 text-[13px] leading-relaxed sm:px-4">
    <dt className="min-w-0 break-words ...">{row.label}</dt>
    <dd className="min-w-0 break-words ...">{row.value}</dd>
  </div>
</div>
```

- 手機字級：`13px`，次要說明 `12px`
- `leading-relaxed` 提供舒適行距
- `min-w-0` + `break-words` 避免 375px 寬度溢出
- 以 `divide-y`、`rounded-xl`、`bg-white`、`shadow-sm` 形成微卡片視覺

### 2.5 JAN Accordion 與 Sticky Bar

JAN 從購買卡頂部移除，改為預設收起的原生 `<details>`：

```tsx
<details className="rounded-2xl border border-stone-200 bg-white ...">
  <summary className="cursor-pointer font-semibold">
    {locale === "en" ? "More product information" : "更多產品資料"}
  </summary>
  <p>{locale === "en"
    ? `JAN barcode: ${sku}`
    : `原廠 JAN 條碼：${sku}`}</p>
</details>
```

Sticky Bottom Bar 保留原有 add-to-cart handler，並保留遠端最新版本的 safe-area 適配：

```tsx
pb-[max(16px,env(safe-area-inset-bottom,16px))]
```

現有：

```tsx
addItem(product.id, selectedQty, selectedPriceId)
```

保持不變。

## 3. 手機視圖前後適配說明

### 修改前

- Product Details 後面有一張固定約 320px 高的重複去背產品圖卡。
- Product Details / Shopping Notes 以 Tab 切換，配送信任資料需點擊後才可見。
- 規格資料與 locale fallback 可能形成左側英文、右側中文的混語排列。
- JAN 直接佔用購買區垂直空間。
- 手機規格資訊使用較傳統的 border section，資訊密度及換行控制較弱。

### 修改後

- 重複產品圖移除；chips 直接位於 features 卡片頂部。
- Trust Bar 在規格卡上方直接露出，手機單欄、桌面三欄。
- 規格標題及欄位按 `zh`／`en` 動態渲染，英文會阻擋中文 fallback 洩漏。
- 375px–430px 使用 13px–14px 字級、relaxed 行距、`min-w-0`／`break-words`。
- JAN／官方來源備註預設收起，需有需要時才展開。
- Sticky Bar 維持 fixed bottom，使用 `env(safe-area-inset-bottom)`，不遮擋 iPhone Home Indicator。

## 4. 安全邊界確認

以下範圍沒有更動：

- `src/lib/order.ts` 的 `FREE_SHIPPING_THRESHOLD` 及 `calcSubtotal()`。
- 遠端最新的 `BackInStockAlertButton`、`getProductJanCode()`、Sticky loading 及 account 功能更新。
- ProductDetail 現有 `AddToCartButton`、`addItem()`、數量與 variant price 流程。
- Stripe create checkout / payment intent / webhook API。
- Checkout 頁面及付款流程。
- `FreeShippingProgress` 的現有運費計算邏輯。

## 5. 驗收結果

- `npm run lint -- --no-cache`：PASS
- `npm run build`：PASS（Next.js 16.3.0，81 個頁面生成完成；包含 rebase 後遠端 account / back-in-stock 路由）
- `git diff --check`：PASS
- 靜態需求檢查：8/8 PASS
  - Details/Shopping Notes tab removed
  - 中間 ProductImage removed
  - Trust Bar present
  - zh specification heading present
  - en specification heading present
  - JAN `<details>` present
  - safe-area inset preserved
  - cart `addItem()` handler preserved

## 6. Git Diff 摘要

```diff
+import { productSpecifications } from "@/lib/product-content";
-const [tab, setTab] = useState<"details" | "notes">("details");
+const [openFeatures, setOpenFeatures] = useState(true);
-0<div role="tablist">...</div>
+<section aria-label="Delivery trust information" className="grid ... sm:grid-cols-3 ...">
+  Free SF shipping / Ships in 1–2 days / Genuine Japan source
+</section>
+<section aria-labelledby="product-specifications-title">
+  Specifications & Guaranteed Analysis / 產品規格與保證營養分析
+</section>
+<details>
+  JAN barcode / 原廠 JAN 條碼
+</details>
-<section className="... h-[320px] ..."><ProductImage ... /></section>
+<div className="flex flex-wrap gap-2 ...">...</div>
- pb-[max(0.65rem,env(safe-area-inset-bottom,0px))]
+ pb-[max(16px,env(safe-area-inset-bottom,16px))]
```

完整可審核 diff：

```bash
git diff -- src/components/product/ProductDetail.tsx
```
