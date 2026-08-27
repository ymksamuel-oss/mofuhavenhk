import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "..");
const mapping = JSON.parse(
  fs.readFileSync(path.join(root, "cat_feeding_bowls_mapping.json"), "utf8"),
) as {
  category: { category_slug: string; subcategory: string; pet_type: string };
  products: Array<{
    import_key: string;
    source_image: string;
    cost_cny: number;
    retail_hkd: number;
    variants: Array<{
      key: string;
      label_zh: string;
      label_en: string;
      image: string;
    }>;
  }>;
};

describe("cat feeding bowl option variants", () => {
  it("keeps six distinct bowl designs with cleaned CDN main images", () => {
    expect(mapping.category).toEqual({
      category_slug: "lifestyle",
      subcategory: "食具及餵食",
      pet_type: "cats",
    });
    expect(mapping.products).toHaveLength(6);
    expect(mapping.products.every((product) => product.source_image.startsWith("https://files.manuscdn.com/"))).toBe(true);
    expect(mapping.products.map((product) => product.retail_hkd)).toEqual([
      54.9, 65.9, 59.9, 38.9, 59.9, 46.9,
    ]);
  });

  it("preserves real pattern and colour choices within the appropriate bowl product", () => {
    const earBowl = mapping.products.find((product) => product.import_key === "cat-ear-slanted-bowl-12cm");
    const flatBowl = mapping.products.find((product) => product.import_key === "flat-raised-ceramic-bowl-250ml");
    const faceBowl = mapping.products.find((product) => product.import_key === "cat-face-slanted-raised-bowl-350ml");
    expect(earBowl?.variants.map((variant) => variant.label_zh)).toEqual(["自在如風（藍色插畫）", "柿柿如意（綠色插畫）", "藍胖胖", "綠胖胖"]);
    expect(flatBowl?.variants.map((variant) => variant.label_zh)).toEqual(["魚圖案", "綠葉圖案", "羽毛圖案"]);
    expect(faceBowl?.variants.map((variant) => variant.label_zh)).toEqual(["白色", "橘色", "藍色"]);
  });

  it("requires every bowl choice to carry a stable semantic key and image", () => {
    for (const product of mapping.products) {
      for (const variant of product.variants) {
        expect(variant.key).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)+$/);
        expect(variant.label_zh.length).toBeGreaterThan(0);
        expect(variant.label_en.length).toBeGreaterThan(0);
        expect(variant.image.length).toBeGreaterThan(0);
      }
    }
  });

  it("supports generic option variants and a product-defined selector label", () => {
    const catalogSource = fs.readFileSync(path.join(root, "src/lib/catalog-server.ts"), "utf8");
    const detailSource = fs.readFileSync(path.join(root, "src/components/product/ProductDetail.tsx"), "utf8");
    expect(catalogSource).toMatch(/variantMode === "option" \|\| variantMode === "choice"/);
    expect(catalogSource).toMatch(/resolveCategorySubSlug\(categorySlug, raw\)/);
    expect(detailSource).toMatch(/variant_selection_label_\$\{locale\}/);
    expect(detailSource).toMatch(/variantSelectorTitle/);
  });
});
