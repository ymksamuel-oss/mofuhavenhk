"use client";

import Image from "next/image";
import Link from "next/link";
import { DogBehaviorGuide } from "@/components/about/DogBehaviorGuide";
import { DogFAQSection } from "@/components/about/DogFAQSection";
import { categoryHref } from "@/lib/categories";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { TranslationKey } from "@/lib/i18n/translations";

type Chapter = {
  titleKey: TranslationKey;
  bodyKey: TranslationKey;
  image: string;
  imageAltKey: TranslationKey;
};

const CHAPTERS: Chapter[] = [
  {
    titleKey: "aboutDogChapter1Title",
    bodyKey: "aboutDogChapter1Body",
    image: "/images/about/book-01-welcome.jpg",
    imageAltKey: "aboutDogChapter1Alt",
  },
  {
    titleKey: "aboutDogChapter2Title",
    bodyKey: "aboutDogChapter2Body",
    image: "/images/about/book-02-nutrition.jpg",
    imageAltKey: "aboutDogChapter2Alt",
  },
  {
    titleKey: "aboutDogChapter3Title",
    bodyKey: "aboutDogChapter3Body",
    image: "/images/about/book-03-grooming.jpg",
    imageAltKey: "aboutDogChapter3Alt",
  },
  {
    titleKey: "aboutDogChapter4Title",
    bodyKey: "aboutDogChapter4Body",
    image: "/images/about/book-04-walking.jpg",
    imageAltKey: "aboutDogChapter4Alt",
  },
  {
    titleKey: "aboutDogChapter5Title",
    bodyKey: "aboutDogChapter5Body",
    image: "/images/about/book-05-health.jpg",
    imageAltKey: "aboutDogChapter5Alt",
  },
];

/**
 * Japanese-style picture-book guide for new dog parents.
 * Mirrors the About Cat layout and visual language.
 */
export function AboutDogBook() {
  const { t, locale } = useI18n();
  const isEn = locale === "en";

  return (
    <div
      className="min-h-[70vh] bg-[#fdfbf7] font-sans text-[#2B2623]"
    >
      <div className="mx-auto max-w-5xl bg-[#fdfbf7] px-4 py-10 sm:px-6 sm:py-14">
        <p className="mb-6">
          <Link
            href="/menu"
            className="text-sm font-medium text-[#2B2623]/70 transition hover:text-[#2B2623]"
          >
            ← {t("aboutDogBackToCatalog")}
          </Link>
        </p>

        <header className="mb-12 max-w-2xl animate-[fadeUp_0.55s_ease_both] sm:mb-16">
          <p className="text-sm font-medium tracking-[0.08em] text-[#2B2623]/65">
            {t("aboutDogEyebrow")}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            {t("aboutDogTitle")}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-[#2B2623]/80 sm:text-lg">
            {t("aboutDogSubtitle")}
          </p>
        </header>

        <div className="space-y-12 bg-[#fdfbf7] sm:space-y-16">
          {CHAPTERS.map((chapter, index) => {
            const imageLeft = index % 2 === 0;
            return (
              <section
                key={chapter.titleKey}
                className={`grid items-center gap-6 rounded-3xl border border-neutral-200/80 bg-[#fdfbf7] p-4 sm:gap-8 sm:p-6 md:grid-cols-2 md:p-7 ${
                  imageLeft ? "" : "md:[&>*:first-child]:order-2"
                }`}
                style={{
                  animation: `fadeUp 0.6s ease both`,
                  animationDelay: `${0.08 * (index + 1)}s`,
                }}
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#f4efe7]">
                  {isEn ? (
                    <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-[#F8F1E5] via-[#FDFBF7] to-[#E9DFD1] p-6 text-center">
                      <span className="text-sm font-semibold tracking-[0.2em] text-[#9A7757]">DOG CARE GUIDE</span>
                      <span className="mt-3 text-5xl font-bold text-[#C9A47B]">{String(CHAPTERS.indexOf(chapter) + 1).padStart(2, "0")}</span>
                      <span className="mt-3 max-w-sm text-xl font-bold leading-snug text-[#3E2B20]">{t(chapter.titleKey)}</span>
                    </div>
                  ) : (
                    <Image
                      src={chapter.image}
                      alt={t(chapter.imageAltKey)}
                      fill
                      sizes="(min-width: 768px) 44vw, 100vw"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="space-y-3 py-2 md:px-2">
                  <p className="text-xs font-semibold tracking-[0.14em] text-[#2B2623]/55">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h2 className="text-2xl font-bold tracking-tight sm:text-[1.7rem]">
                    {t(chapter.titleKey)}
                  </h2>
                  <p className="text-[0.98rem] leading-relaxed text-[#2B2623]/85 sm:text-base">
                    {t(chapter.bodyKey)}
                  </p>
                </div>
              </section>
            );
          })}
        </div>

        <DogBehaviorGuide />
        <DogFAQSection />

        <div
          className="mt-14 flex justify-center sm:mt-20"
          style={{ animation: "fadeUp 0.6s ease both", animationDelay: "0.55s" }}
        >
          <Link
            href={categoryHref("dogs")}
            className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[#2B2623]/15 bg-[#2B2623] px-6 py-3 text-sm font-semibold text-[#FBF9F6] shadow-[0_14px_28px_-16px_rgba(74,59,50,0.55)] transition hover:-translate-y-0.5 hover:bg-[#3a2e27] hover:shadow-[0_18px_32px_-14px_rgba(74,59,50,0.6)] active:translate-y-0"
          >
            {t("aboutDogShopCta")}
          </Link>
        </div>
      </div>
    </div>
  );
}
