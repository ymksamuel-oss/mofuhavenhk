"use client";

import Image from "next/image";
import { useState } from "react";
import { CategoryNavLink } from "@/components/CategoryNavLink";
import { ExplorePetControls } from "@/components/about/ExplorePetControls";
import { ExplorePetWorldGallery, type AnimalTab, type DogCoatFilter } from "@/components/about/ExplorePetWorldGallery";
import { useI18n } from "@/lib/i18n/I18nProvider";

export function PetGuidePage() {
  const { t } = useI18n();
  const [animal, setAnimal] = useState<AnimalTab>("cats");
  const [dogCoat, setDogCoat] = useState<DogCoatFilter>("all");

  return (
    <main className="min-h-screen bg-[#fbf7f3] text-[color:var(--ink)]">
      <section className="bg-[#fbf7f3] px-5 py-10 sm:px-10 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <CategoryNavLink href="/" className="text-sm font-medium text-[color:var(--muted)] transition hover:text-[color:var(--accent)]">
            ← \u8fd4\u56de\u9996\u9801
          </CategoryNavLink>
          <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-x-10">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] bg-[color:var(--accent-soft)] px-4 py-2 text-sm font-semibold text-[color:var(--accent)]">
                <span aria-hidden>⌘</span> {t("brandGuide")}
              </span>
              <h1 className="mt-6 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-[color:var(--ink)] sm:text-5xl">
                {t("brandGuideTitle")}
              </h1>
              <p className="mt-5 text-lg leading-9 text-[color:var(--muted)] sm:text-xl">
                {t("brandGuideBody")}
              </p>
              <ExplorePetControls
                animal={animal}
                dogCoat={dogCoat}
                onAnimalChange={setAnimal}
                onDogCoatChange={setDogCoat}
              />
            </div>
            <div className="relative h-[260px] overflow-hidden rounded-2xl bg-[#ead7bf] shadow-[0_18px_42px_-32px_rgba(86,57,30,0.55)] sm:h-[360px] lg:h-[440px]">
              <Image
                src="/images/explore-japanese-pet-lifestyle.jpg"
                alt={t("homeMobileHeroImageAlt")}
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover object-center"
              />
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-5">
            <div className="flex items-center" aria-hidden="true">
              {[
                "/images/cat-breeds/russian-blue-portrait.jpg",
                "/images/cat-breeds/scottish-fold-tabby.jpg",
                "/images/cat-breeds/ragdoll-mitted.jpg",
              ].map((src, index) => (
                <Image
                  key={src}
                  src={src}
                  alt=""
                  width={56}
                  height={56}
                  sizes="56px"
                  className={`h-12 w-12 rounded-full border-3 border-[#fbf7f3] object-cover shadow-sm sm:h-14 sm:w-14 ${index ? "-ml-2.5" : ""}`}
                />
              ))}
            </div>
            <CategoryNavLink
              href="/categories/cats"
              className="inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-[color:var(--accent)] px-8 py-3 text-lg font-semibold text-white shadow-[0_13px_26px_-16px_rgba(95,62,26,0.62)] transition hover:-translate-y-0.5 hover:bg-[color:var(--hero-deep)]"
            >
              <span aria-hidden>▢</span> \u63a2\u7d22\u8c93\u54aa\u98df\u54c1 <span aria-hidden>→</span>
            </CategoryNavLink>
          </div>

          <ExplorePetWorldGallery animal={animal} dogCoat={dogCoat} />

          <section className="mt-12 grid gap-4 border-t border-[color:var(--line)] pt-8 sm:grid-cols-3" aria-label="\u65e5\u5e38\u7167\u9867\u91cd\u9ede">
            {[
              ["\u6bcf\u65e5\u98f2\u98df", "\u6309\u5e74\u9f61、\u9ad4\u578b\u53ca\u6d3b\u52d5\u91cf\u9078\u64c7\u5408\u9069\u98df\u54c1，\u8f49\u63db\u65b0\u98df\u7269\u6642\u5faa\u5e8f\u6f38\u9032。"],
              ["\u5929\u7136\u5c0f\u98df", "\u9078\u64c7\u8089\u6e90\u6e05\u6670、\u6210\u5206\u7c21\u6f54\u7684\u5c0f\u98df，\u4e26\u5c07\u4efd\u91cf\u8a08\u5165\u6bcf\u65e5\u7e3d\u71b1\u91cf。"],
              ["\u5916\u51fa\u8207\u5c45\u5bb6", "\u5b9a\u671f\u6aa2\u67e5\u80f8\u80cc\u5e36、\u9805\u5708\u53ca\u727d\u5f15\u7e69，\u4fdd\u6301\u4f11\u606f\u5340\u548c\u98df\u5177\u6f54\u6de8。"],
            ].map(([title, body]) => (
              <article key={title} className="rounded-2xl border border-[color:var(--line)] bg-white p-5">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">{title}</h2>
                <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">{body}</p>
              </article>
            ))}
          </section>
        </div>
      </section>
    </main>
  );
}
