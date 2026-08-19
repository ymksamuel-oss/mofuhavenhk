import { chromium } from "playwright";
import fs from "node:fs/promises";

const baseUrl = "http://127.0.0.1:3000";
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
try {
  const response = await page.goto(`${baseUrl}/products`, { waitUntil: "networkidle" });
  if (!response || !response.ok()) throw new Error(`Products page returned ${response?.status()}`);
  await page.locator('input[aria-label="搜尋商品"]').waitFor({ state: "visible", timeout: 15000 });
  const headerHeight = await page.locator("header").evaluate((element) => element.getBoundingClientRect().height);
  const searchInput = page.locator('input[aria-label="搜尋商品"]');
  const categoryButtons = page.getByRole("button", { name: /^(全部商品|貓咪商品|狗狗商品|寵物零食)$/ });
  const visibleTexts = await page.locator("body").innerText();
  const missingCopy = [
    "Stripe 商品目錄",
    "為毛孩慢慢挑選真正可購買的好物",
    "商品、圖片、價格和分類直接來自已核實的 Stripe Live 商品資料。",
    "目前顯示",
  ].every((text) => !visibleTexts.includes(text));
  const searchButton = page.getByRole("button", { name: "搜尋商品", exact: true });
  const searchBefore = await searchButton.count();
  const categoryLabels = await categoryButtons.allTextContents();
  await searchInput.fill("CIAO");
  await searchInput.press("Enter");
  await page.waitForTimeout(250);
  const searchUrl = page.url();
  const catsButton = page.getByRole("button", { name: "貓咪商品", exact: true });
  await catsButton.click();
  await page.waitForTimeout(250);
  const categoryUrl = page.url();
  const result = {
    viewport: "390x844",
    headerHeight,
    headerWithin60px: headerHeight <= 60,
    removedProductHeaderCopy: missingCopy,
    largeSearchButtonRemoved: searchBefore === 0,
    searchInputVisible: await searchInput.isVisible(),
    categoryLabels,
    categoryCount: categoryLabels.length,
    searchInteraction: searchUrl.includes("q=CIAO"),
    categoryInteraction: categoryUrl.includes("category=cats"),
  };
  console.log(JSON.stringify(result, null, 2));
  await fs.writeFile("/home/ubuntu/mofu-haven-website/mobile-product-header-verification.json", JSON.stringify(result, null, 2) + "\n");
  if (!result.headerWithin60px || !result.removedProductHeaderCopy || !result.largeSearchButtonRemoved || !result.searchInputVisible || result.categoryCount !== 4 || !result.searchInteraction || !result.categoryInteraction) process.exitCode = 1;
} finally {
  await browser.close();
}
