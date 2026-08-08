import {
  PRODUCTS,
  getProductsByCategory,
  type Product,
} from "@/lib/products";

export type OrderItem = {
  id: string;
  name: { zh: string; en: string };
  /** Real product photograph from the active catalog (local path or URL). */
  image: string;
  qty: number;
  unit: number;
};

export const SHIPPING = 25;

export function calcSubtotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.qty * item.unit, 0);
}

/**
 * Builds the order summary line items shown at checkout, sourced from the
 * shared product catalog (src/lib/products.ts). When a category is selected
 * from the homepage's category grid, the order reflects products from that
 * category; otherwise it falls back to a default selection.
 */
export function getOrderItems(
  categorySlug: string | null,
  products: readonly Product[] = PRODUCTS,
): OrderItem[] {
  const matched = getProductsByCategory(categorySlug, products).filter(
    (product) => product.inStock !== false,
  );
  const source =
    matched.length > 0
      ? matched
      : products.filter((product) => product.inStock !== false);
  return source.slice(0, 3).map((product) => ({
    id: product.id,
    name: product.name,
    image: product.image,
    qty: 1,
    unit: product.price,
  }));
}

export const MIN_QTY = 1;
export const MAX_QTY = 20;

/**
 * Rebuilds order lines from client qty selections, pricing from the catalog
 * so amounts cannot be forged on the client.
 */
export function buildOrderItemsFromLines(
  lines: Array<{ id: string; qty: number }>,
  products: readonly Product[] = PRODUCTS,
): OrderItem[] {
  const byId = new Map(products.map((product) => [product.id, product]));
  const qtyById = new Map<string, number>();

  for (const line of lines) {
    if (!line || typeof line.id !== "string") continue;
    const product = byId.get(line.id);
    if (!product || product.inStock === false) continue;
    const numericQty = Math.floor(Number(line.qty));
    if (!Number.isFinite(numericQty) || numericQty < MIN_QTY) continue;
    qtyById.set(
      product.id,
      Math.min(MAX_QTY, (qtyById.get(product.id) ?? 0) + numericQty),
    );
  }

  return Array.from(qtyById.entries()).map(([id, qty]) => {
    const product = byId.get(id)!;
    return {
      id: product.id,
      name: product.name,
      image: product.image,
      qty,
      unit: product.price,
    };
  });
}

export function generateOrderNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `MH${y}${m}${d}-${rand}`;
}
