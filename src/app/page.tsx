"use client";

import { CategoryNavLink } from "@/components/CategoryNavLink";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { ProductSearch } from "@/components/ProductSearch";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function HomePage() {
  const { t } = useI18n();

  return (
    <>
      <section className="relative w-full overflow-hidden bg-[color:var(--background)]">
        <div className="relative h-[400px] w-full overflow-hidden md:h-[500px] lg:h-[600px]">
          <img
            src="/images/mofu-haven-website-b.png"
            alt="Mofu Haven - 寵物與產品"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/20 to-transparent" />

          <div className="relative mx-auto flex h-full max-w-5xl flex-col items-start justify-center px-4 text-white sm:px-6">
            <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1.5 text-xs font-medium tracking-wide text-white ring-1 ring-white/35 backdrop-blur-sm sm:mb-4 sm:text-sm">
              {t("homeBadge")}
            </span>
            <p className="mb-2 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight drop-shadow-[0_2px_14px_rgba(0,0,0,0.55)] sm:mb-3 sm:text-6xl">
              {t("brand")}
            </p>
            <h1 className="max-w-xl text-lg drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] sm:text-2xl">
              {t("homeHeadline")}
            </h1>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-white/90 drop-shadow-[0_1px_8px_rgba(0,0,0,0.45)] sm:mt-3 sm:text-base">
              {t("homeSub")}
            </p>
            <div className="mt-6 sm:mt-8">
              <CategoryNavLink
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
              </CategoryNavLink>
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-10 rounded-t-[2.5rem] bg-[color:var(--surface)] shadow-[0_-24px_44px_-30px_rgba(74,54,38,0.4)]">
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="relative overflow-hidden rounded-2xl bg-[color:var(--background)] shadow-sm transition-all duration-300 ease-out hover:shadow-md">
            <img
              src="/images/IMG_0383.webp"
              alt="與毛孩的日常治癒"
              className="block h-auto w-full rounded-2xl object-contain"
            />
            <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/40 via-transparent to-transparent p-6 md:p-12">
              <div className="max-w-xl space-y-3 text-white">
                <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
                  與毛孩的日常治癒
                </h2>
                <p className="text-sm text-white/90 md:text-base">
                  精選日本天然寵物用品，陪伴毛孩每一個溫暖時刻
                </p>
              </div>
            </div>
          </div>
        </section>
        <section
          aria-labelledby="home-product-search-title"
          className="mx-auto max-w-5xl px-4 pb-2 pt-10 sm:px-6 sm:pt-14"
        >
          <div className="mb-4 max-w-2xl">
            <h2
              id="home-product-search-title"
              className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-[color:var(--ink)] sm:text-2xl"
            >
              {t("productSearchHomeTitle")}
            </h2>
            <p className="mt-1.5 text-sm text-[color:var(--muted)] sm:text-base">
              {t("productSearchHomeSub")}
            </p>
          </div>
          <ProductSearch variant="home" className="max-w-2xl" />
        </section>
        <CategoryGrid />
      </div>
    </>
  );
}
