# Mofu Haven 首頁全屏品牌故事彈窗 Bug 修復報告

日期：2026-10-05  
用途：Code Guard / Mobile Homepage QA

## 1. Bug 根因

問題不是手機端使用了另一個首頁路由，而是首頁 SSR 會按 cookie 自動掛載迎賓彈窗：

```tsx
// src/app/page.tsx（修復前）
const cookieStore = await cookies();
const hasSeenEntrance = cookieStore.get("mofu_seen_entrance")?.value === "1";

return (
  <>
    {!hasSeenEntrance && <WelcomeEntranceOverlay />}
    <HomeJournalHero products={products} />
    ...
  </>
);
```

`src/components/WelcomeEntranceOverlay.tsx` 內的狀態變數為：

```tsx
const [isVisible, setIsVisible] = useState(true);
```

因此首次進入、沒有 `mofu_seen_entrance=1` cookie 的手機瀏覽器會直接渲染：

```tsx
<div className="fixed inset-0 z-[9999] ..." role="dialog" aria-modal="true">
```

這個 `z-[9999]` fixed dialog 會覆蓋完整首頁。

## 2. 修復內容

### 修改檔案

| 檔案 | 修改 |
|---|---|
| `src/app/page.tsx` | 移除 `cookies` 讀取、`WelcomeEntranceOverlay` import 及首頁自動掛載。 |
| `reports/homepage-welcome-overlay-fix-2026-10-05.md` | 本 Code Guard 修復報告及 diff。 |
| `reports/homepage-no-overlay-2026-10-05.webp` | 修復後首頁瀏覽器驗收截圖。 |

### 修復後核心程式碼

```tsx
// src/app/page.tsx
export default async function HomePage() {
  let products: Product[] = [];
  ...
  return (
    <>
      <HomeJournalHero products={products} />
      <HomeSupplierStory />
      <HomePetParade products={products} />
      <HomepageFeaturedShowcase products={products} />
      <FAQAccordion />
    </>
  );
}
```

首頁現在不會在任何 cookie 狀態下自動開啟品牌故事迎賓層。

## 3. 手動品牌故事入口

首頁 Hero 的第三期專題仍保留手動入口：

```tsx
// src/components/home/HomeJournalHero.tsx
ctaZh: "認識 Best Partner",
ctaEn: "Meet Best Partner",
ctaLink: "/brand/best-partner",
```

使用者需主動點擊「認識 Best Partner」才會進入品牌故事內容頁；進入首頁時不會自動彈出迎賓遮罩。

原有的 `WelcomeEntranceOverlay.tsx` 保留作為獨立元件，但已不再由首頁自動掛載，因此不影響正常電商首頁瀏覽。

## 4. 手機／桌面共用首頁確認

`src/app/page.tsx` 是唯一首頁 route，沒有 `<768px` 的 route replacement、mobile-only 靜態故事頁或 user-agent 分支。手機與桌面共用：

1. `SiteShell` 提供 Logo、導航、選單、購物車及收藏入口。
2. 全站服務／滿 HK$399 免運廣播條。
3. `HomeJournalHero` 主推專題 Banner 及九宮格／多欄商品卡。
4. 向下滾動後才顯示 `HomeSupplierStory`「從產地到餐桌・安心溯源」。
5. `HomePetParade`、`HomepageFeaturedShowcase` 及 FAQ。

`HomeJournalHero` 本身使用 responsive Tailwind classes，包括手機單欄、商品卡 grid、桌面多欄 layout 及 touch swipe；沒有把手機導向 `/brand/best-partner` 或任何靜態故事頁。

## 5. 驗收結果

- `npm run lint -- --no-cache`：PASS
- `npm run build`：PASS
- Next.js 81 個頁面生成成功
- `git diff --check`：PASS
- 本地首頁 `GET /`：HTTP 200
- 無 cookie 的首頁 HTML：不含 `毛毛港迎賓頁` 或 `Welcome to Mofu Haven`
- 首頁仍包含「認識 Best Partner」手動連結：`/brand/best-partner`
- 首頁仍包含「產地溯源：從日本農場到毛孩餐桌」內容
- 遠端最新 account、Back-in-stock 及其他功能未受影響

## 6. 瀏覽器渲染確認

修復後瀏覽器首頁驗收顯示：

- 頂部 Logo、首頁導航、搜尋、購物籃、收藏、語言切換及登入入口正常顯示。
- 廣播條正常顯示「全店滿 HK$399 享順豐免運」。
- 首頁直接顯示專題 Hero，不再有 `fixed inset-0 z-[9999]` 品牌故事覆蓋層。
- 頁面向下可看到「從產地到餐桌・安心溯源」及「今期店長嚴選」。
- Hero 的「認識 Best Partner」仍作為主動連結存在。

[查看修復後首頁瀏覽器驗收截圖](./homepage-no-overlay-2026-10-05.webp)

## 7. Git Diff 摘要

```diff
- import { WelcomeEntranceOverlay } from "@/components/WelcomeEntranceOverlay";
- import { cookies } from "next/headers";

 export default async function HomePage() {
-  const cookieStore = await cookies();
-  const hasSeenEntrance = cookieStore.get("mofu_seen_entrance")?.value === "1";
   let products: Product[] = [];

   return (
     <>
-      {!hasSeenEntrance && <WelcomeEntranceOverlay />}
       <HomeJournalHero products={products} />
       <HomeSupplierStory />
```

## 8. 安全邊界

本次只修改首頁自動渲染組合，不修改：

- 商品資料、SKU、分類或庫存。
- 購物車、運費門檻、Stripe checkout 或付款 API。
- Header、SiteShell 的 mobile menu 及購物籃功能。
- `/brand/best-partner` 品牌故事頁本身。
