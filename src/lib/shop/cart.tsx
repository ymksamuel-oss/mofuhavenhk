"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useCatalog } from "@/lib/catalog-context";
import type { Product } from "@/lib/products";
import {
  buildOrderItemsFromLines,
  cartLineKey,
  MAX_QTY,
  type OrderItem,
} from "@/lib/order";

export const CART_STORAGE_KEY = "mofuhavenhk-cart";

export type CartLine = {
  key: string;
  id: string;
  qty: number;
  /** Selected Stripe Price ID for a quantity tier, when applicable. */
  priceId?: string;
};

type CartContextValue = {
  lines: CartLine[];
  /** Total packs in the basket (sum of selected-line qty). */
  itemCount: number;
  addItem: (productId: string, qty?: number, priceId?: string) => void;
  setQty: (lineKey: string, qty: number) => void;
  removeItem: (lineKey: string) => void;
  clear: () => void;
  /** Catalog-priced order lines for checkout. */
  toOrderItems: () => OrderItem[];
  ready: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

function resolvedPriceId(product: Product, requestedPriceId?: string): string | undefined {
  if (product.variants?.length) {
    return product.variants.find((variant) => variant.priceId === requestedPriceId)?.priceId ??
      product.variants[0]?.priceId;
  }
  return product.priceId;
}

export function sanitizeLines(
  raw: unknown,
  products: readonly Product[] = [],
): CartLine[] {
  if (!Array.isArray(raw)) return [];
  const purchasable = new Map(
    products
      .filter((product) => product.inStock !== false)
      .map((product) => [product.id, product]),
  );
  const byKey = new Map<string, CartLine>();

  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const id = (entry as { id?: unknown }).id;
    const qty = (entry as { qty?: unknown }).qty;
    const incomingPriceId = (entry as { priceId?: unknown }).priceId;
    if (typeof id !== "string") continue;
    const product = purchasable.get(id);
    if (!product) continue;
    const numericQty = Math.floor(Number(qty));
    if (!Number.isFinite(numericQty) || numericQty < 1) continue;
    const priceId = resolvedPriceId(
      product,
      typeof incomingPriceId === "string" ? incomingPriceId : undefined,
    );
    const key = cartLineKey(id, priceId);
    const existing = byKey.get(key);
    byKey.set(key, {
      key,
      id,
      qty: Math.min(MAX_QTY, (existing?.qty ?? 0) + numericQty),
      ...(priceId ? { priceId } : {}),
    });
  }
  return Array.from(byKey.values());
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { products } = useCatalog();
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CART_STORAGE_KEY);
      setLines(raw ? sanitizeLines(JSON.parse(raw), products) : []);
    } catch {
      setLines([]);
    }
    setReady(true);
  }, [products]);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // ignore quota / private mode
    }
  }, [lines, ready]);

  const addItem = useCallback((productId: string, qty = 1, requestedPriceId?: string) => {
    const product = products.find((candidate) => candidate.id === productId);
    if (!product || product.inStock === false) return;
    const numericQty = Math.floor(Number(qty));
    if (!Number.isFinite(numericQty) || numericQty < 1) return;
    const addQty = Math.min(MAX_QTY, numericQty);
    const priceId = resolvedPriceId(product, requestedPriceId);
    const key = cartLineKey(productId, priceId);

    setLines((current) => {
      const existing = current.find((line) => line.key === key);
      if (!existing) {
        return [...current, { key, id: productId, qty: addQty, ...(priceId ? { priceId } : {}) }];
      }
      return current.map((line) =>
        line.key === key
          ? { ...line, qty: Math.min(MAX_QTY, line.qty + addQty) }
          : line,
      );
    });
  }, [products]);

  const setQty = useCallback((lineKey: string, qty: number) => {
    const numericQty = Math.floor(Number(qty));
    const next = Number.isFinite(numericQty)
      ? Math.min(MAX_QTY, Math.max(0, numericQty))
      : 0;
    setLines((current) => {
      const line = current.find((candidate) => candidate.key === lineKey);
      const product = line ? products.find((candidate) => candidate.id === line.id) : undefined;
      if (!line || !product || product.inStock === false || next < 1) {
        return current.filter((candidate) => candidate.key !== lineKey);
      }
      return current.map((candidate) =>
        candidate.key === lineKey ? { ...candidate, qty: next } : candidate,
      );
    });
  }, [products]);

  const removeItem = useCallback((lineKey: string) => {
    setLines((current) => current.filter((line) => line.key !== lineKey));
  }, []);

  const clear = useCallback(() => {
    setLines([]);
    try {
      window.localStorage.removeItem(CART_STORAGE_KEY);
    } catch {
      // ignore quota / private mode
    }
  }, []);

  const toOrderItems = useCallback(
    () => buildOrderItemsFromLines(lines, products),
    [lines, products],
  );

  const itemCount = useMemo(
    () => lines.reduce((sum, line) => sum + line.qty, 0),
    [lines],
  );

  const value = useMemo(
    () => ({
      lines,
      itemCount,
      addItem,
      setQty,
      removeItem,
      clear,
      toOrderItems,
      ready,
    }),
    [lines, itemCount, addItem, setQty, removeItem, clear, toOrderItems, ready],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    return {
      lines: [],
      itemCount: 0,
      addItem: () => {},
      setQty: () => {},
      removeItem: () => {},
      clear: () => {},
      toOrderItems: () => [],
      ready: true,
    };
  }
  return ctx;
}
