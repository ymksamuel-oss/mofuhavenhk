import { describe, expect, it } from "vitest";
import { normalizeProductImageUrl } from "../src/lib/catalog-images";

describe("normalizeProductImageUrl", () => {
  it("trims surrounding whitespace from external image URLs", () => {
    expect(normalizeProductImageUrl("  https://cdn.example.com/cat.png  \n")).toBe(
      "https://cdn.example.com/cat.png",
    );
  });

  it("adds a leading slash and encodes spaces in relative public paths", () => {
    expect(normalizeProductImageUrl("images/product photo.png")).toBe(
      "/images/product%20photo.png",
    );
  });

  it("normalizes dot-relative and public/asset paths", () => {
    expect(normalizeProductImageUrl("./public/images/item.png?size=small")).toBe(
      "/images/item.png?size=small",
    );
  });

  it("rejects empty, placeholder, protocol-relative, and legacy product URLs", () => {
    expect(normalizeProductImageUrl("   ")).toBeNull();
    expect(normalizeProductImageUrl("catalog-placeholder")).toBeNull();
    expect(normalizeProductImageUrl("//cdn.example.com/image.png")).toBeNull();
    expect(normalizeProductImageUrl("https://mofuhavenhk.com/assets/product/old.png")).toBeNull();
  });

  it("rejects control characters within a URL", () => {
    expect(normalizeProductImageUrl("/images/product\nphoto.png")).toBeNull();
  });
});
