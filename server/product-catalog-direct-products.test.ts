import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = () =>
  readFileSync(resolve(process.cwd(), "src/components/menu/ProductCatalog.tsx"), "utf8");

describe("category product catalog", () => {
  it("renders the Supabase-mapped catalog products without parent-child traversal", () => {
    const productCatalog = source();

    expect(productCatalog).toContain("const products = catalogProducts;");
    expect(productCatalog).not.toContain("categoryDescendantIds");
    expect(productCatalog).not.toContain("findCategoryBySlug");
    expect(productCatalog).not.toContain("parent.children.find");
  });
});
