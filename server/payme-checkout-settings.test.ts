import { describe, expect, it } from "vitest";
import { parsePayMeCheckoutSettings } from "../src/lib/payme-checkout-settings";

describe("PayMe Checkout settings", () => {
  it("accepts the official PayMe payment link without requiring supplementary payment media", () => {
    expect(parsePayMeCheckoutSettings({
      payme_pay_link: "https://qr.payme.hsbc.com.hk/1/JVNmr4C4EpPd6yDBDBgrsj",
      payme_merchant_name: "Mofu Havenhk",
    })).toEqual({
      payLink: "https://qr.payme.hsbc.com.hk/1/JVNmr4C4EpPd6yDBDBgrsj",
      merchantName: "Mofu Havenhk",
    });
  });

  it("rejects an untrusted payment link instead of exposing it in Checkout", () => {
    expect(parsePayMeCheckoutSettings({
      payme_pay_link: "https://example.com/not-payme",
    }).payLink).toBeNull();
  });
});
