import { createHash } from "node:crypto";

import type Stripe from "stripe";

import { getStripe } from "@/lib/stripe";

const FX_SOURCE_URL = "https://api.frankfurter.dev/v2/rates?base=EUR&quotes=CNY,HKD&providers=ECB";
const CNY_TO_HKD_MIN = 0.9;
const CNY_TO_HKD_MAX = 1.5;
const RETAIL_MULTIPLIER = 1.76;
const PRICE_TAIL_HKD = 0.9;
const ROUNDING_EPSILON = 1e-10;
// Eight-decimal inferred baselines are intentionally floored so they preserve
// their source retail price at the calibration rate; their largest storage gap
// is below this amount after applying the 1.76 multiplier and CNY/HKD rate.
const IMPLIED_BASELINE_EPSILON = 3e-8;
const COST_METADATA_KEYS = [
  "cost_cny",
  "cny_cost",
  "source_cost_cny",
  "cost_cny_per_product",
  "supplier_cost_cny",
  "unit_cost_cny",
] as const;
const IMPLIED_COST_BASELINE_KEY = "pricing_cost_cny_baseline";

type EcbRateRow = {
  date?: unknown;
  base?: unknown;
  quote?: unknown;
  rate?: unknown;
};

type EcbRatePayload = EcbRateRow[];

type PriceRecord = {
  id: string;
  unitAmount: number;
  metadata: Record<string, string>;
  taxBehavior: Stripe.Price.TaxBehavior | null;
  nickname: string | null;
  productId: string;
};

export type CnyHkdDailyRate = {
  rateDate: string;
  /** Exact decimal string retained for safe logs and audit summaries. */
  rateHkdPerCny: string;
  /** Finite numeric representation used only for the owner-specified price calculation. */
  rateValue: number;
  source: "frankfurter_ecb_eur_cross";
};

type PricingInput = {
  value: string;
  kind: "true_cost" | "implied_baseline";
};

export type FxPricingOperation = {
  productId: string;
  sourcePriceId: string;
  replacementPriceId?: string;
  oldCents: number;
  newCents: number;
  defaultPriceSwitched: boolean;
  status: "would_replace" | "replaced" | "failed";
  errorCode?: string;
};

