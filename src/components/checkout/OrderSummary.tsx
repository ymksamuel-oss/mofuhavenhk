"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";
import { formatMoney } from "@/lib/i18n/translations";

const LINE_ITEMS = [
  { key: "itemMofu" as const, qty: 2, unit: 48 },
  { key: "itemMatcha" as const, qty: 1, unit: 58 },
  { key: "itemMango" as const, qty: 1, unit: 62 },
];

const SHIPPING = 25;

export function OrderSummary() {
  const { locale, t } = useI18n();

  const subtotal = LINE_ITEMS.reduce(
    (sum, item) => sum + item.qty * item.unit,
    0,
  );
  const total = subtotal + SHIPPING;

  return (
    <section aria-labelledby="summary-title" className="space-y-4">
      <h2
        id="summary-title"
        className="font-[family-name:var(--font-display)] text-xl text-[color:var(--ink)]"
      >
        {t("orderSummary")}
      </h2>

      <ul className="divide-y divide-[color:var(--line)] border-y border-[color:var(--line)]">
        {LINE_ITEMS.map((item) => (
          <li
            key={item.key}
            className="flex items-start justify-between gap-4 py-3 text-sm"
          >
            <div>
              <p className="font-medium text-[color:var(--ink)]">
                {t(item.key)}
              </p>
              <p className="text-[color:var(--muted)]">
                {t("qty")} {item.qty}
              </p>
            </div>
            <p className="shrink-0 tabular-nums text-[color:var(--ink)]">
              {formatMoney(item.qty * item.unit, locale)}
            </p>
          </li>
        ))}
      </ul>

      <dl className="space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-[color:var(--muted)]">{t("subtotal")}</dt>
          <dd className="tabular-nums text-[color:var(--ink)]">
            {formatMoney(subtotal, locale)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-[color:var(--muted)]">
            {t("shipping")}
            <span className="mt-0.5 block text-xs">{t("shippingNote")}</span>
          </dt>
          <dd className="tabular-nums text-[color:var(--ink)]">
            {formatMoney(SHIPPING, locale)}
          </dd>
        </div>
        <div className="flex justify-between gap-4 border-t border-[color:var(--line)] pt-3 text-base font-semibold">
          <dt className="text-[color:var(--ink)]">{t("total")}</dt>
          <dd className="tabular-nums text-[color:var(--ink)]">
            {formatMoney(total, locale)}
          </dd>
        </div>
      </dl>
    </section>
  );
}
