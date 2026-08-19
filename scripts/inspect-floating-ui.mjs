import { chromium } from "playwright";

const previewUrl = "https://3000-iwglvs12np74x9w4j2ngh-7feb189a.sg1.manus.computer/";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto(previewUrl, { waitUntil: "networkidle" });
await page.waitForTimeout(800);

const result = await page.evaluate(() => {
  const visible = (element) => {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) > 0 && rect.width > 0 && rect.height > 0;
  };
  const fixedElements = [...document.querySelectorAll("body *")]
    .filter((element) => visible(element) && getComputedStyle(element).position === "fixed")
    .map((element) => ({
      tag: element.tagName,
      id: element.id,
      className: typeof element.className === "string" ? element.className : "",
      text: (element.textContent || "").trim().slice(0, 120),
      rect: (() => { const r = element.getBoundingClientRect(); return { left: r.left, top: r.top, width: r.width, height: r.height }; })(),
      zIndex: getComputedStyle(element).zIndex,
    }));
  return {
    bodyTextContainsManus: /made with manus|manus/i.test(document.body.innerText),
    fixedElements,
  };
});

console.log(JSON.stringify(result, null, 2));
await browser.close();
