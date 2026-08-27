# 產品變體 v2 規範

## 目的

Mofu Haven 的產品頁會把「同一件產品的可購買選項」與「不同的 Stripe Product」分開處理。圖案、顏色、口味、配方或包裝數量，只可以在確實改變商品、庫存或 Stripe Price 時顯示為選項。

## 同一 Stripe Product 的選項

當產品共用相同規格，只是圖案／顏色／口味／包裝選擇不同，mapping 使用 `variants` 陣列，每個項目必須有穩定的英文語義 `key`、中英文名稱、實際售價及圖片。不要使用 `option-1`、`option-2` 這類依陣列位置而變動的 key。

```json
{
  "key": "raised-flat-green-leaf",
  "label_zh": "綠葉圖案",
  "label_en": "Green leaf pattern",
  "image": "/images/product-variants/cat-bowls/raised-flat-green-leaf.png"
}
```

每個變體會成為一個獨立 Stripe Price。匯入腳本會把 `key`、雙語標籤及 `variant_image_url` 寫入 Price metadata；產品頁會用所選 Price 的圖片更新主圖，購物籃則保存相同的 `priceId`，因此不會把顯示中的圖案與實際購買項目分開。

## 不同 Stripe Product 的家族選擇

如果口味或配方代表不同的實際商品、庫存或 Product ID，應使用 `PRODUCT_FLAVOR_FAMILIES` 建立已核實的 sibling Product 家族。產品頁會先切換 sibling Product，再顯示該產品自己的包裝／數量 Price 選項。不要只改文字標籤而不更換 Product ID。

## 圖片規則

Stripe Price metadata 的 `variant_image_url` 是第一優先來源。對於尚未有 metadata 的舊 Price，`src/lib/product-variant-images.ts` 提供按 Product ID 及語義標籤的有限核實 fallback。遇到未知選項時，系統寧願不猜圖片，也不會按選項位置套用另一款產品圖片。

圖片必須是清理後的商品圖，不應包含供應商介面、價格、尺寸線或原始截圖邊框。若圖片是本地資產，放在 `public/images/product-variants/`，並使用以 `/images/` 開始的安全路徑。

## 上架前檢查

1. 確認每一個變體的 `key` 唯一且不依賴排序。
2. 確認中英文標籤與圖片是同一個選項，不可只複製上一個選項的圖片。
3. 確認每一個選項都有正確 Stripe Price；同一產品的選項不得共用錯誤的 Price ID。
4. 重新執行 `npm run validate:products`、`npm test` 及 `npm run lint` 的 targeted 檢查。
5. 在產品頁逐一點選所有圖案／顏色／口味，確認主圖、標題、價格及加入購物籃後的 `priceId` 一致。
6. 在 375px 手機寬度檢查選項圖片、選項名稱及底部固定加入購物籃列沒有重疊。

## 目前已核實的食物碗

食物碗 v2 mapping 已包含貓耳 12cm 的四款圖案、平口 250ml 的三款圖案及貓臉 350ml 的三款顏色。圖片資產及變體 key 保存在 `cat_feeding_bowls_mapping.json`，匯入時會以語義 metadata 綁定，不再依賴 Price 的建立次序。
