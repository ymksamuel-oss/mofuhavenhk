# 四季手機 Banner 整合紀錄

**狀態：已部署並完成正式前台驗證**  
**程式提交：`84cd30bb`**

## 已整合素材

四張 1856 × 2304 的直向 PNG 已放入 `public/images/banners/seasonal/`，並設定為 `image_url` 及 `mobile_image_url`。Banner CMS 現時共有四筆資料，按 `sort_order` 0 至 3 依序為秋、冬、夏、春。

| 排序 | 素材 | 標題 | 前台連結 |
|---:|---|---|---|
| 0 | `autumn.png` | 秋日系列｜秋日慢活，把溫暖留在身邊 | `/categories/cats` |
| 1 | `winter.png` | 冬日系列｜暖暖過冬，陪伴最剛好 | `/categories/cats` |
| 2 | `summer.png` | 夏日系列｜涼爽一夏，自在享受好時光 | `/categories/dogs` |
| 3 | `spring.png` | 春日系列｜春日萌芽，陪伴也輕輕展開 | `/categories/cats` |

## 前台行為

首頁沿用既有 Supabase Banner 唯一資料來源，沒有新增硬編碼前台圖片陣列。每一張圖片均透過 `<picture>` 提供 `(max-width: 639px)` 的手機圖片來源；首頁載入時位於服務資訊列之後的第一個主要內容區，使用 4:5 左右的窄螢幕比例、圓角容器與既有輪播控制。

輪播維持每 4 秒自動切換，並支援上一張、下一張、圓點選擇及觸控左右滑動。正式瀏覽器驗證已確認 Banner CMS 回傳 4 筆資料、排序正確，4.5 秒後活動圖片已由前一張切換至另一張；活動圖片的連結亦會導向帶有 `#products` 的有效產品分類頁。

## 部署驗證

正式首頁已確認秋日 Banner 及其 `/categories/cats#products` 連結可載入。Next Image 的 `picture source` 已確認 `media="(max-width: 639px)"` 並指向手機季節素材。四季圖片資產已隨主分支部署，未使用假資料或失效路徑。
