import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  getProductFlavorFamily,
  PRODUCT_FLAVOR_FAMILIES,
} from "../src/lib/products";
describe("verified product flavour families", () => {
  it("maps every product id to one unambiguous purchasable family", () => {
    const seenProductIds = new Set<string>();

    for (const family of PRODUCT_FLAVOR_FAMILIES) {
      expect(family.choices.length).toBeGreaterThan(1);
      for (const choice of family.choices) {
        expect(seenProductIds.has(choice.productId)).toBe(false);
        seenProductIds.add(choice.productId);
        expect(getProductFlavorFamily(choice.productId)).toBe(family);
      }
    }
  });

  it("passes the selected sibling product and its verified Stripe price to the basket", () => {
    const source = readFileSync(
      join(process.cwd(), "src/components/product/ProductDetail.tsx"),
      "utf8",
    );

    expect(source).toContain("const selectedProduct = selectedFamilyChoice?.product ?? product");
    expect(source).toContain("const selectedPriceId = selectedOption?.priceId ?? selectedProduct.priceId");
    expect(source).toContain("<AddToCartButton productId={selectedProduct.id} priceId={selectedPriceId}");
  });

  it("does not render imported informational specs as selectable product options", () => {
    const source = readFileSync(
      join(process.cwd(), "src/components/product/ProductDetail.tsx"),
      "utf8",
    );

    expect(source).toContain("getProductFlavorFamily");
    expect(source).toContain("selectedProduct.id");
    expect(source).not.toContain("product.specs?.length");
    expect(source).not.toContain("productSpecDefault");
  });
});
