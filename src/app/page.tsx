// Visual reference: warm Japanese editorial storefront — cream canvas, pet-and-packaging hero,
// soft gold actions, mobile-first stacked storytelling, and no video CTA in the hero.
"use client";

import { CategoryNavLink } from "@/components/CategoryNavLink";
import { FAQAccordion } from "@/components/FAQAccordion";
import { ProductSearch } from "@/components/ProductSearch";
import {
  BoneIcon,
  CatIcon,
  CleaningIcon,
  DogIcon,
  HealthIcon,
  ToyIcon,
} from "@/components/icons/CategoryIcons";
import { useI18n } from "@/lib/i18n/I18nProvider";

const quickCategories = [
  { href: "/categories/cats", label: "貓咪商品", Icon: CatIcon },
  { href: "/categories/dogs", label: "狗狗商品", Icon: DogIcon },
  { href: "/categories/small-pets", label: "小寵物商品", Icon: BoneIcon },
  { href: "/categories/cats/wet-cans", label: "貓罐頭／濕糧", Icon: HealthIcon },
  { href: "/categories/cats/dry-food", label: "乾糧／主食糧", Icon: BoneIcon },
  { href: "/categories/cleaning", label: "貓砂／清潔用品", Icon: CleaningIcon },
  { href: "/categories/toys", label: "寵物玩具", Icon: ToyIcon },
] as const;

