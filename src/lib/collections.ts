import type { Product } from "@/lib/products";
import type { Locale } from "@/lib/i18n/translations";

export type CollectionGroup = "species" | "dog-function" | "dog-meat" | "outdoor" | "promotions";

type CollectionMatcher = (product: Product) => boolean;

export type CollectionConfig = {
  slug: string;
  title_zh: string;
  title_en: string;
  description: string;
  seo_title: string;
  group: CollectionGroup;
  targetCount?: number;
  match: CollectionMatcher;
};

const CAT_SKUS = new Set([
  "4976064013897",
  "4976064024725",
  "4976064024336",
  "4976064024688",
  "4976064015747",
  "4976064025500",
  "4976064024718",
]);

const VALUE_BUNDLE_SKUS = new Set([
  "MOFU-BUNDLE-PICKY-01",
  "MOFU-BUNDLE-DENTAL-02",
  "MOFU-BUNDLE-SEAFOOD-03",
  "MOFU-BUNDLE-WALK-04",
]);

function productText(product: Product): string {
  return [
    product.name.zh,
    product.name.en,
    product.name.ja,
    product.description?.zh,
    product.description?.en,
    product.categorySlug,
    product.subcategory,
    product.brand,
    product.vendor,
    product.sourceCategory,
    ...(product.tags ?? []),
    ...Object.values(product.metadata ?? {}),
  ].filter(Boolean).join(" ").toLowerCase();
}

function productSku(product: Product): string {
  return String(product.metadata?.mofu_sku ?? product.tags?.find((tag) => /^\d{8,14}$/.test(tag)) ?? "").trim();
}

function matchesAny(product: Product, patterns: RegExp[]): boolean {
  const text = productText(product);
  return patterns.some((pattern) => pattern.test(text));
}

function isDogProduct(product: Product): boolean {
  const text = productText(product);
  const catOnly = /\u8c93\u5c08\u7528|\u732b\u7528|\u8c93\u7528|\u8c93\u8c93|cat[-_ ]?(?:only|food|treat|snack|product)|for cats?|feline/i.test(text);
  return !catOnly && /\u72d7|\u72ac|dog|for dogs?|\u72ac\u7528|canine/i.test(text);
}

const FUNCTION_PATTERNS: Record<string, RegExp[]> = {
  "dental-chews": [/\u6f54\u9f52|\u6f54\u7259|\u8010\u54ac|\u7259\u68d2|\u54ac\u9aa8|dental|chew|tooth/i],
  "meal-toppers": [/\u62cc\u98ef|\u62cc\u7ce7|\u6492\u6599|\u9935\u98ef\u7c89|ふりかけ|topping|topper|seasoning/i],
  "training-treats": [/\u8a13\u7df4|\u4e00\u53e3|\u5c0f\u7c92|\u734e\u52f5|training|bite.?size|reward/i],
  "joint-care": [/\u95dc\u7bc0|\u8edf\u9aa8|joint|glucosamine|chondroitin/i],
  "skin-coat": [/\u4eae\u6bdb|\u7f8e\u819a|\u6bdb\u9aee|\u76ae\u819a|omega.?3|skin|coat|fur/i],
  "senior-puppy": [/\u5e7c\u72ac|\u5e7c\u8001\u72ac|\u9ad8\u9f61|\u8001\u72ac|\u8edf\u8cea|puppy|senior|soft/i],
};

const MEAT_PATTERNS: Record<string, RegExp[]> = {
  "horse-meat": [/\u99ac\u8089|horse|うま\u8089|\u99ac/i],
  venison: [/\u9e7f\u8089|\u9e7f|venison|deer|ベニソン/i],
  "beef-tendon": [/\u725b\u8089|\u725b\u7b4b|\u725b\u8171|beef|tendon/i],
  "chicken-poultry": [/\u96de\u8089|\u96de\u80f8|\u79bd\u8089|\u9d8f|chicken|poultry|duck|\u9d28/i],
  "seafood-fish": [/\u9b5a|\u6d77\u9bae|\u9b5a\u4ecb|fish|seafood|tuna|bonito|\u9c39|\u9baa/i],
  "pork-specialty": [/\u8c6c\u8089|\u9ed1\u8c5a|\u8c5a|pork|boar/i],
  "cheese-bakery": [/\u829d\u58eb|\u4e73\u916a|\u8d77\u53f8|チーズ|cheese|bakery|\u70d8\u7119|\u9905\u4e7e/i],
};

