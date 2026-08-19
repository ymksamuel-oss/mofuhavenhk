import { chromium } from "playwright";
import fs from "node:fs/promises";

const baseUrl = "http://127.0.0.1:3000";
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
try {
  const response = await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  if (!response || !response.ok()) throw new Error(`Home page returned ${response?.status()}`);
  const hero = page.locator("main > section").first();
  const categorySection = page.locator('section[aria-label="商品分類"]');
  const productSection = page.locator("#product-list");
  const heroBox = await hero.boundingBox();
  const categoryBox = await categorySection.boundingBox();
  const productBox = await productSection.boundingBox();
  const storyCount = await page.getByText("與毛孩的日常治癒", { exact: true }).count();
  const cta = page.locator('a[href="/#product-list"]');
  await cta.click();
  await page.waitForTimeout(300);
  const afterClick = await page.evaluate(() => ({ hash: window.location.hash, scrollY: window.scrollY }));
  const result = {
    viewport: "390x844",
    heroHeight: heroBox?.height ?? null,
    heroHeightWithinMobileTarget: Boolean(heroBox && heroBox.height <= 340),
    storyCount,
    storyHidden: storyCount === 0,
    categoryImmediatelyAfterHero: Boolean(heroBox && categoryBox && categoryBox.y >= heroBox.y + heroBox.height - 2 && categoryBox.y <= heroBox.y + heroBox.height + 24),
    productAfterCategory: Boolean(categoryBox && productBox && productBox.y > categoryBox.y),
    ctaHash: afterClick.hash,
    ctaScrolledToProductList: afterClick.hash === "#product-list" && afterClick.scrollY > 0,
  };
  console.log(JSON.stringify(result, null, 2));
  await fs.writeFile("/home/ubuntu/mofu-haven-website/mobile-home-ux-verification.json", JSON.stringify(result, null, 2) + "\n");
  if (!result.heroHeightWithinMobileTarget || !result.storyHidden || !result.categoryImmediatelyAfterHero || !result.productAfterCategory || !result.ctaScrolledToProductList) process.exitCode = 1;
} finally {
  await browser.close();
}
