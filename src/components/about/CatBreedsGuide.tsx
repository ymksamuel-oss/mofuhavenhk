"use client";

import { useMemo, useState, type SyntheticEvent } from "react";
import Link from "next/link";
import {
  CAT_BREED_IMAGE_FALLBACK,
  filterCatBreeds,
  type CatCoatFilter,
} from "@/lib/catBreeds";
import { useI18n } from "@/lib/i18n/I18nProvider";

const FILTERS: {
  id: CatCoatFilter;
  labelKey:
    | "catBreedsFilterAll"
    | "catBreedsFilterShort"
    | "catBreedsFilterLong";
}[] = [
  { id: "all", labelKey: "catBreedsFilterAll" },
  { id: "short", labelKey: "catBreedsFilterShort" },
  { id: "long", labelKey: "catBreedsFilterLong" },
];

function filterChipClass(active: boolean) {
  return `shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
    active
      ? "border-[#2B2623] bg-[#2B2623] text-[#FBF9F6] shadow-[0_10px_20px_-12px_rgba(74,59,50,0.55)]"
      : "border-[#2B2623]/18 bg-[#FFFFFF] text-[#2B2623]/75 hover:border-[#2B2623]/45 hover:text-[#2B2623]"
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
  const { t, locale } = useI18n();
  const [filter, setFilter] = useState<CatCoatFilter>("all");
  const breeds = useMemo(() => filterCatBreeds(filter), [filter]);
  const isEn = locale === "en";

  return (
    <div className="min-h-[70vh] bg-[#FBF9F6] font-sans text-[#2B2623]">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="mb-6">
          <Link
            href="/menu"
            className="text-sm font-medium text-[#2B2623]/70 transition hover:text-[#2B2623]"
          >
            ← {t("catBreedsBackToCatalog")}
          </Link>
        </p>

        <header className="mb-8 max-w-3xl sm:mb-10">
          <p className="text-sm font-medium tracking-[0.08em] text-[#2B2623]/65">
            {t("catBreedsEyebrow")}
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
            {t("catBreedsTitle")}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-[#2B2623]/80 sm:text-lg">
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
          <p className="text-sm text-[#2B2623]/70">{t("catBreedsEmpty")}</p>
        ) : (
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {breeds.map((breed) => (
              <li key={breed.id}>
                <Link
                  href={`/cat-breeds/${breed.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#2B2623]/12 bg-[#FFFFFF] shadow-[0_18px_36px_-22px_rgba(74,59,50,0.4)] transition duration-200 hover:-translate-y-1 hover:border-[#2B2623]/25 hover:shadow-[0_24px_40px_-20px_rgba(74,59,50,0.5)]"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#FBF9F6]">
                    {/* External Unsplash — native img avoids next.config remotePatterns. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={breed.imageUrl}
                      alt={isEn ? breed.nameEn : breed.name}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                      onError={handleBreedImageError}
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-2 px-5 pb-5 pt-4">
                    <p className="text-xs font-semibold tracking-[0.12em] text-[#2B2623]/55">
                      {isEn ? breed.coatLabelEn : breed.coatLabel}
                    </p>
                    <h2 className="text-xl font-bold tracking-tight">
                      {isEn ? breed.nameEn : breed.name}
                    </h2>
                    <p className="text-sm leading-relaxed text-[#2B2623]/85">
                      {isEn ? breed.shortDescriptionEn : breed.shortDescription}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