const OUTDOOR_PATTERNS: Record<string, RegExp[]> = {
  harnesses: [/\u80f8\u80cc|\u80f8\u5e36|harness|ハーネス/i],
  leashes: [/\u727d\u5f15|\u727d\u7e69|\u727d\u5f15\u5e36|leash|lead|リード/i],
  collars: [/\u9838\u5708|\u9805\u5708|\u534a\u93c8|collar|チェーン/i],
  "walk-accessories": [/\u62fe\u4fbf|\u5916\u51fa\u5305|\u6563\u6b65\u888b|\u4fbf\u888b|walk|walking|poop|outdoor bag/i],
};

const DOG = (product: Product) => isDogProduct(product);
const CAT = (product: Product) => CAT_SKUS.has(productSku(product));
const VALUE_BUNDLES = (product: Product) => VALUE_BUNDLE_SKUS.has(productSku(product));
const OUTDOOR = (product: Product) => matchesAny(product, [/\u80f8\u80cc|\u727d\u5f15|\u727d\u7e69|\u9838\u5708|\u9805\u5708|\u534a\u93c8|\u62fe\u4fbf|\u5916\u51fa|\u6563\u6b65|harness|leash|lead|collar|walk|outdoor/i]);

export const COLLECTIONS: readonly CollectionConfig[] = [
  { slug: "dogs", title_zh: "🐶 \u72d7\u72d7\u5168\u7cfb\u5217", title_en: "🐶 All Dog Products", description: "\u70ba\u72d7\u72d7\u6311\u9078\u65e5\u672c\u76f4\u9001\u98df\u54c1、\u6a5f\u80fd\u96f6\u98df\u53ca\u5b89\u5fc3\u65e5\u5e38\u7528\u54c1。", seo_title: "\u72d7\u72d7\u5168\u7cfb\u5217｜\u65e5\u672c\u72d7\u72d7\u98df\u54c1、\u96f6\u98df\u53ca\u7528\u54c1", group: "species", targetCount: 245, match: DOG },
  { slug: "cats", title_zh: "🐱 \u8c93\u54aa\u5c08\u5340", title_en: "🐱 Cat Collection", description: "\u7cbe\u9078\u6307\u5b9a\u7684 7 \u6b3e\u65e5\u672c\u8c93\u54aa\u5546\u54c1，\u8b93\u611b\u8c93\u4eab\u53d7\u5b89\u5fc3\u65e5\u5e38。", seo_title: "\u8c93\u54aa\u5c08\u5340｜7 \u6b3e\u65e5\u672c\u8c93\u54aa\u7cbe\u9078\u5546\u54c1", group: "species", targetCount: 7, match: CAT },
  { slug: "outdoor-gear", title_zh: "🦺 \u6236\u5916\u6f2b\u6b65\u88dd\u5099", title_en: "🦺 Outdoor Walking Gear", description: "\u5f9e\u80f8\u80cc\u5e36\u5230\u5916\u51fa\u914d\u4ef6，\u70ba\u6bcf\u6b21\u6563\u6b65\u505a\u597d\u6e96\u5099。", seo_title: "\u6236\u5916\u6f2b\u6b65\u88dd\u5099｜\u5bf5\u7269\u80f8\u80cc\u5e36、\u727d\u5f15\u5e36\u53ca\u5916\u51fa\u7528\u54c1", group: "species", targetCount: 45, match: OUTDOOR },
  { slug: "dental-chews", title_zh: "\u7269\u7406\u6f54\u9f52\u8010\u54ac", title_en: "Dental Chews", description: "\u4ee5\u81ea\u7136\u5480\u56bc\u8207\u9069\u53e3\u53e3\u611f\u966a\u4f34\u72d7\u72d7\u65e5\u5e38\u6f54\u9f52。", seo_title: "\u7269\u7406\u6f54\u9f52\u8010\u54ac｜\u72d7\u72d7\u6f54\u7259\u96f6\u98df", group: "dog-function", match: (p) => DOG(p) && matchesAny(p, FUNCTION_PATTERNS["dental-chews"]) },
  { slug: "meal-toppers", title_zh: "\u6311\u98df\u62cc\u7ce7\u795e\u7c89", title_en: "Meal Toppers", description: "\u70ba\u6311\u98df\u72d7\u72d7\u589e\u6dfb\u9999\u6c23\u8207\u98df\u617e\u7684\u65e5\u5e38\u62cc\u7ce7\u9078\u64c7。", seo_title: "\u6311\u98df\u62cc\u7ce7\u795e\u7c89｜\u72d7\u72d7\u5929\u7136\u62cc\u98ef\u7c89", group: "dog-function", match: (p) => DOG(p) && matchesAny(p, FUNCTION_PATTERNS["meal-toppers"]) },
  { slug: "training-treats", title_zh: "\u96a8\u8eab\u8a13\u7df4\u4e00\u53e3\u4e01", title_en: "Training Treats", description: "\u7d30\u5c0f\u65b9\u4fbf、\u9069\u5408\u5916\u51fa\u8a13\u7df4\u8207\u5373\u6642\u734e\u52f5\u7684\u72d7\u72d7\u5c0f\u98df。", seo_title: "\u96a8\u8eab\u8a13\u7df4\u4e00\u53e3\u4e01｜\u72d7\u72d7\u8a13\u7df4\u96f6\u98df", group: "dog-function", match: (p) => DOG(p) && matchesAny(p, FUNCTION_PATTERNS["training-treats"]) },
  { slug: "joint-care", title_zh: "\u95dc\u7bc0\u8edf\u9aa8\u4fdd\u990a", title_en: "Joint Care", description: "\u70ba\u72d7\u72d7\u65e5\u5e38\u6d3b\u52d5\u529b\u8207\u95dc\u7bc0\u4fdd\u990a\u800c\u8a2d\u7684\u6a5f\u80fd\u9078\u64c7。", seo_title: "\u95dc\u7bc0\u8edf\u9aa8\u4fdd\u990a｜\u72d7\u72d7\u95dc\u7bc0\u8b77\u7406\u98df\u54c1", group: "dog-function", match: (p) => DOG(p) && matchesAny(p, FUNCTION_PATTERNS["joint-care"]) },
  { slug: "skin-coat", title_zh: "\u4eae\u6bdb\u7f8e\u819a Omega-3", title_en: "Skin & Coat Omega-3", description: "\u5f9e\u65e5\u5e38\u71df\u990a\u5165\u624b，\u7167\u9867\u72d7\u72d7\u76ae\u819a\u8207\u6bdb\u9aee\u72c0\u614b。", seo_title: "\u4eae\u6bdb\u7f8e\u819a Omega-3｜\u72d7\u72d7\u76ae\u819a\u6bdb\u9aee\u8b77\u7406", group: "dog-function", match: (p) => DOG(p) && matchesAny(p, FUNCTION_PATTERNS["skin-coat"]) },
  { slug: "senior-puppy", title_zh: "\u5e7c\u8001\u72ac\u8edf\u8cea\u9ede\u5fc3", title_en: "Soft Treats for Puppies & Seniors", description: "\u9069\u5408\u5e7c\u72ac\u8207\u9ad8\u9f61\u72ac\u7684\u67d4\u8edf、\u6613\u5165\u53e3\u65e5\u5e38\u9ede\u5fc3。", seo_title: "\u5e7c\u8001\u72ac\u8edf\u8cea\u9ede\u5fc3｜\u72d7\u72d7\u6eab\u548c\u5c0f\u98df", group: "dog-function", match: (p) => DOG(p) && matchesAny(p, FUNCTION_PATTERNS["senior-puppy"]) },
  { slug: "horse-meat", title_zh: "\u6975\u81f4\u4f4e\u654f\u99ac\u8089", title_en: "Hypoallergenic Horse Meat", description: "\u4ee5\u99ac\u8089\u70ba\u4e3b\u984c\u7684\u4f4e\u654f\u72d7\u72d7\u8089\u6e90\u9078\u64c7。", seo_title: "\u6975\u81f4\u4f4e\u654f\u99ac\u8089｜\u65e5\u672c\u72d7\u72d7\u99ac\u8089\u96f6\u98df", group: "dog-meat", match: (p) => DOG(p) && matchesAny(p, MEAT_PATTERNS["horse-meat"]) },
  { slug: "venison", title_zh: "\u5317\u6d77\u9053\u91ce\u751f\u9e7f\u8089", title_en: "Hokkaido Venison", description: "\u63a2\u7d22\u5317\u6d77\u9053\u91ce\u751f\u9e7f\u8089\u53ca\u5929\u7136\u8089\u6e90\u5c0f\u98df。", seo_title: "\u5317\u6d77\u9053\u91ce\u751f\u9e7f\u8089｜\u72d7\u72d7\u9e7f\u8089\u96f6\u98df", group: "dog-meat", match: (p) => DOG(p) && matchesAny(p, MEAT_PATTERNS.venison) },
  { slug: "beef-tendon", title_zh: "\u65e5\u672c\u7522\u7d14\u725b\u8089／\u725b\u7b4b", title_en: "Japanese Beef & Tendon", description: "\u65e5\u672c\u7522\u7d14\u725b\u8089\u8207\u725b\u7b4b\u7684\u8010\u54ac、\u8089\u9999\u9078\u64c7。", seo_title: "\u65e5\u672c\u7522\u7d14\u725b\u8089\u725b\u7b4b｜\u72d7\u72d7\u725b\u8089\u96f6\u98df", group: "dog-meat", match: (p) => DOG(p) && matchesAny(p, MEAT_PATTERNS["beef-tendon"]) },
  { slug: "chicken-poultry", title_zh: "\u570b\u7522\u7d14\u96de\u8089／\u6a5f\u80fd\u79bd\u8089", title_en: "Japanese Chicken & Poultry", description: "\u570b\u7522\u96de\u8089\u53ca\u6a5f\u80fd\u79bd\u8089，\u9069\u5408\u65e5\u5e38\u734e\u52f5\u8207\u9935\u98df。", seo_title: "\u570b\u7522\u7d14\u96de\u8089｜\u72d7\u72d7\u96de\u8089\u53ca\u79bd\u8089\u96f6\u98df", group: "dog-meat", match: (p) => DOG(p) && matchesAny(p, MEAT_PATTERNS["chicken-poultry"]) },
  { slug: "seafood-fish", title_zh: "\u6df1\u6d77\u6d77\u9bae\u5168\u9b5a", title_en: "Deep-Sea Fish & Seafood", description: "\u4ee5\u9b5a\u985e\u53ca\u6d77\u9bae\u70ba\u4e3b\u984c\u7684\u5929\u7136\u72d7\u72d7\u5c0f\u98df。", seo_title: "\u6df1\u6d77\u6d77\u9bae\u5168\u9b5a｜\u72d7\u72d7\u9b5a\u985e\u6d77\u9bae\u96f6\u98df", group: "dog-meat", match: (p) => DOG(p) && matchesAny(p, MEAT_PATTERNS["seafood-fish"]) },
  { slug: "pork-specialty", title_zh: "\u9ed1\u8c5a\u8207\u7279\u9078\u8089", title_en: "Specialty Pork & Meats", description: "\u9ed1\u8c5a\u53ca\u7279\u9078\u8089\u6e90\u7684\u65e5\u672c\u72d7\u72d7\u96f6\u98df。", seo_title: "\u9ed1\u8c5a\u8207\u7279\u9078\u8089｜\u65e5\u672c\u72d7\u72d7\u8c6c\u8089\u96f6\u98df", group: "dog-meat", match: (p) => DOG(p) && matchesAny(p, MEAT_PATTERNS["pork-specialty"]) },
  { slug: "cheese-bakery", title_zh: "\u829d\u58eb\u8207\u548c\u98a8\u70d8\u7119", title_en: "Cheese & Japanese Bakery", description: "\u829d\u58eb、\u4e73\u916a\u8207\u548c\u98a8\u70d8\u7119\u9ede\u5fc3，\u70ba\u72d7\u72d7\u5e36\u4f86\u9999\u8106\u734e\u52f5。", seo_title: "\u829d\u58eb\u8207\u548c\u98a8\u70d8\u7119｜\u72d7\u72d7\u829d\u58eb\u53ca\u70d8\u7119\u96f6\u98df", group: "dog-meat", match: (p) => DOG(p) && matchesAny(p, MEAT_PATTERNS["cheese-bakery"]) },
  { slug: "harnesses", title_zh: "\u80f8\u80cc\u5e36", title_en: "Harnesses", description: "\u8212\u9069\u7a69\u59a5\u7684\u72d7\u72d7\u80f8\u80cc\u5e36，\u966a\u4f34\u6bcf\u65e5\u6563\u6b65。", seo_title: "\u5bf5\u7269\u80f8\u80cc\u5e36｜\u6236\u5916\u6f2b\u6b65\u88dd\u5099", group: "outdoor", match: (p) => OUTDOOR(p) && matchesAny(p, OUTDOOR_PATTERNS.harnesses) },
  { slug: "leashes", title_zh: "\u727d\u5f15\u5e36", title_en: "Leashes", description: "\u9069\u5408\u65e5\u5e38\u6563\u6b65\u8207\u5916\u51fa\u7684\u727d\u5f15\u5e36\u9078\u64c7。", seo_title: "\u5bf5\u7269\u727d\u5f15\u5e36｜\u6236\u5916\u6f2b\u6b65\u88dd\u5099", group: "outdoor", match: (p) => OUTDOOR(p) && matchesAny(p, OUTDOOR_PATTERNS.leashes) },
  { slug: "collars", title_zh: "\u9838\u5708／\u534a\u93c8", title_en: "Collars & Half Chains", description: "\u5be6\u7528\u8010\u7528\u7684\u9838\u5708\u53ca\u534a\u93c8\u5916\u51fa\u88dd\u5099。", seo_title: "\u5bf5\u7269\u9838\u5708\u534a\u93c8｜\u6236\u5916\u6f2b\u6b65\u88dd\u5099", group: "outdoor", match: (p) => OUTDOOR(p) && matchesAny(p, OUTDOOR_PATTERNS.collars) },
  { slug: "walk-accessories", title_zh: "\u62fe\u4fbf\u888b\u8207\u5916\u51fa\u5305", title_en: "Walk Accessories", description: "\u62fe\u4fbf\u888b、\u5916\u51fa\u5305\u53ca\u6563\u6b65\u6642\u4e0d\u53ef\u7f3a\u5c11\u7684\u8cbc\u5fc3\u914d\u4ef6。", seo_title: "\u62fe\u4fbf\u888b\u8207\u5916\u51fa\u5305｜\u5bf5\u7269\u6563\u6b65\u914d\u4ef6", group: "outdoor", match: (p) => OUTDOOR(p) && matchesAny(p, OUTDOOR_PATTERNS["walk-accessories"]) },
  { slug: "value-bundles", title_zh: "🎁 \u4fc3\u92b7\u7d44\u5408", title_en: "🎁 Value Bundles", description: "\u5b98\u65b9\u7279\u60e0\u5957\u88dd，\u4e00\u6b21\u914d\u9f4a\u6bdb\u5b69\u65e5\u5e38\u6240\u9700。", seo_title: "\u4fc3\u92b7\u7d44\u5408｜Mofu Haven \u5b98\u65b9\u5bf5\u7269\u5957\u88dd\u512a\u60e0", group: "promotions", match: VALUE_BUNDLES },
] as const;

