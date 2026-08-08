import fs from "node:fs";
import path from "node:path";
import {
  PRODUCTS,
  WT_JAPAN_DOG_STOREFRONT_PRODUCTS,
  getCatProductsBySubcategory,
  getDogProductsBySubcategory,
} from "@/lib/products";
import {
  applyProductCatalogRecords,
  parseProductCatalogCsv,
} from "@/lib/catalog-overrides";
import { buildSearchIndex, searchProducts } from "@/lib/searchProducts";
import { buildOrderItemsFromLines, MAX_QTY } from "@/lib/order";

const ROOT = process.cwd();
const EXPECTED_PRODUCT_COUNT = 114;
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
const PILL_TREAT_EXPECTATIONS = {
  "pill-pocket-greenies-dog-chicken": {
    categorySlug: "dogs",
    image: "/products/pill-pocket-greenies-dog-chicken.webp",
    title: "GREENIES 綠的 Pill Pockets 健綠犬用投藥零食（雞肉風味）",
    price: 98,
    originalPrice: 110,
    brand: "GREENIES",
    spec: "規格：30 顆裝 (224g)",
  },
  "pill-pocket-greenies-dog-peanut-butter": {
    categorySlug: "dogs",
    image: "/products/pill-pocket-greenies-dog-peanut-butter.webp",
    title: "GREENIES 綠的 Pill Pockets 健綠犬用投藥零食（花生醬風味）",
    price: 98,
    originalPrice: 110,
    brand: "GREENIES",
    spec: "規格：30 顆裝 (224g)",
  },
  "pill-assist-royal-canin-cat": {
    categorySlug: "cats",
    image: "/products/pill-assist-royal-canin-cat.webp",
    title: "ROYAL CANIN 皇家 Pill Assist 貓用投藥輔助軟錠",
    price: 72,
    originalPrice: 80,
    brand: "ROYAL CANIN",
    spec: "規格：45g (約30顆)",
  },
  "pill-assist-royal-canin-dog-small": {
    categorySlug: "dogs",
    image: "/products/pill-assist-royal-canin-dog-small.webp",
    title: "ROYAL CANIN 皇家 Pill Assist 小型犬用投藥輔助軟錠",
    price: 78,
    originalPrice: 88,
    brand: "ROYAL CANIN",
    spec: "規格：90g (約30顆)",
  },
  "mediball-vets-labo-dog-cheese": {
    categorySlug: "dogs",
    image: "/products/mediball-vets-labo-dog-cheese.webp",
    title: "VET'S Labo Mediball 獸醫研發犬用投藥小丸子（起司味）",
    price: 48,
    originalPrice: 55,
    brand: "VET'S Labo",
    spec: "規格：15 顆裝 (20g)",
  },
  "mediball-vets-labo-dog-chicken": {
    categorySlug: "dogs",
    image: "/products/mediball-vets-labo-dog-chicken.webp",
    title: "VET'S Labo Mediball 獸醫研發犬用投藥小丸子（雞肉味）",
    price: 48,
    originalPrice: 55,
    brand: "VET'S Labo",
    spec: "規格：15 顆裝 (20g)",
  },
  "mediball-vets-labo-cat-tuna": {
    categorySlug: "cats",
    image: "/products/mediball-vets-labo-cat-tuna.webp",
    title: "VET'S Labo Mediball 獸醫研發貓用投藥小丸子（鮪魚味）",
    price: 48,
    originalPrice: 55,
    brand: "VET'S Labo",
    spec: "規格：15 顆裝 (20g)",
  },
  "mediball-vets-labo-cat-bonito": {
    categorySlug: "cats",
    image: "/products/mediball-vets-labo-cat-bonito.webp",
    title: "VET'S Labo Mediball 獸醫研發貓用投藥小丸子（鰹魚味）",
    price: 48,
    originalPrice: 55,
    brand: "VET'S Labo",
    spec: "規格：15 顆裝 (20g)",
  },
  "ciao-churu-vet-pill-paste": {
    categorySlug: "cats",
    image: "/products/ciao-churu-vet-pill-paste.webp",
    title: "CIAO 獸醫專用高黏度投藥輔助肉泥膏（鮪魚味）",
    price: 38,
    originalPrice: 45,
    brand: "CIAO",
    spec: "規格：12g x 4 本",
  },
  "ciao-churu-vet-pill-paste-chicken": {
    categorySlug: "cats",
    image: "/products/ciao-churu-vet-pill-paste-chicken.webp",
    title: "CIAO 獸醫專用高黏度投藥輔助肉泥膏（雞肉味）",
    price: 38,
    originalPrice: 45,
    brand: "CIAO",
    spec: "規格：12g x 4 本",
  },
  "tomlyn-pill-mask-bacon": {
    categorySlug: "dogs",
    image: "/products/tomlyn-pill-mask-bacon.webp",
    title: "Tomlyn 湯姆林 投藥軟膏/偽裝膏（煙燻培根風味）",
    price: 85,
    originalPrice: 98,
    brand: "Tomlyn",
    spec: "規格：113g",
  },
  "easy-pill-cat-poultry": {
    categorySlug: "cats",
    image: "/products/easy-pill-cat-poultry.webp",
    title: "EasyPill 貓用投藥軟膏（禽肉風味）",
    price: 65,
    originalPrice: 75,
    brand: "EasyPill",
    spec: "規格：10g x 3 條",
  },
} as const;

