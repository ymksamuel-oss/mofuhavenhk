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
  MAX_QTY,
  type OrderItem,
} from "@/lib/order";

export const CART_STORAGE_KEY = "mofuhavenhk-cart";

export type CartLine = { id: string; qty: number };

type CartContextValue = {
  lines: CartLine[];
  /** Total units in the basket (sum of qty). */
  itemCount: number;
  addItem: (productId: string, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
  /** Catalog-priced order lines for checkout. */
  toOrderItems: () => OrderItem[];
  ready: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

export function sanitizeLines(
  raw: unknown,
  products: readonly Product[] = [],
): CartLine[] {
  if (!Array.isArray(raw)) return [];
  const purchasable = new Set(
    products.filter((product) => product.inStock !== false).map(
      (product) => product.id,
    ),
  );
  const byId = new Map<string, number>();
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const id = (entry as { id?: unknown }).id;
    const qty = (entry as { qty?: unknown }).qty;
    if (typeof id !== "string" || !purchasable.has(id)) continue;
    const numericQty = Math.floor(Number(qty));
    if (!Number.isFinite(numericQty) || numericQty < 1) continue;
    const n = Math.min(MAX_QTY, numericQty);
    byId.set(id, Math.min(MAX_QTY, (byId.get(id) ?? 0) + n));
  }
  return Array.from(byId.entries()).map(([id, qty]) => ({ id, qty }));
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

  const addItem = useCallback((productId: string, qty = 1) => {
    const product = products.find((candidate) => candidate.id === productId);
    if (!product || product.inStock === false) return;
    const numericQty = Math.floor(Number(qty));
    if (!Number.isFinite(numericQty) || numericQty < 1) return;
    const addQty = Math.min(MAX_QTY, numericQty);
    setLines((current) => {
      const existing = current.find((line) => line.id === productId);
      if (!existing) {
        return [...current, { id: productId, qty: addQty }];
      }
      return current.map((line) =>
        line.id === productId
          ? { ...line, qty: Math.min(MAX_QTY, line.qty + addQty) }
          : line,
      );
    });
  }, [products]);

  const setQty = useCallback((productId: string, qty: number) => {
    const product = products.find((candidate) => candidate.id === productId);
    const numericQty = Math.floor(Number(qty));
    const next = Number.isFinite(numericQty)
      ? Math.min(MAX_QTY, Math.max(0, numericQty))
      : 0;
    setLines((current) => {
      if (!product || product.inStock === false || next < 1) {
        return current.filter((line) => line.id !== productId);
      }
      return current.map((line) =>
        line.id === productId ? { ...line, qty: next } : line,
      );
    });
  }, [products]);

  const removeItem = useCallback((productId: string) => {
    setLines((current) => current.filter((line) => line.id !== productId));
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
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
