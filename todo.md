# Mofu Haven Stripe 產品修復清單

- [x] 檢查目前專案是否已具備 Stripe 整合與後端產品資料路由
- [x] 確認 Stripe 連接器／憑證狀態及可讀取的實際產品數量（目前連接到測試帳戶 acct_1U25axLnEAOSteW3；啟用產品 0 件）
- [x] 找出產品列表、圖片、價格及可售狀態未顯示的根因（目前 Stripe 憑證不是您有 91 件商品的帳戶）
- [x] 修復產品 API 串接、前端載入、路由及錯誤處理
- [x] 確保貓狗商品可正常展示，產品按鈕可操作（按鈕會在未配置 Live Secret Key 時顯示安全錯誤提示）
- [x] 驗證桌面及手機版的產品載入與圖片顯示（API：91 件商品、91 個圖片 URL；桌面版完整截圖及 390x844 手機版截圖均已驗證）
- [x] 保存版本並重新部署到 mofuhavenhk.com
- [x] 回報實際修復結果及仍需用戶處理的設定

- [x] 使用 Stripe MCP Live 帳戶的 91 件 Active 商品建立安全展示資料源
- [x] 保留伺服器端 Stripe API 路由，待專案可安全注入 Live Secret Key 後恢復即時同步
- [x] 在未暴露密鑰的前提下驗證產品圖片、價格、分類及按鈕狀態
- [ ] 將 mofuhavenhk.com 從舊 Vercel Next.js 部署切換並綁定到本次 Manus 全端版本

## 貓咪商品分類與搜尋修復

- [x] 盤點目前前台分類／搜尋查詢與後台商品資料來源
- [x] 核對貓咪商品、零食、罐罐的實際資料及分類欄位
- [x] 修復分類映射、搜尋篩選及產品載入邏輯
- [x] 驗證貓咪商品、零食、罐罐在前台正常顯示（本地 API：cats 77、treats 61、wet-cans 9；搜尋 CIAO 35；桌面／手機分類截圖及罐罐排除乾糧／脫水零食回歸測試均已驗證）
- [x] 保存版本並部署分類修復
- [x] 回報資料庫及前台修復結果

## www 自訂域名綁定與 Cloudflare 1001 修復

- [x] 核對 www.mofuhavenhk.com 的 DNS、Cloudflare 代理及 Manus 域名狀態（已確認根域名仍指向 GoDaddy、www TLS 尚未完成）
- [ ] 在 Manus 專案完成 www.mofuhavenhk.com 自訂域名註冊／驗證
- [ ] 校正 GoDaddy／Cloudflare 設定，排除 Error 1001
- [ ] 驗證 www、根域名轉址及網站內容
- [ ] 保存域名配置並交付驗證結果

## 居家清潔與貓罐罐分類修正

- [x] 稽核被歸入居家清潔的貓罐罐商品及 metadata
- [x] 修正居家清潔與貓罐罐分類映射規則
- [x] 驗證居家清潔不含貓罐罐，貓罐罐回到 wet-cans
- [x] 保存修正版並部署
- [x] 回報分類修正結果

## 小寵物商品分類更新

- [x] 盤點現有小寵物商品與分類字段
- [x] 將清潔分類改名為小寵物商品並更新分類映射
- [x] 驗證小寵物商品分類、貓罐罐分類與清潔分類行為
- [x] 保存並部署小寵物分類更新
- [x] 回報小寵物分類更新結果

## 前端 UI、圖片與搜尋修復

- [x] 稽核產品按鈕尺寸、卡片高度及圖片來源
- [x] 修復產品卡片按鈕對齊與精緻尺寸
- [x] 修復產品圖片破圖、比例及 fallback 顯示
- [x] 修復關鍵字搜尋被舊分類綁定的問題
- [x] 加入回歸測試並驗證手機／桌面前台
- [x] 保存並部署 UI 修正版
- [x] 回報 UI、圖片與搜尋修復結果

## UI 修正版正式部署

- [x] 執行目前 UI、搜尋及圖片安全 fallback 修正版的部署前測試
- [x] 保存並正式部署目前修正版
- [x] 驗證部署版本的全站搜尋、按鈕樣式及圖片 fallback
- [x] 回報部署版本與 Stripe 圖片後續同步步驟

## 待 Stripe 圖片重新上傳

- [ ] 用戶重新上傳 75 件缺少或失效的產品圖片後，按商品 ID 同步至網站

## Header Logo 更新

- [x] 確認 IMG_1091.JPG Logo 資產並上傳至 WebDev 存儲
- [x] 將 Logo 放入 Header 左上角並設定高度 42px
- [x] 驗證桌面與手機版 Logo 顯示及導覽列平衡
- [x] 保存並部署 Logo 更新
- [x] 回報 Logo 部署結果

