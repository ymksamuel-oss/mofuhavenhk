import { describe, expect, it } from "vitest";

import { databaseProductImageUrls } from "../src/lib/catalog-images";

describe("database product image mapping", () => {
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
});
