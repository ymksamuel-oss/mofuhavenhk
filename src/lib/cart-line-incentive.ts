import { orderItemPricing, type OrderItem } from "@/lib/order";

export type CartLineIncentive = {
  targetQuantity: 6 | 9 | 12;
  additionalQuantity: number;
  translationKey: "cartLineIncentive4" | "cartLineIncentive8" | "cartLineIncentive12";
};

/** Returns a copy-only prompt when the exact line's next tier lowers its actual unit price. */
export function getCartLineIncentive(item: OrderItem): CartLineIncentive | undefined {
  const targetQuantity = item.qty < 6 ? 6 : item.qty < 9 ? 9 : item.qty < 12 ? 12 : undefined;
  if (targetQuantity === undefined) return undefined;

  const currentDiscount = orderItemPricing(item).discountPercent;
  const nextDiscount = orderItemPricing({ ...item, qty: targetQuantity }).discountPercent;
  if (nextDiscount <= currentDiscount) return undefined;

  return {
    targetQuantity,
    additionalQuantity: targetQuantity - item.qty,
    translationKey: targetQuantity === 6
      ? "cartLineIncentive4"
      : targetQuantity === 9
        ? "cartLineIncentive8"
        : "cartLineIncentive12",
  };
}
