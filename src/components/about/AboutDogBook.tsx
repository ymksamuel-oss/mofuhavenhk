"use client";

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
    titleKey: "aboutDogChapter1Title",
    bodyKey: "aboutDogChapter1Body",
    image:
      "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&auto=format&fit=crop",
    imageAltKey: "aboutDogChapter1Alt",
  },
  {
    titleKey: "aboutDogChapter2Title",
    bodyKey: "aboutDogChapter2Body",
    image:
      "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&auto=format&fit=crop",
    imageAltKey: "aboutDogChapter2Alt",
  },
  {
    titleKey: "aboutDogChapter3Title",
    bodyKey: "aboutDogChapter3Body",
    image:
      "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=800&auto=format&fit=crop",
    imageAltKey: "aboutDogChapter3Alt",
  },
  {
    titleKey: "aboutDogChapter4Title",
    bodyKey: "aboutDogChapter4Body",
    image:
      "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=800&auto=format&fit=crop",
    imageAltKey: "aboutDogChapter4Alt",
  },
  {
    titleKey: "aboutDogChapter5Title",
    bodyKey: "aboutDogChapter5Body",
    image:
      "https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&auto=format&fit=crop",
    imageAltKey: "aboutDogChapter5Alt",
  },
];

/**
 * Japanese-style picture-book guide for new dog parents.
 * Mirrors the About Cat layout and visual language.
 */
export function AboutDogBook() {
  const { t } = useI18n();

  return (
    <div
      className={`${zenMaru.className} min-h-[70vh] bg-[#FAF6F0] text-[#4A3B32]`}
    >
      <div className="mx-auto max-w-5xl bg-[#FAF6F0] px-4 py-10 sm:px-6 sm:py-14">
        <p className="mb-6 bg-[#FAF6F0]">
          <Link
            href="/menu"
            className="text-sm font-medium text-[#4A3B32]/70 transition hover:text-[#4A3B32]"
          >
            ← {t("aboutDogBackToCatalog")}
          </Link>
        </p>

        <header className="mb-12 max-w-2xl animate-[fadeUp_0.55s_ease_both] bg-[#FAF6F0] sm:mb-16">
          <p className="text-sm font-medium tracking-[0.08em] text-[#4A3B32]/65">
            {t("aboutDogEyebrow")}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            {t("aboutDogTitle")}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-[#4A3B32]/80 sm:text-lg">
            {t("aboutDogSubtitle")}
          </p>
        </header>

        <div className="space-y-12 bg-[#FAF6F0] sm:space-y-16">
          {CHAPTERS.map((chapter, index) => {
            const imageLeft = index % 2 === 0;
            return (
              <section
                key={chapter.titleKey}
                className={`grid items-center gap-6 bg-[#FAF6F0] sm:gap-10 md:grid-cols-2 ${
                  imageLeft ? "" : "md:[&>*:first-child]:order-2"
                }`}
                style={{
                  animation: `fadeUp 0.6s ease both`,
                  animationDelay: `${0.08 * (index + 1)}s`,
                }}
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-[#4A3B32]/12 bg-[#FAF6F0] shadow-[0_18px_36px_-22px_rgba(74,59,50,0.45)]">
                  {/* External Unsplash URLs — native img avoids next.config remotePatterns. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={chapter.image}
                    alt={t(chapter.imageAltKey)}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
                <div className="space-y-3 bg-[#FAF6F0]">
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
            href={categoryHref("dogs")}
            className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[#4A3B32]/15 bg-[#4A3B32] px-6 py-3 text-sm font-semibold text-[#FAF6F0] shadow-[0_14px_28px_-16px_rgba(74,59,50,0.55)] transition hover:-translate-y-0.5 hover:bg-[#3a2e27] hover:shadow-[0_18px_32px_-14px_rgba(74,59,50,0.6)] active:translate-y-0"
          >
            {t("aboutDogShopCta")}
          </Link>
        </div>
      </div>
    </div>
  );
}
