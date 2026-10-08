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