const failures: string[] = [];

function check(condition: unknown, message: string): asserts condition {
  if (!condition) failures.push(message);
}

const overrideCsv = [
  "\uFEFFMofu Haven HK | 102 項保留商品核心目錄",
  "商品 ID,中文商品名稱,英文商品名稱,售價 (HKD),原價（HKD）,庫存狀態,中文描述,英文描述,本地圖片路徑,來源圖片 URL",
  'dog-food-1-5kg,Sheet 狗糧,Sheet Dog Food," HK$ 1,234.50 ","HK$ 1,299.00",售罄,Sheet 中文介紹,Sheet English description,/products/dog-food-1-5kg.webp,https://cdn.shopify.com/example.jpg',
  'dog-dental-chews,Sheet 潔牙骨,Sheet Dental Chews,"$88",,在售,,,,https://cdn.shopify.com/remote-product.jpg',
  'missing-product,測試商品,Test Product,"$ 88 ",,在售,測試介紹,Test description,,',
  "invalid-price,錯誤價格,Invalid Price,not-a-number,,在售,錯誤,Invalid,/products/dog-food-1-5kg.webp,",
].join("\n");
const parsedOverrides = parseProductCatalogCsv(overrideCsv);
const overriddenCatalog = applyProductCatalogRecords(
  PRODUCTS,
  parsedOverrides.records,
);
const overriddenDogFood = overriddenCatalog.products.find(
  (product) => product.id === "dog-food-1-5kg",
);
const staticDogFood = PRODUCTS.find(
  (product) => product.id === "dog-food-1-5kg",
);
const overriddenDentalChews = overriddenCatalog.products.find(
  (product) => product.id === "dog-dental-chews",
);
const staticDentalChews = PRODUCTS.find(
  (product) => product.id === "dog-dental-chews",
);
check(
  parsedOverrides.headerRow === 2 &&
    parsedOverrides.acceptedRows === 2 &&
    parsedOverrides.ignoredRows === 2,
  "Google Sheet parser must detect a second-row Chinese header, accept complete rows, and ignore incomplete catalog rows",
);
check(
  overriddenCatalog.matchedRecords === 2,
  "Only Sheet IDs present in the catalog may be applied",
);
check(
  overriddenDogFood?.price === 1234.5 &&
    overriddenDogFood.originalPrice === 1299 &&
    overriddenDogFood.inStock === false &&
    overriddenDogFood.image === "/products/dog-food-1-5kg.webp" &&
    overriddenDogFood.name.zh === "Sheet 狗糧" &&
    overriddenDogFood.name.en === "Sheet Dog Food" &&
    overriddenDogFood.description?.zh === "Sheet 中文介紹" &&
    overriddenDogFood.description?.en === "Sheet English description",
  "Google Sheet image, title, description, price, originalPrice, and stock fields were not applied",
);
check(
  overriddenDentalChews?.image ===
    "https://cdn.shopify.com/remote-product.jpg" &&
    overriddenDentalChews.description === undefined &&
    staticDentalChews?.description !== undefined,
  "Google Sheet remote images must be accepted and blank descriptions must remove stale static descriptions",
);
check(
  staticDogFood?.price === 168 &&
    staticDogFood.inStock !== false &&
    staticDogFood.name.zh === "日本天然狗糧 1.5kg",
  "Applying Google Sheet overrides must not mutate static PRODUCTS fallback",
);

