import { describe, expect, it } from "vitest";
import { getCartItemCount, getCartSubtotal, mergeCartItem, removeCartItem, updateCartItemQuantity, type CartProduct } from "../shared/cart";

const product: CartProduct = {
  id: "prod_cat_1",
  name: "測試貓咪商品",
  description: "測試商品介紹",
  image: null,
  images: [],
  priceId: "price_cat_1",
  unitAmount: 1280,
  currency: "hkd",
  active: true,
  metadata: {},
};

describe("cart state helpers", () => {
  it("merges repeated additions and caps quantity at 99", () => {
    let items = mergeCartItem([], product);
    items = mergeCartItem(items, product);
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(2);

    for (let i = 0; i < 110; i += 1) items = mergeCartItem(items, product);
    expect(items[0].quantity).toBe(99);
  });

  it("updates, removes and calculates cart totals", () => {
    let items = mergeCartItem([], product);
    items = updateCartItemQuantity(items, product.id, 3);
    expect(getCartItemCount(items)).toBe(3);
    expect(getCartSubtotal(items)).toBe(3840);

    items = removeCartItem(items, product.id);
    expect(items).toEqual([]);
    expect(getCartItemCount(items)).toBe(0);
  });

  it("removes an item when quantity is reduced to zero", () => {
    const items = updateCartItemQuantity([ { ...product, quantity: 1 } ], product.id, 0);
    expect(items).toEqual([]);
  });
});
