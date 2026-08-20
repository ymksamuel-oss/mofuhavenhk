import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = resolve(import.meta.dirname, "..");

function source(relativePath: string) {
  return readFileSync(resolve(projectRoot, relativePath), "utf8");
}

describe("Stripe Checkout payment method configuration", () => {
  it("keeps card and Alipay available by default", () => {
    for (const file of ["api/index.js", "server/routers.ts"]) {
      const checkoutSource = source(file);
      expect(checkoutSource).toContain('"card", "alipay"');
    }
  });

  it("adds Stripe's required Web client setting whenever WeChat Pay is enabled", () => {
    for (const file of ["api/index.js", "server/routers.ts"]) {
      const checkoutSource = source(file);
      expect(checkoutSource).toContain('STRIPE_ENABLE_WECHAT_PAY');
      expect(checkoutSource).toContain('wechat_pay: { client: "web" }');
      expect(checkoutSource).toContain("payment_method_options");
    }
  });

  it("keeps Checkout available when Stripe reports that WeChat Pay is not activated", () => {
    for (const file of ["api/index.js", "server/routers.ts"]) {
      const checkoutSource = source(file);
      expect(checkoutSource).toContain("isWeChatPayUnavailable");
      expect(checkoutSource).toContain('payment_method_types: ["card", "alipay"]');
      expect(checkoutSource).toContain("retrying");
    }
  });
});
