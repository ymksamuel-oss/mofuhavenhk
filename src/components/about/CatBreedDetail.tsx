"use client";

import { useMemo, type SyntheticEvent } from "react";
import Link from "next/link";
import { Zen_Maru_Gothic } from "next/font/google";
import { BreedGallery } from "@/components/about/BreedGallery";
import {
  CAT_BREED_IMAGE_FALLBACK,
  type CatBreed,
} from "@/lib/catBreeds";
import { getLocalizedBreedView } from "@/lib/catBreedLocales";
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
  const { t, locale } = useI18n();
  const view = useMemo(
    () => getLocalizedBreedView(breed, locale),
    [breed, locale],
  );
  const info = breed.breedInfo;
  const heroImage =
    info?.media_assets.images.find(
      (image) => image.tag === "hero_main" || image.tag === "hero",
    ) ?? null;
  const hasGalleryItems = view.gallerySlides.some((slide) =>
    slide.tag.startsWith("gallery_item"),
  );
  const labelSep = locale === "en" ? ": " : "：";

  const facts = [
    { label: t("catBreedDetailOrigin"), value: view.origin },
    { label: t("catBreedDetailLifespan"), value: view.lifespan },
    { label: t("catBreedDetailWeight"), value: view.weight },
  ];

  const sections = [
    {
      title: t("catBreedDetailPersonality"),
      items: view.personality,
    },
    {
      title: t("catBreedDetailCare"),
      items: view.careTips,
    },
    {
      title: t("catBreedDetailNutrition"),
      items: view.nutritionAdvice,
    },
  ];

  return (
    <div
      className={`${zenMaru.className} min-h-[70vh] bg-[#FBF9F6] text-[#2B2623]`}
    >
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="mb-6">
          <Link
            href="/cat-breeds"
            className="text-sm font-medium text-[#2B2623]/70 transition hover:text-[#2B2623]"
          >
            ← {t("catBreedDetailBack")}
          </Link>
        </p>

        <div className="grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <div className="overflow-hidden rounded-2xl border border-[#2B2623]/12 bg-[#FFFFFF] shadow-[0_18px_36px_-22px_rgba(74,59,50,0.4)]">
            <div className="relative aspect-[4/3] w-full bg-[#FBF9F6]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={heroImage?.src || breed.imageUrl}
                alt={heroImage?.alt || view.name}
                className="absolute inset-0 h-full w-full object-cover"
                onError={handleBreedImageError}
              />
            </div>
          </div>

          <header>
            <p className="inline-flex rounded-full border border-[#2B2623]/15 bg-[#FFFFFF] px-3 py-1 text-xs font-semibold tracking-[0.12em] text-[#2B2623]/65">
              {view.coatLabel}
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              {view.title}
            </h1>
            {view.subtitle ? (
              <p className="mt-1 text-sm text-[#2B2623]/60">{view.subtitle}</p>
            ) : null}
            <p className="mt-3 text-base leading-relaxed text-[#2B2623]/85 sm:text-lg">
              {view.fullDescription}
            </p>
          </header>
        </div>

        <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          {facts.map((fact) => (
            <li
              key={fact.label}
              className="rounded-2xl border border-[#2B2623]/12 bg-[#FFFFFF] px-4 py-4 shadow-[0_12px_28px_-22px_rgba(74,59,50,0.35)]"
            >
              <p className="text-xs font-semibold tracking-[0.12em] text-[#2B2623]/55">
                {fact.label}
              </p>
              <p className="mt-2 text-sm font-medium leading-snug sm:text-[0.95rem]">
                {fact.value}
              </p>
            </li>
          ))}
        </ul>

        {view.gallerySlides.length > 0 ? (
          <BreedGallery
            title={t("catBreedDetailGallery")}
            slides={view.gallerySlides}
          />
        ) : null}

        {view.physical && view.careAndHealth ? (
          <div className="mt-10 space-y-10 sm:mt-12">
            <section>
              <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                {t("catBreedDetailPhysical")}
              </h2>
              <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <li className="rounded-2xl border border-[#2B2623]/12 bg-[#FFFFFF] px-4 py-3 text-sm">
                  <span className="font-semibold">
                    {t("catBreedDetailEyes")}
                    {labelSep}
                  </span>
                  {view.physical.eye_color}
                </li>
                <li className="rounded-2xl border border-[#2B2623]/12 bg-[#FFFFFF] px-4 py-3 text-sm">
                  <span className="font-semibold">
                    {t("catBreedDetailSize")}
                    {labelSep}
                  </span>
                  {view.physical.size_category}
                </li>
                {view.physical.maturation_years ? (
                  <li className="rounded-2xl border border-[#2B2623]/12 bg-[#FFFFFF] px-4 py-3 text-sm">
                    <span className="font-semibold">
                      {t("catBreedDetailMaturity")}
                      {labelSep}
                    </span>
                    {view.physical.maturation_years}
                  </li>
                ) : null}
                <li className="rounded-2xl border border-[#2B2623]/12 bg-[#FFFFFF] px-4 py-3 text-sm sm:col-span-2">
                  <span className="font-semibold">
                    {t("catBreedDetailCoat")}
                    {labelSep}
                  </span>
                  {view.physical.coat_length}
                  {locale === "en" ? " / " : "／"}
                  {view.physical.coat_texture}
                  {locale === "en" ? " / " : "／"}
                  {view.physical.coat_undercoat}
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                {t("catBreedDetailPatterns")}
              </h2>
              {hasGalleryItems ? (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {view.patterns.map((pattern) => (
                    <li
                      key={pattern.pattern_id}
                      className="rounded-full border border-[#2B2623]/15 bg-[#FFFFFF] px-3 py-1.5 text-xs font-medium"
                      title={pattern.description}
                    >
                      {pattern.name}
                      <span className="ml-1 text-[#2B2623]/55">
                        · {pattern.description}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {view.patterns.map((pattern) => (
                    <li
                      key={pattern.pattern_id}
                      className="overflow-hidden rounded-2xl border border-[#2B2623]/12 bg-[#FFFFFF] shadow-[0_12px_28px_-22px_rgba(74,59,50,0.35)]"
                    >
                      <div className="relative aspect-[4/3] bg-[#FBF9F6]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={pattern.image_url || CAT_BREED_IMAGE_FALLBACK}
                          alt={pattern.name}
                          className="absolute inset-0 h-full w-full object-cover"
                          onError={handleBreedImageError}
                        />
                      </div>
                      <div className="space-y-1.5 px-4 py-3">
                        <p className="text-sm font-semibold">{pattern.name}</p>
                        <p className="text-xs leading-relaxed text-[#2B2623]/75">
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
                {view.colors.map((color) => (
                  <li
                    key={color.color_id}
                    className="rounded-full border border-[#2B2623]/15 bg-[#FFFFFF] px-3 py-1.5 text-xs font-medium"
                    title={color.description}
                  >
                    {color.name}
                    <span className="ml-1 text-[#2B2623]/55">
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
              <ul className="mt-3 list-disc space-y-2 pl-5 text-[0.98rem] leading-relaxed text-[#2B2623]/85 sm:text-base">
                <li>{view.careAndHealth.environment}</li>
                <li>
                  {t("catBreedDetailGeneticRisks")}
                  {labelSep}
                  {view.careAndHealth.genetic_risks.join(view.riskJoiner)}
                </li>
                <li>{view.careAndHealth.digestive_health}</li>
                <li>{view.careAndHealth.diet_management}</li>
                <li>{view.careAndHealth.grooming}</li>
              </ul>
            </section>
          </div>
        ) : null}

        <div className="mt-10 space-y-6 sm:mt-12 sm:space-y-8">
          {sections.map((section) => (
            <section key={section.title} className="max-w-3xl">
              <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                {section.title}
              </h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-[0.98rem] leading-relaxed text-[#2B2623]/85 sm:text-base">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <aside className="mt-12 max-w-3xl px-1 py-2 sm:mt-14 sm:px-0">
          <p className="text-xs font-semibold tracking-[0.12em] text-[#2B2623]/55">
            {t("catBreedDetailNoteEyebrow")}
          </p>
          <p className="mt-2 text-base leading-[1.8] text-[#2B2623]/85 sm:text-[1.05rem]">
            {t("catBreedDetailNote")}
          </p>
        </aside>
      </div>
    </div>
  );
}
