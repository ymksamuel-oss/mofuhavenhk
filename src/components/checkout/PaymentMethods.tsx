"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";
import { ApplePayLogo, CardLogo, OctopusLogo } from "@/components/icons/PaymentIcons";

export type MethodId = "card" | "applepay" | "fps" | "alipay" | "octopus";

export type PaymentMethodDef = {
  id: MethodId;
  labelKey: "payCard" | "payApplePay" | "payFps" | "payAlipay" | "payOctopus";
  Icon: typeof OctopusLogo;
};

// Only Credit Card and Apple Pay are offered for now. FPS, Alipay and
// Octopus are commented out (not removed) so they can be re-enabled later.
export const PAYMENT_METHODS: PaymentMethodDef[] = [
  { id: "card", labelKey: "payCard", Icon: CardLogo },
  { id: "applepay", labelKey: "payApplePay", Icon: ApplePayLogo },
  // { id: "fps", labelKey: "payFps", Icon: FpsLogo },
  // { id: "alipay", labelKey: "payAlipay", Icon: AlipayLogo },
  // { id: "octopus", labelKey: "payOctopus", Icon: OctopusLogo },
];

type PaymentMethodsProps = {
  selected: MethodId;
  onSelect: (id: MethodId) => void;
};

export function PaymentMethods({ selected, onSelect }: PaymentMethodsProps) {
  const { t } = useI18n();

  return (
    <section aria-labelledby="payment-title" className="space-y-4">
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
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onSelect(id)}
                className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition ${
                  active
                    ? "border-[color:var(--accent)] bg-[color:var(--accent-soft)]"
                    : "border-[color:var(--line)] bg-[color:var(--surface)] hover:border-[color:var(--accent)]/50"
                }`}
                aria-pressed={active}
              >
                {/*
                  Fix: payment icon border clipping —
                  padding + items-center + overflow:visible keep 24px marks inside the border.
                */}
                <span
                  className="flex h-10 min-w-14 items-center justify-center overflow-visible rounded-md border border-[color:var(--line)] bg-white px-2.5 py-1.5"
                  style={{ overflow: "visible" }}
                >
                  <Icon />
                </span>
                <span className="text-sm font-medium text-[color:var(--ink)]">
                  {t(labelKey)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
