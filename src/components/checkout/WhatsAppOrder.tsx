"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";
import { WhatsAppLogo } from "@/components/icons/PaymentIcons";

type WhatsAppOrderProps = {
  orderNumber: string | null;
  onSend: () => void;
};

export function WhatsAppOrder({ orderNumber, onSend }: WhatsAppOrderProps) {
  const { t } = useI18n();

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
        onClick={onSend}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#25D366] bg-[#25D366]/10 px-4 py-3 text-sm font-semibold text-[#128C7E] transition hover:bg-[#25D366]/20"
      >
        <WhatsAppLogo />
        {t("whatsappOrderCta")}
      </button>
    </section>
  );
}
