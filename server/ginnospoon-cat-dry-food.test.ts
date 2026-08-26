import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "..");
const mapping = JSON.parse(
  fs.readFileSync(path.join(root, "ginnospoon_cat_dry_food_mapping.json"), "utf8"),
) as {
  products: Array<{
    import_key: string;
    name_zh: string;
    image_cdn_url: string;
    cost_cny: number;
    retail_hkd: number;
  }>;
};

describe("Gin no Spoon Mitsuboshi Gourmet dry-food import", () => {
  it("keeps ten distinct, real package formulas with one CDN packshot each", () => {
    expect(mapping.products).toHaveLength(10);
    expect(new Set(mapping.products.map((item) => item.import_key)).size).toBe(10);
    expect(mapping.products.every((item) => item.image_cdn_url.startsWith("https://files.manuscdn.com/"))).toBe(true);
  });

  it("keeps the source-cost pricing rule and upward .90 retail prices", () => {
    const hairball = mapping.products.find((item) => item.import_key.includes("hairball-fish-240g"));
    expect(hairball).toMatchObject({ cost_cny: 44.8, retail_hkd: 95.9 });
    expect(mapping.products.filter((item) => item.import_key !== hairball?.import_key).every((item) => item.retail_hkd === 99.9)).toBe(true);
  });

  it("only groups equivalent adult recipe products and never joins life-stage or care formulas", () => {
    const productSource = fs.readFileSync(path.join(root, "src/lib/products.ts"), "utf8");
    expect(productSource).toMatch(/ginnospoon-mitsuboshi-cream-180g/);
    expect(productSource).toMatch(/ginnospoon-mitsuboshi-shimi-192g/);
    expect(productSource).not.toMatch(/ginnospoon-mitsuboshi-vomit-hairball-care-192g[\s\S]*ginnospoon-mitsuboshi-shimi-192g/);
  });

  it("preserves a strict cat dry-food metadata assignment in the importer", () => {
    const importer = fs.readFileSync(path.join(root, "scripts/import_ginnospoon_cat_dry_food.py"), "utf8");
    expect(importer).toMatch(/"category": "cats"/);
    expect(importer).toMatch(/"subcategory": "貓乾糧"/);
    expect(importer).toMatch(/server-validated Stripe Price IDs/);
  });
});
