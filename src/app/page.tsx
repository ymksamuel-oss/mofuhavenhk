"use client";

import Image from "next/image";
import Link from "next/link";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function HomePage() {
  const { t } = useI18n();

  return (
    <>
      <section className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden sm:min-h-[calc(100vh-4rem)]">
        {/* Full-bleed lifestyle banner — dog family + cat as visual center. */}
        <Image
          src="/hero.webp"
          alt={t("brand")}
          fill
          priority
          sizes="100vw"
          className="object-cover object-[52%_42%] sm:object-[50%_40%]"
        />

        {/* Soft bottom scrim only — keeps white brand copy readable. */}
        <div aria-hidden className="hero-plane absolute inset-0" />

        <div className="relative mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-5xl flex-col justify-end px-4 pb-20 pt-24 sm:min-h-[calc(100vh-4rem)] sm:px-6 sm:pb-28">
          <span className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-black/30 px-3.5 py-1.5 text-xs font-medium tracking-wide text-white ring-1 ring-white/35 backdrop-blur-sm animate-[fadeUp_0.6s_ease_both] sm:text-sm">
            {t("homeBadge")}
          </span>
          <p className="mb-3 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.55)] sm:text-6xl animate-[fadeUp_0.7s_ease_both]">
            {t("brand")}
          </p>
          <h1 className="max-w-xl text-xl text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] sm:text-2xl animate-[fadeUp_0.8s_ease_both]">
            {t("homeHeadline")}
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.45)] sm:text-base animate-[fadeUp_0.95s_ease_both]">
            {t("homeSub")}
          </p>
          <div className="mt-8 animate-[fadeUp_1.05s_ease_both]">
            <Link
              href="/menu"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[color:var(--hero-deep)] shadow-[0_16px_32px_-14px_rgba(0,0,0,0.5)] transition hover:-translate-y-0.5 hover:bg-[color:var(--accent-soft)] hover:shadow-[0_20px_36px_-14px_rgba(0,0,0,0.55)]"
            >
              {t("homeCta")}
              <span
                aria-hidden
                className="transition-transform group-hover:translate-x-0.5"
              >
                →
              </span>
            </Link>
          </div>
        </div>
      </section>

      <div className="relative z-10 -mt-8 rounded-t-[2.5rem] bg-[color:var(--surface)] shadow-[0_-24px_44px_-30px_rgba(74,54,38,0.4)] sm:-mt-10">
        <CategoryGrid />
      </div>
    </>
  );
}
