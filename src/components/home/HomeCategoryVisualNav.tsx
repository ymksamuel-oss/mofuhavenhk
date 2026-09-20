"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, PawPrint } from "lucide-react";
import { categoryDisplayName, pruneEmptyCategories, type StoreCategory } from "@/lib/store-categories";
import { isStorefrontReadyProduct, type Product } from "@/lib/products";
import { useI18n } from "@/lib/i18n/I18nProvider";

type VisualCategoryCard = {
  category: StoreCategory;
  href: string;
  image: string;
  descriptionZh: string;
  descriptionEn: string;
};

function categoryText(category: StoreCategory): string {
  return `${category.slug} ${category.name} ${category.name_en || ""}`.toLowerCase();
}

function flattenCategories(categories: StoreCategory[]): StoreCategory[] {
  return categories.flatMap((category) => [category, ...flattenCategories(category.children || [])]);
}

function hasAny(text: string, terms: string[]): boolean {
  return terms.some((term) => text.includes(term));
}

function routeFor(category: StoreCategory, allCategories: StoreCategory[]): string {
  const parent = category.parent_id ? allCategories.find((entry) => entry.id === category.parent_id) : null;
  return parent ? `/categories/${parent.slug}/${category.slug}` : `/categories/${category.slug}`;
}

/**
 * Uses real CMS category rows for routes and labels. The four supplied images are
 * presentation assets only; the categories themselves remain database-driven.
 */
function getVisualCategoryCards(categories: StoreCategory[]): VisualCategoryCard[] {
  const allCategories = flattenCategories(categories);
  const roots = categories.filter((category) => !category.parent_id);
  const findRoot = (terms: string[]) => roots.find((category) => hasAny(categoryText(category), terms));
  const findAny = (terms: string[]) => allCategories.find((category) => hasAny(categoryText(category), terms));

  const candidates: Array<{ category?: StoreCategory; image: string; descriptionZh: string; descriptionEn: string }> = [
    {
      category: findRoot(["cats", "cat", "\u8c93"]),
      image: "/images/mofu-visuals/category-cat-food.jpg",
      descriptionZh: "\u6bcf\u65e5\u71df\u990a，\u5b89\u5fc3\u76f8\u4f34",
      descriptionEn: "Everyday nourishment, thoughtfully chosen.",
    },
    {
      category: findRoot(["dogs", "dog", "\u72d7"]),
      image: "/images/mofu-visuals/category-dog-food.jpg",
      descriptionZh: "\u597d\u597d\u5403\u98ef，\u6d3b\u529b\u6bcf\u4e00\u5929",
      descriptionEn: "Good meals for a brighter, livelier day.",
    },
    {
      category: findAny(["wet", "cans", "can", "\u6fd5\u7ce7", "\u7f50\u982d", "\u7f50\u7f50"]),
      image: "/images/mofu-visuals/category-wet-food.jpg",
      descriptionZh: "\u6bcf\u4e00\u53e3，\u90fd\u503c\u5f97\u671f\u5f85",
      descriptionEn: "A little moment worth looking forward to.",
    },
    {
      category: findRoot(["lifestyle", "supplies", "accessor", "\u7528\u54c1", "\u65e5\u7528", "\u73a9\u5177"]),
      image: "/images/mofu-visuals/category-lifestyle-toys.jpg",
      descriptionZh: "\u628a\u6bcf\u5929，\u73a9\u5f97\u66f4\u6709\u8da3",
      descriptionEn: "Make every day a little more playful.",
    },
  ];

  const usedIds = new Set<string>();
  return candidates.flatMap((candidate) => {
    const category = candidate.category;
    if (!category || usedIds.has(category.id)) return [];
    usedIds.add(category.id);
    return [{ ...candidate, category, href: routeFor(category, allCategories) }];
  });
}

