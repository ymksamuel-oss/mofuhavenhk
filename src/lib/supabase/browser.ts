"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;
const SUPABASE_STATIC_MODE_DISABLED = true;

export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (SUPABASE_STATIC_MODE_DISABLED) return null;
  if (typeof window === "undefined") return null;
  if (browserClient) return browserClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";
  if (!url || !key) return null;
  browserClient = createBrowserClient(url, key);
  return browserClient;
}
