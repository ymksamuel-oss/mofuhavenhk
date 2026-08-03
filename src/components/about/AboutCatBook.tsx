"use client";

import Image from "next/image";
import Link from "next/link";
import { ABOUT_CAT_CHAPTERS } from "@/lib/aboutCat";
import { categoryHref } from "@/lib/categories";
import { useI18n } from "@/lib/i18n/I18nProvider";

/**
 * Japanese picture-book style guide for new cat guardians.
 * Alternating image/text rows on a warm cream canvas.
 */
export function AboutCatBook() {
  const { locale, t } = useI18n();

  return (
    <div
      className="min-h-[70vh] w-full"
      style={{ backgroundColor: "#FAF6F0", color: "#4A3B32" }}
    >
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="mb-5">
          <Link
            href="/menu"
            className="text-sm font-medium text-[#8A7360] transition hover:text-[#A97C50]"
          >
            ← {t("aboutCatBackToMenu")}
          </Link>
        </p>

        <header className="mb-10 max-w-2xl sm:mb-14">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-[#A97C50]">
            {t("aboutCatEyebrow")}
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-[-0.02em] text-[#4A3B32] sm:text-4xl">
            {t("aboutCatTitle")}
          </h1>
          <p className="mt-3 text-[0.95rem] leading-relaxed text-[#6B574C] sm:text-base">
            {t("aboutCatSubtitle")}
          </p>
        </header>

        <ol className="space-y-12 sm:space-y-16">
          {ABOUT_CAT_CHAPTERS.map((chapter, index) => {
            const imageRight = index % 2 === 1;

            return (
              <li
                key={chapter.id}
                className={`flex flex-col items-center gap-6 sm:gap-10 ${
                  imageRight ? "md:flex-row-reverse" : "md:flex-row"
                }`}
              >
                <div className="w-full shrink-0 md:w-[44%]">
                  <div className="overflow-hidden rounded-2xl border border-[#E8DCC8] bg-white shadow-[0_18px_36px_-22px_rgba(74,59,50,0.45)]">
                    <div className="relative aspect-square w-full">
                      <Image
                        src={chapter.image}
                        alt={chapter.imageAlt[locale]}
                        fill
                        sizes="(min-width: 768px) 40vw, 90vw"
                        className="object-cover"
                        priority={index === 0}
                      />
                    </div>
                  </div>
                </div>

                <div className="min-w-0 flex-1 md:px-2">
                  <p className="mb-2 text-xs font-semibold tracking-[0.12em] text-[#A97C50]">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold leading-snug tracking-[-0.015em] text-[#4A3B32] sm:text-2xl">
                    {chapter.title[locale]}
                  </h2>
                  <p className="mt-3 text-[0.95rem] leading-relaxed text-[#6B574C] sm:text-base">
                    {chapter.body[locale]}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-14 flex justify-center sm:mt-16">
          <Link
            href={categoryHref("cats")}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#A97C50] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_28px_-16px_rgba(169,124,80,0.85)] transition hover:-translate-y-0.5 hover:bg-[#966c45]"
          >
            {t("aboutCatShopCta")}
          </Link>
        </div>
      </div>
    </div>
  );
}
