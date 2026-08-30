import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})); const code = String(body.code || "").trim().toUpperCase(); const subtotal = Number(body.subtotal || 0);
  if (!code || !Number.isFinite(subtotal) || subtotal < 0) return NextResponse.json({ valid: false, error: "invalid_request" }, { status: 400 });
  const supabase = getSupabaseAdmin(); if (!supabase) return NextResponse.json({ valid: false, error: "not_configured" }, { status: 503 });
  const { data, error } = await supabase.from("coupons").select("code,discount_amount,discount_type").eq("code", code).eq("active", true).maybeSingle();
  if (error || !data) return NextResponse.json({ valid: false, error: "coupon_not_found" }, { status: 404 });
  const rawDiscount = Number(data.discount_amount || 0); const discount = data.discount_type === "percentage" ? Math.min(subtotal, subtotal * rawDiscount / 100) : Math.min(subtotal, rawDiscount);
  return NextResponse.json({ valid: true, code: data.code, discountType: data.discount_type, discountAmount: Math.round(discount * 100) / 100 });
}
