import { chromium } from "playwright";

const baseUrl = process.env.PREVIEW_URL ?? "https://3000-iwglvs12np74x9w4j2ngh-7feb189a.sg1.manus.computer";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

await page.addInitScript(() => {
  Object.defineProperty(navigator, "share", { value: undefined, configurable: true });
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText: async (value) => { window.__mofuSharedUrl = value; } },
    configurable: true,
  });
});

try {
  await page.goto(`${baseUrl}/pet-world`, { waitUntil: "networkidle" });
  await page.evaluate(() => window.localStorage.removeItem("mofu-haven-pet-world-favorites"));
  await page.reload({ waitUntil: "networkidle" });

  const favoriteButton = page.getByRole("button", { name: "加入收藏", exact: true }).first();
  await favoriteButton.click();
  if ((await page.getByRole("button", { name: "已收藏", exact: true }).count()) < 1) throw new Error("收藏按鈕沒有切換至已收藏");
  await page.reload({ waitUntil: "networkidle" });
  if ((await page.getByRole("button", { name: "已收藏", exact: true }).count()) < 1) throw new Error("收藏狀態沒有從 localStorage 持久化");

  const shareButton = page.getByRole("button", { name: "一鍵分享", exact: true }).first();
  await shareButton.click();
  if ((await page.getByRole("button", { name: "已複製", exact: true }).count()) < 1) throw new Error("分享 fallback 沒有顯示已複製");
  const sharedUrl = await page.evaluate(() => window.__mofuSharedUrl ?? "");
  if (!sharedUrl.includes("/pet-world#breed-1")) throw new Error(`分享連結缺少品種 anchor：${sharedUrl}`);

  await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  const featured = page.getByLabel("熱門貓咪品種").getByRole("link");
  if (await featured.count() !== 3) throw new Error("首頁熱門品種快捷入口不是 3 個");
  await featured.first().click();
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForSelector("#breed-1", { timeout: 10000 });
  if (!page.url().includes("/pet-world#breed-1")) throw new Error(`熱門品種入口沒有導向 breed-1：${page.url()}`);
  const breedAnchorCount = await page.locator("#breed-1").count();
  if (breedAnchorCount !== 1) {
    console.log(JSON.stringify({ afterFeaturedClick: page.url(), breedAnchorCount, bodySnippet: (await page.locator("body").innerText()).slice(0, 500) }));
    throw new Error("breed-1 anchor 不存在");
  }

  await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  const banner = page.locator('section[aria-labelledby="pet-world-banner"]');
  await banner.hover();
  await page.waitForTimeout(350);
  const hoverState = await banner.evaluate((element) => {
    const style = window.getComputedStyle(element);
    return { transform: style.transform, boxShadow: style.boxShadow };
  });
  if (hoverState.transform === "none" && hoverState.boxShadow === "none") throw new Error("探索圖卡 Hover 沒有產生視覺互動");

  console.log(JSON.stringify({ ok: true, favoritePersisted: true, shareFallback: true, featuredBreeds: 3, hoverState }, null, 2));
} finally {
  await browser.close();
}
