import { describe, expect, it } from "vitest";
import { normalizeProductClassificationText } from "../src/lib/product-classification-text";
import { inferFoodZone, type ClassifiableProduct } from "../src/lib/classifyPetFood";
import { categorySlugFromMetadata, subcategoryFromMetadata } from "../src/lib/products";
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

describe("Simplified Chinese catalog classification normalization", () => {
  it("normalizes only category-bearing vocabulary before classification", () => {
    expect(normalizeProductClassificationText("猫咪冻干鸡肉拌饭／湿粮罐头／小宠物尿垫"))
      .toBe("貓咪凍乾雞肉拌飯／濕糧罐頭／小寵物尿墊");
  });

  it("classifies simplified cat wet food, dry food and snacks into their strict shelves", () => {
    expect(inferFoodZone(product({
      name: { zh: "猫咪罐头湿食", en: "Cat wet food" },
      description: { zh: "猫用", en: "" },
    }))).toMatchObject({ categorySlug: "cats", subcategory: "貓罐罐" });

    expect(inferFoodZone(product({
      name: { zh: "猫粮干粮", en: "Cat dry food" },
      description: { zh: "猫用", en: "" },
    }))).toMatchObject({ categorySlug: "cats", subcategory: "貓乾糧" });

    expect(inferFoodZone(product({
      name: { zh: "猫咪零食", en: "Cat treats" },
      description: { zh: "猫用", en: "" },
    }))).toMatchObject({ categorySlug: "cats", subcategory: "貓貓小食" });
  });

  it("keeps simplified dog freeze-dried food distinct from dog dry food", () => {
    expect(inferFoodZone(product({
      name: { zh: "狗狗冻干鸡肉", en: "Freeze-dried chicken for dogs" },
      description: { zh: "狗用", en: "" },
    }))).toMatchObject({ categorySlug: "dogs", subcategory: "狗狗冷凍脫水食品" });

    expect(inferFoodZone(product({
      categorySlug: "dogs",
      name: { zh: "狗狗干粮", en: "Dog dry food" },
      description: { zh: "狗用", en: "" },
    }))).toMatchObject({ categorySlug: "dogs", subcategory: "狗狗食品" });
  });

  it("accepts Simplified metadata aliases for pet categories and child categories", () => {
    expect(categorySlugFromMetadata("小宠物")).toBe("small-pets");
    expect(categorySlugFromMetadata("宠物小食")).toBe("snacks");
    expect(subcategoryFromMetadata("猫冻干")).toBe("冷凍脫水系列");
    expect(subcategoryFromMetadata("狗狗冻干食品")).toBe("狗狗冷凍脫水食品");
  });

  it("uses the shared normalizer in the Stripe catalog conversion path", () => {
    const source = readFileSync(resolve(process.cwd(), "src/lib/catalog-server.ts"), "utf8");
    expect(source).toContain('normalizeProductClassificationText');
    expect(source).toContain('const FREEZE_DRY_TEXT_MARK');
  });
});
