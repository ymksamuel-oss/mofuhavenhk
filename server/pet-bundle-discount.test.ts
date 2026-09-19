import { describe, expect, it } from "vitest";
import {
  buildOrderItemsFromLines,
  discountedUnitPrice,
  PET_BUNDLE_QUANTITIES,
  petBundleDiscountPercent,
  orderItemPricing,
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
  it("exposes small quantities plus the fixed bundle choices", () => {
    expect(PET_BUNDLE_QUANTITIES).toEqual([1, 2, 3, 4, 6, 8, 12]);
  });

  it("applies 95折 from 4, 9折 from 8, and 85折 from 12", () => {
    expect(petBundleDiscountPercent(base, 1)).toBe(0);
    expect(petBundleDiscountPercent(base, 2)).toBe(0);
    expect(petBundleDiscountPercent(base, 3)).toBe(0);
    expect(discountedUnitPrice(base, 100, 3)).toBe(100);
    expect(petBundleDiscountPercent(base, 4)).toBe(5);
    expect(petBundleDiscountPercent(base, 6)).toBe(5);
    expect(petBundleDiscountPercent(base, 7)).toBe(5);
    expect(petBundleDiscountPercent(base, 8)).toBe(10);
    expect(petBundleDiscountPercent(base, 11)).toBe(10);
    expect(petBundleDiscountPercent(base, 12)).toBe(15);
    expect(petBundleDiscountPercent(base, 17)).toBe(15);
    expect(discountedUnitPrice(base, 100, 8)).toBe(90);
    expect(discountedUnitPrice(base, 100, 12)).toBe(85);
  });

  it("does not discount products outside cats and dogs", () => {
    const other = { ...base, categorySlug: "lifestyle" } as Product;
    expect(petBundleDiscountPercent(other, 24)).toBe(0);
    expect(discountedUnitPrice(other, 100, 24)).toBe(100);
  });

  it("recognizes legacy food rows without a managed category relation", () => {
    const legacyFood = {
      ...base,
      categorySlug: "unassigned",
      name: { zh: "鯊魚軟骨原肉零食 20g", en: "Shark cartilage treat" },
      tags: ["all_pets", "supplier_category:snacks"],
    } as Product;
    expect(petBundleDiscountPercent(legacyFood, 4)).toBe(5);
    expect(discountedUnitPrice(legacyFood, 70, 4)).toBe(66.5);
  });

  it("keeps supplies excluded even when they are marked for all pets", () => {
    const supply = {
      ...base,
      categorySlug: "unassigned",
      name: { zh: "強韌透氣防暴衝胸背帶", en: "No-pull harness" },
      tags: ["all_pets", "supplies"],
    } as Product;
    expect(petBundleDiscountPercent(supply, 12)).toBe(0);
  });

  it("rebuilds the discounted unit used by checkout", () => {
    const items = buildOrderItemsFromLines([{ id: base.id, qty: 12 }], [base]);
    expect(items[0]?.unit).toBe(100);
    expect(orderItemPricing(items[0]!).itemTotal).toBe(1020);
    expect(items[0]?.originalUnit).toBe(100);
    expect(orderItemPricing(items[0]!).discountPercent).toBe(15);
  });
});
