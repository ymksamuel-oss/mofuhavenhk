import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/translations";
import {
  CAT_SNACK_SERIES_SLUG,
  CAT_SUBCATEGORY_SLUG,
  DOG_SUBCATEGORY_SLUG,
  LIFESTYLE_SUBCATEGORY_SLUG,
  SMALL_PET_SUBCATEGORY_SLUG,
  type CatSnackSeries,
  type ProductSubcategory,
} from "@/lib/products";

const SITE_NAME = "Mofu Haven HK";
const SHARE_IMAGE = "/images/mofu-haven-cat-dog-logo-transparent.png";

type SeoCopy = { title: string; description: string };
type BilingualSeoCopy = Record<Locale, SeoCopy>;

const CATEGORY_SEO: Record<string, BilingualSeoCopy> = {
  cats: {
    zh: {
      title: "貓咪商品｜日本貓糧、罐頭及小食",
      description:
        "探索 Mofu Haven 日本直送貓咪商品：貓罐頭、乾糧、凍乾、貓咪小食及日常護理用品，為愛貓挑選安心好物。",
    },
    en: {
      title: "Cat Products | Japanese Cat Food, Cans & Treats",
      description:
        "Shop Japanese cat food, wet cans, freeze-dried treats, cat snacks, and everyday care essentials curated for happy cats at Mofu Haven HK.",
    },
  },
  dogs: {
    zh: {
      title: "狗狗商品｜日本狗糧、零食及用品",
      description:
        "探索 Mofu Haven 日本直送狗狗食品、營養零食及日常用品，為毛孩挑選安心、實用又高品質的好物。",
    },
    en: {
      title: "Dog Products | Japanese Dog Food, Treats & Supplies",
      description:
        "Discover Japanese dog food, nutritious treats, and everyday pet supplies thoughtfully curated for dogs at Mofu Haven HK.",
    },
  },
  "small-pets": {
    zh: {
      title: "小寵物用品｜兔仔、倉鼠及小動物好物",
      description:
        "精選日本小寵物食品、營養保健及日常用品，照顧兔仔、倉鼠及其他小動物的安心生活。",
    },
    en: {
      title: "Small Pet Supplies | Japanese Essentials for Rabbits & More",
      description:
        "Explore Japanese food, supplements, and everyday essentials curated for rabbits, hamsters, and other small pets.",
    },
  },
  lifestyle: {
    zh: {
      title: "寵物生活用品｜日常家居、清潔及外出好物",
      description:
        "探索食具、睡窩、清潔護理、外出及日常配件，為毛孩建立更舒適的生活節奏。",
    },
    en: {
      title: "Pet Living Essentials | Home, Care & Travel",
      description:
        "Explore feeding, home comfort, cleaning, travel, and everyday accessories selected for easier pet routines.",
    },
  },
  snacks: {
    zh: {
      title: "寵物小食｜日本直送貓狗零食",
      description:
        "精選日本直送貓狗小食、凍乾、肉泥及獎勵零食，為日常互動帶來安心又美味的選擇。",
    },
    en: {
      title: "Pet Snacks | Japanese Treats for Cats & Dogs",
      description:
        "Browse Japanese freeze-dried snacks, puree treats, and rewarding bites selected for cats and dogs.",
    },
  },
  toys: {
    zh: {
      title: "寵物玩具｜貓狗互動及益智玩具",
      description:
        "探索貓狗互動、益智及日常玩具，為毛孩增添安全、有趣又充實的玩樂時光。",
    },
    en: {
      title: "Pet Toys | Interactive Toys for Cats & Dogs",
      description:
        "Discover interactive and enrichment toys designed to keep cats and dogs engaged, active, and happy.",
    },
  },
  health: {
    zh: {
      title: "營養保健｜寵物營養與健康護理",
      description:
        "精選寵物營養補充、腸胃、毛髮及日常健康護理用品，支持毛孩每一天的安心狀態。",
    },
    en: {
      title: "Pet Supplements | Everyday Wellness & Care",
      description:
        "Shop pet supplements and everyday wellness care for digestion, coats, and balanced routines.",
    },
  },
  cleaning: {
    zh: {
      title: "居家清潔｜寵物衛生及日常護理",
      description:
        "探索寵物居家清潔、衛生及日常護理用品，讓毛孩與家人共享舒適整潔的生活空間。",
    },
    en: {
      title: "Pet Cleaning | Hygiene & Home Care Essentials",
      description:
        "Browse pet hygiene, cleaning, and home-care essentials for a comfortable, clean everyday routine.",
    },
  },
  deals: {
    zh: {
      title: "限時優惠｜日本寵物用品精選優惠",
      description:
        "查看 Mofu Haven 限時精選優惠，把握日本直送寵物用品、食品及日常好物的安心入手機會。",
    },
    en: {
      title: "Limited-Time Deals | Curated Japanese Pet Supplies",
      description:
        "Explore limited-time offers on curated Japanese pet food, treats, and everyday essentials at Mofu Haven HK.",
    },
  },
  bestsellers: {
    zh: {
      title: "熱賣商品｜人氣日本寵物用品",
      description:
        "探索 Mofu Haven 人氣熱賣日本寵物用品，從貓狗食品到日常好物，快速找到大家喜愛的選擇。",
    },
    en: {
      title: "Best Sellers | Popular Japanese Pet Supplies",
      description:
        "Discover customer-favorite Japanese pet food, treats, and daily essentials at Mofu Haven HK.",
    },
  },
  outdoor: {
    zh: {
      title: "外出用品｜寵物旅行及散步好物",
      description:
        "精選寵物旅行、散步及外出用品，為貓狗每次出門準備更安心、舒適的日常配備。",
    },
    en: {
      title: "Outdoor Pet Gear | Travel & Walk Essentials",
      description:
        "Shop practical travel, walking, and outdoor essentials for comfortable adventures with cats and dogs.",
    },
  },
};

