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

export const WISHLIST_STORAGE_KEY = "mofuhavenhk-wishlist";

type WishlistContextValue = {
  ids: string[];
  ready: boolean;
  has: (productId: string) => boolean;
  toggle: (productId: string) => void;
  add: (productId: string) => void;
  remove: (productId: string) => void;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

function sanitizeIds(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const known = new Set(PRODUCTS.map((p) => p.id));
  const out: string[] = [];
  for (const id of raw) {
    if (typeof id === "string" && known.has(id) && !out.includes(id)) {
      out.push(id);
    }
  }
  return out;
}

/**
 * Wishlist /「我的收藏」store — persists product ids for a future
 * member-center view. Toggle is available on product listing cards now.
 */
export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
      setIds(raw ? sanitizeIds(JSON.parse(raw)) : []);
    } catch {
      setIds([]);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(ids));
    } catch {
      // ignore
    }
  }, [ids, ready]);

  const has = useCallback((productId: string) => ids.includes(productId), [ids]);

  const add = useCallback((productId: string) => {
    if (!PRODUCTS.some((p) => p.id === productId)) return;
    setIds((current) =>
      current.includes(productId) ? current : [...current, productId],
    );
  }, []);

  const remove = useCallback((productId: string) => {
    setIds((current) => current.filter((id) => id !== productId));
  }, []);

  const toggle = useCallback((productId: string) => {
    setIds((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : PRODUCTS.some((p) => p.id === productId)
          ? [...current, productId]
          : current,
    );
  }, []);

  const value = useMemo(
    () => ({ ids, ready, has, toggle, add, remove }),
    [ids, ready, has, toggle, add, remove],
  );

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return ctx;
}
