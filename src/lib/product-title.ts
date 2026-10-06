export type ProductTitleLocale = "zh" | "en" | "ja";

const CHINESE_TITLE_OVERRIDES: Record<string, string> = {
  "4976064025623": "【低敏紅肉】日本國產純馬肉健康能量棒 35g",
  "4976064022301": "【鹿兒島產】黑豚原隻大豬耳特惠裝 5枚入",
  "4976064025791": "【航天級凍乾】日本國產原條凍乾雞里肌肉 4本入",
};

/**
 * Remove the supplier brand from product titles (it is displayed separately as
 * the product brand) and keep the product type, meat source, and pack size first.
 */
export function sanitizeProductTitle(
  value: string | null | undefined,
  locale: ProductTitleLocale = "zh",
  sku?: string,
): string {
  if (!value) return "";
  if (locale === "zh" && sku && CHINESE_TITLE_OVERRIDES[sku]) {
    return CHINESE_TITLE_OVERRIDES[sku];
  }

  let title = value
    .replace(/\bBest\s*Partner\b/gi, " ")
    .replace(/[\u00a0\u3000]/g, " ");

  if (locale === "zh") {
    title = title
      .replace(/【\s*日本製造[・、]?\s*/g, "【")
      .replace(/(?:狗狗專用|狗狗用|狗用|犬用|貓貓專用|貓貓用|貓用)\s*/g, " ")
      .replace(/【\s*】/g, "");
  } else if (locale === "en") {
    title = title.replace(/^\s*(?:dogs?\s*\/\s*cats?|cats?\s*(?:and|&)\s*dogs?|dogs?|cats?)\s+/i, "");
  }

  return title
    .replace(/(】)\s+/g, "$1")
    .replace(/\s+/g, " ")
    .replace(/\s+([｜|・])/g, "$1")
    .replace(/^\s*[-–—:：|｜・]+\s*/, "")
    .trim();
}
