import { calcSubtotal, SHIPPING, type OrderItem } from "@/lib/order";
import { formatMoney, type Locale, type TranslationKey } from "@/lib/i18n/translations";

// --- Where the "place order" / "Order via WhatsApp" buttons send the order ---
//
// Configure ONE of these two so the button opens a chat with the shop's own
// WhatsApp account (@MofuHavenHK) directly — never a generic "pick a
// contact yourself" dialog:
//
//   Option A (preferred) — NEXT_PUBLIC_WHATSAPP_LINK_CODE: the short-link
//     code from the @MofuHavenHK WhatsApp Business app (Business tools →
//     Short link), e.g. "ABCD1234". Produces https://wa.me/message/<code>.
//     This doesn't require exposing the shop's raw phone number in the
//     bundle and stays valid even if the number ever changes.
//
//   Option B — NEXT_PUBLIC_WHATSAPP_NUMBER: the @MofuHavenHK WhatsApp
//     number in full international format, e.g. "85212345678". Formatting
//     characters (+, spaces, dashes, brackets) are stripped automatically.
//     Produces https://wa.me/<number>.
//
// Set whichever the shop owner has via your hosting provider's dashboard
// (e.g. Vercel → Project → Settings → Environment Variables) or Cursor
// Cloud Agent secrets — these are account-specific values only the shop
// owner has, so they can't be guessed or hardcoded here.
const WHATSAPP_LINK_CODE = (
  process.env.NEXT_PUBLIC_WHATSAPP_LINK_CODE ?? ""
).trim();
const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(
  /[^\d]/g,
  "",
);

type BuildOrderMessageArgs = {
  items: OrderItem[];
  orderNumber: string;
  locale: Locale;
  t: (key: TranslationKey) => string;
  paymentLabel?: string;
};

export function buildOrderMessage({
  items,
  orderNumber,
  locale,
  t,
  paymentLabel,
}: BuildOrderMessageArgs): string {
  const subtotal = calcSubtotal(items);
  const total = subtotal + SHIPPING;

  const lines = [
    `${t("whatsappGreeting")} ${orderNumber}`,
    "",
    ...items.map(
      (item) =>
        `${item.name[locale]} x${item.qty} - ${formatMoney(item.qty * item.unit, locale)}`,
    ),
    "",
    `${t("subtotal")}: ${formatMoney(subtotal, locale)}`,
    `${t("shipping")}: ${formatMoney(SHIPPING, locale)}`,
    `${t("total")}: ${formatMoney(total, locale)}`,
  ];

  if (paymentLabel) {
    lines.push("", `${t("selectedPaymentPrefix")} ${paymentLabel}`);
  }

  return lines.join("\n");
}

/**
 * Opens WhatsApp with the given order message pre-filled, targeting the
 * shop's own @MofuHavenHK account directly whenever it's configured (via
 * NEXT_PUBLIC_WHATSAPP_LINK_CODE or NEXT_PUBLIC_WHATSAPP_NUMBER above) —
 * the customer lands straight in a chat with the shop with the message
 * already typed, ready to send, instead of having to search for a contact
 * themselves.
 */
export function openWhatsAppOrder(message: string): void {
  const text = encodeURIComponent(message);

  let base: string;
  if (WHATSAPP_LINK_CODE) {
    base = `https://wa.me/message/${WHATSAPP_LINK_CODE}`;
  } else if (WHATSAPP_NUMBER) {
    base = `https://wa.me/${WHATSAPP_NUMBER}`;
  } else {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[whatsapp] Neither NEXT_PUBLIC_WHATSAPP_LINK_CODE nor NEXT_PUBLIC_WHATSAPP_NUMBER is configured — the order message will open a generic WhatsApp share dialog that requires the customer to pick a contact themselves, instead of going straight to @MofuHavenHK. Set one of them to the shop's actual WhatsApp Business short-link code or phone number.",
      );
    }
    base = "https://api.whatsapp.com/send";
  }

  window.open(`${base}?text=${text}`, "_blank", "noopener,noreferrer");
}