export default function HomePage() {
  const { t } = useI18n();

  return (
    <>
      <section className="relative isolate overflow-hidden bg-[#d7c9b7]">
        <div className="relative h-[34rem] min-h-[34rem] w-full overflow-hidden sm:h-[min(44rem,calc(100vh-4rem))] sm:min-h-[38rem]">
          <img
            src="/hero.webp"
            alt={t("brand")}
            className="absolute inset-0 h-full w-full object-cover object-[61%_52%] sm:object-[54%_50%]"
            fetchPriority="high"
            loading="eager"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(90deg,rgba(53,39,27,0.70)_0%,rgba(72,53,38,0.48)_41%,rgba(72,53,38,0.06)_76%,rgba(72,53,38,0.02)_100%)] sm:bg-[linear-gradient(90deg,rgba(53,39,27,0.76)_0%,rgba(72,53,38,0.43)_47%,rgba(72,53,38,0.04)_76%)]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(31,21,14,0.18)_0%,transparent_28%,rgba(31,21,14,0.08)_100%)]" />

          <div className="relative mx-auto flex h-full max-w-6xl items-center px-7 pb-8 pt-10 sm:px-10 lg:px-14">
            <div className="max-w-[20rem] text-white sm:max-w-xl">
              <span className="inline-flex rounded-full border border-white/55 bg-white/10 px-4 py-2 text-sm font-medium tracking-wide backdrop-blur-sm sm:text-base">
                日本直送・嚴選寵物好物
              </span>
              <p className="mt-7 font-[family-name:var(--font-display)] text-[2.65rem] font-semibold leading-none tracking-[-0.035em] text-white drop-shadow-[0_2px_16px_rgba(30,20,12,0.38)] sm:mt-8 sm:text-7xl">
                Mofu Haven
              </p>
              <h1 className="mt-4 text-[1.65rem] font-medium leading-tight tracking-tight text-white sm:text-4xl">
                日本寵物用品專門店
              </h1>
              <p className="mt-4 max-w-md text-base leading-relaxed text-white/95 sm:text-xl">
                直送日本優質寵物用品，讓您嘅貓貓狗狗幸福滿分。
              </p>
              <div className="mt-7 flex flex-col items-start gap-6 sm:mt-8 sm:flex-row sm:items-center">
                <CategoryNavLink
                  href="/menu"
                  className="inline-flex min-h-14 items-center gap-3 rounded-2xl bg-[#cfa467] px-7 py-3 text-lg font-semibold text-white shadow-[0_14px_26px_-13px_rgba(31,21,14,0.72)] transition hover:-translate-y-0.5 hover:bg-[#b98b4f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#6a4f38]"
                >
                  立即選購 <span aria-hidden>→</span>
                </CategoryNavLink>
                <a
                  href="#brand-story"
                  className="group inline-flex items-center gap-4 text-lg font-medium text-white/95 transition hover:text-white"
                >
                  <span aria-hidden className="text-3xl font-light leading-none transition-transform duration-200 group-hover:translate-y-1">↓</span>
                  探索品牌故事
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="brand-story" className="bg-[#fffaf1] px-6 py-12 sm:px-10 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-[2rem] border border-[#eadfce] bg-[linear-gradient(145deg,#fffaf4_0%,#f8efdf_100%)] px-6 py-9 shadow-[0_18px_44px_-36px_rgba(86,57,30,0.42)] sm:px-12 sm:py-12">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#e9dac4] bg-white/75 px-4 py-2 text-sm font-semibold text-[#9a7140]">
              <span aria-hidden>⌘</span> Mofu Haven 專題指南
            </span>
            <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="max-w-3xl">
                <h2 className="font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-[#4d382a] sm:text-5xl">
                  探索寵物世界
                </h2>
                <p className="mt-5 text-lg leading-9 text-[#766457] sm:text-xl">
                  精選 10 多種人氣貓咪品種深入介紹，結合日系治癒風格與科學飼養小筆記，陪伴您與毛孩共度溫馨愉悅的每一天。
                </p>
                <div className="mt-7 flex items-center gap-[-0.25rem]">
                  {[
                    "/images/cat-breeds/russian-blue-portrait.jpg",
                    "/images/cat-breeds/scottish-fold-tabby.jpg",
                    "/images/cat-breeds/ragdoll-mitted.jpg",
                  ].map((src, index) => (
                    <img
                      key={src}
                      src={src}
                      alt="Mofu Haven 寵物專題"
                      className={`h-14 w-14 rounded-full border-4 border-[#fffaf1] object-cover shadow-sm sm:h-16 sm:w-16 ${index ? "-ml-3" : ""}`}
                      loading="lazy"
                    />
                  ))}
                </div>
              </div>
              <CategoryNavLink
                href="/cat-breeds"
                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#bf9459] px-8 py-3 text-lg font-semibold text-white shadow-[0_13px_26px_-16px_rgba(95,62,26,0.62)] transition hover:-translate-y-0.5 hover:bg-[#a97f47]"
              >
                <span aria-hidden>▢</span> 立即探索 <span aria-hidden>→</span>
              </CategoryNavLink>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#e7dbc9] bg-[#fffdf8] px-5 py-8 sm:px-10 sm:py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {quickCategories.map(({ href, label, Icon }) => (
              <CategoryNavLink
                key={href}
                href={href}
                className="group flex min-h-[4.6rem] flex-col items-center justify-center gap-1 rounded-[1.35rem] border border-[#dfcfb6] bg-white/85 px-2 py-3 text-center text-xs font-semibold text-[#655347] shadow-[0_8px_18px_-15px_rgba(78,52,29,0.45)] transition hover:-translate-y-0.5 hover:border-[#caa16b] hover:bg-[#fffaf1] sm:min-h-[5.25rem] sm:text-sm"
              >
                <Icon className="h-5 w-5 text-[#5A4E44] transition-transform group-hover:scale-110" />
                <span>{label}</span>
              </CategoryNavLink>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#fffaf1] px-6 py-11 sm:px-10 sm:py-16">
        <div className="mx-auto max-w-6xl rounded-[1.8rem] border border-[#eee1d0] bg-white/65 px-5 py-7 sm:px-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[color:var(--ink)] sm:text-3xl">
            {t("productSearchHomeTitle")}
          </h2>
          <p className="mt-2 text-sm text-[color:var(--muted)] sm:text-base">
            {t("productSearchHomeSub")}
          </p>
          <ProductSearch variant="home" className="mt-5 max-w-3xl" />
        </div>
      </section>

      <FAQAccordion />
    </>
  );
}
