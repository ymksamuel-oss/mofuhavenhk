import { describe, expect, it } from "vitest";
import { toStripeAmountHkd } from "../src/lib/stripe";

describe("Stripe HKD amount conversion", () => {
  it("converts decimal HKD amounts to integer cents without a cent error", () => {
    expect(toStripeAmountHkd(44.9)).toBe(4490);
    expect(toStripeAmountHkd(55.9)).toBe(5590);
    expect(toStripeAmountHkd(300.9)).toBe(30090);
    expect(toStripeAmountHkd(34.9)).toBe(3490);
  });
});
