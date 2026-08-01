import { calcSubtotal, LINE_ITEMS, SHIPPING } from "@/lib/order";
import { formatMoney, type Locale, type TranslationKey } from "@/lib/i18n/translations";

// Set NEXT_PUBLIC_WHATSAPP_NUMBER (e.g. "85212345678") to open the chat
// directly with the shop's WhatsApp number. Falls back to a generic
// "share to WhatsApp" link if not configured.
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";

type BuildOrderMessageArgs = {
  orderNumber: string;
  locale: Locale;
  t: (key: TranslationKey) => string;
  paymentLabel?: string;
};

export function buildOrderMessage({
  orderNumber,
  locale,
  t,
  paymentLabel,
}: BuildOrderMessageArgs): string {
  const subtotal = calcSubtotal(LINE_ITEMS);
  const total = subtotal + SHIPPING;

  const lines = [
    `${t("whatsappGreeting")} ${orderNumber}`,
    "",
    ...LINE_ITEMS.map(
      (item) =>
        `${t(item.key)} x${item.qty} - ${formatMoney(item.qty * item.unit, locale)}`,
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

export function openWhatsAppOrder(message: string): void {
  const text = encodeURIComponent(message);
  const base = WHATSAPP_NUMBER
    ? `https://wa.me/${WHATSAPP_NUMBER}`
    : "https://api.whatsapp.com/send";
  window.open(`${base}?text=${text}`, "_blank", "noopener,noreferrer");
}