const SUBCATEGORY_SEO: Partial<Record<ProductSubcategory, BilingualSeoCopy>> = {
  貓罐罐: {
    zh: {
      title: "貓罐頭及濕糧｜日本貓咪主食罐",
      description:
        "精選日本貓罐頭、濕糧及高水分主食，為愛貓提供美味、方便又安心的日常飲食選擇。",
    },
    en: {
      title: "Cat Cans & Wet Food | Japanese Meals for Cats",
      description:
        "Browse Japanese cat cans and wet food with satisfying, high-moisture everyday meal options for cats.",
    },
  },
  貓乾糧: {
    zh: {
      title: "貓乾糧及主糧｜日本貓咪日常營養",
      description:
        "探索日本貓乾糧及主食，為不同年齡與生活需要的貓咪挑選均衡、安心的日常營養。",
    },
    en: {
      title: "Cat Dry Food | Japanese Everyday Nutrition",
      description:
        "Explore Japanese dry food and staple diets for balanced, dependable everyday cat nutrition.",
    },
  },
  冷凍脫水系列: {
    zh: {
      title: "貓咪冷凍脫水系列｜日本凍乾小食",
      description:
        "精選日本貓咪凍乾及冷凍脫水小食，保留食材香氣與口感，為日常獎勵增添自然美味。",
    },
    en: {
      title: "Freeze-Dried Cat Treats | Japanese Natural Snacks",
      description:
        "Shop Japanese freeze-dried treats selected for natural aroma, satisfying texture, and rewarding cat moments.",
    },
  },
  貓貓小食: {
    zh: {
      title: "貓咪小食｜日本肉泥、凍乾及零食",
      description:
        "探索日本貓咪小食、肉泥、脆餅及凍乾零食，按年齡、毛球護理及口味挑選貼心獎勵。",
    },
    en: {
      title: "Cat Treats | Japanese Purees, Crunchy Bites & Snacks",
      description:
        "Browse Japanese cat purees, crunchy treats, and freeze-dried snacks for tasty, caring everyday rewards.",
    },
  },
  貓砂及貓砂盆: {
    zh: {
      title: "貓砂及貓砂盆｜愛貓日常衛生用品",
      description: "探索貓砂、貓砂盆及日常衛生用品，為愛貓準備舒適、整潔的居家空間。",
    },
    en: {
      title: "Cat Litter & Litter Boxes | Everyday Cat Hygiene",
      description: "Explore cat litter, litter boxes, and hygiene essentials for a clean, comfortable feline home.",
    },
  },
  貓咪玩具及攀爬設施: {
    zh: {
      title: "貓咪玩具及攀爬設施｜日常玩樂與探索",
      description: "探索貓咪玩具、抓玩及攀爬設施，為愛貓增添安全、有趣的日常活動。",
    },
    en: {
      title: "Cat Toys & Climbing Furniture | Play and Enrichment",
      description: "Discover cat toys and climbing furniture for safe, engaging everyday feline enrichment.",
    },
  },
  投藥餵藥專用小食: {
    zh: {
      title: "投藥餵藥專用小食｜寵物用藥好幫手",
      description:
        "精選方便包裹藥物、容易餵食的寵物專用小食，協助貓狗日常服藥時更安心順暢。",
    },
    en: {
      title: "Pill & Medication Treats | Easier Pet Dosing",
      description:
        "Discover pet-friendly medication treats designed to make everyday dosing easier for cats and dogs.",
    },
  },
  狗狗食品: {
    zh: {
      title: "狗狗食品｜日本狗糧及日常營養",
      description:
        "探索日本狗狗食品及日常營養選擇，為不同體型與生活需要的狗狗提供安心美味。",
    },
    en: {
      title: "Dog Food | Japanese Everyday Nutrition for Dogs",
      description:
        "Explore Japanese dog food and everyday nutrition selected for dependable, delicious routines.",
    },
  },
  狗狗乾糧: {
    zh: {
      title: "狗狗乾糧｜日本狗狗主糧",
      description: "精選日本狗狗乾糧及日常主食，為狗狗提供安心、均衡的日常營養選擇。",
    },
    en: {
      title: "Dog Dry Food | Japanese Staple Diets",
      description: "Shop Japanese dog dry food and staple diets selected for balanced everyday nutrition.",
    },
  },
  狗狗罐頭及濕糧: {
    zh: {
      title: "狗狗罐頭及濕糧｜日本狗狗濕食",
      description: "探索日本狗狗罐頭、濕糧及濃湯配方，為日常餵食增添安心美味。",
    },
    en: {
      title: "Dog Cans & Wet Food | Japanese Wet Meals",
      description: "Browse Japanese dog cans, wet food, and soup recipes for delicious everyday feeding.",
    },
  },
  狗狗冷凍脫水食品: {
    zh: {
      title: "狗狗凍乾及脫水食品｜日本自然好物",
      description: "探索日本狗狗凍乾及脫水食品，保留食材風味，為日常增添自然口感。",
    },
    en: {
      title: "Freeze-Dried Dog Food | Japanese Natural Essentials",
      description: "Explore Japanese freeze-dried and dehydrated dog food selected for natural everyday feeding.",
    },
  },
  狗狗小食: {
    zh: {
      title: "狗狗小食｜日本獎勵零食及肉條",
      description:
        "精選日本狗狗零食、肉條及獎勵小食，為訓練、互動和日常陪伴帶來美味又安心的選擇。",
    },
    en: {
      title: "Dog Treats | Japanese Reward Snacks & Jerky",
      description:
        "Shop Japanese dog treats, jerky, and reward snacks for training, bonding, and everyday enjoyment.",
    },
  },
  狗狗廁所及尿墊: {
    zh: {
      title: "狗狗廁所及尿墊｜日常如廁用品",
      description: "探索狗狗廁所、尿墊及日常清潔用品，令毛孩居家生活更舒適整潔。",
    },
    en: {
      title: "Dog Toilets & Training Pads | Everyday Hygiene",
      description: "Discover dog toilets, training pads, and everyday hygiene supplies for a clean home routine.",
    },
  },
  狗狗玩具: {
    zh: {
      title: "狗狗玩具｜互動及日常玩樂",
      description: "探索狗狗玩具及互動用品，為毛孩增添安全、有趣的日常活動。",
    },
    en: {
      title: "Dog Toys | Interactive Everyday Play",
      description: "Explore dog toys and interactive play essentials for safe, engaging everyday activity.",
    },
  },
};

