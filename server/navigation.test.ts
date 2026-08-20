import { describe, expect, it } from "vitest";
import { storefrontCategories } from "../shared/categoryNavigation";
import { catalogHierarchy, subCatalogKeys } from "../shared/catalogHierarchy";
import { catBreedGuides, catCareGuides } from "../shared/petWorld";

describe("storefront navigation and pet world content", () => {
  it("keeps the requested three-catalog order without an all-products pill", () => {
    expect(storefrontCategories.map((category) => category.slug)).toEqual(["cat", "dog", "small-pets"]);
    expect(storefrontCategories.some((category) => category.slug === ("all" as never))).toBe(false);
  });

  it("exposes the exact requested sub-catalog keys under each parent catalog", () => {
    expect(catalogHierarchy.flatMap((catalog) => catalog.subCatalogs.map((subCatalog) => subCatalog.key))).toEqual([
      "cat-wet-food",
      "cat-dry-food",
      "cat-litter",
      "cat-treats",
      "cat-supplies",
      "dog-wet-food",
      "dog-dry-food",
      "dog-treats",
      "dog-supplies",
      "small-pet-food",
      "small-pet-treats",
      "small-pet-supplies",
    ]);
    expect(subCatalogKeys).toHaveLength(12);
    expect(new Set(subCatalogKeys).size).toBe(subCatalogKeys.length);
  });

  it("keeps the restored cat breed and care guide content complete", () => {
    expect(catBreedGuides).toHaveLength(12);
    expect(catBreedGuides.every((breed) => breed.name && (breed.image === "" || breed.image.startsWith("/assets/pet/")) && breed.temperament && breed.care && breed.note)).toBe(true);
    expect(catCareGuides).toHaveLength(6);
    expect(catCareGuides.every((guide) => guide.title && guide.body)).toBe(true);
  });
});
