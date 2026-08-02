"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";
import {
  FPS_ACCOUNT_NAME,
  FPS_ID,
  FPS_QR_SRC,
  formatFpsDisplayId,
} from "@/lib/fps";
import { formatMoney } from "@/lib/i18n/translations";

type FpsDetailsProps = {
  amountHkd: number;
};

/**
 * FPS receiving details + QR — only rendered inside checkout PaymentMethods
 * when the guest selects FPS.
 */
export function FpsDetails({ amountHkd }: FpsDetailsProps) {
  const { locale, t } = useI18n();

  return (
    <div
      className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--accent-soft)]/40 p-4"
      data-fps-panel="checkout-only"
    >
      <h3 className="text-sm font-semibold text-[color:var(--ink)]">
        {t("fpsPanelTitle")}
      </h3>
      <p className="mt-1 text-xs text-[color:var(--muted)]">{t("fpsPanelHint")}</p>

      <dl className="mt-3 space-y-2 text-sm">
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

      <div className="mt-4 flex flex-col items-center gap-2">
        <div className="flex h-44 w-44 items-center justify-center overflow-hidden rounded-xl bg-white p-2 ring-1 ring-[color:var(--line)]">
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
  );
}
