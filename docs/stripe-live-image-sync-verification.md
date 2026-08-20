# Stripe Live 商品圖片同步核對

本次同步只更新 Stripe Live 商品的 `images` 欄位，沒有更改商品名稱、價格、分類、metadata 或付款設定。

| 項目 | 結果 |
|---|---:|
| 已建立的核准同步清單 | 75 件商品 |
| Stripe Live 更新嘗試 | 75 件商品 |
| 成功更新 | 75 件商品 |
| 讀回核對一致 | 75／75 |
| 不一致或失敗 | 0 |

每項圖片均寫入其對應的 `https://www.mofuhavenhk.com/assets/product/<StripeProductId>` 受控網址。該端點已於 Vercel Production 驗證會回應真實圖片檔案；因此 Stripe 商品目錄與網站前台現使用同一套穩定圖片來源。
