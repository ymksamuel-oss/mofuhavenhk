// Visual reference: warm Japanese editorial storefront — cream canvas, pet-and-packaging hero,
// soft gold actions, mobile-first stacked storytelling, and no video CTA in the hero.
"use client";

import Image from "next/image";
import { BrandLogo } from "@/components/BrandLogo";
import { CategoryNavLink } from "@/components/CategoryNavLink";
import { FAQAccordion } from "@/components/FAQAccordion";
import { HomepageProductGrid } from "@/components/home/HomepageProductGrid";
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
      <section className="bg-[color:var(--background)] px-4 pb-5 pt-4 sm:px-8 sm:pb-8 sm:pt-6 lg:px-12 lg:pb-10">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-[#d7b893]/65 bg-[#ead7bf] shadow-[0_22px_52px_-38px_rgba(75,54,33,0.58)] lg:grid lg:min-h-[31rem] lg:grid-cols-[1.06fr_0.94fr]">
          <div className="relative min-h-[20rem] overflow-hidden sm:min-h-[25rem] lg:min-h-0">
            <Image
              src="/images/hero-sleeping-shiba-taupe.jpg"
              alt="熟睡中的白色柴犬幼犬"
              fill
              priority
              sizes="(min-width: 1024px) 53vw, 100vw"
              className="object-cover object-left"
            />
            <div aria-hidden className="absolute inset-x-0 bottom-0 h-20 bg-[linear-gradient(180deg,transparent,rgba(75,54,33,0.14))] lg:hidden" />
          </div>

          <div className="flex min-h-[18.5rem] flex-col items-center justify-center bg-[#ead7bf] px-7 py-10 text-center sm:px-12 sm:py-12 lg:min-h-0 lg:items-start lg:px-14 lg:py-12 lg:text-left">
            <BrandLogo title="Mofu Haven" className="h-24 sm:h-28 lg:h-32" />
            <h1 className="mt-6 max-w-md font-[family-name:var(--font-display)] text-3xl font-semibold leading-snug tracking-[-0.025em] text-[#4b3621] sm:text-4xl lg:text-[2.75rem]">
              為愛寵提供最安心的選擇
            </h1>
            <p className="mt-3 max-w-sm text-base leading-relaxed text-[#725c45] sm:text-lg">
              嚴選日本優質寵物用品，為每一份日常帶來溫柔照料。
            </p>
            <CategoryNavLink
              href="/menu"
              className="mt-7 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#4b3621] px-7 py-3 text-base font-semibold text-white shadow-[0_12px_22px_-13px_rgba(75,54,33,0.72)] transition hover:-translate-y-0.5 hover:bg-[#332417] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4b3621] focus-visible:ring-offset-2 focus-visible:ring-offset-[#ead7bf]"
            >
              立即選購 <span aria-hidden className="ml-2">→</span>
            </CategoryNavLink>
          </div>
        </div>
      </section>

      <section id="brand-story" className="bg-[#fbf7f3] px-5 py-12 sm:px-10 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-0 lg:grid-cols-2 lg:items-center lg:gap-x-10">
          <div className="max-w-xl lg:col-start-1 lg:row-start-1 lg:py-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] bg-[color:var(--accent-soft)] px-4 py-2 text-sm font-semibold text-[color:var(--accent)]">
              <span aria-hidden>⌘</span> Mofu Haven 專題指南
            </span>
            <h2 className="mt-6 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-[color:var(--ink)] sm:text-5xl">
              探索寵物世界
            </h2>
            <p className="mt-5 text-lg leading-9 text-[color:var(--muted)] sm:text-xl">
              精選 10 多種人氣貓咪品種深入介紹，結合日系治癒風格與科學飼養小筆記，陪伴您與毛孩共度溫馨愉悅的每一天。
            </p>
          </div>

          <div className="mt-[15px] block h-[220px] w-full overflow-hidden rounded-xl bg-[#ead7bf] shadow-[0_18px_42px_-32px_rgba(86,57,30,0.55)] min-[769px]:h-[320px] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0 lg:h-[400px]">
            <Image
              src="/images/explore-japanese-pet-lifestyle.jpg"
              alt="日系家居中的柴犬幼犬與貓咪"
              fill
              sizes="(min-width: 1024px) 50vw, (min-width: 769px) 50vw, 100vw"
              className="object-cover object-center"
            />
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-5 lg:col-start-1 lg:row-start-2 lg:mt-7">
            <div className="flex items-center">
              {[
                "/images/cat-breeds/russian-blue-portrait.jpg",
                "/images/cat-breeds/scottish-fold-tabby.jpg",
                "/images/cat-breeds/ragdoll-mitted.jpg",
              ].map((src, index) => (
                <Image
                  key={src}
                  src={src}
                  alt=""
                  aria-hidden="true"
                  width={56}
                  height={56}
                  sizes="56px"
                  className={`h-12 w-12 rounded-full border-3 border-[#fbf7f3] object-cover shadow-sm sm:h-14 sm:w-14 ${index ? "-ml-2.5" : ""}`}
                />
              ))}
            </div>
            <CategoryNavLink
              href="/cat-breeds"
              className="inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-[color:var(--accent)] px-8 py-3 text-lg font-semibold text-white shadow-[0_13px_26px_-16px_rgba(95,62,26,0.62)] transition hover:-translate-y-0.5 hover:bg-[color:var(--hero-deep)]"
            >
              <span aria-hidden>▢</span> 立即探索 <span aria-hidden>→</span>
            </CategoryNavLink>
          </div>
        </div>
      </section>

      <section className="border-y border-[color:var(--line)] bg-[color:var(--background)] px-5 py-8 sm:px-10 sm:py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {quickCategories.map(({ href, label, Icon }) => (
              <CategoryNavLink
                key={href}
                href={href}
                className="group flex min-h-[4.6rem] flex-col items-center justify-center gap-1 rounded-[1.35rem] border border-[color:var(--line)] bg-white px-2 py-3 text-center text-xs font-semibold text-[color:var(--ink)] shadow-[0_8px_18px_-15px_rgba(78,52,29,0.45)] transition hover:-translate-y-0.5 hover:border-[color:var(--accent)] hover:bg-[color:var(--accent-soft)] sm:min-h-[5.25rem] sm:text-sm"
              >
                <Icon className="h-5 w-5 text-[color:var(--ink)] transition-transform group-hover:scale-110" />
                <span>{label}</span>
              </CategoryNavLink>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[color:var(--background)] px-6 py-11 sm:px-10 sm:py-16">
        <div className="mx-auto max-w-6xl rounded-[1.8rem] border border-[color:var(--line)] bg-white px-5 py-7 sm:px-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[color:var(--ink)] sm:text-3xl">
            {t("productSearchHomeTitle")}
          </h2>
          <p className="mt-2 text-sm text-[color:var(--muted)] sm:text-base">
            {t("productSearchHomeSub")}
          </p>
          <ProductSearch variant="home" className="mt-5 max-w-3xl" />
        </div>
      </section>

      <HomepageProductGrid />

      <FAQAccordion />
    </>
  );
}
