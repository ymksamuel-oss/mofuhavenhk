import { describe, expect, it } from "vitest";
import { stripeProductsSnapshot } from "../shared/data/stripeProductsSnapshot";
import { filterCatalogProducts, normalizeProductCategories, normalizeRequestedCategory, resolveSearchCategory } from "../shared/productCatalog";

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

  it("keeps cat cans out of the small-pets category", () => {
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