export const COLLECTION_NAV_GROUPS: readonly { key: CollectionGroup; title_zh: string; title_en: string; slugs: readonly string[] }[] = [
  { key: "species", title_zh: "\u7269\u7a2e\u5c08\u5340", title_en: "By Pet", slugs: ["dogs", "cats", "outdoor-gear"] },
  { key: "dog-function", title_zh: "\u72d7\u72d7\u6a5f\u80fd\u5206\u985e", title_en: "Dog Functions", slugs: ["dental-chews", "meal-toppers", "training-treats", "joint-care", "skin-coat", "senior-puppy"] },
  { key: "dog-meat", title_zh: "\u72d7\u72d7\u8089\u6e90\u5206\u985e", title_en: "Dog Ingredients", slugs: ["horse-meat", "venison", "beef-tendon", "chicken-poultry", "seafood-fish", "pork-specialty", "cheese-bakery"] },
  { key: "outdoor", title_zh: "\u6236\u5916\u88dd\u5099", title_en: "Outdoor Gear", slugs: ["harnesses", "leashes", "collars", "walk-accessories"] },
  { key: "promotions", title_zh: "\u4fc3\u92b7\u5c08\u5340", title_en: "Promotions", slugs: ["value-bundles"] },
] as const;

export function getCollection(slug: string): CollectionConfig | undefined {
  return COLLECTIONS.find((collection) => collection.slug === slug);
}

