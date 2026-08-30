import { describe, expect, it } from "vitest";
import { canonicalCategorySlug, isCategorySlug } from "../src/lib/categories";
import { categorySlugFromMofuSku, getProductsByCategory, type Product } from "../src/lib/products";

describe("category slug and Mofu SKU normalization", () => {
  it("treats singular and plural pet slugs as the same canonical category", () => {
    expect(canonicalCategorySlug("cat")).toBe("cats");
    expect(canonicalCategorySlug("cats")).toBe("cats");
    expect(canonicalCategorySlug("dog")).toBe("dogs");
    expect(canonicalCategorySlug("dogs")).toBe("dogs");
    expect(isCategorySlug("cat")).toBe(true);
    expect(isCategorySlug("dog")).toBe(true);
  });

  it("classifies SKU prefixes and lets them override a stale category value", () => {
    expect(categorySlugFromMofuSku("MH-CAT-ABC-001")).toBe("cats");
    expect(categorySlugFromMofuSku("MH-DOG-ABC-001")).toBe("dogs");

    const products: Product[] = [
      {
        id: "cat-by-sku",
        categorySlug: "dogs",
        image: "/cat.jpg",
        name: { zh: "貓咪商品", en: "Cat product" },
        price: 10,
        icon: "cat",
        metadata: { mofu_sku: "MH-CAT-TEST-001" },
      },
      {
        id: "dog-by-route",
        categorySlug: "dog",
        image: "/dog.jpg",
        name: { zh: "狗狗商品", en: "Dog product" },
        price: 10,
        icon: "dog",
      },
    ];

    expect(getProductsByCategory("cat", products).map((product) => product.id)).toEqual(["cat-by-sku"]);
    expect(getProductsByCategory("dogs", products).map((product) => product.id)).toEqual(["dog-by-route"]);
  });
});
