"use client";

import { getImageProps } from "next/image";
import { CategoryNavLink } from "@/components/CategoryNavLink";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { HeroVideoModal } from "@/components/home/HeroVideoModal";
import { ProductSearch } from "@/components/ProductSearch";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function HomePage() {
  const { t } = useI18n();

  const common = {
    alt: t("brand"),
    fill: true as const,
    sizes: "100vw",
    priority: true,
  };

  const {
    props: { srcSet: mobileSrcSet },
  } = getImageProps({
    ...common,
    src: "https://res.cloudinary.com/jlzllo8s/image/upload/v1786249080/mofu-haven-website-b.png_eegeur.png",
    quality: 88,
  });

  const {
    props: { srcSet: desktopSrcSet, ...desktopRest },
  } = getImageProps({
    ...common,
    src: "https://res.cloudinary.com/jlzllo8s/image/upload/v1786249080/mofu-haven-website-b.png_eegeur.png",
    quality: 85,
  });

  return (
    <>
      {/*
        Mobile: portrait art-direction crop + 3/4 frame so the lifestyle
        scene is not stretched/cropped by a tall full-viewport cover.
        Desktop (sm+): keep the wide full-bleed banner.
      */}
      <section className="relative aspect-[3/4] max-h-[min(88vh,42rem)] w-full overflow-hidden sm:aspect-auto sm:max-h-none sm:min-h-[calc(100vh-4rem)]">
        <picture>
          <source
            media="(max-width: 639px)"
            srcSet={mobileSrcSet}
            sizes="100vw"
          />
          <source
            media="(min-width: 640px)"
            srcSet={desktopSrcSet}
            sizes="100vw"
          />
          <img
            {...desktopRest}
            alt={t("brand")}
            className="absolute inset-0 h-full w-full object-cover object-[right_42%] sm:object-[50%_40%]"
          />
        </picture>

        {/* Soft scrim — top-weighted on mobile (copy sits high), bottom on desktop. */}
        <div aria-hidden className="hero-plane absolute inset-0" />

        <div className="relative mx-auto flex h-full min-h-0 max-w-5xl flex-col justify-start px-4 pb-10 pt-10 sm:min-h-[calc(100vh-4rem)] sm:justify-end sm:px-6 sm:pb-28 sm:pt-24">
          <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-black/30 px-3.5 py-1.5 text-xs font-medium tracking-wide text-white ring-1 ring-white/35 backdrop-blur-sm animate-[fadeUp_0.6s_ease_both] sm:mb-4 sm:text-sm">
            {t("homeBadge")}
          </span>
          <p className="mb-2 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.55)] sm:mb-3 sm:text-6xl animate-[fadeUp_0.7s_ease_both]">
            {t("brand")}
          </p>
          <h1 className="max-w-xl text-lg text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] sm:text-2xl animate-[fadeUp_0.8s_ease_both]">
            {t("homeHeadline")}
          </h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.45)] sm:mt-3 sm:text-base animate-[fadeUp_0.95s_ease_both]">
            {t("homeSub")}
          </p>
          {/* @section: hero-actions */}
          <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-8 animate-[fadeUp_1.05s_ease_both]">
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
            <HeroVideoModal />
          </div>
        </div>
      </section>

      <div className="relative z-10 -mt-6 rounded-t-[2.5rem] bg-[color:var(--surface)] shadow-[0_-24px_44px_-30px_rgba(74,54,38,0.4)] sm:-mt-10">
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

        {/* Secondary Banner Section - Healing Pet Imagery */}
        <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#fef8f3] via-[#fef5ed] to-[#fef1e8] shadow-[0_8px_24px_rgba(74,54,38,0.08)]">
            {/* Decorative elements */}
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#f5e6d3]/40 blur-3xl" />
            <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-[#e8d4c0]/30 blur-2xl" />

            <div className="relative flex flex-col items-center gap-6 px-6 py-12 sm:flex-row sm:gap-8 sm:px-8 sm:py-16">
              {/* Image Placeholder */}
              <div className="flex-1">
                <div className="relative aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-[#f0e4d4] to-[#e8d8c8] shadow-[0_4px_12px_rgba(74,54,38,0.12)]">
                  {/* Placeholder for healing pet image */}
                  <div className="flex h-full w-full items-center justify-center">
                    <div className="text-center">
                      <div className="mb-3 text-4xl">🐱</div>
                      <p className="text-sm font-medium text-[color:var(--muted)]">日系治癒風寵物相</p>
                      <p className="mt-1 text-xs text-[color:var(--muted)]/70">圖片預留位</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 text-center sm:text-left">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/60 px-3 py-1 text-xs font-medium text-[#8b6f47] ring-1 ring-[#d4c4b0]/40 backdrop-blur-sm">
                  ✨ 溫馨時刻
                </span>
                <h3 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-[color:var(--ink)] sm:text-3xl">
                  與毛孩的日常治癒
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[color:var(--muted)] sm:text-base">
                  精選日本天然寵物用品，陪伴毛孩每一個溫暖時刻。從營養美食到舒適用品，讓毛孩享受最好的照顧。
                </p>
                <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:gap-3">
                  <CategoryNavLink
                    href="/menu"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#8b6f47] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(139,111,71,0.25)] transition hover:-translate-y-0.5 hover:bg-[#7a5f3f] hover:shadow-[0_6px_16px_rgba(139,111,71,0.3)] sm:justify-start"
                  >
                    探索更多
                    <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
                      →
                    </span>
                  </CategoryNavLink>
                </div>
              </div>
            </div>
          </div>
        </section>

        <CategoryGrid />
      </div>
    </>
  );
}
