import { describe, expect, it } from "vitest";

import { databaseProductImageUrls, orderProductImages } from "../src/lib/catalog-images";

describe("database product image mapping", () => {
  it("preserves curated product-before-pouch ordering regardless of filename suffix", () => {
    const meatCloseUp = "https://storage.supabase.co/official-4976064026545-1.jpg";
    const packaging = "https://storage.supabase.co/official-4976064026545-0.jpg";
    expect(orderProductImages([meatCloseUp, packaging])).toEqual([meatCloseUp, packaging]);
  });

  it("deduplicates image URLs without changing their explicit order", () => {
    const first = "https://storage.supabase.co/close-up.jpg";
    const last = "https://storage.supabase.co/pouch.jpg";
    expect(orderProductImages([first, last, first])).toEqual([first, last]);
  });

  it("allows same-site relative product images to remain a usable image source", () => {
    expect(databaseProductImageUrls({
      images: ["/images/products/bp-4976064026545.jpg", "https://storage.supabase.co/pouch.jpg"],
    })).toEqual(["/images/products/bp-4976064026545.jpg", "https://storage.supabase.co/pouch.jpg"]);
  });

  it("keeps the existing images column as the preferred source", () => {
    expect(databaseProductImageUrls({
      images: ["https://storage.supabase.co/cat-dry-food.jpg"],
      image: "https://storage.supabase.co/legacy.jpg",
      image_url: "https://storage.supabase.co/category.jpg",
    })).toEqual(["https://storage.supabase.co/cat-dry-food.jpg", "https://storage.supabase.co/legacy.jpg", "https://storage.supabase.co/category.jpg"]);
  });

  it("restores rows that only have the legacy image or image_url field", () => {
    expect(databaseProductImageUrls({ image: "https://storage.supabase.co/dog-dry-food.jpg" }))
      .toEqual(["https://storage.supabase.co/dog-dry-food.jpg"]);
    expect(databaseProductImageUrls({ image_url: "https://storage.supabase.co/cat-wet-food.jpg" }))
      .toEqual(["https://storage.supabase.co/cat-wet-food.jpg"]);
  });

  it("does not replace or accept the retired storefront asset route", () => {
    expect(databaseProductImageUrls({
      images: ["https://mofuhavenhk.com/assets/product/old.jpg"],
      image_url: "https://storage.supabase.co/valid.jpg",
    })).toEqual(["https://storage.supabase.co/valid.jpg"]);
  });

  it("preserves the deliberate admin cover order on the storefront", () => {
    expect(databaseProductImageUrls({
      images: [
        "https://storage.supabase.co/custom-cover.jpg",
        "https://storage.supabase.co/official-4976064025470-0.jpg",
      ],
    })).toEqual([
      "https://storage.supabase.co/custom-cover.jpg",
      "https://storage.supabase.co/official-4976064025470-0.jpg",
    ]);
  });
});
