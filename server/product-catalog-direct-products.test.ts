import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

const productImageConsumers = [
  "src/components/cart/MobileCartDrawer.tsx",
  "src/components/home/HomeProductMarquee.tsx",
  "src/components/home/HomepageProductGrid.tsx",
  "src/components/menu/ProductCatalog.tsx",
  "src/components/menu/ProductQuickView.tsx",
  "src/lib/order.ts",
  "src/lib/products.ts",
];

describe("Supabase product images", () => {
  it("renders catalog products without parent-child traversal", () => {
    const productCatalog = source("src/components/menu/ProductCatalog.tsx");

    expect(productCatalog).toContain("const products = catalogProducts;");
    expect(productCatalog).toContain('const imageUrl = product.images?.[0] ?? "catalog-placeholder";');
    expect(productCatalog).toContain("src={imageUrl}");
    expect(productCatalog).not.toContain("categoryDescendantIds");
    expect(productCatalog).not.toContain("findCategoryBySlug");
    expect(productCatalog).not.toContain("parent.children.find");
  });

  it("uses the first images array URL in every storefront product image consumer", () => {
    for (const path of productImageConsumers) {
      const file = source(path);
      expect(file).toContain("product.images?.[0]");
      expect(file).not.toMatch(/product\.image(?!s)/);
    }
  });
});
