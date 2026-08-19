import { describe, expect, it } from "vitest";
import { storefrontCategories } from "../shared/categoryNavigation";
import { catBreedGuides, catCareGuides } from "../shared/petWorld";

describe("storefront navigation and pet world content", () => {
  it("keeps the requested category order without the all-products pill", () => {
    expect(storefrontCategories.map((category) => category.slug)).toEqual([
      "cats",
      "dogs",
      "small-pets",
      "treats",
      "wet-cans",
      "toys",
      "supplements",
      "deals",
      "bestsellers",
      "outdoor",
    ]);
    expect(storefrontCategories.some((category) => category.slug === "all")).toBe(false);
  });

  it("keeps the restored cat breed and care guide content complete", () => {
    expect(catBreedGuides).toHaveLength(12);
    expect(catBreedGuides.every((breed) => breed.name && breed.temperament && breed.care && breed.note)).toBe(true);
    expect(catCareGuides).toHaveLength(6);
    expect(catCareGuides.every((guide) => guide.title && guide.body)).toBe(true);
  });
});
