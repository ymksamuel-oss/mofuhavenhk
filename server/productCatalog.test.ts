import { describe, expect, it } from "vitest";
import { stripeProductsSnapshot } from "../shared/data/stripeProductsSnapshot";
import { filterCatalogProducts, normalizeProductCategories, normalizeRequestedCategory, resolveSearchCategory, type ProductCategory } from "../shared/productCatalog";

describe("product category mapping", () => {
  it("migrates the legacy cleaning category to small-pets", () => {
    expect(normalizeRequestedCategory("cleaning")).toBe("small-pets");
    expect(normalizeRequestedCategory("small-pets")).toBe("small-pets");
    expect(normalizeRequestedCategory("unknown")).toBe("all");
  });

  it("uses the all-products scope when a search query is present", () => {
    expect(resolveSearchCategory("outdoor", "貓")).toBe("all");
    expect(resolveSearchCategory("cats", "  CIAO  ")).toBe("all");
    expect(resolveSearchCategory("outdoor", "")).toBe("outdoor");

    const allCatResults = filterCatalogProducts(stripeProductsSnapshot, "all", "貓");
    const outdoorCatResults = filterCatalogProducts(stripeProductsSnapshot, "outdoor", "貓");
    expect(allCatResults.length).toBeGreaterThan(outdoorCatResults.length);
    expect(allCatResults.length).toBeGreaterThan(0);
  });

  it("normalizes pet-snack labels to the canonical treats category", () => {
    expect(normalizeRequestedCategory("treats")).toBe("treats");
    expect(normalizeRequestedCategory("snacks")).toBe("treats");
    expect(normalizeRequestedCategory("寵物零食")).toBe("treats");
    expect(normalizeRequestedCategory("寵物小食")).toBe("treats");
  });

  it("filters pet snacks without falling back to all dog products", () => {
    const treatProducts = filterCatalogProducts(stripeProductsSnapshot, normalizeRequestedCategory("寵物零食"));
    const dogSnack = stripeProductsSnapshot.find((product) => product.name.includes("狗狗小食"));
    const nonSnackDogProduct = stripeProductsSnapshot.find((product) => product.name.includes("山羊奶（小貓小狗用）"));

    expect(treatProducts.length).toBeGreaterThan(0);
    expect(treatProducts.length).toBeLessThan(stripeProductsSnapshot.length);
    expect(dogSnack).toBeDefined();
    expect(treatProducts.some((product) => product.id === dogSnack!.id)).toBe(true);
    expect(nonSnackDogProduct).toBeDefined();
    expect(treatProducts.some((product) => product.id === nonSnackDogProduct!.id)).toBe(false);
  });

  it("matches Hong Kong pet-search synonyms across the full catalog", () => {
    const cannedResults = filterCatalogProducts(stripeProductsSnapshot, "all", "罐罐");
    const chickenResults = filterCatalogProducts(stripeProductsSnapshot, "all", "雞肉");
    const canRelatedProduct = stripeProductsSnapshot.find((product) => product.name.includes("CIAO 貓罐罐"));
    const chickenRelatedProduct = stripeProductsSnapshot.find((product) => /雞胸肉|雞柳|chicken/i.test([product.name, product.description ?? "", ...Object.values(product.metadata)].join(" ")));

    expect(cannedResults.length).toBeGreaterThan(0);
    expect(canRelatedProduct).toBeDefined();
    expect(cannedResults.some((product) => product.id === canRelatedProduct!.id)).toBe(true);
    expect(chickenResults.length).toBeGreaterThan(0);
    expect(chickenRelatedProduct).toBeDefined();
    expect(chickenResults.some((product) => product.id === chickenRelatedProduct!.id)).toBe(true);
  });

  it("keeps every category button mapped to a valid result set", () => {
    const categories: ProductCategory[] = ["all", "cats", "dogs", "treats", "wet-cans", "toys", "supplements", "small-pets", "deals", "bestsellers", "outdoor"];
    const expectedNonEmpty = new Set<ProductCategory>(["all", "cats", "dogs", "treats", "wet-cans", "supplements", "small-pets", "bestsellers", "outdoor"]);

    for (const category of categories) {
      const results = filterCatalogProducts(stripeProductsSnapshot, category);
      expect(results.length).toBeLessThanOrEqual(stripeProductsSnapshot.length);
      if (expectedNonEmpty.has(category)) expect(results.length, `${category} should have products`).toBeGreaterThan(0);
      if (category !== "all") {
        for (const product of results) expect(normalizeProductCategories(product)).toContain(category);
      }
    }
  });

  it("keeps the cat category populated with cat products", () => {
    const catProducts = filterCatalogProducts(stripeProductsSnapshot, "cats");

    expect(catProducts.length).toBeGreaterThan(0);
    expect(catProducts.some((product) => /貓|CIAO|cat/i.test(product.name))).toBe(true);
  });

  it("keeps the cat cans out of the small-pets category", () => {
    const catCan = stripeProductsSnapshot.find((product) => product.name.includes("CIAO 貓罐罐"));

    expect(catCan).toBeDefined();
    const categories = normalizeProductCategories(catCan!);
    expect(categories).toContain("cats");
    expect(categories).toContain("wet-cans");
    expect(categories).not.toContain("small-pets");
  });

  it("does not return cat cans for the small-pets filter", () => {
    const smallPetProducts = filterCatalogProducts(stripeProductsSnapshot, "small-pets");

    expect(smallPetProducts.some((product) => product.name.includes("貓罐罐"))).toBe(false);
    expect(smallPetProducts).toHaveLength(6);
  });

  it("keeps the wet-cans filter populated with the cat cans", () => {
    const wetCanProducts = filterCatalogProducts(stripeProductsSnapshot, "wet-cans");

    expect(wetCanProducts).toHaveLength(9);
    expect(wetCanProducts.some((product) => product.name.includes("CIAO 貓罐罐"))).toBe(true);
  });

  it("does not classify food as small pets because its description mentions deodorizing", () => {
    const foodWithDeodorizingDescription = stripeProductsSnapshot.find((product) => product.description?.includes("消臭"));

    expect(foodWithDeodorizingDescription).toBeDefined();
    expect(normalizeProductCategories(foodWithDeodorizingDescription!)).not.toContain("small-pets");
  });
});
