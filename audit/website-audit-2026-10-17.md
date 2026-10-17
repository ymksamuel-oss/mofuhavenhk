# MOFUHAVEN 網店體檢與修復報告

**檢查日期：** 2026-10-17
**目標 Preview：** `https://mofuhavenhk-7auvu6wgv-mofuhavenhk-6259s-projects.vercel.app/`
**檢查範圍：** GitHub source、Next.js 設定、首頁及 `/collections/dogs` 的已渲染 HTML、商品圖片 URL HTTP 狀態、靜態圖檔路徑、桌面／手機程式結構、結帳及 SEO metadata。

## 摘要

- **主要死圖原因已確認：Supabase Storage 專案因 `exceed_egress_quota` 被限制服務，圖片請求全部回 `HTTP 402`。** 不是 Linux 檔名大小寫、Next.js 圖片網域白名單或 Vercel Image Optimization 導致。
- 在首頁及狗狗分類頁渲染出的 **38 個唯一 Supabase 圖片 URL 均為 402**，共檢出 101 次圖片引用；CSV 列出全部 38 個 URL。這是可取得的頁面樣本，**不是完整資料庫清單**：Preview 的 store API 呈現 `configured:false`／空商品資料，無法可靠列舉全店資料庫。
- 已實作更安全的圖片 URL 清理和品牌 fallback；修正套裝、會員訂單等直接圖片呼叫；新增遺漏的本機 SVG 佔位檔；修正集合／品牌頁 Open Graph metadata；並令 Next.js build 不再略過 TypeScript 錯誤。
- **Build、TypeScript、ESLint 全部通過。** 新增圖片正規化單元測試 5 項全過。全套 Vitest 仍有 33 項舊失敗，但在未修改的 HEAD 基線亦同樣 33 項失敗；沒有新增失敗。
- **必要外部操作：** Supabase 專案負責人需依錯誤訊息解除 spend cap 或升級方案，讓 Storage 服務恢復；恢復前原商品照無法由程式碼重新取回，介面會顯示品牌佔位圖。

## 一、死圖診斷結果

### 已確認的根因

圖片位置皆指向 Supabase Storage：

`https://hkuxxgduymkztkmyhhot.supabase.co/storage/v1/object/public/public-images/…`

對首頁及狗狗分類頁上 38 個唯一 URL 逐一送出 HTTP HEAD，結果 **38/38 為 402**。對其中一張再以 GET 讀取錯誤本文，Supabase 回覆：

> Service for this project is restricted due to the following violations: exceed_egress_quota. The project owner must upgrade their plan or remove spend caps to restore service.

這代表 Supabase 專案出站流量額度／支出上限令服務遭限制；圖片檔名可能仍然存在，但目前連讀取都被服務層拒絕。這不是 404（檔案不存在）或防盜連 403，因此單靠改 URL、加 referer、Vercel rewrite 或 Next 設定均不能解除限制。

### 設定及本機檔名核查

- `next.config.ts` **已有 `unoptimized: true`**，並允許 Supabase 公開 Storage 路徑 `/storage/v1/object/public/**`。因此不需另加 Supabase `remotePatterns`，亦沒有證據顯示是 Vercel Image Optimization 額度所致。
- 程式內抽查 **149 個唯一靜態本機圖片引用**：修正後 **0 個缺少的確切路徑、0 個大小寫不一致**。資料檔中的 `/images/cat-breeds/*.jpg` 是 glob 範本，非單一檔案 URL，沒有當作死圖誤報。
- 原有程式曾有一個元件引用 `/images/catalog-placeholder.svg`，但檔案並不存在；已補上該檔案，並為常用商品圖片元件加入不依賴網絡的 inline SVG fallback。
- Preview 的 store API 曾回報 `configured:false` 且商品清單為空；程式在公用 Supabase client 不存在時會使用 fallback。請在 Vercel Preview **及 Production** 環境核對 `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`（或 API 所接受的 `SUPABASE_URL`、`SUPABASE_ANON_KEY`）。這是獨立於 `exceed_egress_quota` 的配置症狀；API 空資料會影響客戶端商品目錄更新。

### 失效商品及圖片路徑

下表的路徑均相對於以下 bucket 根目錄，且全部回覆 HTTP 402：

`https://hkuxxgduymkztkmyhhot.supabase.co/storage/v1/object/public/public-images/`

