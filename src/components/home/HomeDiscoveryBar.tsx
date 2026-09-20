"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/I18nProvider";

const ITEMS = [
  { href: "/collections/dental-chews", icon: "🐶", zh: "潔齒耐咬", en: "Dental Chews" },
  { href: "/collections/horse-meat", icon: "🥩", zh: "天然原肉", en: "Natural Jerky" },
  { href: "/collections/cats", icon: "🐱", zh: "貓咪凍乾", en: "Cat Treats" },
  { href: "/collections/outdoor-gear", icon: "🦮", zh: "散步機能", en: "Walking Gear" },
  { href: "/collections/value-bundles", icon: "🎁", zh: "超值套裝", en: "Value Bundles" },
  { href: "/brand/best-partner", icon: "🇯🇵", zh: "日本原裝", en: "Japan Direct" },
] as const;

const TRUST_ITEMS = [
  { icon: "🇯🇵", zh: "日本原裝正規進口", en: "100% Japan Genuine" },
  { icon: "🌿", zh: "零化學添加・無著色", en: "Zero Artificial Additives" },
  { icon: "⚡", zh: "香港現貨 1–2 日出貨", en: "Fast Dispatch via SF Express" },
  { icon: "🚚", zh: "滿額順豐免運", en: "Free SF Express Delivery" },
] as const;

export function HomeDiscoveryBar() {
  const { locale } = useI18n();
  const isZh = locale === "zh";

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <nav aria-label={isZh ? "快速分類" : "Quick categories"} className="flex gap-2 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {ITEMS.map((item) => (
          <Link key={item.href} href={item.href} className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-stone-100 px-3.5 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-[#FAF7F2] hover:text-[#8b573f] sm:text-sm">
            <span aria-hidden>{item.icon}</span>{isZh ? item.zh : item.en}
          </Link>
        ))}
      </nav>
      <ul aria-label={isZh ? "品質保障" : "Store assurances"} className="grid grid-cols-2 gap-2 border-y border-stone-200/70 py-3 sm:grid-cols-4 sm:gap-3">
        {TRUST_ITEMS.map((item) => (
          <li key={item.en} className="flex min-w-0 items-center gap-2 rounded-xl bg-[#FAF7F2] px-2.5 py-2 text-[11px] leading-4 text-stone-600 sm:justify-center sm:text-xs">
            <span aria-hidden className="shrink-0 text-base">{item.icon}</span>
            <span>{isZh ? item.zh : item.en}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
