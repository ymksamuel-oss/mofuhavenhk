"use client";

import { ProductImage } from "@/components/product/ProductImage";
import { FreeShippingProgress } from "@/components/shipping/FreeShippingProgress";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { formatMoney } from "@/lib/i18n/translations";
import {
  calcSubtotal,
  calcBulkDiscount,
  calcOriginalSubtotal,
  MAX_QTY,
  MIN_QTY,
  getShippingCost,
  orderItemTotal,
  orderItemPricing,
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
  const originalSubtotal = calcOriginalSubtotal(items);
  const bulkDiscount = calcBulkDiscount(items);
  const shipping = getShippingCost(subtotal, items.length > 0);
  const total = subtotal + shipping;
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

      <FreeShippingProgress subtotal={subtotal} showContinueShoppingLink />

      <ul className="space-y-3">
        {items.length === 0 ? (
          <li className="py-6 text-center text-sm leading-relaxed text-[color:var(--muted)]">
            {t("cartDrawerEmpty")}
          </li>
        ) : null}

        {items.map((item) => (
          <li
            key={item.lineKey}
            className="flex items-start justify-between gap-3 rounded-2xl border border-[color:var(--line)] bg-[color:var(--background)] px-4 py-4 text-sm"
          >
            <div className="flex min-w-0 items-start gap-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[color:var(--background)] ring-1 ring-[color:var(--line)]">
                <ProductImage
                  src={item.image}
                  alt={item.name[locale]}
                  sizes="56px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 space-y-2">
                <div className="min-w-0 space-y-0.5">
                  <p className="font-medium leading-snug tracking-[0.01em] text-[color:var(--ink)]">
                    {item.name[locale]}
                  </p>
                  {item.variantLabel ? (
                    <p className="text-xs leading-relaxed tracking-[0.01em] text-[color:var(--muted)]">
                      {item.variantLabel[locale] || t("productValueUnavailable")}
                    </p>
                  ) : null}
                  <p className="text-xs leading-relaxed tracking-[0.01em] text-[color:var(--muted)]">
                    {formatMoney(item.unit, locale)}/{t("unitPriceSuffix")}
                  </p>
                  {orderItemPricing(item).hasDiscount ? (
                    <p className="text-xs font-semibold text-[#c0483a]">
                      {locale === "en"
                        ? `${orderItemPricing(item).discountPercent}% off applied`
                        : `已享 ${orderItemPricing(item).discountPercent === 10 ? "9 折" : "85 折"} 優惠`}
                    </p>
                  ) : null}
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
                            item.lineKey,
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
                            item.lineKey,
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
                        onClick={() => onRemoveItem?.(item.lineKey)}
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
            <div className="shrink-0 text-right tabular-nums tracking-[0.01em]">
              {orderItemPricing(item).hasDiscount ? (
                <p className="text-xs text-[color:var(--muted)] line-through">
                  {formatMoney(orderItemPricing(item).itemOriginalTotal, locale)}
                </p>
              ) : null}
              <p className="text-[0.95rem] font-bold text-[color:var(--ink)]">
                {formatMoney(orderItemTotal(item), locale)}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <dl className="space-y-2.5 text-sm leading-relaxed">
        <div className="flex justify-between gap-4">
          <dt className="tracking-[0.01em] text-[color:var(--muted)]">
            {locale === "en" ? "Original subtotal" : "商品原價小計"}
          </dt>
          <dd className="tabular-nums tracking-[0.01em] text-[color:var(--ink)]">
            {formatMoney(originalSubtotal, locale)}
          </dd>
        </div>
        {bulkDiscount > 0 ? (
          <div className="flex justify-between gap-4">
            <dt className="tracking-[0.01em] text-emerald-700">
              {locale === "en" ? "Bulk discount" : "量販多件折扣"}
            </dt>
            <dd className="font-semibold tabular-nums text-emerald-700">
              - {formatMoney(bulkDiscount, locale)}
            </dd>
          </div>
        ) : null}
        <div className="flex justify-between gap-4">
          <dt className="tracking-[0.01em] text-[color:var(--muted)]">
            {t("shipping")}
            <span className="mt-0.5 block text-xs leading-relaxed">
              {t("shippingNote")}
            </span>
          </dt>
          <dd className="tabular-nums tracking-[0.01em] text-[color:var(--ink)]">
            {formatMoney(shipping, locale)}{shipping === 0 ? ` (${locale === "en" ? "Free over HK$450" : "已滿 HK$450 免運"})` : ""}
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
