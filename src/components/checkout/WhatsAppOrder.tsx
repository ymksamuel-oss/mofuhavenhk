"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { formatMoney } from "@/lib/i18n/translations";
import { WhatsAppLogo } from "@/components/icons/PaymentIcons";
import { calcSubtotal, generateOrderNumber, LINE_ITEMS, SHIPPING } from "@/lib/order";

// Set NEXT_PUBLIC_WHATSAPP_NUMBER (e.g. "85212345678") to open the chat
// directly with the shop's WhatsApp number. Falls back to a generic
// "share to WhatsApp" link if not configured.
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";

export function WhatsAppOrder() {
  const { locale, t } = useI18n();
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  useEffect(() => {
    setOrderNumber(generateOrderNumber());
  }, []);

  const subtotal = calcSubtotal(LINE_ITEMS);
  const total = subtotal + SHIPPING;

  const handleClick = () => {
    const number = orderNumber ?? generateOrderNumber();
    const lines = [
      `${t("whatsappGreeting")} ${number}`,
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
    const text = encodeURIComponent(lines.join("\n"));
    const base = WHATSAPP_NUMBER
      ? `https://wa.me/${WHATSAPP_NUMBER}`
      : "https://api.whatsapp.com/send";
    window.open(`${base}?text=${text}`, "_blank", "noopener,noreferrer");
  };

  return (
    <section
      aria-labelledby="whatsapp-order-title"
      className="space-y-3 rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] p-5 sm:p-6"
    >
      <h2
        id="whatsapp-order-title"
        className="font-[family-name:var(--font-display)] text-lg text-[color:var(--ink)]"
      >
        {t("whatsappOrderTitle")}
      </h2>
      <p className="text-sm text-[color:var(--muted)]">
        {t("whatsappOrderHint")}
      </p>
      <p className="text-xs text-[color:var(--muted)]">
        {t("orderNumber")}:{" "}
        <span className="font-medium tabular-nums text-[color:var(--ink)]">
          {orderNumber ?? "—"}
        </span>
      </p>
      <button
        type="button"
        onClick={handleClick}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#25D366] bg-[#25D366]/10 px-4 py-3 text-sm font-semibold text-[#128C7E] transition hover:bg-[#25D366]/20"
      >
        <WhatsAppLogo />
        {t("whatsappOrderCta")}
      </button>
    </section>
  );
}
