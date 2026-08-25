const COMPARE_AT_METADATA_KEYS = [
  "compare_at_price_hkd",
  "compare_at_price",
  "original_price_hkd",
  "original_price",
  "originalPrice",
  "compareAtPrice",
  "原價",
  "原價 (HKD)",
] as const;

function parseHkdAmount(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const normalized = value.trim().replace(/[^0-9.-]/g, "");
  if (!normalized) return undefined;
  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount <= 0 || amount >= 1_000_000) return undefined;
  return Math.round(amount * 100) / 100;
}

/**
 * Reads a non-binding comparison price from Stripe Product metadata.
 * The actual checkout amount always remains the active Stripe Price amount.
 */
export function compareAtPriceFromMetadata(
  metadata: Readonly<Record<string, string>> | undefined,
  currentPrice: number,
): number | undefined {
  if (!metadata || !Number.isFinite(currentPrice) || currentPrice <= 0) return undefined;

  for (const key of COMPARE_AT_METADATA_KEYS) {
    const compareAtPrice = parseHkdAmount(metadata[key]);
    if (compareAtPrice !== undefined && compareAtPrice > currentPrice) {
      return compareAtPrice;
    }
  }

  return undefined;
}

export const COMPARE_AT_PRICE_METADATA_KEY = "compare_at_price_hkd";
export const COMPARE_AT_PRICE_SCHEMA_KEY = "compare_at_price_schema";
export const COMPARE_AT_PRICE_SCHEMA_VERSION = "v1";
