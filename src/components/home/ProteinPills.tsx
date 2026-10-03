"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { IngredientKey } from "@/components/menu/IngredientFilterPanel";

type ProteinAudience = "all" | "dogs" | "cats";

type ProteinItem = {
  key: IngredientKey;
  icon: string;
  zh: string;
  en: string;
  descZh: string;
  descEn: string;
};

const PROTEINS: ProteinItem[] = [
  { key: "beef", icon: "🥩", zh: "牛肉系列", en: "Beef", descZh: "牛舌・牛大筋・牛蹄", descEn: "Tongue · Tendon · Hoof" },
  { key: "chicken", icon: "🍗", zh: "雞肉系列", en: "Chicken", descZh: "雞里肌・砂肝・雞軟骨", descEn: "Breast · Gizzard · Cartilage" },
  { key: "venison", icon: "🦌", zh: "野生鹿肉", en: "Wild Venison", descZh: "北海道蝦夷鹿・低脂高鐵", descEn: "Hokkaido deer · Lean & iron-rich" },
  { key: "horse", icon: "🐎", zh: "純馬肉", en: "Pure Horse Meat", descZh: "低敏肉乾・過敏犬首選", descEn: "Gentle protein for sensitive dogs" },
  { key: "pork", icon: "🐖", zh: "日本黑豚", en: "Japanese Black Pork", descZh: "鹿兒島豬耳・脆耳條", descEn: "Kagoshima pork ears" },
  { key: "seafood", icon: "🐟", zh: "深海魚類", en: "Deep-Sea Fish", descZh: "黃鰭柴魚・小魚乾・鯊魚皮", descEn: "Tuna · Sardines · Shark skin" },
  { key: "dairy", icon: "🧀", zh: "乳酪野菜", en: "Cheese & Produce", descZh: "犛牛芝士・黃金地瓜", descEn: "Yak cheese · Sweet potato" },
];

export function ProteinPills({ audience = "all" }: { audience?: ProteinAudience }) {
  const { locale } = useI18n();
  const isZh = locale === "zh";
  const base = audience === "all" ? "/menu" : `/categories/${audience}`;

  return (
    <section className="border-y border-[#eaded3] bg-[#fffaf5] px-4 py-4 sm:px-6" aria-label={isZh ? "按肉種選購" : "Shop by protein"}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold tracking-[0.18em] text-[#a76443]">{isZh ? "按蛋白質來源選購" : "SHOP BY PROTEIN"}</p>
            <h2 className="mt-0.5 text-base font-bold text-[#493526] sm:text-lg">{isZh ? "揀選毛孩最合適的肉種" : "Find the right protein for your pet"}</h2>
          </div>
          <Link href={base} className="shrink-0 text-xs font-semibold text-[#a76443] hover:underline">{isZh ? "查看全部 →" : "View all →"}</Link>
        </div>
        <nav className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4" aria-label={isZh ? "肉種快捷導航" : "Protein shortcuts"}>
          {PROTEINS.map((item) => (
            <Link
              key={item.key}
              href={`${base}?ingredient=${item.key}`}
              className="group flex min-w-0 items-center gap-3 rounded-2xl border border-[#eaded3] bg-white px-3 py-2.5 transition hover:-translate-y-0.5 hover:border-[#c79573] hover:shadow-sm sm:px-4"
            >
              <span className="shrink-0 text-xl" aria-hidden="true">{item.icon}</span>
              <span className="min-w-0">
                <span className="block text-xs font-bold leading-5 text-[#493526] sm:text-sm">{isZh ? item.zh : item.en}</span>
                <span className="mt-0.5 block line-clamp-2 text-[10px] leading-4 text-[#806759] sm:text-xs">{isZh ? item.descZh : item.descEn}</span>
              </span>
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
