import { calcSubtotal, SHIPPING, type OrderItem } from "@/lib/order";
import { formatMoney, type Locale, type TranslationKey } from "@/lib/i18n/translations";

/**
 * Shop WhatsApp number for *customer-initiated* Click-to-Chat only.
 * Server-side shop notifications use src/lib/notifyWhatsapp.ts and never
 * go through this helper.
 *
 * Digits only, international format, no "+" (e.g. "85212345678").
 * Must be the number behind @MofuHavenHK — usernames cannot be used in wa.me.
 */
// Default = @MofuHavenHK CallMeBot number (same as server WHATSAPP_PHONE).
const WHATSAPP_NUMBER = (
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ??
  process.env.NEXT_PUBLIC_SHOP_WHATSAPP_PHONE ??
  "85298646585"
).replace(/\D/g, "");

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

/** Customer → shop WhatsApp message for FPS (轉數快) checkout. */
export function buildFpsOrderMessage({
  items,
  orderNumber,
  locale,
  t,
}: Omit<BuildOrderMessageArgs, "paymentLabel">): string {
  const base = buildOrderMessage({
    items,
    orderNumber,
    locale,
    t,
    paymentLabel: t("payFps"),
  });

  return [
    base,
    "",
    t("fpsWhatsappStatus"),
    t("fpsWhatsappScreenshot"),
    t("fpsWhatsappShopHandle"),
  ].join("\n");
}

/**
 * Opens a customer→shop WhatsApp chat prefilled with the order.
 * Requires NEXT_PUBLIC_WHATSAPP_NUMBER (the @MofuHavenHK phone).
 * Returns false if the shop number is not configured (does not open a
 * generic share sheet that would miss the shop inbox).
 */
export function openWhatsAppOrder(message: string): boolean {
  if (!WHATSAPP_NUMBER) {
    console.error(
      "[whatsapp] NEXT_PUBLIC_WHATSAPP_NUMBER is not set — cannot open shop chat for @MofuHavenHK.",
    );
    return false;
  }

  const text = encodeURIComponent(message);
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
  window.open(url, "_blank", "noopener,noreferrer");
  return true;
}

export function getPublicShopWhatsAppNumber(): string {
  return WHATSAPP_NUMBER;
}
