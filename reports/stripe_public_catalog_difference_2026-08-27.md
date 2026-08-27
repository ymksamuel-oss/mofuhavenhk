# Stripe 與公開目錄產品差異核對

**核對日期：2026-08-27**

## 結論

Stripe 目前有 **226 件啟用產品**，而先前公開分類頁的嵌入資料只列出 **224 件**。以 Stripe Product ID 逐件比較後，公開目錄沒有額外產品；差異剛好是兩件仍然啟用、但設定為缺貨且不公開展示的 CIAO 貓罐頭。

| Stripe Product ID | 產品名稱 | 匯入鍵 | 類別 | 庫存設定 | 公開結果 |
|---|---|---|---|---|---|
| `prod_V90y14gfPJNkP3` | CIAO｜11歲以上鰹魚白肉貓罐頭｜單罐 | `ciao-inaba-cans-2026::cic-19` | 貓咪商品／貓罐罐 | `in_stock=false`；`availability=暫時缺貨`；`show_when_out_of_stock=false` | 公開商品網址 `https://www.mofuhavenhk.com/product/prod_V90y14gfPJNkP3` 顯示 404。 |
| `prod_V90yHSNJqbGEZF` | CIAO とろみ｜14歲以上鮪魚扇貝奶油濃湯貓罐頭｜單罐 | `ciao-inaba-cans-2026::cic-10` | 貓咪商品／貓罐罐 | `in_stock=false`；`availability=暫時缺貨`；`show_when_out_of_stock=false` | 公開商品網址 `https://www.mofuhavenhk.com/product/prod_V90yHSNJqbGEZF` 顯示 404。 |

## 核對方法及範圍

1. 從 Stripe API 分頁匯出所有 `active=true` 的 Product，共 226 件，並保存於 `reports/stripe_active_products_2026-08-27.json`。
2. 以產品 ID 對照先前由 29 個公開分類頁擷取的 `public_catalog_inventory.json`，後者有 224 件唯一產品。
3. 差異分析結果保存在 `reports/stripe_public_catalog_difference_2026-08-27.json`：`stripe_only_products` 為上述兩件，`public_only_products` 為空。
4. 使用未登入公開前台檢查兩個直接商品網址，均回傳 404。

## 為何前台不顯示

店面資料層會先從 Stripe 載入所有啟用商品，再以 `isStorefrontReadyProduct` 過濾。當商品 `in_stock=false`，且 `show_when_out_of_stock` 並非 `true`，該商品會被排除於店面目錄與直接商品頁之外。兩件產品符合這個隱藏條件，因此它們不是「資料遺失」，而是**保留於 Stripe、目前設定為暫時缺貨並隱藏**。

> 本報告只識別差異及其現行公開狀態；沒有改動兩件產品的庫存、可見性、價格、資料或 Stripe 設定。
