import { describe, expect, it } from "vitest";
import {
  calcSubtotal,
  getShippingCost,
  isValueBundleProduct,
  orderItemPricing,
  petBundleDiscountPercent,
  type OrderItem,
} from "@/lib/order";
import type { Product } from "@/lib/products";

const baseProduct: Product = {
  id: "prod-dog-treat",
  categorySlug: "dogs",
  image: "/placeholder.png",
  name: { zh: "狗狗零食", en: "Dog treat" },
  price: 100,
  icon: "bone",
};

function item(overrides: Partial<OrderItem> = {}): OrderItem {
  return {
    lineKey: "prod-dog-treat::default",
    id: "prod-dog-treat",
    name: { zh: "狗狗零食", en: "Dog treat" },
    image: "/placeholder.png",
    qty: 1,
    unit: 100,
    originalUnit: 100,
    ...overrides,
  };
}

describe("checkout pricing invariants", () => {
  it("uses HK$399 as the single free-shipping boundary", () => {
    expect(getShippingCost(398.99)).toBe(35);
    expect(getShippingCost(399)).toBe(0);
    expect(getShippingCost(450)).toBe(0);
    expect(getShippingCost(399, false)).toBe(0);
  });

  it("does not apply quantity discounts to value bundles", () => {
    const bundle: Product = {
      ...baseProduct,
      id: "bundle-1",
      metadata: { mofu_sku: "MOFU-BUNDLE-PICKY-01" },
    };
    expect(isValueBundleProduct(bundle)).toBe(true);
    expect(petBundleDiscountPercent(bundle, 12)).toBe(0);
    expect(orderItemPricing(item({ mofuSku: "MOFU-BUNDLE-PICKY-01", qty: 12 })).discountPercent).toBe(0);
  });

  it("rounds discounted line totals in cents before summing", () => {
    const lines = [item({ qty: 8, unit: 33.33, originalUnit: 33.33 })];
    expect(calcSubtotal(lines)).toBe(240);
    expect(orderItemPricing(lines[0]).itemTotal).toBe(240);
  });
});
