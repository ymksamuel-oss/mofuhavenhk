import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import snapshot from "../src/data/catalog-fallback.json";

describe("static Best Partner catalog images", () => {
  const bySku = (sku: string) => {
    const product = snapshot.products.find((candidate) => candidate.mofu_sku === sku);
    if (!product) throw new Error(`Missing static catalog product ${sku}`);
    return product;
  };

  it.each(["4976064025500", "4976064025531"])(
    "uses the recovered Best Partner image as the only first image for %s",
    (sku) => {
      const product = bySku(sku);
      const image = `/images/products/best-partner-${sku}.webp`;
      expect(product.image_url).toBe(image);
      expect(product.images).toEqual([image]);
    },
  );

  it("adds only the two visually distinct bp images to the matching galleries", () => {
    const product5470 = bySku("4976064025470");
    const product6545 = bySku("4976064026545");
    expect(product5470.images).toEqual([
      "/images/products/4976064025470-1.webp",
      "/images/products/4976064025470-2.webp",
      "/images/products/bp-4976064025470.webp",
    ]);
    expect(product6545.images).toEqual([
      "/images/products/4976064026545-1.webp",
      "/images/products/bp-4976064026545.webp",
    ]);
  });

  it("does not add duplicate Best Partner or bp alternate names to catalog galleries", () => {
    for (const sku of ["4976064026569", "4976064025470", "4976064026545"]) {
      const images = bySku(sku).images ?? [];
      expect(images).not.toContain(`/images/products/best-partner-${sku}.webp`);
      if (sku !== "4976064025470" && sku !== "4976064026545") {
        expect(images).not.toContain(`/images/products/bp-${sku}.webp`);
      }
    }
  });

  it("uses the catalog gallery for SKU 4976064026569 instead of the retired Supabase JPG override", () => {
    const detail = readFileSync(resolve(process.cwd(), "src/components/product/ProductDetail.tsx"), "utf8");
    expect(detail).not.toContain("4976064026569-0.jpg");
    expect(detail).not.toContain("4976064026569-1.jpg");
    expect(detail).toContain("images={selectedOption?.image ? [selectedOption.image] : selectedProduct.images}");
  });
});
