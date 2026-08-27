# 變體圖片切換 Production 驗證

- 驗證日期：2026-08-28
- Vercel production deployment：`7b5872d Show correct image for selected bowl variants`
- 驗證頁面：`https://www.mofuhavenhk.com/product/prod_V8szss31Rm8tiJ`
- 操作：選擇「綠葉圖案」變體。
- 結果：產品頁主圖片由預設的魚圖案切換為 `/images/product-variants/cat-bowls/raised-flat-green-leaf.png`，畫面顯示綠葉圖案高腳平口陶瓷貓碗。
- 結論：公開 production 的變體選擇與主圖切換已正常運作。

本次驗證不涉及價格、成本或庫存變更。

另行抽查貓耳斜口高腳陶瓷食盤 12cm：選擇「綠胖胖」後，公開 production 頁面的商品圖 URL 已切換為 `/images/product-variants/cat-bowls/cat-ear-green-chubby.png`，確認相同機制亦適用於四款圖案選項。
