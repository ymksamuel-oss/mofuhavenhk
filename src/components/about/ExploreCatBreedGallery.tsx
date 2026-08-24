"use client";

import Image from "next/image";
import Link from "next/link";
import { catBreedsData } from "@/lib/catBreeds";
import { CAT_BREED_GALLERY_IMAGES } from "@/lib/catBreedGallery";
import { useI18n } from "@/lib/i18n/I18nProvider";

/**
 * Homepage-only gallery for the 「探索寵物世界」 story section.
 * Product catalog data and product image URLs are intentionally not used here.
 */
export function ExploreCatBreedGallery() {
  const { locale, t } = useI18n();
  const isEn = locale === "en";

  return (
    <div className="mt-10 border-t border-[#2B2623]/10 pt-8 sm:mt-14 sm:pt-10">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-[#2B2623]/55">
            {t("catBreedsEyebrow")}
          </p>
          <h3 className="mt-1 text-2xl font-semibold tracking-tight text-[#2B2623] sm:text-3xl">
            {t("exploreBreedGalleryTitle")}

          </h3>
        </div>
        <span className="shrink-0 text-xs text-[#2B2623]/55 sm:text-sm">
          {catBreedsData.length} {t("exploreBreedGalleryCount")}
        </span>
      </div>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {catBreedsData.map((breed) => {
          const galleryImages = CAT_BREED_GALLERY_IMAGES[breed.slug] ?? [breed.imageUrl];
          const variantImages = galleryImages.filter((src) => src !== breed.imageUrl);
          return (
          <li key={breed.id}>
            <Link
              href={`/cat-breeds/${breed.slug}`}
              className="group block h-full overflow-hidden rounded-2xl border border-[#2B2623]/10 bg-white transition duration-200 hover:-translate-y-0.5 hover:border-[#2B2623]/25 hover:shadow-[0_18px_30px_-22px_rgba(74,59,50,0.55)]"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-[#FBF9F6]">
                <Image
                  src={breed.imageUrl}
                  alt={isEn ? breed.nameEn : breed.name}
                  fill
                  sizes="(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 45vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              {variantImages.length > 0 ? (
                <div className="grid grid-cols-5 gap-1.5 border-t border-[#2B2623]/8 bg-[#FBF9F6] p-2">
                  {variantImages.map((src) => (
                    <span key={src} className="relative aspect-square overflow-hidden rounded-lg bg-white">
                      <Image
                        src={src}
                        alt=""
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </span>
                  ))}
                </div>
              ) : null}
              <div className="p-3 sm:p-4">
                <p className="text-[10px] font-semibold tracking-[0.12em] text-[#2B2623]/55 sm:text-xs">
                  {isEn ? breed.coatLabelEn : breed.coatLabel}
                </p>
                <h4 className="mt-1 line-clamp-1 text-sm font-bold text-[#2B2623] sm:text-base">
                  {isEn ? breed.nameEn : breed.name}
                </h4>
              </div>
            </Link>
          </li>
          );
        })}
      </ul>
    </div>
  );
}
