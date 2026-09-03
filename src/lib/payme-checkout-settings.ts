import { getSupabaseAdmin } from "@/lib/supabase";

export const PAYME_PAY_LINK_SETTING_KEY = "payme_pay_link";
export const PAYME_PAYCODE_IMAGE_SETTING_KEY = "payme_paycode_image";
export const PAYME_MERCHANT_NAME_SETTING_KEY = "payme_merchant_name";

export type PayMeCheckoutSettings = {
  payLink: string | null;
  payCodeImageUrl: string | null;
  merchantName: string | null;
};

export const EMPTY_PAYME_CHECKOUT_SETTINGS: PayMeCheckoutSettings = {
  payLink: null,
  payCodeImageUrl: null,
  merchantName: null,
};

function cleanText(value: unknown, maxLength: number): string | null {
  return typeof value === "string" && value.trim()
    ? value.trim().slice(0, maxLength)
    : null;
}

function isSafePayMeLink(value: string | null): value is string {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "qr.payme.hsbc.com.hk";
  } catch {
    return false;
  }
}

function isSafeImageSource(value: string | null): value is string {
  if (!value) return false;
  if (value.startsWith("/")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

export function parsePayMeCheckoutSettings(settings: Record<string, unknown>): PayMeCheckoutSettings {
  const payLinkCandidate = cleanText(settings[PAYME_PAY_LINK_SETTING_KEY], 1024);
  const imageCandidate = cleanText(settings[PAYME_PAYCODE_IMAGE_SETTING_KEY], 2048);
  return {
    payLink: isSafePayMeLink(payLinkCandidate) ? payLinkCandidate : null,
    payCodeImageUrl: isSafeImageSource(imageCandidate) ? imageCandidate : null,
    merchantName: cleanText(settings[PAYME_MERCHANT_NAME_SETTING_KEY], 160),
  };
}

export async function getPayMeCheckoutSettings(): Promise<PayMeCheckoutSettings> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return EMPTY_PAYME_CHECKOUT_SETTINGS;

  const { data, error } = await supabase
    .from("store_settings")
    .select("key,value")
    .in("key", [
      PAYME_PAY_LINK_SETTING_KEY,
      PAYME_PAYCODE_IMAGE_SETTING_KEY,
      PAYME_MERCHANT_NAME_SETTING_KEY,
    ]);
  if (error) {
    console.warn("[payme] Could not load checkout settings", { code: error.code, message: error.message });
    return EMPTY_PAYME_CHECKOUT_SETTINGS;
  }

  return parsePayMeCheckoutSettings(Object.fromEntries((data || []).map((item) => [item.key, item.value])));
}
