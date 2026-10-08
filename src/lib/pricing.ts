export const DEFAULT_JPY_TO_HKD = 0.052;
export const DEFAULT_COST_MARKUP_MULTIPLIER = 2.2;
export const DEFAULT_RETAIL_MULTIPLIER = DEFAULT_COST_MARKUP_MULTIPLIER;
export const FINAL_PRICE_UPLIFT = 0.12;
export const FINAL_PRICE_TAIL_HKD = 0.9;

/** Calculate the integer-HKD suggested retail price from supplier JPY cost. */
export function calculateSuggestedRetailPrice(
  costJpy: unknown,
): number {
  const cost = Number(costJpy);
  if (!Number.isFinite(cost) || cost < 0) return 0;
  return Math.round(cost * DEFAULT_JPY_TO_HKD * DEFAULT_RETAIL_MULTIPLIER);
}

/** Apply the storefront's 12% uplift and .90 tail to the genuine MSRP. */
export function calculateFinalSalePrice(suggestedRetailPriceHkd: unknown): number {
  const msrp = Number(suggestedRetailPriceHkd);
  if (!Number.isFinite(msrp) || msrp < 0) return 0;
  return Math.floor(msrp * (1 + FINAL_PRICE_UPLIFT)) + FINAL_PRICE_TAIL_HKD;
}
