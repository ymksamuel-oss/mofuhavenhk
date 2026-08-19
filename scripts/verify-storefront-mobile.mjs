import { chromium } from "playwright";
import fs from "node:fs/promises";

const baseUrl = "http://127.0.0.1:3000";
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const verification = {
  viewport: "390x844",
  productCards: 0,
  cartDrawerOpened: false,
  cartPersisted: false,
  checkoutCallsBeforeCartAction: 0,
  checkoutCallsAfterCartAction: 0,
  checkoutReturnPage: false,
};

try {
  const response = await page.goto(`${baseUrl}/products`, { waitUntil: "networkidle" });
  if (!response || !response.ok()) throw new Error(`Products page returned ${response?.status()}`);
  await page.locator('[role="button"][aria-label^="查看"]').first().waitFor({ state: "visible", timeout: 15000 });
  verification.productCards = await page.locator('[role="button"][aria-label^="查看"]').count();
  if (!verification.productCards) throw new Error("No product cards rendered");

  let checkoutCalls = 0;
  page.on("request", (request) => {
    if (request.url().includes("/api/trpc/store.checkout")) checkoutCalls += 1;
  });

  const firstCard = page.locator('[role="button"][aria-label^="查看"]').first();
  const cardTitle = (await firstCard.locator("h3").textContent())?.trim() ?? "";
  const addToCartButton = firstCard.getByRole("button", { name: "加入購物車" });
  verification.checkoutCallsBeforeCartAction = checkoutCalls;
  await addToCartButton.click();
  const cartDialog = page.getByRole("dialog", { name: /你的購物車/ });
  await cartDialog.waitFor({ state: "visible", timeout: 5000 });
  verification.cartDrawerOpened = true;
  if (checkoutCalls !== verification.checkoutCallsBeforeCartAction) throw new Error("Mobile add-to-cart unexpectedly called Checkout");

  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("button", { name: /購物車，目前 1 件商品/ }).click();
  const persistedDialog = page.getByRole("dialog", { name: /你的購物車/ });
  await persistedDialog.waitFor({ state: "visible", timeout: 5000 });
  verification.cartPersisted = await persistedDialog.getByText(cardTitle, { exact: false }).count() > 0;
  const checkoutButton = persistedDialog.getByRole("button", { name: "前往結帳" });
  await checkoutButton.click();
  await page.waitForTimeout(1000);
  verification.checkoutCallsAfterCartAction = checkoutCalls;
  if (checkoutCalls <= verification.checkoutCallsBeforeCartAction) throw new Error("Mobile cart checkout did not call Checkout API");

  const returnResponse = await page.request.get(`${baseUrl}/checkout/return?status=success&session_id=cs_live_mobile_test`);
  verification.checkoutReturnPage = returnResponse.status() === 200;
  if (!verification.checkoutReturnPage) throw new Error("Mobile checkout return page failed");

  if (!verification.cartDrawerOpened || !verification.cartPersisted) throw new Error("Mobile cart drawer or LocalStorage validation failed");
  await fs.writeFile("/home/ubuntu/mofu-haven-website/mobile-storefront-verification.json", JSON.stringify(verification, null, 2) + "\n");
  console.log(JSON.stringify(verification, null, 2));
} finally {
  await browser.close();
}
