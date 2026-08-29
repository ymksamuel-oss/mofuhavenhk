# Product Page 官方 FAQ Preview 驗證

日期：2026-08-29

## 修改

已在 `src/components/product/ProductFAQ.tsx` 建立商品頁專用官方 FAQ accordion，並在 `src/components/product/ProductDetail.tsx` 將其放置於現有全站 FAQ `FAQAccordion` 之後、頁尾及手機固定購物列之前。

## Preview

Feature branch：`feature/product-page-official-faq-20260829`

Commit：`73a22ff0b2e4217972bbc9f4cc1f640e30c6b8a9`

Vercel deployment：`dpl_AmKj9ZUY846t71hatwcjenKZ5Hdw`

Deployment state：`READY`

Deployment URL：<https://mofuhavenhk-rkgm7s4b9-mofuhavenhk-6259s-projects.vercel.app>

Temporary share URL（約 23 小時有效）：<https://mofuhavenhk-rkgm7s4b9-mofuhavenhk-6259s-projects.vercel.app/?_vercel_share=7udjNy3bpCT4CrGT1fHnPMLZYDs4cGHy>

代表性商品頁：<https://mofuhavenhk-rkgm7s4b9-mofuhavenhk-6259s-projects.vercel.app/product/prod_V9Y1mdqJPWonSc?_vercel_share=7udjNy3bpCT4CrGT1fHnPMLZYDs4cGHy>

## 核對結果

商品頁成功顯示 `OFFICIAL FAQ`、`商品常見問題`、`官方解答` 標籤及 5 條 Q&A。新區塊位於原有全站運費／發貨／付款／退換貨 FAQ 之後，頁尾 `繼續選購` 按鈕及 Footer 之前，符合放在商品頁內容最下方的要求。

第一條 FAQ 預設展開，其餘條目可用鍵盤或滑鼠按鈕開合；商品原有 8 個規格選項、價格 HK$32.90、加入購物籃及結帳按鈕仍顯示。

## 驗證

`npm test`：19 個 test files、91 個 tests 全部通過。

`npx tsc --noEmit`：通過，沒有輸出錯誤。

`NODE_ENV=production npm run build`：成功編譯並完成 68 個靜態頁面生成。Build 過程曾出現外部網絡 TLS 重試訊息，但最終 build 成功。
