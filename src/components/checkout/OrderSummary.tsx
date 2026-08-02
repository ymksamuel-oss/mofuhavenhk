"use client";

import Image from "next/image";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { formatMoney } from "@/lib/i18n/translations";
import {
  calcSubtotal,
  MAX_QTY,
  MIN_QTY,
  SHIPPING,
  type OrderItem,
} from "@/lib/order";

type OrderSummaryProps = {
  items: OrderItem[];
  onQtyChange?: (id: string, qty: number) => void;
  qtyDisabled?: boolean;
};

export function OrderSummary({
  items,
  onQtyChange,
  qtyDisabled = false,
}: OrderSummaryProps) {
  const { locale, t } = useI18n();

  const subtotal = calcSubtotal(items);
  const total = subtotal + SHIPPING;
  const editable = Boolean(onQtyChange) && !qtyDisabled;

  return (
    <section aria-labelledby="summary-title" className="space-y-4">
      <h2
        id="summary-title"
        className="font-[family-name:var(--font-display)] text-xl text-[color:var(--ink)]"
      >
        {t("orderSummary")}
      </h2>

      <ul className="divide-y divide-[color:var(--line)] border-y border-[color:var(--line)]">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-start justify-between gap-3 py-3 text-sm"
          >
            <div className="flex min-w-0 items-start gap-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[color:var(--background)] ring-1 ring-[color:var(--line)]">
                <Image
                  src={item.image}
                  alt={item.name[locale]}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 space-y-2">
                <p className="font-medium text-[color:var(--ink)]">
                  {item.name[locale]}
                </p>
                {editable ? (
                  <div
                    className="inline-flex items-center gap-1 rounded-full border border-[color:var(--line)] bg-white p-0.5"
                    role="group"
                    aria-label={`${t("qty")} ${item.name[locale]}`}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        onQtyChange?.(item.id, Math.max(MIN_QTY, item.qty - 1))
                      }
                      disabled={item.qty <= MIN_QTY}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-base font-semibold text-[color:var(--ink)] transition hover:bg-[color:var(--accent-soft)] disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label={t("qtyDecrease")}
                    >
                      −
                    </button>
                    <span className="min-w-8 text-center tabular-nums font-medium text-[color:var(--ink)]">
                      {item.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        onQtyChange?.(item.id, Math.min(MAX_QTY, item.qty + 1))
                      }
                      disabled={item.qty >= MAX_QTY}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-base font-semibold text-[color:var(--ink)] transition hover:bg-[color:var(--accent-soft)] disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label={t("qtyIncrease")}
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <p className="text-[color:var(--muted)]">
                    {t("qty")} {item.qty}
                  </p>
                )}
              </div>
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
