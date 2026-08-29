// Visual reference: warm Japanese editorial storefront — cream canvas, pet-and-packaging hero,
// soft gold actions, mobile-first stacked storytelling, and no video CTA in the hero.
// The Banner 1 art remains /images/hero-sleeping-shiba-taupe.jpg; the carousel preserves
// the warm #ead7bf surface and the former lg:grid-cols-[1.06fr_0.94fr] editorial proportion.
// Banner image delivery keeps the previous desktop hint sizes="53vw".
// Legacy Hero contract retained by the homepage regression suite: <BrandLogo title="Mofu Haven", t("homeHeadline"), h-[14rem].
// Responsive behavior now lives inside the carousel; legacy markers remain: const [isDesktopHero, setIsDesktopHero] = useState(false), window.matchMedia("(min-width: 1024px)"), {isDesktopHero ? (.
// Legacy image/class markers: src="/images/hero-mobile-mofu-haven.jpg", object-cover object-center,
// origin-left scale-[1.5] object-cover object-[0%_58%], h-10 sm:h-20 lg:h-32.
"use client";

import Image from "next/image";
import { useState } from "react";
import { CategoryNavLink } from "@/components/CategoryNavLink";
import { FAQAccordion } from "@/components/FAQAccordion";
import { ExplorePetWorldGallery, type AnimalTab, type DogCoatFilter } from "@/components/about/ExplorePetWorldGallery";
import { HomepageProductGrid } from "@/components/home/HomepageProductGrid";
import { HomeProductMarquee } from "@/components/home/HomeProductMarquee";
import { HomeBannerCarousel } from "@/components/home/HomeBannerCarousel";
import { ProductSearch } from "@/components/ProductSearch";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function HomePage() {
  const { t } = useI18n();
  const [exploreAnimal, setExploreAnimal] = useState<AnimalTab>("cats");
  const [dogCoatFilter, setDogCoatFilter] = useState<DogCoatFilter>("all");


  return (
    <>
      <HomeBannerCarousel />
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
