import type { Product } from "./products";

type ProductIdentifierFields = Pick<Product, "id" | "jan" | "mofuSku" | "metadata">;

/** Return true only for a numeric GTIN-13 with a valid GS1 check digit. */
export function isValidGtin13(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const code = value.trim();
  if (!/^\d{13}$/.test(code)) return false;

  const weightedSum = Array.from(code.slice(0, 12)).reduce(
    (sum, digit, index) => sum + Number(digit) * (index % 2 === 0 ? 1 : 3),
    0,
  );
  return (10 - (weightedSum % 10)) % 10 === Number(code[12]);
}

/**
 * Prefer an explicit JAN/GTIN identifier, then use the canonical storefront SKU.
 * Invalid values are skipped instead of being advertised as official GTINs.
 */
export function getProductJanCode(product: ProductIdentifierFields): string | undefined {
  const candidates = [
    product.jan,
    product.metadata?.jan,
    product.metadata?.gtin13,
    product.mofuSku,
    product.metadata?.mofu_sku,
    product.id,
  ];

  for (const candidate of candidates) {
    const normalized = candidate?.trim();
    if (isValidGtin13(normalized)) return normalized;
  }
  return undefined;
}
