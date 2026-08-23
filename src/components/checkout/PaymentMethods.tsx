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
  | "alipayhk"

export type PaymentMethodDef = {
  id: MethodId;
  labelKey:
    | "payCard"
    | "payApplePay"
    | "payGooglePay"
    | "payPayMe"
    | "payAlipayHk"
  Icon:
    | typeof CardLogo
    | typeof ApplePayLogo
    | typeof GooglePayLogo
    | typeof PayMeLogo
    | typeof AlipayHkLogo
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

      <ul className="grid grid-cols-1 gap-3">
        {PAYMENT_METHODS.map(({ id, labelKey, Icon }) => {
          const active = selected === id;

          return (
            <li key={id} className="min-w-0">
              <button
                type="button"
                onClick={() => onSelect(id)}
                aria-label={t(labelKey)}
                title={t(labelKey)}
                className={`grid min-h-[4.5rem] w-full grid-cols-[minmax(0,1fr)_1.125rem] items-center gap-x-3 px-1 py-3 text-left transition duration-200 focus-visible:rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 sm:min-h-[4.75rem] sm:gap-x-4 sm:px-2 ${
                  active
                    ? "text-[color:var(--ink)]"
                    : "text-[color:var(--muted)] hover:text-[color:var(--ink)]"
                }`}
                aria-pressed={active}
              >
                <span
                  className="flex h-9 w-full min-w-0 items-center justify-start overflow-visible"
                  aria-hidden="true"
                >
                  <Icon
                    className={
                      id === "alipayhk"
                        ? "!h-5 max-w-full !w-auto"
                        : ""
                    }
                  />
                </span>

                <span className="sr-only">{t(labelKey)}</span>

                <span
                  className={`h-[1.125rem] w-[1.125rem] rounded-full border-[1.5px] transition ${
                    active
                      ? "border-[color:var(--accent)] bg-[color:var(--accent)] shadow-[inset_0_0_0_2px_var(--surface)]"
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
