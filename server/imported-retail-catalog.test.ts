import { describe, expect, it } from "vitest";

import { isStorefrontReadyProduct } from "../src/lib/products";

describe("imported retail catalog quality gate", () => {
  it("allows a catalog placeholder only when the Stripe record explicitly marks its image as pending", () => {
    expect(isStorefrontReadyProduct({
      id: "imported-pending-image",
      image: "catalog-placeholder",
      metadata: { image_pending: "true" },
      inStock: true,
    })).toBe(true);

    expect(isStorefrontReadyProduct({
      id: "unverified-placeholder",
      image: "catalog-placeholder",
      metadata: {},
      inStock: true,
    })).toBe(false);
  });

  it("keeps an imported sold-out item visible for status display without treating it as in stock", () => {
    expect(isStorefrontReadyProduct({
      id: "imported-sold-out",
      image: "catalog-placeholder",
      metadata: {
        image_pending: "true",
        show_when_out_of_stock: "true",
      },
      inStock: false,
    })).toBe(true);
  });
});