export type FxPricingSyncSummary = {
  mode: "applied" | "dry_run";
  source: string;
  rateDate: string;
  rateHkdPerCny: string;
  activeProductCount: number;
  eligiblePriceCount: number;
  missingCostPriceCount: number;
  unchangedPriceCount: number;
  replacedPriceCount: number;
  failedPriceCount: number;
  skippedPriceCount: number;
  operations: FxPricingOperation[];
  completedAt: string;
};

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function positiveDecimal(value: unknown, maxFractionDigits: number): number | null {
  const raw = typeof value === "number" && Number.isFinite(value) ? value.toString() : text(value);
  if (!/^\d+(?:\.\d+)?$/.test(raw)) return null;
  const fractionalDigits = raw.split(".")[1]?.length ?? 0;
  if (fractionalDigits > maxFractionDigits) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function rateDisplay(value: number): string {
  return value.toFixed(10).replace(/0+$/, "").replace(/\.$/, "");
}

function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

/** Parses independently quoted EUR/CNY and EUR/HKD ECB rates into CNY/HKD exactly. */
export function cnyHkdRateFromEcbPayload(payload: unknown): CnyHkdDailyRate {
  if (!Array.isArray(payload)) throw new Error("FX provider returned an invalid rate list");
  let cny: { date: string; rate: number } | undefined;
  let hkd: { date: string; rate: number } | undefined;

  for (const row of payload as EcbRatePayload) {
    if (text(row?.base) !== "EUR" || !isIsoDate(text(row?.date))) continue;
    const numericRate = positiveDecimal(row?.rate, 10);
    if (numericRate === null) continue;
    if (text(row?.quote) === "CNY") cny = { date: text(row.date), rate: numericRate };
    if (text(row?.quote) === "HKD") hkd = { date: text(row.date), rate: numericRate };
  }

  if (!cny || !hkd || cny.date !== hkd.date) {
    throw new Error("FX provider did not return matching daily ECB EUR/CNY and EUR/HKD rates");
  }

  const rateValue = hkd.rate / cny.rate;
  if (!Number.isFinite(rateValue) || rateValue < CNY_TO_HKD_MIN || rateValue > CNY_TO_HKD_MAX) {
    throw new Error("Computed CNY/HKD rate is outside the configured safety band");
  }

  return {
    rateDate: cny.date,
    rateValue,
    rateHkdPerCny: rateDisplay(rateValue),
    source: "frankfurter_ecb_eur_cross",
  };
}

export async function fetchLatestCnyHkdDailyRate(): Promise<CnyHkdDailyRate> {
  const response = await fetch(FX_SOURCE_URL, { cache: "no-store" });
  if (!response.ok) throw new Error(`FX provider request failed with HTTP ${response.status}`);
  const payload = await response.json().catch(() => null);
  return cnyHkdRateFromEcbPayload(payload);
}

/** Calculates the smallest positive HKD cents price ending in .90 that is not below the raw formula price. */
export function retailCentsFromCnyCost(
  costCny: string,
  rateValue: number,
  roundingEpsilon = ROUNDING_EPSILON,
): number {
  const cost = positiveDecimal(costCny, 8);
  if (cost === null) throw new Error("CNY cost must be a positive number with at most eight decimal places");
  if (!Number.isFinite(rateValue) || rateValue < CNY_TO_HKD_MIN || rateValue > CNY_TO_HKD_MAX) {
    throw new Error("CNY/HKD rate is outside the configured safety band");
  }
  const rawHkd = cost * rateValue * RETAIL_MULTIPLIER;
  const upwardDollar = Math.ceil(rawHkd - PRICE_TAIL_HKD - roundingEpsilon);
  const cents = Math.round((upwardDollar + PRICE_TAIL_HKD) * 100);
  if (!Number.isSafeInteger(cents) || cents <= 0) throw new Error("Computed retail cents are outside the supported range");
  return cents;
}

function trustedCostCny(
  priceMetadata: Record<string, string>,
  productMetadata: Record<string, string>,
  activePriceCount: number,
): PricingInput | null {
  for (const key of COST_METADATA_KEYS) {
    const value = text(priceMetadata[key]);
    if (positiveDecimal(value, 4) !== null) return { value, kind: "true_cost" };
  }
  // A product-level cost is safe only when the product has one active HKD Price.
  if (activePriceCount === 1) {
    for (const key of COST_METADATA_KEYS) {
      const value = text(productMetadata[key]);
      if (positiveDecimal(value, 4) !== null) return { value, kind: "true_cost" };
    }
  }
  // This owner-approved value is a retail-price-derived pricing baseline, not a
  // purchase cost. It is accepted only at the Price level so variants never share
  // an inferred input by accident; any future true cost above remains preferred.
  const impliedBaseline = text(priceMetadata[IMPLIED_COST_BASELINE_KEY]);
  return positiveDecimal(impliedBaseline, 8) !== null
    ? { value: impliedBaseline, kind: "implied_baseline" }
    : null;
}

function isDeclaredVariant(price: PriceRecord): boolean {
  if (text(price.metadata.variant_key) || text(price.metadata.variant_label_zh)) return true;
  const count = Number(price.metadata.pack_count);
  return Number.isInteger(count) && count > 0;
}

function storefrontPriceIds(product: Stripe.Product, prices: readonly PriceRecord[]): Set<string> {
  const mode = text(product.metadata?.variant_mode);
  if (mode === "pack_size" || mode === "option" || mode === "choice") {
    return new Set(prices.filter(isDeclaredVariant).map((price) => price.id));
  }
  const defaultPriceId = typeof product.default_price === "string"
    ? product.default_price
    : product.default_price?.id;
  return defaultPriceId && prices.some((price) => price.id === defaultPriceId)
    ? new Set([defaultPriceId])
    : new Set();
}

async function listAllActiveProducts(stripe: Stripe): Promise<Stripe.Product[]> {
  const products: Stripe.Product[] = [];
  let startingAfter: string | undefined;
  do {
    const page = await stripe.products.list({ active: true, limit: 100, ...(startingAfter ? { starting_after: startingAfter } : {}) });
    products.push(...page.data);
    startingAfter = page.has_more ? page.data.at(-1)?.id : undefined;
    if (page.has_more && !startingAfter) throw new Error("Stripe product pagination did not return a cursor");
  } while (startingAfter);
  return products;
}

async function listAllActiveHkdPrices(stripe: Stripe): Promise<PriceRecord[]> {
  const prices: PriceRecord[] = [];
  let startingAfter: string | undefined;
  do {
    const page = await stripe.prices.list({ active: true, currency: "hkd", limit: 100, ...(startingAfter ? { starting_after: startingAfter } : {}) });
    for (const price of page.data) {
      if (price.type !== "one_time" || !Number.isInteger(price.unit_amount) || !price.unit_amount || price.unit_amount <= 0) continue;
      const productId = typeof price.product === "string" ? price.product : price.product.id;
      prices.push({
        id: price.id,
        unitAmount: price.unit_amount,
        metadata: price.metadata ?? {},
        taxBehavior: price.tax_behavior,
        nickname: price.nickname,
        productId,
      });
    }
    startingAfter = page.has_more ? page.data.at(-1)?.id : undefined;
    if (page.has_more && !startingAfter) throw new Error("Stripe Price pagination did not return a cursor");
  } while (startingAfter);
  return prices;
}

function safeIdempotencySuffix(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 16);
}

