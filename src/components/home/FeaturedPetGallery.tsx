"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { FeaturedPet } from "@/lib/featured-pets";
import { useI18n } from "@/lib/i18n/I18nProvider";

type FeaturedPetGalleryProps = {
  pets: FeaturedPet[];
};

function isExternalLink(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

export function FeaturedPetGallery({ pets }: FeaturedPetGalleryProps) {
  const { locale } = useI18n();
  const copy = locale === "en"
    ? {
        eyebrow: "FEATURED PET GALLERY",
        title: "Featured Pet Gallery",
        body: "Every portrait is a gentle encounter. Meet the everyday stories of every beloved companion, from cats and dogs to little friends.",
        story: "PET STORY",
        explore: "Explore more",
        emptyTitle: "Our gallery is getting ready",
        emptyBody: "Add photographs and stories in Admin under Featured Pet Gallery, and your latest selections will appear here.",
      }
    : {
        eyebrow: "精選寵物圖集",
        title: "精選寵物專區",
        body: "每一張寫真，都是一段溫柔相遇。從貓咪、狗狗到每一位小小朋友，慢慢認識牠們的日常故事。",
        story: "毛孩故事",
        explore: "探索更多",
        emptyTitle: "寫真專區準備中",
        emptyBody: "請於後台「精選寵物專區」上載相片及填寫內容，首頁會即時展示你的最新精選。",
      };
  return (
    <section id="featured-pets" className="relative overflow-hidden bg-[#f8f3ed] px-5 py-14 sm:px-8 sm:py-20 lg:px-10">
      <div className="pointer-events-none absolute -left-20 top-12 h-52 w-52 rounded-full bg-[#eddccd]/70 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-4 h-64 w-64 rounded-full bg-[#d9e8d7]/60 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <header className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#d8c9bb] bg-white/75 px-3 py-1.5 text-xs font-semibold tracking-[0.18em] text-[#95705b] shadow-sm">
            <span className="relative h-6 w-8 overflow-hidden rounded-md bg-[#f7efe7]">
              <Image src="/images/mofu-visuals/icons/featured.jpg" alt="" fill sizes="32px" className="object-cover" />
            </span>
            {copy.eyebrow}
          </p>
          <h2 className="mt-5 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-[0.04em] text-[#3f3029] sm:text-5xl">
            {copy.title}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#806e62] sm:text-base">
            {copy.body}
          </p>
        </header>

        {pets.length > 0 ? (
          <div className="mt-9 grid gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {pets.map((pet, index) => {
              const href = pet.link || "";
              const external = href ? isExternalLink(href) : false;
              const title = locale === "en" && pet.title_en ? pet.title_en : pet.title;
              const description = locale === "en" && pet.description_en ? pet.description_en : pet.description;
              const cardClassName = `group relative isolate min-h-[21rem] overflow-hidden rounded-[1.75rem] bg-[#e8ded2] shadow-[0_18px_40px_-26px_rgba(67,46,36,0.6)] ${index % 5 === 0 ? "sm:col-span-2 sm:min-h-[26rem] lg:col-span-2" : ""}`;
              const content = (
                <>
                  <img
                    src={pet.image_url}
                    alt={title}
                    loading={index < 3 ? "eager" : "lazy"}
                    className="absolute inset-0 h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#261d18]/82 via-[#261d18]/20 to-transparent" />
                  <div className="relative flex min-h-[21rem] h-full flex-col justify-end p-5 text-white sm:p-7">
                    <span className="mb-4 inline-flex w-fit rounded-full border border-white/45 bg-white/15 px-3 py-1 text-[11px] font-semibold tracking-[0.14em] backdrop-blur-sm">
                      {copy.story} {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="max-w-2xl font-[family-name:var(--font-display)] text-2xl font-semibold tracking-wide text-white sm:text-3xl">
                      {title}
                    </h3>
                    <p className="mt-2 line-clamp-3 max-w-2xl text-sm leading-6 text-white/85 transition-all duration-300 sm:max-h-0 sm:translate-y-2 sm:opacity-0 sm:text-base group-hover:sm:max-h-24 group-hover:sm:translate-y-0 group-hover:sm:opacity-100 group-focus-within:sm:max-h-24 group-focus-within:sm:translate-y-0 group-focus-within:sm:opacity-100">
                      {description}
                    </p>
                    {href ? (
                      <span className="mt-3 inline-flex w-fit items-center gap-2 text-sm font-semibold text-white transition-transform duration-300 sm:mt-5 group-hover:translate-x-1">
                        {copy.explore} <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                      </span>
                    ) : null}
                  </div>
                </>
              );

              return href ? (
                <a
                  key={`${pet.sort_order}-${pet.title}`}
                  href={href}
                  {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
                  className={cardClassName}
                  aria-label={`${copy.explore}: ${title}`}
                >
                  {content}
                </a>
              ) : (
                <article key={`${pet.sort_order}-${pet.title}`} className={cardClassName}>
                  {content}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mx-auto mt-10 max-w-2xl rounded-[1.75rem] border border-dashed border-[#d9c8b8] bg-white/60 px-6 py-10 text-center shadow-sm">
            <p className="font-[family-name:var(--font-display)] text-xl font-semibold text-[#5b473d]">{copy.emptyTitle}</p>
            <p className="mt-2 text-sm leading-6 text-[#806e62]">{copy.emptyBody}</p>
          </div>
        )}
      </div>
    </section>
  );
}
