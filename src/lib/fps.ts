/**
 * FPS (轉數快) shop receiving details for checkout.
 * Override with NEXT_PUBLIC_FPS_* on Vercel if needed.
 */

export const FPS_ACCOUNT_NAME =
  process.env.NEXT_PUBLIC_FPS_ACCOUNT_NAME?.trim() || "Mofu Haven";

/** Digits-only FPS proxy / phone (defaults to @MofuHavenHK WhatsApp number). */
export const FPS_ID = (
  process.env.NEXT_PUBLIC_FPS_ID ??
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ??
  "85298646585"
).replace(/\D/g, "");

/**
 * Pure white FPS QR (QR modules only — no bank branding / payee text).
 * Hardcoded filename so stale Vercel env / CDN cannot serve the old blue screenshot.
 */
export const FPS_QR_SRC = "/images/fps-qr-plain.png";

/** Local HK mobile digits (no country code) for bank-app paste. */
export function fpsLocalDigits(digits: string = FPS_ID): string {
  const local = digits.startsWith("852") ? digits.slice(3) : digits;
  return local || digits;
}

/**
 * Optional merchant / bank-provided deep link for App-to-App / Web-to-App FPS.
 * True `fps://` or bank WTA URLs require a merchant FPS arrangement — leave unset
 * for the default copy + QR flow.
 */
export const FPS_DEEP_LINK =
  process.env.NEXT_PUBLIC_FPS_DEEP_LINK?.trim() || "";

/** Format HK mobile for display, e.g. 9864 6585 */
export function formatFpsDisplayId(digits: string = FPS_ID): string {
  const local = fpsLocalDigits(digits);
  if (local.length === 8) {
    return `${local.slice(0, 4)} ${local.slice(4)}`;
  }
  return local || digits;
}

/**
 * Value customers paste into bank apps for phone / FPS ID transfer.
 * Prefers the local 8-digit HK mobile when the proxy is a +852 number.
 */
export function getFpsIdForCopy(digits: string = FPS_ID): string {
  const local = digits.startsWith("852") ? digits.slice(3) : digits;
  return local || digits;
}

/** Exact HKD amount for bank-app paste (no currency symbol), e.g. "128.50". */
export function formatFpsAmountForCopy(amountHkd: number): string {
  if (!Number.isFinite(amountHkd)) return "0.00";
  return amountHkd.toFixed(2);
}

/** Detect coarse mobile / touch so we can offer bank-app deep link attempts. */
export function isLikelyMobileClient(): boolean {
  if (typeof navigator === "undefined") return false;
  if (/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)) {
    return true;
  }
  return navigator.maxTouchPoints > 1;
}

/**
 * Best-effort open of a bank / FPS deep link.
 * Returns false when no link is configured or navigation cannot be attempted.
 */
export function tryOpenFpsDeepLink(url: string = FPS_DEEP_LINK): boolean {
  const href = url.trim();
  if (!href || typeof window === "undefined") return false;

  try {
    // Custom schemes (`fps://`, bank apps) and https WTA URLs both work via assign.
    window.location.assign(href);
    return true;
  } catch {
    return false;
  }
}