| 商品名稱（圖片 alt） | `public-images/` 後的物件路徑 | HTTP |
|---|---|---:|
| 北海道蝦夷鹿肉 | `best-partner/e353209a-dfd5-43fe-8ff1-51c2d95a9f7d-b8d00eec735f.jpg` | 402 |
| 低敏純馬肉棒 | `1790778526765-img_2617.png` | 402 |
| 金槍魚薄片 | `1790778817178-img_2622.png` | 402 |
| 天然原隻牛蹄 | `1790779192624-img_2629.jpeg` | 402 |
| 凍乾純雞里肌 | `best-partner/official-4976064025791-1.jpg` | 402 |
| 安納芋蜜甘藷 | `best-partner/4976064025272-0.jpg` | 402 |
| 鴨里肌肉乾 | `best-partner/4976064026514-0.jpg` | 402 |
| 鯊魚皮潔齒棒 | `best-partner/official-4976064026392-1.jpg` | 402 |
| 高山犛牛芝士 | `best-partner/official-4976064025661-1.jpg` | 402 |
| 天然牛大筋特長大條 | `best-partner/official-4976064026446-1.jpg` | 402 |
| 天然葉綠素潔齒骨棒 | `4976064025012-1790861411125-198ff247-9159-49a3-a522-8b65a5c9a88b-img_0286.jpeg` | 402 |
| 天然牛肋排骨切段 | `best-partner/4976064024701-0.jpg` | 402 |
| 高山犛牛芝士棒 | `best-partner/official-4976064025685-1.jpg` | 402 |
| 鹿兒島黑豚大豬耳 | `best-partner/official-4976064022301-1.jpg` | 402 |
| 黃鰭金槍魚柴魚薄片 | `best-partner/official-4976064013897-1.jpg` | 402 |
| 貓用無鹽小魚乾 | `best-partner/official-4976064024725-1.jpg` | 402 |
| 天然黑鮪魚肉碎 | `best-partner/official-4976064024893-1.jpg` | 402 |
| 純雞里肌雪花肉碎 | `best-partner/official-4976064024251-1.jpg` | 402 |
| 純雞砂肝香脆肉碎 | `best-partner/official-4976064024886-1.jpg` | 402 |
| 天然鯊魚軟骨排 | `4976064025470-1790783432507-c2c254a5-460c-42ce-ac32-3d252227313f-img_0265.png` | 402 |
| 厚切純馬肉條 | `best-partner/4976064026552-0.jpg` | 402 |
| 豬喉軟骨潔齒圈 | `best-partner/official-4976064026415-1.jpg` | 402 |
| 北海道鹿肉一口粒 | `best-partner/official-4976064025081-1.jpg` | 402 |
| 純鹿肉鬆拌糧粉 | `best-partner/official-4976064024442-1.jpg` | 402 |
| 蒙古馬蹄筋細切條 | `best-partner/4976064023162-0.jpg` | 402 |
| 天然純馬肉脆片 | `1790778975240-img_2625.jpeg` | 402 |
| 枕崎產鰹魚厚切片 | `1790779279933-img_2630.jpeg` | 402 |
| 手撕雞里肌肉絲 | `best-partner/official-4976064025388-2.jpg` | 402 |
| 天然馬皮潔齒棒 | `best-partner/official-4976064025630-1.jpg` | 402 |
| 日本國產仔牛肉鬆 | `best-partner/official-4976064025760-1.jpg` | 402 |
| 【薄花誘食】純雞肉薄削花撒粉 20g（挑食拌糧神物・低脂好吸收） | `best-partner/official-4976064015716-1.jpg` | 402 |
| 【小麥胚芽包】天然小麥胚芽黃金地瓜養生烘焙麵包 6個入 | `best-partner/official-4976064022646-1.jpg` | 402 |
| 【嚐鮮小包】北海道野生蝦夷鹿無穀主食糧試食裝 50g（適口性測試・過敏犬嚐鮮首選） | `best-partner/4976064026736-0.jpg` | 402 |
| 【草原放牧】蒙古天然放牧馬蹄筋 30g（純淨無污染・天然高硬度耐咬骨筋） | `4976064026316-1790836898995-8ed9fbf9-da82-4911-9ac8-74bc87b8140d-img_2654.jpeg` | 402 |
| 【極限耐咬】蒙古放牧馬蹄筋特長大條 60g（大犬專屬・20cm巨型耐咬膠原棒） | `4976064026323-1790835063255-d007eb45-1844-453a-bd7b-c3440b9ecd1d-img_2651.jpeg` | 402 |
| 【原根肋骨】北海道野生鹿肋骨 40g（細長扁骨・中小型犬潔齒解癢磨牙棒） | `best-partner/official-4976064024046-0.jpg` | 402 |
| 【原切酥脆】國產黃金甘藷香脆薄切片 40g | `1790656873198-img_0248.jpeg` | 402 |
| 【精緻薄切】國產純牛舌先薄切片 20g（2mm極致薄削・高鐵高牛磺酸濃郁極品） | `best-partner/official-4976064024985-1.jpg` | 402 |

