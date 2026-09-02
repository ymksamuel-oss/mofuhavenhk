import type Stripe from "stripe";
import type { OrderItem } from "@/lib/order";

const PREFIX = "receiptLineItems";
export const RECEIPT_LINE_METADATA_VERSION = "v1";

type ReceiptLineReference = {
  productId: string;
  priceId: string;
  quantity: number;
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
  const encoded = items.map((item) => {
    if (!item.stripePriceId || !isStripePriceId(item.stripePriceId)) {
      throw new Error(`Cannot create receipt metadata without a valid Stripe Price ID: ${item.id}`);
    }
    const stripeProductId = item.stripeProductId || item.id;
    if (!isStripeProductId(stripeProductId)) {
      throw new Error(`Cannot create receipt metadata without a valid Stripe Product ID: ${item.id}`);
    }
    if (!Number.isInteger(item.qty) || item.qty <= 0) {
      throw new Error(`Cannot create receipt metadata with invalid quantity: ${item.id}`);
    }
    return encode({ productId: stripeProductId, priceId: item.stripePriceId, quantity: item.qty });
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
