"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProductImage } from "@/components/product/ProductImage";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { formatMoney } from "@/lib/i18n/translations";
import { getReceipt, type ReceiptRecord } from "@/lib/receipt";

type ReceiptPageProps = {
  orderNumber: string;
};

export function ReceiptPage({ orderNumber }: ReceiptPageProps) {
  const { locale, t } = useI18n();
  const [receipt, setReceipt] = useState<ReceiptRecord | null>(null);

  useEffect(() => {
    setReceipt(getReceipt(orderNumber));
  }, [orderNumber]);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="mb-4">
        <Link
          href="/"
          className="text-sm font-medium text-[color:var(--muted)] transition hover:text-[color:var(--accent)]"
        >
          ← {t("infoPageBack")}
        </Link>
      </p>

      <article className="overflow-hidden rounded-[1.75rem] border border-[color:var(--line)] bg-[linear-gradient(180deg,#fffaf1_0%,#fdf8ef_45%,#f8f0e2_100%)] shadow-[0_24px_48px_-32px_rgba(74,54,38,0.45)]">
        <header className="border-b border-[color:var(--line)] px-6 py-7 sm:px-8 sm:py-8">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-[color:var(--accent)]">
            {t("receiptEyebrow")}
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-[-0.02em] text-[color:var(--ink)] sm:text-3xl">
            {t("receiptTitle")}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted)]">
            {t("orderNumber")}:{" "}
            <span className="font-semibold text-[color:var(--ink)]">{orderNumber}</span>
          </p>
        </header>

        {!receipt ? (
          <div className="px-6 py-10 text-center sm:px-8">
            <p className="text-[0.95rem] leading-relaxed text-[color:var(--muted)]">
              {t("receiptMissing")}
            </p>
          </div>
        ) : (
          <>
            <section className="grid gap-4 border-b border-[color:var(--line)] px-6 py-6 sm:grid-cols-2 sm:px-8">
              <div className="space-y-1.5">
                <p className="text-xs font-medium uppercase tracking-[0.08em] text-[color:var(--ink)]/70">
                  {t("receiptCustomer")}
                </p>
                <p className="font-medium text-[color:var(--ink)]">{receipt.customerName || "—"}</p>
                <p className="text-sm text-[color:var(--muted)]">
                  {receipt.contact.phoneCountryCode} {receipt.contact.phone}
                </p>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-medium uppercase tracking-[0.08em] text-[color:var(--ink)]/70">
                  {t("receiptPayment")}
                </p>
                <p className="font-medium text-[color:var(--ink)]">{receipt.paymentLabel}</p>
                <p className="text-sm text-[color:var(--muted)]">
                  {new Date(receipt.createdAt).toLocaleString(
                    locale === "zh" ? "zh-HK" : "en-HK",
                  )}
                </p>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <p className="text-xs font-medium uppercase tracking-[0.08em] text-[color:var(--ink)]/70">
                  {t("receiptDelivery")}
                </p>
                <p className="text-sm leading-relaxed text-[color:var(--muted)]">
                  {[receipt.contact.district, receipt.contact.address, receipt.contact.addressLine2]
                    .filter(Boolean)
                    .join("，") || "—"}
                </p>
                {receipt.contact.sfStationCode ? (
                  <p className="text-sm text-[color:var(--muted)]">
                    {t("sfStationLabel")}: {receipt.contact.sfStationCode}
                  </p>
                ) : null}
              </div>
            </section>

            <section className="px-6 py-6 sm:px-8">
              <h2 className="mb-4 font-[family-name:var(--font-display)] text-lg font-semibold text-[color:var(--ink)]">
                {t("receiptItems")}
              </h2>
              <ul className="divide-y divide-[color:var(--line)] border-y border-[color:var(--line)]">
                {receipt.items.map((item) => (
                  <li key={item.id} className="flex items-start justify-between gap-3 py-3.5">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[color:var(--background)] ring-1 ring-[color:var(--line)]">
                        <ProductImage
                          src={item.image}
                          alt={item.name[locale]}
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium leading-snug text-[color:var(--ink)]">
                          {item.name[locale]}
                        </p>
                        <p className="mt-0.5 text-xs text-[color:var(--muted)]">
                          {formatMoney(item.unit, locale)} × {item.qty}
                        </p>
                      </div>
                    </div>
                    <p className="shrink-0 font-medium tabular-nums text-[color:var(--ink)]">
                      {formatMoney(item.unit * item.qty, locale)}
                    </p>
                  </li>
                ))}
              </ul>
            </section>

            <section className="border-t border-[color:var(--line)] bg-[color:var(--background)]/55 px-6 py-6 sm:px-8">
              <dl className="space-y-2.5 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-[color:var(--muted)]">{t("subtotal")}</dt>
                  <dd className="tabular-nums text-[color:var(--ink)]">
                    {formatMoney(receipt.subtotal, locale)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[color:var(--muted)]">{t("shipping")}</dt>
                  <dd className="tabular-nums text-[color:var(--ink)]">
                    {formatMoney(receipt.shipping, locale)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 border-t border-[color:var(--line)] pt-3 text-base font-semibold">
                  <dt className="text-[color:var(--ink)]">{t("total")}</dt>
                  <dd className="tabular-nums text-[color:var(--ink)]">
                    {formatMoney(receipt.total, locale)}
                  </dd>
                </div>
              </dl>
            </section>
          </>
        )}
      </article>
    </div>
  );
}
