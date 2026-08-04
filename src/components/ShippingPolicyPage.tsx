"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { TranslationKey } from "@/lib/i18n/translations";

const SECTIONS: {
  titleKey: TranslationKey;
  bodyKey: TranslationKey;
}[] = [
  {
    titleKey: "shippingPolicyCutoffTitle",
    bodyKey: "shippingPolicyCutoffBody",
  },
  {
    titleKey: "shippingPolicySfTitle",
    bodyKey: "shippingPolicySfBody",
  },
  {
    titleKey: "shippingPolicyRefundTitle",
    bodyKey: "shippingPolicyRefundBody",
  },
];

/**
 * Shipping / preorder fulfillment policy — Japanese-minimal milk-tea layout.
 */
export function ShippingPolicyPage() {
  const { t } = useI18n();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="mb-4">
        <Link
          href="/"
          className="text-sm font-medium text-[color:var(--muted)] transition hover:text-[color:var(--accent)]"
        >
          ← {t("infoPageBack")}
        </Link>
      </p>

      <article className="overflow-hidden rounded-[1.75rem] border border-[color:var(--line)] bg-[linear-gradient(180deg,#fffaf1_0%,#fdf8ef_48%,#f8f0e2_100%)] shadow-[0_24px_48px_-32px_rgba(74,54,38,0.45)]">
        <header className="border-b border-[color:var(--line)] px-6 py-7 sm:px-8 sm:py-8">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-[color:var(--accent)]">
            {t("shippingPolicyEyebrow")}
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-[-0.02em] text-[color:var(--ink)] sm:text-3xl">
            {t("shippingPolicyTitle")}
          </h1>
          <p className="mt-3 text-[0.95rem] leading-relaxed tracking-[0.01em] text-[color:var(--muted)]">
            {t("shippingPolicyIntro")}
          </p>
        </header>

        <ol className="divide-y divide-[color:var(--line)]">
          {SECTIONS.map((section, index) => (
            <li key={section.titleKey} className="px-6 py-6 sm:px-8 sm:py-7">
              <div className="flex gap-4">
                <span
                  aria-hidden
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent-soft)] font-[family-name:var(--font-display)] text-sm font-semibold text-[color:var(--accent)]"
                >
                  {index + 1}
                </span>
                <div className="min-w-0 space-y-2">
                  <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-[color:var(--ink)]">
                    {t(section.titleKey)}
                  </h2>
                  <p className="text-[0.95rem] leading-relaxed tracking-[0.01em] text-[color:var(--muted)]">
                    {t(section.bodyKey)}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>

        <footer className="border-t border-[color:var(--line)] bg-[color:var(--background)]/55 px-6 py-5 sm:px-8">
          <p className="text-sm leading-relaxed text-[color:var(--muted)]">
            {t("shippingPolicyFooterNote")}
          </p>
        </footer>
      </article>
    </div>
  );
}
