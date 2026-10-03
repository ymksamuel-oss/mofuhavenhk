"use client";

import type { IngredientKey } from "@/components/menu/IngredientFilterPanel";

type ProteinItem = {
  key: IngredientKey;
  zh: string;
  en: string;
};

const DOG_PROTEINS: ProteinItem[] = [
  { key: "chicken", zh: "純雞肉", en: "Chicken" },
  { key: "venison", zh: "蝦夷鹿肉", en: "Venison" },
  { key: "horse", zh: "純馬肉", en: "Horse" },
  { key: "beef", zh: "牛肉・牛筋", en: "Beef" },
  { key: "duck", zh: "櫻桃鴨肉", en: "Duck" },
  { key: "pork", zh: "黑豚肉", en: "Pork" },
  { key: "lamb", zh: "羊肉", en: "Lamb" },
  { key: "kangaroo", zh: "袋鼠肉", en: "Kangaroo" },
  { key: "seafood", zh: "深海魚介", en: "Seafood" },
  { key: "produce", zh: "田園蔬果", en: "Produce" },
  { key: "dairy", zh: "乳製品", en: "Dairy" },
];

const CAT_PROTEINS: ProteinItem[] = [
  { key: "seafood", zh: "深海魚介", en: "Seafood" },
  { key: "chicken", zh: "純雞肉", en: "Chicken" },
  { key: "horse", zh: "純馬肉", en: "Horse" },
  { key: "dairy", zh: "天然乳製品", en: "Dairy" },
];

export function ProteinPills({
  audience,
  selected,
  onSelect,
}: {
  audience: "dogs" | "cats";
  selected: IngredientKey[];
  onSelect: (keys: IngredientKey[]) => void;
}) {
  const proteins = audience === "dogs" ? DOG_PROTEINS : CAT_PROTEINS;
  const isAllSelected = selected.length === 0;

  return (
    <section className="w-full" aria-label="Meat and ingredient filters">
      <nav className="flex items-center gap-2.5 overflow-x-auto scrollbar-none py-3 w-full" aria-label="Meat source filters">
        <button
          type="button"
          onClick={() => onSelect([])}
          className={`whitespace-nowrap flex-shrink-0 rounded-lg border px-4 py-2 text-xs md:text-sm font-medium transition-all ${isAllSelected ? "bg-[#C86A2B] text-white border-[#C86A2B] shadow-sm" : "bg-white border border-stone-200 text-stone-700 hover:border-[#C86A2B]"}`}
        >
          全部 All
        </button>
        {proteins.map((item) => {
          const active = selected.includes(item.key);
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelect([item.key])}
              className={`whitespace-nowrap flex-shrink-0 rounded-lg border px-4 py-2 text-xs md:text-sm font-medium transition-all ${active ? "bg-[#C86A2B] text-white border-[#C86A2B] shadow-sm" : "bg-white border border-stone-200 text-stone-700 hover:border-[#C86A2B]"}`}
            >
              {item.zh} {item.en}
            </button>
          );
        })}
      </nav>
    </section>
  );
}
