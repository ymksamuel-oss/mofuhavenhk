import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const mapping = JSON.parse(
  fs.readFileSync(path.join(root, "new_batch_cat_litter_and_dry_food_mapping.json"), "utf8"),
) as {
  products: Array<{
    import_key: string;
    category: string;
    subcategory: string;
    variants: Array<{ key: string; label_zh: string; retail_hkd: number }>;
  }>;
};

const catalogSource = fs.readFileSync(path.join(root, "src/lib/catalog-server.ts"), "utf8");

describe("new cat litter and dry food import", () => {
  it("keeps the 13 approved products in their declared cat shelves", () => {
    expect(mapping.products).toHaveLength(13);
    const litter = mapping.products.filter((product) => product.subcategory === "litter");
    const dryFood = mapping.products.filter((product) => product.subcategory === "dry-food");
    expect(litter.map((product) => product.import_key)).toEqual([
      "unicharm-deotile-natural-green-litter-3-8l-v1",
      "nyantomo-wood-litter-4-4l-v1",
      "pamax-miracle-enzyme-cat-litter-v1",
      "snappy-dust-cut-bentonite-litter-7l-v1",
    ]);
    expect(dryFood).toHaveLength(9);
  });

  it("preserves real Nyantomo grain choices and PAMAX pack choices", () => {
    const nyantomo = mapping.products.find((product) => product.import_key === "nyantomo-wood-litter-4-4l-v1");
    const pamax = mapping.products.find((product) => product.import_key === "pamax-miracle-enzyme-cat-litter-v1");
    expect(nyantomo?.variants.map((variant) => variant.label_zh)).toEqual([
      "4.4L｜極小顆粒",
      "4.4L｜小顆粒",
      "4.4L｜大顆粒",
    ]);
    expect(pamax?.variants.map((variant) => variant.label_zh)).toEqual([
      "1 包｜2.7kg",
      "2 包｜5.4kg",
      "6 包｜16.2kg",
    ]);
  });

  it("prefers an explicit metadata slug over incidental import-source words and renders choice variants", () => {
    expect(catalogSource).toContain("resolveCategorySubSlug(categorySlug, raw)");
    expect(catalogSource).toContain('variantMode === "choice"');
  });
});
