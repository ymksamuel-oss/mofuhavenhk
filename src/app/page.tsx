"use client";

import { CategoryNavLink } from "@/components/CategoryNavLink";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { HeroVideoModal } from "@/components/home/HeroVideoModal";
import { ProductSearch } from "@/components/ProductSearch";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function HomePage() {
  const { t } = useI18n();

  return (
    <>
      {/* 限時活動純文字提示欄 */}
      <div className="bg-[#5c3a22] px-4 py-2.5 text-center text-xs font-medium tracking-wide text-[#f8f0e2] sm:text-sm">
        <span>🎉 日本直送寵物嚴選・限時優惠：全店購物滿 HK$450 即享香港本地免運費！</span>
      </div>

      {/*
        Full-width hero banner with ultra-wide aspect ratio (33:14)
        Mobile: 3/4 aspect ratio for portrait viewing
        Desktop: full-bleed ultra-wide banner with rounded bottom corners
      */}
      <section className="relative w-full overflow-hidden">
        {/* Mobile: 3/4 aspect ratio */}
        <div className="relative aspect-[3/4] w-full sm:hidden">
          <img
            src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663854897952/JXFulcQyfkYtQxHy.PNG"
            alt={t("brand")}
            className="h-full w-full object-cover object-left"
          />
          <div aria-hidden className="hero-plane absolute inset-0" />
        </div>

        {/* Desktop: ultra-wide full-bleed banner - no forced aspect ratio */}
        <div className="relative hidden w-full bg-gradient-to-b from-[#f5f1ed] to-[#ede8e3] sm:block">
          <img
            src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663854897952/JXFulcQyfkYtQxHy.PNG"
            alt={t("brand")}
            className="w-full h-auto object-contain"
          />
          <div aria-hidden className="hero-plane absolute inset-0" />
        </div>

        {/* Content overlay - positioned absolutely over the banner */}
        <div className="absolute inset-0 flex flex-col justify-start px-4 pb-10 pt-10 sm:justify-center sm:px-6">
          <div className="relative mx-auto flex h-full min-h-0 max-w-5xl flex-col justify-start sm:justify-center">
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

            <div className="relative flex flex-col items-center px-6 py-10 sm:px-10 sm:py-14">
              {/* Text-only content keeps this homepage section clean and lightweight. */}
              <div className="w-full max-w-2xl text-center sm:text-left">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/60 px-3 py-1 text-xs font-medium text-[#8b6f47] ring-1 ring-[#d4c4b0]/40 backdrop-blur-sm">
                  ✨ 溫馨時刻
                </span>
                <h3 className="mt-4 font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-[color:var(--ink)] sm:mt-3 sm:text-3xl">
                  與毛孩的日常治癒
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted)] sm:text-base">
                  精選日本天然寵物用品，陪伴毛孩每一個溫暖時刻。從營養美食到舒適用品，讓毛孩享受最好的照顧。
                </p>
                <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:gap-3">
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