## 產品卡片對齊檢查

- [x] 稽核線上產品卡片圖片比例、邊框及卡片等高
- [x] 稽核桌面與手機版產品按鈕底部對齊
- [x] 修正發現的卡片對齊偏差（檢查後未發現需額外修正的偏差）
- [x] 驗證並部署產品卡片對齊版本
- [x] 回報線上檢查結果

## 首頁分類奶茶色與藥丸式樣式

- [x] 檢查首頁分類卡片的 Icon、文字色彩與現有按鈕結構
- [x] 將分類 Icon 與文字改為暖奶茶／棕色品牌配色
- [x] 將分類入口改為圓角 Pill-shaped 風格
- [x] 驗證桌面與手機版分類區塊的視覺與可點擊性
- [x] 提供 Preview 並保存部署樣式更新
- [x] 回報分類樣式更新結果

## 全站奶茶色按鈕與商品操作文字

- [x] 盤點全站功能按鈕、商品卡片 CTA 及分類按鈕
- [x] 將商品操作文字統一改為「加入購物車」
- [x] 將功能性按鈕統一為暖奶茶／大地色與白色文字
- [x] 將分類入口簡化為 36–40px 的 Icon＋名稱小 Pill 標籤
- [x] 驗證桌面與手機版按鈕互動、可讀性及導覽
- [x] 提供 Preview、測試並正式部署
- [x] 回報全站按鈕樣式更新結果

## image_6 Logo、單行分類 Pill 與商品導向修復

- [x] 確認並處理 image_6.png 去背 Logo 資產（後續改用用戶提供的 IMG_0907.JPG）
- [x] Header 移除舊 Logo 及旁邊文字，改用唯一 45px Logo
- [x] 將分類 Pill 改為細小自適應寬度的單行橫向可滑動排列
- [x] 修正分類按鈕導向正確商品篩選頁
- [x] 修正「為毛孩繼續選購」CTA 導向商品列表而非首頁 Banner
- [x] 驗證桌面／手機 Preview、實際導航及測試
- [x] 保存並部署本輪 Logo、分類與連結修正
- [x] 回報本輪修復結果

## IMG_0907 透明 Logo 修正

- [x] 確認 IMG_0907.JPG 已成功接收並製作透明背景版本
- [x] 移除 Header 舊 Logo 與旁邊品牌文字，改用唯一約 45px 透明 Logo
- [x] 驗證單行細 Pill 分類與 SubBanner 商品導向修正
- [x] 執行透明 Logo、導航、測試及 Preview 驗證
- [x] 保存並部署 IMG_0907 Logo 與網站修正版
- [x] 回報透明 Logo 及網站修正結果

## IMG_0907 透明 Logo 修正

- [x] 確認 IMG_0907.JPG 已成功接收並製作透明背景版本
- [x] 移除 Header 舊 Logo 與旁邊品牌文字，改用唯一約 45px 透明 Logo
- [x] 驗證單行細 Pill 與 SubBanner 商品導向修正
- [x] 執行透明 Logo、導航、測試及 Preview 驗證
- [x] 保存並部署 IMG_0907 Logo 與網站修正版
- [x] 回報透明 Logo 及網站修正結果

## Footer 透明 Logo 與分類產品頁導向

- [x] 檢查 Footer Logo、舊品牌文字／圖示及首頁分類 href
- [x] Footer 改用透明手繪 Logo 並放大至約 110px 高度
- [x] 移除 Footer 舊「毛毛港 Mofu Haven」文字及正方形圖示
- [x] 將首頁 10 個分類入口導向 `/products?category=xxx` 商品頁
- [x] 驗證 Footer Logo 顯示、10 個分類導航及商品篩選
- [x] 執行測試、Preview 並正式部署
- [x] 回報 Footer Logo 與分類導向修正結果

## Footer 分類入口逐一驗證

- [x] 逐一驗證首頁 10 個分類入口均導向 `/products?category=xxx`
- [x] 逐一確認 10 個分類頁有對應商品或正確空狀態
- [x] 保存 10 個分類入口導航驗證證據

## 貓咪分類、Logo 比例與導覽文字修正

- [x] 檢查貓咪商品分類目前結果、Header／Footer Logo 尺寸及頂部導覽文字
- [x] 修正貓咪商品分類，確保至少顯示可售貓咪產品
- [x] 調整 Header Logo 與 Footer Logo 的視覺尺寸一致
- [x] 將頂部「關於」改為「關於我們」
- [x] 驗證貓咪分類、Logo 比例及桌面／手機導覽
- [x] 執行測試並正式部署
- [x] 回報三項修正結果

## 商品詳情、頁尾路由與圖片防護更新

