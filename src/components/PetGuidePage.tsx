"use client";

import Image from "next/image";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { useState } from "react";
import { CategoryNavLink } from "@/components/CategoryNavLink";
import { ExplorePetControls } from "@/components/about/ExplorePetControls";
import { ExplorePetWorldGallery, type AnimalTab, type DogCoatFilter } from "@/components/about/ExplorePetWorldGallery";
import { useI18n } from "@/lib/i18n/I18nProvider";

const GUIDE_CARDS = [
  {
    href: "/about-dog",
    image: "/images/dog-breeds/shiba-inu.jpg",
    alt: { zh: "柴犬可愛特寫", en: "Close-up portrait of a Shiba Inu" },
    label: { zh: "🐶 犬類知識", en: "🐶 Dog Knowledge" },
    title: { zh: "柴犬生活指南：精力旺盛成犬的散步與潔齒技巧", en: "Shiba Inu Living Guide: Walks and Natural Dental Care" },
    subtitle: { zh: "掌握咀嚼、散步與日常照護節奏", en: "A thoughtful rhythm for chewing, walks and everyday care" },
  },
  {
    href: "/about-cat",
    image: "/images/cat-breeds/russian-blue-portrait.jpg",
    alt: { zh: "貓咪精緻特寫", en: "Elegant portrait of a cat" },
    label: { zh: "🐱 貓咪知識", en: "🐱 Cat Knowledge" },
    title: { zh: "挑食貓咪營養指南：純魚肉與美毛化毛提案", en: "Picky Cat Nutrition Guide: Fish, Coat and Hairball Care" },
    subtitle: { zh: "從天然魚肉、牛磺酸到 Omega-3 美毛配方", en: "From natural fish and taurine to Omega-3 coat care" },
  },
] as const;

export function PetGuidePage() {
  const { locale, t } = useI18n();
  const [animal, setAnimal] = useState<AnimalTab>("cats");
  const [dogCoat, setDogCoat] = useState<DogCoatFilter>("all");
  const isZh = locale === "zh";
  const guideLocale = isZh ? "zh" : "en";

  return (
    <main className="min-h-screen bg-[#FAF7F2] text-[color:var(--ink)]">
      <section className="bg-[#FAF7F2] px-5 py-10 sm:px-10 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <CategoryNavLink href="/" className="text-sm font-medium text-[color:var(--muted)] transition hover:text-[color:var(--accent)]">
            ← {isZh ? "返回首頁" : "Back to home"}
          </CategoryNavLink>
          <div className="mt-8 grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:gap-12">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#ECE5D8] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--accent)]">
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                {t("brandGuide")}
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
            <div className="grid gap-4 sm:grid-cols-2">
              {GUIDE_CARDS.map((guide) => (
                <CategoryNavLink
                  key={guide.href}
                  href={guide.href}
                  className="group overflow-hidden rounded-2xl border border-[#ECE5D8] bg-white p-0 shadow-[0_18px_42px_-32px_rgba(86,57,30,0.55)] transition hover:-translate-y-1 hover:border-[#DCCBB8]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#ead7bf]">
                    <Image src={guide.image} alt={guide.alt[guideLocale]} fill priority sizes="(min-width: 1024px) 28vw, (min-width: 640px) 42vw, 90vw" className="object-cover transition duration-500 group-hover:scale-105" />
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-bold tracking-[0.12em] text-[#A36B42]">{guide.label[guideLocale]}</p>
                    <h2 className="mt-2 line-clamp-3 text-base font-bold leading-6 text-[color:var(--ink)]">{guide.title[guideLocale]}</h2>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-[color:var(--muted)]">{guide.subtitle[guideLocale]}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[color:var(--accent)] transition group-hover:gap-2">
                      {isZh ? "閱讀專題" : "Read guide"}
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </div>
                </CategoryNavLink>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-5">
            <CategoryNavLink
              href="/categories/cats"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[color:var(--accent)] px-6 py-3 text-base font-semibold text-white shadow-[0_13px_26px_-16px_rgba(95,62,26,0.62)] transition hover:-translate-y-0.5 hover:bg-[color:var(--hero-deep)]"
            >
              <BookOpen className="h-5 w-5" aria-hidden="true" />
              {isZh ? "探索貓咪食品" : "Explore Cat Food"}
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </CategoryNavLink>
          </div>

          <ExplorePetWorldGallery animal={animal} dogCoat={dogCoat} />

          <section className="mt-12 grid gap-4 border-t border-[color:var(--line)] pt-8 sm:grid-cols-3" aria-label={isZh ? "日常照顧重點" : "Everyday care essentials"}>
            {(isZh
              ? [
                  ["每日飲食", "按年齡、體型及活動量選擇合適食品，轉換新食物時循序漸進。"],
                  ["天然小食", "選擇肉源清晰、成分簡潔的小食，並將份量計入每日總熱量。"],
                  ["外出與居家", "定期檢查胸背帶、項圈及牽引繩，保持休息區和食具潔淨。"],
                ]
              : [
                  ["Everyday meals", "Choose food for age, size and activity, and transition gradually when trying something new."],
                  ["Natural treats", "Look for clear protein sources and simple ingredients, while keeping treats within the daily balance."],
                  ["Out and at home", "Check harnesses, collars and leads regularly, and keep rest areas and bowls clean."],
                ]
            ).map(([title, body]) => (
              <article key={title} className="rounded-2xl border border-[#ECE5D8] bg-white p-5">
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
