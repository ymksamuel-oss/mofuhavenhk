import fs from "node:fs";
import path from "node:path";
import {
  PRODUCTS,
  WT_JAPAN_DOG_STOREFRONT_PRODUCTS,
  getDogProductsBySubcategory,
} from "@/lib/products";
import { buildSearchIndex, searchProducts } from "@/lib/searchProducts";
import { buildOrderItemsFromLines, MAX_QTY } from "@/lib/order";

const ROOT = process.cwd();
const EXPECTED_PRODUCT_COUNT = 102;
const REMOVED_EXPERIMENT_IDS = [
  "cat-food-1kg",
  "cat-scratcher-set",
  "litter-deodorizer",
  "ciao-tuna-paste-20pk",
] as const;
const REMOVED_NON_CONSUMABLE_IDS = [
  "cat-auto-water-fountain",
  "cat-tofu-litter-6l",
  "cat-catnip-toy",
  "cat-window-perch",
  "dog-warm-coat",
  "dog-training-pads",
  "dog-raincoat",
  "dog-wafuu-collar",
  "dog-chew-toy",
  "dog-travel-bowl",
  "toy-neko-ichi-wobble-wand",
  "toy-petio-silvervine-chew",
  "toy-richell-treat-ball",
  "toy-doggyman-cotton-rope-bone",
  "toy-supercat-disc-launcher",
  "toy-adies-tunnel-scratcher",
  "toy-petio-plush-squeaky-animal",
  "toy-mindup-feather-wand",
  "toy-planetdog-bounce-ball",
  "toy-cattyman-spinning-butterfly",
  "toy-richell-snuffle-mat",
  "toy-petio-catnip-fish-pillow",
  "toy-doggyman-dumbbell-chew",
  "toy-nekoichi-bowl-scratcher",
  "toy-koneko-bell-ball-set",
  "toy-petio-laser-chaser",
  "toy-doggyman-ring-frisbee",
  "toy-richell-cardboard-house",
  "toy-supercat-catnip-mouse",
  "toy-petio-slider-puzzle",
  "toy-cattyman-ball-tower",
  "toy-doggyman-dental-tennis-balls",
  "toy-nekoichi-feather-spring",
  "toy-richell-sisal-mouse",
  "toy-petio-cooling-chew-bone",
  "toy-cattyman-crinkle-tunnel",
  "toy-doggyman-tugofwar-rope-ball",
  "toy-supercat-chirping-bird",
  "pet-odor-spray",
  "litter-cleaning-kit",
  "pet-shampoo",
  "cleaning-lint-roller",
  "cleaning-air-freshener",
  "cleaning-paw-wipes",
  "cleaning-deodorizing-mat",
  "cleaning-pet-toothbrush-kit",
  "deal-cleaning-bundle",
  "deal-newyear-hamper",
  "deal-toy-clearance",
  "deal-outdoor-combo",
  "bestseller-cat-scratcher",
  "bestseller-pet-bed",
  "bestseller-cat-tower",
  "bestseller-dog-harness",
  "bestseller-litter-box",
  "pet-travel-backpack",
  "pet-foldable-bottle",
  "pet-leash-set",
  "outdoor-pet-stroller",
  "outdoor-collapsible-bowl-set",
  "outdoor-pet-carrier",
  "outdoor-led-collar",
  "outdoor-car-seat-cover",
  "wt-cat-kitten-10",
] as const;
const REQUIRED_CONSUMABLE_IDS = [
  "wt-cat-kitten-11",
  "dog-dental-chews",
  "pet-joint-supplement",
  "cat-probiotics",
  "dog-coat-oil",
  "health-omega3",
  "health-dental-water",
  "health-senior-multivitamin",
  "health-urinary-support",
  "health-calming-chews",
] as const;
const DOG_PRODUCT_IDS = [
  "wt-japan-001",
  "wt-japan-002",
  "wt-japan-003",
  "wt-japan-004",
  "wt-japan-005",
] as const;

const failures: string[] = [];

function check(condition: unknown, message: string): asserts condition {
  if (!condition) failures.push(message);
}

check(
  PRODUCTS.length === EXPECTED_PRODUCT_COUNT,
  `Expected ${EXPECTED_PRODUCT_COUNT} products, found ${PRODUCTS.length}`,
);

const ids = PRODUCTS.map((product) => product.id);
const uniqueIds = new Set(ids);
check(uniqueIds.size === ids.length, "Product IDs must be unique");

for (const product of PRODUCTS) {
  check(Boolean(product.id.trim()), "Every product requires a non-empty id");
  check(
    Boolean(product.categorySlug.trim()),
    `${product.id}: categorySlug is required`,
  );
  check(Boolean(product.image.trim()), `${product.id}: image is required`);
  check(Boolean(product.name.zh.trim()), `${product.id}: Chinese name is required`);
  check(Boolean(product.name.en.trim()), `${product.id}: English name is required`);
  check(
    Number.isFinite(product.price) && product.price > 0 && product.price < 1_000_000,
    `${product.id}: price must be a reasonable positive number`,
  );
  if (product.originalPrice !== undefined) {
    check(
      Number.isFinite(product.originalPrice) &&
        product.originalPrice > 0 &&
        product.originalPrice < 1_000_000 &&
        product.originalPrice >= product.price,
      `${product.id}: originalPrice must be positive and no lower than price`,
    );
  }

  check(product.image.startsWith("/"), `${product.id}: image must be a public path`);
  if (product.image.startsWith("/")) {
    const imagePath = path.join(ROOT, "public", product.image.slice(1));
    check(fs.existsSync(imagePath), `${product.id}: missing local image ${product.image}`);
  }

  const hit = searchProducts(product.id, PRODUCTS.length).some(
    (candidate) => candidate.id === product.id,
  );
  check(hit, `${product.id}: full-catalog search does not index this product ID`);
}

