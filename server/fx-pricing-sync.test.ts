import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
  cnyHkdRateFromEcbPayload,
  retailCentsFromCnyCost,
} from "@/lib/fxPricingSync";

const source = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("daily CNY/HKD FX pricing policy", () => {
  it("derives CNY/HKD from matching ECB EUR cross rates", () => {
    const rate = cnyHkdRateFromEcbPayload([
      { date: "2026-08-26", base: "EUR", quote: "CNY", rate: 7.8422 },
      { date: "2026-08-26", base: "EUR", quote: "HKD", rate: 9.1463 },
    ]);

    expect(rate).toMatchObject({
      rateDate: "2026-08-26",
      rateHkdPerCny: "1.166292622",
      source: "frankfurter_ecb_eur_cross",
    });
  });

  it("rejects mismatched dates and unsafe FX readings", () => {
    expect(() => cnyHkdRateFromEcbPayload([
      { date: "2026-08-25", base: "EUR", quote: "CNY", rate: 7.8422 },
      { date: "2026-08-26", base: "EUR", quote: "HKD", rate: 9.1463 },
    ])).toThrow(/matching daily ECB/);

    expect(() => cnyHkdRateFromEcbPayload([
      { date: "2026-08-26", base: "EUR", quote: "CNY", rate: 1 },
      { date: "2026-08-26", base: "EUR", quote: "HKD", rate: 2 },
    ])).toThrow(/safety band/);
  });

  it("rounds each owner formula calculation upward to a .90 HKD price", () => {
    const rate = 1.1662926219;
    expect(retailCentsFromCnyCost("168", rate)).toBe(34490);
    expect(retailCentsFromCnyCost("20", rate)).toBe(4190);
    expect(() => retailCentsFromCnyCost("0", rate)).toThrow(/positive number/);
  });

  it("keeps automatic updates constrained to active, declared storefront prices with price-level CNY cost", () => {
    const service = source("src/lib/fxPricingSync.ts");

    expect(service).toContain('"cost_cny"');
    expect(service).toContain('"cny_cost"');
    expect(service).toContain('"source_cost_cny"');
    expect(service).toContain('"cost_cny_per_product"');
    expect(service).toContain('"supplier_cost_cny"');
    expect(service).toContain('"unit_cost_cny"');
    expect(service).toContain("storefrontPriceIds(product, productPrices)");
    expect(service).toContain("if (!selectedIds.has(price.id))");
    expect(service).toContain("if (!pricingInput)");
    expect(service).toContain('"pricing_cost_cny_baseline"');
    expect(service).toContain('kind: "implied_baseline"');
    expect(service).toContain("idempotencyKey: `mofu-fx-create-");
    expect(service).toContain("idempotencyKey: `mofu-fx-deactivate-");
  });

  it("requires CRON_SECRET authorization and never exposes it in the route response", () => {
    const route = source("src/app/api/cron/fx-pricing/route.ts");

    expect(route).toContain('readServerEnv("CRON_SECRET")');
    expect(route).toContain('authorization === `Bearer ${secret}`');
    expect(route).toContain('code: "unauthorized"');
    expect(route).not.toContain("secret: secret");
    expect(route).toContain("syncCatalogToLatestFxRate({ apply: true })");
  });
});
