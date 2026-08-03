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
import { PRODUCTS } from "@/lib/products";
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

function sanitizeLines(raw: unknown): CartLine[] {
  if (!Array.isArray(raw)) return [];
  const known = new Set(PRODUCTS.map((p) => p.id));
  const byId = new Map<string, number>();
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const id = (entry as { id?: unknown }).id;
    const qty = (entry as { qty?: unknown }).qty;
    if (typeof id !== "string" || !known.has(id)) continue;
    const n = Math.min(
      MAX_QTY,
      Math.max(1, Math.floor(Number(qty) || 0)),
    );
    if (n < 1) continue;
    byId.set(id, Math.min(MAX_QTY, (byId.get(id) ?? 0) + n));
  }
  return Array.from(byId.entries()).map(([id, qty]) => ({ id, qty }));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CART_STORAGE_KEY);
      setLines(raw ? sanitizeLines(JSON.parse(raw)) : []);
    } catch {
      setLines([]);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // ignore quota / private mode
    }
  }, [lines, ready]);

  const addItem = useCallback((productId: string, qty = 1) => {
    const addQty = Math.min(MAX_QTY, Math.max(1, Math.floor(qty)));
    setLines((current) => {
      const existing = current.find((line) => line.id === productId);
      if (!existing) {
        if (!PRODUCTS.some((p) => p.id === productId)) return current;
        return [...current, { id: productId, qty: addQty }];
      }
      return current.map((line) =>
        line.id === productId
          ? { ...line, qty: Math.min(MAX_QTY, line.qty + addQty) }
          : line,
      );
    });
  }, []);

  const setQty = useCallback((productId: string, qty: number) => {
    const next = Math.min(MAX_QTY, Math.max(0, Math.floor(qty)));
    setLines((current) => {
      if (next < 1) return current.filter((line) => line.id !== productId);
      return current.map((line) =>
        line.id === productId ? { ...line, qty: next } : line,
      );
    });
  }, []);

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
    () => buildOrderItemsFromLines(lines),
    [lines],
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
