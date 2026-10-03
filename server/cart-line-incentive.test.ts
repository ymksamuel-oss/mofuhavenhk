import { describe, expect, it } from "vitest";
import { getCartLineIncentive } from "@/lib/cart-line-incentive";
import type { OrderItem } from "@/lib/order";
import { translations } from "@/lib/i18n/translations";

function line(qty: number, mofuSku?: string): OrderItem {
  return {
    lineKey: "product::default",
    id: "product",
    mofuSku,
    name: { zh: "測試商品", en: "Test product" },
    image: "/test.jpg",
    qty,
    unit: 100,
    originalUnit: 100,
  };
}

describe("cart line quantity incentives", () => {
  it("prompts a three-unit line to add one of the same item for the 4-unit tier", () => {
    expect(getCartLineIncentive(line(3))).toEqual({
      targetQuantity: 4,
      additionalQuantity: 1,
      translationKey: "cartLineIncentive4",
    });
  });

  it("prompts a seven-unit line to add one of the same item for the 8-unit tier", () => {
    expect(getCartLineIncentive(line(7))).toEqual({
      targetQuantity: 8,
      additionalQuantity: 1,
      translationKey: "cartLineIncentive8",
    });
  });

  it("prompts an eleven-unit line to add one of the same item for the 12-unit tier", () => {
    expect(getCartLineIncentive(line(11))).toEqual({
      targetQuantity: 12,
      additionalQuantity: 1,
      translationKey: "cartLineIncentive12",
    });
  });

  it("uses the next tier for intermediate quantities but stops at the final tier", () => {
    expect(getCartLineIncentive(line(5))?.additionalQuantity).toBe(3);
    expect(getCartLineIncentive(line(9))?.additionalQuantity).toBe(3);
    expect(getCartLineIncentive(line(12))).toBeUndefined();
  });

  it("does not promote preset value bundles that receive no quantity discount", () => {
    expect(getCartLineIncentive(line(3, "MOFU-BUNDLE-DENTAL-02"))).toBeUndefined();
    expect(getCartLineIncentive(line(7, "MOFU-BUNDLE-DENTAL-02"))).toBeUndefined();
  });

  it("uses the requested same-item wording for the 4, 8, and 12 piece tiers", () => {
    const messages = [3, 7, 11].map((qty) => {
      const incentive = getCartLineIncentive(line(qty));
      if (!incentive) throw new Error(`Expected an incentive for quantity ${qty}`);
      return translations.zh[incentive.translationKey].replace(
        "{count}",
        String(incentive.additionalQuantity),
      );
    });

    expect(messages).toEqual([
      "同款再加 1 件，即享 4 件量販特惠！",
      "同款再加 1 件，即享 8 件超值優惠！",
      "同款再加 1 件，即享 12 件批發級優惠！",
    ]);
  });
});