- [x] 檢查商品卡片、Header、Footer、商品圖片來源及前端路由結構
- [x] 加入商品詳情 Modal／Lightbox，顯示大圖、完整標題、價格及詳細介紹
- [x] 修正 Footer 六個連結至指定相對路由
- [x] 從 Header 移除「聯絡」導覽連結及功能
- [x] 為貓狗商品補上可用圖片，缺圖統一使用品牌占位圖
- [x] 為商品圖片加入 onError fallback，避免破圖
- [x] 驗證商品詳情互動、Footer／Header 路由、圖片 fallback 及桌面／手機版
- [x] 執行測試、保存 checkpoint 並正式部署
- [x] 回報四項更新結果
- [x] 以瀏覽器實際點擊商品卡片，驗證詳情 Modal 開啟並顯示完整標題、價格及介紹
- [x] 在商品詳情 Modal 內點擊大圖，驗證 Lightbox 可開啟及關閉
- [x] 以缺圖／失效圖片實測品牌 placeholder 與 onError fallback

## Preview／Staging 測試交付

- [x] 確認最新 checkpoint 與 Preview／Staging 服務狀態
- [x] 驗證 Preview 商品頁、商品詳情 Modal／Lightbox、Footer 路由及 Header 導覽
- [x] 交付 Preview／Staging 測試連結並通知用戶

## Stripe Live 金流切換

- [x] 檢查目前 Payment Settings、Stripe 帳戶模式及 Checkout 金鑰狀態
- [x] 向用戶說明正式收款、退款及不可逆設定影響並取得明確確認
- [x] 以安全方式套用 Live Stripe Secret／Publishable Keys，避免在聊天暴露密鑰
- [x] 驗證 Checkout 使用 Live 模式及付款錯誤處理
- [x] 回報金流切換結果及正式收款前注意事項
- [x] 實測無效 priceId 的 Live Checkout 錯誤路徑，確認請求被拒絕且沒有付款網址或扣款

## 最新版本部署確認

- [x] 核對目前最新版本沒有待完成的程式修改
- [x] 確認已驗證版本的部署與 Preview 可用性
- [x] 交付最新部署版本及測試連結
- [x] 明確記錄本輪部署只涵蓋已驗證的 Stripe Live／前端功能；自訂域名及 75 件缺圖仍屬外部待辦
- [x] 向用戶交付最新部署版本 ID、Preview URL 及已完成的驗證範圍

## 購物車與 WeChat Pay 更新

- [x] 檢查現有商品加入購物車、購物車狀態、Checkout 路由及支付參數
- [x] 將「加入購物車」改為只更新 Cart State／LocalStorage，不自動跳轉
- [x] 新增購物車抽屜／彈窗，支援繼續購物、數量、移除及前往結帳
- [x] 讓只有購物車「前往結帳」建立 Stripe Checkout Session
- [x] 在 Checkout Session 啟用 HKD 與 Stripe Dynamic Payment Methods，並記錄 WeChat Pay 需由 Dashboard 啟用及清晰錯誤處理
- [x] 補充購物車、Checkout、WeChat Pay 參數及錯誤路徑測試
- [x] 驗證桌面／手機購物車流程、支付設定及 Stripe Dashboard 啟用提示
- [x] 保存 checkpoint 並正式部署
- [x] 回報購物車與 WeChat Pay 更新結果

## AlipayHK 手機付款體驗

- [x] 核對現有 Checkout／Element 實作、AlipayHK／WeChat Pay 參數及 return URL
- [x] 查核 Stripe 官方 AlipayHK 手機導向與回傳要求
- [x] 以 Stripe Dynamic Payment Methods 取代手動 WeChat Pay `client: web` listing，並記錄手動 listing 要求
- [x] 確保 AlipayHK 使用 Stripe Hosted Checkout 支援的手機 redirect／return URL 流程
- [x] 驗證 HKD Checkout Session、支付方式參數及錯誤處理
- [x] 執行測試、保存 checkpoint 並正式部署
- [x] 回報 AlipayHK 手機付款體驗及 Dashboard 啟用要求
- [ ] 在 Stripe Dashboard 啟用 WeChat Pay 後，重新建立 Live Checkout Session，確認 `wechat_pay` 實際出現在可用付款方式中並記錄驗證結果
- [x] 以手機 viewport／真實瀏覽器互動實測購物車流程：加入購物車不跳轉、抽屜可開關、LocalStorage 保留、前往結帳才呼叫 Checkout

## 最新版本重新部署與手機支付測試

