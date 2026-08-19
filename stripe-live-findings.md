# Stripe Live 商品核實紀錄

本次透過已授權的 Stripe MCP 連接器核實，目標帳戶為 `acct_1TxSYXRyM6dRKLtZ`，帳戶名稱為「毛毛港 MofuHaven」，`livemode: true`。資料來源為 Stripe API 的 `GET /v1/products` 及 `GET /v1/prices`，由 MCP 工具 `stripe_api_read` 讀取。

`GET /v1/products` 使用 `active=true`、`limit=100` 及 `expand=data.default_price`，結果為 **91 件 Active 商品**，`has_more=false`。商品包含貓咪及狗狗分類，並有 Stripe metadata、商品名稱及圖片 URL。

`GET /v1/prices` 分頁讀取後共核實 **144 件 Active Price**；合併兩頁結果後，91 件 Active 商品均能配對到有效價格，沒有缺少價格的商品。網站 API 最終驗證回應 HTTP 200，回傳 `total: 91`、來源 `mcp-live-snapshot`，並包含 91 個唯一圖片 URL。

目前專案內建的 `STRIPE_SECRET_KEY` 仍指向空白 Manus 測試帳戶 `acct_1U25axLnEAOSteW3`，該帳戶查到 0 件商品。因此網站使用由上述 MCP Live 資料生成的共用快照，避免把密鑰暴露到前端；伺服器端 Stripe 路由仍保留，待專案能安全注入目標 Live Secret Key 後可恢復即時同步。

MCP 工具結果檔案：

- `/home/ubuntu/.mcp/tool-results/2026-08-19_03-01-35.410155523_stripe_stripe_api_read_5ba99d3b.json`
- `/home/ubuntu/.mcp/tool-results/2026-08-19_03-00-00.323337752_stripe_stripe_api_read_ede62967.json`
- `/home/ubuntu/.mcp/tool-results/2026-08-19_03-03-50.981963500_stripe_stripe_api_read_f2711717.json`

驗證端點：本地 `GET /api/trpc/store.products`，使用 tRPC batch query；最後驗證結果為 HTTP 200、回應大小約 91 KB、商品總數 91、圖片 URL 數量 91。
