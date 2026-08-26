import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

type Product = {
  sku: string;
  mofu_import_key: string;
  category: string;
  subcategory: string;
  product_type: string;
  source_image: string;
  cny_cost: string;
  unrounded_retail_hkd: string;
  retail_hkd: string;
  compare_at_price_hkd: null;
  in_stock: boolean;
  cleaned_image_file: string;
  cdn_url: string;
  image_state: string;
};

type Mapping = {
  source_image_count: number;
  mapped_product_count: number;
  skipped_source_count: number;
  products: Product[];
  skipped_sources: Array<{ source_image: string; reason: string }>;
};

const mapping = JSON.parse(
  readFileSync(join(process.cwd(), "new_ciao_inaba_cans_mapping.json"), "utf8"),
) as Mapping;

describe("new CIAO and Inaba cat-can mapping", () => {
  it("accounts for every uploaded source image exactly once after the verified 85g duplicate is consolidated", () => {
    const sources = [
      ...mapping.products.map((product) => product.source_image),
      ...mapping.skipped_sources.map((source) => source.source_image),
    ];

    expect(mapping.source_image_count).toBe(35);
    expect(mapping.mapped_product_count).toBe(28);
    expect(mapping.skipped_source_count).toBe(7);
    expect(sources).toHaveLength(35);
    expect(new Set(sources).size).toBe(35);
    expect(mapping.products.find((product) => product.sku === "CIC-24")?.source_image).toBe("IMG_1812.PNG");
    expect(mapping.skipped_sources.find((source) => source.source_image === "IMG_1815.PNG")?.reason)
      .toContain("CIC-24");
  });

  it("routes all mapped products only to the strict cat-can subcategory with one approved CDN image", () => {
    const imageUrls = new Set<string>();
    for (const product of mapping.products) {
      expect(product.category).toBe("cats");
      expect(product.subcategory).toBe("貓罐罐");
      expect(product.product_type).toBe("cat_wet_food");
      expect(product.image_state).toBe("cleaned_pure_white_cdn_uploaded");
      expect(product.cleaned_image_file).toMatch(/^assets\/new-ciao-inaba-cans\/cic-\d+\.png$/);
      expect(product.cdn_url).toMatch(/^https:\/\/files\.manuscdn\.com\//);
      expect(imageUrls.has(product.cdn_url)).toBe(false);
      imageUrls.add(product.cdn_url);
    }
  });

  it("applies the approved CNY-to-HKD product-margin rule and upward-only .90 rounding without compare-at prices", () => {
    for (const product of mapping.products) {
      const raw = (Number(product.cny_cost) * 1.1654) / (1 - 0.45);
      const expected = Math.ceil(raw - 0.9) + 0.9;
      expect(Number(product.unrounded_retail_hkd)).toBeCloseTo(raw, 5);
      expect(Number(product.retail_hkd)).toBeCloseTo(expected, 2);
      expect(product.compare_at_price_hkd).toBeNull();
    }
  });

  it("does not attempt pricing for unreadable-cost sources and retains their explicit skip reason", () => {
    const unreadableCostSources = [
      "IMG_1786.PNG", "IMG_1790.PNG", "IMG_1802.PNG", "IMG_1803.PNG", "IMG_1805.PNG", "IMG_1808.PNG",
    ];
    for (const source of unreadableCostSources) {
      expect(mapping.skipped_sources.find((entry) => entry.source_image === source)?.reason).toContain("成本未能確認");
    }
  });

  it("keeps source-confirmed out-of-stock products unavailable while preserving their verified price data", () => {
    expect(mapping.products.filter((product) => !product.in_stock).map((product) => product.sku)).toEqual(["CIC-10", "CIC-19"]);
  });
});