CSV 附件保留全部完整 URL、頁面來源和錯誤說明，方便直接交給營運／開發人員核對。

## 二、網站稽核（香港網店買家角度）

> 由於一般瀏覽器開啟 Preview 會被 Vercel Authentication 轉到登入頁，本次沒有取得可量度視覺像素的公開 browser session；以下以 Repo CSS、已授權讀取的 SSR HTML 和互動元件作結構稽核。**沒有虛報 Lighthouse、LCP 或實機截圖結果。**

### 1. 視覺與排版

- 商品列表卡採固定正方形圖片框（`aspect-square`）及 `object-contain`，避免產品包裝拉伸；名稱限制兩行並有固定資訊區高度（約 5.25–5.5rem），有助不同商品卡底線對齊。
- 分類頁在手機兩欄、中尺寸三欄、較大畫面四欄；每張卡由 `min-w-0` 和固定寬容器避免文字把網格撐爆。分類篩選採橫向捲動，適合較長的蛋白質／肉類選項。
- 首頁包含 editorial hero、供應商故事、寵物主題及品牌 Banner；本次無法實測 hero 在各真實 viewport 的裁切比例／文字對比，發佈後應用 390px 手機及桌面寬度再目視核對。圖片載入恢復後，留意封面 `object-fit` 是否切掉商品包裝資訊。
- 商品卡基本高度一致；若開啟購買控制，按鈕區在卡片底部對齊。此次沒有因未經實測而臆測需重寫全站 CSS。

### 2. 手機版體驗

- 桌面主導航在手機隱藏；頂部保留品牌、登入及語言入口，手機另有固定底部的首頁／分類／配對／購物袋／搜尋列，並使用 safe-area inset。Dock 最大闊度約 370px，程式中有 44px 級別觸控控制。
- 主內容採 `overflow-x-clip` 並預留底部 Dock 空間；商品網格手機兩欄，篩選 Pills 可水平滑動。現有結構未見明顯整頁橫向溢出的程式風險。
- 順豐篩選下拉、搜尋欄及選項使用較高觸控列；但分類 Pills 橫向捲動的箭頭／滑動提示可在後續手機實測中再確認是否足夠明顯。
- 因 Preview 有登入攔截，不能宣稱已通過真實 iPhone／Android 裝置視覺測試；已透過 CSS 與 SSR 檢查響應式結構。

### 3. 轉化率與香港本地化流程（CRO）

- 目錄已設犬／貓／量販組合分類；犬貓頁可按蛋白質來源篩選，目錄亦有搜尋及分頁，基本商品探索清晰。
- 結帳為兩步：先填收件人與配送，再核對訂單及付款。順豐支援住宅派送或自提；自提可按地區、站／智能櫃／合作點篩選，或搜尋，並提示偏遠地區附加費。名單目前是站點資料集而非即時物流 API，營運須持續更新。
- 順豐本地免運門檻為 **HK$399**，公告列、購物車／免運進度及分類文案均可見；政策文字指出未達門檻運費為 **HK$35**，離島／偏遠地區可能另收附加費，提示較完整。
- 付款選項目前展示 Visa、Mastercard、Apple Pay、Google Pay、PayMe、AlipayHK 等；程式亦註明實際可用性視 Stripe Dashboard、裝置及地區而定。沒有以真實支付／訂單付款測試，以免觸發交易。
- WhatsApp 查詢連結在服務公告列及 Footer 可找到；結帳亦有 WhatsApp 訂單支援入口，對香港客戶足夠明顯。

### 4. 載入速度與 SEO