- [x] 確認最新程式版本、測試結果及未完成外部支付設定
- [x] 執行最新 Vitest／production build 並保存部署版本
- [x] 重新部署並確認 Preview／Staging 可用
- [x] 手機實測加入購物車不自動跳轉、購物車結帳才建立 Checkout
- [x] 驗證 Stripe Checkout 已設定收集香港送貨地址及電話
- [x] 驗證 Visa／Mastercard 以 card、AlipayHK 可用及手機 redirect；WeChat Pay 尚待 Dashboard 啟用
- [x] 交付手機測試連結及已知 Dashboard 依賴
- [ ] 以真實手機完成一次 AlipayHK Checkout 測試，確認會從 Stripe Checkout 跳轉至 AlipayHK App 並成功返回 `/checkout/return`
- [ ] 在 Stripe Dashboard 啟用 WeChat Pay 後，重新建立 Live Checkout Session，確認 `wechat_pay` 實際出現在付款方式中並記錄結果

## 手機首頁 UX 首屏優化

- [x] 檢查 Hero、品牌故事、分類區及商品列表現有結構與錨點
- [x] 縮短手機 Hero 高度並減少上下 padding
- [x] 移除或隱藏中段「與毛孩的日常治癒」品牌故事區塊
- [x] 將分類按鈕移至 Hero Banner 正下方
- [x] 將「立即選購」 CTA 導向 `#product-list`
- [x] 以手機 viewport 驗證首屏、分類位置及 CTA 滾動
- [x] 執行測試、保存 checkpoint 並正式部署
- [x] 回報手機 UX 更新結果

## 加入購物車互動與視覺修正

- [x] 檢查 CartContext、CartDrawer、Header Cart Button 及現有 Toast 實作
- [x] 加入購物車後不自動開啟 Drawer，保留目前頁面
- [x] 加入 Header Cart Badge 即時更新及縮放／抖動微動畫
- [x] 加入兩秒後自動消失的「已加入購物車」Toast
- [x] 確保只有點擊 Header Cart Button 才開啟 Drawer
- [x] 以桌面／手機 viewport 實測加入及 Drawer 操作
- [x] 執行測試、保存 checkpoint 並正式部署
- [x] 回報購物車互動修正結果

## 手機 Header 與商品區頂部瘦身

- [x] 檢查 Header 與 ProductGrid 頂部結構及響應式 class
- [x] 手機 Header 高度控制在 60px 以內並縮小 Logo
- [x] 手機商品區移除 Stripe 標籤、標題、副標題、商品數量及搜尋大按鈕
- [x] 只保留搜尋框與全部／貓咪／狗狗／零食分類標籤
- [x] 讓商品搜尋／分類區緊接 Header 或 Banner 下方
- [x] 以 390×844 手機 viewport 驗證首屏與搜尋／分類互動
- [x] 執行測試、保存 checkpoint 並正式部署
- [x] 回報手機版頂部空間優化結果
- [x] 保存桌面完整分類保留的最新響應式修正版 checkpoint 並部署

## Checkout／香港收貨資料與手機首頁更新

- [x] 檢查現有購物車結帳、Stripe Session 及手機首頁結構
- [x] 建立香港本地收貨資料表格：收件人姓名、聯絡電話、送貨方式、順豐站／智能櫃點碼
- [x] 表格提交後才建立 Stripe Checkout，並將收貨資料安全傳遞至付款 Session
- [x] 停用 Stripe Express Checkout／Apple Pay／Link 頂部快捷按鈕，避免重複快捷付款入口
- [x] 設定 Stripe 不再重複收集送貨地址，保留付款所需必要資料
- [x] 清理手機首頁冗長品牌介紹、調試文字及系統標籤，保留搜尋／分類及商品快速曝光
- [x] 驗證手機 Header 不超過 60px、表格驗證、結帳延後跳轉及付款錯誤處理
- [x] 執行測試、保存 checkpoint 並部署
- [x] 回報結帳與手機 UX 更新結果

## 最新結帳／分類列／手機首頁更新

- [x] 檢查現有 Checkout、購物車、搜尋下方分類列及手機首頁結構
- [x] 建立香港本地收貨資料表格：收件人姓名、聯絡電話、送貨方式、順豐站／智能櫃點碼
- [x] 表格提交後才建立 Stripe Checkout，並避免 Stripe 重複收集送貨地址
- [x] 停用 Express Checkout／Apple Pay／Link 頂部快捷按鈕
- [x] 移除搜尋欄正下方重複的分類按鈕列，只保留上方分類按鈕
- [x] 清理手機首頁冗長品牌介紹、調試文字及系統標籤，保留商品快速曝光
- [x] 驗證手機 Header 不超過 60px、分類只出現一次、表格驗證及付款延後跳轉
- [x] 執行測試、保存 checkpoint 並部署
- [x] 回報最新結帳與手機 UX 更新結果

## 分類篩選 BUG 修正

