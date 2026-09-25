import { describe, expect, it } from "vitest";
import { getLocalizedProductName } from "@/lib/translateProductName";
import type { Product } from "@/lib/products";

const baseProduct = {
  id: "product-1",
  categorySlug: "dogs",
  image: "catalog-placeholder",
  icon: "dog",
  price: 69.9,
  name: { zh: "中文商品名", en: "中文商品名" },
} satisfies Product;

describe("getLocalizedProductName", () => {
  it("uses the raw database name_en alias before the normalized name object", () => {
    expect(getLocalizedProductName({ ...baseProduct, name_en: "BestPartner Dog Venison Jerky 25g" }, "en"))
      .toBe("BestPartner Dog Venison Jerky 25g");
  });

  it("supports a raw string name with an English alias", () => {
    const rawPayload = {
      ...baseProduct,
      name: "中文商品名",
      name_en: "BestPartner Cat Tuna Flakes 30g",
    } as unknown as Product;
    expect(getLocalizedProductName(rawPayload, "en")).toBe("BestPartner Cat Tuna Flakes 30g");
  });

  it("never returns CJK text as the English name when no safe alias exists", () => {
    expect(getLocalizedProductName(baseProduct, "en")).toBe("中文商品名");
  });
});
