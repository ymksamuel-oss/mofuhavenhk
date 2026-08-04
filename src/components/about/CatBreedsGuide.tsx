"use client";

import { useMemo, useState, type SyntheticEvent } from "react";
import Link from "next/link";
import { Zen_Maru_Gothic } from "next/font/google";
import {
  CAT_BREEDS,
  CAT_BREED_IMAGE_FALLBACK,
  filterCatBreeds,
  type CatCoatFilter,
} from "@/lib/catBreeds";
import { categoryHref } from "@/lib/categories";
import { useI18n } from "@/lib/i18n/I18nProvider";

const zenMaru = Zen_Maru_Gothic({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const FILTERS: { id: CatCoatFilter; labelKey: "catBreedsFilterAll" | "catBreedsFilterShort" | "catBreedsFilterLong" }[] =
  [
    { id: "all", labelKey: "catBreedsFilterAll" },
    { id: "short", labelKey: "catBreedsFilterShort" },
    { id: "long", labelKey: "catBreedsFilterLong" },
  ];

function filterChipClass(active: boolean) {
  return `shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
    active
      ? "border-[#4A3B32] bg-[#4A3B32] text-[#FAF6F0] shadow-[0_10px_20px_-12px_rgba(74,59,50,0.55)]"
      : "border-[#4A3B32]/18 bg-[#FFFCFA] text-[#4A3B32]/75 hover:border-[#4A3B32]/45 hover:text-[#4A3B32]"
  }`;
}

function handleBreedImageError(event: SyntheticEvent<HTMLImageElement>) {
  const image = event.currentTarget;
  if (image.dataset.fallbackApplied === "true") return;
  image.dataset.fallbackApplied = "true";
  image.src = CAT_BREED_IMAGE_FALLBACK;
}

/**
 * Japanese-style cat breed guide with coat-length filters.
 */
export function CatBreedsGuide() {
  const { locale, t } = useI18n();
  const [filter, setFilter] = useState<CatCoatFilter>("all");
  const breeds = useMemo(() => filterCatBreeds(filter), [filter]);

  return (
    <div
      className={`${zenMaru.className} min-h-[70vh] bg-[#FAF6F0] text-[#4A3B32]`}
    >
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="mb-6">
          <Link
            href="/menu"
            className="text-sm font-medium text-[#4A3B32]/70 transition hover:text-[#4A3B32]"
          >
            ← {t("catBreedsBackToCatalog")}
          </Link>
        </p>

        <header className="mb-8 max-w-3xl sm:mb-10">
          <p className="text-sm font-medium tracking-[0.08em] text-[#4A3B32]/65">
            {t("catBreedsEyebrow")}
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
            {t("catBreedsTitle")}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-[#4A3B32]/80 sm:text-lg">
            {t("catBreedsSubtitle")}
          </p>
        </header>

        <div
          role="group"
          aria-label={t("catBreedsFilterLabel")}
          className="mb-8 flex flex-wrap gap-2 sm:mb-10"
        >
          {FILTERS.map(({ id, labelKey }) => (
            <button
              key={id}
              type="button"
              className={filterChipClass(filter === id)}
              aria-pressed={filter === id}
              onClick={() => setFilter(id)}
            >
              {t(labelKey)}
            </button>
          ))}
        </div>

        {breeds.length === 0 ? (
          <p className="text-sm text-[#4A3B32]/70">{t("catBreedsEmpty")}</p>
        ) : (
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {breeds.map((breed) => (
              <li
                key={breed.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-[#4A3B32]/12 bg-[#FFFCFA] shadow-[0_18px_36px_-22px_rgba(74,59,50,0.4)]"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#FAF6F0]">
                  {/* External Unsplash — native img avoids next.config remotePatterns. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={breed.image}
                    alt={breed.imageAlt[locale]}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.12em] text-[#4A3B32]/55">
                      {breed.coatLabel[locale]}
                    </p>
                    <h2 className="mt-1 text-xl font-bold tracking-tight">
                      {breed.name[locale]}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-[#4A3B32]/85">
                      {breed.summary[locale]}
                    </p>
                  </div>
                  <Link
                    href={categoryHref("cats")}
                    className="mt-auto inline-flex min-h-11 items-center justify-center rounded-2xl border border-[#4A3B32]/15 bg-[#4A3B32] px-4 py-2.5 text-sm font-semibold text-[#FAF6F0] transition hover:-translate-y-0.5 hover:bg-[#3a2e27]"
                  >
                    {t("catBreedsShopCta")}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
