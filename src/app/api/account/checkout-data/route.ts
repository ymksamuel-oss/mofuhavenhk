import { NextResponse } from "next/server";
import { getAuthenticatedCustomer } from "@/lib/account/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const context = await getAuthenticatedCustomer();
  if (!context) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const [profileResult, addressResult] = await Promise.all([
    context.supabase.from("customer_profiles").select("display_name, phone").eq("user_id", context.user.id).maybeSingle(),
    context.supabase.from("customer_addresses").select("id, label, address_type, recipient_name, recipient_phone, address, address_line2, district, region, pickup_point_code, pickup_point_name, pickup_point_type, is_default").eq("user_id", context.user.id).order("is_default", { ascending: false }).order("updated_at", { ascending: false }),
  ]);
  if (profileResult.error || addressResult.error) return NextResponse.json({ error: "checkout_data_unavailable" }, { status: 503 });
  return NextResponse.json({
    profile: { displayName: profileResult.data?.display_name ?? "", phone: profileResult.data?.phone ?? "", email: context.user.email ?? "" },
    addresses: addressResult.data ?? [],
  });
}
