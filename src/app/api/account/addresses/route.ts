import { NextResponse } from "next/server";
import { getAuthenticatedCustomer } from "@/lib/account/server";
import { addressSchema } from "@/lib/account/validation";

export const dynamic = "force-dynamic";
const ADDRESS_COLUMNS = "id, label, address_type, recipient_name, recipient_phone, address, address_line2, district, region, pickup_point_code, pickup_point_name, pickup_point_type, is_default, created_at, updated_at";

export async function GET() {
  const context = await getAuthenticatedCustomer();
  if (!context) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { data, error } = await context.supabase.from("customer_addresses").select(ADDRESS_COLUMNS).eq("user_id", context.user.id).order("is_default", { ascending: false }).order("updated_at", { ascending: false });
  if (error) return NextResponse.json({ error: "addresses_unavailable" }, { status: 503 });
  return NextResponse.json({ addresses: data ?? [] });
}

export async function POST(request: Request) {
  const context = await getAuthenticatedCustomer();
  if (!context) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "invalid_json" }, { status: 400 }); }
  const parsed = addressSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid_address", issues: parsed.error.issues }, { status: 400 });
  const input = parsed.data;
  const { data, error } = await context.supabase.from("customer_addresses").insert({
    user_id: context.user.id,
    label: input.label,
    address_type: input.addressType,
    recipient_name: input.recipientName,
    recipient_phone: input.recipientPhone,
    address: input.address,
    address_line2: input.addressLine2,
    district: input.district,
    region: input.region || null,
    pickup_point_code: input.addressType === "sf_pickup" ? input.pickupPointCode : null,
    pickup_point_name: input.addressType === "sf_pickup" ? input.pickupPointName : null,
    pickup_point_type: input.addressType === "sf_pickup" ? input.pickupPointType ?? null : null,
    is_default: false,
  }).select(ADDRESS_COLUMNS).single();
  if (error || !data) return NextResponse.json({ error: "address_save_failed" }, { status: 503 });
  if (input.isDefault) {
    const { error: defaultError } = await context.supabase.rpc("set_customer_default_address", { p_address_id: data.id });
    if (defaultError) {
      await context.supabase.from("customer_addresses").delete().eq("id", data.id).eq("user_id", context.user.id);
      return NextResponse.json({ error: "default_address_save_failed" }, { status: 503 });
    }
    return NextResponse.json({ address: { ...data, is_default: true } }, { status: 201 });
  }
  return NextResponse.json({ address: data }, { status: 201 });
}
