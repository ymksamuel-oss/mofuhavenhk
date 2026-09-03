"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";
import {
  AlipayHkLogo,
  ApplePayLogo,
  GooglePayLogo,
  MastercardLogo,
  PayMeLogo,
  VisaLogo,
} from "@/components/icons/PaymentIcons";

export type MethodId =
  | "visa"
  | "mastercard"
  | "applepay"
  | "googlepay"
  | "payme"
  | "alipayhk";

export type PaymentMethodDef = {
  id: MethodId;
  labelKey:
    | "payVisa"
    | "payMastercard"
    | "payApplePay"
    | "payGooglePay"
    | "payPayMe"
    | "payAlipayHk";
  Icon:
    | typeof VisaLogo
    | typeof MastercardLogo
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
  { id: "applepay", labelKey: "payApplePay", Icon: ApplePayLogo },
  { id: "googlepay", labelKey: "payGooglePay", Icon: GooglePayLogo },
  { id: "payme", labelKey: "payPayMe", Icon: PayMeLogo },
  { id: "alipayhk", labelKey: "payAlipayHk", Icon: AlipayHkLogo },
  { id: "visa", labelKey: "payVisa", Icon: VisaLogo },
  { id: "mastercard", labelKey: "payMastercard", Icon: MastercardLogo },
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
        className="grid grid-cols-3 gap-1.5 sm:gap-2"
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
                className={`relative flex min-h-[3.75rem] w-full flex-col items-center justify-center gap-1 rounded-lg border px-1.5 py-2 text-center transition duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 sm:min-h-[4.25rem] sm:gap-1.5 sm:px-2 sm:py-2.5 ${
                  active
                    ? "border-[color:var(--accent)] bg-[color:var(--accent)]/[0.06] text-[color:var(--ink)]"
                    : "border-[color:var(--line)] bg-[color:var(--surface)] text-[color:var(--muted)] hover:border-[color:var(--accent)]/50 hover:bg-[color:var(--surface)] hover:text-[color:var(--ink)]"
                }`}
              >
                <span
                  className="flex h-8 w-full min-w-0 items-center justify-center overflow-visible sm:h-9"
                  aria-hidden="true"
                >
                  <Icon
                    className={`${
                      id === "mastercard"
                        ? "!h-8 !max-h-8 sm:!h-9 sm:!max-h-9"
                        : "!h-5 !max-h-5 sm:!h-6 sm:!max-h-6"
                    } !w-auto shrink-0 object-contain`}
                  />
                </span>

                <span className="sr-only">{t(labelKey)}</span>

                <span
                  className={`absolute right-1.5 top-1.5 h-3 w-3 rounded-full border transition sm:right-2 sm:top-2 ${
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
      <div className="space-y-1 text-xs leading-relaxed text-[color:var(--muted)]">
        {selected === "payme" ? (
          <p className="font-medium text-[color:var(--ink)]">{t("payMeDirectNote")}</p>
        ) : (
          <>
            <p className="font-medium text-[color:var(--ink)]">{t("stripeMethodsPrimary")}</p>
            <p>{t("stripeMethodsEligibility")}</p>
          </>
        )}
      </div>
    </section>
  );
}