function safeErrorCode(error: unknown): string {
  if (error instanceof Error) return error.message.slice(0, 180);
  return "unknown_error";
}

async function replacePrice(
  stripe: Stripe,
  product: Stripe.Product,
  source: PriceRecord,
  targetCents: number,
  rate: CnyHkdDailyRate,
): Promise<{ replacementPriceId: string; defaultPriceSwitched: boolean }> {
  const suffix = safeIdempotencySuffix(`${source.id}:${rate.rateDate}:${targetCents}`);
  const replacement = await stripe.prices.create({
    unit_amount: targetCents,
    currency: "hkd",
    product: product.id,
    active: true,
    metadata: source.metadata,
    ...(source.nickname ? { nickname: source.nickname } : {}),
    ...(source.taxBehavior === "inclusive" || source.taxBehavior === "exclusive" ? { tax_behavior: source.taxBehavior } : {}),
  }, { idempotencyKey: `mofu-fx-create-${source.id}-${suffix}` });

  const sourceWasDefault = (typeof product.default_price === "string" ? product.default_price : product.default_price?.id) === source.id;
  try {
    if (sourceWasDefault) {
      await stripe.products.update(product.id, { default_price: replacement.id }, {
        idempotencyKey: `mofu-fx-default-${product.id}-${suffix}`,
      });
    }
    await stripe.prices.update(source.id, { active: false }, {
      idempotencyKey: `mofu-fx-deactivate-${source.id}-${suffix}`,
    });
  } catch (error) {
    // Stripe can finish a request even if the caller loses the response. Inspect the
    // source Price before compensating so a completed deactivation never leaves both
    // the source and replacement inactive.
    const sourceAfterError = await stripe.prices.retrieve(source.id).catch(() => null);
    if (sourceAfterError?.active === false) {
      const latestProduct = await stripe.products.retrieve(product.id).catch(() => null);
      if (sourceWasDefault && latestProduct && (typeof latestProduct.default_price === "string" ? latestProduct.default_price : latestProduct.default_price?.id) !== replacement.id) {
        await stripe.products.update(product.id, { default_price: replacement.id }, {
          idempotencyKey: `mofu-fx-repair-default-${product.id}-${suffix}`,
        });
      }
      return { replacementPriceId: replacement.id, defaultPriceSwitched: sourceWasDefault };
    }

    // The source remains live, so it is safe to restore its default relationship and
    // retire the replacement; this avoids a duplicate active storefront Price.
    if (sourceWasDefault) {
      await stripe.products.update(product.id, { default_price: source.id }, {
        idempotencyKey: `mofu-fx-restore-default-${product.id}-${suffix}`,
      }).catch(() => undefined);
    }
    await stripe.prices.update(replacement.id, { active: false }, {
      idempotencyKey: `mofu-fx-compensate-${replacement.id}-${suffix}`,
    }).catch(() => undefined);
    throw error;
  }
  return { replacementPriceId: replacement.id, defaultPriceSwitched: sourceWasDefault };
}

