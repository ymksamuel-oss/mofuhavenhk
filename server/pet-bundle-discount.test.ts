import { describe, expect, it } from "vitest";
import {
  buildOrderItemsFromLines,
  discountedUnitPrice,
  PET_BUNDLE_QUANTITIES,
  petBundleDiscountPercent,
} from "../src/lib/order";
import type { Product } from "../src/lib/products";

const base = {
  id: "test-product",
  name: { zh: "測試商品", en: "Test product" },
  price: 100,
  categorySlug: "cats",
  inStock: true,
} as Product;

describe("pet bundle discounts", () => {
  it("exposes the six fixed product-page choices", () => {
    expect(PET_BUNDLE_QUANTITIES).toEqual([4, 6, 8, 12, 16, 24]);
  });

  it("applies 9折 from 8 and 85折 from 16", () => {
    expect(petBundleDiscountPercent(base, 6)).toBe(0);
    expect(petBundleDiscountPercent(base, 8)).toBe(10);
    expect(petBundleDiscountPercent(base, 15)).toBe(10);
    expect(petBundleDiscountPercent(base, 16)).toBe(15);
    expect(discountedUnitPrice(base, 100, 8)).toBe(90);
    expect(discountedUnitPrice(base, 100, 16)).toBe(85);
  });

  it("does not discount products outside cats and dogs", () => {
    const other = { ...base, categorySlug: "lifestyle" } as Product;
    expect(petBundleDiscountPercent(other, 24)).toBe(0);
    expect(discountedUnitPrice(other, 100, 24)).toBe(100);
  });

  it("rebuilds the discounted unit used by checkout", () => {
    const items = buildOrderItemsFromLines([{ id: base.id, qty: 16 }], [base]);
    expect(items[0]?.unit).toBe(85);
    expect(items[0]?.originalUnit).toBe(100);
    expect(items[0]?.discountPercent).toBe(15);
  });
});
