import { normalizeProductClassificationText } from "./product-classification-text";

/**
 * Keyword-based pet food zone classifier.
 *
 * Rules (name / description / tags / specs / productType / id):
 * 1. Freeze-dried + \u8c93\u8c93／\u8c93\u7528（or freeze-dried series without dog-only mark）
 *    → cats / \u51b7\u51cd\u812b\u6c34\u7cfb\u5217 — never dogs.
 * 2. Cat snack series marks（\u7121\u6dfb\u52a0\u5929\u7136／\u8001\u8c93\u96f6\u98df／\u53bb\u6bdb\u7403／bb\u8c93）
 *    → cats / \u8c93\u8c93\u5c0f\u98df (keeps authored snackSeries).
 * 3. Authored \u6295\u85e5\u9935\u85e5\u5c08\u7528\u5c0f\u98df stays under its cats / dogs parent category.
 * 4. \u72d7\u72d7／\u72d7\u7528 + edible food／treat signals → dogs / \u72d7\u72d7\u98df\u54c1 or \u72d7\u72d7\u5c0f\u98df.
 * 5. Toys, gear, health, cleaning, outdoor keep their storefront category
 *    even when the title says「\u72d7\u72d7」(those are not food SKUs).
 */

export type FoodZoneSubcategory =
  | "\u8c93\u7f50\u7f50"
  | "\u8c93\u4e7e\u7ce7"
  | "\u51b7\u51cd\u812b\u6c34\u7cfb\u5217"
  | "\u8c93\u8c93\u5c0f\u98df"
  | "\u72d7\u72d7\u98df\u54c1"
  | "\u72d7\u72d7\u5c0f\u98df"
  | "\u72d7\u72d7\u51b7\u51cd\u812b\u6c34\u98df\u54c1"
  | "\u6295\u85e5\u9935\u85e5\u5c08\u7528\u5c0f\u98df";

export type ClassifiableProduct = {
  id: string;
  categorySlug: string;
  subcategory?: FoodZoneSubcategory | string;
  icon?: string;
  name: { zh: string; en: string };
  description?: { zh: string; en: string };
  specs?: { zh: string; en: string }[];
  tags?: string[];
  productType?: string;
};

/** Species / audience marks in titles, blurbs, and tags. */
const DOG_MARK = /\u72d7\u72d7|\u72d7\u7528|\u72d7\u96f6\u98df|\u72d7\u8089\u4e7e|(?<!\u8c93)\u72d7\u7ce7|\bdog\b/i;
const CAT_MARK = /\u8c93\u8c93|\u8c93\u7528|\u8c93\u54aa|\bcat\b/i;
/** Shared cat+dog SKUs stay in their marketing / snacks shelf. */
const SHARED_MARK =
  /\u8c93\u72d7|\u8c93\u8207\u72d7|\u5c0f\u8c93\u5c0f\u72d7|\u5c0f\u72d7\u5c0f\u8c93|\u5e7c\u8c93\u5e7c\u72ac|\u5e7c\u72ac\u5e7c\u8c93|cats?\s*[&＋+]\s*dogs?|cat\s*&\s*dog|kitten\s*&\s*puppy|puppy\s*&\s*kitten|for cats?\s*(&|and)\s*dogs?/i;
const FREEZE_MARK =
  /\u51b7\u51cd\u812b\u6c34|\u51b7\u51bb\u8131\u6c34|\u51cd\u4e7e|\u51cd\u5e72|freeze[\s-]?dried|freeze[\s-]?dry/i;
const CAT_SNACK_SERIES_MARK =
  /\u7121\u6dfb\u52a0\u5929\u7136\u7cfb\u5217|\u8001\u8c93\u96f6\u98df|\u53bb\u6bdb\u7403\u914d\u65b9|bb\u8c93\u96f6\u98df|BB\u8c93\u96f6\u98df|\u5410\u6bdb\u7403\u914d\u65b9|\u6bdb\u7389\u914d\u616e|\u5e7c\u8c93\u7528|1\u6b73\u524d|11\u6b73\u8d77|14\u6b73\u8d77|\u9ad8\u9f61\u8c93/i;
const SNACK_MARK =
  /\u5c0f\u98df|\u96f6\u98df|\u8089\u4e7e|\u6f54\u7259\u9aa8|treat|jerky|chew(?!\s*toy)|\u9905\u4e7e|\u8106\u7247|\u9ede\u5fc3|\u734e\u52f5\u96f6\u98df|snack|\u7cca\u4ed4|\u818f\u72c0|\u9921\u9905|\u5976\u7c89|\u5c71\u7f8a\u5976/i;
const STAPLE_FOOD_MARK =
  /(?<!\u8c93)\u72d7\u7ce7|\u4e3b\u7ce7|(?<!\u8c93)\u4e7e\u7ce7|\u98df\u54c1(?!\u7d1a)|kibble|dog\s*food|staple/i;