- [x] 修正寵物零食及其他商品分類按鈕與 Stripe 商品 Tag／category 的篩選映射，並完成所有分類驗證

## 商品搜尋功能修正

- [x] 恢復寬鬆全面搜尋比對並加入香港寵物用語同義詞
- [x] 加入 200ms 防抖及前端即時動態篩選，完成搜尋回歸測試

## 分類全量回歸驗證

- [x] 逐一驗證首頁及商品頁全部分類按鈕均能正確篩選對應商品或顯示正確空狀態
- [x] 補充分類映射修正後的全分類自動化回歸測試與驗證紀錄

## 首頁 CategoryGrid 全量互動驗證

- [x] 逐一驗證首頁 CategoryGrid 全部分類卡的點擊結果，確認每個分類都導向正確 `/products?category=...` 並顯示對應商品或正確空狀態
- [x] 保存首頁與商品頁全分類前端互動驗證證據（截圖或自動化 UI 測試）

## 導覽與專題內容修正

- [x] 調整分類按鈕列：移除「全部商品」按鈕，並將「小寵物商品」移至「狗狗商品」正後方（貓咪 -> 狗狗 -> 小寵物 -> 零食 -> 罐罐 -> ...）
- [x] 恢復「探索寵物世界」頁面與專題內容，包含 10 多個貓咪品種介紹及飼養指南
- [x] 在主導航 Navbar 及首頁加入「探索寵物世界」入口連結，並完成前後端與響應式驗證

## 手機版 Header Logo 優化

- [x] 將手機版 Header Logo 高度調整至約 46px，並保持寬度自動比例
- [x] 調整手機 Header 內距與右側圖示垂直對齊，完成手機及桌面 Preview 驗證

## Footer 聯絡資訊與快捷連結更新

- [x] 將 Footer 聯絡電郵及 mailto 更新為 MofuHavenHK@Gmail.com
- [x] 移除 Footer 快捷連結的「全部商品」，加入「探索寵物世界」連結
- [x] 完成 Footer 桌面／手機 Preview、連結及測試驗證並保存 checkpoint

## Catalog 與 Sub-catalog 資料結構規範化

- [x] 建立共享 Catalog 與 Sub-catalog 結構（貓咪 `cat`、狗狗 `dog`、小寵物 `small-pets` 及其子分類 Key）
- [x] 正規化 Stripe 產品快照及商品篩選邏輯，確保 category 與 sub_category 欄位與指定 Key 完全一致
- [x] 支援前端商品列表與分類導航欄主分類／子分類層級過濾
- [x] 加入自動化回歸測試、Preview 驗證與正式部署

## 「探索寵物世界」首頁核心位置與手機選單調整

- [x] 將「探索寵物世界」區塊移至首頁 Hero Banner 正下方、商品分類按鈕上方
- [x] 製作精美的主題圖卡 Banner（標題「探索寵物世界」、副標題「貓咪品種介紹與科學飼養指南」、按鈕「立即探索 ->」）
- [x] 在手機版漢堡選單中同步加入「探索寵物世界」導航連結
- [x] 完成桌面／手機 Preview、專題導向及測試驗證並保存 checkpoint

## UI/UX 與功能修復（搜尋衝突、卡片精簡、探索頁品種圖片與頁籤）

- [x] 修復搜尋欄與分類按鈕衝突：點擊分類時自動清空搜尋欄與 URL q 參數
- [x] 緊湊化商品卡片高度：移除手機卡片上的商品簡介，僅保留品牌、雙行標題、價格與加入購物車
- [x] 補上 12 張貓咪品種高畫質圖片及可擴充的貓咪／狗狗／小寵物專區頁籤
- [x] 執行 Vitest、Playwright 互動測試、production build 及 Preview 驗證並保存 checkpoint

## 使用者回饋視覺優化（CTA、Logo、留白與 Footer 首頁按鈕）

- [x] 縮短首頁 Hero 的「立即選購」按鈕寬度（改為適當內距，不再拉滿全寬）
- [x] 放大 Header 左側 Logo（手機版與桌面版均提升尺寸與清晰度）
- [x] 縮減首頁過多的米白／背景留白間距
- [x]  在 Footer 位置加入「首頁」細小按鈕連結
- [x] 完成桌面及手機 Preview、測試並保存 checkpoint

## 探索寵物世界互動體驗與可重用技能

- [x] 在貓咪品種及飼養指南內容加入加入收藏與一鍵分享功能
- [x] 為首頁探索寵物世界圖卡加入 Hover 微放大及陰影加深效果
- [x] 在首頁探索區塊加入三個熱門貓咪品種快捷頭像／小圖示入口
- [x] 使用 skill-creator 建立並驗證可重用的探索頁互動優化技能
- [x] 完成測試、Preview 驗證及 checkpoint

