"use client";

import { useState, type MouseEvent } from "react";
import { CategoryNavLink } from "@/components/CategoryNavLink";
import type { Product } from "@/lib/products";

export type IngredientKey = "chicken" | "venison" | "horse" | "beef" | "duck" | "pork" | "lamb" | "kangaroo" | "seafood" | "produce" | "dairy";
export type IngredientFilter = { key: IngredientKey; zh: string; en: string; emoji: string; group: "meat" | "seafood" | "produce" | "dairy" };

export const INGREDIENT_FILTERS: IngredientFilter[] = [
  { key: "chicken", zh: "純雞肉", en: "Chicken", emoji: "🐔", group: "meat" },
  { key: "venison", zh: "蝦夷鹿肉", en: "Venison", emoji: "🦌", group: "meat" },
  { key: "horse", zh: "低敏純馬肉", en: "Horse", emoji: "🐴", group: "meat" },
  { key: "beef", zh: "牛肉牛筋", en: "Beef", emoji: "🥩", group: "meat" },
  { key: "duck", zh: "櫻桃鴨肉", en: "Duck", emoji: "🦆", group: "meat" },
  { key: "pork", zh: "鹿兒島黑豚", en: "Pork", emoji: "🐷", group: "meat" },
  { key: "lamb", zh: "溫補羊肉", en: "Lamb", emoji: "🐑", group: "meat" },
  { key: "kangaroo", zh: "袋鼠肉", en: "Kangaroo", emoji: "🦘", group: "meat" },
  { key: "seafood", zh: "深海魚介", en: "Fish & Seafood", emoji: "🐟", group: "seafood" },
  { key: "produce", zh: "田園蔬果", en: "Fruits & Veg", emoji: "🍠", group: "produce" },
  { key: "dairy", zh: "犛牛芝士乳品", en: "Cheese & Dairy", emoji: "🧀", group: "dairy" },
];

export const INGREDIENT_GROUPS = [
  { key: "meat", zh: "陸生肉類", en: "Poultry & Meat", emoji: "🥩" },
  { key: "seafood", zh: "深海魚介", en: "Seafood", emoji: "🐟" },
  { key: "produce", zh: "田園蔬果", en: "Produce", emoji: "🍠" },
  { key: "dairy", zh: "天然乳品", en: "Dairy & Snacks", emoji: "🧀" },
] as const;

export function parseIngredientSelection(value: string | null | undefined): IngredientKey[] {
  const valid = new Set(INGREDIENT_FILTERS.map((item) => item.key));
  return (value ?? "").split(",").filter((item): item is IngredientKey => valid.has(item as IngredientKey));
}

export function productMatchesIngredient(product: Product, filters: IngredientKey[]) {
  if (filters.length === 0) return true;
  const text = [product.name.zh, product.name.en, product.description?.zh, product.description?.en, ...(product.tags ?? []), ...Object.values(product.metadata ?? {})].filter(Boolean).join(" ");
  const patterns: Record<IngredientKey, RegExp> = {
    chicken: /純天然雞肉|雞胸肉|雞肉|鶏|ささみ|chicken/i,
    venison: /低敏鹿肉|蝦夷鹿|鹿肉|鹿肋排|鹿骨|鹿角|ベニソン|venison|deer/i,
    horse: /低敏馬肉|馬肉|馬|horse/i,
    beef: /嚴選牛肉|牛肉|牛筋|牛蹄|牛舌|ビーフ|beef/i,
    duck: /鴨肉|鴨|duck|カモ/i,
    pork: /豬肉|黑豚|豬耳|豚|ポーク|pork/i,
    lamb: /羊肉|羊|ラム|lamb|sheep/i,
    kangaroo: /袋鼠|カンガルー|kangaroo/i,
    seafood: /深海魚介|魚介|魚|鮪|金槍魚|吞拿魚|鮭|鱈|鯊魚|小魚乾|まぐろ|マグロ|かつお|seafood|fish|tuna|bonito|salmon|shark/i,
    produce: /蔬菜|水果|地瓜|紫薯|香蕉|蘋果|豆腐|納豆|野菜|果物|フルーツ|vegetable|fruit|produce|tofu|natto|sweet\s*potato/i,
    dairy: /乳製品|芝士|乳酪|奶酪|チーズ|cheese|dairy/i,
  };
  return filters.some((filter) => patterns[filter].test(text));
}

type IngredientFilterPanelProps = {
  locale: "zh" | "en";
  selected: IngredientKey[];
  products: Product[];
  onSelect: (keys: IngredientKey[]) => void;
  onToggle: (key: IngredientKey) => void;
  onQuickSelect: (event: MouseEvent<HTMLAnchorElement>, href: string, slug: IngredientKey) => void;
  isFoodProduct: (product: Product) => boolean;
};

