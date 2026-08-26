# Latest 31 批次 QA

## Stripe 與資料完整性

最後批次的正式映射涵蓋 31 個來源列；其中兩張 AIM30 15 歲以上鮮魚配方來源圖經核對為同一 SKU，故最終處理 30 項商品。Stripe 已新建 23 項 Product 及其 active HKD Price，另有 7 項已上架 SKU 只更新正確的 CDN 主圖；既有 Price 均已保留。匯入後的逐項驗證及冪等重跑均通過，確認不會重複建立 Product 或 Price。

| 檢查項目 | 結果 |
|---|---|
| 定價規則 | CNY × 1.1654 ÷ 55%，一律向上取下一個 `.90` |
| 新建 Stripe 商品與價格 | 23 項，均為 active HKD Price |
| 既有商品更新 | 7 項，只刷新已核對主圖，未改價 |
| 圖片規則 | 每 SKU 一張保真清理後 CDN 主圖 |
| 結帳安全 | 前台只傳遞 Product／Price ID；收款仍由伺服器重建 Stripe 目錄決定 |

## 本機前台核對

AIM30 室內成貓雞肉味乾糧 600g（`/product/prod_V8xXuAW047ti4v`）顯示唯一清理後主圖、雙語資料及 HK$356.90。其頁面僅提供同系列、同重量的雞肉味與鮮魚味切換；年齡、絕育及腎臟健康照護配方均維持獨立，沒有被錯誤合併。

Mon Petit Crispy Kiss 奢華鮮魚味 24g（`/product/prod_V8xXBfCtwPwxjK`）顯示唯一清理後主圖及 HK$29.90，並僅提供奢華系列 24g 的鮮魚、雞肉及三文魚三款口味。選擇三文魚後，頁面實際切換至 Product `prod_V8xXV7x4AmWu89`，主圖、名稱及價格同步更新。

## 分類與購物籃核對

`/categories/cats/dry-food` 可找到 AIM30 室內成貓雞肉味及腎臟健康照護乾糧，未出現 Mon Petit 小食。`/categories/cats/snacks` 是貓咪小食的正式路由，能找到 Mon Petit 奢華鮮魚味 24g，且未出現 AIM30 室內成貓雞肉味乾糧。此前測試的 `/categories/cats/treats` 並非網站路由，因此回傳 404；這不是分類資料問題。

將已選的 Mon Petit 奢華三文魚味加入本機購物籃後，`/checkout` 訂單摘要保留正確商品名稱及 HK$29.90。測試未輸入顧客資料、未開始付款、未建立 Checkout Session。

## 自動驗證

| 命令 | 結果 |
|---|---|
| `npm test` | 12 個測試檔、57 項測試通過（加入 144g 綜合包選擇後，相關兩個測試檔再次通過） |
| `npm run validate:products` | 通過 |
| `npm run build` | 通過；過程有遠端圖片 TLS 重試，但最終編譯、靜態頁生成及最佳化完成 |

## Production 驗證

GitHub commit status 顯示兩個既有 Vercel project 的部署均已成功。於 `https://mofuhavenhk.vercel.app` 加入 cache-buster 後，AIM30 室內成貓雞肉味 600g 顯示唯一主圖、HK$356.90 及兩個已驗證口味；Mon Petit Crispy Kiss 奢華鮮魚味 24g 顯示唯一主圖、HK$29.90 及三個同系列口味。自訂網域 `mofuhaven.com` 與 `www.mofuhaven.com` 在本次 sandbox 環境發生 TLS handshake failure（`ERR_SSL_VERSION_OR_CIPHER_MISMATCH`），因此無法直接在該環境以自訂網域完成瀏覽器測試；Vercel 公開 production 網址已提供獨立驗證。
