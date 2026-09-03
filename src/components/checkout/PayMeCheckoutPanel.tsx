"use client";

import Image from "next/image";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { formatMoney } from "@/lib/i18n/translations";
import type { PayMeCheckoutSettings } from "@/lib/payme-checkout-settings";

type PayMeCheckoutPanelProps = {
  settings: PayMeCheckoutSettings;
  totalHkd: number;
  orderNumber: string | null;
  onBeforeOpen: () => boolean;
  onConfirmPayment: () => void;
};

export function PayMeCheckoutPanel({
  settings,
  totalHkd,
  orderNumber,
  onBeforeOpen,
  onConfirmPayment,
}: PayMeCheckoutPanelProps) {
  const { locale, t } = useI18n();
  const ready = Boolean(settings.payLink && settings.payCodeImageUrl);

  if (!ready || !settings.payLink || !settings.payCodeImageUrl) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm leading-relaxed text-amber-900">
        <p className="font-semibold">{t("payMeUnavailableTitle")}</p>
        <p className="mt-1 text-amber-800">{t("payMeUnavailableBody")}</p>
      </div>
    );
  }

  return (
    <section
      aria-labelledby="payme-express-title"
      className="overflow-hidden rounded-2xl border border-[#f2c6cb] bg-[linear-gradient(145deg,#fff9f8_0%,#fff4f4_52%,#ffffff_100%)] p-4 shadow-[0_16px_34px_-28px_rgba(184,32,48,0.55)] sm:p-5"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e72a3a] text-lg font-black text-white shadow-sm" aria-hidden="true">P</span>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#b3192c]">{t("payMeExpressEyebrow")}</p>
          <h2 id="payme-express-title" className="mt-0.5 text-lg font-semibold tracking-[-0.01em] text-[color:var(--ink)]">
            {t("payMeExpressTitle")}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-[color:var(--muted)]">{t("payMeExpressIntro")}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 rounded-xl border border-white/90 bg-white/80 p-3 text-sm sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium text-[color:var(--muted)]">{t("total")}</p>
          <p className="mt-0.5 text-xl font-bold tabular-nums text-[color:var(--ink)]">{formatMoney(totalHkd, locale)}</p>
        </div>
        <div className="sm:text-right">
          <p className="text-xs font-medium text-[color:var(--muted)]">{t("orderNumber")}</p>
          <p className="mt-0.5 break-all font-semibold tracking-[0.02em] text-[color:var(--ink)]">{orderNumber || "—"}</p>
        </div>
      </div>

      <a
        href={settings.payLink}
        onClick={(event) => {
          if (!onBeforeOpen()) event.preventDefault();
        }}
        className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#e72a3a] px-4 py-3 text-center text-sm font-bold text-white shadow-[0_12px_24px_-14px_rgba(199,27,44,0.8)] transition hover:bg-[#c9192d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e72a3a] focus-visible:ring-offset-2 active:scale-[0.99]"
      >
        <span aria-hidden="true">↗</span>
        {t("payMeOpenAppCta")}
      </a>
      <p className="mt-2 text-center text-xs leading-relaxed text-[color:var(--muted)]">{t("payMeOpenAppHint")}</p>

      <div className="mt-5 border-t border-[#f4d8da] pt-4">
        <p className="text-sm font-semibold text-[color:var(--ink)]">{t("payMePayCodeTitle")}</p>
        <p className="mt-1 text-xs leading-relaxed text-[color:var(--muted)]">{t("payMePayCodeHint")}</p>
        <div className="mx-auto mt-3 max-w-[14rem] overflow-hidden rounded-2xl border border-[#f2dddd] bg-white p-1.5 shadow-sm">
          <Image
            src={settings.payCodeImageUrl}
            alt={t("payMePayCodeAlt").replace("{merchant}", settings.merchantName || "Mofu Havenhk")}
            width={944}
            height={2048}
            sizes="224px"
            className="h-auto w-full rounded-xl"
          />
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-[#fff1f2] p-3 text-xs leading-relaxed text-[#7e2632]">
        <p className="font-semibold">{t("payMeVerificationTitle")}</p>
        <p className="mt-1">{t("payMeVerificationBody")}</p>
        <button
          type="button"
          onClick={onConfirmPayment}
          className="mt-3 inline-flex min-h-10 items-center justify-center rounded-lg border border-[#e72a3a]/35 bg-white px-3 py-2 text-xs font-semibold text-[#b3192c] transition hover:border-[#e72a3a] hover:bg-[#fff8f8]"
        >
          {t("payMeConfirmCta")}
        </button>
      </div>
    </section>
  );
}
