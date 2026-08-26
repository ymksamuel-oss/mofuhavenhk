import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { getProductFlavorFamily } from "../src/lib/products";

type Latest31Product = {
  action: "create";
  sku: string;
  import_key: string;
  source_images: string[];
  category: string;
  subcategory: string;
  product_type: string;
  source_cost_cny: string;
  unrounded_retail_hkd: string;
  retail_hkd: string;
  image_cdn_url: string;
};

type ExistingImageUpdate = {
  action: "update_existing_image";
  existing_import_key: string;
  source_images: string[];
  image_cdn_url: string;
};

type Latest31Mapping = {
  source_record_count: number;
  deduplicated_candidate_sku_count: number;
  created_products: Latest31Product[];
  existing_product_image_updates: ExistingImageUpdate[];
};

const mapping = JSON.parse(
  readFileSync(join(process.cwd(), "latest_31_product_mapping.json"), "utf8"),
) as Latest31Mapping;

describe("latest31 product mapping", () => {
  it("accounts for every source exactly once after consolidating the verified AIM30 duplicate", () => {
    const sourceImages = [
      ...mapping.created_products.flatMap((product) => product.source_images),
      ...mapping.existing_product_image_updates.flatMap((product) => product.source_images),
    ];

    expect(mapping.source_record_count).toBe(31);
    expect(mapping.deduplicated_candidate_sku_count).toBe(30);
    expect(mapping.created_products).toHaveLength(23);
    expect(mapping.existing_product_image_updates).toHaveLength(7);
    expect(sourceImages).toHaveLength(31);
    expect(new Set(sourceImages).size).toBe(31);
    expect(mapping.created_products.find((product) => product.sku === "aim30-senior-15plus-fish-600g")?.source_images)
      .toEqual(["IMG_1754.jpg", "IMG_1746.jpg"]);
  });

  it("routes all new dry food and treats to their strict cat subcategories", () => {
    for (const product of mapping.created_products) {
      expect(product.category).toBe("cats");
      expect(product.image_cdn_url).toMatch(/^https:\/\/files\.manuscdn\.com\//);
      expect(product.subcategory).toBe(
        product.product_type === "cat dry food" ? "貓乾糧" : "貓貓小食",
      );
    }
  });

  it("uses the approved upward-only .90 pricing rule without inventing compare-at prices", () => {
    for (const product of mapping.created_products) {
      const raw = (Number(product.source_cost_cny) * 1.1654) / (1 - 0.45);
      const expected = Math.ceil(raw - 0.9) + 0.9;
      expect(Number(product.unrounded_retail_hkd)).toBeCloseTo(raw, 2);
      expect(Number(product.retail_hkd)).toBeCloseTo(expected, 2);
    }
  });

  it("refreshes only the seven verified existing images and never maps them as new import keys", () => {
    const existingKeys = mapping.existing_product_image_updates.map((product) => product.existing_import_key);
    expect(existingKeys).toEqual([
      "aim30-chicken-shreds-25g-v1",
      "aim30-tuna-slices-30g-v1",
      "aim30-bonito-flakes-12g-v1",
      "aim30-karitto-fish-four-80g-v1",
      "aim30-karitto-chicken-80g-v1",
      "aim30-karitto-fish-80g-v1",
      "ginnospoon-cream-tuna-white-shrimp-180g-v1",
    ]);
  });

  it("uses a real sibling product for each verified new flavour selector", () => {
    expect(getProductFlavorFamily("prod_V8xXuAW047ti4v")?.choices.map((choice) => choice.productId)).toEqual([
      "prod_V8xXuAW047ti4v",
      "prod_V8xXIokF7G9Er0",
    ]);
    expect(getProductFlavorFamily("prod_V8xXBfCtwPwxjK")?.choices).toHaveLength(3);
    expect(getProductFlavorFamily("prod_V8xXSx8MWb3Y8D")?.choices).toHaveLength(6);
    expect(getProductFlavorFamily("prod_V8xXRC7As2ra5W")?.choices).toHaveLength(4);
  });
});