let duplicateOverrideRejected = false;
try {
  parseProductCatalogCsv(
    [
      "id,price,inStock,title,description,image",
      "dog-food-1-5kg,199,true,Dog Food,First description,/products/dog-food-1-5kg.webp",
      "dog-food-1-5kg,209,true,Dog Food,Second description,/products/dog-food-1-5kg.webp",
    ].join("\n"),
  );
} catch {
  duplicateOverrideRejected = true;
}
check(
  duplicateOverrideRejected,
  "Duplicate Google Sheet product IDs must invalidate the override source",
);

let missingRequiredColumnRejected = false;
try {
  parseProductCatalogCsv(
    [
      "id,price,inStock,title,image",
      "dog-food-1-5kg,199,true,Dog Food,/products/dog-food-1-5kg.webp",
    ].join("\n"),
  );
} catch {
  missingRequiredColumnRejected = true;
}
check(
  missingRequiredColumnRejected,
  "A Sheet without all five required product field groups must be rejected",
);

const invalidImages = [
  "//example.com/product.jpg",
  "/products/../secret.jpg",
  "/products\\secret.jpg",
];
for (const image of invalidImages) {
  const parsed = parseProductCatalogCsv(
    [
      "id,price,inStock,title,description,image",
      "dog-food-1-5kg,199,true,Safe Product,Safe description,/products/dog-food-1-5kg.webp",
      `unsafe-image,199,true,Unsafe Product,Unsafe description,${image}`,
    ].join("\n"),
  );
  check(
    parsed.records.size === 1 &&
      !parsed.records.has("unsafe-image") &&
      parsed.ignoredRows === 1,
    `Unsafe Sheet image path must be rejected: ${image}`,
  );
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

const pillTreatProducts = new Map(
  PRODUCTS.filter(
    (product) => product.subcategory === "投藥餵藥專用小食",
  ).map((product) => [product.id, product]),
);
for (const [id, expected] of Object.entries(PILL_TREAT_EXPECTATIONS)) {
  const product = pillTreatProducts.get(id);
  check(Boolean(product), `${id}: medication-assistance product is missing`);
  if (!product) continue;
  check(
    product.categorySlug === expected.categorySlug,
    `${id}: expected ${expected.categorySlug} category, found ${product.categorySlug}`,
  );
  check(
    product.subcategory === "投藥餵藥專用小食",
    `${id}: dedicated medication-assistance subcategory was overwritten`,
  );
  check(product.image === expected.image, `${id}: image path does not match`);
  check(product.name.zh === expected.title, `${id}: Chinese title does not match`);
  check(product.price === expected.price, `${id}: price does not match`);
  check(
    product.originalPrice === expected.originalPrice,
    `${id}: original price does not match`,
  );
  check(product.brand === expected.brand, `${id}: brand does not match`);
  check(
    product.specs?.some((spec) => spec.zh === expected.spec),
    `${id}: Chinese specification does not match`,
  );
  check(
    Boolean(product.description?.zh.trim()) &&
      Boolean(product.description?.en.trim()),
    `${id}: bilingual description is required`,
  );
  check(product.inStock !== false, `${id}: product must be purchasable`);
}
check(
  pillTreatProducts.size === Object.keys(PILL_TREAT_EXPECTATIONS).length,
  `Expected ${Object.keys(PILL_TREAT_EXPECTATIONS).length} medication-assistance products, found ${pillTreatProducts.size}`,
);
check(
  getCatProductsBySubcategory("投藥餵藥專用小食").length === 6,
  "Cat medication-assistance category must contain 6 products",
);
check(
  getDogProductsBySubcategory("投藥餵藥專用小食").length === 6,
  "Dog medication-assistance category must contain 6 products",
);

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
console.log(
  "Images, pricing, Google Sheet overrides, fallback immutability, authority, and order rebuilding checks passed.",
);
