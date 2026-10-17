import { NextResponse } from "next/server";
import { resolveCoupon } from "@/lib/coupon";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const code = String(body.code || "").trim().toUpperCase();
  const subtotal = Number(body.subtotal || 0);
  if (!code || !Number.isFinite(subtotal) || subtotal < 0) {
    return NextResponse.json({ valid: false, error: "invalid_request" }, { status: 400 });
  }
  const coupon = await resolveCoupon(code, subtotal);
  if (!coupon.code) return NextResponse.json({ valid: false, error: "coupon_not_found" }, { status: 404 });
  return NextResponse.json({
    valid: true,
    code: coupon.code,
    discountType: coupon.discountType,
    discountAmount: coupon.discount,
  });
}
