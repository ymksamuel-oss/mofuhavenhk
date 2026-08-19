export type CartProduct = {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  images: string[];
  priceId: string | null;
  unitAmount: number | null;
  currency: string | null;
  active: boolean;
  metadata: Record<string, string>;
};

export type CartItem = CartProduct & { quantity: number };

export type DeliveryMethod = "home_delivery" | "sf_station" | "smart_locker";

export type CheckoutDeliveryDetails = {
  recipientName: string;
  contactPhone: string;
  deliveryMethod: DeliveryMethod;
  pickupCode?: string;
};

export function mergeCartItem(items: CartItem[], product: CartProduct): CartItem[] {
  if (!product.priceId) return items;
  const existing = items.find((item) => item.id === product.id);
  if (existing) {
    return items.map((item) => item.id === product.id ? { ...item, quantity: Math.min(item.quantity + 1, 99) } : item);
  }
  return [...items, { ...product, quantity: 1 }];
}

export function updateCartItemQuantity(items: CartItem[], productId: string, quantity: number): CartItem[] {
  if (quantity <= 0) return items.filter((item) => item.id !== productId);
  return items.map((item) => item.id === productId ? { ...item, quantity: Math.min(Math.floor(quantity), 99) } : item);
}

export function removeCartItem(items: CartItem[], productId: string): CartItem[] {
  return items.filter((item) => item.id !== productId);
}

export function getCartItemCount(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function getCartSubtotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + (item.unitAmount ?? 0) * item.quantity, 0);
}
