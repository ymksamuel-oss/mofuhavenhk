"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";

const SEEN_COOKIE = "mofu_seen_entrance";

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
      document.getElementById("products")?.scrollIntoView({ behavior: "smooth", block: "start" });
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
        badgeOne: "🥩 100% 國產天然原肉",
        badgeTwo: "🌿 職人低溫慢烘",
        badgeThree: "🚚 滿 HK$399 順豐免運",
        coBrandNote: "日本原裝嚴選 × 毛毛港香港官方專營直送",
        enter: "踏入毛毛港・探索純肉選品 →",
        dogs: "🐶 進入狗狗專區",
        cats: "🐱 進入貓咪鮮食",
        welcome: "🎁 首次進店・結帳輸入【 MOFUWELCOME 】立折 HK$20",
        seal: "Best Partner\n日本原裝嚴選",
      }
    : {
        status: "🇯🇵 Selected in Japan · Ships from Hong Kong",
        skip: "Browse directly ✕",
        close: "Close welcome screen",
        brandSub: "Japanese pet selections from Mofu Haven",
        title: "A pure taste of Japan, for the family members who matter most.",
        description: "Carefully selected 100% Japanese natural meat, gently slow-dried to preserve its original flavour. Made for picky eaters, sensitive tummies and everyday dental care.",
        badgeOne: "🥩 100% Domestic Natural Meat",
        badgeTwo: "🌿 Gently Slow-Dried",
        badgeThree: "🚚 Free SF Shipping over HK$399",
        coBrandNote: "Carefully selected in Japan · Officially shipped by Mofu Haven Hong Kong",
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

      <div className="relative mx-auto flex min-h-[100svh] w-full max-w-5xl flex-col px-5 pb-8 pt-5 sm:px-9 sm:pb-10 sm:pt-8 lg:px-14">
        <header className="flex items-center justify-between gap-4 border-b border-[#d9cbbb]/70 pb-4 text-[11px] font-semibold tracking-[0.12em] text-[#765e50] sm:text-xs">
          <p className="animate-[fadeInUp_500ms_ease-out_both]">{copy.status}</p>
          <button
            type="button"
            onClick={() => dismiss()}
            aria-label={copy.close}
            className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full border border-[#d2c1b1] bg-[#FFFFFF]/70 text-[#694c3d] transition hover:border-[#a9785f] hover:bg-white active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C86A4B] focus-visible:ring-offset-2"
          >
            <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <main className="flex flex-1 items-center justify-center py-8 sm:py-12">
          <div className="mx-auto w-full max-w-3xl">
            <section className="text-center">
              <div className="animate-[fadeInUp_600ms_80ms_ease-out_both]">
                <div className="mb-6 w-full">
                  <div className="flex items-center justify-center gap-6 sm:gap-10">
                    <div className="flex h-24 w-auto shrink-0 items-center justify-center md:h-28">
                      <Image
                        src="/images/brands/mofu-haven-normalized.png"
                        alt="Mofu Haven 毛毛港"
                        width={740}
                        height={600}
                        priority
                        className="max-h-full w-auto max-w-[200px] object-contain mix-blend-multiply sm:max-w-[240px] md:max-w-[280px]"
                      />
                    </div>
                    <div className="flex h-24 w-auto shrink-0 items-center justify-center md:h-28">
                      <Image
                        src="/images/brands/best-partner-logo.svg"
                        alt="Best Partner Japan"
                        width={180}
                        height={50}
                        priority
                        className="h-full w-auto max-w-[180px] -translate-y-1 object-contain mix-blend-multiply sm:max-w-[220px] md:max-w-[250px]"
                      />
                    </div>
                  </div>
                  <p className="mt-3 text-center text-xs font-medium tracking-wide text-stone-600 sm:text-sm">{copy.coBrandNote}</p>
                </div>
              </div>

              <div className="mt-7 animate-[fadeInUp_600ms_160ms_ease-out_both] sm:mt-10 lg:mt-7">
                <h1 className="mx-auto max-w-2xl font-[family-name:var(--font-display)] text-[clamp(2.25rem,10vw,4.8rem)] font-semibold leading-[1.08] tracking-[-0.055em] text-[#2C2523] lg:text-5xl lg:leading-[1.15]">
                  {isZh ? <>給最重要的家人，<br />一份純淨無瑕的日本原味。</> : copy.title}
                </h1>
                <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#705b50] sm:text-base sm:leading-8">{copy.description}</p>
              </div>
              <div className="mt-7 flex flex-wrap justify-center gap-2.5 animate-[fadeInUp_600ms_240ms_ease-out_both]">
                {[copy.badgeOne, copy.badgeTwo, copy.badgeThree].map((badge) => (
                  <span key={badge} className="rounded-full border border-[#ddcdbd] bg-[#FFFFFF]/75 px-3.5 py-2 text-[11px] font-semibold leading-4 text-[#694c3d] shadow-[0_8px_20px_-18px_rgba(44,37,35,0.6)] sm:text-xs">
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
                    href="/collections/dogs"
                    onClick={() => dismiss()}
                    className="flex min-h-12 items-center justify-center rounded-xl bg-[#FFFFFF] px-3 text-center text-xs font-semibold text-[#5b4940] transition hover:bg-[#F5F5F5] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C86A4B] focus-visible:ring-offset-2"
                  >
                    {copy.dogs}
                  </Link>
                  <Link
                    href="/collections/cats"
                    onClick={() => dismiss()}
                    className="flex min-h-12 items-center justify-center rounded-xl bg-[#FFFFFF] px-3 text-center text-xs font-semibold text-[#5b4940] transition hover:bg-[#F5F5F5] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C86A4B] focus-visible:ring-offset-2"
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
