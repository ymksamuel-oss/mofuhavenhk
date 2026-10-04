import { NextResponse } from "next/server";
import { getAuthenticatedCustomer } from "@/lib/account/server";
import { profileSchema } from "@/lib/account/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  const context = await getAuthenticatedCustomer();
  if (!context) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { data, error } = await context.supabase
    .from("customer_profiles")
    .select("user_id, display_name, phone, avatar_url, created_at, updated_at")
    .eq("user_id", context.user.id)
    .maybeSingle();
  if (error) return NextResponse.json({ error: "profile_unavailable" }, { status: 503 });
  return NextResponse.json({ profile: data, email: context.user.email ?? "" });
}

export async function PATCH(request: Request) {
  const context = await getAuthenticatedCustomer();
  if (!context) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "invalid_json" }, { status: 400 }); }
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid_profile", issues: parsed.error.issues }, { status: 400 });
  const { data, error } = await context.supabase
    .from("customer_profiles")
    .upsert({ user_id: context.user.id, display_name: parsed.data.displayName, phone: parsed.data.phone }, { onConflict: "user_id" })
    .select("user_id, display_name, phone, avatar_url, created_at, updated_at")
    .single();
  if (error) return NextResponse.json({ error: "profile_save_failed" }, { status: 503 });
  return NextResponse.json({ profile: data });
}
