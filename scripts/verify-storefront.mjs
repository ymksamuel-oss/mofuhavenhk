import { chromium } from "playwright";
import fs from "node:fs/promises";

const baseUrl = "http://127.0.0.1:3000";
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const verification = {
  productCards: 0,
  modalOpened: false,
  modalHasTitle: false,
  modalHasPrice: false,
  modalHasDescription: false,
  lightboxOpened: false,
  lightboxClosed: false,
  placeholderFallback: false,
  headerNav: [],
  footerLinks: [],
  infoRoutes: {},
};

try {
  const response = await page.goto(`${baseUrl}/products`, { waitUntil: "networkidle" });
  if (!response || !response.ok()) throw new Error(`Products page returned ${response?.status()}`);
  await page.locator('[role="button"][aria-label^="查看"]').first().waitFor({ state: "visible", timeout: 15000 });

  verification.productCards = await page.locator('[role="button"][aria-label^="查看"]').count();
  if (!verification.productCards) throw new Error("No product cards rendered");

  verification.headerNav = await page.locator('header nav[aria-label="主選單"] a').allTextContents();
  verification.footerLinks = await page.locator("footer a").evaluateAll((links) => links.map((link) => ({ text: link.textContent?.trim() ?? "", href: link.getAttribute("href") ?? "" })));

  const firstCard = page.locator('[role="button"][aria-label^="查看"]').first();
  const cardTitle = (await firstCard.locator("h3").textContent())?.trim() ?? "";
  await firstCard.click();
  const detailDialog = page.getByRole("dialog").first();
  await detailDialog.waitFor({ state: "visible", timeout: 5000 });
  verification.modalOpened = true;
  const detailText = await detailDialog.textContent();
  verification.modalHasTitle = Boolean(cardTitle && detailText?.includes(cardTitle));
  verification.modalHasPrice = Boolean(detailText?.match(/\$|HKD|價格請查看結帳頁/));
  verification.modalHasDescription = Boolean(detailText?.includes("詳細介紹"));

  await detailDialog.getByRole("button", { name: /放大查看/ }).click();
  const lightboxImage = page.getByRole("img", { name: /大圖/ });
  await lightboxImage.waitFor({ state: "visible", timeout: 5000 });
  verification.lightboxOpened = true;
  await page.keyboard.press("Escape");
  await lightboxImage.waitFor({ state: "hidden", timeout: 5000 });
  verification.lightboxClosed = true;
  await page.keyboard.press("Escape");

  const productImage = page.locator('[role="button"][aria-label^="查看"] img').first();
  await productImage.evaluate((image) => { image.src = "/missing-image-for-fallback-test.png"; });
  await page.waitForFunction((placeholder) => document.querySelector('[role="button"][aria-label^="查看"] img')?.getAttribute("src")?.includes(placeholder), "mofu-haven-product-placeholder_002825b0.svg", { timeout: 5000 });
  verification.placeholderFallback = true;

  for (const path of ["/about", "/faq", "/shipping-policy", "/returns-policy", "/privacy-policy"]) {
    const routeResponse = await page.request.get(`${baseUrl}${path}`);
    verification.infoRoutes[path] = routeResponse.status();
  }

  const requiredFooterRoutes = new Map([
    ["全部商品", "/products"],
    ["關於我們", "/about"],
    ["常見問題", "/faq"],
    ["運送與發貨政策", "/shipping-policy"],
    ["退換貨政策", "/returns-policy"],
    ["私隱政策與服務條款", "/privacy-policy"],
  ]);
  for (const [text, href] of requiredFooterRoutes) {
    if (!verification.footerLinks.some((link) => link.text === text && link.href === href)) {
      throw new Error(`Footer route missing: ${text} -> ${href}`);
    }
  }
  if (verification.headerNav.includes("聯絡")) throw new Error("Header still contains 聯絡");
  if (!verification.modalOpened || !verification.modalHasTitle || !verification.modalHasPrice || !verification.modalHasDescription) {
    throw new Error("Product detail modal content validation failed");
  }
  if (!verification.lightboxOpened || !verification.lightboxClosed) throw new Error("Lightbox validation failed");
  if (!verification.placeholderFallback) throw new Error("Placeholder fallback validation failed");
  if (Object.values(verification.infoRoutes).some((status) => status !== 200)) throw new Error("Information route validation failed");

  await fs.writeFile("/home/ubuntu/mofu-haven-website/storefront-verification.json", JSON.stringify(verification, null, 2) + "\n");
  console.log(JSON.stringify(verification, null, 2));
} finally {
  await browser.close();
}
