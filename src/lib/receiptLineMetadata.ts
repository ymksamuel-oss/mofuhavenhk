import type Stripe from "stripe";
import type { OrderItem } from "@/lib/order";

const PREFIX = "receiptLineItems";
const FALLBACK_PREFIX = "receiptFallback";
export const RECEIPT_LINE_METADATA_VERSION = "v1";
export const RECEIPT_LINE_FALLBACK_VERSION = "fallback-v1";

type ReceiptLineReference = {
  productId: string;
  priceId: string;
  quantity: number;
};

export type ReceiptLineFallback = {
  name: string;
  variantLabel?: string;
  mofuSku?: string;
  quantity: number;
  unitAmountHkd: number;
};

function isStripeProductId(value: string): boolean {
  return /^prod_[A-Za-z0-9]+$/.test(value);
}

function isStripePriceId(value: string): boolean {
  return /^price_[A-Za-z0-9]+$/.test(value);
}

function encode(line: ReceiptLineReference): string {
  return `${line.productId}|${line.priceId}|${line.quantity}`;
}

/**
 * Metadata values are limited to 500 characters. Split deterministic compact
 * line references across multiple keys; no customer PII is included.
 */
export function receiptLineMetadata(items: readonly OrderItem[]): Record<string, string> {
  const hasInvalidStripeReference = items.some((item) => {
    const stripeProductId = item.stripeProductId || item.id;
    return !item.stripePriceId || !isStripePriceId(item.stripePriceId) || !isStripeProductId(stripeProductId);
  });

  // Managed Supabase rows can temporarily exist before they are linked to a
  // Stripe Product/Price. Do not block a valid payment in that state; store a
  // compact receipt line fallback and let the receipt service use it directly.
  if (hasInvalidStripeReference) {
    return {
      receiptLineMetadataVersion: RECEIPT_LINE_FALLBACK_VERSION,
      receiptLineCount: String(items.length),
      ...Object.fromEntries(
        items.map((item, index) => {
          const fallback: ReceiptLineFallback = {
            name: item.name.en || item.name.zh || item.id,
            ...(item.variantLabel?.en || item.variantLabel?.zh
              ? { variantLabel: item.variantLabel.en || item.variantLabel.zh }
              : {}),
            ...(item.mofuSku ? { mofuSku: item.mofuSku } : {}),
            quantity: item.qty,
            unitAmountHkd: item.unit,
          };
          return [`${FALLBACK_PREFIX}${index + 1}`, JSON.stringify(fallback)];
        }),
      ),
    };
  }

  const encoded = items.map((item) => {
    const stripeProductId = item.stripeProductId || item.id;
    return encode({
      productId: stripeProductId,
      priceId: item.stripePriceId!,
      quantity: item.qty,
    });
  });
  const chunks: string[] = [];
  let chunk = "";
  for (const line of encoded) {
    const candidate = chunk ? `${chunk};${line}` : line;
    if (candidate.length > 480) {
      if (!chunk) throw new Error("Receipt line reference exceeds Stripe metadata capacity");
      chunks.push(chunk);
      chunk = line;
    } else {
      chunk = candidate;
    }
  }
  if (chunk) chunks.push(chunk);
  if (chunks.length > 20) throw new Error("Receipt line metadata uses too many keys");
  return {
    receiptLineMetadataVersion: RECEIPT_LINE_METADATA_VERSION,
    receiptLineCount: String(encoded.length),
    ...Object.fromEntries(chunks.map((value, index) => [`${PREFIX}${index + 1}`, value])),
  };
}

export function parseReceiptLineMetadata(metadata: Stripe.Metadata): ReceiptLineReference[] {
  if (metadata.receiptLineMetadataVersion !== RECEIPT_LINE_METADATA_VERSION) return [];
  const chunkKeys = Object.keys(metadata)
    .filter((key) => new RegExp(`^${PREFIX}\\d+$`).test(key))
    .sort((a, b) => Number(a.slice(PREFIX.length)) - Number(b.slice(PREFIX.length)));
  const records = chunkKeys.flatMap((key) => (metadata[key] || "").split(";"));
  const lines: ReceiptLineReference[] = [];
  for (const record of records) {
    const [productId, priceId, quantityRaw, ...remainder] = record.split("|");
    const quantity = Number(quantityRaw);
    if (
      remainder.length ||
      !/^prod_[A-Za-z0-9]+$/.test(productId || "") ||
      !/^price_[A-Za-z0-9]+$/.test(priceId || "") ||
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      return [];
    }
    lines.push({ productId: productId!, priceId: priceId!, quantity });
  }
  const expectedCount = Number(metadata.receiptLineCount);
  if (!Number.isInteger(expectedCount) || expectedCount <= 0 || lines.length !== expectedCount) return [];
  return lines;
}

export function parseReceiptLineFallback(metadata: Stripe.Metadata): ReceiptLineFallback[] {
  if (metadata.receiptLineMetadataVersion !== RECEIPT_LINE_FALLBACK_VERSION) return [];
  const keys = Object.keys(metadata)
    .filter((key) => new RegExp(`^${FALLBACK_PREFIX}\\d+$`).test(key))
    .sort((a, b) => Number(a.slice(FALLBACK_PREFIX.length)) - Number(b.slice(FALLBACK_PREFIX.length)));
  const lines: ReceiptLineFallback[] = [];
  for (const key of keys) {
    try {
      const parsed = JSON.parse(metadata[key] || "") as Partial<ReceiptLineFallback>;
      const quantity = parsed.quantity;
      if (
        typeof parsed.name !== "string" ||
        typeof quantity !== "number" ||
        !Number.isInteger(quantity) ||
        quantity <= 0 ||
        typeof parsed.unitAmountHkd !== "number" ||
        !Number.isFinite(parsed.unitAmountHkd) ||
        parsed.unitAmountHkd < 0
      ) return [];
      lines.push({
        name: parsed.name,
        ...(parsed.variantLabel ? { variantLabel: parsed.variantLabel } : {}),
        ...(parsed.mofuSku ? { mofuSku: parsed.mofuSku } : {}),
        quantity,
        unitAmountHkd: parsed.unitAmountHkd,
      });
    } catch {
      return [];
    }
  }
  const expectedCount = Number(metadata.receiptLineCount);
  return Number.isInteger(expectedCount) && expectedCount > 0 && lines.length === expectedCount ? lines : [];
}

export type { ReceiptLineReference };
