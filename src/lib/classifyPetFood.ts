/**
 * Keyword-based pet food zone classifier.
 *
 * Rules (name / description / tags / specs / productType / id):
 * 1. Freeze-dried + 貓貓／貓用（or freeze-dried series without dog-only mark）
 *    → cats / 冷凍脫水系列 — never dogs.
 * 2. 狗狗／狗用 + edible food／treat signals → dogs / 狗狗食品 or 狗狗小食.
 * 3. Toys, gear, health, cleaning, outdoor keep their storefront category
 *    even when the title says「狗狗」(those are not food SKUs).
 */

export type FoodZoneSubcategory =
  | "貓罐罐"
  | "貓乾糧"
  | "冷凍脫水系列"
  | "狗狗食品"
  | "狗狗小食";

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
const DOG_MARK = /狗狗|狗用|狗零食|狗肉乾|(?<!貓)狗糧|\bdog\b/i;
const CAT_MARK = /貓貓|貓用|貓咪|\bcat\b/i;
/** Shared cat+dog SKUs stay in their marketing / snacks shelf. */
const SHARED_MARK =
  /貓狗|貓與狗|cats?\s*[&＋+]\s*dogs?|cat\s*&\s*dog|for cats?\s*(&|and)\s*dogs?/i;
const FREEZE_MARK =
  /冷凍脫水|凍乾|freeze[\s-]?dried|freeze[\s-]?dry/i;
const SNACK_MARK =
  /小食|零食|肉乾|潔牙骨|treat|jerky|chew(?!\s*toy)|餅乾|狗餅|脆餅|百力滋|糊仔|肉泥|膏狀|狗芝士|芝士條|芝士骨|脆片|點心|獎勵零食|snack/i;
const STAPLE_FOOD_MARK =
  /(?<!貓)狗糧|主糧|(?<!貓)乾糧|食品(?!級)|kibble|dog\s*food|staple/i;
/** Non-food categories that must not be swallowed into 狗狗食品. */
const NON_FOOD_CATEGORY = new Set([
  "toys",
  "health",
  "cleaning",
  "outdoor",
]);
const NON_FOOD_TEXT =
  /玩具|toy|雨衣|大衣|尿墊|頸帶|胸背|飯碗|推車|牽引|座墊|發光|漱口水|營養油|保健|清潔|貓砂|litter|harness|coat|pad|carrier|stroller|leash|collar/i;

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
  return bits.filter(Boolean).join("\n");
}

function isNonFoodSku(product: ClassifiableProduct, text: string): boolean {
  if (NON_FOOD_CATEGORY.has(product.categorySlug)) return true;
  if (NON_FOOD_TEXT.test(text)) return true;
  if (/胸背帶|harness/i.test(text) && !SNACK_MARK.test(text)) return true;
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

  // Shared cat+dog food/treat deals stay on their original shelf (deals/snacks).
  if (hasShared && !hasFreeze) {
    return null;
  }

  // ——— Freeze-dried series ———
  // Cat freeze-dried (貓貓／貓用) always wins; bare「冷凍脫水系列」also defaults to cats.
  // Dog-only freeze-dried (狗狗／狗用 without cat mark) → dog snacks.
  if (hasFreeze) {
    if (hasDog && !hasCat) {
      return {
        categorySlug: "dogs",
        subcategory: "狗狗小食",
        reason: "冷凍脫水 + 狗狗／狗用 → 狗狗小食",
        tags: ["狗狗小食", "冷凍脫水系列", "狗用"],
      };
    }
    return {
      categorySlug: "cats",
      subcategory: "冷凍脫水系列",
      reason: hasCat
        ? "冷凍脫水 + 貓貓／貓用 → 貓貓冷凍脫水系列"
        : "冷凍脫水系列預設歸入貓貓專區",
      tags: ["冷凍脫水系列", "貓貓小食", "貓用"],
    };
  }

  // ——— Dog food / dog snacks ———
  if (hasDog && !isNonFoodSku(product, text)) {
    if (hasSnack || (!hasStaple && /禮盒|gift|組合/i.test(text))) {
      return {
        categorySlug: "dogs",
        subcategory: "狗狗小食",
        reason: "名稱／內容含狗狗／狗用 + 小食關鍵字 → 狗狗小食",
        tags: ["狗狗小食", "狗用"],
      };
    }
    if (
      hasStaple ||
      product.categorySlug === "dogs" ||
      product.categorySlug === "snacks" ||
      product.categorySlug === "bestsellers" ||
      product.categorySlug === "deals"
    ) {
      const sub: FoodZoneSubcategory = hasSnack ? "狗狗小食" : "狗狗食品";
      return {
        categorySlug: "dogs",
        subcategory: sub,
        reason:
          sub === "狗狗小食"
            ? "狗狗食品區內嘅零食關鍵字 → 狗狗小食"
            : "名稱／內容含狗狗／狗用 → 狗狗食品",
        tags: [sub, "狗用"],
      };
    }
  }

  // Explicit staple already under dogs without keywords in title (e.g. 日本天然狗糧).
  if (
    product.categorySlug === "dogs" &&
    hasStaple &&
    !isNonFoodSku(product, text)
  ) {
    return {
      categorySlug: "dogs",
      subcategory: "狗狗食品",
      reason: "狗糧／主糧 → 狗狗食品",
      tags: ["狗狗食品"],
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
