import { chromium } from "playwright";

const baseUrl = process.env.PREVIEW_URL ?? "https://3000-iwglvs12np74x9w4j2ngh-7feb189a.sg1.manus.computer";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

try {
  await page.goto(`${baseUrl}/products?category=cat&q=%E9%9B%9E%E8%82%89`, { waitUntil: "networkidle" });
  const search = page.getByLabel("搜尋商品");
  if ((await search.inputValue()) !== "雞肉") throw new Error("初始搜尋字詞沒有正確載入");

  await page.getByRole("button", { name: "狗狗商品", exact: true }).click();
  await page.waitForTimeout(250);
  const afterCategoryUrl = page.url();
  if (!afterCategoryUrl.includes("category=dog") || afterCategoryUrl.includes("q=")) {
    throw new Error(`分類切換沒有清除 q：${afterCategoryUrl}`);
  }
  if ((await search.inputValue()) !== "") throw new Error("分類切換後搜尋框仍有關鍵字");

  const visibleCardText = await page.locator('[role="button"][aria-label^="查看 "]').first().innerText().catch(() => "");
  if (!visibleCardText.includes("加入購物車")) throw new Error("商品卡片沒有顯示加入購物車按鈕");
  if ((await page.getByText("查看商品詳情", { exact: true }).count()) !== 0) throw new Error("商品卡片仍顯示已移除的簡介／詳情文字");

  await page.goto(`${baseUrl}/pet-world`, { waitUntil: "networkidle" });
  if ((await page.getByRole("tab", { name: "貓咪專區" }).count()) !== 1) throw new Error("貓咪專區頁籤不存在");
  if ((await page.getByRole("tab", { name: /狗狗專區/ }).count()) !== 1) throw new Error("狗狗專區頁籤不存在");
  if ((await page.getByRole("tab", { name: /小寵物專區/ }).count()) !== 1) throw new Error("小寵物專區頁籤不存在");
  if ((await page.locator('img[alt$="品種圖片"]').count()) !== 12) throw new Error("貓咪品種圖片數量不是 12 張");

  await page.getByRole("tab", { name: /狗狗專區/ }).click();
  if ((await page.getByText("狗狗專區即將推出", { exact: true }).count()) !== 1) throw new Error("狗狗即將推出狀態未顯示");
  await page.getByRole("tab", { name: "貓咪專區" }).click();
  if ((await page.getByText("12 種常見貓咪的相處提示", { exact: true }).count()) !== 1) throw new Error("切回貓咪專區後內容未顯示");

  console.log(JSON.stringify({
    ok: true,
    categorySwitchUrl: afterCategoryUrl,
    searchCleared: true,
    compactCard: true,
    breedImages: 12,
    tabs: ["貓咪專區", "狗狗專區（即將推出）", "小寵物專區（即將推出）"],
  }, null, 2));
} finally {
  await browser.close();
}
