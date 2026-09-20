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
    : false
      ? {
          eyebrow: "おすすめペットギャラリー",
          title: "おすすめペット",
          body: "\u4e00\u679a\u4e00\u679aの\u5199\u771fに、やさしい\u51fa\u4f1aいがあります。\u732bちゃん、わんちゃん、すべての\u5927\u5207な\u5bb6\u65cfの\u65e5々の\u7269\u8a9eをご\u7d39\u4ecbします。",
          story: "ペットストーリー",
          explore: "もっと\u898bる",
          emptyTitle: "ギャラリー\u6e96\u5099\u4e2d",
          emptyBody: "\u7ba1\u7406\u753b\u9762の「おすすめペットギャラリー」から\u5199\u771fとストーリーを\u8ffd\u52a0すると、ここに\u8868\u793aされます。",
        }
      : {
        eyebrow: "\u7cbe\u9078\u5bf5\u7269\u5716\u96c6",
        title: "\u7cbe\u9078\u5bf5\u7269\u5c08\u5340",
        body: "\u6bcf\u4e00\u5f35\u5beb\u771f，\u90fd\u662f\u4e00\u6bb5\u6eab\u67d4\u76f8\u9047。\u5f9e\u8c93\u54aa、\u72d7\u72d7\u5230\u6bcf\u4e00\u4f4d\u5c0f\u5c0f\u670b\u53cb，\u6162\u6162\u8a8d\u8b58\u7260\u5011\u7684\u65e5\u5e38\u6545\u4e8b。",
        story: "\u6bdb\u5b69\u6545\u4e8b",
        explore: "\u63a2\u7d22\u66f4\u591a",
        emptyTitle: "\u5beb\u771f\u5c08\u5340\u6e96\u5099\u4e2d",
        emptyBody: "\u8acb\u65bc\u5f8c\u53f0「\u7cbe\u9078\u5bf5\u7269\u5c08\u5340」\u4e0a\u8f09\u76f8\u7247\u53ca\u586b\u5beb\u5167\u5bb9，\u9996\u9801\u6703\u5373\u6642\u5c55\u793a\u4f60\u7684\u6700\u65b0\u7cbe\u9078。",
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
