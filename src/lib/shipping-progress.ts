import { FREE_SHIPPING_THRESHOLD, fromMinorUnits, toMinorUnits } from "@/lib/order";

export type FreeShippingProgressState = {
  reached: boolean;
  remaining: number;
  percentage: number;
  currentAmount: number;
};

/** Derives display-only progress using the same cent rounding as order totals. */
export function getFreeShippingProgress(subtotal: number): FreeShippingProgressState {
  const thresholdMinor = toMinorUnits(FREE_SHIPPING_THRESHOLD);
  const safeSubtotalMinor = Math.max(0, toMinorUnits(subtotal));
  const currentMinor = Math.min(safeSubtotalMinor, thresholdMinor);
  const reached = safeSubtotalMinor >= thresholdMinor;

  return {
    reached,
    remaining: fromMinorUnits(Math.max(0, thresholdMinor - currentMinor)),
    percentage: reached || thresholdMinor <= 0
      ? 100
      : Math.floor((currentMinor * 100) / thresholdMinor),
    currentAmount: fromMinorUnits(currentMinor),
  };
}
