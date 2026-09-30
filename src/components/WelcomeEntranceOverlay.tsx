"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";

const SEEN_COOKIE = "mofu_seen_entrance";
const FACTORY_MAP_URL = "https://www.google.com/maps/search/?api=1&query=ベストパートナー株式会社+愛知県豊橋市下地町長池36番地";
const FACTORY_MAP_EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent("ベストパートナー株式会社 愛知県豊橋市下地町長池36番地")}&output=embed`;

type SupplierProofCopy = {
  factoryCaption: string;
  factoryHistory: string;
  factoryAddress: string;
  openMaps: string;
};

function SupplierProofCards({ copy, isZh, desktop = false }: { copy: SupplierProofCopy; isZh: boolean; desktop?: boolean }) {
  return (
    <div className={`${desktop ? "hidden lg:block" : "lg:hidden"} space-y-3`} aria-label={isZh ? "日本供應商實體廠房與地圖" : "Japanese supplier factory and map"}>
      <div className="overflow-hidden rounded-2xl bg-[#eee4d7] shadow-sm">
        <div className="relative aspect-video w-full lg:h-[210px] lg:aspect-auto">
          <Image src="/images/best-partner-factory.jpg" alt={copy.factoryCaption} fill sizes={desktop ? "(min-width: 1024px) 44vw, 100vw" : "100vw"} className="object-cover" />
        </div>
        <div className="px-4 py-2.5 text-xs leading-5 text-[#694c3d] sm:px-5">
          <p className="font-semibold">{copy.factoryCaption}</p>
          <p className="mt-0.5 text-[#896f61]">{copy.factoryHistory}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#d9cbbb] bg-[#fffdf9] shadow-sm">
        <div className="pointer-events-none h-40 sm:pointer-events-auto lg:h-[180px]">
          <iframe title={isZh ? "Best Partner 實體廠址地圖" : "Best Partner factory map"} src={FACTORY_MAP_EMBED_URL} className="h-full w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </div>
        <div className="px-4 py-2.5 sm:px-5">
          <p className="text-xs leading-5 text-[#694c3d]">{copy.factoryAddress}</p>
          <a href={FACTORY_MAP_URL} target="_blank" rel="noopener noreferrer" className="mt-2 flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#7a4b31] px-4 py-2 text-center text-xs font-semibold leading-5 text-white transition hover:bg-[#5e3928] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C86A4B] focus-visible:ring-offset-2">
            <span>{copy.openMaps}</span>
            <svg aria-hidden="true" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M8 7h9v9" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}

export function WelcomeEntranceOverlay() {
  const { locale } = useI18n();
  // The server decides whether this component is rendered from mofu_seen_entrance.
  // Keep the client state visible so the SSR overlay is never hidden during hydration.
  const [isVisible, setIsVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  const dismiss = (afterDismiss?: () => void) => {
    document.cookie = `${SEEN_COOKIE}=1; Path=/; Max-Age=31536000; SameSite=Lax${window.location.protocol === "https:" ? "; Secure" : ""}`;
    setLeaving(true);
    window.setTimeout(() => {
      setIsVisible(false);
      afterDismiss?.();
    }, 500);
  };

  const enterStore = () => {
    dismiss(() => {
      document.getElementById("homepage-products")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  if (!isVisible) return null;

  const isZh = locale === "zh";
  const copy = isZh
    ? {
        status: "🇯🇵 日本在地嚴選・香港現貨直送",
        skip: "直接逛逛 ✕",
        close: "關閉迎賓頁",
        brandSub: "毛毛港・日本寵物選品",
        title: "給最重要的家人，一份純淨無瑕的日本原味。",
        description: "嚴選 100% 日本在地純肉，低溫慢烘保留原始鮮美。專為挑食、敏感與日常潔齒而生。",
        factoryCaption: "🏢 日本愛知縣豐橋市・Best Partner 本社廠房實景",
        factoryHistory: "1926年創業（昭和元年，近百年歷史）｜自社低溫慢烘廠區",
        factoryAddress: "〒440-0086 愛知県豊橋市下地町長池36番地",
        openMaps: "📍 在 Google Maps 中開啟實體廠址導航",
        badgeOne: "🥩 100% 國產天然原肉",
        badgeTwo: "🌿 愛知縣職人慢烘",
        badgeThree: "🚚 滿 HK$399 順豐免運",
        coBrandNote: "日本愛知縣百年本社（創業1926年） × 毛毛港香港官方專營直送",
        enter: "踏入毛毛港・探索純肉選品 →",
        dogs: "🐶 進入狗狗專區",
        cats: "🐱 進入貓咪鮮食",
        welcome: "🎁 首次進店・結帳輸入【 MOFUWELCOME 】立折 HK$20",
        seal: "BEST PARTNER\nSELECTED IN JAPAN",
      }
    : {
        status: "🇯🇵 Selected in Japan · Ships from Hong Kong",
        skip: "Browse directly ✕",
        close: "Close welcome screen",
        brandSub: "Japanese pet selections from Mofu Haven",
        title: "A pure taste of Japan, for the family members who matter most.",
        description: "Carefully selected 100% Japanese natural meat, gently slow-dried to preserve its original flavour. Made for picky eaters, sensitive tummies and everyday dental care.",
        factoryCaption: "🏢 Best Partner head office and factory · Toyohashi, Aichi, Japan",
        factoryHistory: "Founded in 1926 · Nearly a century of in-house slow-drying craft",
        factoryAddress: "36 Nagaike, Shimoji-cho, Toyohashi, Aichi 440-0086, Japan",
        openMaps: "📍 Open the physical factory in Google Maps",
        badgeOne: "🥩 100% Domestic Natural Meat",
        badgeTwo: "🌿 Aichi Artisan Slow-Dried",
        badgeThree: "🚚 Free SF Shipping over HK$399",
        coBrandNote: "A century-old Aichi headquarters (founded 1926) × Mofu Haven official Hong Kong direct shipping",
        enter: "Enter Mofu Haven · Explore the pure-meat edit →",
        dogs: "🐶 Shop for Dogs",
        cats: "🐱 Explore Cat Fresh Food",
        welcome: "🎁 First visit · Enter 【 MOFUWELCOME 】 at checkout for HK$20 off",
        seal: "BEST PARTNER\nSELECTED IN JAPAN",
      };

  return (
    <div
      className={`fixed inset-0 z-[9999] overflow-y-auto bg-[#F8F6F0] text-[#2C2523] opacity-100 transition-opacity duration-500 ease-out ${
        leaving ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label={isZh ? "毛毛港迎賓頁" : "Welcome to Mofu Haven"}
    >
      <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_12%_12%,rgba(200,106,75,0.13),transparent_26%),radial-gradient(circle_at_88%_82%,rgba(161,126,94,0.14),transparent_30%)]" />
      <div className="pointer-events-none absolute -bottom-36 -left-24 h-80 w-80 rounded-full border border-[#d8c8b5]/40 sm:h-[28rem] sm:w-[28rem]" />

      <div className="relative mx-auto flex min-h-[100svh] w-full max-w-7xl flex-col px-5 pb-12 pt-5 sm:px-9 sm:pb-12 sm:pt-8 lg:px-14">
        <header className="flex items-center justify-between gap-4 border-b border-[#d9cbbb]/70 pb-4 text-[11px] font-semibold tracking-[0.12em] text-[#765e50] sm:text-xs">
          <p className="animate-[fadeInUp_500ms_ease-out_both]">{copy.status}</p>
          <button
            type="button"
            onClick={() => dismiss()}
            aria-label={copy.close}
            className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full border border-[#d2c1b1] bg-[#fffdf9]/70 text-[#694c3d] transition hover:border-[#a9785f] hover:bg-white active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C86A4B] focus-visible:ring-offset-2"
          >
            <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <main className="flex flex-1 items-center py-8 sm:py-12 lg:py-5">
          <div className="mx-auto grid w-full max-w-5xl items-center gap-8 lg:grid-cols-2 lg:gap-10">
            <aside className="order-2 lg:order-1">
              <SupplierProofCards copy={copy} isZh={isZh} desktop />
            </aside>

            <section className="order-1 max-w-2xl lg:order-2">
              <div className="animate-[fadeInUp_600ms_80ms_ease-out_both]">
                <div className="flex items-center justify-start gap-2 sm:gap-3 lg:justify-start">
                  <Image
                    src="/logo.png"
                    alt="Mofu Haven"
                    width={160}
                    height={50}
                    priority
                    className="h-8 w-24 object-contain sm:h-10 sm:w-32 md:h-12 md:w-40"
                  />
                  <span className="select-none px-1 text-2xl font-light text-stone-300 sm:px-2 sm:text-3xl" aria-hidden="true">✕</span>
                  <Image
                    src="/images/brands/best-partner-logo.svg"
                    alt="Best Partner Japan"
                    width={180}
                    height={50}
                    priority
                    className="h-8 w-28 object-contain sm:h-10 sm:w-36 md:h-12 md:w-44"
                  />
                </div>
                <p className="mt-1 max-w-xl text-[10px] font-medium uppercase leading-5 tracking-[0.12em] text-stone-500 sm:text-xs sm:tracking-[0.16em]">{copy.coBrandNote}</p>
              </div>

              <div className="mt-7 animate-[fadeInUp_600ms_160ms_ease-out_both] sm:mt-10 lg:mt-7">
                <h1 className="max-w-xl font-[family-name:var(--font-display)] text-[clamp(2.25rem,10vw,4.8rem)] font-semibold leading-[1.08] tracking-[-0.055em] text-[#2C2523] lg:text-3xl lg:leading-[1.15]">
                  {isZh ? <>給最重要的家人，<br />一份純淨無瑕的日本原味。</> : copy.title}
                </h1>
                <p className="mt-5 max-w-xl text-sm leading-7 text-[#705b50] sm:text-base sm:leading-8 lg:text-sm lg:leading-6">{copy.description}</p>
              </div>

              <SupplierProofCards copy={copy} isZh={isZh} />

              <div className="mt-6 flex flex-wrap gap-2.5 animate-[fadeInUp_600ms_240ms_ease-out_both] lg:justify-center">
                {[copy.badgeOne, copy.badgeTwo, copy.badgeThree].map((badge) => (
                  <span key={badge} className="rounded-full border border-[#ddcdbd] bg-[#fffdf9]/75 px-3.5 py-2 text-[11px] font-semibold leading-4 text-[#694c3d] shadow-[0_8px_20px_-18px_rgba(44,37,35,0.6)] sm:text-xs">
                    {badge}
                  </span>
                ))}
              </div>

              <div className="mt-7 space-y-3 animate-[fadeInUp_600ms_320ms_ease-out_both] sm:mt-8 lg:mt-6">
                <button
                  type="button"
                  onClick={enterStore}
                  className="flex min-h-14 w-full items-center justify-center rounded-2xl bg-[#4b342a] px-5 text-center text-sm font-semibold tracking-[0.02em] text-white shadow-[0_16px_30px_-16px_rgba(75,52,42,0.75)] transition hover:-translate-y-0.5 hover:bg-[#38251f] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C86A4B] focus-visible:ring-offset-2 sm:w-fit sm:min-w-[22rem]"
                >
                  {copy.enter}
                </button>
                <div className="grid grid-cols-2 gap-3 sm:max-w-[22rem]">
                  <Link
                    href="/categories/dogs"
                    onClick={() => dismiss()}
                    className="flex min-h-12 items-center justify-center rounded-xl bg-[#ebe6de] px-3 text-center text-xs font-semibold text-[#5b4940] transition hover:bg-[#e1d8cc] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C86A4B] focus-visible:ring-offset-2"
                  >
                    {copy.dogs}
                  </Link>
                  <Link
                    href="/categories/cats"
                    onClick={() => dismiss()}
                    className="flex min-h-12 items-center justify-center rounded-xl bg-[#ebe6de] px-3 text-center text-xs font-semibold text-[#5b4940] transition hover:bg-[#e1d8cc] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C86A4B] focus-visible:ring-offset-2"
                  >
                    {copy.cats}
                  </Link>
                </div>
              </div>
            </section>

          </div>
        </main>

        <footer className="animate-[fadeInUp_600ms_420ms_ease-out_both] border-t border-[#d9cbbb]/70 pt-4 text-center text-[11px] font-medium leading-5 tracking-[0.03em] text-[#896f61] sm:text-xs">
          {copy.welcome}
        </footer>
      </div>
    </div>
  );
}