- **速度：**本次無法量度 TTFB／LCP／CLS（Preview browser 被 Authentication 阻擋）。Next Image 設 `unoptimized:true`，可避開 Vercel 圖片處理配額，但亦不會自動縮放原圖／轉 WebP 或 AVIF；恢復圖片服務後，建議另做原圖壓縮、縮圖變體及 CDN 快取，否則大圖會提高手機流量和載入時間。
- **SEO 基礎：**全站有 `metadataBase`、title template、description、canonical、robots、網站／組織 JSON-LD、Open Graph 及 Twitter 大型卡片，基礎齊全。首頁共用 OG 圖片為 1194×671。
- **已修正 SEO：**集合頁原本有重複「Mofu Haven」title，且自訂 Open Graph metadata 覆蓋全站時沒有帶入 OG 圖片；Twitter 亦用 `summary`。品牌頁 metadata 同樣沒有完整 OG 圖片欄位。現已改為不重複 title、加入分享縮圖、canonical URL、`summary_large_image`。
- **提醒：**商品頁 OG 使用商品圖片；目前 Supabase 402 也可能令社交平台無法抓取商品縮圖。恢復圖床後應抽查 OG image 200 狀態。

## 三、程式修正清單（按嚴重程度）

### P0 — 已加前端韌性；外部圖床仍須恢復

- `normalizeProductImageUrl()` 統一裁去首尾空白、整理相對路徑、為檔名空格做 URL 編碼，拒絕控制字元、協定相對 URL、舊失效路徑及內部 `catalog-placeholder` marker。
- `ProductImage` 在圖片載入失敗（包括目前 Supabase 402）時，改顯示暖米色品牌 SVG 圖片代替破圖 icon；未知／空路徑亦會直接出 fallback。
- 套裝內容、會員首頁、會員訂單列表及訂單明細改共用 `ProductImage`，不再讓這些地方使用無錯誤處理的裸 `<Image>`。
- 新增 `public/images/catalog-placeholder.svg`，修復既有直接引用但不存在的資產路徑。
- **未能以程式碼繞過 Supabase 專案被限制的 Storage 服務。**外部服務恢復前，原始商品照依然會是佔位圖。

### P1 — 已修復部署檢查盲點及部分分享預覽

- `next.config.ts` 不再設定 `ignoreBuildErrors:true`，正式 Build 會真正執行 TypeScript 檢查；本次 Build 已通過。
- 集合頁及品牌頁加入完整社交分享圖，修正集合頁重複品牌文字。

### 尚待外部配置／營運處理

1. 在 Supabase Dashboard 檢視該 Project 的 egress／spend cap，按 Supabase 回覆解除支出上限或恢復服務；只調整程式不會恢復 402。
2. 在 Vercel 專案的 **Preview 及 Production** 確認 Supabase public URL／anon key 的環境變數 scope，然後重新部署，確認 `/api/store` 回到 `configured:true` 且商品非空。
3. 圖床復原後重測抽樣 URL 至 HTTP 200，並確認 storefront 和產品分享縮圖；如流量額度容易再觸頂，將商品圖複製至有適當 egress 預算的 CDN／物件儲存並調整資料來源。

## 四、驗證結果

| 檢查 | 結果 |
|---|---|
| Next.js production build（`npm run build`，已設嚴格 TypeScript build） | 通過；成功編譯並產生 107 個靜態頁面，0 build errors |
| TypeScript（`npx tsc --noEmit`） | 通過 |
| ESLint（`npm run lint`） | 通過 |
| 新增商品圖片 URL 正規化測試 | 5/5 通過 |
| 全套 Vitest | 當前 33 failed／167 passed（200 項）；乾淨 HEAD 基線亦有同一 33 項失敗／162 項通過，逐項比較 **0 新增失敗** |
| 靜態本機圖片引用大小寫／檔案存在 | 149 個唯一引用；0 缺檔、0 大小寫不符（wildcard 範本除外） |
| `git diff --check` | 通過 |
| 真實付款與實機視覺截圖 | 未執行；無付款交易，也無已登入的 Preview browser session |

---

**交付狀態：**程式已在 MOFUHAVEN 工作副本內修改並完成本機 Build／型別／Lint 驗證；沒有直接更動 Supabase 帳戶、沒有發起付款，亦未部署到 Production。恢復 Supabase Storage 和核對 Vercel 環境變數後，原商品照片才可完全恢復。
