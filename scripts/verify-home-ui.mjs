import { chromium } from "playwright";

const previewUrl = "https://3000-iwglvs12np74x9w4j2ngh-7feb189a.sg1.manus.computer/";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
await page.goto(previewUrl, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);

const report = await page.evaluate(() => {
  const subcategoryRow = document.querySelector('[aria-label="子分類"]');
  const bodyStyles = getComputedStyle(document.body);
  const productList = document.querySelector("#product-list");
  const productCard = productList?.querySelector('[role="button"]');
  const cardStyles = productCard ? getComputedStyle(productCard) : null;
  const before = subcategoryRow
    ? { clientWidth: subcategoryRow.clientWidth, scrollWidth: subcategoryRow.scrollWidth, scrollLeft: subcategoryRow.scrollLeft }
    : null;
  if (subcategoryRow) subcategoryRow.scrollLeft = Math.min(160, subcategoryRow.scrollWidth);
  const after = subcategoryRow
    ? { clientWidth: subcategoryRow.clientWidth, scrollWidth: subcategoryRow.scrollWidth, scrollLeft: subcategoryRow.scrollLeft }
    : null;
  return {
    subcategoryRowFound: Boolean(subcategoryRow),
    subcategoryOverflow: Boolean(subcategoryRow && subcategoryRow.scrollWidth > subcategoryRow.clientWidth),
    before,
    after,
    bodyBackground: bodyStyles.backgroundColor,
    productListBackground: productList ? getComputedStyle(productList).backgroundColor : null,
    productCardBackground: cardStyles?.backgroundColor ?? null,
  };
});

console.log(JSON.stringify(report, null, 2));
await browser.close();
