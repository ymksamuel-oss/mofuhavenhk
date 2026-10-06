import { describe, expect, it } from "vitest";
import { sanitizeProductTitle } from "../src/lib/product-title";

describe("product title sanitization", () => {
  it("uses the approved concise horse-meat energy bar title", () => {
    expect(sanitizeProductTitle(
      "【日本製造・低敏紅肉】BestPartner 狗狗專用純馬肉健康能量棒 35g（過敏體質・高蛋白低脂首選）",
      "zh",
      "4976064025623",
    )).toBe("【低敏紅肉】日本國產純馬肉健康能量棒 35g");
  });

  it("uses the approved concise Kagoshima black-pork title", () => {
    expect(sanitizeProductTitle(
      "【日本製造・鹿兒島產】BestPartner 鹿兒島黑豚原隻大豬耳特惠裝 5枚入",
      "zh",
      "4976064022301",
    )).toBe("【鹿兒島產】黑豚原隻大豬耳特惠裝 5枚入");
  });

  it("uses the approved concise freeze-dried chicken title", () => {
    expect(sanitizeProductTitle(
      "【日本製造・航天級凍乾】BestPartner 國產原條凍乾雞里肌肉家庭裝 4本入",
      "zh",
      "4976064025791",
    )).toBe("【航天級凍乾】日本國產原條凍乾雞里肌肉 4本入");
  });

  it("removes compact or spaced brand spellings and English pet-audience prefixes", () => {
    expect(sanitizeProductTitle("BestPartner Dog Pure Horse Meat 35g", "en"))
      .toBe("Pure Horse Meat 35g");
    expect(sanitizeProductTitle("Best Partner Cat Freeze-Dried Chicken 4pcs", "en"))
      .toBe("Freeze-Dried Chicken 4pcs");
  });

  it("removes brand and audience noise from non-overridden Chinese titles", () => {
    expect(sanitizeProductTitle("【日本製造・低敏紅肉】BestPartner 狗狗專用純馬肉 35g", "zh"))
      .toBe("【低敏紅肉】純馬肉 35g");
  });
});
