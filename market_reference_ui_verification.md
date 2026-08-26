# 市場參考價前台驗證紀錄

驗證日期：2026-08-26（本機 Next.js 預覽）

| 產品 | 商品頁 | 現價 | 市場參考價 | 驗證結果 |
| --- | --- | ---: | ---: | --- |
| Mama Cook 雞胸肉雞肫凍干 18g | `/product/prod_V8W072ieTWyOZ7?lang=zh` | HK$62.40 | HK$75.00 | 商品頁成功載入；「市場參考價」以中性資料列顯示，不含刪除線或折扣百分比。 |
| d.b.f 牛肉奶酪 85g | `/product/prod_V8e2EKKmnHUR8w?lang=zh` | HK$27.20 | HK$37.00 | 商品頁成功載入；現價、規格、加購控制項維持正常，市場參考價未改變 Stripe Price ID。 |

## 語意檢查

市場參考價元件僅會讀取 `market_reference_price_hkd`，且只在數值高於現價時顯示。既有 `compare_at_price_hkd`／`originalPrice` 仍保留給本店已驗證原價與折扣顯示；兩者不共用刪除線、折扣標籤或 Checkout 金額。

## 已修復的既有載入問題

本機驗證最初發現 `ProductDetail` 缺少 `ProductGallery` 匯入，造成商品頁暫時性錯誤。已補回既有元件匯入後重新驗證兩個商品頁，均成功載入。

## Stripe Checkout 安全核對

已以 Mama Cook 雞胸肉雞肫凍干 18g 建立指定商品的未付款 Hosted Checkout Session，並立即失效。Session 明細使用既有 Stripe Price `price_1U8Ey2RyM6dRKLtZnfFC1DjA`，商品金額 HK$62.40（`unit_amount` 6240），總額 HK$87.40（含系統 HK$25 運費）。Session 最終狀態為 `expired`／`unpaid`。市場參考價只存在於產品展示 metadata，未傳入 Checkout、未改動 Stripe Price ID，亦未改動付款金額。

## 正式環境部署監察

於 2026-08-26 GitHub `main` 推送後，正式頁 `https://www.mofuhavenhk.com/product/prod_V8W072ieTWyOZ7?lang=zh` 暫未顯示市場參考價，顯示該頁仍由上一個 Vercel 部署版本提供。商品圖片與現價 HK$62.40 正常；待 Vercel 取得提交 `cd9e1bcc` 後需重新核對市場參考價 HK$75.00 的公開顯示。

## Vercel 正式部署

Vercel 控制台已確認部署 `dpl_BHopn5DKyTASohKMeFYE8QjkWkkf` 狀態為 `Ready`、環境為 `Production`，並標示為 `Current`；部署來源為 GitHub `main` 的提交 `cd9e1bc`（`feat: add verified market reference price display`），且 `www.mofuhavenhk.com` 已列為此部署的 Current Domains。部署建立後，公網商品頁可能受快取短暫影響；控制台的部署詳細頁為正式部署完成證據。

## 正式部署直連檢查

Vercel 直接部署網址在無登入文字擷取下回傳 Vercel Login 頁，屬於部署保護／存取狀態，不能用作公網功能失敗判斷。Vercel 控制台已確認該部署為 Current Production；本機預覽已實際驗證功能。自訂網域的舊頁內容可能受 CDN 快取或網域切換傳播影響，需以帶 cache-busting 參數重新請求確認。

## 正式自訂網域最終驗證

以 `marketrefcheck=20260826` 快取繞過參數重新請求正式自訂網域後，`www.mofuhavenhk.com/product/prod_V8W072ieTWyOZ7?lang=zh` 已顯示「市場參考價 HK$75.00 · 2026-08-25」，同時保留本店現價 HK$62.40。頁面沒有顯示來源平台、刪除線或折扣百分比，符合市場參考價的中性語意與來源保護要求。
