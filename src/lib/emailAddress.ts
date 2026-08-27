/** Lightweight email validation for receipt delivery; definitive delivery validation remains provider-side. */
export function normalizeEmailAddress(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function isValidEmailAddress(value: unknown): value is string {
  const email = normalizeEmailAddress(value);
  // Deliberately conservative: a non-empty local part, an @, a domain label,
  // and a dot-separated suffix. The provider performs final mailbox checks.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

export function emailValidationMessage(locale: "zh" | "en"): string {
  return locale === "zh"
    ? "請輸入有效電郵地址，以便收取付款電子收據。"
    : "Please enter a valid email address to receive your payment receipt.";
}
