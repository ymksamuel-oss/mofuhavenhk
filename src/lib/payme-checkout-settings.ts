export const PAYME_PAY_LINK_SETTING_KEY = "payme_pay_link";
export const PAYME_MERCHANT_NAME_SETTING_KEY = "payme_merchant_name";

export type PayMeCheckoutSettings = {
  payLink: string | null;
  merchantName: string | null;
};

export const EMPTY_PAYME_CHECKOUT_SETTINGS: PayMeCheckoutSettings = {
  payLink: "https://qr.payme.hsbc.com.hk/1/JVNmr4C4EpPd6yDBDBgrsj",
  merchantName: "Mofu Havenhk",
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

export function parsePayMeCheckoutSettings(settings: Record<string, unknown>): PayMeCheckoutSettings {
  const payLinkCandidate = cleanText(settings[PAYME_PAY_LINK_SETTING_KEY], 1024);
  return {
    payLink: isSafePayMeLink(payLinkCandidate) ? payLinkCandidate : null,
    merchantName: cleanText(settings[PAYME_MERCHANT_NAME_SETTING_KEY], 160),
  };
}

export async function getPayMeCheckoutSettings(): Promise<PayMeCheckoutSettings> {
  const settings = parsePayMeCheckoutSettings({
    [PAYME_PAY_LINK_SETTING_KEY]: process.env.NEXT_PUBLIC_PAYME_PAY_LINK || EMPTY_PAYME_CHECKOUT_SETTINGS.payLink,
    [PAYME_MERCHANT_NAME_SETTING_KEY]: process.env.NEXT_PUBLIC_PAYME_MERCHANT_NAME || EMPTY_PAYME_CHECKOUT_SETTINGS.merchantName,
  });
  return settings.payLink ? settings : EMPTY_PAYME_CHECKOUT_SETTINGS;
}
