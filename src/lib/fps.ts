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

/** Public path for the FPS QR image (replace file when shop provides one). */
export const FPS_QR_SRC =
  process.env.NEXT_PUBLIC_FPS_QR_SRC?.trim() || "/fps-qr.svg";

/** Local HK mobile digits (no country code) for bank-app paste. */
export function fpsLocalDigits(digits: string = FPS_ID): string {
  const local = digits.startsWith("852") ? digits.slice(3) : digits;
  return local || digits;
}

/** Format HK mobile for display, e.g. 9864 6585 */
export function formatFpsDisplayId(digits: string = FPS_ID): string {
  const local = fpsLocalDigits(digits);
  if (local.length === 8) {
    return `${local.slice(0, 4)} ${local.slice(4)}`;
  }
  return local || digits;
}
