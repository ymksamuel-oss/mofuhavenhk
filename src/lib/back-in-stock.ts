import { isValidEmailAddress, normalizeEmailAddress } from "@/lib/emailAddress";

export type BackInStockContactKind = "email" | "whatsapp";

/** Return a normalized contact value, or null if it is not safe to accept. */
export function normalizeBackInStockContact(
  kind: unknown,
  value: unknown,
): string | null {
  if (typeof value !== "string" || value.length > 254) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (kind === "email") {
    return isValidEmailAddress(trimmed) ? normalizeEmailAddress(trimmed) : null;
  }

  if (kind !== "whatsapp") return null;
  const compact = trimmed.replace(/[\s().-]/g, "");
  if (/^[2-9]\d{7}$/.test(compact)) return `+852${compact}`;
  if (!/^\+[1-9]\d{7,14}$/.test(compact)) return null;
  return compact;
}
