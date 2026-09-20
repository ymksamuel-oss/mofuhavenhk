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
const SHARE_IMAGE = "/images/best-partner-plain-pack-series.png";

type SeoCopy = { title: string; description: string };
type BilingualSeoCopy = { zh: SeoCopy; en: SeoCopy; ja?: SeoCopy };

const CATEGORY_SEO: Record<string, BilingualSeoCopy> = {
  cats: {
    zh: {
      title: "\u8c93\u54aa\u5546\u54c1｜\u65e5\u672c\u8c93\u7ce7、\u7f50\u982d\u53ca\u5c0f\u98df",
      description:
        "\u63a2\u7d22 Mofu Haven \u65e5\u672c\u76f4\u9001\u8c93\u54aa\u5546\u54c1：\u8c93\u7f50\u982d、\u4e7e\u7ce7、\u51cd\u4e7e、\u8c93\u54aa\u5c0f\u98df\u53ca\u65e5\u5e38\u8b77\u7406\u7528\u54c1，\u70ba\u611b\u8c93\u6311\u9078\u5b89\u5fc3\u597d\u7269。",
    },
    en: {
      title: "Cat Products | Japanese Cat Food, Cans & Treats",
      description:
        "Shop Japanese cat food, wet cans, freeze-dried treats, cat snacks, and everyday care essentials curated for happy cats at Mofu Haven HK.",
    },
  },
  dogs: {
    zh: {
      title: "\u72d7\u72d7\u5546\u54c1｜\u65e5\u672c\u72d7\u7ce7、\u96f6\u98df\u53ca\u7528\u54c1",
      description:
        "\u63a2\u7d22 Mofu Haven \u65e5\u672c\u76f4\u9001\u72d7\u72d7\u98df\u54c1、\u71df\u990a\u96f6\u98df\u53ca\u65e5\u5e38\u7528\u54c1，\u70ba\u6bdb\u5b69\u6311\u9078\u5b89\u5fc3、\u5be6\u7528\u53c8\u9ad8\u54c1\u8cea\u7684\u597d\u7269。",
    },
    en: {
      title: "Dog Products | Japanese Dog Food, Treats & Supplies",
      description:
        "Discover Japanese dog food, nutritious treats, and everyday pet supplies thoughtfully curated for dogs at Mofu Haven HK.",
    },
  },
  "small-pets": {
    zh: {
      title: "\u5c0f\u5bf5\u7269\u7528\u54c1｜\u5154\u4ed4、\u5009\u9f20\u53ca\u5c0f\u52d5\u7269\u597d\u7269",
      description:
        "\u7cbe\u9078\u65e5\u672c\u5c0f\u5bf5\u7269\u98df\u54c1、\u71df\u990a\u4fdd\u5065\u53ca\u65e5\u5e38\u7528\u54c1，\u7167\u9867\u5154\u4ed4、\u5009\u9f20\u53ca\u5176\u4ed6\u5c0f\u52d5\u7269\u7684\u5b89\u5fc3\u751f\u6d3b。",
    },
    en: {
      title: "Small Pet Supplies | Japanese Essentials for Rabbits & More",
      description:
        "Explore Japanese food, supplements, and everyday essentials curated for rabbits, hamsters, and other small pets.",
    },
  },
  lifestyle: {
    zh: {
      title: "\u5bf5\u7269\u751f\u6d3b\u7528\u54c1｜\u65e5\u5e38\u5bb6\u5c45、\u6e05\u6f54\u53ca\u5916\u51fa\u597d\u7269",
      description:
        "\u63a2\u7d22\u98df\u5177、\u7761\u7aa9、\u6e05\u6f54\u8b77\u7406、\u5916\u51fa\u53ca\u65e5\u5e38\u914d\u4ef6，\u70ba\u6bdb\u5b69\u5efa\u7acb\u66f4\u8212\u9069\u7684\u751f\u6d3b\u7bc0\u594f。",
    },
    en: {
      title: "Pet Living Essentials | Home, Care & Travel",
      description:
        "Explore feeding, home comfort, cleaning, travel, and everyday accessories selected for easier pet routines.",
    },
  },
  snacks: {
    zh: {
      title: "\u5bf5\u7269\u5c0f\u98df｜\u65e5\u672c\u76f4\u9001\u8c93\u72d7\u96f6\u98df",
      description:
        "\u7cbe\u9078\u65e5\u672c\u76f4\u9001\u8c93\u72d7\u5c0f\u98df、\u51cd\u4e7e、\u8089\u6ce5\u53ca\u734e\u52f5\u96f6\u98df，\u70ba\u65e5\u5e38\u4e92\u52d5\u5e36\u4f86\u5b89\u5fc3\u53c8\u7f8e\u5473\u7684\u9078\u64c7。",
    },
    en: {
      title: "Pet Snacks | Japanese Treats for Cats & Dogs",
      description:
        "Browse Japanese freeze-dried snacks, puree treats, and rewarding bites selected for cats and dogs.",
    },
  },
  toys: {
    zh: {
      title: "\u5bf5\u7269\u73a9\u5177｜\u8c93\u72d7\u4e92\u52d5\u53ca\u76ca\u667a\u73a9\u5177",
      description:
        "\u63a2\u7d22\u8c93\u72d7\u4e92\u52d5、\u76ca\u667a\u53ca\u65e5\u5e38\u73a9\u5177，\u70ba\u6bdb\u5b69\u589e\u6dfb\u5b89\u5168、\u6709\u8da3\u53c8\u5145\u5be6\u7684\u73a9\u6a02\u6642\u5149。",
    },
    en: {
      title: "Pet Toys | Interactive Toys for Cats & Dogs",
      description:
        "Discover interactive and enrichment toys designed to keep cats and dogs engaged, active, and happy.",
    },
  },
  health: {
    zh: {
      title: "\u71df\u990a\u4fdd\u5065｜\u5bf5\u7269\u71df\u990a\u8207\u5065\u5eb7\u8b77\u7406",
      description:
        "\u7cbe\u9078\u5bf5\u7269\u71df\u990a\u88dc\u5145、\u8178\u80c3、\u6bdb\u9aee\u53ca\u65e5\u5e38\u5065\u5eb7\u8b77\u7406\u7528\u54c1，\u652f\u6301\u6bdb\u5b69\u6bcf\u4e00\u5929\u7684\u5b89\u5fc3\u72c0\u614b。",
    },
    en: {
      title: "Pet Supplements | Everyday Wellness & Care",
      description:
        "Shop pet supplements and everyday wellness care for digestion, coats, and balanced routines.",
    },
  },
  cleaning: {
    zh: {
      title: "\u5c45\u5bb6\u6e05\u6f54｜\u5bf5\u7269\u885b\u751f\u53ca\u65e5\u5e38\u8b77\u7406",
      description:
        "\u63a2\u7d22\u5bf5\u7269\u5c45\u5bb6\u6e05\u6f54、\u885b\u751f\u53ca\u65e5\u5e38\u8b77\u7406\u7528\u54c1，\u8b93\u6bdb\u5b69\u8207\u5bb6\u4eba\u5171\u4eab\u8212\u9069\u6574\u6f54\u7684\u751f\u6d3b\u7a7a\u9593。",
    },
    en: {
      title: "Pet Cleaning | Hygiene & Home Care Essentials",
      description:
        "Browse pet hygiene, cleaning, and home-care essentials for a comfortable, clean everyday routine.",
    },
  },
  deals: {
    zh: {
      title: "\u9650\u6642\u512a\u60e0｜\u65e5\u672c\u5bf5\u7269\u7528\u54c1\u7cbe\u9078\u512a\u60e0",
      description:
        "\u67e5\u770b Mofu Haven \u9650\u6642\u7cbe\u9078\u512a\u60e0，\u628a\u63e1\u65e5\u672c\u76f4\u9001\u5bf5\u7269\u7528\u54c1、\u98df\u54c1\u53ca\u65e5\u5e38\u597d\u7269\u7684\u5b89\u5fc3\u5165\u624b\u6a5f\u6703。",
    },
    en: {
      title: "Limited-Time Deals | Curated Japanese Pet Supplies",
      description:
        "Explore limited-time offers on curated Japanese pet food, treats, and everyday essentials at Mofu Haven HK.",
    },
  },
  bestsellers: {
    zh: {
      title: "\u71b1\u8ce3\u5546\u54c1｜\u4eba\u6c23\u65e5\u672c\u5bf5\u7269\u7528\u54c1",
      description:
        "\u63a2\u7d22 Mofu Haven \u4eba\u6c23\u71b1\u8ce3\u65e5\u672c\u5bf5\u7269\u7528\u54c1，\u5f9e\u8c93\u72d7\u98df\u54c1\u5230\u65e5\u5e38\u597d\u7269，\u5feb\u901f\u627e\u5230\u5927\u5bb6\u559c\u611b\u7684\u9078\u64c7。",
    },
    en: {
      title: "Best Sellers | Popular Japanese Pet Supplies",
      description:
        "Discover customer-favorite Japanese pet food, treats, and daily essentials at Mofu Haven HK.",
    },
  },
  outdoor: {
    zh: {
      title: "\u5916\u51fa\u7528\u54c1｜\u5bf5\u7269\u65c5\u884c\u53ca\u6563\u6b65\u597d\u7269",
      description:
        "\u7cbe\u9078\u5bf5\u7269\u65c5\u884c、\u6563\u6b65\u53ca\u5916\u51fa\u7528\u54c1，\u70ba\u8c93\u72d7\u6bcf\u6b21\u51fa\u9580\u6e96\u5099\u66f4\u5b89\u5fc3、\u8212\u9069\u7684\u65e5\u5e38\u914d\u5099。",
    },
    en: {
      title: "Outdoor Pet Gear | Travel & Walk Essentials",
      description:
        "Shop practical travel, walking, and outdoor essentials for comfortable adventures with cats and dogs.",
    },
  },
};

