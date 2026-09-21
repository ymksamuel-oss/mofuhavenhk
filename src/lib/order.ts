import { getProductsByCategory, type Product, type ProductVariant } from "@/lib/products";
import { getJapaneseProductName, getLocalizedProductName } from "@/lib/translateProductName";

export type OrderItem = {
  /** Stable cart-row key. Different pack sizes of one flavor remain separate lines. */
  lineKey: string;
  id: string;
  /** Active Stripe Price ID; present for live Stripe catalog products. */
  stripePriceId?: string;
  /** Stripe Product ID used by receipt verification; separate from the storefront row id. */
  stripeProductId?: string;
  /** Selected quantity-tier label, if the product has Stripe-backed variants. */
  variantLabel?: { zh: string; en: string; ja?: string };
  /** Stable shop-facing item code, distinct from Stripe Product and Price IDs. */
  mofuSku?: string;
  name: { zh: string; en: string; ja?: string };
  /** Locale-aware product copy used by hosted checkout and receipts. */
  description?: { zh: string; en: string };
  /** Real product photograph from the active catalog (local path or URL). */
  image: string;
  qty: number;
  unit: number;
  originalUnit?: number;
  discountPercent?: 0 | 5 | 10 | 15;
};

export type RequestedOrderLine = {
  id: string;
  qty: number;
  /** Client selection is re-validated against the server-side catalog. */
  priceId?: string;
};

export const SHIPPING = 35;
export const FREE_SHIPPING_THRESHOLD = 399;

export function toMinorUnits(value: number): number {
  return Number.isFinite(value) ? Math.round(value * 100) : 0;
}

export function fromMinorUnits(value: number): number {
  return Math.max(0, Math.round(value)) / 100;
}

export function cartLineKey(productId: string, priceId?: string): string {
  return `${productId}::${priceId ?? "default"}`;
}

export function calcSubtotal(items: OrderItem[]): number {
  return fromMinorUnits(items.reduce((sum, item) => sum + toMinorUnits(orderItemTotal(item)), 0));
}

export function calcOriginalSubtotal(items: OrderItem[]): number {
  return fromMinorUnits(items.reduce((sum, item) => sum + toMinorUnits(orderItemPricing(item).itemOriginalTotal), 0));
}

export function calcBulkDiscount(items: OrderItem[]): number {
  return fromMinorUnits(Math.max(0, toMinorUnits(calcOriginalSubtotal(items)) - toMinorUnits(calcSubtotal(items))));
}

export type OrderItemPricing = {
  basePrice: number;
  effectiveUnitPrice: number;
  discountRate: number;
  discountPercent: 0 | 5 | 10 | 15;
  itemTotal: number;
  itemOriginalTotal: number;
  itemDiscountAmount: number;
  hasDiscount: boolean;
};

/** Derives every price from the immutable base price and the current qty. */
export function orderItemPricing(item: OrderItem): OrderItemPricing {
  const basePrice = fromMinorUnits(toMinorUnits(item.originalUnit ?? item.unit));
  const discountPercent: 0 | 5 | 10 | 15 = item.qty >= 12 ? 15 : item.qty >= 8 ? 10 : item.qty >= 4 ? 5 : 0;
  const discountRate = discountPercent / 100;
  const baseCents = toMinorUnits(basePrice);
  const effectiveUnitCents = Math.round(baseCents * (100 - discountPercent) / 100);
  const itemOriginalCents = baseCents * item.qty;
  const itemTotalCents = effectiveUnitCents * item.qty;
  const effectiveUnitPrice = fromMinorUnits(effectiveUnitCents);
  const itemOriginalTotal = fromMinorUnits(itemOriginalCents);
  const itemTotal = fromMinorUnits(itemTotalCents);
  return {
    basePrice,
    effectiveUnitPrice,
    discountRate,
    discountPercent,
    itemTotal,
    itemOriginalTotal,
    itemDiscountAmount: fromMinorUnits(itemOriginalCents - itemTotalCents),
    hasDiscount: discountPercent > 0,
  };
}

