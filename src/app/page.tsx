// Visual reference: warm Japanese editorial storefront — cream canvas, pet-and-packaging hero,
// soft gold actions, mobile-first stacked storytelling, and no video CTA in the hero.
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { CategoryNavLink } from "@/components/CategoryNavLink";
import { FAQAccordion } from "@/components/FAQAccordion";
import { ExplorePetWorldGallery, type AnimalTab, type DogCoatFilter } from "@/components/about/ExplorePetWorldGallery";
import { HomepageProductGrid } from "@/components/home/HomepageProductGrid";
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
  { href: "/menu#products", labelKey: "allProducts", Icon: BagIcon },
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
  const exploreAnimal: AnimalTab = "cats";
  const dogCoatFilter: DogCoatFilter = "all";

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    const updateHeroVariant = () => setIsDesktopHero(desktopQuery.matches);
    updateHeroVariant();
    desktopQuery.addEventListener("change", updateHeroVariant);
    return () => desktopQuery.removeEventListener("change", updateHeroVariant);
  }, []);

  return (
    <>
      <section className="bg-[#f8f0e8] px-4 pb-6 pt-4 sm:px-8 sm:pb-10 sm:pt-7 lg:bg-[color:var(--background)] lg:px-12 lg:pb-14">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
            <div className="order-2 px-2 sm:px-5 lg:order-1 lg:px-0">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#8a6c55] sm:text-xs">{t("homeHeroEyebrow")}</p>
              <BrandLogo title="Mofu Haven" className="mt-4 h-12 sm:h-16 lg:h-20" />
              <h1 className="mt-5 max-w-xl font-[family-name:var(--font-display)] text-[2.35rem] font-semibold leading-[1.08] tracking-[-0.045em] text-[#4b3621] sm:text-5xl lg:mt-8 lg:text-[4.5rem]">
                {t("homeHeadline")}
              </h1>
              <p className="mt-5 max-w-md text-base leading-8 text-[#725c45] sm:text-lg lg:text-xl lg:leading-9">
                {t("homeSub")}
              </p>
            </div>

            <div className="order-1 relative block h-[12.5rem] overflow-hidden rounded-[1.35rem] border border-[#c9aa8c]/70 bg-[#ead7bf] shadow-[0_20px_42px_-30px_rgba(75,54,33,0.58)] sm:h-[20rem] lg:order-2 lg:h-[31rem]">
              {isDesktopHero ? (
                <Image
                  src="/images/hero-sleeping-shiba-taupe.jpg"
                  alt={t("homeHeroImageAlt")}
                  fill
                  priority
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  className="origin-left scale-[1.5] object-cover object-[0%_58%]"
                />
              ) : (
                <Image
                  src="/images/hero-mobile-mofu-haven.jpg"
                  alt={t("homeMobileHeroImageAlt")}
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover object-[center_55%]"
                />
              )}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t border-white/35 bg-[#4b3621]/72 px-4 py-3 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#fffaf4] backdrop-blur-sm sm:px-6 sm:py-4 sm:text-xs">
                <span>{t("homeHeroStamp")}</span>
                <span aria-hidden>01 / 01</span>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-[#4b3621]/20 pt-5 sm:mt-14 sm:pt-7">
            <div className="mb-4 flex items-end justify-between gap-4 sm:mb-5">
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#8a6c55] sm:text-xs">{t("homeCategoryEyebrow")}</p>
                <h2 className="mt-1 font-[family-name:var(--font-display)] text-xl font-semibold tracking-[-0.02em] text-[#4b3621] sm:text-2xl">{t("categoryGridTitle")}</h2>
              </div>
              <span className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#8a6c55]">{t("homeCategoryIndex")}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-2 sm:gap-x-4 sm:gap-y-3 lg:grid-cols-4">
              {quickCategories.map(({ href, labelKey, Icon }, index) => (
                <CategoryNavLink
                  key={href}
                  href={href}
                  className="group flex min-h-14 items-center gap-2 rounded-xl border border-[#d7b893]/65 bg-[#fdf8f3]/90 px-2.5 py-3 text-left text-xs font-semibold text-[#4b3621] shadow-[0_8px_18px_-16px_rgba(75,54,33,0.55)] transition hover:border-[#8a6c55] hover:bg-[#fffaf5] sm:min-h-16 sm:gap-3 sm:px-3 sm:text-sm"
                >
                  <span className="w-5 shrink-0 text-[0.62rem] font-medium text-[#9a806e]">{String(index + 1).padStart(2, "0")}</span>
                  <Icon className="h-4 w-4 shrink-0 text-[#7a5949] transition-transform group-hover:scale-110 sm:h-[1.1rem] sm:w-[1.1rem]" />
                  <span className="min-w-0 leading-tight">{t(labelKey)}</span>
                  <span className="ml-auto text-[#9a806e] transition-transform group-hover:translate-x-1" aria-hidden>↗</span>
                </CategoryNavLink>
              ))}
            </div>
          </div>
        </div>
      </section>

      <HomepageProductGrid />

      <section id="brand-story" className="bg-[#fbf7f3] px-5 py-12 sm:px-10 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-0 lg:grid-cols-2 lg:items-center lg:gap-x-10">
          <div className="max-w-xl lg:col-start-1 lg:row-start-1 lg:py-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] bg-[color:var(--accent-soft)] px-4 py-2 text-sm font-semibold text-[color:var(--accent)]">
              <span aria-hidden>⌘</span> {t("brandGuide")}
            </span>
            <h2 className="mt-6 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-[color:var(--ink)] sm:text-5xl">
              {t("brandGuideTitle")}
            </h2>
            <p className="mt-5 text-lg leading-9 text-[color:var(--muted)] sm:text-xl">
              {t("brandGuideBody")}
            </p>
          </div>

          <div className="relative mt-[15px] block h-[220px] w-full overflow-hidden rounded-xl bg-[#ead7bf] shadow-[0_18px_42px_-32px_rgba(86,57,30,0.55)] min-[769px]:h-[320px] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0 lg:h-[400px]">
            <Image
              src="/images/explore-japanese-pet-lifestyle.jpg"
              alt={t("homeMobileHeroImageAlt")}
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
              <span aria-hidden>▢</span> {t("exploreCta")} <span aria-hidden>→</span>
            </CategoryNavLink>
          </div>
          <ExplorePetWorldGallery animal={exploreAnimal} dogCoat={dogCoatFilter} />
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
