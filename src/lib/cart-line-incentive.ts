import { orderItemPricing, type OrderItem } from "@/lib/order";

export type CartLineIncentive = {
  targetQuantity: 4 | 8 | 12;
  additionalQuantity: number;
  translationKey: "cartLineIncentive4" | "cartLineIncentive8" | "cartLineIncentive12";
};

/** Returns a copy-only prompt when the exact line's next tier lowers its actual unit price. */
export function getCartLineIncentive(item: OrderItem): CartLineIncentive | undefined {
  const targetQuantity = item.qty < 4 ? 4 : item.qty < 8 ? 8 : item.qty < 12 ? 12 : undefined;
  if (targetQuantity === undefined) return undefined;

  const currentDiscount = orderItemPricing(item).discountPercent;
  const nextDiscount = orderItemPricing({ ...item, qty: targetQuantity }).discountPercent;
  if (nextDiscount <= currentDiscount) return undefined;

  return {
    targetQuantity,
    additionalQuantity: targetQuantity - item.qty,
    translationKey: `cartLineIncentive${targetQuantity}`,
  };
}
