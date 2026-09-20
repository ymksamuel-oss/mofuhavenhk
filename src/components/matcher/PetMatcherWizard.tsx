"use client";

import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { useCatalog } from "@/lib/catalog-context";
import { formatMoney } from "@/lib/i18n/translations";
import { getLocalizedProductName } from "@/lib/translateProductName";
import type { Product } from "@/lib/products";
import { useCart } from "@/lib/shop/cart";
import { ProductImage } from "@/components/product/ProductImage";

export type PetMatcherWizardProps = { variant: "home" | "floating" };
type Pet = "dog" | "cat";
type Age = "young" | "adult" | "senior";
type Need = "chew" | "dental" | "walk" | "sensitive" | "picky-cat" | "urinary";

type Choice = { zh: string; en: string };

const BREEDS: Record<Pet, Choice[]> = {
  dog: [
    { zh: "柴犬", en: "Shiba Inu" },
    { zh: "玩具貴婦", en: "Toy Poodle" },
    { zh: "松鼠狗", en: "Pomeranian" },
    { zh: "比熊犬", en: "Bichon Frise" },
    { zh: "哥基", en: "Corgi" },
    { zh: "法國鬥牛犬", en: "French Bulldog" },
    { zh: "唐狗／混種犬", en: "Mixed Breed" },
    { zh: "金毛尋回犬", en: "Golden Retriever" },
    { zh: "史納莎", en: "Schnauzer" },
    { zh: "拉布拉多", en: "Labrador Retriever" },
    { zh: "哈士奇", en: "Siberian Husky" },
    { zh: "其他", en: "Other" },
  ],
  cat: [
    { zh: "英國短毛貓", en: "British Shorthair" },
    { zh: "唐貓／家貓", en: "Domestic Shorthair" },
    { zh: "布偶貓", en: "Ragdoll" },
    { zh: "美國短毛貓", en: "American Shorthair" },
    { zh: "異國短毛貓", en: "Exotic Shorthair" },
    { zh: "曼赤肯短腿貓", en: "Munchkin" },
    { zh: "暹羅貓", en: "Siamese" },
    { zh: "緬因貓", en: "Maine Coon" },
    { zh: "其他", en: "Other" },
  ],
};

const QUICK_BREEDS: Record<Pet, Choice[]> = {
  dog: [
    { zh: "柴犬", en: "Shiba Inu" },
    { zh: "貴婦", en: "Toy Poodle" },
    { zh: "哥基", en: "Corgi" },
    { zh: "唐狗", en: "Mixed Breed" },
    { zh: "比熊", en: "Bichon Frise" },
  ],
  cat: [
    { zh: "英短", en: "British Shorthair" },
    { zh: "唐貓", en: "Domestic Shorthair" },
    { zh: "布偶", en: "Ragdoll" },
    { zh: "美短", en: "American Shorthair" },
  ],
};

