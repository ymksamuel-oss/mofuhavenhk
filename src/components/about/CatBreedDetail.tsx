"use client";

import type { SyntheticEvent } from "react";
import Link from "next/link";
import { Zen_Maru_Gothic } from "next/font/google";
import {
  BreedStoryGallery,
  type BreedStorySlide,
} from "@/components/about/BreedStoryGallery";
import {
  CAT_BREED_IMAGE_FALLBACK,
  type CatBreed,
} from "@/lib/catBreeds";
import { useI18n } from "@/lib/i18n/I18nProvider";

const zenMaru = Zen_Maru_Gothic({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

function handleBreedImageError(event: SyntheticEvent<HTMLImageElement>) {
  const image = event.currentTarget;
  if (image.dataset.fallbackApplied === "true") return;
  image.dataset.fallbackApplied = "true";
  image.src = CAT_BREED_IMAGE_FALLBACK;
}

type CatBreedDetailProps = {
  breed: CatBreed;
};

/**
 * Detail view for a single cat breed — warm picture-book styling.
 */
export function CatBreedDetail({ breed }: CatBreedDetailProps) {
  const { t } = useI18n();
  const info = breed.breedInfo;
  const heroImage =
    info?.media_assets.images.find(
      (image) => image.tag === "hero_main" || image.tag === "hero",
    ) ?? null;
  const galleryImages =
    info?.media_assets.images.filter((image) =>
      image.tag.startsWith("gallery_item"),
    ) ?? [];

  const storySlides: BreedStorySlide[] =
    info?.media_assets.images
      .filter((image) => Boolean(image.src))
      .map((image) => ({
        tag: image.tag,
        src: image.src,
        alt: image.alt,
        description: image.description,
      })) ?? [];

  const facts = [
    { label: t("catBreedDetailOrigin"), value: breed.origin },
    { label: t("catBreedDetailLifespan"), value: breed.lifespan },
    { label: t("catBreedDetailWeight"), value: breed.weight },
  ];

  const sections = [
    {
      title: t("catBreedDetailPersonality"),
      items: breed.personality,
    },
    {
      title: t("catBreedDetailCare"),
      items: breed.careTips,
    },
    {
      title: t("catBreedDetailNutrition"),
      items: breed.nutritionAdvice,
    },
  ];

  return (
    <div
      className={`${zenMaru.className} min-h-[70vh] bg-[#FAF6F0] text-[#4A3B32]`}
    >
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="mb-6">
          <Link
            href="/cat-breeds"
            className="text-sm font-medium text-[#4A3B32]/70 transition hover:text-[#4A3B32]"
          >
            ← {t("catBreedDetailBack")}
          </Link>
        </p>

        <div className="grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <div className="overflow-hidden rounded-2xl border border-[#4A3B32]/12 bg-[#FFFCFA] shadow-[0_18px_36px_-22px_rgba(74,59,50,0.4)]">
            <div className="relative aspect-[4/3] w-full bg-[#FAF6F0]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={heroImage?.src || breed.imageUrl}
                alt={heroImage?.alt || breed.name}
                className="absolute inset-0 h-full w-full object-cover"
                onError={handleBreedImageError}
              />
            </div>
          </div>

          <header>
            <p className="inline-flex rounded-full border border-[#4A3B32]/15 bg-[#FFFCFA] px-3 py-1 text-xs font-semibold tracking-[0.12em] text-[#4A3B32]/65">
              {breed.coatLabel}
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              {info?.name_zh_hk || breed.name}
            </h1>
            {info ? (
              <p className="mt-1 text-sm text-[#4A3B32]/60">
                {info.name_en}
                {info.aliases.length > 0
                  ? ` · ${info.aliases.join("／")}`
                  : null}
              </p>
            ) : null}
            <p className="mt-3 text-base leading-relaxed text-[#4A3B32]/85 sm:text-lg">
              {breed.fullDescription}
            </p>
          </header>
        </div>

        <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          {facts.map((fact) => (
            <li
              key={fact.label}
              className="rounded-2xl border border-[#4A3B32]/12 bg-[#FFFCFA] px-4 py-4 shadow-[0_12px_28px_-22px_rgba(74,59,50,0.35)]"
            >
              <p className="text-xs font-semibold tracking-[0.12em] text-[#4A3B32]/55">
                {fact.label}
              </p>
              <p className="mt-2 text-sm font-medium leading-snug sm:text-[0.95rem]">
                {fact.value}
              </p>
            </li>
          ))}
        </ul>

        {storySlides.length > 0 ? (
          <BreedStoryGallery
            title={t("catBreedDetailGallery")}
            slides={storySlides}
          />
        ) : null}

        {info ? (
          <div className="mt-10 space-y-10 sm:mt-12">
            <section>
              <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                {t("catBreedDetailPhysical")}
              </h2>
              <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <li className="rounded-2xl border border-[#4A3B32]/12 bg-[#FFFCFA] px-4 py-3 text-sm">
                  <span className="font-semibold">{t("catBreedDetailEyes")}：</span>
                  {info.physical_characteristics.eye_color}
                </li>
                <li className="rounded-2xl border border-[#4A3B32]/12 bg-[#FFFCFA] px-4 py-3 text-sm">
                  <span className="font-semibold">{t("catBreedDetailSize")}：</span>
                  {info.physical_characteristics.size_category}
                </li>
                {info.physical_characteristics.maturation_years ? (
                  <li className="rounded-2xl border border-[#4A3B32]/12 bg-[#FFFCFA] px-4 py-3 text-sm">
                    <span className="font-semibold">
                      {t("catBreedDetailMaturity")}：
                    </span>
                    {info.physical_characteristics.maturation_years}
                  </li>
                ) : null}
                <li className="rounded-2xl border border-[#4A3B32]/12 bg-[#FFFCFA] px-4 py-3 text-sm sm:col-span-2">
                  <span className="font-semibold">{t("catBreedDetailCoat")}：</span>
                  {info.physical_characteristics.coat.length}／
                  {info.physical_characteristics.coat.texture}／
                  {info.physical_characteristics.coat.undercoat}
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                {t("catBreedDetailPatterns")}
              </h2>
              {galleryImages.length > 0 ? (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {info.patterns.map((pattern) => (
                    <li
                      key={pattern.pattern_id}
                      className="rounded-full border border-[#4A3B32]/15 bg-[#FFFCFA] px-3 py-1.5 text-xs font-medium"
                      title={pattern.description}
                    >
                      {pattern.name_zh}
                      <span className="ml-1 text-[#4A3B32]/55">
                        · {pattern.description}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {info.patterns.map((pattern) => (
                    <li
                      key={pattern.pattern_id}
                      className="overflow-hidden rounded-2xl border border-[#4A3B32]/12 bg-[#FFFCFA] shadow-[0_12px_28px_-22px_rgba(74,59,50,0.35)]"
                    >
                      <div className="relative aspect-[4/3] bg-[#FAF6F0]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={pattern.image_url || CAT_BREED_IMAGE_FALLBACK}
                          alt={pattern.name_zh}
                          className="absolute inset-0 h-full w-full object-cover"
                          onError={handleBreedImageError}
                        />
                      </div>
                      <div className="space-y-1.5 px-4 py-3">
                        <p className="text-sm font-semibold">{pattern.name_zh}</p>
                        <p className="text-xs leading-relaxed text-[#4A3B32]/75">
                          {pattern.description}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                {t("catBreedDetailColors")}
              </h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {info.colors.map((color) => (
                  <li
                    key={color.color_id}
                    className="rounded-full border border-[#4A3B32]/15 bg-[#FFFCFA] px-3 py-1.5 text-xs font-medium"
                    title={color.description}
                  >
                    {color.name_zh}
                    <span className="ml-1 text-[#4A3B32]/55">
                      · {color.description}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="max-w-3xl">
              <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                {t("catBreedDetailHealth")}
              </h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-[0.98rem] leading-relaxed text-[#4A3B32]/85 sm:text-base">
                <li>{info.care_and_health.environment}</li>
                <li>
                  {t("catBreedDetailGeneticRisks")}：
                  {info.care_and_health.genetic_risks.join("、")}
                </li>
                <li>{info.care_and_health.digestive_health}</li>
                <li>{info.care_and_health.diet_management}</li>
                <li>{info.care_and_health.grooming}</li>
              </ul>
            </section>
          </div>
        ) : (
          <div className="mt-10 space-y-6 sm:mt-12 sm:space-y-8">
            {sections.map((section) => (
              <section key={section.title} className="max-w-3xl">
                <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                  {section.title}
                </h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-[0.98rem] leading-relaxed text-[#4A3B32]/85 sm:text-base">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}

        {!info ? null : (
          <div className="mt-10 space-y-6 sm:mt-12 sm:space-y-8">
            {sections.map((section) => (
              <section key={section.title} className="max-w-3xl">
                <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                  {section.title}
                </h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-[0.98rem] leading-relaxed text-[#4A3B32]/85 sm:text-base">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}

        <aside className="mt-12 rounded-2xl border border-[#4A3B32]/12 bg-[#FFFCFA] px-5 py-5 shadow-[0_16px_32px_-24px_rgba(74,59,50,0.4)] sm:mt-14 sm:px-6 sm:py-6">
          <p className="text-xs font-semibold tracking-[0.12em] text-[#4A3B32]/55">
            {t("catBreedDetailNoteEyebrow")}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[#4A3B32]/85 sm:text-[0.95rem]">
            {t("catBreedDetailNote")}
          </p>
        </aside>
      </div>
    </div>
  );
}
