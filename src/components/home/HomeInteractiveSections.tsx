"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { CategoryNavLink } from "@/components/CategoryNavLink";
import { FAQAccordion } from "@/components/FAQAccordion";
import { HomeProductMarquee } from "@/components/home/HomeProductMarquee";
import { useI18n } from "@/lib/i18n/I18nProvider";

const GUIDE_CARDS = [
  {
    href: "/about-dog",
    image: "/images/dog-breeds/shiba-inu.jpg",
    alt: { zh: "柴犬可愛特寫", en: "Close-up portrait of a Shiba Inu" },
    label: { zh: "🐶 犬類知識", en: "🐶 Dog Knowledge" },
    title: { zh: "柴犬日常照護與物理潔齒提案", en: "Shiba Inu Care & Natural Dental Ideas" },
    subtitle: { zh: "解構精力旺盛毛孩的咀嚼與散步需求", en: "Understanding the chewing and walking needs of energetic companions" },
  },
  {
    href: "/about-cat",
    image: "/images/cat-breeds/russian-blue-portrait.jpg",
    alt: { zh: "俄羅斯藍貓精緻特寫", en: "Elegant portrait of a Russian Blue cat" },
    label: { zh: "🐱 貓咪知識", en: "🐱 Cat Knowledge" },
    title: { zh: "挑食貓咪的天然魚肉營養指南", en: "Natural Fish Nutrition for Picky Cats" },
    subtitle: { zh: "補充天然牛磺酸與 Omega-3 美毛配方", en: "Natural taurine and Omega-3 ideas for a glossy coat" },
  },
] as const;

export function HomeInteractiveSections() {
  const { locale, t } = useI18n();
  const isZh = locale === "zh";
  const guideLocale = isZh ? "zh" : "en";
  const guides = isZh ? "瀏覽完整圖鑑" : "Explore Guides";

  return (
    <>
      <HomeProductMarquee />
      <section id="pet-guide" className="scroll-mt-24 bg-[#FAF7F2] px-5 py-12 sm:px-10 sm:py-16 lg:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:gap-14">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#ECE5D8] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--accent)]">
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              {t("brandGuide")}
            </span>
            <h2 className="mt-6 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-[color:var(--ink)] sm:text-5xl">
              {t("brandGuideTitle")}
            </h2>
            <p className="mt-5 text-lg leading-9 text-[color:var(--muted)] sm:text-xl">
              {t("brandGuideBody")}
            </p>
            <CategoryNavLink
              href="/pet-guide"
              className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[color:var(--accent)] px-6 py-3 text-base font-semibold text-white shadow-[0_13px_26px_-16px_rgba(95,62,26,0.62)] transition hover:-translate-y-0.5 hover:bg-[color:var(--hero-deep)]"
            >
              <BookOpen className="h-5 w-5" aria-hidden="true" />
              {guides}
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </CategoryNavLink>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {GUIDE_CARDS.map((guide) => (
              <Link
                key={guide.href}
                href={guide.href}
                className="group overflow-hidden rounded-2xl border border-[#ECE5D8] bg-white shadow-[0_18px_42px_-32px_rgba(86,57,30,0.55)] transition hover:-translate-y-1 hover:border-[#DCCBB8] hover:shadow-[0_24px_44px_-28px_rgba(86,57,30,0.35)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[#ead7bf]">
                  <Image
                    src={guide.image}
                    alt={guide.alt[guideLocale]}
                    fill
                    sizes="(min-width: 1024px) 28vw, (min-width: 640px) 42vw, 90vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-4 sm:p-5">
                  <p className="text-xs font-bold tracking-[0.12em] text-[#A36B42]">{guide.label[guideLocale]}</p>
                  <h3 className="mt-2 line-clamp-2 text-base font-bold leading-6 text-[color:var(--ink)] sm:text-lg">{guide.title[guideLocale]}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-[color:var(--muted)]">{guide.subtitle[guideLocale]}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[color:var(--accent)] transition group-hover:gap-2">
                    {isZh ? "閱讀專題" : "Read guide"}
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <FAQAccordion />
    </>
  );
}