const WET_FOOD_MARK =
  /\u7f50\u982d|\u7f50\u7f50|\u6fd5\u7ce7|\u6fd5\u98df|wet\s*food|canned|can\b|pouch/i;
const DRY_FOOD_MARK = /\u8c93\u7ce7|\u4e7e\u7ce7|dry\s*food|kibble/i;
/** Non-food categories that must not be swallowed into \u72d7\u72d7\u98df\u54c1. */
const NON_FOOD_CATEGORY = new Set([
  "toys",
  "health",
  "cleaning",
  "outdoor",
]);
const NON_FOOD_TEXT =
  /\u73a9\u5177|toy|\u96e8\u8863|\u5927\u8863|\u5c3f\u588a|\u9838\u5e36|\u80f8\u80cc|\u98ef\u7897|\u63a8\u8eca|\u727d\u5f15|\u5ea7\u588a|\u767c\u5149|\u6f31\u53e3\u6c34|\u71df\u990a\u6cb9|\u4fdd\u5065|\u6e05\u6f54|\u8c93\u7802|litter|harness|coat|pad|carrier|stroller|leash|collar/i;

export type FoodZoneHint = {
  categorySlug: "cats" | "dogs";
  subcategory: FoodZoneSubcategory;
  /** Why the classifier chose this zone (zh). */
  reason: string;
  /** Suggested collection / tag labels. */
  tags: string[];
};

function collectText(product: ClassifiableProduct): string {
  const bits = [
    product.id,
    product.name.zh,
    product.name.en,
    product.description?.zh,
    product.description?.en,
    product.subcategory,
    product.categorySlug,
    product.productType,
    ...(product.tags ?? []),
    ...(product.specs ?? []).flatMap((s) => [s.zh, s.en]),
  ];
  return normalizeProductClassificationText(bits.filter(Boolean).join("\n"));
}

function isNonFoodSku(product: ClassifiableProduct, text: string): boolean {
  if (NON_FOOD_CATEGORY.has(product.categorySlug)) return true;
  if (NON_FOOD_TEXT.test(text)) return true;
  if (/\u80f8\u80cc\u5e36|harness/i.test(text) && !SNACK_MARK.test(text)) return true;
  return false;
}

/**
 * Infer the cat/dog food zone from product copy and tags.
 * Returns `null` when the SKU is outside the food-zone rules
 * (toys, apparel, shared snacks, etc.).
 */
