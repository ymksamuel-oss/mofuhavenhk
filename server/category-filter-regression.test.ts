import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { resolveCategorySubSlug } from "../src/lib/products";

const source = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("Supabase category filtering regression", () => {
  it("maps the live child-category slugs to canonical storefront collections", () => {
    expect(resolveCategorySubSlug("cats", "cat-feezed-dried-food")).toBe("冷凍脫水系列");
    expect(resolveCategorySubSlug("cats", "cat-dry-food")).toBe("貓乾糧");
    expect(resolveCategorySubSlug("cats", "cat-wet-food")).toBe("貓罐罐");
    expect(resolveCategorySubSlug("dogs", "dog-dry-food")).toBe("狗狗乾糧");
    expect(resolveCategorySubSlug("dogs", "dog-food-cans")).toBe("狗狗罐頭及濕糧");
    expect(resolveCategorySubSlug("lifestyle", "cat-food-platter")).toBe("食具及餵食");
  });

  it("resolves category_id through the Supabase parent-child tree", () => {
    const catalogServer = source("src/lib/catalog-server.ts");

    expect(catalogServer).toContain("const categoriesById = new Map(flattenCategoryTree(categoryTree)");
    expect(catalogServer).toContain("const categoryAssignment = resolveManagedCategoryAssignment(row.category_id, categoriesById);");
    expect(catalogServer).toContain("const categorySlug = categoryAssignment.categorySlug;");
    expect(catalogServer).toContain("...(subcategory ? { subcategory } : {}),");
    expect(catalogServer).toContain('if (!assigned) return { categorySlug: "unassigned" };');
  });

  it("filters a category route instead of rendering the full catalog", () => {
    const productCatalog = source("src/components/menu/ProductCatalog.tsx");

    expect(productCatalog).toContain("const productsInCategory = getProductsByCategory(categorySlug, catalogProducts);");
    expect(productCatalog).toContain("productsInCategory.filter((product) => product.subcategory === selectedSubcategory)");
    expect(productCatalog).not.toContain("const products = catalogProducts;");
  });
});
