import { describe, expect, it } from "vitest";
import { getFreeShippingProgress } from "@/lib/shipping-progress";

describe("free-shipping progress display math", () => {
  it("shows one cent remaining below the HK$399 threshold", () => {
    expect(getFreeShippingProgress(398.99)).toEqual({
      reached: false,
      remaining: 0.01,
      percentage: 99,
      currentAmount: 398.99,
    });
  });

  it("unlocks exactly at HK$399 and caps progress above the threshold", () => {
    expect(getFreeShippingProgress(399)).toEqual({
      reached: true,
      remaining: 0,
      percentage: 100,
      currentAmount: 399,
    });
    expect(getFreeShippingProgress(450).currentAmount).toBe(399);
  });

  it("normalizes floating-point input to cents", () => {
    expect(getFreeShippingProgress(0.1 + 0.2).remaining).toBe(398.7);
  });

  it("treats negative and non-finite subtotals as zero", () => {
    expect(getFreeShippingProgress(-1).currentAmount).toBe(0);
    expect(getFreeShippingProgress(Number.NaN).remaining).toBe(399);
  });
});