const SNACK_SERIES_SEO: Record<CatSnackSeries, BilingualSeoCopy> = {
  無添加天然系列: {
    zh: {
      title: "無添加天然貓咪小食｜日本自然零食",
      description:
        "探索無添加天然系列日本貓咪小食，為日常獎勵挑選更簡單、貼心又美味的選擇。",
    },
    en: {
      title: "No-Additive Natural Cat Treats | Japanese Snacks",
      description:
        "Browse Japanese no-additive natural cat treats selected for simple, caring everyday rewards.",
    },
  },
  老貓零食: {
    zh: {
      title: "老貓零食｜日本熟齡貓咪小食",
      description:
        "精選適合熟齡貓日常享用的日本貓咪小食，照顧口感、香氣及輕鬆進食需要。",
    },
    en: {
      title: "Senior Cat Treats | Japanese Snacks for Mature Cats",
      description:
        "Discover Japanese treats selected for mature cats, with comforting flavours and easy everyday enjoyment.",
    },
  },
  去毛球配方: {
    zh: {
      title: "去毛球配方貓咪小食｜日本毛球護理零食",
      description:
        "探索日本去毛球配方貓咪小食，為換毛季與日常毛球護理提供貼心美味選擇。",
    },
    en: {
      title: "Hairball-Care Cat Treats | Japanese Supportive Snacks",
      description:
        "Browse Japanese hairball-care cat treats for tasty, thoughtful support during shedding season and beyond.",
    },
  },
  bb貓零食: {
    zh: {
      title: "幼貓零食｜日本 BB 貓小食",
      description:
        "精選適合幼貓成長期享用的日本小食，為探索期的味蕾與日常互動帶來安心獎勵。",
    },
    en: {
      title: "Kitten Treats | Japanese Snacks for Growing Cats",
      description:
        "Explore Japanese kitten treats selected for growing cats, playful bonding, and gentle everyday rewards.",
    },
  },
};

