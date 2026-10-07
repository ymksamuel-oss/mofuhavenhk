"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/I18nProvider";

export function WelcomeEntranceOverlay() {
  const { locale } = useI18n();
  const isZh = locale === "zh";

  const copy = isZh
    ? {
        status: "🇯🇵 日本在地嚴選・香港現貨直送",
        coBrandNote: "日本愛知縣百年本社 (創業1926年) × 毛毛港香港官方專營直送",
        title: "給最重要的家人，一份純淨無瑕的日本原味。",
        description: "嚴選 100% 日本在地純肉，低溫慢烘保留原始鮮美。專為挑食、敏感與日常潔齒而生。",
        factoryCaption: "🏢 日本愛知縣豐橋市・Best Partner 本社工廠高清實景",
        factoryHistory: "1926年創業（昭和元年，近百年歷史）｜自社低溫慢烘廠區",
        dogs: "🐶 進入狗狗專區",
        cats: "🐱 進入貓咪專區",
        matcher: "🐾 智能選配精靈",
        explore: "↓ 向下滑動探索熱銷零食",
        imageAlt: "日本愛知縣豐橋市 Best Partner 本社工廠實景",
      }
    : {
        status: "🇯🇵 Selected in Japan · Ships from Hong Kong",
        coBrandNote: "A century-old Aichi headquarters (founded 1926) × Mofu Haven official Hong Kong direct shipping",
        title: "A pure taste of Japan, for the family members who matter most.",
        description: "Carefully selected 100% Japanese natural meat, gently slow-dried to preserve its original flavour. Made for picky eaters, sensitive tummies and everyday dental care.",
        factoryCaption: "🏢 Best Partner head office and factory · Toyohashi, Aichi, Japan",
        factoryHistory: "Founded in 1926 · Nearly a century of in-house slow-drying craft",
        dogs: "🐶 Shop for Dogs",
        cats: "🐱 Shop for Cats",
        matcher: "🐾 Smart Pet Match",
        explore: "↓ Scroll to explore bestsellers",
        imageAlt: "Best Partner head office and factory in Toyohashi, Aichi, Japan",
      };

  return (
    <section className="relative overflow-hidden bg-white text-[#111111]" aria-labelledby="official-hero-title">
      <div className="mx-auto w-full max-w-7xl px-5 pb-10 pt-7 sm:px-8 sm:pb-14 sm:pt-10 lg:px-14 lg:pb-16 lg:pt-12">
        <header className="border-b border-stone-100 pb-5 text-center sm:pb-6">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-stone-600 sm:text-xs">{copy.status}</p>
        </header>

        <div className="mx-auto max-w-5xl pt-8 sm:pt-10 lg:pt-12">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
            <Image src="/images/brands/mofu-haven-normalized.png" alt="Mofu Haven 毛毛港" width={740} height={600} priority className="h-16 w-auto max-w-[150px] object-contain mix-blend-multiply sm:h-20 sm:max-w-[190px]" />
            <span className="text-2xl font-light text-stone-300" aria-hidden="true">×</span>
            <Image src="/images/brands/best-partner-logo.svg" alt="Best Partner Japan" width={220} height={70} priority className="h-14 w-auto max-w-[170px] object-contain mix-blend-multiply sm:h-20 sm:max-w-[220px]" />
          </div>
          <p className="mt-4 text-center text-xs font-medium leading-5 tracking-wide text-stone-600 sm:text-sm">{copy.coBrandNote}</p>

          <div className="mx-auto mt-8 max-w-3xl text-center sm:mt-10">
            <h1 id="official-hero-title" className="font-[family-name:var(--font-display)] text-3xl font-semibold leading-[1.2] tracking-[-0.025em] text-[#111111] sm:text-4xl lg:text-5xl">
              {isZh ? <>給最重要的家人，<br />一份純淨無瑕的日本原味。</> : copy.title}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-stone-600 sm:text-base sm:leading-8">{copy.description}</p>
          </div>

          <figure className="mt-8 overflow-hidden rounded-3xl border border-stone-100 bg-white shadow-[0_18px_45px_-34px_rgba(17,17,17,0.35)] sm:mt-10">
            <div className="relative aspect-[16/9] w-full sm:aspect-[2/1]">
              <Image src="/images/best-partner-factory.jpg" alt={copy.imageAlt} fill priority sizes="(min-width: 1024px) 900px, 100vw" className="object-cover" />
            </div>
            <figcaption className="px-4 py-4 text-center sm:px-6 sm:py-5">
              <p className="text-sm font-semibold text-stone-800 sm:text-base">{copy.factoryCaption}</p>
              <p className="mt-1 text-xs leading-5 text-stone-500 sm:text-sm">{copy.factoryHistory}</p>
            </figcaption>
          </figure>

          <nav className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-3" aria-label={isZh ? "首頁導覽" : "Homepage navigation"}>
            <Link href="/collections/dogs" className="flex min-h-12 items-center justify-center rounded-full bg-[#111111] px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-black active:scale-[0.98]">{copy.dogs}</Link>
            <Link href="/collections/cats" className="flex min-h-12 items-center justify-center rounded-full border border-stone-200 bg-white px-4 py-3 text-center text-sm font-semibold text-stone-800 transition hover:border-stone-400 active:scale-[0.98]">{copy.cats}</Link>
            <Link href="/matcher" className="flex min-h-12 items-center justify-center rounded-full border border-stone-200 bg-white px-4 py-3 text-center text-sm font-semibold text-stone-800 transition hover:border-stone-400 active:scale-[0.98]">{copy.matcher}</Link>
          </nav>

          <p className="mt-7 text-center text-xs font-medium tracking-wide text-stone-400 sm:mt-9">{copy.explore}</p>
        </div>
      </div>
    </section>
  );
}
