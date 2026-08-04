"use client";

import Image from "next/image";
import Link from "next/link";
import { Zen_Maru_Gothic } from "next/font/google";
import { categoryHref } from "@/lib/categories";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { TranslationKey } from "@/lib/i18n/translations";

const zenMaru = Zen_Maru_Gothic({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

type Chapter = {
  titleKey: TranslationKey;
  bodyKey: TranslationKey;
  image: string;
  imageAltKey: TranslationKey;
};

const CHAPTERS: Chapter[] = [
  {
    titleKey: "aboutCatChapter1Title",
    bodyKey: "aboutCatChapter1Body",
    image: "/products/bestseller-cat-tower.webp",
    imageAltKey: "aboutCatChapter1Alt",
  },
  {
    titleKey: "aboutCatChapter2Title",
    bodyKey: "aboutCatChapter2Body",
    image: "/products/cat-auto-water-fountain.webp",
    imageAltKey: "aboutCatChapter2Alt",
  },
  {
    titleKey: "aboutCatChapter3Title",
    bodyKey: "aboutCatChapter3Body",
    image: "/products/cleaning-paw-wipes.webp",
    imageAltKey: "aboutCatChapter3Alt",
  },
  {
    titleKey: "aboutCatChapter4Title",
    bodyKey: "aboutCatChapter4Body",
    image: "/products/cat-catnip-toy.webp",
    imageAltKey: "aboutCatChapter4Alt",
  },
  {
    titleKey: "aboutCatChapter5Title",
    bodyKey: "aboutCatChapter5Body",
    image: "/products/cat-probiotics.webp",
    imageAltKey: "aboutCatChapter5Alt",
  },
];

/**
 * Japanese-style picture-book guide for new cat parents.
 */
export function AboutCatBook() {
  const { t } = useI18n();

  return (
    <div
      className={`${zenMaru.variable} min-h-[70vh] bg-[#FAF6F0] text-[#4A3B32]`}
      style={{ fontFamily: "var(--font-about-cat), var(--font-sans)" }}
    >
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="mb-6">
          <Link
            href="/menu"
            className="text-sm font-medium text-[#4A3B32]/70 transition hover:text-[#4A3B32]"
          >
            ← {t("aboutCatBackToCatalog")}
          </Link>
        </p>

        <header className="mb-12 max-w-2xl animate-[fadeUp_0.55s_ease_both] sm:mb-16">
          <p className="text-sm font-medium tracking-[0.08em] text-[#4A3B32]/65">
            {t("aboutCatEyebrow")}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            {t("aboutCatTitle")}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-[#4A3B32]/80 sm:text-lg">
            {t("aboutCatSubtitle")}
          </p>
        </header>

        <div className="space-y-12 sm:space-y-16">
          {CHAPTERS.map((chapter, index) => {
            const imageLeft = index % 2 === 0;
            return (
              <section
                key={chapter.titleKey}
                className={`grid items-center gap-6 sm:gap-10 md:grid-cols-2 ${
                  imageLeft ? "" : "md:[&>*:first-child]:order-2"
                }`}
                style={{
                  animation: `fadeUp 0.6s ease both`,
                  animationDelay: `${0.08 * (index + 1)}s`,
                }}
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-[#4A3B32]/12 bg-white shadow-[0_18px_36px_-22px_rgba(74,59,50,0.45)]">
                  <Image
                    src={chapter.image}
                    alt={t(chapter.imageAltKey)}
                    fill
                    sizes="(min-width: 768px) 40vw, 90vw"
                    className="object-cover"
                  />
                </div>
                <div className="space-y-3">
                  <p className="text-xs font-semibold tracking-[0.14em] text-[#4A3B32]/55">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h2 className="text-2xl font-bold tracking-tight sm:text-[1.7rem]">
                    {t(chapter.titleKey)}
                  </h2>
                  <p className="text-[0.98rem] leading-relaxed text-[#4A3B32]/85 sm:text-base">
                    {t(chapter.bodyKey)}
                  </p>
                </div>
              </section>
            );
          })}
        </div>

        <div
          className="mt-14 flex justify-center sm:mt-20"
          style={{ animation: "fadeUp 0.6s ease both", animationDelay: "0.55s" }}
        >
          <Link
            href={categoryHref("cats")}
            className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[#4A3B32]/15 bg-[#4A3B32] px-6 py-3 text-sm font-semibold text-[#FAF6F0] shadow-[0_14px_28px_-16px_rgba(74,59,50,0.55)] transition hover:-translate-y-0.5 hover:bg-[#3a2e27] hover:shadow-[0_18px_32px_-14px_rgba(74,59,50,0.6)] active:translate-y-0"
          >
            {t("aboutCatShopCta")}
          </Link>
        </div>
      </div>
    </div>
  );
}
