"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useCatalog } from "@/lib/catalog-context";
import type { Product } from "@/lib/products";

export const WISHLIST_STORAGE_KEY = "mofu_wishlist";
const MAX_WISHLIST_ITEMS = 100;

type WishlistContextValue = {
  ids: string[];
  ready: boolean;
  count: number;
  toggleWishlist: (productId: string) => boolean;
  isWishlisted: (productId: string) => boolean;
  getWishlistItems: () => Product[];
  clearWishlist: () => void;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

function sanitizeIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const ids: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") continue;
    const id = item.trim();
    if (!id || ids.includes(id)) continue;
    ids.push(id);
    if (ids.length >= MAX_WISHLIST_ITEMS) break;
  }
  return ids;
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { products } = useCatalog();
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (hydratedRef.current) return;
    try {
      const raw = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (raw) setIds(sanitizeIds(JSON.parse(raw)));
    } catch {
      setIds([]);
    }
    hydratedRef.current = true;
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(ids));
    } catch {
      // Ignore private-mode and storage quota failures.
    }
  }, [ids, ready]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const toggleWishlist = useCallback((productId: string) => {
    const id = productId.trim();
    if (!id) return false;
    let added = false;
    setIds((current) => {
      if (current.includes(id)) {
        setToast("已從我的最愛移除");
        return current.filter((item) => item !== id);
      }
      added = true;
      setToast("已加入我的最愛 ❤️");
      return [id, ...current].slice(0, MAX_WISHLIST_ITEMS);
    });
    return added;
  }, []);

  const isWishlisted = useCallback((productId: string) => ids.includes(productId), [ids]);
  const getWishlistItems = useCallback(
    () => ids.map((id) => products.find((product) => product.id === id)).filter((product): product is Product => Boolean(product)),
    [ids, products],
  );
  const clearWishlist = useCallback(() => {
    setIds([]);
    setToast("已清除我的最愛");
  }, []);

  const value = useMemo(() => ({
    ids,
    ready,
    count: ids.length,
    toggleWishlist,
    isWishlisted,
    getWishlistItems,
    clearWishlist,
  }), [ids, ready, toggleWishlist, isWishlisted, getWishlistItems, clearWishlist]);

  return (
    <WishlistContext.Provider value={value}>
      {children}
      {toast ? <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[100] flex justify-center px-4" role="status" aria-live="polite"><div className="rounded-full bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg">{toast}</div></div> : null}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const context = useContext(WishlistContext);
  if (!context) {
    return {
      ids: [],
      ready: true,
      count: 0,
      toggleWishlist: () => false,
      isWishlisted: () => false,
      getWishlistItems: () => [],
      clearWishlist: () => {},
    };
  }
  return context;
}