const SUBCATEGORY_SEO: Partial<Record<ProductSubcategory, BilingualSeoCopy>> = {
  \u8c93\u7f50\u7f50: {
    zh: {
      title: "\u8c93\u7f50\u982d\u53ca\u6fd5\u7ce7｜\u65e5\u672c\u8c93\u54aa\u4e3b\u98df\u7f50",
      description:
        "\u7cbe\u9078\u65e5\u672c\u8c93\u7f50\u982d、\u6fd5\u7ce7\u53ca\u9ad8\u6c34\u5206\u4e3b\u98df，\u70ba\u611b\u8c93\u63d0\u4f9b\u7f8e\u5473、\u65b9\u4fbf\u53c8\u5b89\u5fc3\u7684\u65e5\u5e38\u98f2\u98df\u9078\u64c7。",
    },
    en: {
      title: "Cat Cans & Wet Food | Japanese Meals for Cats",
      description:
        "Browse Japanese cat cans and wet food with satisfying, high-moisture everyday meal options for cats.",
    },
  },
  \u8c93\u4e7e\u7ce7: {
    zh: {
      title: "\u8c93\u4e7e\u7ce7\u53ca\u4e3b\u7ce7｜\u65e5\u672c\u8c93\u54aa\u65e5\u5e38\u71df\u990a",
      description:
        "\u63a2\u7d22\u65e5\u672c\u8c93\u4e7e\u7ce7\u53ca\u4e3b\u98df，\u70ba\u4e0d\u540c\u5e74\u9f61\u8207\u751f\u6d3b\u9700\u8981\u7684\u8c93\u54aa\u6311\u9078\u5747\u8861、\u5b89\u5fc3\u7684\u65e5\u5e38\u71df\u990a。",
    },
    en: {
      title: "Cat Dry Food | Japanese Everyday Nutrition",
      description:
        "Explore Japanese dry food and staple diets for balanced, dependable everyday cat nutrition.",
    },
  },
  \u51b7\u51cd\u812b\u6c34\u7cfb\u5217: {
    zh: {
      title: "\u8c93\u54aa\u51b7\u51cd\u812b\u6c34\u7cfb\u5217｜\u65e5\u672c\u51cd\u4e7e\u5c0f\u98df",
      description:
        "\u7cbe\u9078\u65e5\u672c\u8c93\u54aa\u51cd\u4e7e\u53ca\u51b7\u51cd\u812b\u6c34\u5c0f\u98df，\u4fdd\u7559\u98df\u6750\u9999\u6c23\u8207\u53e3\u611f，\u70ba\u65e5\u5e38\u734e\u52f5\u589e\u6dfb\u81ea\u7136\u7f8e\u5473。",
    },
    en: {
      title: "Freeze-Dried Cat Treats | Japanese Natural Snacks",
      description:
        "Shop Japanese freeze-dried treats selected for natural aroma, satisfying texture, and rewarding cat moments.",
    },
  },
  \u8c93\u8c93\u5c0f\u98df: {
    zh: {
      title: "\u8c93\u54aa\u5c0f\u98df｜\u65e5\u672c\u8089\u6ce5、\u51cd\u4e7e\u53ca\u96f6\u98df",
      description:
        "\u63a2\u7d22\u65e5\u672c\u8c93\u54aa\u5c0f\u98df、\u8089\u6ce5、\u8106\u9905\u53ca\u51cd\u4e7e\u96f6\u98df，\u6309\u5e74\u9f61、\u6bdb\u7403\u8b77\u7406\u53ca\u53e3\u5473\u6311\u9078\u8cbc\u5fc3\u734e\u52f5。",
    },
    en: {
      title: "Cat Treats | Japanese Purees, Crunchy Bites & Snacks",
      description:
        "Browse Japanese cat purees, crunchy treats, and freeze-dried snacks for tasty, caring everyday rewards.",
    },
  },
  \u8c93\u7802\u53ca\u8c93\u7802\u76c6: {
    zh: {
      title: "\u8c93\u7802\u53ca\u8c93\u7802\u76c6｜\u611b\u8c93\u65e5\u5e38\u885b\u751f\u7528\u54c1",
      description: "\u63a2\u7d22\u8c93\u7802、\u8c93\u7802\u76c6\u53ca\u65e5\u5e38\u885b\u751f\u7528\u54c1，\u70ba\u611b\u8c93\u6e96\u5099\u8212\u9069、\u6574\u6f54\u7684\u5c45\u5bb6\u7a7a\u9593。",
    },
    en: {
      title: "Cat Litter & Litter Boxes | Everyday Cat Hygiene",
      description: "Explore cat litter, litter boxes, and hygiene essentials for a clean, comfortable feline home.",
    },
  },
  \u8c93\u54aa\u73a9\u5177\u53ca\u6500\u722c\u8a2d\u65bd: {
    zh: {
      title: "\u8c93\u54aa\u73a9\u5177\u53ca\u6500\u722c\u8a2d\u65bd｜\u65e5\u5e38\u73a9\u6a02\u8207\u63a2\u7d22",
      description: "\u63a2\u7d22\u8c93\u54aa\u73a9\u5177、\u6293\u73a9\u53ca\u6500\u722c\u8a2d\u65bd，\u70ba\u611b\u8c93\u589e\u6dfb\u5b89\u5168、\u6709\u8da3\u7684\u65e5\u5e38\u6d3b\u52d5。",
    },
    en: {
      title: "Cat Toys & Climbing Furniture | Play and Enrichment",
      description: "Discover cat toys and climbing furniture for safe, engaging everyday feline enrichment.",
    },
  },
  \u6295\u85e5\u9935\u85e5\u5c08\u7528\u5c0f\u98df: {
    zh: {
      title: "\u6295\u85e5\u9935\u85e5\u5c08\u7528\u5c0f\u98df｜\u5bf5\u7269\u7528\u85e5\u597d\u5e6b\u624b",
      description:
        "\u7cbe\u9078\u65b9\u4fbf\u5305\u88f9\u85e5\u7269、\u5bb9\u6613\u9935\u98df\u7684\u5bf5\u7269\u5c08\u7528\u5c0f\u98df，\u5354\u52a9\u8c93\u72d7\u65e5\u5e38\u670d\u85e5\u6642\u66f4\u5b89\u5fc3\u9806\u66a2。",
    },
    en: {
      title: "Pill & Medication Treats | Easier Pet Dosing",
      description:
        "Discover pet-friendly medication treats designed to make everyday dosing easier for cats and dogs.",
    },
  },
  \u72d7\u72d7\u98df\u54c1: {
    zh: {
      title: "\u72d7\u72d7\u98df\u54c1｜\u65e5\u672c\u72d7\u7ce7\u53ca\u65e5\u5e38\u71df\u990a",
      description:
        "\u63a2\u7d22\u65e5\u672c\u72d7\u72d7\u98df\u54c1\u53ca\u65e5\u5e38\u71df\u990a\u9078\u64c7，\u70ba\u4e0d\u540c\u9ad4\u578b\u8207\u751f\u6d3b\u9700\u8981\u7684\u72d7\u72d7\u63d0\u4f9b\u5b89\u5fc3\u7f8e\u5473。",
    },
    en: {
      title: "Dog Food | Japanese Everyday Nutrition for Dogs",
      description:
        "Explore Japanese dog food and everyday nutrition selected for dependable, delicious routines.",
    },
  },
  \u72d7\u72d7\u4e7e\u7ce7: {
    zh: {
      title: "\u72d7\u72d7\u4e7e\u7ce7｜\u65e5\u672c\u72d7\u72d7\u4e3b\u7ce7",
      description: "\u7cbe\u9078\u65e5\u672c\u72d7\u72d7\u4e7e\u7ce7\u53ca\u65e5\u5e38\u4e3b\u98df，\u70ba\u72d7\u72d7\u63d0\u4f9b\u5b89\u5fc3、\u5747\u8861\u7684\u65e5\u5e38\u71df\u990a\u9078\u64c7。",
    },
    en: {
      title: "Dog Dry Food | Japanese Staple Diets",
      description: "Shop Japanese dog dry food and staple diets selected for balanced everyday nutrition.",
    },
  },
  \u72d7\u72d7\u7f50\u982d\u53ca\u6fd5\u7ce7: {
    zh: {
      title: "\u72d7\u72d7\u7f50\u982d\u53ca\u6fd5\u7ce7｜\u65e5\u672c\u72d7\u72d7\u6fd5\u98df",
      description: "\u63a2\u7d22\u65e5\u672c\u72d7\u72d7\u7f50\u982d、\u6fd5\u7ce7\u53ca\u6fc3\u6e6f\u914d\u65b9，\u70ba\u65e5\u5e38\u9935\u98df\u589e\u6dfb\u5b89\u5fc3\u7f8e\u5473。",
    },
    en: {
      title: "Dog Cans & Wet Food | Japanese Wet Meals",
      description: "Browse Japanese dog cans, wet food, and soup recipes for delicious everyday feeding.",
    },
  },
  \u72d7\u72d7\u51b7\u51cd\u812b\u6c34\u98df\u54c1: {
    zh: {
      title: "\u72d7\u72d7\u51cd\u4e7e\u53ca\u812b\u6c34\u98df\u54c1｜\u65e5\u672c\u81ea\u7136\u597d\u7269",
      description: "\u63a2\u7d22\u65e5\u672c\u72d7\u72d7\u51cd\u4e7e\u53ca\u812b\u6c34\u98df\u54c1，\u4fdd\u7559\u98df\u6750\u98a8\u5473，\u70ba\u65e5\u5e38\u589e\u6dfb\u81ea\u7136\u53e3\u611f。",
    },
    en: {
      title: "Freeze-Dried Dog Food | Japanese Natural Essentials",
      description: "Explore Japanese freeze-dried and dehydrated dog food selected for natural everyday feeding.",
    },
  },
  \u72d7\u72d7\u5c0f\u98df: {
    zh: {
      title: "\u72d7\u72d7\u5c0f\u98df｜\u65e5\u672c\u734e\u52f5\u96f6\u98df\u53ca\u8089\u689d",
      description:
        "\u7cbe\u9078\u65e5\u672c\u72d7\u72d7\u96f6\u98df、\u8089\u689d\u53ca\u734e\u52f5\u5c0f\u98df，\u70ba\u8a13\u7df4、\u4e92\u52d5\u548c\u65e5\u5e38\u966a\u4f34\u5e36\u4f86\u7f8e\u5473\u53c8\u5b89\u5fc3\u7684\u9078\u64c7。",
    },
    en: {
      title: "Dog Treats | Japanese Reward Snacks & Jerky",
      description:
        "Shop Japanese dog treats, jerky, and reward snacks for training, bonding, and everyday enjoyment.",
    },
  },
  \u72d7\u72d7\u5ec1\u6240\u53ca\u5c3f\u588a: {
    zh: {
      title: "\u72d7\u72d7\u5ec1\u6240\u53ca\u5c3f\u588a｜\u65e5\u5e38\u5982\u5ec1\u7528\u54c1",
      description: "\u63a2\u7d22\u72d7\u72d7\u5ec1\u6240、\u5c3f\u588a\u53ca\u65e5\u5e38\u6e05\u6f54\u7528\u54c1，\u4ee4\u6bdb\u5b69\u5c45\u5bb6\u751f\u6d3b\u66f4\u8212\u9069\u6574\u6f54。",
    },
    en: {
      title: "Dog Toilets & Training Pads | Everyday Hygiene",
      description: "Discover dog toilets, training pads, and everyday hygiene supplies for a clean home routine.",
    },
  },
  \u72d7\u72d7\u73a9\u5177: {
    zh: {
      title: "\u72d7\u72d7\u73a9\u5177｜\u4e92\u52d5\u53ca\u65e5\u5e38\u73a9\u6a02",
      description: "\u63a2\u7d22\u72d7\u72d7\u73a9\u5177\u53ca\u4e92\u52d5\u7528\u54c1，\u70ba\u6bdb\u5b69\u589e\u6dfb\u5b89\u5168、\u6709\u8da3\u7684\u65e5\u5e38\u6d3b\u52d5。",
    },
    en: {
      title: "Dog Toys | Interactive Everyday Play",
      description: "Explore dog toys and interactive play essentials for safe, engaging everyday activity.",
    },
  },
};