for (const id of REMOVED_EXPERIMENT_IDS) {
  check(!uniqueIds.has(id), `${id}: removed experiment product still exists`);
}
for (const id of REMOVED_NON_CONSUMABLE_IDS) {
  check(!uniqueIds.has(id), `${id}: removed non-consumable product still exists`);
}
for (const id of REQUIRED_CONSUMABLE_IDS) {
  check(uniqueIds.has(id), `${id}: required consumable product is missing`);
}

const indexedIds = new Set(buildSearchIndex(PRODUCTS).map((product) => product.id));
const missingFromSearch = [...uniqueIds].filter((id) => !indexedIds.has(id));
const unexpectedInSearch = [...indexedIds].filter((id) => !uniqueIds.has(id));
check(
  missingFromSearch.length === 0 && unexpectedInSearch.length === 0,
  `Search coverage failed: missing=${missingFromSearch.length} (${missingFromSearch.join(", ")}), unexpected=${unexpectedInSearch.length} (${unexpectedInSearch.join(", ")})`,
);

const dogProducts = new Map(
  WT_JAPAN_DOG_STOREFRONT_PRODUCTS.map((product) => [product.id, product]),
);
const dogTreatIds = new Set(
  getDogProductsBySubcategory("狗狗小食").map((product) => product.id),
);
for (const id of DOG_PRODUCT_IDS) {
  const product = dogProducts.get(id);
  check(Boolean(product), `${id}: missing from static WT Japan dog products`);
  if (!product) continue;
  check(product.categorySlug === "dogs", `${id}: must be in dogs category`);
  check(product.subcategory === "狗狗小食", `${id}: must be a dog treat`);
  check(dogTreatIds.has(id), `${id}: missing from dog-treat category query`);
  check(
    product.image === `/images/products/${id}.webp`,
    `${id}: must use its stable local WebP`,
  );
}

const jsonFiles = [
  path.join(ROOT, "public", "wt_japan_products.json"),
  path.join(ROOT, "public", "products", "wt_japan_products.json"),
].filter(fs.existsSync);
check(
  jsonFiles.length === 1 &&
    jsonFiles[0] === path.join(ROOT, "public", "wt_japan_products.json"),
  "Exactly one authoritative WT Japan dog JSON must remain at public/wt_japan_products.json",
);

const dynamicFetchHits: string[] = [];
for (const rootName of ["src", "Src"]) {
  const sourceRoot = path.join(ROOT, rootName);
  if (!fs.existsSync(sourceRoot)) continue;
  const stack = [sourceRoot];
  while (stack.length) {
    const current = stack.pop()!;
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (/\.(?:ts|tsx|js|jsx|is)$/.test(entry.name)) {
        const text = fs.readFileSync(full, "utf8");
        if (/fetch\s*\(\s*["']\/wt_japan_products\.json["']/.test(text)) {
          dynamicFetchHits.push(path.relative(ROOT, full));
        }
      }
    }
  }
}
check(
  dynamicFetchHits.length === 0,
  `Dynamic WT Japan dog fetch remains: ${dynamicFetchHits.join(", ")}`,
);

const inStockProduct = PRODUCTS.find((product) => product.inStock !== false);
check(Boolean(inStockProduct), "Catalog must contain a purchasable product");
if (inStockProduct) {
  const rebuilt = buildOrderItemsFromLines([
    { id: inStockProduct.id, qty: 12 },
    { id: inStockProduct.id, qty: 15 },
    { id: "missing-product", qty: 2 },
  ]);
  check(rebuilt.length === 1, "Order rebuilding must drop missing products and merge IDs");
  check(rebuilt[0]?.qty === MAX_QTY, "Merged order quantity must be capped at MAX_QTY");
  check(
    rebuilt[0]?.unit === inStockProduct.price,
    "Order rebuilding must use the catalog price",
  );
}

const outOfStockProduct = PRODUCTS.find((product) => product.inStock === false);
if (outOfStockProduct) {
  check(
    buildOrderItemsFromLines([{ id: outOfStockProduct.id, qty: 1 }]).length === 0,
    `${outOfStockProduct.id}: out-of-stock product passed server order rebuilding`,
  );
}

if (failures.length > 0) {
  console.error(`Product validation failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Product validation passed: ${PRODUCTS.length} products, ${uniqueIds.size} unique IDs.`);
console.log(
  `Search coverage passed: ${indexedIds.size}/${uniqueIds.size} product IDs (100%, missing=${missingFromSearch.length}, unexpected=${unexpectedInSearch.length}).`,
);
console.log(`WT Japan dog products passed: ${DOG_PRODUCT_IDS.length}/${DOG_PRODUCT_IDS.length}.`);
console.log("Images, pricing, required fields, authority, and order rebuilding checks passed.");
