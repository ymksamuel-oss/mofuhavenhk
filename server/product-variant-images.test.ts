import { describe, expect, it } from "vitest";

import {
  getVerifiedVariantImageRules,
  resolveProductVariantImage,
} from "../src/lib/product-variant-images";

describe("product variant image resolution", () => {
  it("prefers an explicit Stripe metadata image", () => {
    expect(
      resolveProductVariantImage({
        productId: "prod_V8szss31Rm8tiJ",
        variantKey: "raised-flat-green-leaf",
        labelZh: "綠葉圖案",
        explicitImage: "/images/custom/green-leaf-v2.png",
      }),
    ).toBe("/images/custom/green-leaf-v2.png");
  });

  it("resolves verified legacy bowl prices by semantic label", () => {
    expect(
      resolveProductVariantImage({
        productId: "prod_V8szss31Rm8tiJ",
        variantKey: "option-2",
        labelZh: "綠葉圖案",
      }),
    ).toBe("/images/product-variants/cat-bowls/raised-flat-green-leaf.png");
    expect(
      resolveProductVariantImage({
        productId: "prod_V8szxN4qvZQyrJ",
        labelZh: "藍胖胖",
      }),
    ).toBe("/images/product-variants/cat-bowls/cat-ear-blue-chubby.png");
  });

  it("does not guess an image for an unknown option", () => {
    expect(
      resolveProductVariantImage({
        productId: "prod_V8szss31Rm8tiJ",
        variantKey: "raised-flat-new-pattern",
        labelZh: "新圖案",
      }),
    ).toBeUndefined();
  });

  it("keeps the verified registry explicit and finite", () => {
    const rules = getVerifiedVariantImageRules();
    expect(rules).toHaveLength(8);
    expect(new Set(rules.map((rule) => `${rule.productId}:${rule.key}`)).size).toBe(rules.length);
    expect(rules.every((rule) => rule.image.startsWith("/images/product-variants/"))).toBe(true);
  });
});
