# Mofu Haven Checkout 兩步流程重構計畫

## 目標
將 `/checkout` 的單頁長表單改為同頁狀態驅動的兩步流程：Step 1 收件／送貨資料，Step 2 付款／訂單確認。

## 實作決策
- 保留 `src/app/checkout/page.tsx` 現有商品、優惠碼、運費、PaymentIntent、Stripe Checkout、PayMe、收據及完成訂單邏輯。
- 新增 `step: 1 | 2` 狀態；Step 1 不建立 Stripe PaymentIntent，只有通過現有收件資料驗證並進入 Step 2 後才啟動既有付款準備 effect。
- Step 1 顯示既有 `ShippingContactForm`（包括順豐送貨／自提模式及搜尋選點），Step 2 顯示 `PaymentMethods`、優惠碼、精簡 `OrderSummary` 與既有 `StripePaymentForm`。
- Step 2 提供返回 Step 1 的控制；收件資料仍由同一個 `shippingContact` state 保存，付款 API payload 不變。
- 對 Stripe 表單只新增 DOM `id`／隱藏內置提交按鈕的顯示介面，讓 Step 2 的固定底部 CTA 觸發同一個原生 form submit，不改 Stripe confirm 或 API。

## 設計
- Apple Store 式克制白底、細線卡片、數字化步驟指示器及固定底部主 CTA。
- 手機優先：內容底部保留 safe-area 空間；桌面使用中央窄欄，避免長表單視覺壓迫。
- 所有文案以現有 locale 為基礎，中文顯示指定的兩步 CTA，英文提供對應語意。

## 檔案分工
- `src/app/checkout/page.tsx`：步驟 state、分步渲染、返回／下一步、付款 CTA 與自動準備條件。
- `src/components/checkout/StripePaymentForm.tsx`：新增可選 form id／內置 submit 顯示控制，保留 Stripe Elements 與付款流程。

## 保護邊界
不修改 Stripe API route、PaymentIntent 建立、Stripe Checkout session、產品價格、優惠碼解析、`getShippingCost` 或 HK$399 免運計算。

## 促銷量販卡片：規格膠囊切換器

- 範圍：只改 `/collections/value-bundles` 的量販商品卡與可重用加購按鈕呈現；每卡提供 6／9／12 包規格膠囊，預設選 9 包，顯示對應 Supabase 商品列的價格與平均單包價，並只保留一個數量計數器和一個加購 CTA。
- 互動／購物車：切換規格即選取該規格專屬的 Supabase 商品 id；加購透過既有 cart API 傳入此 id，沿用伺服器商品定價、PaymentIntent 整數 cents 及 HK$399 免運計算，不改 Stripe 或運費邏輯。免費送貨文案只在該方案單獨達 HK$399 時標示已符合，否則提示滿額條件。
- 版面：延續現有日本寵物零食商品編輯感，卡片採純白底、細淺石色邊框與柔和陰影；黑底白字表達已選規格，橙色沿用品牌主要 CTA。小螢幕保留雙欄網格、方形商品圖、緊湊規格列；計數器與 CTA 在窄卡片內垂直排列，較寬卡片時併排，避免橫向溢出及多組按鈕堆疊。
- 檔案分工：`src/components/menu/BulkBundleCard.tsx` 負責卡片狀態、規格與動態價格；`src/components/menu/AddToCartButton.tsx` 新增量販緊湊操作列樣式，沿用既有購物車加入方法；`src/components/menu/ProductCatalog.tsx` 繼續用既有兩欄／四欄商品網格。
