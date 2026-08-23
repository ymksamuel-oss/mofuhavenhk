"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { TranslationKey } from "@/lib/i18n/translations";

const PROMISES: {
  titleKey: TranslationKey;
  bodyKey: TranslationKey;
}[] = [
  {
    titleKey: "aboutPromise1Title",
    bodyKey: "aboutPromise1Body",
  },
  {
    titleKey: "aboutPromise2Title",
    bodyKey: "aboutPromise2Body",
  },
  {
    titleKey: "aboutPromise3Title",
    bodyKey: "aboutPromise3Body",
  },
];

/**
 * Brand story page for Mofu Haven（毛毛港）— milk-tea / Japanese-minimal layout.
 */
export function AboutUsPage() {
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

      <article className="overflow-hidden rounded-[1.75rem] border border-[color:var(--line)] bg-white shadow-[0_24px_48px_-32px_rgba(43,38,35,0.28)]">
        <header className="border-b border-[color:var(--line)] px-6 py-8 sm:px-8 sm:py-10">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-[color:var(--accent)]">
            {t("aboutPageEyebrow")}
          </p>
          <div className="mb-4">
            <BrandLogo
              title={t("brand")}
              className="h-24 sm:h-28"
            />
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-[-0.02em] text-[color:var(--ink)] sm:text-3xl">
            {t("aboutPageTitle")}
          </h1>
          <p className="mt-2 font-[family-name:var(--font-display)] text-lg text-[color:var(--accent)] sm:text-xl">
            {t("aboutBrandAlias")}
          </p>
          <p className="mt-4 text-[0.95rem] leading-relaxed tracking-[0.01em] text-[color:var(--muted)]">
            {t("aboutPageIntro")}
          </p>
        </header>

        <section className="border-b border-[color:var(--line)] px-6 py-7 sm:px-8 sm:py-8">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-[color:var(--ink)] sm:text-xl">
            {t("aboutNameOriginTitle")}
          </h2>
          <p className="mt-3 text-[0.95rem] leading-relaxed tracking-[0.01em] text-[color:var(--muted)]">
            {t("aboutNameOriginBody")}
          </p>
        </section>

        <section className="border-b border-[color:var(--line)] px-6 py-7 sm:px-8 sm:py-8">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-[color:var(--ink)] sm:text-xl">
            {t("aboutPromisesTitle")}
          </h2>
          <ol className="mt-5 space-y-5">
            {PROMISES.map((promise, index) => (
              <li key={promise.titleKey} className="flex gap-4">
                <span
                  aria-hidden
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent-soft)] font-[family-name:var(--font-display)] text-sm font-semibold text-[color:var(--accent)]"
                >
                  {index + 1}
                </span>
                <div className="min-w-0 space-y-1.5">
                  <h3 className="font-[family-name:var(--font-display)] text-base font-semibold text-[color:var(--ink)]">
                    {t(promise.titleKey)}
                  </h3>
                  <p className="text-[0.95rem] leading-relaxed tracking-[0.01em] text-[color:var(--muted)]">
                    {t(promise.bodyKey)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <footer className="bg-[color:var(--background)]/55 px-6 py-7 sm:px-8 sm:py-8">
          <p className="font-[family-name:var(--font-display)] text-base font-medium leading-relaxed tracking-[0.01em] text-[color:var(--ink)] sm:text-lg">
            {t("aboutClosing")}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/menu"
              className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-[color:var(--accent)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_-14px_rgba(122,75,49,0.58)] transition hover:-translate-y-0.5 hover:brightness-105 active:scale-[0.99]"
            >
              {t("aboutShopCta")}
            </Link>
            <Link
              href="/shipping-policy"
              className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-[color:var(--line)] bg-white px-5 py-2.5 text-sm font-medium text-[color:var(--ink)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
            >
              {t("footerShipping")}
            </Link>
          </div>
        </footer>
      </article>
    </div>
  );
}
