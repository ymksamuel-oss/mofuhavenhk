// Visual reference: warm Japanese editorial storefront — cream canvas, pet-and-packaging hero,
// soft gold actions, mobile-first stacked storytelling, and no video CTA in the hero.
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { CategoryNavLink } from "@/components/CategoryNavLink";
import { FAQAccordion } from "@/components/FAQAccordion";
import { HomepageProductGrid } from "@/components/home/HomepageProductGrid";
import mobileHeroImage from "@/assets/hero-mobile-clean-pet-lifestyle.jpg";
import { ProductSearch } from "@/components/ProductSearch";
import {
  BagIcon,
  BoneIcon,
  CatIcon,
  CleaningIcon,
  DogIcon,
  HealthIcon,
  ToyIcon,
} from "@/components/icons/CategoryIcons";
import { useI18n } from "@/lib/i18n/I18nProvider";

const quickCategories = [
  { href: "/menu", labelKey: "allProducts", Icon: BagIcon },
  { href: "/categories/cats", labelKey: "categoryCats", Icon: CatIcon },
  { href: "/categories/dogs", labelKey: "categoryDogs", Icon: DogIcon },
  { href: "/categories/small-pets", labelKey: "categorySmallPets", Icon: BoneIcon },
  { href: "/categories/cats/wet-cans", labelKey: "catSubWetCans", Icon: HealthIcon },
  { href: "/categories/cats/dry-food", labelKey: "catSubDryFood", Icon: BoneIcon },
  { href: "/categories/cleaning", labelKey: "categoryCleaning", Icon: CleaningIcon },
  { href: "/categories/toys", labelKey: "categoryToys", Icon: ToyIcon },
] as const;

export default function HomePage() {
  const { t } = useI18n();
  const [isDesktopHero, setIsDesktopHero] = useState(false);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    const updateHeroVariant = () => setIsDesktopHero(desktopQuery.matches);
    updateHeroVariant();
    desktopQuery.addEventListener("change", updateHeroVariant);
    return () => desktopQuery.removeEventListener("change", updateHeroVariant);
  }, []);

  return (
    <>
      <section className="bg-[color:var(--background)] px-4 pb-4 pt-3 sm:px-8 sm:pb-8 sm:pt-6 lg:px-12 lg:pb-10">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[1.5rem] border border-[#d7b893]/65 bg-[#ead7bf] shadow-[0_22px_52px_-38px_rgba(75,54,33,0.58)] sm:rounded-[2rem] lg:grid lg:min-h-[31rem] lg:grid-cols-[1.06fr_0.94fr]">
          <div className="relative h-[14rem] overflow-hidden sm:h-[20rem] lg:h-auto lg:min-h-0">
            {isDesktopHero ? (
              <Image
                src="/images/hero-sleeping-shiba-taupe.jpg"
                alt="熟睡中的白色柴犬幼犬"
                fill
                priority
                sizes="53vw"
                className="origin-left scale-[1.5] object-cover object-[0%_58%]"
              />
            ) : (
              <Image
                src={mobileHeroImage}
                alt="日系家居中的柴犬幼犬、木製骨形玩具與寵物用品"
                fill
                priority
                sizes="100vw"
                className="object-cover object-[center_55%]"
              />
            )}
          </div>

          <div className="hidden min-h-0 flex-col items-center justify-center bg-[#ead7bf] px-5 py-4 text-center sm:px-10 sm:py-9 lg:flex lg:min-h-0 lg:items-start lg:px-14 lg:py-12 lg:text-left">
            <BrandLogo title="Mofu Haven" className="h-10 sm:h-20 lg:h-32" />
            <h1 className="mt-2 max-w-md font-[family-name:var(--font-display)] text-xl font-semibold leading-snug tracking-[-0.025em] text-[#4b3621] sm:mt-4 sm:text-3xl lg:mt-6 lg:text-[2.75rem]">
              為愛寵提供最安心的選擇
            </h1>
            <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-[#725c45] sm:mt-3 sm:text-base lg:text-lg">
              嚴選日本優質寵物用品，為每一份日常帶來溫柔照料。
            </p>
            <CategoryNavLink
              href="/menu"
              className="mt-3 inline-flex min-h-10 items-center justify-center rounded-xl bg-[#4b3621] px-5 py-2 text-sm font-semibold text-white shadow-[0_12px_22px_-13px_rgba(75,54,33,0.72)] transition hover:-translate-y-0.5 hover:bg-[#332417] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4b3621] focus-visible:ring-offset-2 focus-visible:ring-offset-[#ead7bf] sm:mt-5 sm:min-h-12 sm:px-7 sm:py-3 sm:text-base"
            >
              立即選購 <span aria-hidden className="ml-2">→</span>
            </CategoryNavLink>
          </div>
        </div>
      </section>

      <HomepageProductGrid />

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

          <div className="relative mt-[15px] block h-[220px] w-full overflow-hidden rounded-xl bg-[#ead7bf] shadow-[0_18px_42px_-32px_rgba(86,57,30,0.55)] min-[769px]:h-[320px] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0 lg:h-[400px]">
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

      <section className="border-y border-[color:var(--line)] bg-[color:var(--background)] px-4 py-6 sm:px-8 sm:py-9">
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-4 auto-rows-fr gap-2 sm:gap-3">
            {quickCategories.map(({ href, labelKey, Icon }) => (
              <CategoryNavLink
                key={href}
                href={href}
                className="group flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl border border-[#eadfd6] bg-[#fdfbf9] px-1.5 py-2 text-center text-[11px] font-semibold leading-tight text-[color:var(--ink)] transition hover:border-[#d7b893] hover:bg-[#f8efe8] hover:text-[color:var(--accent)] sm:min-h-16 sm:px-2 sm:text-sm"
              >
                <Icon className="h-4 w-4 shrink-0 text-[color:var(--accent)] transition-transform group-hover:scale-110 sm:h-[1.1rem] sm:w-[1.1rem]" />
                <span>{t(labelKey)}</span>
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

      <FAQAccordion />
    </>
  );
}
