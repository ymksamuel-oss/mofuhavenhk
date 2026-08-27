import { getDistrictLabel } from "@/lib/hkDistricts";
import { calcSubtotal, getShippingCost, type OrderItem } from "@/lib/order";
import {
  formatMoney,
  type Locale,
  type TranslationKey,
} from "@/lib/i18n/translations";

/**
 * Shop WhatsApp number for *customer-initiated* Click-to-Chat only.
 * Server-side shop notifications use src/lib/notifyWhatsapp.ts and never
 * go through this helper.
 *
 * Digits only, international format, no "+" (e.g. "85212345678").
 * Must be the number behind @MofuHavenHK — usernames cannot be used in wa.me.
 */
const WHATSAPP_NUMBER = (
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ??
  process.env.NEXT_PUBLIC_SHOP_WHATSAPP_PHONE ??
  "85298646585"
).replace(/\D/g, "");

export type OrderContact = {
  name?: string;
  /** Prefer formatted value including country code, e.g. "+852 91234567". */
  phone?: string;
  address?: string;
  addressLine2?: string;
  district?: string;
  city?: string;
  sfStationCode?: string;
};

type BuildOrderMessageArgs = {
  items: OrderItem[];
  orderNumber: string;
  locale: Locale;
  t: (key: TranslationKey) => string;
  paymentLabel?: string;
  contact?: OrderContact;
  /** Optional override — defaults to live cart subtotal + shipping. */
  totalHkd?: number;
  orderedAt?: Date;
};

function formatOrderTime(date: Date, locale: Locale): string {
  return date.toLocaleString(locale === "zh" ? "zh-HK" : "en-HK", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatContactBlock(
  contact: OrderContact | undefined,
  t: (key: TranslationKey) => string,
  locale: Locale,
): string[] {
  if (!contact) return [];
  const name = contact.name?.trim();
  const phone = contact.phone?.trim();
  const line1 = contact.address?.trim();
  const line2 = contact.addressLine2?.trim();
  const districtRaw = (contact.district || contact.city)?.trim();
  const district = districtRaw
    ? getDistrictLabel(districtRaw, locale)
    : undefined;
  const sfCode = contact.sfStationCode?.trim();
  const addressParts = [district, line1, line2].filter(Boolean);

  if (!name && !phone && addressParts.length === 0 && !sfCode) return [];

  const lines = ["", `【${t("whatsappContactHeading")}】`];
  if (name) lines.push(`${t("customerNameLabel")}：${name}`);
  if (phone) lines.push(`${t("customerPhoneLabel")}：${phone}`);
  if (addressParts.length > 0) {
    lines.push(`${t("shippingAddressLabel")}：${addressParts.join("，")}`);
  }
  if (sfCode) {
    lines.push(`${t("sfStationLabel")}：${sfCode}`);
  }
  return lines;
}

/**
 * Structured customer→shop WhatsApp order message.
 * Totals are always recomputed from live cart lines (never hardcoded).
 */
export function buildOrderMessage({
  items,
  orderNumber,
  locale,
  t,
  paymentLabel,
  contact,
  totalHkd,
  orderedAt = new Date(),
}: BuildOrderMessageArgs): string {
  const subtotal = calcSubtotal(items);
  const shipping = getShippingCost(subtotal, items.length > 0);
  const liveTotal = subtotal + shipping;
  const total =
    typeof totalHkd === "number" && Number.isFinite(totalHkd)
      ? totalHkd
      : liveTotal;

  const itemLines =
    items.length > 0
      ? items.map(
          (item, index) => {
            const skuLabel = item.mofuSku
              ? locale === "zh"
                ? `［貨號：${item.mofuSku}］`
                : ` [SKU: ${item.mofuSku}]`
              : "";
            return `${index + 1}. ${item.name[locale]}${item.variantLabel ? `（${item.variantLabel[locale] || item.variantLabel.zh}）` : ""}${skuLabel} × ${item.qty}　${formatMoney(item.qty * item.unit, locale)}`;
          },
        )
      : [`（${locale === "zh" ? "未有商品" : "No items"}）`];

  const lines = [
    `🛒 ${t("whatsappOrderHeading")}`,
    `${t("orderNumber")}：${orderNumber}`,
    `${t("whatsappOrderTime")}：${formatOrderTime(orderedAt, locale)}`,
    "",
    `【${t("whatsappItemsHeading")}】`,
    ...itemLines,
    "",
    `【${t("whatsappTotalsHeading")}】`,
    `${t("subtotal")}：${formatMoney(subtotal, locale)}`,
    `${t("shipping")}：${formatMoney(shipping, locale)}`,
    `${t("total")}：${formatMoney(total, locale)}`,
  ];

  if (paymentLabel) {
    lines.push("", `${t("selectedPaymentPrefix")} ${paymentLabel}`);
  }

  lines.push(...formatContactBlock(contact, t, locale));

  return lines.join("\n");
}

/**
 * Opens a customer→shop WhatsApp chat prefilled with the order.
 * Returns false if the shop number is not configured.
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

/** Click-to-chat URL for general customer enquiries (footer / contact). */
export function getShopWhatsAppChatUrl(prefillMessage?: string): string | null {
  if (!WHATSAPP_NUMBER) return null;
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  if (!prefillMessage?.trim()) return base;
  return `${base}?text=${encodeURIComponent(prefillMessage.trim())}`;
}