export function IngredientFilterPanel({ locale, selected, products, onSelect, onToggle, onQuickSelect, isFoodProduct }: IngredientFilterPanelProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const label = (item: IngredientFilter) => `${item.emoji} ${locale === "en" ? item.en : item.zh}`;
  const countFor = (key: IngredientKey) => products.filter((product) => isFoodProduct(product) && productMatchesIngredient(product, [key])).length;
  const visibleCount = products.filter((product) => isFoodProduct(product) && productMatchesIngredient(product, selected)).length;
  const groupLabel = (group: typeof INGREDIENT_GROUPS[number]) => `${group.emoji} ${locale === "en" ? group.en : group.zh}`;
  return <section className="mb-7" aria-label={locale === "en" ? "Protein and ingredient filters" : "肉源與食材篩選"}>
    <div className="mb-3 flex items-center justify-between gap-3 lg:hidden">
      <p className="text-sm font-semibold text-[color:var(--ink)]">{locale === "en" ? "Shop by ingredient" : "按食材選購"}</p>
      <button type="button" onClick={() => setSheetOpen(true)} className="inline-flex min-h-10 shrink-0 items-center rounded-full border border-[color:var(--line)] bg-white px-4 text-sm font-semibold text-[color:var(--ink)] shadow-sm">⚙ {locale === "en" ? "Filters" : "篩選"}{selected.length ? ` (${selected.length})` : ""}</button>
    </div>
    <nav className="flex snap-x snap-mandatory items-center gap-2 overflow-x-auto px-1 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:hidden" aria-label={locale === "en" ? "Quick ingredient filters" : "快捷食材篩選"}>
      <button type="button" onClick={() => onSelect([])} className={`shrink-0 snap-start rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition ${selected.length === 0 ? "border-[#C86A2B] bg-[#C86A2B] text-white shadow-sm" : "border-[color:var(--line)] bg-[color:var(--surface)] text-[color:var(--muted)]"}`}>{locale === "en" ? "All ingredients" : "全部食材"}</button>
      {INGREDIENT_FILTERS.map((item) => { const active = selected.includes(item.key); const href = `/menu?ingredient=${item.key}`; return <CategoryNavLink key={item.key} href={href} onClick={(event) => onQuickSelect(event, href, item.key)} className={`shrink-0 snap-start rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition ${active ? "border-[#C86A2B] bg-[#C86A2B] text-white shadow-sm" : "border-[color:var(--line)] bg-[color:var(--surface)] text-[color:var(--muted)] hover:border-[#C86A2B]"}`}>{label(item)}</CategoryNavLink>; })}
    </nav>
    <aside className="sticky top-24 hidden w-64 shrink-0 rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] p-4 lg:block">
      <div className="mb-4 flex items-center justify-between"><h2 className="text-sm font-bold text-[color:var(--ink)]">{locale === "en" ? "Ingredients" : "食材分類"}</h2><button type="button" onClick={() => onSelect([])} className="text-xs text-[color:var(--accent)] hover:underline">{locale === "en" ? "Clear all" : "清除全部"}</button></div>
      <button type="button" onClick={() => onSelect([])} className={`mb-3 flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm ${selected.length === 0 ? "bg-[#C86A2B] font-semibold text-white" : "bg-white text-[color:var(--muted)]"}`}><span>{locale === "en" ? "All ingredients" : "全部食材"}</span><span>{products.length}</span></button>
      {INGREDIENT_GROUPS.map((group) => <div key={group.key} className="mb-4"><p className="mb-2 text-xs font-bold tracking-wide text-[color:var(--muted)]">{groupLabel(group)}</p><div className="space-y-1">{INGREDIENT_FILTERS.filter((item) => item.group === group.key).map((item) => <button key={item.key} type="button" onClick={() => onToggle(item.key)} className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm transition ${selected.includes(item.key) ? "bg-[#C86A2B] font-semibold text-white" : "text-[color:var(--ink)] hover:bg-white"}`}><span>{label(item)}</span><span className="text-xs opacity-70">{countFor(item.key)}</span></button>)}</div></div>)}
    </aside>
    {sheetOpen ? <div className="fixed inset-0 z-[100] lg:hidden" role="dialog" aria-modal="true"><button type="button" className="absolute inset-0 bg-black/30" aria-label={locale === "en" ? "Close filters" : "關閉篩選"} onClick={() => setSheetOpen(false)} /><div className="absolute inset-x-0 bottom-0 max-h-[82vh] overflow-y-auto rounded-t-3xl bg-[color:var(--surface)] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl"><div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[color:var(--line)]" /><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-bold text-[color:var(--ink)]">{locale === "en" ? "Filter ingredients" : "篩選食材"}</h2><button type="button" onClick={() => onSelect([])} className="text-sm text-[color:var(--accent)]">{locale === "en" ? "Clear all" : "清除全部"}</button></div>{INGREDIENT_GROUPS.map((group) => <div key={group.key} className="mb-5"><p className="mb-2 text-sm font-bold text-[color:var(--ink)]">{groupLabel(group)}</p><div className="grid grid-cols-2 gap-2">{INGREDIENT_FILTERS.filter((item) => item.group === group.key).map((item) => <button key={item.key} type="button" onClick={() => onToggle(item.key)} className={`flex min-h-11 items-center justify-between rounded-xl border px-3 text-left text-sm ${selected.includes(item.key) ? "border-[#C86A2B] bg-[#C86A2B] text-white" : "border-[color:var(--line)] bg-white text-[color:var(--ink)]"}`}><span>{label(item)}</span><span className="text-xs opacity-70">{countFor(item.key)}</span></button>)}</div></div>)}<button type="button" onClick={() => setSheetOpen(false)} className="mt-2 flex min-h-12 w-full items-center justify-center rounded-xl bg-[#C86A2B] text-sm font-bold text-white">{locale === "en" ? `View products (${visibleCount})` : `查看商品（${visibleCount}）`}</button></div></div> : null}
  </section>;
}
