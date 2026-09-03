import { describe, expect, it } from "vitest";
import { parsePayMeCheckoutSettings } from "../src/lib/payme-checkout-settings";

describe("PayMe Checkout settings", () => {
  it("accepts the official PayMe QR payment link and local PayCode asset", () => {
    expect(parsePayMeCheckoutSettings({
      payme_pay_link: "https://qr.payme.hsbc.com.hk/1/JVNmr4C4EpPd6yDBDBgrsj",
      payme_paycode_image: "/images/payments/mofu-haven-payme-paycode.jpg",
      payme_merchant_name: "Mofu Havenhk",
    })).toEqual({
      payLink: "https://qr.payme.hsbc.com.hk/1/JVNmr4C4EpPd6yDBDBgrsj",
      payCodeImageUrl: "/images/payments/mofu-haven-payme-paycode.jpg",
      merchantName: "Mofu Havenhk",
    });
  });

  it("rejects an untrusted payment link instead of exposing it in Checkout", () => {
    expect(parsePayMeCheckoutSettings({
      payme_pay_link: "https://example.com/not-payme",
      payme_paycode_image: "/images/payments/mofu-haven-payme-paycode.jpg",
    }).payLink).toBeNull();
  });
});
