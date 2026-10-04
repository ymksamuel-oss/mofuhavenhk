import "server-only";

import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient, isSupabaseAuthConfigured } from "@/lib/supabase/server";
import { safeReturnPath } from "@/lib/account/redirects";

export async function getAuthenticatedCustomer() {
  if (!isSupabaseAuthConfigured()) return null;
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    return { supabase, user: data.user };
  } catch {
    return null;
  }
}

export async function requireCustomer(returnTo = "/account") {
  const result = await getAuthenticatedCustomer();
  if (result) return result;
  redirect(`/account/login?returnTo=${encodeURIComponent(safeReturnPath(returnTo))}`);
}

export function customerSummary(user: User) {
  const metadata = user.user_metadata ?? {};
  return {
    id: user.id,
    email: user.email ?? "",
    displayName: String(metadata.display_name ?? metadata.full_name ?? metadata.name ?? "").slice(0, 100),
    avatarUrl: String(metadata.avatar_url ?? metadata.picture ?? "").slice(0, 1000),
  };
}