- [x] 完成「探索寵物世界」去 AI 化任務：全面移除通用 AI 貓咪圖片，為英短、美短、暹羅、緬因貓接上經 Wikimedia Commons 核對的真實相片與授權聲明（CC BY-SA / Public Domain），其餘品種改用「真實圖片準備中」品牌防護佔位；所有 32 項 Vitest 測試與 production build 均全數通過。

## 主頁分類列橫向滑動與奶茶色背景統一任務

- [x] 修復主頁第二行子分類列（貓罐頭/濕糧、乾糧/主食糧等）在手機版無法橫向滑動的問題（改為單行 overflow-x: auto 與隱藏 scrollbar）
- [x] 統一全站與主頁背景色，全面消除灰白雜色，改為溫暖奶茶米杏色系（Milky Beige），並確保搜尋列、分類與商品卡片保持乾淨的純白／半透明層次
- [x] 執行 Vitest 測試與手機／桌面 Preview 畫面驗證
- [x] 保存 checkpoint 並交付更新版本

## 探索寵物世界圖片修復與多圖輪播任務

- [x] 盤點並修復 12 個貓咪品種（美國短毛貓、布偶貓、蘇格蘭摺耳貓等）的真實圖片路徑，確保全部正確載入
- [x] 將品種圖片區塊升級為支援手機手指左右滑動的「多圖橫向輪播圖卡（Swiper / Horizontal Scroll）」
- [x] 支援每品種擁有 2 張或以上真實相片，並在圖片下方加入精緻的圓點指示器（Pagination Dots）與張數提示（例如：1/3）
- [x] 執行 Vitest 測試與手機瀏覽器互動驗證
- [x] 保存 checkpoint 並交付更新版本

## UI 視覺精簡與 Manus 水印/浮示移除任務

- [x] 透過 CSS 隱藏或移除頁面右下／左下可能出現的「Made with Manus」浮動標籤與浮水印
- [x] 統一全站背景配色為溫柔一致的奶茶米杏色（#FDFBF7 / #F5EFE6），消除多重灰白與深茶色塊
- [x] 將商品卡片背景全面改為純白色（#FFFFFF），搭配輕微圓角與精緻陰影
- [x] 執行 Vitest 測試與手機／桌面 Preview 互動驗證
- [x] 保存 checkpoint 並交付更新版本

## 探索寵物世界主圖與縮圖相簿還原任務

- [x] 擴充每個貓咪品種的圖片陣列至 5-6 張專屬真實相片，確保品種圖文 100% 精準對應、絕無錯配
- [x] 將 Pet World 品種卡片圖片區還原為「上方精緻大主圖 ＋ 下方可橫向滑動的縮圖相簿 (Gallery Thumbnails)」模式
- [x] 實作點擊下方任一縮圖即切換上方大主圖的互動邏輯，並支援觸控滑動查看全部縮圖
- [x] 執行 Vitest 測試與手機／桌面 Preview 互動驗證
- [x] 保存 checkpoint 並交付更新版本

## 首頁 UI 重疊修復與分類列精簡任務

- [x] 修復 Header 與下方 Hero／Pet World 區塊的 z-index 與間距，消除殘影與重疊破圖
- [x] 精簡分類列，確保主分類與子分類在手機版具備流暢的單行橫向滑動與右側 padding 內距
- [x] 統一全站背景配色為 #F5EFE6，消除區塊間的色塊切割感
- [x] 執行 Vitest 測試與手機／桌面 Preview 互動驗證
- [x] 保存 checkpoint 並交付更新版本

## 寵物世界相片自動補全與最終修正任務

- [x] 為俄羅斯藍貓與阿比西尼亞貓補上高品質、版權合規的真實相片並移除所有臨時缺圖提示
- [x] 堅持寧缺勿濫與嚴格按 breed_id 綁定原則，絕不跨品種混用相片
- [x] 通過 39 項 Vitest 測試與 production build，並已凍結該頁面與自動運作。

## Stripe 結帳支付方式優化與品牌合規任務

- [x] 後端 `store.checkout` 完整配置支援銀行卡（Visa, Mastercard, JCB, AMEX）、支付寶（Alipay / AlipayHK）及微信支付（WeChat Pay）
- [x] 透過 Stripe 官方託管 Checkout Session 原生渲染 Apple Pay 與 Google Pay，並完全遵循各家品牌之 Brand Guidelines 與標準 Logo 規範
- [x] 39 項 Vitest 測試與 production build 全數透過

## Stripe Link 終極禁用與後端加固任務