export function inferFoodZone(
  product: ClassifiableProduct,
): FoodZoneHint | null {
  const text = collectText(product);
  const hasDog = DOG_MARK.test(text);
  const hasCat = CAT_MARK.test(text);
  const hasShared = SHARED_MARK.test(text);
  const hasFreeze = FREEZE_MARK.test(text);
  const hasSnack = SNACK_MARK.test(text);
  const hasStaple = STAPLE_FOOD_MARK.test(text);
  const hasWetFood = WET_FOOD_MARK.test(text);
  const hasDryFood = DRY_FOOD_MARK.test(text);

  // ——— Explicit Stripe metadata stays authoritative when valid ———
  if (
    product.categorySlug === "cats" &&
    (product.subcategory === "\u8c93\u7f50\u7f50" ||
      product.subcategory === "\u8c93\u4e7e\u7ce7" ||
      product.subcategory === "\u51b7\u51cd\u812b\u6c34\u7cfb\u5217" ||
      product.subcategory === "\u8c93\u8c93\u5c0f\u98df" ||
      product.subcategory === "\u6295\u85e5\u9935\u85e5\u5c08\u7528\u5c0f\u98df")
  ) {
    return {
      categorySlug: "cats",
      subcategory: product.subcategory,
      reason: "Stripe metadata \u6307\u5b9a\u8c93\u54aa\u5b50\u5206\u985e → \u4fdd\u6301",
      tags: [product.subcategory, "\u8c93\u7528"],
    };
  }
  if (
    product.categorySlug === "dogs" &&
    (product.subcategory === "\u72d7\u72d7\u98df\u54c1" ||
      product.subcategory === "\u72d7\u72d7\u5c0f\u98df" ||
      product.subcategory === "\u72d7\u72d7\u51b7\u51cd\u812b\u6c34\u98df\u54c1" ||
      product.subcategory === "\u6295\u85e5\u9935\u85e5\u5c08\u7528\u5c0f\u98df")
  ) {
    return {
      categorySlug: "dogs",
      subcategory: product.subcategory,
      reason: "Stripe metadata \u6307\u5b9a\u72d7\u72d7\u5b50\u5206\u985e → \u4fdd\u6301",
      tags: [product.subcategory, "\u72d7\u7528"],
    };
  }

  // Shared cat+dog food/treat deals stay on their original shelf (deals/snacks).
  if (hasShared && !hasFreeze) {
    return null;
  }

  // ——— Cat wet/dry food ———
  if (!hasFreeze && !hasDog && (hasCat || product.categorySlug === "cats")) {
    if (hasWetFood) {
      return {
        categorySlug: "cats",
        subcategory: "\u8c93\u7f50\u7f50",
        reason: "\u8c93\u54aa\u7f50\u982d／\u6fd5\u7ce7\u95dc\u9375\u5b57 → \u8c93\u7f50\u7f50",
        tags: ["\u8c93\u7f50\u7f50", "\u8c93\u7528"],
      };
    }
    if (hasDryFood) {
      return {
        categorySlug: "cats",
        subcategory: "\u8c93\u4e7e\u7ce7",
        reason: "\u8c93\u54aa\u4e7e\u7ce7\u95dc\u9375\u5b57 → \u8c93\u4e7e\u7ce7",
        tags: ["\u8c93\u4e7e\u7ce7", "\u8c93\u7528"],
      };
    }
  }

  // ——— Freeze-dried series ———
  // Cat freeze-dried (\u8c93\u8c93／\u8c93\u7528) always wins; bare「\u51b7\u51cd\u812b\u6c34\u7cfb\u5217」also defaults to cats.
  // Dog-only freeze-dried (\u72d7\u72d7／\u72d7\u7528 without cat mark) → dog snacks.
  if (hasFreeze) {
    if (hasDog && !hasCat) {
      return {
        categorySlug: "dogs",
        subcategory: "\u72d7\u72d7\u51b7\u51cd\u812b\u6c34\u98df\u54c1",
        reason: "\u51cd\u4e7e／\u51cd\u5e72 + \u72d7\u72d7／\u72d7\u7528 → \u72d7\u72d7\u51b7\u51cd\u812b\u6c34\u98df\u54c1",
        tags: ["\u72d7\u72d7\u51b7\u51cd\u812b\u6c34\u98df\u54c1", "\u51cd\u4e7e\u7ce7", "\u72d7\u7528"],
      };
    }
    return {
      categorySlug: "cats",
      subcategory: "\u51b7\u51cd\u812b\u6c34\u7cfb\u5217",
      reason: hasCat
        ? "\u51cd\u4e7e／\u51cd\u5e72 + \u8c93\u8c93／\u8c93\u7528 → \u8c93\u54aa\u51b7\u51cd\u812b\u6c34\u7cfb\u5217"
        : "\u51cd\u4e7e／\u51cd\u5e72\u7cfb\u5217\u9810\u8a2d\u6b78\u5165\u8c93\u54aa\u5c08\u5340",
      tags: ["\u51b7\u51cd\u812b\u6c34\u7cfb\u5217", "\u51cd\u4e7e\u7ce7", "\u8c93\u7528"],
    };
  }

  // ——— Authored cat snack series stay put ———
  if (product.subcategory === "\u8c93\u8c93\u5c0f\u98df" && (hasCat || !hasDog)) {
    return {
      categorySlug: "cats",
      subcategory: "\u8c93\u8c93\u5c0f\u98df",
      reason: "\u5df2\u6b78\u5165\u8c93\u8c93\u5c0f\u98df\u5c08\u5340 → \u4fdd\u6301",
      tags: ["\u8c93\u8c93\u5c0f\u98df", "\u8c93\u7528"],
    };
  }

  // ——— Cat snack series (\u7121\u6dfb\u52a0\u5929\u7136／\u8001\u8c93／\u53bb\u6bdb\u7403／BB) ———
  // Keep under cats / \u8c93\u8c93\u5c0f\u98df; do not swallow wet-can / dry-food primaries.
  if (
    !hasDog &&
    CAT_SNACK_SERIES_MARK.test(text) &&
    (hasSnack || /\u7cca\u4ed4|\u818f\u72c0|\u9921\u9905|\u8106\u9905|\u9935\u5976|\u5976\u7c89|\u5c71\u7f8a\u5976/i.test(text)) &&
    product.subcategory !== "\u8c93\u7f50\u7f50" &&
    product.subcategory !== "\u8c93\u4e7e\u7ce7"
  ) {
    return {
      categorySlug: "cats",
      subcategory: "\u8c93\u8c93\u5c0f\u98df",
      reason: "\u8c93\u8c93\u96f6\u98df\u7cfb\u5217\u95dc\u9375\u5b57 → \u8c93\u8c93\u5c0f\u98df\u5c08\u5340",
      tags: ["\u8c93\u8c93\u5c0f\u98df", "\u8c93\u7528"],
    };
  }

  // ——— Cat snack fallback / default food shelf ———
  if (!hasDog && (hasCat || product.categorySlug === "cats")) {
    if (hasSnack) {
      return {
        categorySlug: "cats",
        subcategory: "\u8c93\u8c93\u5c0f\u98df",
        reason: "\u8c93\u54aa\u96f6\u98df\u95dc\u9375\u5b57 → \u8c93\u8c93\u5c0f\u98df",
        tags: ["\u8c93\u8c93\u5c0f\u98df", "\u8c93\u7528"],
      };
    }
    return {
      categorySlug: "cats",
      subcategory: "\u8c93\u7f50\u7f50",
      reason: "Stripe \u672a\u63d0\u4f9b\u5b50\u5206\u985e；\u8c93\u54aa\u98df\u54c1\u9810\u8a2d\u6b78\u5165\u7f50\u982d／\u6fd5\u7ce7",
      tags: ["\u8c93\u7f50\u7f50", "\u8c93\u7528"],
    };
  }

  // ——— Dog food / dog snacks ———
  if (hasDog && !isNonFoodSku(product, text)) {
    if (hasSnack || (!hasStaple && /\u79ae\u76d2|gift|\u7d44\u5408/i.test(text))) {
      return {
        categorySlug: "dogs",
        subcategory: "\u72d7\u72d7\u5c0f\u98df",
        reason: "\u540d\u7a31／\u5167\u5bb9\u542b\u72d7\u72d7／\u72d7\u7528 + \u5c0f\u98df\u95dc\u9375\u5b57 → \u72d7\u72d7\u5c0f\u98df",
        tags: ["\u72d7\u72d7\u5c0f\u98df", "\u72d7\u7528"],
      };
    }
    if (
      hasStaple ||
      product.categorySlug === "dogs" ||
      product.categorySlug === "snacks" ||
      product.categorySlug === "bestsellers" ||
      product.categorySlug === "deals"
    ) {
      const sub: FoodZoneSubcategory = hasSnack ? "\u72d7\u72d7\u5c0f\u98df" : "\u72d7\u72d7\u98df\u54c1";
      return {
        categorySlug: "dogs",
        subcategory: sub,
        reason:
          sub === "\u72d7\u72d7\u5c0f\u98df"
            ? "\u72d7\u72d7\u98df\u54c1\u5340\u5167\u5605\u96f6\u98df\u95dc\u9375\u5b57 → \u72d7\u72d7\u5c0f\u98df"
            : "\u540d\u7a31／\u5167\u5bb9\u542b\u72d7\u72d7／\u72d7\u7528 → \u72d7\u72d7\u98df\u54c1",
        tags: [sub, "\u72d7\u7528"],
      };
    }
  }

  // Explicit staple already under dogs without keywords in title (e.g. \u65e5\u672c\u5929\u7136\u72d7\u7ce7).
  if (
    product.categorySlug === "dogs" &&
    hasStaple &&
    !isNonFoodSku(product, text)
  ) {
    return {
      categorySlug: "dogs",
      subcategory: "\u72d7\u72d7\u98df\u54c1",
      reason: "\u72d7\u7ce7／\u4e3b\u7ce7 → \u72d7\u72d7\u98df\u54c1",
      tags: ["\u72d7\u72d7\u98df\u54c1"],
    };
  }

  return null;
}

