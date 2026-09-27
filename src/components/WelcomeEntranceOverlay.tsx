"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";

const SEEN_KEY = "mofu_has_seen_entrance";

export function WelcomeEntranceOverlay() {
  const { locale } = useI18n();
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const hasSeen = sessionStorage.getItem(SEEN_KEY);
      if (!hasSeen) {
        setIsVisible(true);
      }
    } catch {
      // If storage is unavailable, keep the welcome moment available for this visit.
      setIsVisible(true);
    }
  }, []);

  const dismiss = (afterDismiss?: () => void) => {
    try {
      sessionStorage.setItem(SEEN_KEY, "true");
    } catch {
      // The overlay still dismisses when storage is blocked by the browser.
    }
    setLeaving(true);
    window.setTimeout(() => {
      setIsVisible(false);
      afterDismiss?.();
    }, 600);
  };

  const enterStore = () => {
    dismiss(() => {
      document.getElementById("homepage-products")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  if (!mounted || !isVisible) return null;

  const isZh = locale === "zh";
  const copy = isZh
    ? {
        status: "🇯🇵 日本在地嚴選・香港現貨直送",
        skip: "直接逛逛 ✕",
        brandSub: "毛毛港・日本寵物選品",
        title: "給最重要的家人，一份純淨無瑕的日本原味。",
        description: "嚴選 100% 日本在地純肉，低溫慢烘保留原始鮮美。專為挑食、敏感與日常潔齒而生。",
        badgeOne: "🥩 100% 國產天然原肉",
        badgeTwo: "🌿 愛知縣職人慢烘",
        badgeThree: "🚚 滿 HK$399 順豐免運",
        enter: "踏入毛毛港・探索純肉選品 →",
        dogs: "🐶 進入狗狗專區",
        cats: "🐱 進入貓咪鮮食",
        welcome: "🎁 首次進店・結帳輸入【 MOFUWELCOME 】立折 HK$20",
        seal: "BEST PARTNER\nSELECTED IN JAPAN",
      }
    : {
        status: "🇯🇵 Selected in Japan · Ships from Hong Kong",
        skip: "Browse directly ✕",
        brandSub: "Japanese pet selections from Mofu Haven",
        title: "A pure taste of Japan, for the family members who matter most.",
        description: "Carefully selected 100% Japanese natural meat, gently slow-dried to preserve its original flavour. Made for picky eaters, sensitive tummies and everyday dental care.",
        badgeOne: "🥩 100% Domestic Natural Meat",
        badgeTwo: "🌿 Aichi Artisan Slow-Dried",
        badgeThree: "🚚 Free SF Shipping over HK$399",
        enter: "Enter Mofu Haven · Explore the pure-meat edit →",
        dogs: "🐶 Shop for Dogs",
        cats: "🐱 Explore Cat Fresh Food",
        welcome: "🎁 First visit · Enter 【 MOFUWELCOME 】 at checkout for HK$20 off",
        seal: "BEST PARTNER\nSELECTED IN JAPAN",
      };

  return (
    <div
      className={`fixed inset-0 z-[9999] overflow-y-auto bg-[#F8F6F0] text-[#2C2523] transition-[opacity,transform] duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] ${
        leaving ? "scale-[1.04] opacity-0" : "scale-100 opacity-100"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label={isZh ? "毛毛港迎賓頁" : "Welcome to Mofu Haven"}
    >
      <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_12%_12%,rgba(200,106,75,0.13),transparent_26%),radial-gradient(circle_at_88%_82%,rgba(161,126,94,0.14),transparent_30%)]" />
      <div className="pointer-events-none absolute -right-24 top-24 h-72 w-72 rounded-full border border-[#d8c8b5]/50 sm:h-96 sm:w-96" />
      <div className="pointer-events-none absolute -bottom-36 -left-24 h-80 w-80 rounded-full border border-[#d8c8b5]/40 sm:h-[28rem] sm:w-[28rem]" />

      <div className="relative mx-auto flex min-h-[100svh] w-full max-w-7xl flex-col px-5 py-5 sm:px-9 sm:py-8 lg:px-14">
        <header className="flex items-center justify-between gap-4 border-b border-[#d9cbbb]/70 pb-4 text-[11px] font-semibold tracking-[0.12em] text-[#765e50] sm:text-xs">
          <p className="animate-[fadeInUp_500ms_ease-out_both]">{copy.status}</p>
          <button
            type="button"
            onClick={() => dismiss()}
            className="min-h-11 shrink-0 rounded-full border border-[#d2c1b1] bg-[#fffdf9]/70 px-4 text-[11px] tracking-[0.08em] transition hover:border-[#a9785f] hover:bg-white active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C86A4B] focus-visible:ring-offset-2"
          >
            {copy.skip}
          </button>
        </header>

        <main className="flex flex-1 items-center py-10 sm:py-14 lg:py-10">
          <div className="grid w-full items-center gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(300px,0.92fr)] lg:gap-20">
            <section className="max-w-2xl">
              <div className="animate-[fadeInUp_600ms_80ms_ease-out_both]">
                <p className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-[-0.05em] text-[#2C2523] sm:text-4xl">
                  Mofu Haven
                </p>
                <p className="mt-1 text-[11px] font-medium tracking-[0.2em] text-[#9a7764]">{copy.brandSub}</p>
              </div>

              <div className="mt-10 animate-[fadeInUp_600ms_160ms_ease-out_both] sm:mt-14">
                <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.28em] text-[#C86A4B]">Mofu Haven · Best Partner selections</p>
                <h1 className="max-w-xl font-[family-name:var(--font-display)] text-[clamp(2.25rem,10vw,4.8rem)] font-semibold leading-[1.08] tracking-[-0.055em] text-[#2C2523]">
                  {copy.title}
                </h1>
                <p className="mt-6 max-w-xl text-sm leading-7 text-[#705b50] sm:text-base sm:leading-8">{copy.description}</p>
              </div>

              <div className="mt-7 flex flex-wrap gap-2.5 animate-[fadeInUp_600ms_240ms_ease-out_both]">
                {[copy.badgeOne, copy.badgeTwo, copy.badgeThree].map((badge) => (
                  <span key={badge} className="rounded-full border border-[#ddcdbd] bg-[#fffdf9]/75 px-3.5 py-2 text-[11px] font-semibold leading-4 text-[#694c3d] shadow-[0_8px_20px_-18px_rgba(44,37,35,0.6)] sm:text-xs">
                    {badge}
                  </span>
                ))}
              </div>

              <div className="mt-9 space-y-3 animate-[fadeInUp_600ms_320ms_ease-out_both] sm:mt-10">
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

            <aside className="relative hidden min-h-[25rem] items-center justify-center lg:flex">
              <div className="relative flex aspect-[4/5] w-full max-w-[27rem] rotate-[2deg] items-center justify-center rounded-[2rem] border border-[#d8c7b6] bg-[#eee4d7] p-8 shadow-[0_30px_80px_-35px_rgba(76,52,41,0.42)] animate-[fadeInUp_800ms_220ms_ease-out_both]">
                <div className="absolute inset-5 rounded-[1.5rem] border border-[#cbb6a2]" />
                <div className="relative flex h-full w-full flex-col items-center justify-between rounded-[1.25rem] bg-[#f9f5ee]/80 px-8 py-10 text-center">
                  <span className="text-[10px] font-bold tracking-[0.36em] text-[#a47760]">JAPAN · HONG KONG</span>
                  <div>
                    <div className="mx-auto mb-7 flex h-24 w-24 items-center justify-center rounded-full border border-[#c8ae99] bg-[#f3e8dc] text-5xl shadow-inner">🐕</div>
                    <p className="whitespace-pre-line font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight tracking-wide text-[#4b342a]">{copy.seal}</p>
                    <div className="mx-auto mt-7 h-px w-16 bg-[#c86a4b]" />
                  </div>
                  <span className="text-[10px] font-medium tracking-[0.22em] text-[#9a7764]">NATURAL · SIMPLE · WARM</span>
                </div>
              </div>
            </aside>
          </div>
        </main>

        <footer className="animate-[fadeInUp_600ms_420ms_ease-out_both] border-t border-[#d9cbbb]/70 pt-4 text-center text-[11px] font-medium leading-5 tracking-[0.03em] text-[#896f61] sm:text-xs">
          {copy.welcome}
        </footer>
      </div>
    </div>
  );
}
