import { describe, expect, it } from "vitest";

describe("Stripe Live configuration", () => {
  it("authenticates against the Live Balance API without exposing the key", async () => {
    const secretKey = process.env.STRIPE_LIVE_SECRET_KEY;
    expect(secretKey, "STRIPE_LIVE_SECRET_KEY is not configured").toMatch(/^sk_live_/);

    const response = await fetch("https://api.stripe.com/v1/balance", {
      headers: { Authorization: `Bearer ${secretKey}` },
    });
    expect(response.status).toBe(200);

    const balance = await response.json() as { livemode?: boolean };
    expect(balance.livemode).toBe(true);
  }, 20_000);
});
