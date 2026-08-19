import { chromium } from "playwright";
import fs from "node:fs/promises";

const baseUrl = "http://127.0.0.1:3000";
const viewports = [
  { name: "desktop", width: 1280, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
const results = [];

try {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height }, isMobile: viewport.name === "mobile", hasTouch: viewport.name === "mobile" });
    await page.goto(`${baseUrl}/products`, { waitUntil: "networkidle" });
    await page.evaluate(() => localStorage.removeItem("mofu-haven-cart-v1"));
    await page.reload({ waitUntil: "networkidle" });
    const firstCard = page.locator('[role="button"][aria-label^="查看"]').first();
    await firstCard.waitFor({ state: "visible", timeout: 15000 });
    const addButton = firstCard.getByRole("button", { name: "加入購物車" });
    await addButton.click();
    await page.waitForTimeout(100);
    const drawer = page.getByRole("dialog", { name: /你的購物車/ });
    const toast = page.getByText("已加入購物車", { exact: true });
    const cartButton = page.getByRole("button", { name: /購物車，目前 1 件商品/ });
    const badge = cartButton.locator(".cart-badge-bump");
    const afterAdd = {
      drawerClosed: !(await drawer.isVisible().catch(() => false)),
      toastVisible: await toast.isVisible().catch(() => false),
      badgeUpdated: await cartButton.isVisible().catch(() => false),
      badgeAnimated: await badge.count() > 0,
    };
    await page.waitForTimeout(2200);
    const toastAfterDuration = await toast.isVisible().catch(() => false);
    await cartButton.click();
    await drawer.waitFor({ state: "visible", timeout: 5000 });
    const result = { viewport: viewport.name, ...afterAdd, toastAutoDismissed: !toastAfterDuration, drawerOpensOnHeaderClick: true };
    console.log(JSON.stringify(result));
    results.push(result);
    if (!result.drawerClosed || !result.toastVisible || !result.badgeUpdated || !result.badgeAnimated || !result.toastAutoDismissed || !result.drawerOpensOnHeaderClick) process.exitCode = 1;
    await page.close();
  }
  await fs.writeFile("/home/ubuntu/mofu-haven-website/cart-interaction-verification.json", JSON.stringify(results, null, 2) + "\n");
} finally {
  await browser.close();
}