const NEEDS: Record<Pet, Array<{ id: Need; label: Choice; hint: Choice; keywords: string[] }>> = {
  dog: [
    { id: "chew", label: { zh: "拆家放電・極致耐咬", en: "Power chewing & energy release" }, hint: { zh: "原隻牛蹄／特長牛大筋", en: "Whole hooves and beef tendons" }, keywords: ["hoof", "tendon", "beef", "chew", "牛蹄", "牛大筋", "耐咬"] },
    { id: "dental", label: { zh: "日常口腔護理・物理潔齒", en: "Everyday dental care" }, hint: { zh: "牛肉皮潔齒棒／潔齒圈", en: "Dental sticks and rings" }, keywords: ["dental", "tooth", "oral", "ring", "潔齒", "牙", "口腔"] },
    { id: "walk", label: { zh: "出門暴衝・舒適散步", en: "Comfortable walks without pulling" }, hint: { zh: "Y 型減壓胸背帶／牽引繩", en: "Y-harnesses and pressure-friendly leads" }, keywords: ["harness", "lead", "walk", "outdoor", "walking", "胸背", "牽引", "散步"] },
    { id: "sensitive", label: { zh: "敏感腸胃・挑食毛孩", en: "Sensitive stomachs & picky eaters" }, hint: { zh: "北海道野生鹿肉／低敏馬肉", en: "Hokkaido venison and gentle horse meat" }, keywords: ["venison", "horse", "meat", "sensitive", "鹿肉", "馬肉", "原肉"] },
  ],
  cat: [
    { id: "picky-cat", label: { zh: "挑食胃口差・純肉開胃", en: "Picky appetites & pure-meat treats" }, hint: { zh: "天然帆立貝唇／魚肉條", en: "Scallop lips and fish strips" }, keywords: ["fish", "seafood", "scallop", "treat", "魚", "帆立", "肉泥"] },
    { id: "urinary", label: { zh: "下泌尿道健康照護", en: "Lower urinary tract support" }, hint: { zh: "CIAO 泌尿配方肉泥", en: "CIAO urinary-care purée" }, keywords: ["urinary", "ciao", "churu", "pouch", "泌尿", "肉泥"] },
  ],
};

const AGE_LABELS: Record<Age, Choice> = {
  young: { zh: "幼年期（0–1歲）", en: "Young (0–1 year)" },
  adult: { zh: "成年期（1–7歲）", en: "Adult (1–7 years)" },
  senior: { zh: "熟齡期（7歲+）", en: "Senior (7+ years)" },
};

function searchableProductText(product: Product): string {
  return [product.name.en, product.name.zh, product.description?.en, product.description?.zh, product.categorySlug, product.metadata?.category, product.metadata?.subcategory, product.brandName, product.brand, ...(product.tags ?? [])].filter(Boolean).join(" ").toLowerCase();
}

function scoreProduct(product: Product, need: Need, pet: Pet): number {
  const text = searchableProductText(product);
  const selectedNeed = NEEDS[pet].find((candidate) => candidate.id === need);
  const keywordScore = selectedNeed?.keywords.reduce((score, keyword) => score + (text.includes(keyword.toLowerCase()) ? 8 : 0), 0) ?? 0;
  const petScore = pet === "cat" && /cat|feline|貓|ciao/.test(text) ? 12 : pet === "dog" && /dog|canine|犬|狗|walk|chew/.test(text) ? 8 : 0;
  const inStockScore = product.inStock !== false ? 2 : -100;
  return keywordScore + petScore + inStockScore;
}

function localize(choice: Choice, locale: "zh" | "en") {
  return choice[locale];
}

