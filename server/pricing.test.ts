import { describe, expect, it } from "vitest";
import { calculateFinalSalePrice, calculateSuggestedRetailPrice } from "../src/lib/pricing";

describe("cost-based HKD product pricing", () => {
  it("calculates the genuine MSRP from JPY cost without including shipping", () => {
    expect(calculateSuggestedRetailPrice(275)).toBe(31);
  });

  it("applies the 12% uplift and .90 tail to MSRP, not the old retail price", () => {
    const msrp = calculateSuggestedRetailPrice(275);
    expect(calculateFinalSalePrice(msrp)).toBe(34.9);
  });

  it("rounds suggested MSRP to whole HKD before applying the final price rule", () => {
    expect(calculateSuggestedRetailPrice(220)).toBe(25);
    expect(calculateFinalSalePrice(25)).toBe(28.9);
  });

  it("returns zero for invalid or negative source values instead of inventing a price", () => {
    expect(calculateSuggestedRetailPrice(null)).toBe(0);
    expect(calculateSuggestedRetailPrice(-275)).toBe(0);
    expect(calculateFinalSalePrice(Number.NaN)).toBe(0);
  });
});