const SNACK_SERIES_SEO: Record<CatSnackSeries, BilingualSeoCopy> = {
  \u7121\u6dfb\u52a0\u5929\u7136\u7cfb\u5217: {
    zh: {
      title: "\u7121\u6dfb\u52a0\u5929\u7136\u8c93\u54aa\u5c0f\u98df｜\u65e5\u672c\u81ea\u7136\u96f6\u98df",
      description:
        "\u63a2\u7d22\u7121\u6dfb\u52a0\u5929\u7136\u7cfb\u5217\u65e5\u672c\u8c93\u54aa\u5c0f\u98df，\u70ba\u65e5\u5e38\u734e\u52f5\u6311\u9078\u66f4\u7c21\u55ae、\u8cbc\u5fc3\u53c8\u7f8e\u5473\u7684\u9078\u64c7。",
    },
    en: {
      title: "No-Additive Natural Cat Treats | Japanese Snacks",
      description:
        "Browse Japanese no-additive natural cat treats selected for simple, caring everyday rewards.",
    },
  },
  \u8001\u8c93\u96f6\u98df: {
    zh: {
      title: "\u8001\u8c93\u96f6\u98df｜\u65e5\u672c\u719f\u9f61\u8c93\u54aa\u5c0f\u98df",
      description:
        "\u7cbe\u9078\u9069\u5408\u719f\u9f61\u8c93\u65e5\u5e38\u4eab\u7528\u7684\u65e5\u672c\u8c93\u54aa\u5c0f\u98df，\u7167\u9867\u53e3\u611f、\u9999\u6c23\u53ca\u8f15\u9b06\u9032\u98df\u9700\u8981。",
    },
    en: {
      title: "Senior Cat Treats | Japanese Snacks for Mature Cats",
      description:
        "Discover Japanese treats selected for mature cats, with comforting flavours and easy everyday enjoyment.",
    },
  },
  \u53bb\u6bdb\u7403\u914d\u65b9: {
    zh: {
      title: "\u53bb\u6bdb\u7403\u914d\u65b9\u8c93\u54aa\u5c0f\u98df｜\u65e5\u672c\u6bdb\u7403\u8b77\u7406\u96f6\u98df",
      description:
        "\u63a2\u7d22\u65e5\u672c\u53bb\u6bdb\u7403\u914d\u65b9\u8c93\u54aa\u5c0f\u98df，\u70ba\u63db\u6bdb\u5b63\u8207\u65e5\u5e38\u6bdb\u7403\u8b77\u7406\u63d0\u4f9b\u8cbc\u5fc3\u7f8e\u5473\u9078\u64c7。",
    },
    en: {
      title: "Hairball-Care Cat Treats | Japanese Supportive Snacks",
      description:
        "Browse Japanese hairball-care cat treats for tasty, thoughtful support during shedding season and beyond.",
    },
  },
  bb\u8c93\u96f6\u98df: {
    zh: {
      title: "\u5e7c\u8c93\u96f6\u98df｜\u65e5\u672c BB \u8c93\u5c0f\u98df",
      description:
        "\u7cbe\u9078\u9069\u5408\u5e7c\u8c93\u6210\u9577\u671f\u4eab\u7528\u7684\u65e5\u672c\u5c0f\u98df，\u70ba\u63a2\u7d22\u671f\u7684\u5473\u857e\u8207\u65e5\u5e38\u4e92\u52d5\u5e36\u4f86\u5b89\u5fc3\u734e\u52f5。",
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
  if (snackSeries) return SNACK_SERIES_SEO[snackSeries][locale === "ja" ? "zh" : locale];
  const subcategoryCopy = subcategory ? SUBCATEGORY_SEO[subcategory]?.[locale] : null;
  if (subcategoryCopy) return subcategoryCopy;
  return (
    CATEGORY_SEO[categorySlug]?.[locale] ?? {
      title: locale === "zh" ? "\u5bf5\u7269\u5546\u54c1\u5206\u985e" : "Pet Product Categories",
      description:
        locale === "zh"
          ? "\u63a2\u7d22 Mofu Haven \u7cbe\u9078\u65e5\u672c\u5bf5\u7269\u7528\u54c1。"
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
      images: [{ url: SHARE_IMAGE, width: 1194, height: 671, alt: copy.title }],
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
