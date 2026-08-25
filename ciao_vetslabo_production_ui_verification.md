# CIAO 與 Vet's Labo 20 款正式前台驗證

**檢查日期：** 2026-08-25（GMT+8）  
**正式站：** https://www.mofuhavenhk.com/

| 檢查頁面 | 結果 |
| --- | --- |
| `/categories/cats/snacks?lang=zh#products` | 正式 cat snacks 分類已即時讀取新的 CIAO 商品。搜尋「香烤鰹魚干瑤柱」可找到第 1 款，並同時顯示清理後商品圖、HK$16.00 現價、HK$18.00 劃線原價、`-11%` 標籤和「加入購物籃」。 |
| 新 CIAO 商品卡資料 | 前台顯示雙語 metadata 的中文名稱、50g 規格和安全的包裝標示描述。Stripe 圖片是 `files.manuscdn.com` 的清理後 CDN URL；沒有使用原始手機截圖。 |

| `/product/prod_V8fduDqyGKiazf?lang=zh`（CIAOVL-01） | 商品頁顯示 `files.manuscdn.com` 清理圖 URL、HK$16.00 現價、HK$18.00 劃線原價、`-11%`、50g、現貨、貓咪濕潤小食與加購控制項。 |
| `/product/prod_V8feViin1yPowA?lang=zh`（CIAOVL-17） | 商品頁顯示 `files.manuscdn.com` 清理圖 URL、HK$38.00 現價、HK$42.00 劃線原價、`-10%`、95g、現貨、貓咪濕食與加購控制項。 |

備註：瀏覽器的文字／DOM 擷取已確認兩款商品圖 URL 均指向清理後 CDN 圖片。截圖載入瞬間的左側圖片區可能顯示為淺色空白，屬此前已觀察到的遠端圖首次視覺載入現象；不影響 DOM 圖片 URL 或 Stripe 圖片資料。現有 Next 設定已允許 `files.manuscdn.com`，本次沒有修改既有遠端圖片配置。

下一步：建立／失效一個未付款 hosted Checkout 測試 Session，確認新商品使用指定 Stripe Price ID 與伺服器重建後的正確金額。
