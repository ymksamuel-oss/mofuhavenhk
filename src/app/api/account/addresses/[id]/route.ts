import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedCustomer } from "@/lib/account/server";
import { addressSchema } from "@/lib/account/validation";

export const dynamic = "force-dynamic";
const ADDRESS_COLUMNS = "id, label, address_type, recipient_name, recipient_phone, address, address_line2, district, region, pickup_point_code, pickup_point_name, pickup_point_type, is_default, created_at, updated_at";
const idSchema = z.string().uuid();

export async function PATCH(request: Request, contextParams: { params: Promise<{ id: string }> }) {
  const context = await getAuthenticatedCustomer();
  if (!context) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await contextParams.params;
  if (!idSchema.safeParse(id).success) return NextResponse.json({ error: "not_found" }, { status: 404 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "invalid_json" }, { status: 400 }); }
  const parsed = addressSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid_address", issues: parsed.error.issues }, { status: 400 });
  const input = parsed.data;
  const { data, error } = await context.supabase.from("customer_addresses").update({
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
  }).eq("id", id).eq("user_id", context.user.id).select(ADDRESS_COLUMNS).maybeSingle();
  if (error) return NextResponse.json({ error: "address_update_failed" }, { status: 503 });
  if (!data) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (input.isDefault) {
    const { error: defaultError } = await context.supabase.rpc("set_customer_default_address", { p_address_id: id });
    if (defaultError) return NextResponse.json({ error: "default_address_save_failed" }, { status: 503 });
    return NextResponse.json({ address: { ...data, is_default: true } });
  }
  return NextResponse.json({ address: data });
}

export async function DELETE(_request: Request, contextParams: { params: Promise<{ id: string }> }) {
  const context = await getAuthenticatedCustomer();
  if (!context) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await contextParams.params;
  if (!idSchema.safeParse(id).success) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const { data, error } = await context.supabase.from("customer_addresses").delete().eq("id", id).eq("user_id", context.user.id).select("id").maybeSingle();
  if (error) return NextResponse.json({ error: "address_delete_failed" }, { status: 503 });
  if (!data) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}