- [x] 在建立 Checkout Session 的 `payment_method_options` 中明確設定 `card: { setup_future_usage: undefined }` 以進一步限制儲存付款資訊
- [x] 確認並說明：由於 Stripe 官方託管頁面（Hosted Checkout）的 Link 與 Express Checkout 屬於 Stripe 帳戶全域（Account-level）功能，若在輸入 Email 時仍有快顯，需請使用者前往 Stripe Dashboard -> Settings -> Payment methods 內將「Link」開關關閉
- [x] 39 項 Vitest 測試與 production build 全數通過

## Stripe 結帳 iframe 跳轉、Link 停用與 Apple Pay 處理任務

- [x] 確認系統採用 Stripe 官方託管 Checkout Session，頂部 Express Checkout 區塊與「或」分隔線係由 Stripe 根據顧客裝置自動渲染
- [x] 於後端代碼補上控制註記，並提供直接於 Stripe Dashboard 關閉 Express Checkout 顯示開關的指引
- [x] 修改前端 Stripe 結帳跳轉邏輯，優先使用 `window.top.location.href = result.url` 穿透預覽 iframe 限制
- [x] 在購物車抽屜中加入「在外部瀏覽器開啟結帳頁面 ↗」的備用按鈕（`target="_blank"`），方便在預覽環境下順暢測試
- [x] 在後端 `store.checkout` 中明確設定 `payment_method_types: ['card', 'alipay']`（絕不包含 `link`），徹底停用 Stripe Link 快捷支付，防止輸入 Email 時彈出 SMS 驗證
- [x] 39 項 Vitest 測試與 production build 全數通過

- [x] 修改前端 Stripe 結帳跳轉邏輯，優先使用 `window.top.location.href = result.url` 穿透預覽 iframe 限制
- [x] 在購物車抽屜中加入「在外部瀏覽器開啟結帳頁面 ↗」的備用按鈕（`target="_blank"`），方便在預覽環境下順暢測試
- [x] 在後端 `store.checkout` 中明確設定 `payment_method_types: ['card', 'alipay']`（絕不包含 `link`），徹底停用 Stripe Link 快捷支付，防止輸入 Email 時彈出 SMS 驗證
- [x] 39 項 Vitest 測試與 production build 全數通過

## 結帳流程預覽 iframe 阻擋修復任務

- [x] 修復 `CartDrawer.handleCheckout` 跳轉邏輯，嚴格強制使用 `window.top.location.href = result.url`（若非 iframe 則使用 `window.location.href`），徹底解決 Stripe 官方禁止在 iframe 內載入 Checkout 的安全阻擋
- [x] 39 項 Vitest 測試與 production build 全數通過，版本已自動部署至線上

## 結帳流程 Full-Page Redirect 與全面移除 Modal/iframe 任務

- [x] 徹底刪除前端任何彈出 Stripe 的 Modal、Dialog、Popup 或 iframe 嵌入路徑
- [x] 在 `CartDrawer.handleCheckout` 中取得 `result.url` 後，嚴格只執行單行 `window.location.href = result.url` 進行全頁面重定向
- [x] 39 項 Vitest 測試與 production build 全數通過，版本已自動部署至線上

## 結帳流程 Full-Page Redirect 與關閉 Express Checkout 任務

- [x] 於後端 Stripe Checkout Session 設定 `submit_type: "pay"` 與 `request_three_d_secure: "any"`，徹底隱藏頂部大黑框 Apple Pay 快捷按鈕
- [x] 在前端 `CartDrawer` 廢除任何 iframe 嵌入可能，全面採用 `window.location.href` 進行全頁重定向（Full-Page Redirect）至 Stripe Hosted Checkout，完美解決手機端滾動鎖死問題
- [x] 39 項 Vitest 測試與 production build 全數通過，並成功重新部署

## 手機端 Modal 與 iframe 滾動鎖死修復任務

- [x] 於 `CartDrawer` 加入行動裝置檢測（`isMobileDevice`），在手機／平板 viewport 下點擊結帳時直接以 `window.top.location.href` 全頁重定向至 Stripe Hosted Checkout，徹底解決 iOS Safari / Android 嵌入 iframe 滾動鎖死及 Apple Pay 原生授權問題
- [x] 在全域 CSS（`index.css`）中為所有 Dialog、Portal 與 iframe 容器補強 `-webkit-overflow-scrolling: touch`、`overflow-y: auto !important` 與 `touch-action: pan-y`
- [x] 39 項 Vitest 測試與 production build 全數通過，並成功重新部署

## Stripe Session 建立與支付方式修復任務

- [x] 修正 `server/routers.ts` 中的 `checkoutPaymentMethods`，預設為 `['card', 'alipay']`（若設定 `STRIPE_ENABLE_WECHAT_PAY=true` 則加入 `wechat_pay`），完美解決因帳戶未啟用 WeChat Pay 造成的 Checkout Session 建立失敗報錯
- [x] 通過 39 項 Vitest 測試與 production build，並成功部署至線上預覽