export async function syncCatalogToLatestFxRate(options: { apply: boolean }): Promise<FxPricingSyncSummary> {
  const [rate, stripe] = await Promise.all([fetchLatestCnyHkdDailyRate(), Promise.resolve(getStripe())]);
  const [products, prices] = await Promise.all([listAllActiveProducts(stripe), listAllActiveHkdPrices(stripe)]);
  const pricesByProduct = new Map<string, PriceRecord[]>();
  for (const price of prices) {
    const records = pricesByProduct.get(price.productId) ?? [];
    records.push(price);
    pricesByProduct.set(price.productId, records);
  }

  let eligiblePriceCount = 0;
  let missingCostPriceCount = 0;
  let unchangedPriceCount = 0;
  let replacedPriceCount = 0;
  let failedPriceCount = 0;
  let skippedPriceCount = 0;
  const operations: FxPricingOperation[] = [];

  for (const product of products) {
    const productPrices = pricesByProduct.get(product.id) ?? [];
    const selectedIds = storefrontPriceIds(product, productPrices);
    for (const price of productPrices) {
      if (!selectedIds.has(price.id)) {
        skippedPriceCount += 1;
        continue;
      }
      const pricingInput = trustedCostCny(
        price.metadata,
        product.metadata ?? {},
        productPrices.length,
      );
      if (!pricingInput) {
        missingCostPriceCount += 1;
        continue;
      }
      eligiblePriceCount += 1;
      const targetCents = retailCentsFromCnyCost(
        pricingInput.value,
        rate.rateValue,
        pricingInput.kind === "implied_baseline" ? IMPLIED_BASELINE_EPSILON : ROUNDING_EPSILON,
      );
      if (targetCents === price.unitAmount) {
        unchangedPriceCount += 1;
        continue;
      }
      if (!options.apply) {
        replacedPriceCount += 1;
        operations.push({
          productId: product.id,
          sourcePriceId: price.id,
          oldCents: price.unitAmount,
          newCents: targetCents,
          defaultPriceSwitched: (typeof product.default_price === "string" ? product.default_price : product.default_price?.id) === price.id,
          status: "would_replace",
        });
        continue;
      }
      try {
        const replacement = await replacePrice(stripe, product, price, targetCents, rate);
        replacedPriceCount += 1;
        operations.push({
          productId: product.id,
          sourcePriceId: price.id,
          replacementPriceId: replacement.replacementPriceId,
          oldCents: price.unitAmount,
          newCents: targetCents,
          defaultPriceSwitched: replacement.defaultPriceSwitched,
          status: "replaced",
        });
      } catch (error) {
        const errorCode = safeErrorCode(error);
        failedPriceCount += 1;
        operations.push({
          productId: product.id,
          sourcePriceId: price.id,
          oldCents: price.unitAmount,
          newCents: targetCents,
          defaultPriceSwitched: (typeof product.default_price === "string" ? product.default_price : product.default_price?.id) === price.id,
          status: "failed",
          errorCode,
        });
        console.error("FX pricing record failed", {
          priceId: price.id,
          productId: product.id,
          targetCents,
          rateDate: rate.rateDate,
          error: errorCode,
        });
      }
    }
  }

  return {
    mode: options.apply ? "applied" : "dry_run",
    source: rate.source,
    rateDate: rate.rateDate,
    rateHkdPerCny: rate.rateHkdPerCny,
    activeProductCount: products.length,
    eligiblePriceCount,
    missingCostPriceCount,
    unchangedPriceCount,
    replacedPriceCount,
    failedPriceCount,
    skippedPriceCount,
    operations,
    completedAt: new Date().toISOString(),
  };
}

export const FX_PRICING_SOURCE_URL = FX_SOURCE_URL;
