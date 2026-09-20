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
    ? "\u8acb\u8f38\u5165\u6709\u6548\u96fb\u90f5\u5730\u5740，\u4ee5\u4fbf\u6536\u53d6\u4ed8\u6b3e\u96fb\u5b50\u6536\u64da。"
    : "Please enter a valid email address to receive your payment receipt.";
}
