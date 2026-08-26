"use client";

import { useEffect, useMemo, useState, type SyntheticEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CAT_BREED_IMAGE_FALLBACK,
  filterCatBreeds,
  type CatCoatFilter,
} from "@/lib/catBreeds";
import { DOG_BREEDS } from "@/lib/dogBreeds";
import { useI18n } from "@/lib/i18n/I18nProvider";

const CAT_FILTERS: { id: CatCoatFilter; labelKey: "catBreedsFilterAll" | "catBreedsFilterShort" | "catBreedsFilterLong" }[] = [
  { id: "all", labelKey: "catBreedsFilterAll" },
  { id: "short", labelKey: "catBreedsFilterShort" },
  { id: "long", labelKey: "catBreedsFilterLong" },
];

type AnimalTab = "cats" | "dogs";
type DogCoatFilter = "all" | "short" | "long";

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

export function CatBreedsGuide() {
  const { t, locale } = useI18n();
  const searchParams = useSearchParams();
  const [animal, setAnimal] = useState<AnimalTab>("cats");

  useEffect(() => {
    setAnimal(searchParams.get("animal") === "dogs" ? "dogs" : "cats");
  }, [searchParams]);
  const [catFilter, setCatFilter] = useState<CatCoatFilter>("all");
  const [dogFilter, setDogFilter] = useState<DogCoatFilter>("all");
  const isEn = locale === "en";
  const catBreeds = useMemo(() => filterCatBreeds(catFilter), [catFilter]);
  const dogBreeds = useMemo(
    () => dogFilter === "all" ? DOG_BREEDS : DOG_BREEDS.filter((breed) => breed.coatType === dogFilter),
    [dogFilter],
  );

  return (
    <div className="min-h-[70vh] bg-[#FBF9F6] font-sans text-[#2B2623]">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="mb-6">
          <Link href="/menu" className="text-sm font-medium text-[#2B2623]/70 transition hover:text-[#2B2623]">
            ← {t("catBreedsBackToCatalog")}
          </Link>
        </p>

        <header className="mb-6 max-w-3xl sm:mb-8">
          <p className="text-sm font-medium tracking-[0.08em] text-[#2B2623]/65">
            {animal === "cats" ? t("catBreedsEyebrow") : t("dogBreedsEyebrow")}
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
            {animal === "cats" ? t("catBreedsTitle") : t("dogBreedsPageTitle")}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-[#2B2623]/80 sm:text-lg">
            {animal === "cats" ? t("catBreedsSubtitle") : t("dogBreedsPageSubtitle")}
          </p>
        </header>

        <div role="group" aria-label={t("petGuideFilterLabel")} className="mb-5 flex flex-wrap gap-2">
          <button type="button" className={filterChipClass(animal === "cats")} aria-pressed={animal === "cats"} onClick={() => setAnimal("cats")}>
            {t("exploreCats")}
          </button>
          <button type="button" className={filterChipClass(animal === "dogs")} aria-pressed={animal === "dogs"} onClick={() => setAnimal("dogs")}>
            {t("exploreDogs")}
          </button>
        </div>

        {animal === "cats" ? (
          <>
            <div role="group" aria-label={t("catBreedsFilterLabel")} className="mb-8 flex flex-wrap gap-2 sm:mb-10">
              {CAT_FILTERS.map(({ id, labelKey }) => (
                <button key={id} type="button" className={filterChipClass(catFilter === id)} aria-pressed={catFilter === id} onClick={() => setCatFilter(id)}>
                  {t(labelKey)}
                </button>
              ))}
            </div>
            {catBreeds.length === 0 ? (
              <p className="text-sm text-[#2B2623]/70">{t("catBreedsEmpty")}</p>
            ) : (
              <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                {catBreeds.map((breed) => (
                  <li key={breed.id}>
                    <Link href={`/cat-breeds/${breed.slug}`} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#2B2623]/12 bg-[#FFFFFF] shadow-[0_18px_36px_-22px_rgba(74,59,50,0.4)] transition duration-200 hover:-translate-y-1 hover:border-[#2B2623]/25">
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#FBF9F6]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={breed.imageUrl} alt={isEn ? breed.nameEn : breed.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" onError={handleBreedImageError} />
                      </div>
                      <div className="flex flex-1 flex-col gap-2 px-5 pb-5 pt-4">
                        <p className="text-xs font-semibold tracking-[0.12em] text-[#2B2623]/55">{isEn ? breed.coatLabelEn : breed.coatLabel}</p>
                        <h2 className="text-xl font-bold tracking-tight">{isEn ? breed.nameEn : breed.name}</h2>
                        <p className="text-sm leading-relaxed text-[#2B2623]/85">{isEn ? breed.shortDescriptionEn : breed.shortDescription}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <>
            <div role="group" aria-label={t("dogBreedsFilterLabel")} className="mb-8 flex flex-wrap gap-2 sm:mb-10">
              {(["all", "long", "short"] as const).map((id) => (
                <button key={id} type="button" className={filterChipClass(dogFilter === id)} aria-pressed={dogFilter === id} onClick={() => setDogFilter(id)}>
                  {t(id === "all" ? "allDogs" : id === "long" ? "longHairedDogs" : "shortHairedDogs")}
                </button>
              ))}
            </div>
            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {dogBreeds.map((breed) => (
                <li key={breed.id}>
                  <Link href={`/dog-breeds/${breed.slug}`} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#2B2623]/12 bg-white shadow-[0_18px_36px_-22px_rgba(74,59,50,0.4)] transition duration-200 hover:-translate-y-1 hover:border-[#2B2623]/25">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={breed.imageUrl} alt={isEn ? breed.nameEn : breed.name} className="aspect-[4/3] w-full object-cover" loading="lazy" />
                    <div className="flex flex-1 flex-col gap-2 px-5 pb-5 pt-4">
                      <p className="text-xs font-semibold tracking-[0.12em] text-[#2B2623]/55">{isEn ? breed.coatLabelEn : breed.coatLabel}</p>
                      <h2 className="text-xl font-bold tracking-tight">{isEn ? breed.nameEn : breed.name}</h2>
                      <p className="text-sm leading-relaxed text-[#2B2623]/85">{isEn ? breed.shortDescriptionEn : breed.shortDescription}</p>
                      <dl className="mt-auto grid gap-1 border-t border-[#2B2623]/8 pt-2 text-xs leading-relaxed text-[#2B2623]/70">
                        <div><dt className="inline font-semibold">{t("dogBreedsPersonality")}：</dt> <dd className="inline">{isEn ? breed.personalityEn : breed.personality}</dd></div>
                        <div><dt className="inline font-semibold">{t("dogBreedsCare")}：</dt> <dd className="inline">{isEn ? breed.careEn : breed.care}</dd></div>
                        <div><dt className="inline font-semibold">{t("dogBreedsExercise")}：</dt> <dd className="inline">{isEn ? breed.exerciseEn : breed.exercise}</dd></div>
                      </dl>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
