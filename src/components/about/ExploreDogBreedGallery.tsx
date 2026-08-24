"use client";

import Image from "next/image";
import { DOG_BREEDS } from "@/lib/dogBreeds";
import { useI18n } from "@/lib/i18n/I18nProvider";

type DogCoatFilter = "all" | "short" | "long";

/** Dog-breed editorial cards for the homepage Explore Pets World section. */
export function ExploreDogBreedGallery({ coatFilter = "all" }: { coatFilter?: DogCoatFilter }) {
  const { locale, t } = useI18n();
  const isEn = locale === "en";
  const visibleBreeds = coatFilter === "all"
    ? DOG_BREEDS
    : DOG_BREEDS.filter((breed) => breed.coatType === coatFilter);

  return (
    <div className="mt-12 border-t border-[#2B2623]/10 pt-8 sm:mt-16 sm:pt-10" id="dog-breeds">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-[#2B2623]/55 sm:text-sm">
            {t("dogBreedsEyebrow")}
          </p>
          <h3 className="mt-1 text-2xl font-semibold tracking-tight text-[#2B2623] sm:text-3xl">
            {t("dogBreedsTitle")}
          </h3>
        </div>
        <span className="shrink-0 text-xs text-[#2B2623]/55 sm:text-sm">
          {visibleBreeds.length} {t("dogBreedsCount")}
        </span>
      </div>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {visibleBreeds.map((breed) => (
          <li key={breed.id}>
            <article className="group h-full overflow-hidden rounded-2xl border border-[#2B2623]/10 bg-white transition duration-200 hover:-translate-y-0.5 hover:border-[#2B2623]/25 hover:shadow-[0_18px_30px_-22px_rgba(74,59,50,0.55)]">
              <div className="relative aspect-[4/3] overflow-hidden bg-[#FBF9F6]">
                <Image
                  src={breed.imageUrl}
                  alt={isEn ? breed.nameEn : breed.name}
                  fill
                  sizes="(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 45vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="flex h-full flex-col gap-2 p-3 sm:p-4">
                <p className="text-[10px] font-semibold tracking-[0.12em] text-[#2B2623]/55 sm:text-xs">
                  {isEn ? breed.coatLabelEn : breed.coatLabel}
                </p>
                <h4 className="text-sm font-bold text-[#2B2623] sm:text-base">
                  {isEn ? breed.nameEn : breed.name}
                </h4>
                <p className="text-xs leading-relaxed text-[#2B2623]/75 sm:text-sm">
                  {isEn ? breed.shortDescriptionEn : breed.shortDescription}
                </p>
                <dl className="mt-auto grid gap-1 border-t border-[#2B2623]/8 pt-2 text-[10px] leading-relaxed text-[#2B2623]/65 sm:text-xs">
                  <div>
                    <dt className="inline font-semibold">{t("dogBreedsPersonality")}：</dt>{" "}
                    <dd className="inline">{isEn ? breed.personalityEn : breed.personality}</dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold">{t("dogBreedsCare")}：</dt>{" "}
                    <dd className="inline">{isEn ? breed.careEn : breed.care}</dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold">{t("dogBreedsExercise")}：</dt>{" "}
                    <dd className="inline">{isEn ? breed.exerciseEn : breed.exercise}</dd>
                  </div>
                </dl>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
