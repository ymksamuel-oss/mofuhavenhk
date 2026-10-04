import { describe, expect, it } from "vitest";
import { inferFoodZone, type ClassifiableProduct } from "../src/lib/classifyPetFood";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function product(overrides: Partial<ClassifiableProduct>): ClassifiableProduct {
  return {
    id: "fixture",
    categorySlug: "snacks",
    name: { zh: "", en: "" },
    ...overrides,
  };
}

describe("simplified and traditional freeze-dried normalization", () => {
  it("maps simplified 凍干 cat meal topper wording to the cat freeze-dried series", () => {
    const result = inferFoodZone(product({
      id: "prod_V8W07sgetW5UqK",
      categorySlug: "snacks",
      name: { zh: "雞胸肉碎沫凍干粉拌飯", en: "Freeze-Dried Chicken Breast Crumble Meal Topper" },
      description: {
        zh: "貓咪用凍乾碎末，可少量拌入日常餐點。",
        en: "Freeze-dried cat meal topper.",
      },
      productType: "freeze-dried topper",
    }));

    expect(result).toMatchObject({
      categorySlug: "cats",
      subcategory: "冷凍脫水系列",
    });
    expect(result?.tags).toContain("凍乾糧");
  });

  it("maps simplified 凍干 dog-only snacks to dog freeze-dried food, not generic treats", () => {
    const result = inferFoodZone(product({
      categorySlug: "snacks",
      name: { zh: "雞里脊凍干 150g（犬用）", en: "Freeze-Dried Chicken Tenderloin for Dogs" },
      description: { zh: "狗用凍干小食。", en: "Dog freeze-dried food." },
    }));

    expect(result).toMatchObject({
      categorySlug: "dogs",
      subcategory: "狗狗冷凍脫水食品",
    });
  });

  it("keeps dog dry food with freeze-dried topping words as dog dry food in the catalog parser", () => {
    const source = readFileSync(resolve(process.cwd(), "src/lib/catalog-server.ts"), "utf8");
    expect(source).toContain(String.raw`\u51b7\u51bb\u8131\u6c34`);
    expect(source).toContain(String.raw`\u51cd\u5e72`);
    const dryFoodRule = source.indexOf(String.raw`dry\s*food)/i.test(text)) return`);
    const freezeDryRule = source.lastIndexOf("FREEZE_DRY_TEXT_MARK.test(text)");
    expect(dryFoodRule).toBeGreaterThanOrEqual(0);
    expect(freezeDryRule).toBeGreaterThan(dryFoodRule);
  });
});
