import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedCustomer } from "@/lib/account/server";
import { petSchema } from "@/lib/account/validation";

export const dynamic = "force-dynamic";
const PET_COLUMNS = "id, name, species, birthday, breed, allergy_ingredients, special_notes, created_at, updated_at";
const idSchema = z.string().uuid();

export async function PATCH(request: Request, contextParams: { params: Promise<{ id: string }> }) {
  const context = await getAuthenticatedCustomer();
  if (!context) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await contextParams.params;
  if (!idSchema.safeParse(id).success) return NextResponse.json({ error: "not_found" }, { status: 404 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "invalid_json" }, { status: 400 }); }
  const parsed = petSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid_pet", issues: parsed.error.issues }, { status: 400 });
  const pet = parsed.data;
  const { data, error } = await context.supabase.from("customer_pets").update({
    name: pet.name,
    species: pet.species,
    birthday: pet.birthday || null,
    breed: pet.breed,
    allergy_ingredients: pet.allergyIngredients,
    special_notes: pet.specialNotes,
  }).eq("id", id).eq("user_id", context.user.id).select(PET_COLUMNS).maybeSingle();
  if (error) return NextResponse.json({ error: "pet_update_failed" }, { status: 503 });
  if (!data) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ pet: data });
}

export async function DELETE(_request: Request, contextParams: { params: Promise<{ id: string }> }) {
  const context = await getAuthenticatedCustomer();
  if (!context) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await contextParams.params;
  if (!idSchema.safeParse(id).success) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const { data, error } = await context.supabase.from("customer_pets").delete().eq("id", id).eq("user_id", context.user.id).select("id").maybeSingle();
  if (error) return NextResponse.json({ error: "pet_delete_failed" }, { status: 503 });
  if (!data) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}
