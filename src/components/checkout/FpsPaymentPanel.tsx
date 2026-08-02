"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";
import {
  FPS_ACCOUNT_NAME,
  FPS_ID,
  FPS_QR_SRC,
  formatFpsDisplayId,
} from "@/lib/fps";
import { formatMoney } from "@/lib/i18n/translations";

type FpsPaymentPanelProps = {
  amountHkd: number;
  onConfirm: () => void;
  confirming?: boolean;
  confirmed?: boolean;
};

export function FpsPaymentPanel({
  amountHkd,
  onConfirm,
  confirming = false,
  confirmed = false,
}: FpsPaymentPanelProps) {
  const { locale, t } = useI18n();

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--accent-soft)]/35 p-4 sm:p-5">
        <h3 className="font-[family-name:var(--font-display)] text-base font-semibold text-[color:var(--ink)]">
          {t("fpsPanelTitle")}
        </h3>
        <p className="mt-1 text-sm text-[color:var(--muted)]">
          {t("fpsPanelHint")}
        </p>

        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-[color:var(--muted)]">{t("fpsIdLabel")}</dt>
            <dd className="font-medium tabular-nums text-[color:var(--ink)]">
              {formatFpsDisplayId(FPS_ID)}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-[color:var(--muted)]">{t("fpsAccountLabel")}</dt>
            <dd className="font-medium text-[color:var(--ink)]">
              {FPS_ACCOUNT_NAME}
            </dd>
          </div>
          <div className="flex justify-between gap-3 border-t border-[color:var(--line)] pt-2">
            <dt className="text-[color:var(--muted)]">{t("fpsAmountLabel")}</dt>
            <dd className="font-semibold tabular-nums text-[color:var(--ink)]">
              {formatMoney(amountHkd, locale)}
            </dd>
          </div>
        </dl>

        <div className="mt-5 flex flex-col items-center gap-2">
          <div className="flex h-48 w-48 items-center justify-center overflow-hidden rounded-2xl bg-white p-3 ring-1 ring-[color:var(--line)] sm:h-56 sm:w-56">
            {/* eslint-disable-next-line @next/next/no-img-element -- local SVG / shop QR asset */}
            <img
              src={FPS_QR_SRC}
              alt={t("fpsQrAlt")}
              className="h-full w-full object-contain"
            />
          </div>
          <p className="text-center text-[11px] text-[color:var(--muted)]">
            {t("fpsQrHint")}
          </p>
        </div>
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
