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
import { HomeProductMarquee } from "@/components/home/HomeProductMarquee";
import { ProductSearch } from "@/components/ProductSearch";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function HomePage() {
  const { t } = useI18n();
  const [isDesktopHero, setIsDesktopHero] = useState(false);
  const [exploreAnimal, setExploreAnimal] = useState<AnimalTab>("cats");
  const [dogCoatFilter, setDogCoatFilter] = useState<DogCoatFilter>("all");

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    const updateHeroVariant = () => setIsDesktopHero(desktopQuery.matches);
    updateHeroVariant();
    desktopQuery.addEventListener("change", updateHeroVariant);
    return () => desktopQuery.removeEventListener("change", updateHeroVariant);
  }, []);

  return (
    <>
      <section className="mobile-home-soft-surface bg-[color:var(--background)] px-4 pb-4 pt-3 sm:px-8 sm:pb-8 sm:pt-6 lg:px-12 lg:pb-10">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[1.5rem] border border-[#d7b893]/65 bg-[#ead7bf] shadow-[0_22px_52px_-38px_rgba(75,54,33,0.58)] sm:rounded-[2rem] lg:grid lg:min-h-[31rem] lg:grid-cols-[1.06fr_0.94fr]">
          <div className="relative h-[14rem] overflow-hidden sm:h-[20rem] lg:h-auto lg:min-h-0">
            {isDesktopHero ? (
              <Image
                src="/images/hero-sleeping-shiba-taupe.jpg"
                alt={t("homeHeroImageAlt")}
                fill
                priority
                sizes="53vw"
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
          </div>

          <div className="hidden min-h-0 flex-col items-center justify-center bg-[#ead7bf] px-5 py-4 text-center sm:px-10 sm:py-9 lg:flex lg:min-h-0 lg:items-start lg:px-14 lg:py-12 lg:text-left">
            <BrandLogo title="Mofu Haven" className="h-10 sm:h-20 lg:h-32" />
            <h1 className="mt-2 max-w-md font-[family-name:var(--font-display)] text-xl font-semibold leading-snug tracking-[-0.025em] text-[#4b3621] sm:mt-4 sm:text-3xl lg:mt-6 lg:text-[2.75rem]">
              {t("homeHeadline")}
            </h1>
            <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-[#725c45] sm:mt-3 sm:text-base lg:text-lg">
              {t("homeSub")}
            </p>
          </div>
        </div>

        <section aria-labelledby="home-slogan-title" className="mx-auto mt-5 max-w-7xl border-y border-[#cbb09a]/50 px-2 py-7 text-center sm:mt-7 sm:px-8 sm:py-10 lg:mt-10 lg:px-14 lg:py-12 lg:text-left">
          <div className="flex items-center justify-center gap-3 text-[10px] font-semibold tracking-[0.22em] text-[#7a5d4a] lg:justify-start">
            <span>MOFU HAVEN</span>
            <span aria-hidden className="h-px w-10 bg-[#b99476]/65" />
            <span>PET JOURNAL</span>
          </div>
          <h2 id="home-slogan-title" className="mt-3 font-serif text-3xl italic tracking-[-0.025em] text-[#4b3621] sm:mt-4 sm:text-4xl lg:text-[2.7rem]">
            {t("homeSloganTitle")}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#725c45] sm:mt-4 sm:text-base sm:leading-8 lg:mx-0 lg:text-lg">
            {t("homeSloganBody")}
          </p>
        </section>

      </section>

      <HomepageProductGrid />

      <HomeProductMarquee />

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