export function getCollectionProducts(products: Product[], collection: CollectionConfig): Product[] {
  return products.filter(collection.match);
}

export function getCollectionLabel(collection: CollectionConfig, locale: Locale): string {
  return locale === "en" ? collection.title_en : collection.title_zh;
}

const ENGLISH_COLLECTION_DESCRIPTIONS: Record<string, string> = {
  dogs: "Japanese food, functional treats and everyday essentials curated for dogs.",
  cats: "A focused selection of Japanese essentials made for cats.",
  "outdoor-gear": "Harnesses, leads and walking accessories for comfortable adventures.",
  "dental-chews": "Natural chewing options to support everyday dental care.",
  "meal-toppers": "Aromatic meal toppers to make everyday bowls more inviting.",
  "training-treats": "Small, convenient rewards for training and adventures outside.",
  "joint-care": "Functional choices for everyday mobility and joint care.",
  "skin-coat": "Daily nutrition selected to support healthy skin and a glossy coat.",
  "senior-puppy": "Soft, easy-to-eat treats for puppies and senior dogs.",
  "horse-meat": "Hypoallergenic horse-meat treats for sensitive dogs.",
  venison: "Natural venison treats featuring wild Hokkaido venison.",
  "beef-tendon": "Chewy Japanese beef and tendon treats with rich meaty flavour.",
  "chicken-poultry": "Japanese chicken and poultry treats for everyday rewards.",
  "seafood-fish": "Natural fish and seafood treats for dogs.",
  "pork-specialty": "Japanese pork and specialty meat treats.",
  "cheese-bakery": "Cheese and Japanese-style baked treats for satisfying rewards.",
  harnesses: "Comfortable harnesses designed for daily walks.",
  leashes: "Reliable leads for everyday walking and travel.",
  collars: "Practical collars and half-chain walking gear.",
  "walk-accessories": "Waste bags, outdoor bags and thoughtful walking accessories.",
  "value-bundles": "Official value bundles that bring everyday essentials together.",
};

export function getCollectionDescription(collection: CollectionConfig): string {
  return ENGLISH_COLLECTION_DESCRIPTIONS[collection.slug] || "Curated Japanese pet essentials for everyday life.";
}

export { CAT_SKUS };