export type CategorySeoParams = {
  categorySlug: string;
  subcategory?: ProductSubcategory | null;
  snackSeries?: CatSnackSeries | null;
};

export function getCategorySeoCopy(
  locale: Locale,
  { categorySlug, subcategory = null, snackSeries = null }: CategorySeoParams,
): SeoCopy {
  if (snackSeries) return SNACK_SERIES_SEO[snackSeries][locale];
  const subcategoryCopy = subcategory ? SUBCATEGORY_SEO[subcategory]?.[locale] : null;
  if (subcategoryCopy) return subcategoryCopy;
  return (
    CATEGORY_SEO[categorySlug]?.[locale] ?? {
      title: locale === "zh" ? "寵物商品分類" : "Pet Product Categories",
      description:
        locale === "zh"
          ? "探索 Mofu Haven 精選日本寵物用品。"
          : "Explore curated Japanese pet supplies at Mofu Haven HK.",
    }
  );
}

export function getCategoryCanonicalPath({
  categorySlug,
  subcategory = null,
  snackSeries = null,
}: CategorySeoParams): string {
  const subSlug = subcategory
    ? categorySlug === "cats"
      ? CAT_SUBCATEGORY_SLUG[subcategory as keyof typeof CAT_SUBCATEGORY_SLUG]
      : categorySlug === "dogs"
        ? DOG_SUBCATEGORY_SLUG[subcategory as keyof typeof DOG_SUBCATEGORY_SLUG]
        : categorySlug === "small-pets"
          ? SMALL_PET_SUBCATEGORY_SLUG[subcategory as keyof typeof SMALL_PET_SUBCATEGORY_SLUG]
          : categorySlug === "lifestyle"
            ? LIFESTYLE_SUBCATEGORY_SLUG[subcategory as keyof typeof LIFESTYLE_SUBCATEGORY_SLUG]
            : null
    : null;
  const base = subSlug ? `/categories/${categorySlug}/${subSlug}` : `/categories/${categorySlug}`;
  return snackSeries ? `${base}?series=${CAT_SNACK_SERIES_SLUG[snackSeries]}` : base;
}

export function getCategoryPageMetadata(
  locale: Locale,
  params: CategorySeoParams,
): Metadata {
  const copy = getCategorySeoCopy(locale, params);
  const chineseCanonical = getCategoryCanonicalPath(params);
  const englishCanonical = `${chineseCanonical}${
    chineseCanonical.includes("?") ? "&" : "?"
  }lang=en`;
  const canonical = locale === "en" ? englishCanonical : chineseCanonical;
  const ogLocale = locale === "zh" ? "zh_HK" : "en_HK";
  const alternateLocale = locale === "zh" ? "en_HK" : "zh_HK";

  return {
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical,
      languages: {
        "zh-HK": chineseCanonical,
        "en-HK": englishCanonical,
      },
    },
    openGraph: {
      type: "website",
      locale: ogLocale,
      alternateLocale,
      url: canonical,
      title: copy.title,
      description: copy.description,
      siteName: SITE_NAME,
      images: [{ url: SHARE_IMAGE, width: 960, height: 1106, alt: copy.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: copy.title,
      description: copy.description,
      images: [SHARE_IMAGE],
    },
    robots: { index: true, follow: true },
  };
}

export const CATEGORY_SEO_SITE_NAME = SITE_NAME;
