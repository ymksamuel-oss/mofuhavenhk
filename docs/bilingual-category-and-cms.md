# Mofu Haven 雙語分類與 CMS 升級紀錄

**更新日期：** 2026-09-03（GMT+8）  
**主要程式提交：** `44f7f0a9`、`3f707f8f`

## 修正重點

父子分類卡片過往以翻譯按鈕本身的顯示文字推測語系；該按鈕在兩種語系均可顯示中文縮寫，因此 English 模式仍可能取到中文欄位。現已改為直接使用 I18n 的 `locale` 狀態：中文讀取 `name_zh`，英文讀取 `name_en`，而系統名稱 `name` 只會在尚未輸入翻譯時作為安全備援。

為避免正式 Supabase 環境因欄位版本不一而阻塞，分類翻譯會同時儲存在既有 `store_settings` 的 `category_localizations` CMS 設定中。後台「分類卡片」每次儲存分類時，會一併更新其中文與英文標籤；伺服端建立分類樹時會將設定合併至每個父節點和子節點。

## 已寫入英文分類

| 中文分類 | English category name |
| --- | --- |
| 貓貓專區 | Cats |
| 狗狗專區 | Dogs |
| 寵物用品 | Pet Supplies |
| 凍乾食品 | Freeze-Dried Food |
| 乾糧 | Dry Food |
| 濕糧 | Wet Food |
| 貓貓罐頭／狗狗罐頭 | Canned Food |
| 貓咪／狗狗零食 | Treats |
| 貓砂 | Cat Litter |
| 餐具 | Feeding Essentials |

## 後台內容管理

| 內容類型 | 中文欄位 | 英文字段 | 前台行為 |
| --- | --- | --- | --- |
| 分類父子卡片 | 中文分類名稱 | English category name | 前台按所選語系顯示；適用主導覽、分類卡片及首頁封面入口。 |
| 精選寵物圖集 | 標題、詳細描述 | English title、English description | English 模式優先顯示英文字段；未填英文時保留中文作安全備援。 |

## 驗證結果

正式首頁已以 `?lang=en` 驗證。主導覽顯示 **Cats**、**Dogs**、**Pet Supplies**；首頁四張分類封面的覆蓋文字分別顯示 **Cats**、**Dogs**、**Canned Food**、**Pet Supplies**，並同步切換英文標題、說明、無障礙標籤與精選寵物區文案。

回歸測試共 6 項全部通過，生產建置成功完成。專項品質檢查無錯誤；專案仍有既有 `<img>` 優化與 hook 依賴提示，與本次語系功能無關。