/** Merge inferred food-zone category / subcategory onto a product. */
export function applyFoodZoneClassification<T extends ClassifiableProduct>(
  product: T,
): T {
  const hint = inferFoodZone(product);
  if (!hint) return product;

  return {
    ...product,
    categorySlug: hint.categorySlug,
    subcategory: hint.subcategory,
    ...(product.icon !== undefined
      ? {
          icon:
            hint.categorySlug === "cats"
              ? "cat"
              : hint.categorySlug === "dogs" && product.icon === "bone"
                ? "dog"
                : product.icon,
        }
      : {}),
  };
}

/** Apply classification across a catalog list. */
export function classifyCatalogProducts<T extends ClassifiableProduct>(
  products: T[],
): T[] {
  return products.map(applyFoodZoneClassification);
}

/** Audit helper: list products whose stored zone disagrees with keywords. */
export function findFoodZoneMismatches<T extends ClassifiableProduct>(
  products: T[],
): Array<{
  id: string;
  current: string;
  expected: string;
  reason: string;
}> {
  const out: Array<{
    id: string;
    current: string;
    expected: string;
    reason: string;
  }> = [];
  for (const product of products) {
    const hint = inferFoodZone(product);
    if (!hint) continue;
    const current = `${product.categorySlug}/${product.subcategory ?? "-"}`;
    const expected = `${hint.categorySlug}/${hint.subcategory}`;
    if (current !== expected) {
      out.push({
        id: product.id,
        current,
        expected,
        reason: hint.reason,
      });
    }
  }
  return out;
}
