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
  /** Remove a line item entirely from the order. */
  onRemoveItem?: (id: string) => void;
  qtyDisabled?: boolean;
};

function TrashIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 7h16"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 7l.8 12.2A1.5 1.5 0 0 0 8.8 20.5h6.4a1.5 1.5 0 0 0 1.5-1.3L17.5 7"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M10 11v6M14 11v6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function OrderSummary({
  items,
  onQtyChange,
  onRemoveItem,
  qtyDisabled = false,
}: OrderSummaryProps) {
  const { locale, t } = useI18n();

  const subtotal = calcSubtotal(items);
  const total = subtotal + SHIPPING;
  const editable = Boolean(onQtyChange) && !qtyDisabled;
  const canRemove = Boolean(onRemoveItem) && !qtyDisabled;

  return (
    <section aria-labelledby="summary-title" className="space-y-5">
      <h2
        id="summary-title"
        className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-[-0.01em] text-[color:var(--ink)] sm:text-[1.35rem]"
      >
        {t("orderSummary")}
      </h2>

      <ul className="divide-y divide-[color:var(--line)] border-y border-[color:var(--line)]">
        {items.length === 0 ? (
          <li className="py-6 text-center text-sm leading-relaxed text-[color:var(--muted)]">
            {locale === "zh" ? "購物車未有商品" : "Your cart is empty"}
          </li>
        ) : null}

        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-start justify-between gap-3 py-3.5 text-sm"
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
                <div className="min-w-0 space-y-0.5">
                  <p className="font-medium leading-snug tracking-[0.01em] text-[color:var(--ink)]">
                    {item.name[locale]}
                  </p>
                  <p className="text-xs leading-relaxed tracking-[0.01em] text-[color:var(--muted)]">
                    {formatMoney(item.unit, locale)}/{t("unitPriceSuffix")}
                  </p>
                </div>
                {editable ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <div
                      className="inline-flex items-center gap-1 rounded-full border border-[color:var(--line)] bg-white p-0.5"
                      role="group"
                      aria-label={`${t("qty")} ${item.name[locale]}`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          onQtyChange?.(
                            item.id,
                            Math.max(MIN_QTY, item.qty - 1),
                          )
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
                          onQtyChange?.(
                            item.id,
                            Math.min(MAX_QTY, item.qty + 1),
                          )
                        }
                        disabled={item.qty >= MAX_QTY}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-base font-semibold text-[color:var(--ink)] transition hover:bg-[color:var(--accent-soft)] disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label={t("qtyIncrease")}
                      >
                        +
                      </button>
                    </div>

                    {canRemove ? (
                      <button
                        type="button"
                        onClick={() => onRemoveItem?.(item.id)}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--line)] bg-white text-[#8a3a2a] transition hover:border-[#c45a45] hover:bg-[#fdeceb] hover:text-[#6b2418] active:scale-[0.97]"
                        aria-label={`${t("removeItem")}：${item.name[locale]}`}
                        title={t("removeItem")}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                ) : (
                  <p className="text-[color:var(--muted)]">
                    {t("qty")} {item.qty}
                  </p>
                )}
              </div>
            </div>
            <p className="shrink-0 text-[0.95rem] font-medium tabular-nums tracking-[0.01em] text-[color:var(--ink)]">
              {formatMoney(item.qty * item.unit, locale)}
            </p>
          </li>
        ))}
      </ul>

      <dl className="space-y-2.5 text-sm leading-relaxed">
        <div className="flex justify-between gap-4">
          <dt className="tracking-[0.01em] text-[color:var(--muted)]">
            {t("subtotal")}
          </dt>
          <dd className="tabular-nums tracking-[0.01em] text-[color:var(--ink)]">
            {formatMoney(subtotal, locale)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="tracking-[0.01em] text-[color:var(--muted)]">
            {t("shipping")}
            <span className="mt-0.5 block text-xs leading-relaxed">
              {t("shippingNote")}
            </span>
          </dt>
          <dd className="tabular-nums tracking-[0.01em] text-[color:var(--ink)]">
            {formatMoney(items.length > 0 ? SHIPPING : 0, locale)}
          </dd>
        </div>
        <div className="flex justify-between gap-4 border-t border-[color:var(--line)] pt-3.5 text-base font-semibold tracking-[-0.01em]">
          <dt className="text-[color:var(--ink)]">{t("total")}</dt>
          <dd className="tabular-nums text-[color:var(--ink)]">
            {formatMoney(items.length > 0 ? total : 0, locale)}
          </dd>
        </div>
      </dl>
    </section>
  );
}
