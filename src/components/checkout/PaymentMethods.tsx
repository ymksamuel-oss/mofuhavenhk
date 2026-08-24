"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";
import {
  AlipayHkLogo,
  ApplePayLogo,
  CardLogo,
  GooglePayLogo,
  PayMeLogo,
} from "@/components/icons/PaymentIcons";

export type MethodId =
  | "card"
  | "applepay"
  | "googlepay"
  | "payme"
  | "alipayhk";

export type PaymentMethodDef = {
  id: MethodId;
  labelKey:
    | "payCard"
    | "payApplePay"
    | "payGooglePay"
    | "payPayMe"
    | "payAlipayHk";
  Icon:
    | typeof CardLogo
    | typeof ApplePayLogo
    | typeof GooglePayLogo
    | typeof PayMeLogo
    | typeof AlipayHkLogo;
};

/**
 * Hosted Checkout options are listed explicitly so shoppers know what to look
 * for on Stripe's next page. Stripe still decides actual availability from
 * Dashboard settings, device, browser, country and currency eligibility.
 */
export const PAYMENT_METHODS: PaymentMethodDef[] = [
  { id: "googlepay", labelKey: "payGooglePay", Icon: GooglePayLogo },
  { id: "payme", labelKey: "payPayMe", Icon: PayMeLogo },
  { id: "applepay", labelKey: "payApplePay", Icon: ApplePayLogo },
  { id: "alipayhk", labelKey: "payAlipayHk", Icon: AlipayHkLogo },
  { id: "card", labelKey: "payCard", Icon: CardLogo },
];

type PaymentMethodsProps = {
  selected: MethodId;
  onSelect: (id: MethodId) => void;
};

export function PaymentMethods({ selected, onSelect }: PaymentMethodsProps) {
  const { t } = useI18n();

  return (
    <section
      aria-labelledby="payment-title"
      className="milk-tea-card max-w-full space-y-5 p-5 sm:p-6"
    >
      <div className="space-y-1.5">
        <h2
          id="payment-title"
          className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-[-0.015em] text-[color:var(--ink)] sm:text-[1.35rem]"
        >
          {t("paymentTitle")}
        </h2>
        <p className="text-sm leading-relaxed tracking-[0.005em] text-[color:var(--muted)]">
          {t("paymentHint")}
        </p>
      </div>

      <ul
        className="grid grid-cols-1 gap-3"
        role="radiogroup"
        aria-label={t("paymentTitle")}
      >
        {PAYMENT_METHODS.map(({ id, labelKey, Icon }) => {
          const active = selected === id;

          return (
            <li key={id} className="min-w-0">
              <button
                type="button"
                role="radio"
                onClick={() => onSelect(id)}
                aria-label={t(labelKey)}
                aria-checked={active}
                aria-pressed={active}
                title={t(labelKey)}
                className={`grid min-h-[4.75rem] w-full grid-cols-[minmax(0,1fr)_1.25rem] items-center gap-x-4 rounded-2xl border px-4 py-3.5 text-left transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 sm:min-h-[5rem] sm:px-5 ${
                  active
                    ? "border-[color:var(--accent)] bg-[color:var(--accent)]/[0.07] text-[color:var(--ink)] shadow-[0_8px_22px_rgba(92,67,48,0.10)]"
                    : "border-[color:var(--line)] bg-[color:var(--surface)] text-[color:var(--muted)] shadow-[0_3px_12px_rgba(92,67,48,0.04)] hover:border-[color:var(--accent)]/50 hover:bg-[color:var(--surface)] hover:text-[color:var(--ink)]"
                }`}
              >
                <span
                  className="flex h-8 w-full min-w-0 items-center justify-start overflow-visible sm:h-9"
                  aria-hidden="true"
                >
                  <Icon className="!h-7 !max-h-7 !w-auto shrink-0 object-contain" />
                </span>

                <span className="sr-only">{t(labelKey)}</span>

                <span
                  className={`h-5 w-5 rounded-full border-2 transition ${
                    active
                      ? "border-[color:var(--accent)] bg-[color:var(--accent)] shadow-[inset_0_0_0_3px_var(--surface)]"
                      : "border-[color:var(--line)] bg-transparent"
                  }`}
                  aria-hidden="true"
                />
              </button>
            </li>
          );
        })}
      </ul>
      <p className="text-xs leading-relaxed text-[color:var(--muted)]">
        {t("stripeMethodsNote")}
      </p>
    </section>
  );
}
