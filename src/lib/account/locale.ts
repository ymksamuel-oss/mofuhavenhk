import "server-only";

import { cookies } from "next/headers";

export async function getAccountLocale(): Promise<"zh" | "en"> {
  const cookieStore = await cookies();
  const value = cookieStore.get("NEXT_LOCALE")?.value ?? cookieStore.get("mofuhavenhk-locale")?.value;
  return value === "en" || value === "en-HK" ? "en" : "zh";
}
