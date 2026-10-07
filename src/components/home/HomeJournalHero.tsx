"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ProductImage } from "@/components/product/ProductImage";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { isStorefrontReadyProduct, productHref, type Product } from "@/lib/products";

type JournalPick = {
  sku: string;
  zh: string;
  en: string;
};

type JournalIssue = {
  label: string;
  labelZh: string;
  titleZh: string;
  titleEn: string;
  subtitleZh: string;
  subtitleEn: string;
  ctaZh: string;
  ctaEn: string;
  ctaLink: string;
  picks: readonly JournalPick[];
};

const JOURNAL_ISSUES: readonly JournalIssue[] = [
  {
    label: "MOFU JOURNAL · ISSUE 01",
    labelZh: "毛毛港專題・第 1 期",
    titleZh: "給毛孩最純粹的好\n從一口安心開始",
    titleEn: "The Purest Good for Your Furry Friends\nStarting with Peace of Mind in Every Bite",
    subtitleZh: "日本原裝嚴選・100% 在地天然純肉・0化學防腐劑",
    subtitleEn: "Carefully selected in Japan · 100% natural meat · No chemical preservatives",
    ctaZh: "探索天然原肉系列",
    ctaEn: "Explore natural meat treats",
    ctaLink: "/menu?ingredient=venison",
    picks: [
      { sku: "4976064026545", zh: "北海道蝦夷鹿肉", en: "Hokkaido venison" },
      { sku: "4976064025623", zh: "低敏純馬肉棒", en: "Pure horse-meat bar" },
      { sku: "4976064013736", zh: "金槍魚薄片", en: "Yellowfin tuna flakes" },
      { sku: "4976064025333", zh: "天然原隻牛蹄", en: "Whole natural beef hoof" },
      { sku: "4976064025791", zh: "凍乾純雞里肌", en: "Freeze-dried chicken" },
      { sku: "4976064025272", zh: "安納芋蜜甘藷", en: "Anno imo sweet potato" },
      { sku: "4976064026514", zh: "鴨里肌肉乾", en: "Japanese duck tenderloin" },
      { sku: "4976064026392", zh: "鯊魚皮潔齒棒", en: "Shark-skin dental chew" },
      { sku: "4976064025661", zh: "高山犛牛芝士", en: "Himalayan yak cheese" },
    ],
  },
  {
    label: "MOFU JOURNAL · ISSUE 02",
    labelZh: "毛毛港專題・第 2 期",
    titleZh: "陪伴每日咀嚼時光\n自然潔齒，耐咬得剛好",
    titleEn: "A Better Daily Chew\nNatural Dental Care, Made to Last",
    subtitleZh: "天然牛筋、原隻牛蹄與鯊魚皮潔齒棒，讓狗狗自在釋放咀嚼天性。",
    subtitleEn: "Beef tendon, whole hoof and shark-skin chews for a calmer, more natural daily routine.",
    ctaZh: "探索潔齒耐咬系列",
    ctaEn: "Explore dental chews",
    ctaLink: "/collections/dental-chews",
    picks: [
      { sku: "4976064026446", zh: "天然牛大筋特長大條", en: "Long beef tendon" },
      { sku: "4976064025333", zh: "天然原隻牛蹄", en: "Whole natural beef hoof" },
      { sku: "4976064026392", zh: "鯊魚皮潔齒棒", en: "Shark-skin dental chew" },
      { sku: "4976064025012", zh: "天然葉綠素潔齒骨棒", en: "Chlorophyll dental bone" },
      { sku: "4976064024701", zh: "天然牛肋排骨切段", en: "Natural beef rib pieces" },
      { sku: "4976064025685", zh: "高山犛牛芝士棒", en: "Himalayan yak cheese" },
      { sku: "4976064022301", zh: "鹿兒島黑豚大豬耳", en: "Kagoshima black pork ear" },
      { sku: "4976064026545", zh: "北海道蝦夷鹿肉", en: "Hokkaido venison" },
      { sku: "4976064025623", zh: "低敏純馬肉棒", en: "Pure horse-meat bar" },
    ],
  },
  {
    label: "MOFU JOURNAL · SPECIAL",
    labelZh: "毛毛港專題・特別企劃",
    titleZh: "日本職人選品的安心日常\n把天然美味帶回家",
    titleEn: "Thoughtfully Selected in Japan\nA More Thoughtful Everyday for Pets",
    subtitleZh: "Best Partner 日本製造・無添加・無著色，為貓狗準備豐富天然選擇。",
    subtitleEn: "Best Partner made in Japan · additive-free · colour-free, with a thoughtful range for cats and dogs.",
    ctaZh: "認識 Best Partner",
    ctaEn: "Meet Best Partner",
    ctaLink: "/brand/best-partner",
    picks: [
      { sku: "4976064013897", zh: "黃鰭金槍魚柴魚薄片", en: "Yellowfin tuna flakes" },
      { sku: "4976064024725", zh: "貓用無鹽小魚乾", en: "Unsalted fish for cats" },
      { sku: "4976064024893", zh: "天然黑鮪魚肉碎", en: "Natural bluefin tuna" },
      { sku: "4976064024251", zh: "純雞里肌雪花肉碎", en: "Chicken tenderloin flakes" },
      { sku: "4976064024886", zh: "純雞砂肝香脆肉碎", en: "Crispy chicken gizzard" },
      { sku: "4976064025272", zh: "安納芋蜜甘藷粉", en: "Anno imo sweet potato" },
      { sku: "4976064026545", zh: "北海道蝦夷鹿肉", en: "Hokkaido venison" },
      { sku: "4976064025623", zh: "低敏純馬肉棒", en: "Pure horse-meat bar" },
      { sku: "4976064025791", zh: "凍乾純雞里肌", en: "Freeze-dried chicken" },
    ],
  },
];

