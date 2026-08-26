本機首頁驗證（`/?categorycleanup=20260826`）顯示 Banner 區不再包含「寵物分類／Shop by Category」藥丸式分類按鈕或 4 欄格狀導覽。Banner 後直接進入品牌標語區與產品內容，頂部 Header 仍保留「產品分類」按鈕作唯一主分類入口。桌面截圖顯示版面留白自然，沒有 Banner 高度跳動或元素重疊。

子分類頁本機驗證（`lang=zh`、附 cache-buster）：

| 路徑 | 頁面標題 | 可見商品結果 | 結論 |
|---|---|---|---|
| `/categories/cats/dry-food` | 貓乾糧 / 主糧 | 3 款 COMBO 700g／600g 貓乾糧；沒有罐頭、貓零食或狗狗品項。 | 通過：cats + dry-food 嚴格交集。 |
| `/categories/cats/wet-cans` | 罐罐 / 濕糧 | MediMousse 貓咪濕食及銀之匙 70g 貓罐頭；沒有乾糧、貓零食或狗狗品項。 | 通過：cats + wet-cans 嚴格交集。 |
| `/categories/dogs/food` | 狗狗食品 | d.b.f 狗狗罐頭／主食及日常食品；沒有貓咪品項或狗狗小食。 | 通過：dogs + food 嚴格交集。 |
| `/categories/dogs/snacks` | 狗狗小食 | DoggyMan、COMBO Pure、PETLINE 狗狗獎勵小食；沒有罐頭／主食或貓咪品項。 | 通過：dogs + snacks 嚴格交集。 |

以上結果與 `getCatProductsBySubcategory` 的 category AND subcategory 過濾規則及新增回歸測試一致。

導覽與手機版驗證：375px 截圖顯示手機 Banner 後直接為品牌標語與商品區，未出現已移除的分類格／藥丸區；Header 的漢堡按鈕仍可見。桌面實機點擊「產品分類」可展開 Mega Menu，並列出「罐罐 / 濕糧」、「貓乾糧 / 主糧」、「狗狗食品」、「狗狗小食」等精確子分類連結，連結目的地均為對應的 `/categories/{cats|dogs}/{subcategory}#products` 路由。手機 Header 實際開啟抽屜後，「產品分類」手風琴成功展開（`aria-expanded=true`），並提供同一組四個精確子分類連結；行動版主導覽功能通過。

正式網域驗證（`https://www.mofuhavenhk.com/?categorycleanup=e4b62432-r2`）：新版首頁已載入，Banner 及其後不再有「Shop by Category」分類格／藥丸區；頂部仍保留「Shop Categories」主入口。`/categories/cats/dry-food?lang=zh` 顯示 3 款 COMBO 貓乾糧，沒有濕糧、零食或狗狗產品；`/categories/dogs/snacks?lang=zh` 顯示 DoggyMan、COMBO Pure、PETLINE 等狗狗小食，沒有狗狗食品主食或貓咪產品。正式部署與嚴格子分類篩選均通過。正式首頁點擊「Shop Categories」亦成功展開 Mega Menu，內含 `/categories/cats/wet-cans`、`/categories/cats/dry-food`、`/categories/dogs/food`、`/categories/dogs/snacks` 等精確路由。實際點擊「Dry food / Staple」後成功進入 `/categories/cats/dry-food?lang=en#products`，頁面只列出 3 款貓乾糧，導覽與篩選結果一致。
