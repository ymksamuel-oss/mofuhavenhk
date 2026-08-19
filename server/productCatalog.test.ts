import { describe, expect, it } from "vitest";
import { stripeProductsSnapshot } from "../shared/data/stripeProductsSnapshot";
import { filterCatalogProducts, normalizeProductCategories } from "../shared/productCatalog";

describe("product category mapping", () => {
  it("keeps cat cans out of the cleaning category", () => {
    const catCan = stripeProductsSnapshot.find((product) => product.name.includes("CIAO 貓罐罐"));

    expect(catCan).toBeDefined();
    const categories = normalizeProductCategories(catCan!);
    expect(categories).toContain("cats");
    expect(categories).toContain("wet-cans");
    expect(categories).not.toContain("cleaning");
  });

  it("does not return cat cans for the cleaning filter", () => {
    const cleaningProducts = filterCatalogProducts(stripeProductsSnapshot, "cleaning");

    expect(cleaningProducts.some((product) => product.name.includes("貓罐罐"))).toBe(false);
  });

  it("keeps the wet-cans filter populated with the cat cans", () => {
    const wetCanProducts = filterCatalogProducts(stripeProductsSnapshot, "wet-cans");

    expect(wetCanProducts.some((product) => product.name.includes("CIAO 貓罐罐"))).toBe(true);
  });

  it("does not classify food as cleaning because its description mentions deodorizing", () => {
    const foodWithDeodorizingDescription = stripeProductsSnapshot.find((product) => product.description?.includes("消臭"));

    expect(foodWithDeodorizingDescription).toBeDefined();
    expect(normalizeProductCategories(foodWithDeodorizingDescription!)).not.toContain("cleaning");
  });
});
