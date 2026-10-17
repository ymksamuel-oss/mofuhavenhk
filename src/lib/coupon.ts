type StaticCoupon = { active?: boolean; discountAmount: number; discountType: "fixed" | "percentage" };
export type ResolvedCoupon = { code: string; discount: number; discountType?: "fixed" | "percentage" };

/** Server-only static registry, configured as a JSON object in MOFU_STATIC_COUPONS_JSON. */
function readStaticCoupons(): Record<string, StaticCoupon> {
  const raw = process.env.MOFU_STATIC_COUPONS_JSON;
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed).filter(([, value]) => {
      if (!value || typeof value !== "object") return false;
      const item = value as Partial<StaticCoupon>;
      return Number.isFinite(Number(item.discountAmount)) && Number(item.discountAmount) > 0
        && (item.discountType === "fixed" || item.discountType === "percentage");
    })) as Record<string, StaticCoupon>;
  } catch {
    console.error("[coupon] Invalid MOFU_STATIC_COUPONS_JSON; coupons disabled");
    return {};
  }
}

export async function resolveCoupon(code: unknown, subtotal: number): Promise<ResolvedCoupon> {
  const normalized = typeof code === "string" ? code.trim().toUpperCase() : "";
  if (!normalized || !Number.isFinite(subtotal) || subtotal <= 0) return { code: "", discount: 0 };
  const coupon = readStaticCoupons()[normalized];
  if (!coupon || coupon.active === false) return { code: "", discount: 0 };
  const raw = Number(coupon.discountAmount);
  const discount = coupon.discountType === "percentage"
    ? Math.min(subtotal, subtotal * Math.min(raw, 100) / 100)
    : Math.min(subtotal, raw);
  return { code: normalized, discount: Math.round(discount * 100) / 100, discountType: coupon.discountType };
}
