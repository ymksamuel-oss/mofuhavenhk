# Mofu Haven English Checkout 與導航 i18n 修正紀錄

**更新日期：** 2026-09-03（GMT+8）  
**主要提交：** `d753268f`

## 問題與修正

| 問題 | 修正方式 |
| --- | --- |
| English 產品名稱顯示為 `Product name unavailable` | 已建立後台管理的 `product_localizations` CMS 設定，目錄建立與 Checkout 會合併真實 `name_en`、`description_en`。 |
| 新產品缺乏英文輸入渠道 | 後台「產品管理」新增 English product name 及 English product description 欄位。 |
| Stripe Elements 固定為中文 | 已改為跟隨 I18n `locale`：中文使用 `zh-HK`，English 使用 `en`。 |
| 導航與分類封面英文內容 | 沿用已部署的分類本地化 CMS，主導航、下拉父子分類與首頁四張分類封面均按 `locale` 顯示中文或英文。 |

## 正式資料更新

已將目前上架的 CIAO 商品（`ead5a682-0931-473c-9bea-da6a1ca56270`）寫入以下正式 CMS 英文內容：

| 欄位 | 儲存內容 |
| --- | --- |
| English product name | CIAO Cranky Extra-Strength Lactic Acid Bacteria Tuna & Bonito Flavour for Kittens 20g × 10 Packs |
| English product description | Crunchy tuna and bonito bites with extra-strength lactic acid bacteria, specially made for kittens. |

## 正式驗證

已於 English Checkout 驗證付款方式、Stripe 安全及適用性提示、配送詳情與自動填寫提示、訂單摘要、運費及出貨時效均顯示英文；訂單摘要商品名稱已顯示上述完整英文標題，沒有再出現 `Product name unavailable`。主導航於 English 模式顯示 **Cats**、**Dogs**、**Pet Supplies**，而首頁分類封面顯示 **Cats**、**Dogs**、**Canned Food**、**Pet Supplies**。

雙語回歸測試共 7 項全部通過，生產建置成功。專項 ESLint 檢查無錯誤；現有的 `<img>` 優化與 hook dependency 警告不影響本次功能。