export function PetMatcherWizard({ variant }: PetMatcherWizardProps) {
  const { locale } = useI18n();
  const { products } = useCatalog();
  const { lines, addItem } = useCart();
  const isZh = locale === "zh";
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [pet, setPet] = useState<Pet | null>(null);
  const [age, setAge] = useState<Age | null>(null);
  const [breed, setBreed] = useState<Choice | null>(null);
  const [need, setNeed] = useState<Need | null>(null);
  const [addedIds, setAddedIds] = useState<string[]>([]);

  const recommendations = useMemo(() => {
    if (!pet || !need) return [];
    const excluded = new Set(lines.map((line) => line.id));
    return products
      .filter((product) => product.inStock !== false && !excluded.has(product.id))
      .sort((a, b) => scoreProduct(b, need, pet) - scoreProduct(a, need, pet) || a.price - b.price)
      .slice(0, 3);
  }, [lines, need, pet, products]);

  const total = recommendations.reduce((sum, product) => sum + product.price, 0);
  const openWizard = () => {
    setOpen(true);
    setStep(1);
    setAddedIds([]);
  };
  const closeWizard = () => setOpen(false);
  const reset = () => {
    setStep(1);
    setPet(null);
    setAge(null);
    setBreed(null);
    setNeed(null);
    setAddedIds([]);
  };
  const canContinue = step === 1 ? Boolean(pet) : step === 2 ? Boolean(age) : step === 3 ? Boolean(breed) : Boolean(need);
  const next = () => {
    if (!canContinue) return;
    if (step < 4) setStep((current) => current + 1);
    else setStep(5);
  };
  const addOne = (product: Product) => {
    addItem(product.id);
    setAddedIds((current) => [...new Set([...current, product.id])]);
  };
  const addBundle = () => {
    recommendations.forEach((product) => addItem(product.id));
    setAddedIds(recommendations.map((product) => product.id));
    window.setTimeout(() => window.dispatchEvent(new Event("mofu:open-cart")), 80);
  };

  useEffect(() => {
    if (!open) return undefined;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = originalOverflow; };
  }, [open]);

  const title = isZh ? "30秒毛孩智能選品配對精靈" : "30-Second Pet Matcher";
  const stepTitle = step === 1 ? (isZh ? "先認識一下你的毛孩" : "Tell us about your companion") : step === 2 ? (isZh ? "毛孩現在幾多歲？" : "What life stage are they in?") : step === 3 ? (isZh ? "牠是甚麼品種？" : "What breed are they?") : step === 4 ? (isZh ? "目前最想改善甚麼？" : "What would help most right now?") : (isZh ? "這是為毛孩度身訂造的提案" : "A tailored proposal for your companion");

  return (
    <>
      {variant === "home" ? (
        <section className="mx-auto my-5 max-w-6xl px-3 sm:px-6 lg:px-10">
          <div className="flex flex-col items-start justify-between gap-4 rounded-3xl border border-[#ead8c8] bg-[#FAF7F2] p-5 shadow-[0_18px_40px_-30px_rgba(73,48,31,0.5)] sm:flex-row sm:items-center sm:p-6">
            <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a36b42]">{isZh ? "MOFU HAVEN CARE MATCH" : "MOFU HAVEN CARE MATCH"}</p><h2 className="mt-1 text-xl font-bold tracking-tight text-stone-800 sm:text-2xl">{isZh ? "🐾 不知道買什麼？30 秒測出毛孩專屬日系好物" : "🐾 Not sure what to choose? Find their Japanese essentials in 30 seconds"}</h2><p className="mt-1 text-sm text-stone-500">{isZh ? "告訴我們毛孩的品種與需求，為牠量身定制照護組合" : "Tell us their breed and needs for a tailored care bundle."}</p></div>
            <button type="button" onClick={openWizard} className="shrink-0 rounded-full bg-[#8a5836] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#a66d46] active:scale-[0.97]">{isZh ? "開始配對 →" : "Start matching →"}</button>
          </div>
        </section>
      ) : (
        <button type="button" onClick={openWizard} className="fixed bottom-5 right-4 z-40 flex items-center gap-2 rounded-full border border-white/70 bg-[#8a5836] px-3.5 py-2.5 text-xs font-bold text-white shadow-[0_12px_30px_-12px_rgba(73,48,31,0.75)] transition hover:bg-[#a66d46] active:scale-[0.97] sm:bottom-6 sm:right-6"><span className="text-base">🐾</span><span>{isZh ? "30秒配對" : "Pet Matcher"}</span></button>
      )}

      {open ? <div className="fixed inset-0 z-[100] flex items-end justify-center bg-stone-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="pet-matcher-title" onMouseDown={(event) => { if (event.target === event.currentTarget) closeWizard(); }}>
        <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-3xl border border-[#ead8c8] bg-[#FAF7F2] shadow-2xl sm:rounded-3xl">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#ead8c8] bg-[#FAF7F2]/95 px-5 py-4 backdrop-blur"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a36b42]">Mofu Haven</p><h2 id="pet-matcher-title" className="text-lg font-bold text-stone-800">{title}</h2></div><button type="button" onClick={closeWizard} aria-label={isZh ? "關閉配對" : "Close matcher"} className="rounded-full p-2 text-xl text-stone-500 hover:bg-white">×</button></div>
          <div className="px-5 pb-6 pt-4 sm:px-7">
            {step < 5 ? <><div className="mb-5 flex items-center gap-1.5" aria-label={isZh ? `第 ${step} 步，共 4 步` : `Step ${step} of 4`}>{[1, 2, 3, 4].map((item) => <span key={item} className={`h-1.5 flex-1 rounded-full ${item <= step ? "bg-[#8a5836]" : "bg-[#ead8c8]"}`} />)}</div><p className="text-xs font-semibold text-[#a36b42]">{isZh ? `第 ${step} 步／4` : `Step ${step} of 4`}</p><h3 className="mt-2 text-xl font-bold leading-tight text-stone-800">{stepTitle}</h3>
              {step === 1 ? <div className="mt-5 grid grid-cols-2 gap-3">{(["cat", "dog"] as Pet[]).map((item) => <button key={item} type="button" onClick={() => setPet(item)} className={`flex min-h-28 flex-col items-center justify-center rounded-2xl border-2 bg-white text-3xl transition ${pet === item ? "border-[#8a5836] bg-[#fff5e9]" : "border-transparent"}`}><span>{item === "cat" ? "🐱" : "🐶"}</span><span className="mt-2 text-sm font-bold text-stone-700">{item === "cat" ? (isZh ? "貓咪" : "Cat") : (isZh ? "狗狗" : "Dog")}</span>{pet === item ? <span className="text-xs text-[#8a5836]">✓</span> : null}</button>)}</div> : null}
              {step === 2 ? <div className="mt-5 grid gap-3">{(Object.keys(AGE_LABELS) as Age[]).map((item) => <button key={item} type="button" onClick={() => setAge(item)} className={`rounded-full border-2 px-4 py-3 text-left text-sm font-semibold transition ${age === item ? "border-[#8a5836] bg-[#fff5e9] text-[#704525]" : "border-white bg-white text-stone-700"}`}>{localize(AGE_LABELS[item], locale)}</button>)}</div> : null}
              {step === 3 && pet ? <div className="mt-5"><label htmlFor="pet-matcher-breed" className="sr-only">{isZh ? "選擇品種" : "Select a breed"}</label><div className="relative"><select id="pet-matcher-breed" value={breed?.en ?? ""} onChange={(event) => setBreed(BREEDS[pet].find((item) => item.en === event.target.value) ?? null)} className="h-11 w-full appearance-none rounded-xl border border-stone-200 bg-white px-4 pr-10 text-sm font-semibold text-stone-700 outline-none transition focus:border-[#8a5836] focus:ring-2 focus:ring-[#8a5836]/15"><option value="" disabled>{isZh ? "請選擇品種..." : "Select a breed..."}</option>{BREEDS[pet].map((item) => <option key={item.en} value={item.en}>{localize(item, locale)}</option>)}</select><span aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-stone-400">⌄</span></div><p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">{isZh ? "熱門品種" : "Popular breeds"}</p><div className="mt-2 flex flex-wrap gap-2">{QUICK_BREEDS[pet].map((item) => <button key={item.en} type="button" onClick={() => setBreed(BREEDS[pet].find((candidate) => candidate.en === item.en) ?? item)} className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${breed?.en === item.en ? "border-[#8a5836] bg-[#fff5e9] text-[#704525]" : "border-white bg-white text-stone-700 hover:border-[#d7b394]"}`}>{localize(item, locale)}</button>)}</div></div> : null}
              {step === 4 && pet ? <div className="mt-5 grid gap-3">{NEEDS[pet].map((item) => <button key={item.id} type="button" onClick={() => setNeed(item.id)} className={`rounded-2xl border-2 bg-white p-4 text-left transition ${need === item.id ? "border-[#8a5836] bg-[#fff5e9]" : "border-transparent"}`}><span className="block text-sm font-bold text-stone-800">{localize(item.label, locale)}</span><span className="mt-1 block text-xs text-stone-500">{localize(item.hint, locale)}</span></button>)}</div> : null}
              <div className="mt-7 flex justify-between gap-3"><button type="button" onClick={() => setStep((current) => Math.max(1, current - 1))} disabled={step === 1} className="rounded-full px-4 py-2.5 text-sm font-semibold text-stone-500 disabled:invisible">{isZh ? "返回" : "Back"}</button><button type="button" onClick={next} disabled={!canContinue} className="rounded-full bg-[#8a5836] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#a66d46] disabled:cursor-not-allowed disabled:opacity-40">{step === 4 ? (isZh ? "🎯 立即配對專屬提案 →" : "🎯 Show my proposal →") : (isZh ? "下一步 →" : "Next →")}</button></div></> : <>
              <div className="mt-4 rounded-2xl bg-[#ead8c8]/55 p-4 text-sm leading-6 text-stone-700">{isZh ? `為你的${age ? ` ${AGE_LABELS[age].zh}` : ""} ${breed?.zh ?? "毛孩"} 定制的提案：${need === "walk" ? "出門散步建議搭配 Y 型胸背帶，分散拉扯受力，減少勒喉不適。" : need === "sensitive" ? "低敏單一肉源適合用作日常獎勵，溫柔照顧挑食及敏感腸胃。" : "日常配搭合適的天然好物，讓毛孩吃得開心、玩得安心。"}` : `A tailored proposal for your ${breed?.en ?? "companion"}: ${need === "walk" ? "pair a pressure-friendly Y-harness with everyday walks for a more comfortable fit." : need === "sensitive" ? "choose gentle single-protein treats for a calmer routine and happier appetites." : "a thoughtful mix of Japanese essentials for happier play, care and everyday moments."}`}</div>
              <div className="mt-4 grid gap-3">{recommendations.length ? recommendations.map((product) => <article key={product.id} className="flex items-center gap-3 rounded-2xl border border-white bg-white p-3"><div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#FAF7F2]"><ProductImage src={product.images?.[0] ?? product.image ?? "catalog-placeholder"} alt={getLocalizedProductName(product, locale)} sizes="64px" className="object-contain mix-blend-multiply p-1" /></div><div className="min-w-0 flex-1"><p className="line-clamp-2 text-sm font-semibold text-stone-800">{getLocalizedProductName(product, locale)}</p><p className="mt-1 text-sm font-bold text-[#8a5836]">{formatMoney(product.price, locale)}</p></div><button type="button" onClick={() => addOne(product)} disabled={addedIds.includes(product.id)} className="shrink-0 rounded-full bg-[#8a5836] px-3 py-2 text-xs font-bold text-white disabled:bg-emerald-700">{addedIds.includes(product.id) ? "✓" : isZh ? "+ 加購" : "+ Add"}</button></article>) : <p className="rounded-2xl bg-white p-4 text-sm text-stone-500">{isZh ? "商品目錄更新中，請稍後再試。" : "The product catalog is updating. Please try again shortly."}</p>}</div>
              {recommendations.length ? <button type="button" onClick={addBundle} className="mt-5 w-full rounded-2xl bg-[#8a5836] px-4 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#a66d46]">{isZh ? `🛒 一鍵打包加入購物車（共 ${formatMoney(total, locale)}）` : `🛒 Add the bundle to cart (${formatMoney(total, locale)})`}</button> : null}<button type="button" onClick={reset} className="mt-3 w-full rounded-full border border-[#d7b394] bg-white px-4 py-2.5 text-sm font-semibold text-stone-700">{isZh ? "重新測試" : "Retake"}</button></>}
          </div>
        </div>
      </div> : null}
    </>
  );
}
