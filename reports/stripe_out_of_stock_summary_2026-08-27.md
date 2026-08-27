# Stripe 缺貨產品統計

**統計時間：2026-08-27**

Stripe 目前共有 **226 件啟用產品**。按前台實際使用的庫存規則統計，當中有 **7 件缺貨**：5 件仍在前台顯示為缺貨，2 件已因設定為缺貨且不公開展示而從目錄和直接商品頁隱藏。

| 類別 | 數量 | 前台狀態 |
|---|---:|---|
| 啟用產品總數 | 226 | Stripe 啟用 |
| 缺貨產品總數 | 7 | `in_stock=false` 或缺貨狀態 |
| 缺貨但仍公開顯示 | 5 | `show_when_out_of_stock=true` |
| 缺貨並從前台隱藏 | 2 | `show_when_out_of_stock=false` |

## 仍在前台顯示的缺貨產品（5 件）

| Stripe Product ID | 產品名稱 | 現時缺貨標示 |
|---|---|---|
| `prod_V8e2HgqFtfTeZ3` | d.b.f 雞胸肉糜（脂肪含量更少 0.5% 以上）65g | 缺貨 |
| `prod_V8e2MnRWL8I3ON` | d.b.f 成犬之食事 雞肉 85g | 缺貨 |
| `prod_V8e2hyOUdfOwnM` | d.b.f 牛肉紅薯 85g | 缺貨 |
| `prod_V8e1Jgdnr9v8HM` | d.b.f 牛肉糜 65g | 缺貨 |
| `prod_V8W0LKmYo2bfxf` | Mamacook 凍乾豬心 25g | 預定（缺貨） |

## 已從前台隱藏的缺貨產品（2 件）

| Stripe Product ID | 產品名稱 | 現時缺貨標示 |
|---|---|---|
| `prod_V90y14gfPJNkP3` | CIAO｜11歲以上鰹魚白肉貓罐頭｜單罐 | 暫時缺貨 |
| `prod_V90yHSNJqbGEZF` | CIAO とろみ｜14歲以上鮪魚扇貝奶油濃湯貓罐頭｜單罐 | 暫時缺貨 |

> 此統計為唯讀檢查，沒有更改 Stripe 的庫存、產品可見性、價格或前台設定。原始機器可讀統計可見於 `reports/stripe_out_of_stock_inventory_2026-08-27.json`。
