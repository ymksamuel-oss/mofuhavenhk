# WT Japan 產品圖片同步

`sync-wt-japan-images.mjs` 會讀取 Supabase `products` 的產品名稱，到 `wt-japan.com` 的公開 Shopify 目錄搜尋，只有在產品名稱經 Unicode 正規化後完全相等時才會採用圖片。圖片會下載後上傳到 Supabase `public-images` bucket，再把公開圖片 URL 寫入該產品的 `images` 欄位。

## 環境變數

需要在執行環境提供：

```bash
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<server-only-service-role-key>
```

也可使用 `NEXT_PUBLIC_SUPABASE_URL` 代替 `SUPABASE_URL`。Service role key 只可在伺服器或本機安全環境使用，不能放進瀏覽器或提交到 Git。

## 執行方式

預設是 **dry-run**，只搜尋及產生報告，不會上傳圖片或修改資料庫：

```bash
npm run sync:wt-japan-images
```

確認報告中的 `would_update` 結果後，才使用正式寫入模式：

```bash
npm run sync:wt-japan-images -- --apply
```

先以少量產品測試：

```bash
npm run sync:wt-japan-images -- --apply --limit 20
```

只處理單一產品：

```bash
npm run sync:wt-japan-images -- --name "完整產品名稱"
```

預設只會處理目前沒有可用圖片的產品，不會覆蓋現有圖片。如要明確覆蓋，必須額外指定：

```bash
npm run sync:wt-japan-images -- --apply --overwrite
```

每次執行會產生 `data/wt-japan-image-sync-report.json`，列出 exact match、未找到、已上傳及失敗項目。

## 匹配規則

腳本不使用 SKU、不使用模糊相似度，也不會根據供應商排序猜測產品。匹配只使用：

1. 網店產品名稱與 WT 搜尋結果的產品標題。
2. Unicode NFKC 正規化。
3. 全形／半形空白及連續空白標準化。
4. 最後以不分大小寫的完整字串相等比對。

找不到完全相同標題時會跳過，不會修改該產品。
