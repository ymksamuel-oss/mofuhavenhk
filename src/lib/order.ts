import { getProductsByCategory, type Product, type ProductVariant } from "@/lib/products";

export type OrderItem = {
  /** Stable cart-row key. Different pack sizes of one flavor remain separate lines. */
  lineKey: string;
  id: string;
  /** Active Stripe Price ID; present for live Stripe catalog products. */
  stripePriceId?: string;
  /** Selected quantity-tier label, if the product has Stripe-backed variants. */
  variantLabel?: { zh: string; en: string };
  /** Stable shop-facing item code, distinct from Stripe Product and Price IDs. */
  mofuSku?: string;
  name: { zh: string; en: string };
  /** Real product photograph from the active catalog (local path or URL). */
  image: string;
  qty: number;
  unit: number;
};

export type RequestedOrderLine = {
  id: string;
  qty: number;
  /** Client selection is re-validated against the server-side catalog. */
  priceId?: string;
};

export const SHIPPING = 25;
export const FREE_SHIPPING_THRESHOLD = 450;

export function cartLineKey(productId: string, priceId?: string): string {
  return `${productId}::${priceId ?? "default"}`;
}

export function calcSubtotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.qty * item.unit, 0);
}

export function getShippingCost(subtotal: number, hasItems = subtotal > 0): number {
  if (!hasItems) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING;
}

function selectedVariant(product: Product, requestedPriceId?: string): ProductVariant | undefined {
  if (!product.variants?.length) return undefined;
  return (
    product.variants.find((variant) => variant.priceId === requestedPriceId) ??
    product.variants[0]
  );
}

function orderItemFromProduct(
  product: Product,
  qty: number,
  requestedPriceId?: string,
): OrderItem {
  const variant = selectedVariant(product, requestedPriceId);
  const stripePriceId = variant?.priceId ?? product.priceId;
  return {
    lineKey: cartLineKey(product.id, stripePriceId),
    id: product.id,
    ...(stripePriceId ? { stripePriceId } : {}),
    ...(variant ? { variantLabel: variant.label } : {}),
    ...(product.metadata?.mofu_sku?.trim() ? { mofuSku: product.metadata.mofu_sku.trim() } : {}),
    name: product.name,
    image: product.image,
    qty,
    unit: variant?.price ?? product.price,
  };
}

/**
 * Builds the order summary line items shown at checkout, sourced from the
 * shared product catalog. Category shortcuts use a product's default tier.
 */
export function getOrderItems(
  categorySlug: string | null,
  products: readonly Product[] = [],
): OrderItem[] {
  const matched = getProductsByCategory(categorySlug, products).filter(
    (product) => product.inStock !== false,
  );
  const source =
    matched.length > 0
      ? matched
      : products.filter((product) => product.inStock !== false);
  return source.slice(0, 3).map((product) => orderItemFromProduct(product, 1));
}

export const MIN_QTY = 1;
export const MAX_QTY = 20;

/**
 * Rebuilds order lines from client selections. A requested Price ID is accepted
 * only when it belongs to the matching product's server-fetched Stripe variants.
 * Amounts are always read from the catalog, never from client input.
 */
export function buildOrderItemsFromLines(
  lines: RequestedOrderLine[],
  products: readonly Product[] = [],
): OrderItem[] {
  const byId = new Map(products.map((product) => [product.id, product]));
  const selections = new Map<string, { product: Product; qty: number; priceId?: string }>();

  for (const line of lines) {
    if (!line || typeof line.id !== "string") continue;
    const product = byId.get(line.id);
    if (!product || product.inStock === false) continue;
    const numericQty = Math.floor(Number(line.qty));
    if (!Number.isFinite(numericQty) || numericQty < MIN_QTY) continue;

    const validVariant = selectedVariant(product, line.priceId);
    const resolvedPriceId = validVariant?.priceId ?? product.priceId;
    const key = cartLineKey(product.id, resolvedPriceId);
    const current = selections.get(key);
    selections.set(key, {
      product,
      ...(resolvedPriceId ? { priceId: resolvedPriceId } : {}),
      qty: Math.min(MAX_QTY, (current?.qty ?? 0) + numericQty),
    });
  }

  return Array.from(selections.values()).map(({ product, qty, priceId }) =>
    orderItemFromProduct(product, qty, priceId),
  );
}

export function generateOrderNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `MH${y}${m}${d}-${rand}`;
}
