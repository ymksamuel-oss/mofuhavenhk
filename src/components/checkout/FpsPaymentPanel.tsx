"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";

type FpsPaymentPanelProps = {
  onConfirm: () => void;
  confirming?: boolean;
  confirmed?: boolean;
};

/**
 * FPS confirm CTA for the checkout order column.
 * Receiving details / QR live under PaymentMethods (FpsDetails).
 */
export function FpsPaymentPanel({
  onConfirm,
  confirming = false,
  confirmed = false,
}: FpsPaymentPanelProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element -- local official FPS mark asset */}
        <img
          src="/fps-logo.svg"
          alt="Faster Payment System (FPS) 轉數快 Logo"
          className="h-12 w-auto"
          decoding="async"
        />
      </div>

      {!confirmed ? (
        <button
          type="button"
          onClick={onConfirm}
          disabled={confirming}
          className="w-full rounded-2xl bg-[color:var(--accent)] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(169,124,80,0.7)] transition hover:bg-[color:var(--hero-deep)] hover:shadow-[0_14px_28px_-10px_rgba(92,58,34,0.6)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {confirming ? t("fpsConfirming") : t("fpsConfirmOrder")}
        </button>
      ) : (
        <p className="rounded-xl bg-emerald-50 px-3 py-2 text-center text-xs font-medium text-emerald-700">
          {t("fpsConfirmSuccess")}
        </p>
      )}

      <p className="text-center text-[11px] text-[color:var(--muted)]">
        {t("fpsWhatsappHint")}
      </p>
    </div>
  );
}
