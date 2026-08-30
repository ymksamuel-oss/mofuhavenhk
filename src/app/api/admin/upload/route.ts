import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  const jar = await cookies(); if (!verifyAdminToken(jar.get(ADMIN_COOKIE)?.value)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const supabase = getSupabaseAdmin(); if (!supabase) return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  const form = await request.formData(); const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "file_required" }, { status: 400 });
  if (!file.type.startsWith("image/") || file.size > 8 * 1024 * 1024) return NextResponse.json({ error: "invalid_image" }, { status: 400 });
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]/g, "-"); const path = `${Date.now()}-${safeName}`;
  const { error } = await supabase.storage.from("public-images").upload(path, file, { contentType: file.type, upsert: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  const { data } = supabase.storage.from("public-images").getPublicUrl(path); return NextResponse.json({ url: data.publicUrl });
}
