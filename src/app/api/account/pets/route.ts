import { NextResponse } from "next/server";
import { getAuthenticatedCustomer } from "@/lib/account/server";
import { petSchema } from "@/lib/account/validation";

export const dynamic = "force-dynamic";
const PET_COLUMNS = "id, name, species, birthday, breed, allergy_ingredients, special_notes, created_at, updated_at";

export async function GET() {
  const context = await getAuthenticatedCustomer();
  if (!context) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { data, error } = await context.supabase.from("customer_pets").select(PET_COLUMNS).eq("user_id", context.user.id).order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: "pets_unavailable" }, { status: 503 });
  return NextResponse.json({ pets: data ?? [] });
}

export async function POST(request: Request) {
  const context = await getAuthenticatedCustomer();
  if (!context) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "invalid_json" }, { status: 400 }); }
  const parsed = petSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid_pet", issues: parsed.error.issues }, { status: 400 });
  const pet = parsed.data;
  const { data, error } = await context.supabase.from("customer_pets").insert({
    user_id: context.user.id,
    name: pet.name,
    species: pet.species,
    birthday: pet.birthday || null,
    breed: pet.breed,
    allergy_ingredients: pet.allergyIngredients,
    special_notes: pet.specialNotes,
  }).select(PET_COLUMNS).single();
  if (error || !data) return NextResponse.json({ error: "pet_save_failed" }, { status: 503 });
  return NextResponse.json({ pet: data }, { status: 201 });
}
