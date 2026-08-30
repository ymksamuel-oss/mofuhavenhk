import { getSupabaseAdmin } from "@/lib/supabase";

export async function resolveCoupon(code: unknown, subtotal: number) {
  const normalized = typeof code === "string" ? code.trim().toUpperCase() : "";
  if (!normalized || !Number.isFinite(subtotal) || subtotal <= 0) return { code: "", discount: 0 };
  const supabase = getSupabaseAdmin();
  if (!supabase) return { code: "", discount: 0 };
  const { data } = await supabase.from("coupons").select("code,discount_amount,discount_type").eq("code", normalized).eq("active", true).maybeSingle();
  if (!data) return { code: "", discount: 0 };
  const raw = Number(data.discount_amount || 0);
  const discount = data.discount_type === "percentage" ? Math.min(subtotal, subtotal * raw / 100) : Math.min(subtotal, raw);
  return { code: String(data.code), discount: Math.round(discount * 100) / 100, discountType: data.discount_type as "fixed" | "percentage" };
}