function productSku(product: Product): string {
  return String(product.mofuSku ?? product.metadata?.mofu_sku ?? product.tags?.find((tag) => /^\d{8,14}$/.test(tag)) ?? "").trim();
}

export function HomeJournalHero({ products }: { products: Product[] }) {
  const { locale } = useI18n();
  const isEn = locale === "en";
  const [activeIssue, setActiveIssue] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const moveIssue = (direction: 1 | -1) => {
    setActiveIssue((current) => (current + direction + JOURNAL_ISSUES.length) % JOURNAL_ISSUES.length);
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIssue((current) => (current + 1) % JOURNAL_ISSUES.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, []);

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const start = touchStartX.current;
    const end = event.changedTouches[0]?.clientX;
    touchStartX.current = null;
    if (start === null || end === undefined) return;
    const delta = end - start;
    if (Math.abs(delta) >= 40) moveIssue(delta < 0 ? 1 : -1);
  };

  const productMap = useMemo(() => new Map(
    products.filter((product) => isStorefrontReadyProduct(product) && product.images?.[0]).map((product) => [productSku(product), product]),
  ), [products]);

  return (
    <section aria-labelledby="mofu-journal-title" className="bg-white text-[#2D2926]">
      <div className="relative mx-auto h-auto max-w-6xl overflow-visible px-3 py-3 sm:px-6 sm:py-6 md:py-14" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} aria-label={isEn ? "Mofu Journal issues" : "毛毛港專題刊號"}>
        {JOURNAL_ISSUES.map((issue, issueIndex) => {
          const featuredProducts = issue.picks.flatMap((pick) => {
            const product = productMap.get(pick.sku);
            return product ? [{ ...pick, product }] : [];
          });
          return (
            <div key={issue.label} className={`grid h-auto grid-cols-1 items-start gap-4 px-3 py-3 transition-opacity duration-500 ease-in-out sm:gap-8 sm:px-6 sm:py-6 md:grid-cols-12 md:py-14 ${issueIndex === activeIssue ? "relative opacity-100" : "pointer-events-none absolute inset-0 opacity-0"}`}>
              <div className="order-2 z-10 col-span-12 flex min-w-0 flex-col items-start justify-start pt-2 pl-8 text-left sm:pl-8 md:order-2 md:col-span-5 md:pl-10 md:pt-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">{isEn ? issue.label : issue.labelZh}</p>
                <h1 id={issueIndex === 0 ? "mofu-journal-title" : undefined} className={`mb-2 max-w-lg whitespace-pre-line text-balance font-serif font-bold tracking-tight text-[#111111] ${isEn ? "text-xl leading-tight sm:text-2xl" : "text-2xl leading-[1.28] sm:text-3xl"} lg:text-[32px]`}>{isEn ? issue.titleEn : issue.titleZh}</h1>
                <p className="mb-2 line-clamp-2 max-w-sm text-xs leading-relaxed text-stone-600 sm:mb-5 sm:line-clamp-none sm:text-sm">{isEn ? issue.subtitleEn : issue.subtitleZh}</p>
                <Link href={issue.ctaLink} className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#C86A2B] px-5 py-2 text-xs font-medium text-white shadow-sm transition-all hover:bg-[#B25B20] active:scale-[0.98] sm:text-sm">{isEn ? issue.ctaEn : issue.ctaZh}<span aria-hidden="true">→</span></Link>
              </div>
              <div className="order-1 col-span-12 min-w-0 md:order-1 md:col-span-7">
                <ul aria-label={isEn ? "Featured journal products" : "毛毛港專題精選商品"} className="mx-auto grid h-auto w-full max-w-md grid-cols-3 gap-1.5 overflow-visible rounded-2xl border border-stone-200/60 bg-white/70 p-2 shadow-sm backdrop-blur-sm sm:gap-2.5 sm:p-3 md:max-w-none">
                  {featuredProducts.map(({ product, zh, en }, index) => {
                    const label = isEn ? en : zh;
                    return <li key={product.id} className="min-w-0"><Link href={productHref(product.id)} title={label} aria-label={`${isEn ? "View product" : "查看商品"}：${label}`} className="group flex min-h-[92px] flex-col items-center justify-between rounded-xl border border-stone-100 bg-white p-1 text-center shadow-sm transition-all hover:shadow-md sm:min-h-[105px] sm:p-2"><span className="relative flex h-[46px] w-full items-center justify-center overflow-hidden sm:h-[60px]"><ProductImage src={product.images?.[0] ?? product.image} alt={label} priority={issueIndex === 0 && index < 3} sizes="(min-width: 1024px) 18vw, (min-width: 768px) 23vw, 29vw" className="object-contain" /></span><span className="mt-0.5 block w-full line-clamp-1 text-center text-[10px] font-medium text-stone-700 sm:text-[11px]">{label}</span></Link></li>;
                  })}
                </ul>
                <div className="z-20 mt-4 flex items-center justify-center gap-2" aria-label={isEn ? "Journal issue pagination" : "刊號分頁"}>
                  {JOURNAL_ISSUES.map((entry, index) => <button key={entry.label} type="button" onClick={() => setActiveIssue(index)} aria-label={`${isEn ? "Go to issue" : "前往刊號"} ${index + 1}`} className={`h-1.5 rounded-full transition-all ${index === activeIssue ? "w-6 bg-stone-900" : "w-1.5 bg-stone-300"}`} />)}
                </div>
              </div>
            </div>
          );
        })}
        <button type="button" onClick={() => moveIssue(-1)} aria-label={isEn ? "Previous journal issue" : "上一期專題"} className="hidden md:flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white/80 text-2xl leading-none text-stone-700 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:text-[#C86A2B] md:absolute md:left-0 md:top-1/2 md:z-20 md:-translate-y-1/2">‹</button>
        <button type="button" onClick={() => moveIssue(1)} aria-label={isEn ? "Next journal issue" : "下一期專題"} className="hidden md:flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white/80 text-2xl leading-none text-stone-700 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:text-[#C86A2B] md:absolute md:right-0 md:top-1/2 md:z-20 md:-translate-y-1/2">›</button>
      </div>
    </section>
  );
}