export function orderItemTotal(item: OrderItem): number {
  return orderItemPricing(item).itemTotal;
}

export const PET_BUNDLE_QUANTITIES = [1, 2, 3, 4, 6, 8, 12] as const;

/**
 * Quantity offers apply to pet food and treats, including legacy rows whose
 * category relation is missing but whose source tags/name clearly identify
 * food. Supplies and lifestyle products are deliberately excluded.
 */
export function isPetBundleProduct(product: Product): boolean {
  const raw = product as unknown as Record<string, unknown>;
  const rawFeatureTags = Array.isArray(raw.feature_tags)
    ? raw.feature_tags.filter((tag): tag is string => typeof tag === "string")
    : [];
  const rawPetSpecies = typeof raw.pet_species === "string" ? raw.pet_species : "";
  const text = [
    product.categorySlug,
    product.subcategory,
    product.sourceCategory,
    product.productType,
    typeof product.name === "string" ? product.name : product.name.zh,
    typeof product.name === "string" ? product.name : product.name.en,
    ...(product.tags ?? []),
    ...rawFeatureTags,
    rawPetSpecies,
    product.metadata?.category,
    product.metadata?.subcategory,
    product.metadata?.pet_species,
  ].filter(Boolean).join(" ").toLowerCase();

  if (product.categorySlug === "cats" || product.categorySlug === "dogs") return true;
  if (/(supplies|lifestyle|\u7528\u54c1|collar|harness|leash|\u727d\u5f15|\u9805\u5708|\u80f8\u80cc|\u73a9\u5177|\u7761\u7aa9|\u6e05\u6f54|\u8b77\u7406)/i.test(text)) return false;
  return /(food|treat|snack|\u96f6\u98df|\u5c0f\u98df|\u98df\u54c1|\u98df\u7269|\u7f50\u982d|\u4e7e\u7ce7|\u6fd5\u7ce7|\u8089\u4e7e|\u8089\u689d|\u8089\u7247|\u8089\u68d2|\u8089\u9b06|\u9b5a\u4ecb|seafood|\u9bae\u8089|\u539f\u8089)/i.test(text);
}

export function petBundleDiscountPercent(product: Product, qty: number): 0 | 5 | 10 | 15 {
  if (!isPetBundleProduct(product)) return 0;
  if (qty >= 12) return 15;
  if (qty >= 8) return 10;
  if (qty >= 4) return 5;
  return 0;
}

export function discountedUnitPrice(product: Product, unit: number, qty: number): number {
  const percent = petBundleDiscountPercent(product, qty);
  return fromMinorUnits(Math.round(toMinorUnits(unit) * (100 - percent) / 100));
}

export function getShippingCost(subtotal: number, hasItems = subtotal > 0): number {
  if (!hasItems) return 0;
  return toMinorUnits(subtotal) >= toMinorUnits(FREE_SHIPPING_THRESHOLD) ? 0 : SHIPPING;
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
  const originalUnit = variant?.price ?? product.price;
  return {
    lineKey: cartLineKey(product.id, stripePriceId),
    id: product.id,
    ...(stripePriceId ? { stripePriceId } : {}),
    ...(product.stripeProductId || /^prod_[A-Za-z0-9]+$/.test(product.id)
      ? { stripeProductId: product.stripeProductId || product.id }
      : {}),
    ...(variant ? { variantLabel: variant.label } : {}),
    ...(product.metadata?.mofu_sku?.trim() ? { mofuSku: product.metadata.mofu_sku.trim() } : {}),
    name: {
      zh: getLocalizedProductName(product, "zh"),
      en: getLocalizedProductName(product, "en"),
      ...(getJapaneseProductName(product) ? { ja: getJapaneseProductName(product) } : {}),
    },
    ...(product.description ? { description: product.description } : {}),
    image: product.images?.[0] ?? "catalog-placeholder",
    qty,
    // Never persist a discounted unit price. The tier is derived from qty.
    unit: originalUnit,
    originalUnit,
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
export const MAX_QTY = 24;

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
