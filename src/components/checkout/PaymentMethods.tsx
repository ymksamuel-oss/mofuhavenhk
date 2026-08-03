"use client";

import type { ReactNode } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { ApplePayLogo, CardLogo } from "@/components/icons/PaymentIcons";

export type MethodId = "card" | "applepay" | "fps";

export type PaymentMethodDef = {
  id: MethodId;
  labelKey: "payCard" | "payApplePay" | "payFps";
  Icon?: typeof CardLogo;
};

export const PAYMENT_METHODS: PaymentMethodDef[] = [
  { id: "card", labelKey: "payCard", Icon: CardLogo },
  { id: "applepay", labelKey: "payApplePay", Icon: ApplePayLogo },
  { id: "fps", labelKey: "payFps" },
];

type PaymentMethodsProps = {
  selected: MethodId;
  onSelect: (id: MethodId) => void;
  /** Interactive payee menu from checkout/page.tsx — shown under FPS when selected. */
  fpsPanel?: ReactNode;
};

export function PaymentMethods({
  selected,
  onSelect,
  fpsPanel,
}: PaymentMethodsProps) {
  const { t } = useI18n();

  return (
    <section
      aria-labelledby="payment-title"
      className="milk-tea-card space-y-4 p-5 sm:p-6"
    >
      <div>
        <h2
          id="payment-title"
          className="font-[family-name:var(--font-display)] text-xl text-[color:var(--ink)]"
        >
          {t("paymentTitle")}
        </h2>
        <p className="mt-1 text-sm text-[color:var(--muted)]">
          {t("paymentHint")}
        </p>
      </div>

      <ul className="space-y-3">
        {PAYMENT_METHODS.map(({ id, labelKey, Icon }) => {
          const active = selected === id;
          const isFps = id === "fps";

          return (
            <li key={id} className="space-y-3">
              <button
                type="button"
                onClick={() => onSelect(id)}
                className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition ${
                  active
                    ? "border-[color:var(--accent)] bg-[color:var(--accent-soft)] shadow-[0_6px_16px_-8px_rgba(169,124,80,0.55)]"
                    : "border-[color:var(--line)] bg-[color:var(--surface)] hover:border-[color:var(--accent)]/50 hover:bg-[color:var(--accent-soft)]/40"
                }`}
                aria-pressed={active}
              >
                <span className="flex h-10 w-12 shrink-0 items-center justify-center rounded-lg border border-[color:var(--line)] bg-white px-1">
                  {isFps ? (
                    // eslint-disable-next-line @next/next/no-img-element -- official blue double-arrow 轉數快 mark
                    <img
                      src="/images/fps-official-logo.png"
                      alt="轉數快 FPS"
                      width={32}
                      height={32}
                      className="h-8 w-8 object-contain"
                    />
                  ) : Icon ? (
                    <Icon />
                  ) : null}
                </span>

                <span className="min-w-0 flex-1 text-left text-sm font-medium whitespace-nowrap text-[color:var(--ink)]">
                  {isFps ? "SC Pay 轉數快" : t(labelKey)}
                </span>

                <span
                  className={`ml-auto h-4 w-4 shrink-0 rounded-full border transition ${
                    active
                      ? "border-[color:var(--accent)] bg-[color:var(--accent)]"
                      : "border-[color:var(--line)] bg-transparent"
                  }`}
                  aria-hidden="true"
                />
              </button>

              {isFps && active ? fpsPanel : null}
            </li>
          );
        })}
      </ul>

      <p className="text-xs leading-relaxed text-[color:var(--muted)]">
        {selected === "fps" ? t("fpsMethodsNote") : t("stripeMethodsNote")}
      </p>
    </section>
  );
}