export function HomeCategoryVisualNav({ categories, products }: { categories: StoreCategory[]; products: Product[] }) {
  const { locale } = useI18n();
  const activeProducts = products.filter(isStorefrontReadyProduct);
  const activeCategoryIds = new Set(activeProducts.map((product) => product.categoryId).filter(Boolean) as string[]);
  const activeCategorySlugs = new Set(activeProducts.map((product) => product.categorySlug));
  const cards = getVisualCategoryCards(pruneEmptyCategories(categories, activeCategoryIds, activeCategorySlugs));
  const copy = locale === "en"
    ? {
        eyebrow: "MOFU HAVEN COLLECTIONS",
        title: "Curated favourites, gently organised.",
        body: "From everyday meals to small comforts, begin with four thoughtful collections for every companion.",
        kicker: "CURATED FOR EVERY DAY",
        browse: "Explore",
      }
    : false
      ? {
          eyebrow: "MOFU HAVEN コレクション",
          title: "\u6bce\u65e5のために\u9078んだ、やさしい\u54c1々。",
          body: "\u6bce\u65e5のごはんから\u66aeらしの\u5c0f\u7269まで、4つのコレクションから\u5927\u5207な\u5bb6\u65cfに\u5408うものをお\u9078びください。",
          kicker: "\u6bce\u65e5のためのセレクト",
          browse: "\u898bる",
        }
      : {
        eyebrow: "MOFU HAVEN \u7cbe\u9078\u5206\u985e",
        title: "\u7cbe\u9078\u597d\u7269，\u6eab\u67d4\u5206\u985e",
        body: "\u7531\u6bcf\u65e5\u4e3b\u7ce7\u5230\u751f\u6d3b\u5c0f\u7269，\u5f9e\u56db\u500b\u5c08\u5340\u958b\u59cb，\u6162\u6162\u6311\u9078\u6700\u9069\u5408\u6bdb\u5b69\u7684\u65e5\u5e38。",
        kicker: "\u6bcf\u65e5\u7cbe\u9078\u597d\u7269",
        browse: "\u63a2\u7d22\u66f4\u591a",
      };
  if (cards.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-[#fcf8f3] px-5 py-14 sm:px-8 sm:py-20 lg:px-10">
      <div className="pointer-events-none absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-[#f2e4d4] blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-8 h-64 w-64 rounded-full bg-[#e5ebd8] blur-3xl" />
      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto mb-9 max-w-3xl text-center sm:mb-12">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#dccabc] bg-white/80 px-4 py-2 text-[11px] font-semibold tracking-[0.16em] text-[#8b6957] shadow-sm">
            <PawPrint className="h-3.5 w-3.5" aria-hidden="true" />
            {copy.eyebrow}
          </p>
          <h2 className="mt-5 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-[0.04em] text-[#45342c] sm:text-5xl">
            {copy.title}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#806e62] sm:text-base">
            {copy.body}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {cards.map((card) => (
            <Link
              key={card.category.id}
              href={card.href}
              className="group relative isolate min-h-[25rem] overflow-hidden rounded-[1.8rem] border border-[#e6d8cc] bg-[#ede4db] shadow-[0_20px_45px_-30px_rgba(66,45,32,0.64)] outline-none transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_26px_50px_-28px_rgba(66,45,32,0.5)] focus-visible:ring-2 focus-visible:ring-[#9a705a] focus-visible:ring-offset-4"
              aria-label={`${copy.browse} ${categoryDisplayName(card.category, locale)}`}
            >
              <Image
                src={card.image}
                alt=""
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#241914]/85 via-[#3a271c]/8 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
                <p className="text-[11px] font-semibold tracking-[0.15em] text-white/80">{copy.kicker}</p>
                <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-wide sm:text-[1.7rem]">{categoryDisplayName(card.category, locale)}</h3>
                <div className="mt-2 flex translate-y-3 items-center justify-between gap-3 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                  <p className="text-sm text-white/85">{locale === "en" ? card.descriptionEn : false ? card.descriptionZh : card.descriptionZh}</p>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/55 bg-white/15 backdrop-blur-sm">
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
