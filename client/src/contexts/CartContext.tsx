import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  getCartItemCount,
  getCartSubtotal,
  mergeCartItem,
  removeCartItem,
  updateCartItemQuantity,
  type CartItem,
  type CartProduct,
} from "@shared/cart";

const CART_STORAGE_KEY = "mofu-haven-cart-v1";

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isOpen: boolean;
  addItem: (product: CartProduct) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function readStoredCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as CartItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && typeof item.id === "string" && typeof item.priceId === "string" && item.quantity > 0);
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readStoredCart);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage can be disabled in private browsing; in-memory cart still works.
    }
  }, [items]);

  useEffect(() => {
    const syncStorage = (event: StorageEvent) => {
      if (event.key !== CART_STORAGE_KEY) return;
      setItems(readStoredCart());
    };
    window.addEventListener("storage", syncStorage);
    return () => window.removeEventListener("storage", syncStorage);
  }, []);

  const addItem = useCallback((product: CartProduct) => {
    setItems((current) => mergeCartItem(current, product));
    setIsOpen(true);
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((current) => updateCartItemQuantity(current, productId, quantity));
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((current) => removeCartItem(current, productId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const value = useMemo<CartContextValue>(() => ({
    items,
    itemCount: getCartItemCount(items),
    subtotal: getCartSubtotal(items),
    isOpen,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    openCart,
    closeCart,
  }), [items, isOpen, addItem, updateQuantity, removeItem, clearCart, openCart, closeCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
