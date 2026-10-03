import { describe, expect, it } from "vitest";
import { getProductJanCode, isValidGtin13 } from "@/lib/product-identifiers";

describe("GTIN-13 / JAN identifiers", () => {
  it("accepts 13-digit values with a valid GS1 check digit", () => {
    expect(isValidGtin13("4976064025609")).toBe(true);
    expect(isValidGtin13("4976064026545")).toBe(true);
  });

  it("rejects malformed values and invalid check digits", () => {
    expect(isValidGtin13("4976064025608")).toBe(false);
    expect(isValidGtin13("497606402560")).toBe(false);
    expect(isValidGtin13("49760640256X9")).toBe(false);
  });

  it("prefers an explicit JAN over the storefront SKU", () => {
    expect(getProductJanCode({
      id: "product-id",
      jan: " 4976064025609 ",
      mofuSku: "4976064026545",
    })).toBe("4976064025609");
  });

  it("falls back to the 13-digit storefront SKU when JAN is absent or invalid", () => {
    expect(getProductJanCode({ id: "product-id", mofuSku: "4976064026545" }))
      .toBe("4976064026545");
    expect(getProductJanCode({ id: "product-id", jan: "bad-code", mofuSku: "4976064025623" }))
      .toBe("4976064025623");
  });

  it("does not assign a product GTIN to a store-created bundle", () => {
    expect(getProductJanCode({ id: "bundle-id", mofuSku: "MOFU-BUNDLE-DENTAL-02" }))
      .toBeUndefined();
  });
});
