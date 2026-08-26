import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "..");
const mapping = JSON.parse(
  fs.readFileSync(path.join(root, "complete_ytt_chicken_tenders_mapping.json"), "utf8"),
) as {
  product: { import_key: string; image_cdn_url: string };
  variants: Array<{
    variant_key: string;
    label_zh: string;
    pack_count: number;
    retail_hkd: number;
  }>;
};

describe("Complete ytt single-image pack variants", () => {
  it("keeps five real quantity and mixed-pack choices", () => {
    expect(mapping.product.import_key).toBe("complete-ytt-chicken-tenders-20g");
    expect(mapping.product.image_cdn_url).toMatch(/^https:\/\/files\.manuscdn\.com\//);
    expect(mapping.variants).toHaveLength(5);
    expect(mapping.variants.map((variant) => variant.retail_hkd)).toEqual([
      14.9, 27.9, 69.9, 69.9, 78.9,
    ]);
  });

  it("keeps the two eight-pack choices as independent variants", () => {
    const eightPackVariants = mapping.variants.filter((variant) => variant.pack_count === 8);
    expect(eightPackVariants).toHaveLength(2);
    expect(eightPackVariants[0].variant_key).not.toBe(eightPackVariants[1].variant_key);
    expect(eightPackVariants[0].label_zh).toMatch(/4 口味/);
    expect(eightPackVariants[1].label_zh).toMatch(/自選/);
  });

  it("uses the Stripe price variant key and variant order during catalog parsing", () => {
    const catalogSource = fs.readFileSync(path.join(root, "src/lib/catalog-server.ts"), "utf8");
    expect(catalogSource).toMatch(/function variantSortFromPrice/);
    expect(catalogSource).toMatch(/price\.metadata\.variant_key \|\| `pack-\$\{packCount\}`/);
    expect(catalogSource).toMatch(/variantSortFromPrice\(left\) - variantSortFromPrice\(right\)/);
  });
});
