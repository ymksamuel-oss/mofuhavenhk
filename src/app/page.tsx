"use client";

import Link from "next/link";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function HomePage() {
  const { t } = useI18n();

  return (
    <>
      <section className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden sm:min-h-[calc(100vh-4rem)]">
        <div aria-hidden className="hero-plane absolute inset-0" />
        <div className="relative mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-5xl flex-col justify-end px-4 pb-16 pt-24 sm:min-h-[calc(100vh-4rem)] sm:px-6 sm:pb-24">
          <p className="mb-3 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-white sm:text-6xl animate-[fadeUp_0.7s_ease_both]">
            {t("brand")}
          </p>
          <h1 className="max-w-xl text-xl text-white/95 sm:text-2xl animate-[fadeUp_0.8s_ease_both]">
            {t("homeHeadline")}
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/80 sm:text-base animate-[fadeUp_0.95s_ease_both]">
            {t("homeSub")}
          </p>
          <div className="mt-8 animate-[fadeUp_1.05s_ease_both]">
            <Link
              href="/checkout"
              className="inline-flex items-center bg-white px-5 py-3 text-sm font-semibold text-[color:var(--hero-deep)] transition hover:bg-[color:var(--accent-soft)]"
            >
              {t("homeCta")}
            </Link>
          </div>
        </div>
      </section>

      <CategoryGrid />
    </>
  );
}
