import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const route = readFileSync("src/app/api/admin/route.ts", "utf8");
const cron = readFileSync("src/app/api/cron/fx-pricing/route.ts", "utf8");
const vercel = readFileSync("vercel.json", "utf8");

describe("independent product cost and retail pricing", () => {
  it("does not apply RMB FX pricing in the admin save handler", () => {
    expect(route).not.toContain("fxPricingSync");
    expect(route).not.toContain("hkdPriceFromCnyCost");
    expect(route).not.toContain("rmb_hkd_rate");
    expect(route).not.toContain("RETAIL_MULTIPLIER");
    expect(route).toContain("supabase.from(table).insert(payload)");
    expect(route).toContain("supabase.from(table).update(payload)");
  });

  it("keeps the legacy cron endpoint inert and removes the schedule", () => {
    expect(cron).toContain("fx_pricing_disabled");
    expect(cron).toContain("status: 410");
    expect(vercel).not.toContain("/api/cron/fx-pricing");
    expect(vercel).not.toContain("crons");
  });
});