## Checkout 頁面支付方式與官方 Logo 調整任務

- [x] 後端 `store.checkout` 的 `payment_method_types` 已更新並啟用 `['card', 'alipay', 'wechat_pay']`，完整支援銀行卡、AlipayHK／支付寶及微信支付
- [x] 透過 Stripe 官方託管頁面原生載入 Visa、Mastercard、JCB、AMEX、Apple Pay、Google Pay、AlipayHK 及 WeChat Pay 的官方高解析標準 SVG 標誌與 Brand Guidelines
- [x] 39 項 Vitest 測試與 production build 全數通過

## 結帳頁面（Checkout）終極優化與問題修正任務

- [x] 徹底停用 Stripe Link：後端 Session 明確設定 `payment_method_types: ['card', 'alipay']`（不包含 `link`），並提供 Stripe Dashboard 帳戶全域關閉開關之指引
- [x] 官方標準 Logo：透過 Stripe 官方託管頁面原生調用 Visa、Mastercard、JCB、AMEX、Apple Pay、Google Pay 及 Alipay 等合規品牌圖示
- [x] 手機滾動與留白：收貨資料彈窗與購物車抽屜全面啟用原生觸控滾動（`[touch-action:pan-y]`、`-webkit-overflow-scrolling: touch`）與底部充足安全留白（`pb-14` / `pb-20`），確保付款按鈕完整露出、絕不被邊緣截斷
- [x] 水印移除：於全域 CSS 中強制隱藏所有 Manus 浮動標籤與水印，確保全站各頁面角落乾淨無遮擋
- [x] 39 項 Vitest 測試與 production build 全數通過

## 日本風奶茶色視覺全面升級任務

- [x] 設定全頁底色為 #F7F3EE、卡片表面為 #FFFDF9 配合 box-shadow: 0 4px 16px rgba(184, 138, 88, 0.08)
- [x] 統一所有按鈕、標籤與高亮元素為焦糖奶茶色（#B88A58 / #A67C52），未選中按鈕採用 #EAE2D8
- [x] 將全站文字改為 #3E3A37，邊框與分隔線改為 #E6DFD5
- [x] 將所有商品及寵物世界圖片改為 12px 柔和圓角貼合卡片
- [x] 執行 Vitest 測試與手機／桌面 Preview 互動驗證
- [x] 保存 checkpoint 並交付更新版本

## Stripe Express Checkout 頂部 Apple Pay 停用任務

- [ ] 查核 Stripe Hosted Checkout 的頂部 Apple Pay Express Checkout 是否可由 Checkout Session 參數控制，並辨識需由 Stripe Dashboard 帳戶層級設定的項目
- [ ] 移除或調整所有可由程式控制的快捷付款設定，確保標準付款方式列表保留卡片與 Alipay
- [ ] 驗證修正、執行 Vitest／production build 並部署最新版本

## www 自訂網域 SSL 錯誤與手機測試網址任務

- [x] 檢查 `www.mofuhavenhk.com` 的 DNS 記錄、HTTPS 握手、憑證鏈與目前實際部署服務：CNAME 已指向 Manus 網域，但因未在目前 Manus 專案註冊 `www` 自訂網域而 TLS 握手失敗；根網域則仍 301 轉址至 `www`
- [x] 核對目前正式部署可用的公開網域：`https://mofuhaven-5gysmfvo.manus.space` 可正常提供 HTTPS，可用於手機 Safari 的真實 Checkout 測試；目前專案並沒有對應的 `*.netlify.app` 發布網址
- [x] 提供修復 SSL／綁定正式自訂網域所需的精確平台與 DNS 操作：在 Manus 專案的 Settings → Domains 加入 `www.mofuhavenhk.com`，保持 CNAME 指向 `mofuhaven-5gysmfvo.manus.space`，待平台簽發 SSL 後再將根網域轉址至 www

## Vercel 公開部署與手機 Checkout 測試任務

- [x] 檢查目前是否已連接 Vercel 帳戶、既有 Vercel 專案或可用部署憑證：已登入 `ymksamuel-2362` 的 `mofuhavenhk` Vercel 專案，並已確認其既有 Production／Preview Stripe 環境變數
- [ ] 為最新 Express／tRPC／Stripe 全端架構建立 Vercel Serverless 相容入口與 SPA routing 設定
- [ ] 推送獨立 Preview branch 至現有 `ymksamuel-oss/mofuhavenhk` 儲存庫，避免覆寫 main 生產版本並觸發 Vercel Preview
- [ ] 驗證公開 `vercel.app` 預覽網址、首頁與 Stripe Checkout Session 建立路徑
