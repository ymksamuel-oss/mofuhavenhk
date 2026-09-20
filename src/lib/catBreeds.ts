export type CatCoatFilter = "all" | "short" | "long";

export type CatCoatType = "short" | "long";

export type CatBreedPattern = {
  pattern_id: string;
  name_zh: string;
  description: string;
  image_url: string;
};

export type CatBreedColor = {
  color_id: string;
  name_zh: string;
  description: string;
};

export type CatBreedMediaImage = {
  tag: string;
  description: string;
  src: string;
  alt: string;
};

/** Optional rich profile (Ragdoll, British Shorthair, …). */
export type CatBreedInfo = {
  breed_id: string;
  name_en: string;
  name_zh_hk: string;
  aliases: string[];
  origin: {
    country: string;
    state?: string;
    decade?: string;
    creator?: string;
    history_overview?: string;
  };
  physical_characteristics: {
    eye_color: string;
    size_category: string;
    weight_kg: {
      male: { min: number; max: number };
      female: { min: number; max: number };
    };
    maturation_years?: string;
    coat: {
      length: string;
      texture: string;
      undercoat: string;
    };
  };
  patterns: CatBreedPattern[];
  colors: CatBreedColor[];
  personality_traits: string[];
  care_and_health: {
    environment: string;
    genetic_risks: string[];
    digestive_health: string;
    diet_management: string;
    grooming: string;
  };
  media_assets: {
    status: string;
    instruction_for_cursor?: string;
    images: CatBreedMediaImage[];
  };
};

export type CatBreed = {
  id: string;
  slug: string;
  name: string;
  /** English display name */
  nameEn: string;
  coatType: CatCoatType;
  coatLabel: string;
  coatLabelEn: string;
  shortDescription: string;
  shortDescriptionEn: string;
  imageUrl: string;
  origin: string;
  originEn: string;
  lifespan: string;
  lifespanEn: string;
  weight: string;
  weightEn: string;
  personality: string[];
  personalityEn: string[];
  careTips: string[];
  careTipsEn: string[];
  nutritionAdvice: string[];
  nutritionAdviceEn: string[];
  fullDescription: string;
  fullDescriptionEn: string;
  /** Optional extended profile shown on the detail page. */
  breedInfo?: CatBreedInfo;
};

/** Shared Unsplash fallback when a breed portrait fails to load. */
export const CAT_BREED_IMAGE_FALLBACK =
  "https://images.unsplash.com/photo-1574231164645-d6f0e8553590?q=80&w=600&auto=format&fit=crop";

/** American Shorthair rich profile for `/cat-breeds/american-shorthair`. */
export const AMERICAN_SHORTHAIR_BREED_INFO: CatBreedInfo = {
  breed_id: "american_shorthair",
  name_en: "American Shorthair",
  name_zh_hk: "\u7f8e\u570b\u77ed\u6bdb\u8c93",
  aliases: ["\u7f8e\u77ed", "\u864e\u6591\u7f8e\u77ed"],
  origin: {
    country: "\u7f8e\u570b",
    history_overview:
      "\u7956\u5148\u96a8\u6b50\u6d32\u79fb\u6c11\u8239\u96bb\u4f86\u5230\u5317\u7f8e，\u7d93\u904e\u9577\u671f\u81ea\u7136\u9078\u80b2\u8207\u54c1\u7a2e\u6539\u826f，\u6210\u70ba\u9ad4\u683c\u5f37\u5065、\u9069\u61c9\u529b\u6975\u9ad8\u7684\u7d93\u5178\u5bb6\u8c93。\u4ee5\u9280\u864e\u6591\u8207\u5404\u8272\u864e\u6591\u805e\u540d，\u662f\u7f8e\u570b\u5bb6\u5ead\u6700\u53d7\u6b61\u8fce\u7684\u77ed\u6bdb\u54c1\u7a2e\u4e4b\u4e00。",
  },
  physical_characteristics: {
    eye_color: "\u91d1\u8272、\u7da0\u8272、\u699b\u679c\u8272（\u4f9d\u6bdb\u8272\u800c\u7570）",
    size_category: "\u4e2d\u81f3\u5927\u578b、\u808c\u8089\u767c\u9054\u7684\u77e9\u5f62\u9ad4\u578b",
    weight_kg: {
      male: { min: 5.0, max: 7.5 },
      female: { min: 3.5, max: 5.5 },
    },
    maturation_years: "\u7d04 3-4 \u5e74",
    coat: {
      length: "Short（\u77ed\u6bdb）",
      texture: "\u786c\u5bc6、\u5bcc\u5149\u6fa4",
      undercoat: "\u9069\u4e2d\u5e95\u6bdb，\u63db\u6bdb\u5b63\u8f03\u660e\u986f",
    },
  },
  patterns: [
    {
      pattern_id: "classic_tabby",
      name_zh: "\u7d93\u5178\u864e\u6591 (Classic / Blotched Tabby)",
      description: "\u5074\u8eab\u53ef\u898b\u65cb\u6e26／\u725b\u773c\u7d0b，\u984d\u982d\u5e38\u6709『M』\u5b57\u6591\u7d0b",
      image_url: "",
    },
    {
      pattern_id: "silver_tabby",
      name_zh: "\u9280\u864e\u6591 (Silver Tabby)",
      description: "\u9280\u767d\u5e95\u6bdb\u914d\u6e05\u6670\u9ed1\u8272\u6591\u7d0b，\u662f\u7f8e\u77ed\u6700\u4ee3\u8868\u6027\u82b1\u8272\u4e4b\u4e00",
      image_url: "",
    },
    {
      pattern_id: "brown_tabby",
      name_zh: "\u68d5\u8272\u864e\u6591 (Brown Tabby)",
      description: "\u6696\u68d5\u5e95\u8272\u8207\u6df1\u8272\u689d\u7d0b，\u91ce\u5916\u611f\u5f37、\u8fa8\u8b58\u5ea6\u9ad8",
      image_url: "",
    },
    {
      pattern_id: "solid_and_bicolor",
      name_zh: "\u7d14\u8272／\u96d9\u8272",
      description: "\u4ea6\u6709\u7d14\u9ed1、\u7d14\u767d、\u85cd\u767d\u7b49，\u4f46\u864e\u6591\u4ecd\u6700\u5e38\u898b",
      image_url: "",
    },
  ],
  colors: [
    {
      color_id: "silver_tabby",
      name_zh: "\u9280\u864e\u6591",
      description: "\u7d93\u5178\u4ee3\u8868\u8272",
    },
    {
      color_id: "brown_tabby",
      name_zh: "\u68d5\u8272\u864e\u6591",
      description: "\u6eab\u6696\u91ce\u5916\u611f",
    },
    {
      color_id: "red_tabby",
      name_zh: "\u7d05\u8272\u864e\u6591",
      description: "\u6a58\u7d05\u689d\u7d0b",
    },
    {
      color_id: "bicolor",
      name_zh: "\u96d9\u8272",
      description: "\u767d\u5e95\u914d\u864e\u6591\u6216\u5176\u4ed6\u8272\u584a",
    },
  ],
  personality_traits: [
    "\u8070\u660e\u6d3b\u6f51，\u597d\u5947\u5fc3\u5f37，\u559c\u6b61\u89c0\u5bdf\u5bb6\u4e2d\u52d5\u975c",
    "\u5c0d\u4eba\u53cb\u5584，\u901a\u5e38\u80fd\u8207\u5152\u7ae5\u53ca\u5176\u4ed6\u5bf5\u7269\u548c\u7766\u76f8\u8655",
    "\u9069\u61c9\u529b\u5f37，\u9069\u5408\u4f5c\u70ba\u5fd9\u788c\u90fd\u5e02\u5bb6\u5ead\u7684\u966a\u4f34\u8c93",
    "\u73a9\u800d\u6642\u7cbe\u529b\u5145\u6c9b，\u5e73\u6642\u4e5f\u80fd\u5b89\u975c\u5730\u966a\u4f34\u5728\u65c1",
  ],
  care_and_health: {
    environment:
      "\u9700\u8981\u8db3\u5920\u6d3b\u52d5\u7a7a\u9593\u8207\u8df3\u53f0／\u8c93\u6293\u677f；\u6bcf\u5929\u4e92\u52d5\u904a\u6232\u6709\u52a9\u91cb\u653e\u7cbe\u529b",
    genetic_risks: [
      "\u80a5\u539a\u578b\u5fc3\u808c\u75c5 (HCM)",
      "\u591a\u56ca\u6027\u814e\u81df\u75c5 (PKD，\u90e8\u5206\u8840\u7d71\u9700\u6ce8\u610f)",
    ],
    digestive_health: "\u6574\u9ad4\u8178\u80c3\u7a69\u5b9a，\u63db\u7ce7\u4ecd\u5efa\u8b70\u6f38\u9032\u904e\u6e21",
    diet_management:
      "\u808c\u8089\u767c\u9054\u9700\u512a\u8cea\u52d5\u7269\u86cb\u767d；\u6210\u8c93\u9700\u5b9a\u6642\u5b9a\u91cf，\u907f\u514d\u56e0\u6d3b\u52d5\u91cf\u4e0b\u964d\u800c\u767c\u80d6",
    grooming:
      "\u77ed\u6bdb\u6613\u6253\u7406，\u5e73\u6642\u6bcf\u9031\u68b3\u6bdb 1 \u6b21；\u63db\u6bdb\u5b63\u53ef\u589e\u81f3 2-3 \u6b21，\u6e1b\u5c11\u6bdb\u7403",
  },
  media_assets: {
    status: "localized_gallery_sync",
    instruction_for_cursor:
      "\u7f8e\u77ed\u5716\u5eab\u5df2\u672c\u5730\u5316：\u7d93\u5178\u864e\u6591 / \u9280\u864e\u6591 / \u6236\u5916 / \u5c45\u5bb6\u65e5\u5e38。",
    images: [
      {
        tag: "hero_main",
        description: "\u68d5\u8272\u864e\u6591\u7f8e\u570b\u77ed\u6bdb\u8c93\u6236\u5916\u7279\u5beb",
        src: "/images/cat-breeds/american-shorthair.jpg",
        alt: "\u68d5\u8272\u864e\u6591\u7f8e\u570b\u77ed\u6bdb\u8c93",
      },
      {
        tag: "gallery_item_1",
        description: "\u6a19\u8a8c\u6027\u9280\u864e\u6591（\u65cb\u6e26\u7d93\u5178\u7d0b）",
        src: "/images/cat-breeds/american-shorthair-silver.jpg",
        alt: "\u9280\u864e\u6591\u7f8e\u570b\u77ed\u6bdb\u8c93",
      },
      {
        tag: "gallery_item_2",
        description: "\u68d5\u8272\u864e\u6591\u8207\u767d\u6591\u8fd1\u8ddd\u96e2\u8096\u50cf",
        src: "/images/cat-breeds/american-shorthair-tabby.jpg",
        alt: "\u68d5\u8272\u864e\u6591\u7f8e\u570b\u77ed\u6bdb\u8c93\u7279\u5beb",
      },
      {
        tag: "gallery_item_3",
        description: "\u6236\u5916\u63a2\u7d22\u4e2d\u7684\u7f8e\u77ed",
        src: "/images/cat-breeds/american-shorthair-outdoor.jpg",
        alt: "\u6236\u5916\u7684\u7f8e\u570b\u77ed\u6bdb\u8c93",
      },
      {
        tag: "gallery_item_4",
        description: "\u5c45\u5bb6\u4f11\u606f\u7684\u9280\u864e\u6591\u7f8e\u77ed",
        src: "/images/cat-breeds/american-shorthair-cozy.jpg",
        alt: "\u5ba4\u5167\u4f11\u606f\u7684\u7f8e\u570b\u77ed\u6bdb\u8c93",
      },
    ],
  },
};

/** British Shorthair rich profile for `/cat-breeds/british-shorthair`. */
export const BRITISH_SHORTHAIR_BREED_INFO: CatBreedInfo = {
  breed_id: "british_shorthair",
  name_en: "British Shorthair",
  name_zh_hk: "\u82f1\u570b\u77ed\u6bdb\u8c93",
  aliases: ["\u82f1\u77ed", "\u85cd\u8c93"],
  origin: {
    country: "\u82f1\u570b",
    history_overview:
      "\u64c1\u6709\u60a0\u4e45\u6b77\u53f2，\u7531\u53e4\u4ee3\u7f85\u99ac\u8c93\u5f15\u5165\u82f1\u570b\u672c\u571f\u8c93\u6539\u826f\u800c\u6210，\u662f\u6b50\u6d32\u6700\u53e4\u8001\u7684\u8c93\u54c1\u7a2e\u4e4b\u4e00。",
  },
  physical_characteristics: {
    eye_color: "\u53e4\u9285\u8272 / \u6a58\u8272、\u85cd\u8272、\u7da0\u8272、\u6df1\u91d1\u8272",
    size_category: "Cobby（\u5713\u6efe\u6efe\u7684\u81c9\u9f90、\u539a\u5be6\u5713\u6f64\u7684\u4e94\u77ed\u8eab\u6750、\u9aa8\u67b6\u624e\u5be6）",
    weight_kg: {
      male: { min: 5.0, max: 8.0 },
      female: { min: 4.0, max: 6.0 },
    },
    maturation_years: "\u7d04 3 \u5e74",
    coat: {
      length: "Short（\u77ed\u6bdb）",
      texture: "\u539a\u5bc6\u7d68\u6bdb\u611f",
      undercoat: "\u96d9\u5c64\u77ed\u6bdb",
    },
  },
  patterns: [
    {
      pattern_id: "british_blue",
      name_zh: "\u7d93\u5178\u85cd\u7070\u8272 (British Blue)",
      description: "\u6700\u6a19\u8a8c\u6027\u55ae\u8272",
      image_url: "",
    },
    {
      pattern_id: "golden_shade",
      name_zh: "\u91d1\u6f38\u5c64 (Golden Shaded / NY12\u7b49)",
      description: "\u8fd1\u5e74\u6975\u53d7\u6b61\u8fce\u7684\u6eab\u6696\u91d1\u8272\u8abf，\u6bdb\u5c16\u5e36\u9ed1\u8272\u6688\u67d3",
      image_url: "",
    },
    {
      pattern_id: "silver_tabby",
      name_zh: "\u9280\u864e\u6591 (Silver Tabby)",
      description: "\u5e36\u6709\u6e05\u6670\u6591\u7d0b\u8207\u7da0\u8272/\u699b\u679c\u8272\u773c\u775b",
      image_url: "",
    },
    {
      pattern_id: "bicolor",
      name_zh: "\u96d9\u8272 (Bicolor)",
      description: "\u767d\u5e95\u914d\u642d\u85cd\u8272、\u7070\u8272\u6216\u864e\u6591\u584a",
      image_url: "",
    },
  ],
  colors: [
    {
      color_id: "british_blue",
      name_zh: "\u7d93\u5178\u85cd\u7070\u8272",
      description: "\u6700\u6a19\u8a8c\u6027\u55ae\u8272",
    },
    {
      color_id: "golden_shade",
      name_zh: "\u91d1\u6f38\u5c64",
      description: "\u6eab\u6696\u91d1\u8272\u8abf，\u6bdb\u5c16\u5e36\u9ed1\u8272\u6688\u67d3",
    },
    {
      color_id: "silver_tabby",
      name_zh: "\u9280\u864e\u6591",
      description: "\u6e05\u6670\u6591\u7d0b，\u7da0/\u699b\u679c\u8272\u773c\u775b",
    },
    {
      color_id: "bicolor",
      name_zh: "\u96d9\u8272",
      description: "\u767d\u5e95\u914d\u642d\u85cd\u8272、\u7070\u8272\u6216\u864e\u6591\u584a",
    },
  ],
  personality_traits: [
    "\u6027\u683c\u6eab\u548c、\u7406\u6027、\u813e\u6c23\u6975\u597d",
    "\u6210\u719f\u7a69\u91cd，\u4e0d\u611b\u80e1\u9b27\u6216\u904e\u5ea6\u5435\u9b27",
    "\u7368\u7acb\u6027\u9ad8，\u975e\u5e38\u9069\u5408\u5fd9\u788c\u7684\u90fd\u5e02\u5bb6\u5ead\u8207\u4e0a\u73ed\u65cf",
    "\u5c0d\u4eba\u53cb\u5584，\u4f46\u901a\u5e38\u4e0d\u5c6c\u65bc\u9ecf\u4eba\u7cbe\u578b\u5225，\u559c\u6b61\u975c\u975c\u966a\u4f34\u5728\u65c1",
  ],
  care_and_health: {
    environment: "\u9069\u5408\u5fd9\u788c\u7684\u90fd\u5e02\u5bb6\u5ead\u8207\u4e0a\u73ed\u65cf；\u559c\u6b61\u975c\u975c\u966a\u4f34\u5728\u65c1",
    genetic_risks: [
      "\u80a5\u539a\u578b\u5fc3\u808c\u75c5 (HCM)",
      "\u591a\u56ca\u6027\u814e\u81df\u75c5 (PKD，\u5efa\u8b70\u8cfc\u8cb7\u524d\u78ba\u8a8d\u7236\u6bcd\u57fa\u56e0\u6aa2\u6e2c)",
    ],
    digestive_health: "\u5713\u9aa8\u67b6\u9ad4\u8cea，\u7d55\u80b2\u5f8c\u9700\u7279\u5225\u7559\u610f\u71b1\u91cf\u8207\u9ad4\u91cd\u7ba1\u7406",
    diet_management:
      "\u7d55\u80b2\u5f8c\u6975\u5bb9\u6613\u767c\u80d6，\u4e14\u5c6c\u65bc\u5713\u9aa8\u67b6\u9ad4\u8cea，\u5fc5\u9808\u56b4\u683c\u5b9a\u6642\u5b9a\u91cf\u63a7\u5236\u71b1\u91cf，\u4e26\u63d0\u4f9b\u8db3\u5920\u7684\u6d3b\u6c34\u8207\u6eab\u548c\u904b\u52d5",
    grooming:
      "\u96d6\u7136\u662f\u77ed\u6bdb\u8c93，\u4f46\u56e0\u5e95\u6bdb\u539a\u5bc6，\u5e73\u6642\u6bcf\u9031\u9700\u68b3\u6bdb 1-2 \u6b21；\u63db\u6bdb\u5b63\u6642\u6389\u6bdb\u91cf\u5927，\u9700\u589e\u52a0\u68b3\u6bdb\u983b\u7387\u4ee5\u9632\u6bdb\u7403\u75c7",
  },
  media_assets: {
    status: "localized_gallery_sync",
    instruction_for_cursor:
      "\u82f1\u77ed\u5716\u5eab\u5df2\u672c\u5730\u5316：\u91d1\u6f38\u5c64 / \u85cd\u8c93 / \u9280\u864e\u6591 / \u65e5\u5e38，\u8def\u5f91 /images/cat-breeds/*.jpg",
    images: [
      {
        tag: "hero_main",
        description: "\u91d1\u6f38\u5c64 (Golden Shaded)",
        src: "/images/cat-breeds/british-shorthair-golden.jpg",
        alt: "\u91d1\u6f38\u5c64\u82f1\u570b\u77ed\u6bdb\u8c93",
      },
      {
        tag: "gallery_item_1",
        description: "\u7d93\u5178\u85cd\u8c93 (British Blue)",
        src: "/images/cat-breeds/british-shorthair-blue.jpg",
        alt: "\u7d93\u5178\u85cd\u7070\u8272\u82f1\u570b\u77ed\u6bdb\u8c93",
      },
      {
        tag: "gallery_item_2",
        description: "\u9280\u864e\u6591 (Silver Tabby)",
        src: "/images/cat-breeds/british-shorthair-silver.jpg",
        alt: "\u9280\u864e\u6591\u82f1\u570b\u77ed\u6bdb\u8c93",
      },
      {
        tag: "gallery_item_3",
        description: "\u65e5\u5e38\u6175\u61f6/\u5c45\u5bb6\u60c5\u5883",
        src: "/images/cat-breeds/british-shorthair-cozy.jpg",
        alt: "\u5ba4\u5167\u4f11\u606f\u7684\u82f1\u570b\u77ed\u6bdb\u8c93",
      },
    ],
  },
};


/** Ragdoll rich profile for `/cat-breeds/ragdoll`. */
export const RAGDOLL_BREED_INFO: CatBreedInfo = {
  breed_id: "ragdoll",
  name_en: "Ragdoll",
  name_zh_hk: "\u5e03\u5076\u8c93",
  aliases: ["\u4ed9\u5973\u8c93", "Puppy Cat", "\u68c9\u82b1\u5e03\u5a03\u5a03\u8c93"],
  origin: {
    country: "United States",
    state: "California",
    decade: "1960s",
    creator: "Ann Baker",
  },
  physical_characteristics: {
    eye_color: "Blue (\u5fc5\u70ba\u85cd\u773c\u775b)",
    size_category: "Large (\u5927\u578b\u8c93)",
    weight_kg: {
      male: { min: 6.0, max: 9.0 },
      female: { min: 4.5, max: 7.0 },
    },
    maturation_years: "3-4 \u5e74（\u665a\u719f\u578b）",
    coat: {
      length: "Medium-long (\u4e2d\u9577\u6bdb)",
      texture: "Silky (\u7d72\u6ed1)",
      undercoat: "Sparse (\u5e95\u6bdb\u7a00\u758f)",
    },
  },
  patterns: [
    {
      pattern_id: "bicolor",
      name_zh: "\u96d9\u8272",
      description: "\u81c9\u90e8\u6709\u5c0d\u7a31\u5012V\u5b57\u767d\u6591，\u4e0b\u5df4、\u80f8\u8179\u8207\u56db\u80a2\u70ba\u767d\u8272",
      image_url: "/images/cat-breeds/ragdoll.jpg",
    },
    {
      pattern_id: "mitted",
      name_zh: "\u624b\u5957\u8272",
      description: "\u524d\u80a2\u767d\u8272\u624b\u5957，\u5f8c\u80a2\u767d\u8272\u9ad8\u7b52\u9774，\u4e0b\u5df4\u81f3\u8179\u90e8\u6709\u767d\u8272\u5e36",
      image_url:
        "https://cdn2.thecatapi.com/images/HDxfaNlLj.jpg",
    },
    {
      pattern_id: "colorpoint",
      name_zh: "\u91cd\u9ede\u8272",
      description: "\u9762\u90e8、\u8033\u6735、\u56db\u80a2\u8207\u5c3e\u5df4\u70ba\u6df1\u8272，\u8ec0\u5e79\u70ba\u6dfa\u8272",
      image_url:
        "https://cdn2.thecatapi.com/images/nqS9tUT3i.jpg",
    },
  ],
  colors: [
    { color_id: "seal", name_zh: "\u6d77\u8c79\u8272", description: "\u7d93\u5178\u6df1\u8910" },
    { color_id: "blue", name_zh: "\u85cd\u8272", description: "\u7070\u8272" },
    { color_id: "chocolate", name_zh: "\u5de7\u514b\u529b\u8272", description: "\u6dfa\u8910\u8272" },
    { color_id: "lilac", name_zh: "\u4e01\u9999\u8272", description: "\u6de1\u7d2b\u7070\u8272" },
    { color_id: "red", name_zh: "\u7d05\u8272", description: "\u6696\u6a58\u7d05" },
    { color_id: "cream", name_zh: "\u5976\u6cb9\u8272", description: "\u6dfa\u5976\u6cb9\u8272" },
    { color_id: "lynx", name_zh: "\u5c71\u8c93\u7d0b", description: "\u5e36\u6709\u864e\u6591\u7d0b\u8def" },
  ],
  personality_traits: [
    "\u6975\u5ea6\u9ecf\u4eba（Puppy Cat \u6027\u683c）",
    "\u813e\u6c23\u6eab\u548c，\u5c0d\u5152\u7ae5\u8207\u5bf5\u7269\u5fcd\u8010\u529b\u9ad8",
    "\u53eb\u8072\u8f15\u67d4\u5b89\u975c",
    "\u9ad8\u60c5\u5546，\u5584\u65bc\u966a\u4f34\u8207\u5bdf\u89ba\u60c5\u7dd2",
  ],
  care_and_health: {
    environment: "100% \u5ba4\u5167\u98fc\u990a（\u9632\u79a6\u529b\u4f4e，\u5207\u52ff\u653e\u990a）",
    genetic_risks: ["\u80a5\u539a\u578b\u5fc3\u808c\u75c5 (HCM)", "\u591a\u56ca\u6027\u814e\u81df\u75c5 (PKD)"],
    digestive_health:
      "\u73bb\u7483\u80c3（\u8178\u80c3\u654f\u611f），\u63db\u7ce7\u9700 7-10 \u5929\u904e\u6e21，\u5efa\u8b70\u88dc\u5145\u76ca\u751f\u83cc",
    diet_management: "\u5b9a\u6642\u5b9a\u91cf\u9935\u98df，\u9810\u9632\u80a5\u80d6",
    grooming: "\u6bcf\u9031 2-3 \u6b21\u68b3\u6bdb，\u5b9a\u671f\u4fee\u526a\u81c0\u90e8\u96dc\u6bdb",
  },
  media_assets: {
    status: "local_ready",
    images: [
      {
        tag: "hero_main",
        description: "\u6e5b\u85cd\u773c\u775b\u8207\u67d4\u9806\u9577\u6bdb\u7684\u96d9\u8272\u5e03\u5076\u8c93\u7279\u5beb",
        src: "/images/cat-breeds/ragdoll.jpg",
        alt: "\u96d9\u8272\u5e03\u5076\u8c93\u6e5b\u85cd\u773c\u775b\u7279\u5beb",
      },
      {
        tag: "gallery_item_1",
        description: "\u624b\u5957\u8272（Mitted）\u5e03\u5076：\u767d\u624b\u5957\u8207\u767d\u8173\u7684\u7d93\u5178\u82b1\u8272",
        src: "/images/cat-breeds/ragdoll-mitted.jpg",
        alt: "\u624b\u5957\u8272\u5e03\u5076\u8c93",
      },
      {
        tag: "gallery_item_2",
        description: "\u5012V\u5b57\u96d9\u8272\u5e03\u5076\u5168\u8eab\u7167（\u53c3\u8003\u5716）",
        src: "https://cdn2.thecatapi.com/images/HDxfaNlLj.jpg",
        alt: "\u96d9\u8272\u5e03\u5076\u8c93\u5168\u8eab",
      },
      {
        tag: "gallery_item_3",
        description: "\u91cd\u9ede\u8272\u5e03\u5076：\u81c9\u8033\u5c3e\u8272\u6df1、\u8ec0\u5e79\u8f03\u6dfa",
        src: "https://cdn2.thecatapi.com/images/nqS9tUT3i.jpg",
        alt: "\u91cd\u9ede\u8272\u5e03\u5076\u8c93",
      },
    ],
  },
};

export const RUSSIAN_BLUE_BREED_INFO: CatBreedInfo = {
  breed_id: "russian_blue",
  name_en: "Russian Blue",
  name_zh_hk: "\u4fc4\u7f85\u65af\u85cd\u8c93",
  aliases: ["\u4fc4\u85cd", "\u85cd\u8c93", "Archangel Cat", "\u99ac\u723e\u4ed6\u85cd\u8c93（\u820a\u7a31）"],
  origin: {
    country: "\u4fc4\u7f85\u65af",
    state: "\u963f\u723e\u6f22\u683c\u723e\u65af\u514b（Archangel）\u4e00\u5e36",
    history_overview:
      "\u76f8\u50b3\u6e90\u81ea\u4fc4\u7f85\u65af\u5317\u90e8\u6e2f\u53e3\u963f\u723e\u6f22\u683c\u723e\u65af\u514b\u7684\u81ea\u7136\u77ed\u6bdb\u8c93，\u5f8c\u7d93\u82f1\u570b\u8207\u5317\u6b50\u80b2\u7a2e\u5bb6\u9078\u80b2\u5b9a\u578b。\u4ee5\u9280\u5149\u85cd\u7070\u6bdb\u8207\u7fe1\u7fe0\u7da0\u773c\u775b\u805e\u540d，\u662f\u6c23\u8cea\u512a\u96c5、\u8072\u97f3\u8f15\u67d4\u7684\u7d93\u5178\u77ed\u6bdb\u54c1\u7a2e。",
  },
  physical_characteristics: {
    eye_color: "\u6210\u8c93\u70ba\u9bae\u8277\u7fe1\u7fe0\u7da0（\u5e7c\u8c93\u591a\u70ba\u9ec3／\u7425\u73c0，\u96a8\u6210\u9577\u8f49\u7da0）",
    size_category: "Foreign／Semi-foreign（\u4fee\u9577\u512a\u96c5、\u9aa8\u91cf\u9069\u4e2d\u800c\u808c\u8089\u7d50\u5be6）",
    weight_kg: {
      male: { min: 3.5, max: 5.5 },
      female: { min: 2.5, max: 4.5 },
    },
    maturation_years: "\u7d04 2-3 \u5e74（\u773c\u775b\u8207\u9ad4\u578b\u9010\u6f38\u5b9a\u578b）",
    coat: {
      length: "Short（\u77ed\u6bdb）",
      texture: "\u539a\u5bc6\u7d68\u611f、\u89f8\u611f\u5982\u6d77\u8c79\u76ae",
      undercoat: "\u96d9\u5c64\u77ed\u6bdb；\u8868\u6bdb\u9280\u5c16（silver tipping）\u5e36\u91d1\u5c6c\u5149\u6fa4",
    },
  },
  patterns: [
    {
      pattern_id: "silver_tipped_blue",
      name_zh: "\u9280\u5c16\u85cd\u7070\u8272 (Silver-tipped Blue)",
      description: "\u7d55\u5927\u591a\u6578\u8c93\u5354\u8a8d\u53ef\u7684\u552f\u4e00\u6a19\u6e96\u8272；\u6bdb\u5c16\u9280\u767d，\u6574\u9ad4\u5448\u91d1\u5c6c\u5149\u6fa4",
      image_url: "",
    },
    {
      pattern_id: "american_type",
      name_zh: "\u7f8e\u570b\u578b (American Type)",
      description: "\u982d\u90e8\u7a0d\u5713、\u81c9\u9830\u8f03\u8c50\u6eff，\u88ab\u6bdb\u66f4\u539a\u5be6\u7d68\u5bc6",
      image_url: "",
    },
    {
      pattern_id: "european_type",
      name_zh: "\u6b50\u6d32\u578b (European Type)",
      description: "\u81c9\u578b\u8f03\u5c16、\u8033\u4f4d\u8f03\u9ad8，\u9ad4\u578b\u66f4\u4fee\u9577\u512a\u96c5",
      image_url: "",
    },
    {
      pattern_id: "emerald_eyes",
      name_zh: "\u7fe1\u7fe0\u7da0\u773c\u775b",
      description: "\u6210\u8c93\u5fc5\u5099\u6a19\u8a8c；\u5e7c\u8c93\u773c\u8272\u7531\u9ec3\u8f49\u7da0\u7d04\u9700\u4e00\u5e74\u4ee5\u4e0a",
      image_url: "",
    },
  ],
  colors: [
    {
      color_id: "blue",
      name_zh: "\u85cd\u7070\u8272",
      description: "\u5747\u52fb\u85cd\u7070\u5e95\u8272，\u7121\u864e\u6591\u6216\u767d\u6591（\u6a19\u6e96）",
    },
    {
      color_id: "silver_tipping",
      name_zh: "\u9280\u5c16\u5149\u6fa4",
      description: "\u8868\u6bdb\u672b\u7aef\u9280\u767d，\u5149\u7dda\u4e0b\u5448\u7d72\u7da2／\u91d1\u5c6c\u9583\u5149",
    },
    {
      color_id: "lavender_pads",
      name_zh: "\u85b0\u8863\u8349\u8272\u8089\u588a",
      description: "\u9f3b\u982d\u77f3\u677f\u7070、\u8089\u588a\u504f\u7c89\u7d2b／\u85b0\u8863\u8349\u8272\u70ba\u5178\u578b\u7279\u5fb5",
    },
  ],
  personality_traits: [
    "\u5c0d\u964c\u751f\u4eba\u504f\u5bb3\u7f9e\u5167\u6582，\u5c0d\u8a8d\u5b9a\u7684\u5bb6\u4eba\u6975\u70ba\u5fe0\u8aa0\u89aa\u5bc6",
    "\u53eb\u8072\u8f15\u67d4、\u6c23\u8cea\u5b89\u975c，\u9069\u5408\u559c\u6b61\u5be7\u975c\u5c45\u5bb6\u6c1b\u570d\u7684\u98fc\u4e3b",
    "\u8070\u6167\u654f\u92b3，\u559c\u6b61\u89c0\u5bdf\u8207\u667a\u529b\u904a\u6232（\u85cf\u98df\u73a9\u5177\u7b49）",
    "\u74b0\u5883\u654f\u611f\u5ea6\u9ad8，\u9700\u8981\u7a69\u5b9a\u4f5c\u606f\u8207\u5c08\u5c6c\u5b89\u5168\u4f11\u606f\u5340",
  ],
  care_and_health: {
    environment:
      "\u9069\u5408\u5b89\u975c\u5ba4\u5167\u74b0\u5883；\u642c\u5c4b、\u8a2a\u5ba2\u6216\u566a\u97f3\u5927\u6642\u9700\u7d66\u4e88\u8eb2\u85cf\u7a7a\u9593，\u907f\u514d\u5f37\u8feb\u793e\u4ea4",
    genetic_risks: [
      "\u8180\u80f1\u7d50\u77f3／\u6ccc\u5c3f\u9053\u554f\u984c\u98a8\u96aa\u76f8\u5c0d\u504f\u9ad8（\u591a\u559d\u6c34、\u7559\u610f\u5c3f\u91cf）",
      "\u6574\u9ad4\u5c6c\u5065\u5eb7\u9577\u58fd\u54c1\u7a2e，\u4ecd\u5efa\u8b70\u5b9a\u671f\u5065\u5eb7\u6aa2\u67e5",
    ],
    digestive_health: "\u8178\u80c3\u901a\u5e38\u7a69\u5b9a；\u63db\u7ce7\u4ecd\u5efa\u8b70\u6f38\u9032\u904e\u6e21",
    diet_management:
      "\u7dad\u6301\u8f15\u76c8\u512a\u96c5\u9ad4\u578b，\u63a7\u5236\u8102\u80aa\u8207\u71b1\u91cf；\u88dc\u5145\u725b\u78fa\u9178\u6709\u52a9\u773c\u775b\u8207\u5fc3\u81df\u5065\u5eb7；\u9f13\u52f5\u591a\u559d\u6c34",
    grooming:
      "\u9280\u85cd\u96d9\u5c64\u77ed\u6bdb\u6389\u6bdb\u91cf\u76f8\u5c0d\u5c11，\u6bcf\u9031\u68b3\u6bdb 1 \u6b21\u5373\u53ef；\u63db\u6bdb\u5b63\u53ef\u7565\u589e\u6b21\u6578\u4ee5\u4fdd\u6301\u9280\u5149\u6fa4",
  },
  media_assets: {
    status: "localized_gallery_sync",
    instruction_for_cursor:
      "\u4fc4\u85cd\u5716\u5eab\u5df2\u672c\u5730\u5316（7 \u5f35）：\u82f1\u96c4／\u7279\u5beb／\u512a\u96c5／\u7a97\u908a／\u5c45\u5bb6／\u684c\u908a\u59ff\u614b／\u8089\u588a\u7279\u5beb。",
    images: [
      {
        tag: "hero_main",
        description: "\u7f8e\u570b\u578b\u9280\u85cd\u4fc4\u85cd（\u7fe1\u7fe0\u7da0\u773c\u775b）",
        src: "/images/cat-breeds/russian-blue.jpg",
        alt: "\u9280\u85cd\u7070\u8272\u4fc4\u7f85\u65af\u85cd\u8c93",
      },
      {
        tag: "gallery_item_1",
        description: "\u9280\u5149\u88ab\u6bdb\u8207\u7da0\u773c\u8fd1\u8ddd\u96e2\u7279\u5beb",
        src: "/images/cat-breeds/russian-blue-portrait.jpg",
        alt: "\u4fc4\u7f85\u65af\u85cd\u8c93\u81c9\u90e8\u7279\u5beb",
      },
      {
        tag: "gallery_item_2",
        description: "\u4fee\u9577\u512a\u96c5\u7684\u5074\u8eab\u5750\u59ff",
        src: "/images/cat-breeds/russian-blue-elegant.jpg",
        alt: "\u512a\u96c5\u59ff\u614b\u7684\u4fc4\u7f85\u65af\u85cd\u8c93",
      },
      {
        tag: "gallery_item_3",
        description: "\u7a97\u908a\u65e5\u5149\u4e0b\u7684\u9280\u85cd\u5149\u6fa4",
        src: "/images/cat-breeds/russian-blue-window.jpg",
        alt: "\u7a97\u908a\u7684\u4fc4\u7f85\u65af\u85cd\u8c93",
      },
      {
        tag: "gallery_item_4",
        description: "\u5c45\u5bb6\u4f11\u606f\u7684\u5b89\u975c\u65e5\u5e38",
        src: "/images/cat-breeds/russian-blue-cozy.jpg",
        alt: "\u5ba4\u5167\u4f11\u606f\u7684\u4fc4\u7f85\u65af\u85cd\u8c93",
      },
      {
        tag: "gallery_item_5",
        description: "\u684c\u908a\u8b66\u89ba\u5750\u59ff\u8207\u7da0\u773c",
        src: "/images/cat-breeds/russian-blue-pose.jpg",
        alt: "\u684c\u908a\u7684\u4fc4\u7f85\u65af\u85cd\u8c93",
      },
      {
        tag: "gallery_item_6",
        description: "\u8209\u624b\u5c55\u793a\u85b0\u8863\u8349\u8272\u8089\u588a",
        src: "/images/cat-breeds/russian-blue-paw.jpg",
        alt: "\u5c55\u793a\u8089\u588a\u7684\u4fc4\u7f85\u65af\u85cd\u8c93",
      },
    ],
  },
};

export const MUNCHKIN_BREED_INFO: CatBreedInfo = {
  breed_id: "munchkin",
  name_en: "Munchkin",
  name_zh_hk: "\u66fc\u8d64\u56e0\u77ed\u817f\u8c93",
  aliases: ["\u77ed\u817f\u8c93", "\u81d8\u8178\u8c93", "Munchkin"],
  origin: {
    country: "\u7f8e\u570b",
    decade: "1980s",
    history_overview:
      "1980 \u5e74\u4ee3\u65bc\u7f8e\u570b\u767c\u73fe\u5e36\u6709\u81ea\u7136\u77ed\u80a2\u57fa\u56e0\u7684\u5bb6\u8c93，\u5f8c\u7d93\u80b2\u7a2e\u5b9a\u578b。\u4ee5\u77ed\u817f、\u9577\u8eab\u8ec0\u805e\u540d，\u88ab\u7a31\u70ba「\u8c93\u754c\u81d8\u8178\u72d7」；\u77ed\u817f\u4f86\u81ea\u9ad4\u67d3\u8272\u9ad4\u986f\u6027\u57fa\u56e0，\u8eab\u9ad4\u5176\u9918\u6bd4\u4f8b\u8207\u4e00\u822c\u5bb6\u8c93\u76f8\u8fd1。",
  },
  physical_characteristics: {
    eye_color: "\u91d1\u8272、\u7da0\u8272、\u85cd\u8272、\u7570\u8272\u77b3（\u4f9d\u6bdb\u8272\u800c\u7570）",
    size_category: "\u77ed\u817f\u9577\u8eab、\u4e2d\u5c0f\u578b；\u56db\u80a2\u660e\u986f\u77ed\u65bc\u6a19\u6e96\u5bb6\u8c93",
    weight_kg: {
      male: { min: 2.7, max: 4.0 },
      female: { min: 2.3, max: 3.6 },
    },
    maturation_years: "\u7d04 1.5-2 \u5e74",
    coat: {
      length: "Short \u6216 Long（\u77ed\u6bdb／\u9577\u6bdb\u7686\u6709）",
      texture: "\u67d4\u8edf\u4e2d\u7b49\u5bc6\u5ea6",
      undercoat: "\u9069\u4e2d；\u9577\u6bdb\u578b\u9838\u90e8\u8207\u5c3e\u6bdb\u8f03\u8c50",
    },
  },
  patterns: [
    {
      pattern_id: "short_legs",
      name_zh: "\u77ed\u80a2\u7279\u5fb5",
      description: "\u524d\u80a2\u5c24\u70ba\u77ed\u5c0f，\u8eab\u8ec0\u76f8\u5c0d\u4fee\u9577；\u4ecd\u53ef\u654f\u6377\u5954\u8dd1、\u7ad9\u7acb\u73a9\u800d",
      image_url: "",
    },
    {
      pattern_id: "tabby",
      name_zh: "\u864e\u6591",
      description: "\u5e38\u898b\u68d5\u8272／\u9280\u8272\u864e\u6591，\u984d\u982d\u5e38\u6709『M』\u5b57",
      image_url: "",
    },
    {
      pattern_id: "bicolor_point",
      name_zh: "\u96d9\u8272／\u91cd\u9ede\u8272",
      description: "\u4ea6\u6709\u96d9\u8272、\u91cd\u9ede\u8272（point）\u7b49\u591a\u6a23\u82b1\u8272",
      image_url: "",
    },
    {
      pattern_id: "longhair",
      name_zh: "\u9577\u6bdb\u578b",
      description: "\u9577\u6bdb\u66fc\u8d64\u56e0\u5c3e\u6bdb\u8207\u9838\u6bdb\u66f4\u8c50，\u5916\u89c0\u66f4\u5713\u6f64",
      image_url: "",
    },
  ],
  colors: [
    { color_id: "tabby", name_zh: "\u864e\u6591", description: "\u6700\u5e38\u898b\u82b1\u8272\u4e4b\u4e00" },
    { color_id: "bicolor", name_zh: "\u96d9\u8272", description: "\u767d\u5e95\u914d\u6df1\u8272\u584a" },
    { color_id: "point", name_zh: "\u91cd\u9ede\u8272", description: "\u81c9\u8033\u5c3e\u8f03\u6df1、\u8ec0\u5e79\u8f03\u6dfa" },
    { color_id: "solid", name_zh: "\u7d14\u8272", description: "\u767d、\u9ed1、\u85cd\u7b49\u55ae\u8272" },
  ],
  personality_traits: [
    "\u5929\u771f\u6d3b\u6f51，\u50cf\u9577\u4e0d\u5927\u7684\u5b69\u5b50，\u559c\u6b61\u8ffd\u9010\u8207\u7ad9\u7acb\u73a9\u800d",
    "\u793e\u4ea4\u6027\u9ad8，\u901a\u5e38\u5c0d\u4eba\u8207\u5176\u4ed6\u5bf5\u7269\u53cb\u5584",
    "\u597d\u5947\u5fc3\u5f37，\u77ed\u817f\u4e0d\u5f71\u97ff\u6500\u722c\u8207\u901f\u5ea6",
    "\u89aa\u4eba\u8a0e\u62b1，\u9069\u5408\u4f5c\u70ba\u5bb6\u5ead\u958b\u5fc3\u679c",
  ],
  care_and_health: {
    environment:
      "\u907f\u514d\u904e\u9ad8\u8df3\u53f0\u8207\u5f37\u8feb\u9ad8\u8655\u843d\u5730；\u63d0\u4f9b\u4f4e\u77ee\u8df3\u53f0、\u659c\u5761\u8207\u9632\u6ed1\u5730\u9762。\u96d6\u654f\u6377\u4ecd\u5efa\u8b70\u5ba4\u5167\u98fc\u990a。",
    genetic_risks: [
      "\u77ed\u80a2\u57fa\u56e0\u76f8\u95dc\u7684\u8170\u690e／\u95dc\u7bc0\u8ca0\u64d4\u9700\u9577\u671f\u7559\u610f",
      "\u80a5\u80d6\u6703\u660e\u986f\u52a0\u91cd\u810a\u690e\u8207\u77ed\u817f\u58d3\u529b",
    ],
    digestive_health: "\u6574\u9ad4\u8178\u80c3\u7a69\u5b9a；\u63db\u7ce7\u4ecd\u5efa\u8b70\u6f38\u9032",
    diet_management:
      "\u56b4\u683c\u63a7\u91cd；\u88dc\u5145\u95dc\u7bc0\u71df\u990a（\u8461\u8404\u7cd6\u80fa、MSM、\u9069\u91cf\u9223\u8207\u7dad\u751f\u7d20 D3）；\u53ef\u9078\u5c0f\u9846\u7c92\u4e7e\u7ce7",
    grooming:
      "\u77ed\u6bdb\u6bcf\u9031\u68b3 1 \u6b21；\u9577\u6bdb\u578b 2-3 \u6b21。\u5b9a\u671f\u4fee\u526a\u6307\u7532，\u6e1b\u5c11\u77ed\u817f\u8e29\u6ed1\u53d7\u50b7",
  },
  media_assets: {
    status: "localized_gallery_sync",
    instruction_for_cursor:
      "\u66fc\u8d64\u56e0\u5716\u5eab\u5df2\u672c\u5730\u5316：\u82f1\u96c4\u5168\u8eab／\u864e\u6591／\u7ad9\u7acb／\u96d9\u8272／\u73a9\u800d。",
    images: [
      {
        tag: "hero_main",
        description: "\u9577\u6bdb\u66fc\u8d64\u56e0\u5168\u8eab（\u77ed\u817f\u7279\u5fb5\u6e05\u6670）",
        src: "/images/cat-breeds/munchkin.jpg",
        alt: "\u66fc\u8d64\u56e0\u77ed\u817f\u8c93\u5168\u8eab\u7167",
      },
      {
        tag: "gallery_item_1",
        description: "\u68d5\u8272\u864e\u6591\u77ed\u817f\u66fc\u8d64\u56e0",
        src: "/images/cat-breeds/munchkin-tabby.jpg",
        alt: "\u864e\u6591\u66fc\u8d64\u56e0\u77ed\u817f\u8c93",
      },
      {
        tag: "gallery_item_2",
        description: "\u91cd\u9ede\u8272\u66fc\u8d64\u56e0\u7ad9\u7acb\u59ff\u614b",
        src: "/images/cat-breeds/munchkin-standing.jpg",
        alt: "\u7ad9\u7acb\u7684\u66fc\u8d64\u56e0\u77ed\u817f\u8c93",
      },
      {
        tag: "gallery_item_3",
        description: "\u5de7\u514b\u529b\u96d9\u8272\u77ed\u817f\u7279\u5beb",
        src: "/images/cat-breeds/munchkin-bicolor.jpg",
        alt: "\u96d9\u8272\u66fc\u8d64\u56e0\u77ed\u817f\u8c93",
      },
      {
        tag: "gallery_item_4",
        description: "\u5f8c\u80a2\u7ad9\u7acb\u73a9\u800d\u7684\u6d3b\u6f51\u65e5\u5e38",
        src: "/images/cat-breeds/munchkin-play.jpg",
        alt: "\u73a9\u800d\u4e2d\u7684\u66fc\u8d64\u56e0\u77ed\u817f\u8c93",
      },
    ],
  },
};

export const NORWEGIAN_FOREST_BREED_INFO: CatBreedInfo = {
  breed_id: "norwegian_forest",
  name_en: "Norwegian Forest Cat",
  name_zh_hk: "\u632a\u5a01\u68ee\u6797\u8c93",
  aliases: ["\u632a\u68ee", "\u68ee\u6797\u8c93", "Norsk skogkatt", "Wegie"],
  origin: {
    country: "\u632a\u5a01",
    history_overview:
      "\u5317\u6b50\u53e4\u8001\u81ea\u7136\u54c1\u7a2e，\u76f8\u50b3\u5728\u65af\u582a\u5730\u90a3\u7dad\u4e9e\u68ee\u6797\u4e2d\u9069\u61c9\u56b4\u5bd2\u800c\u751f。\u64c1\u6709\u9632\u6c34\u96d9\u5c64\u9577\u6bdb、\u5065\u58ef\u9aa8\u67b6\u8207\u51fa\u8272\u6500\u722c\u529b，\u5916\u8868\u5a01\u56b4\u4f46\u6027\u683c\u6eab\u548c\u5305\u5bb9。",
  },
  physical_characteristics: {
    eye_color: "\u7da0\u8272、\u91d1\u8272、\u9285\u8272（\u8207\u6bdb\u8272\u5354\u8abf）",
    size_category: "\u5927\u578b\u5f37\u58ef、\u9577\u8eab\u77e9\u5f62；\u665a\u719f、\u9aa8\u91cf\u539a\u5be6",
    weight_kg: {
      male: { min: 5.5, max: 9.0 },
      female: { min: 4.0, max: 6.5 },
    },
    maturation_years: "\u7d04 3-5 \u5e74\u624d\u5b8c\u5168\u6210\u719f",
    coat: {
      length: "Long（\u9577\u6bdb）",
      texture: "\u6cb9\u4eae\u9632\u6c34\u8868\u6bdb＋\u539a\u5bc6\u5e95\u6bdb",
      undercoat: "\u96d9\u5c64；\u51ac\u5b63\u9838\u6bdb（ruff）\u8207\u5c3e\u6bdb\u6975\u8c50",
    },
  },
  patterns: [
    {
      pattern_id: "tabby_white",
      name_zh: "\u864e\u6591／\u864e\u6591\u767d",
      description: "\u5e38\u898b\u68d5\u8272\u864e\u6591，\u5e38\u5e36\u767d\u80f8、\u767d\u8173\u8207\u767d\u9f3b\u6a11",
      image_url: "",
    },
    {
      pattern_id: "lynx_tips",
      name_zh: "\u5c71\u8c93\u8033\u5c16",
      description: "\u8033\u5c16\u7c07\u6bdb（lynx tips）\u8207\u8033\u5167\u9577\u6bdb\u662f\u6a19\u8a8c\u7279\u5fb5",
      image_url: "",
    },
    {
      pattern_id: "winter_coat",
      name_zh: "\u51ac\u6bdb／\u9838\u6bdb",
      description: "\u51ac\u5b63\u96d9\u5c64\u6bdb\u8207\u80f8\u524d\u9b03\u6bdb\u66f4\u660e\u986f，\u63db\u6bdb\u5b63\u6389\u6bdb\u91cf\u5927",
      image_url: "",
    },
    {
      pattern_id: "solid_smoke",
      name_zh: "\u55ae\u8272／\u7159\u8272\u7b49",
      description: "\u9664\u5de7\u514b\u529b／\u4e01\u9999／\u91cd\u9ede\u8272\u5916，\u591a\u6578\u82b1\u8272\u7686\u53ef\u63a5\u53d7（\u8996\u5354\u6703\u6a19\u6e96）",
      image_url: "",
    },
  ],
  colors: [
    { color_id: "brown_tabby", name_zh: "\u68d5\u8272\u864e\u6591", description: "\u7d93\u5178\u68ee\u6797\u611f\u82b1\u8272" },
    { color_id: "silver_tabby", name_zh: "\u9280\u864e\u6591", description: "\u9280\u767d\u5e95\u914d\u6df1\u7d0b" },
    { color_id: "black_white", name_zh: "\u9ed1\u767d／\u96d9\u8272", description: "\u5e38\u898b\u767d\u6591\u7d44\u5408" },
    { color_id: "red_tabby", name_zh: "\u7d05\u8272\u864e\u6591", description: "\u6696\u6a58\u689d\u7d0b" },
  ],
  personality_traits: [
    "\u52c7\u6562\u63a2\u7d22、\u71b1\u611b\u6500\u9ad8，\u662f\u5929\u751f\u7684\u722c\u6a39\u9ad8\u624b",
    "\u5916\u8868\u5a01\u56b4\u5927\u6c23，\u5c0d\u4eba\u6eab\u548c\u53cb\u5584、\u4e0d\u9ecf\u81a9",
    "\u9069\u61c9\u529b\u4f73，\u80fd\u8207\u5152\u7ae5\u53ca\u5176\u4ed6\u5bf5\u7269\u5171\u8655",
    "\u7368\u7acb\u4e2d\u5e36\u89aa\u5bc6，\u559c\u6b61\u5b89\u975c\u966a\u4f34\u800c\u975e\u904e\u5ea6\u5435\u9b27",
  ],
  care_and_health: {
    environment:
      "\u9700\u8981\u9ad8\u8073\u8c93\u6a39／\u7246\u9762\u8df3\u53f0；\u590f\u5b63\u6ce8\u610f\u539a\u6bdb\u6563\u71b1。\u9069\u5408\u6709\u5782\u76f4\u6d3b\u52d5\u7a7a\u9593\u7684\u5bb6\u5ead。",
    genetic_risks: [
      "\u7cd6\u539f\u5132\u7a4d\u75c7 IV \u578b (GSD IV，\u512a\u826f\u7e41\u6b96\u5834\u6703\u505a\u57fa\u56e0\u7be9\u6aa2)",
      "\u9ad6\u95dc\u7bc0\u767c\u80b2\u4e0d\u826f",
      "\u80a5\u539a\u578b\u5fc3\u808c\u75c5 (HCM，\u90e8\u5206\u8840\u7d71)",
    ],
    digestive_health: "\u9577\u6bdb\u6613\u541e\u6bdb，\u9700\u5354\u52a9\u6392\u6bdb\u7403；\u63db\u7ce7\u6f38\u9032",
    diet_management:
      "\u5927\u578b\u665a\u719f\u8c93\u9700\u9577\u6642\u9593\u512a\u8cea\u9ad8\u86cb\u767d；\u88dc\u7e96\u7dad\u52a9\u6392\u6bdb；\u53ef\u52a0\u8461\u8404\u7cd6\u80fa\u652f\u6301\u9aa8\u9abc",
    grooming:
      "\u5e73\u6642\u6bcf\u9031\u68b3 2-3 \u6b21；\u6625\u79cb\u63db\u6bdb\u5b63\u5efa\u8b70\u6bcf\u65e5\u68b3\u7406，\u7279\u5225\u662f\u9838\u6bdb、\u8179\u5074\u8207\u5c3e\u6839，\u6e1b\u5c11\u6bdb\u7d50\u8207\u6bdb\u7403",
  },
  media_assets: {
    status: "localized_gallery_sync",
    instruction_for_cursor:
      "\u632a\u68ee\u5716\u5eab\u5df2\u672c\u5730\u5316：\u81c9\u90e8\u82f1\u96c4／\u96ea\u5730／\u6236\u5916／\u9280\u864e\u6591\u7279\u5beb／\u96ea\u4e2d\u7fa4\u50cf。",
    images: [
      {
        tag: "hero_main",
        description: "\u68d5\u8272\u864e\u6591\u632a\u68ee\u81c9\u90e8（\u5c71\u8c93\u8033\u5c16）",
        src: "/images/cat-breeds/norwegian-forest.jpg",
        alt: "\u632a\u5a01\u68ee\u6797\u8c93\u81c9\u90e8\u7279\u5beb",
      },
      {
        tag: "gallery_item_1",
        description: "\u96ea\u4e2d\u539a\u6bdb\u632a\u68ee",
        src: "/images/cat-breeds/norwegian-forest-snow.jpg",
        alt: "\u96ea\u5730\u4e2d\u7684\u632a\u5a01\u68ee\u6797\u8c93",
      },
      {
        tag: "gallery_item_2",
        description: "\u6236\u5916\u81ea\u7136\u74b0\u5883\u4e2d\u7684\u632a\u68ee",
        src: "/images/cat-breeds/norwegian-forest-outdoor.jpg",
        alt: "\u6236\u5916\u7684\u632a\u5a01\u68ee\u6797\u8c93",
      },
      {
        tag: "gallery_item_3",
        description: "\u9280\u864e\u6591\u81c9\u90e8\u8207\u7da0\u773c\u7279\u5beb",
        src: "/images/cat-breeds/norwegian-forest-portrait.jpg",
        alt: "\u9280\u864e\u6591\u632a\u5a01\u68ee\u6797\u8c93\u7279\u5beb",
      },
      {
        tag: "gallery_item_4",
        description: "\u96ea\u5730\u4e2d\u7684\u632a\u68ee\u7fa4\u50cf",
        src: "/images/cat-breeds/norwegian-forest-pack.jpg",
        alt: "\u96ea\u5730\u4e2d\u7684\u632a\u5a01\u68ee\u6797\u8c93\u5011",
      },
    ],
  },
};

export const EXOTIC_SHORTHAIR_BREED_INFO: CatBreedInfo = {
  breed_id: "exotic_shorthair",
  name_en: "Exotic Shorthair",
  name_zh_hk: "\u7570\u570b\u77ed\u6bdb\u8c93",
  aliases: ["\u52a0\u83f2\u8c93", "\u7570\u77ed", "Exotic"],
  origin: {
    country: "\u7f8e\u570b",
    decade: "1950s-1960s",
    history_overview:
      "\u4ee5\u6ce2\u65af\u8c93\u70ba\u57fa\u790e，\u5c0e\u5165\u7f8e\u570b\u77ed\u6bdb\u7b49\u77ed\u6bdb\u8840\u7d71\u80b2\u6210，\u4fdd\u7559\u6ce2\u65af\u7684\u6241\u81c9\u5713\u773c\u8207\u6eab\u67d4\u6027\u683c，\u4f46\u88ab\u6bdb\u6539\u70ba\u77ed\u800c\u6fc3\u5bc6、\u8f03\u6613\u6253\u7406，\u56e0\u800c\u5e38\u88ab\u66b1\u7a31\u70ba「\u52a0\u83f2\u8c93」。",
  },
  physical_characteristics: {
    eye_color: "\u9285\u8272／\u6a58\u8272\u70ba\u5e38\u898b；\u91cd\u9ede\u8272\u53ef\u70ba\u85cd\u773c；\u96d9\u8272\u53ef\u6709\u7570\u8272\u77b3",
    size_category: "Cobby（\u77ee\u80d6\u7d50\u5be6、\u982d\u5713、\u9f3b\u77ed、\u9aa8\u67b6\u624e\u5be6）",
    weight_kg: {
      male: { min: 4.0, max: 6.5 },
      female: { min: 3.0, max: 5.0 },
    },
    maturation_years: "\u7d04 2-3 \u5e74",
    coat: {
      length: "Short（\u77ed\u6bdb）",
      texture: "\u6fc3\u5bc6\u7d68\u6bdb\u611f，\u6bdb\u7a0d\u7acb\u8d77\u5982\u6cf0\u8fea\u718a",
      undercoat: "\u539a\u5bc6\u5e95\u6bdb，\u63db\u6bdb\u5b63\u4ecd\u9700\u52e4\u68b3",
    },
  },
  patterns: [
    {
      pattern_id: "tabby",
      name_zh: "\u864e\u6591",
      description: "\u68d5\u8272／\u9280\u8272\u7b49\u864e\u6591，\u6241\u81c9\u914d\u5927\u9285\u773c\u8fa8\u8b58\u5ea6\u9ad8",
      image_url: "",
    },
    {
      pattern_id: "bicolor",
      name_zh: "\u96d9\u8272",
      description: "\u767d\u5e95\u914d\u85cd、\u6a58、\u864e\u6591\u7b49\u8272\u584a，\u5e38\u898b「\u52a0\u83f2」\u5370\u8c61",
      image_url: "",
    },
    {
      pattern_id: "solid",
      name_zh: "\u7d14\u8272",
      description: "\u767d、\u9ed1、\u85cd、\u7d05、\u5976\u6cb9\u7b49\u55ae\u8272",
      image_url: "",
    },
    {
      pattern_id: "colorpoint",
      name_zh: "\u91cd\u9ede\u8272",
      description: "\u985e\u4f3c\u559c\u99ac\u62c9\u96c5／\u91cd\u9ede\u8272\u6ce2\u65af\u7684\u77ed\u6bdb\u7248，\u85cd\u773c",
      image_url: "",
    },
  ],
  colors: [
    { color_id: "brown_tabby", name_zh: "\u68d5\u8272\u864e\u6591", description: "\u7d93\u5178\u52a0\u83f2\u611f\u82b1\u8272" },
    { color_id: "blue_white", name_zh: "\u85cd\u767d\u96d9\u8272", description: "\u7070\u85cd\u914d\u767d\u80f8\u81c9" },
    { color_id: "cream_white", name_zh: "\u5976\u6cb9\u767d", description: "\u67d4\u548c\u6dfa\u8272\u7cfb" },
    { color_id: "calico", name_zh: "\u4e09\u82b1／\u73b3\u7441\u767d", description: "\u6a58、\u9ed1、\u767d\u584a\u9762" },
  ],
  personality_traits: [
    "\u6587\u975c\u5446\u840c，\u559c\u6b61\u5b89\u975c\u966a\u4f34\u8207\u8f15\u67d4\u4e92\u52d5",
    "\u5c0d\u4eba\u6eab\u67d4\u8a0e\u62b1，\u60c5\u611f\u8c50\u5bcc\u4f46\u4e0d\u5435\u9b27",
    "\u9069\u61c9\u5ba4\u5167\u751f\u6d3b，\u9069\u5408\u4f5c\u70ba\u516c\u5bd3\u966a\u4f34\u8c93",
    "\u7bc0\u594f\u504f\u6162，\u4eab\u53d7\u7a97\u908a\u89c0\u5bdf\u8207\u5348\u7761",
  ],
  care_and_health: {
    environment:
      "\u9f3b\u77ed\u9700\u6ce8\u610f\u901a\u98a8\u6563\u71b1；\u907f\u514d\u904e\u71b1\u74b0\u5883。\u63d0\u4f9b\u6dfa\u53e3\u98df\u7897\u8207\u5b89\u975c\u4f11\u606f\u5340。",
    genetic_risks: [
      "\u591a\u56ca\u6027\u814e\u81df\u75c5 (PKD，\u8cfc\u8cb7\u524d\u78ba\u8a8d\u7236\u6bcd\u57fa\u56e0\u6aa2\u6e2c)",
      "\u6241\u81c9\u76f8\u95dc\u7684\u6dda\u6ea2、\u9f3b\u585e\u8207\u547c\u5438\u8ca0\u64d4",
      "\u80a5\u539a\u578b\u5fc3\u808c\u75c5 (HCM，\u90e8\u5206\u8840\u7d71)",
    ],
    digestive_health: "\u63db\u7ce7\u9700\u6f38\u9032；\u80a5\u80d6\u6703\u52a0\u91cd\u5fc3\u80ba\u8ca0\u64d4",
    diet_management:
      "\u56b4\u683c\u63a7\u91cd；\u53ef\u9078\u6613\u54ac\u788e\u9846\u7c92（\u6241\u81c9\u8f03\u6613\u5480\u56bc）；\u88dc\u5145\u8b77\u773c\u6297\u6c27\u5316\u914d\u65b9\u6709\u52a9\u773c\u775b\u5065\u5eb7",
    grooming:
      "\u6bcf\u5929\u7528\u6eab\u6fd5\u68c9\u7247\u6e05\u7406\u773c\u89d2\u8207\u81c9\u647a；\u6bcf\u9031\u68b3\u6bdb 2-3 \u6b21（\u5e95\u6bdb\u539a）。\u5b9a\u671f\u6aa2\u67e5\u9f3b\u5468\u570d\u6e05\u6f54",
  },
  media_assets: {
    status: "localized_gallery_sync",
    instruction_for_cursor:
      "\u7570\u77ed\u5716\u5eab\u5df2\u672c\u5730\u5316：\u864e\u6591\u82f1\u96c4／\u85cd\u767d\u96d9\u8272／\u5074\u81c9\u864e\u6591／\u5c45\u5bb6\u6175\u61f6／\u5976\u6cb9\u767d。",
    images: [
      {
        tag: "hero_main",
        description: "\u68d5\u8272\u864e\u6591\u7570\u77ed（\u9285\u773c\u6241\u81c9）",
        src: "/images/cat-breeds/exotic-shorthair.jpg",
        alt: "\u68d5\u8272\u864e\u6591\u7570\u570b\u77ed\u6bdb\u8c93",
      },
      {
        tag: "gallery_item_1",
        description: "\u85cd\u767d\u96d9\u8272\u7570\u77ed\u7a97\u908a\u7279\u5beb",
        src: "/images/cat-breeds/exotic-shorthair-bicolor.jpg",
        alt: "\u85cd\u767d\u96d9\u8272\u7570\u570b\u77ed\u6bdb\u8c93",
      },
      {
        tag: "gallery_item_2",
        description: "\u68d5\u8272\u864e\u6591\u5074\u81c9\u8f2a\u5ed3",
        src: "/images/cat-breeds/exotic-shorthair-tabby.jpg",
        alt: "\u864e\u6591\u7570\u570b\u77ed\u6bdb\u8c93\u5074\u81c9",
      },
      {
        tag: "gallery_item_3",
        description: "\u5976\u6cb9\u8272\u7570\u77ed\u5c45\u5bb6\u4f11\u606f",
        src: "/images/cat-breeds/exotic-shorthair-cozy.jpg",
        alt: "\u4f11\u606f\u4e2d\u7684\u7570\u570b\u77ed\u6bdb\u8c93",
      },
      {
        tag: "gallery_item_4",
        description: "\u5976\u6cb9\u767d\u7570\u77ed\u5411\u4e0a\u51dd\u8996",
        src: "/images/cat-breeds/exotic-shorthair-cream.jpg",
        alt: "\u5976\u6cb9\u767d\u7570\u570b\u77ed\u6bdb\u8c93",
      },
    ],
  },
};

export const MAINE_COON_BREED_INFO: CatBreedInfo = {
  breed_id: "maine_coon",
  name_en: "Maine Coon",
  name_zh_hk: "\u7dec\u56e0\u8c93",
  aliases: ["\u7dec\u56e0\u5eab\u6069\u8c93", "\u6eab\u67d4\u5de8\u4eba", "Maine Coon"],
  origin: {
    country: "\u7f8e\u570b",
    state: "\u7dec\u56e0\u5dde",
    history_overview:
      "\u5317\u7f8e\u6700\u53e4\u8001\u7684\u81ea\u7136\u9577\u6bdb\u54c1\u7a2e\u4e4b\u4e00，\u76f8\u50b3\u65bc\u7dec\u56e0\u5dde\u56b4\u51ac\u4e2d\u6f14\u5316\u51fa\u539a\u6bdb、\u5927\u9aa8\u8207\u9632\u5bd2\u5c3e\u6bdb。\u9ad4\u578b\u70ba\u5bb6\u8c93\u4e4b\u6700，\u6027\u683c\u537b\u5982\u5c0f\u72d7\u822c\u5fe0\u8aa0\u6eab\u67d4，\u5e38\u88ab\u7a31\u70ba「\u6eab\u67d4\u7684\u5de8\u4eba」。",
  },
  physical_characteristics: {
    eye_color: "\u7da0\u8272、\u91d1\u8272、\u9285\u8272（\u767d\u8c93\u53ef\u6709\u85cd\u773c／\u7570\u8272\u77b3）",
    size_category: "\u5927\u578b\u81f3\u8d85\u5927\u578b；\u9577\u8eab\u77e9\u5f62、\u9aa8\u91cf\u539a\u5be6、\u665a\u719f",
    weight_kg: {
      male: { min: 6.0, max: 11.0 },
      female: { min: 4.0, max: 7.5 },
    },
    maturation_years: "\u7d04 3-5 \u5e74\u624d\u5b8c\u5168\u6210\u719f",
    coat: {
      length: "Long（\u9577\u6bdb）",
      texture: "\u7d72\u7da2\u611f\u9632\u6c34\u8868\u6bdb，\u9838\u6bdb\u8207\u5c3e\u6bdb\u8c50\u6eff",
      undercoat: "\u539a\u5bc6\u5e95\u6bdb；\u8033\u5c16\u5e38\u6709\u5c71\u8c93\u7c07\u6bdb（lynx tips）",
    },
  },
  patterns: [
    { pattern_id: "classic_tabby", name_zh: "\u7d93\u5178／\u6591\u7d0b\u864e\u6591", description: "\u6700\u5e38\u898b；\u984d\u982d\u5e38\u6709『M』\u5b57，\u5c3e\u6bdb\u5982\u7fbd\u6247", image_url: "" },
    { pattern_id: "silver_tabby", name_zh: "\u9280\u864e\u6591", description: "\u9280\u767d\u5e95\u914d\u6e05\u6670\u6df1\u7d0b，\u6c23\u52e2\u5341\u8db3", image_url: "" },
    { pattern_id: "bicolor", name_zh: "\u96d9\u8272／\u767d\u6591", description: "\u767d\u80f8、\u767d\u8173、\u767d\u9f3b\u6a11\u7b49\u5e38\u898b", image_url: "" },
    { pattern_id: "solid_smoke", name_zh: "\u7d14\u8272／\u7159\u8272", description: "\u9ed1、\u85cd、\u7d05、\u5976\u6cb9\u7b49\u4ea6\u53ef\u898b", image_url: "" },
  ],
  colors: [
    { color_id: "brown_tabby", name_zh: "\u68d5\u8272\u864e\u6591", description: "\u7d93\u5178\u4ee3\u8868\u8272" },
    { color_id: "silver_tabby", name_zh: "\u9280\u864e\u6591", description: "\u91d1\u5c6c\u611f\u9280\u5e95" },
    { color_id: "red_tabby", name_zh: "\u7d05\u8272\u864e\u6591", description: "\u6696\u6a58\u689d\u7d0b" },
    { color_id: "bicolor", name_zh: "\u96d9\u8272", description: "\u767d\u5e95\u914d\u5176\u4ed6\u8272\u584a" },
  ],
  personality_traits: [
    "\u6eab\u67d4\u5de8\u4eba：\u5916\u8868\u9738\u6c23，\u5c0d\u4eba\u6975\u70ba\u53cb\u5584\u5fe0\u8aa0",
    "\u8072\u97f3\u7d30\u5c0f（chirp／\u5431\u5431\u53eb），\u751a\u5c11\u5927\u8072\u568e\u53eb",
    "\u667a\u529b\u9ad8、\u53ef\u8a13\u7df4，\u90e8\u5206\u500b\u9ad4\u559c\u6b61\u73a9\u6c34",
    "\u9069\u5408\u6709\u7a7a\u9593\u7684\u5bb6\u5ead，\u80fd\u8207\u5152\u7ae5\u53ca\u5176\u4ed6\u5bf5\u7269\u5171\u8655",
  ],
  care_and_health: {
    environment: "\u9700\u8d85\u5927\u8c93\u7802\u76c6\u8207\u52a0\u56fa\u9ad8\u8073\u8c93\u6a39；\u9ad4\u578b\u5927，\u6d3b\u52d5\u7a7a\u9593\u8981\u5145\u8db3",
    genetic_risks: ["\u80a5\u539a\u578b\u5fc3\u808c\u75c5 (HCM)", "\u9ad6\u95dc\u7bc0\u767c\u80b2\u4e0d\u826f", "\u810a\u9ad3\u808c\u840e\u7e2e\u75c7 (SMA，\u512a\u826f\u7e41\u6b96\u5834\u6703\u7be9\u6aa2)"],
    digestive_health: "\u9577\u6bdb\u6613\u541e\u6bdb，\u9700\u5354\u52a9\u6392\u6bdb\u7403；\u63db\u7ce7\u6f38\u9032",
    diet_management: "\u5927\u578b\u665a\u719f\u9700\u9577\u671f\u9ad8\u86cb\u767d；\u88dc\u8461\u8404\u7cd6\u80fa／\u8edf\u9aa8\u7d20\u8207 Omega-3；\u5927\u9846\u7c92\u4e7e\u7ce7\u53ef\u6e1b\u6162\u9032\u98df",
    grooming: "\u6bcf\u9031\u68b3 2-3 \u6b21，\u91cd\u9ede\u814b\u4e0b、\u809a\u76ae\u8207\u5c3e\u6839；\u63db\u6bdb\u5b63\u589e\u81f3\u6bcf\u65e5，\u907f\u514d\u6bdb\u7d50",
  },
  media_assets: {
    status: "localized_gallery_sync",
    instruction_for_cursor: "\u7dec\u56e0\u5716\u5eab\u5df2\u672c\u5730\u5316：\u6236\u5916\u82f1\u96c4／\u7279\u5beb／\u81c9\u90e8／\u5168\u8eab／\u7fa4\u50cf／\u9280\u864e\u6591。",
    images: [
      { tag: "hero_main", description: "\u6236\u5916\u68d5\u8272\u864e\u6591\u7dec\u56e0（\u5c71\u8c93\u8033\u5c16）", src: "/images/cat-breeds/maine-coon.jpg", alt: "\u7dec\u56e0\u8c93\u6236\u5916\u7279\u5beb" },
      { tag: "gallery_item_1", description: "\u9577\u6bdb\u81c9\u90e8\u8fd1\u8ddd\u96e2", src: "/images/cat-breeds/maine-coon-portrait.jpg", alt: "\u7dec\u56e0\u8c93\u81c9\u90e8\u7279\u5beb" },
      { tag: "gallery_item_2", description: "\u65b9\u5f62\u543b\u90e8\u8207\u7da0\u773c", src: "/images/cat-breeds/maine-coon-face.jpg", alt: "\u7dec\u56e0\u8c93\u6b63\u9762" },
      { tag: "gallery_item_3", description: "\u5927\u578b\u5168\u8eab\u8207\u7fbd\u72c0\u5c3e", src: "/images/cat-breeds/maine-coon-full.jpg", alt: "\u7dec\u56e0\u8c93\u5168\u8eab\u7167" },
      { tag: "gallery_item_4", description: "\u4e09\u7a2e\u82b1\u8272\u7dec\u56e0\u7fa4\u50cf", src: "/images/cat-breeds/maine-coon-group.jpg", alt: "\u7dec\u56e0\u8c93\u7fa4\u50cf" },
      { tag: "gallery_item_5", description: "\u9280\u864e\u6591\u7dec\u56e0", src: "/images/cat-breeds/maine-coon-silver.jpg", alt: "\u9280\u864e\u6591\u7dec\u56e0\u8c93" },
    ],
  },
};

export const PERSIAN_BREED_INFO: CatBreedInfo = {
  breed_id: "persian",
  name_en: "Persian",
  name_zh_hk: "\u6ce2\u65af\u8c93",
  aliases: ["Persian Cat", "\u9577\u6bdb\u6ce2\u65af", "\u6241\u81c9\u6ce2\u65af"],
  origin: {
    country: "\u4f0a\u6717／\u6ce2\u65af",
    history_overview:
      "\u6ce2\u65af\u8c93\u662f\u6700\u77e5\u540d\u7684\u9577\u6bdb\u8c93\u54c1\u7a2e\u4e4b\u4e00，\u4ee5\u8c50\u6eff\u83ef\u9e97\u7684\u88ab\u6bdb、\u5713\u6f64\u8eab\u9ad4\u8207\u6241\u5e73\u9762\u5b54\u805e\u540d。\u6027\u683c\u6eab\u67d4\u5b89\u975c，\u9069\u5408\u5be7\u975c\u7684\u5ba4\u5167\u5bb6\u5ead；\u6bcf\u65e5\u68b3\u6bdb\u662f\u98fc\u990a\u6838\u5fc3\u627f\u8afe。",
  },
  physical_characteristics: {
    eye_color: "\u9285\u6a59\u8272、\u85cd\u8272\u6216\u7570\u8272（\u4f9d\u6bdb\u8272\u800c\u7570）",
    size_category: "\u4e2d\u578b、\u5713\u6f64\u539a\u5be6（cobby）",
    weight_kg: {
      male: { min: 4.5, max: 7.0 },
      female: { min: 3.5, max: 5.5 },
    },
    maturation_years: "\u7d04 2-3 \u5e74",
    coat: {
      length: "Long（\u9577\u6bdb）",
      texture: "\u8c50\u6eff\u67d4\u8edf、\u9700\u6bcf\u65e5\u68b3\u7406",
      undercoat: "\u6fc3\u5bc6\u5e95\u6bdb，\u6613\u6253\u7d50",
    },
  },
  patterns: [
    {
      pattern_id: "solid_longhair",
      name_zh: "\u7d14\u8272\u9577\u6bdb",
      description: "\u767d\u8272、\u85cd\u8272、\u5976\u6cb9\u7b49\u55ae\u8272\u83ef\u9e97\u62ab\u6bdb",
      image_url: "/images/cat-breeds/persian-cream.jpg",
    },
    {
      pattern_id: "bicolor",
      name_zh: "\u96d9\u8272／\u8272\u584a",
      description: "\u767d\u5e95\u914d\u5176\u4ed6\u8272\u584a\u7684\u7d93\u5178\u6ce2\u65af\u5916\u89c0",
      image_url: "/images/cat-breeds/persian-fluffy.jpg",
    },
    {
      pattern_id: "face_type",
      name_zh: "\u6241\u81c9\u69cb\u9020",
      description: "\u5713\u81c9、\u77ed\u9f3b\u8207\u5927\u5713\u773c\u662f\u6ce2\u65af\u7279\u5fb5",
      image_url: "/images/cat-breeds/persian-face.jpg",
    },
  ],
  colors: [
    { color_id: "white_cream", name_zh: "\u767d／\u5976\u6cb9", description: "\u7d93\u5178\u6dfa\u8272\u9577\u6bdb" },
    { color_id: "blue", name_zh: "\u85cd\u8272", description: "\u85cd\u7070\u9577\u6bdb" },
    { color_id: "red_bicolor", name_zh: "\u6a58\u767d／\u7d05\u864e\u6591", description: "\u6696\u8272\u8abf\u96d9\u8272" },
  ],
  personality_traits: ["\u6eab\u67d4", "\u5b89\u975c", "\u512a\u96c5", "\u9ecf\u4eba", "\u7bc0\u594f\u7de9\u6162"],
  care_and_health: {
    environment: "\u5b89\u975c\u7a69\u5b9a\u7684\u5ba4\u5167\u74b0\u5883；\u907f\u514d\u904e\u5ea6\u5608\u96dc\u8207\u9ad8\u8655\u5f37\u903c\u6d3b\u52d5",
    genetic_risks: ["\u591a\u56ca\u814e\u75c5（PKD）\u7b49\u54c1\u7a2e\u76f8\u95dc\u98a8\u96aa——\u8a8d\u990a\u5b9c\u67e5\u5065\u5eb7\u6aa2\u6e2c", "\u6241\u81c9\u76f8\u95dc\u6dda\u6ea2\u8207\u547c\u5438\u8212\u9069\u5ea6", "\u7259\u79d1\u54ac\u5408\u554f\u984c"],
    digestive_health: "\u6ce8\u610f\u6bdb\u7403；\u68b3\u6bdb\u4e0d\u8db3\u6642\u6bdb\u7403\u8207\u8178\u80c3\u4e0d\u9069\u98a8\u96aa\u4e0a\u5347",
    diet_management: "\u512a\u8cea\u6210\u8c93\u7ce7＋\u6709\u52a9\u6bdb\u7403\u63a7\u5236\u7684\u914d\u65b9；\u63a7\u5236\u4efd\u91cf\u907f\u514d\u904e\u91cd",
    grooming: "\u6bcf\u65e5\u68b3\u6bdb\u5fc5\u8981；\u53ef\u5b9a\u671f\u5c08\u696d\u7f8e\u5bb9，\u4f46\u65e5\u5e38\u68b3\u7406\u4e0d\u80fd\u7701",
  },
  media_assets: {
    status: "local_ready",
    images: [
      {
        tag: "hero_main",
        description: "\u7d93\u5178\u6ce2\u65af：\u8c50\u6eff\u9577\u6bdb\u8207\u6241\u5e73\u9762\u5b54\u7684\u512a\u96c5\u4ee3\u8868",
        src: "/images/cat-breeds/persian.jpg",
        alt: "\u5976\u6cb9\u767d\u6ce2\u65af\u8c93\u6b63\u9762\u7279\u5beb",
      },
      {
        tag: "gallery_item_01",
        description: "\u96ea\u767d／\u5976\u6cb9\u9577\u6bdb：\u5713\u6f64\u8f2a\u5ed3\u8207\u67d4\u9806\u88ab\u6bdb",
        src: "/images/cat-breeds/persian-cream.jpg",
        alt: "\u5976\u6cb9\u8272\u6ce2\u65af\u8c93",
      },
      {
        tag: "gallery_item_02",
        description: "\u84ec\u9b06\u62ab\u6bdb\u7279\u5beb：\u83ef\u9e97\u9577\u6bdb\u7684\u8cea\u611f",
        src: "/images/cat-breeds/persian-fluffy.jpg",
        alt: "\u9577\u6bdb\u84ec\u9b06\u7684\u6ce2\u65af\u8c93",
      },
      {
        tag: "gallery_item_03",
        description: "\u81c9\u90e8\u7279\u5beb：\u6241\u81c9\u69cb\u9020\u8207\u5927\u5713\u773c",
        src: "/images/cat-breeds/persian-face.jpg",
        alt: "\u6ce2\u65af\u8c93\u6241\u81c9\u7279\u5beb",
      },
      {
        tag: "gallery_item_04",
        description: "\u8096\u50cf\u89d2\u5ea6：\u6c89\u975c\u512a\u96c5\u7684\u6c23\u8cea",
        src: "/images/cat-breeds/persian-portrait.jpg",
        alt: "\u6ce2\u65af\u8c93\u8096\u50cf",
      },
      {
        tag: "gallery_item_05",
        description: "\u5c45\u5bb6\u5be7\u975c\u6c1b\u570d：\u9069\u5408\u7a69\u5b9a\u4f5c\u606f\u7684\u5ba4\u5167\u4f34\u4fb6",
        src: "/images/cat-breeds/persian-cozy.jpg",
        alt: "\u5728\u5bb6\u4e2d\u4f11\u606f\u7684\u6ce2\u65af\u8c93",
      },
    ],
  },
};

export const SCOTTISH_FOLD_BREED_INFO: CatBreedInfo = {
  breed_id: "scottish_fold",
  name_en: "Scottish Fold",
  name_zh_hk: "\u8607\u683c\u862d\u647a\u8033\u8c93",
  aliases: ["\u6298\u8033\u8c93", "\u647a\u8033", "Scottish Fold"],
  origin: {
    country: "\u8607\u683c\u862d",
    decade: "1960s",
    history_overview:
      "1960 \u5e74\u4ee3\u65bc\u8607\u683c\u862d\u767c\u73fe naturally folded ears \u7684\u8fb2\u5834\u8c93，\u5f8c\u7d93\u80b2\u7a2e\u5b9a\u578b。\u5713\u982d、\u5927\u773c\u8207\u5411\u524d\u4e0b\u6298\u7684\u8033\u6735\u9020\u5c31「\u8c93\u982d\u9df9」\u5916\u8c8c；\u647a\u8033\u4f86\u81ea\u8edf\u9aa8\u767c\u80b2\u76f8\u95dc\u986f\u6027\u57fa\u56e0，\u7e41\u6b96\u4e0a\u9700\u7279\u5225\u8b39\u614e。",
  },
  physical_characteristics: {
    eye_color: "\u91d1\u8272、\u9285\u8272、\u7da0\u8272、\u85cd\u8272（\u4f9d\u6bdb\u8272）",
    size_category: "\u4e2d\u578b、\u5713\u6f64\u7d50\u5be6；\u982d\u5713、\u8eab\u77ed、\u817f\u4e2d\u7b49",
    weight_kg: {
      male: { min: 4.0, max: 6.0 },
      female: { min: 2.7, max: 4.5 },
    },
    maturation_years: "\u7d04 2-3 \u5e74；\u8033\u647a\u901a\u5e38\u65bc\u6578\u9031\u9f61\u958b\u59cb\u51fa\u73fe",
    coat: {
      length: "Short \u6216 Long（\u77ed\u6bdb／\u9577\u6bdb Highland Fold）",
      texture: "\u6fc3\u5bc6\u67d4\u8edf",
      undercoat: "\u9069\u4e2d\u81f3\u539a\u5bc6",
    },
  },
  patterns: [
    { pattern_id: "folded_ears", name_zh: "\u647a\u8033\u7279\u5fb5", description: "\u8033\u5411\u524d\u4e0b\u6298\u8cbc\u982d；\u540c\u7aa9\u4ea6\u53ef\u6709\u7acb\u8033 Scottish Straight", image_url: "" },
    { pattern_id: "solid", name_zh: "\u7d14\u8272", description: "\u85cd、\u767d、\u9ed1、\u5976\u6cb9\u7b49\u5e38\u898b", image_url: "" },
    { pattern_id: "tabby", name_zh: "\u864e\u6591", description: "\u5713\u81c9\u914d\u864e\u6591\u8fa8\u8b58\u5ea6\u9ad8", image_url: "" },
    { pattern_id: "bicolor", name_zh: "\u96d9\u8272／\u9ede\u8272", description: "\u767d\u5e95\u914d\u5176\u4ed6\u8272\u6216\u91cd\u9ede\u8272", image_url: "" },
  ],
  colors: [
    { color_id: "blue", name_zh: "\u85cd\u8272", description: "\u7d93\u5178\u7070\u85cd\u647a\u8033" },
    { color_id: "white", name_zh: "\u767d\u8272", description: "\u5713\u81c9\u5927\u773c\u66f4\u7a81\u51fa" },
    { color_id: "tabby", name_zh: "\u864e\u6591", description: "\u5e38\u898b\u82b1\u8272" },
    { color_id: "bicolor", name_zh: "\u96d9\u8272", description: "\u767d\u5e95\u914d\u8272\u584a" },
  ],
  personality_traits: [
    "\u6eab\u548c\u9ecf\u4eba，\u611f\u60c5\u8c50\u5bcc\u4f46\u4e0d\u5435\u9b27",
    "\u5e38\u51fa\u73fe「\u5927\u53d4\u5750\u59ff」\u7b49\u53ef\u611b\u59ff\u52e2",
    "\u9069\u61c9\u5ba4\u5167\u751f\u6d3b，\u9069\u5408\u5b89\u975c\u966a\u4f34",
    "\u5c0d\u4e3b\u4eba\u4f9d\u6200，\u559c\u6b61\u5f85\u5728\u4eba\u8eab\u908a",
  ],
  care_and_health: {
    environment: "\u907f\u514d\u904e\u9ad8\u8df3\u8e8d\u8207\u5287\u70c8\u649e\u64ca；\u63d0\u4f9b\u4f4e\u77ee\u8df3\u53f0\u8207\u8edf\u588a。\u5ba4\u5167\u98fc\u990a\u70ba\u4e3b",
    genetic_risks: [
      "\u9aa8\u8edf\u9aa8\u767c\u80b2\u4e0d\u826f (Osteochondrodysplasia)——\u647a\u8033\u57fa\u56e0\u76f8\u95dc，\u9700\u5b9a\u671f\u89c0\u5bdf\u6b65\u614b\u8207\u5c3e\u90e8\u67d4\u8edf\u5ea6",
      "\u647a\u8033\u8655\u6613\u85cf\u57a2，\u9700\u5b9a\u671f\u6e05\u6f54\u8033\u9053",
      "\u80a5\u539a\u578b\u5fc3\u808c\u75c5 (HCM，\u90e8\u5206\u8840\u7d71)",
    ],
    digestive_health: "\u6574\u9ad4\u7a69\u5b9a；\u63db\u7ce7\u6f38\u9032",
    diet_management: "\u56b4\u683c\u63a7\u91cd\u4ee5\u6e1b\u8f15\u95dc\u7bc0\u8ca0\u64d4；\u9577\u671f\u88dc\u5145\u8461\u8404\u7cd6\u80fa、\u8edf\u9aa8\u7d20、\u7da0\u5507\u8cbd\u8c9d\u7b49\u95dc\u7bc0\u71df\u990a",
    grooming: "\u77ed\u6bdb\u6bcf\u9031\u68b3 1-2 \u6b21；\u9577\u6bdb\u578b\u66f4\u52e4。\u6bcf\u9031\u6aa2\u67e5\u4e26\u6e05\u6f54\u647a\u8033\u5167\u5074",
  },
  media_assets: {
    status: "localized_gallery_sync",
    instruction_for_cursor: "\u647a\u8033\u5716\u5eab\u5df2\u672c\u5730\u5316：\u85cd\u7070\u82f1\u96c4／\u68da\u62cd／\u6236\u5916／\u864e\u6591／\u767d\u647a\u8033／\u5c45\u5bb6。",
    images: [
      { tag: "hero_main", description: "\u85cd\u7070\u8272\u647a\u8033\u7279\u5beb（\u9285\u773c）", src: "/images/cat-breeds/scottish-fold.jpg", alt: "\u85cd\u7070\u8272\u8607\u683c\u862d\u647a\u8033\u8c93" },
      { tag: "gallery_item_1", description: "\u68da\u62cd\u5168\u8eab\u647a\u8033", src: "/images/cat-breeds/scottish-fold-studio.jpg", alt: "\u8607\u683c\u862d\u647a\u8033\u8c93\u68da\u62cd" },
      { tag: "gallery_item_2", description: "\u6236\u5916\u85e4\u7c43\u4e2d\u7684\u647a\u8033", src: "/images/cat-breeds/scottish-fold-outdoor.jpg", alt: "\u6236\u5916\u8607\u683c\u862d\u647a\u8033\u8c93" },
      { tag: "gallery_item_3", description: "\u68d5\u8272\u864e\u6591\u647a\u8033\u8fd1\u62cd", src: "/images/cat-breeds/scottish-fold-tabby.jpg", alt: "\u864e\u6591\u8607\u683c\u862d\u647a\u8033\u8c93" },
      { tag: "gallery_item_4", description: "\u767d\u8272\u647a\u8033\u5927\u53d4\u5750\u59ff", src: "/images/cat-breeds/scottish-fold-white.jpg", alt: "\u767d\u8272\u8607\u683c\u862d\u647a\u8033\u8c93" },
      { tag: "gallery_item_5", description: "\u5c45\u5bb6\u4f11\u606f\u7684\u647a\u8033", src: "/images/cat-breeds/scottish-fold-cozy.jpg", alt: "\u4f11\u606f\u4e2d\u7684\u8607\u683c\u862d\u647a\u8033\u8c93" },
    ],
  },
};

export const SIAMESE_BREED_INFO: CatBreedInfo = {
  breed_id: "siamese",
  name_en: "Siamese",
  name_zh_hk: "\u66b9\u7f85\u8c93",
  aliases: ["\u66b9\u7f85", "Thai cat", "\u8a71\u9738\u8c93"],
  origin: {
    country: "\u6cf0\u570b（\u6614\u7a31\u66b9\u7f85）",
    history_overview:
      "\u6771\u5357\u4e9e\u53e4\u8001\u7687\u5ba4\u8c93\u7a2e，\u4ee5\u91cd\u9ede\u8272（colorpoint）、\u674f\u4ec1\u85cd\u773c\u8207\u4fee\u9577\u9ad4\u614b\u805e\u540d。\u73fe\u4ee3\u79c0\u5834\u578b\u66f4\u70ba\u4fee\u9577；\u50b3\u7d71\u578b（Thai／\u860b\u679c\u982d）\u81c9\u578b\u8f03\u5713。\u6027\u683c\u71b1\u60c5\u591a\u8a71，\u6975\u4f9d\u8cf4\u4e3b\u4eba。",
  },
  physical_characteristics: {
    eye_color: "\u5fc5\u70ba\u6df1\u9083\u85cd\u8272（\u674f\u4ec1\u773c）",
    size_category: "\u4e2d\u578b\u4fee\u9577（Oriental／\u7ba1\u72c0\u9ad4\u578b），\u808c\u8089\u7d50\u5be6",
    weight_kg: {
      male: { min: 3.0, max: 5.0 },
      female: { min: 2.5, max: 4.0 },
    },
    maturation_years: "\u7d04 1-2 \u5e74；\u91cd\u9ede\u8272\u96a8\u6210\u9577\u8207\u6eab\u5ea6\u52a0\u6df1",
    coat: {
      length: "Short（\u77ed\u6bdb）",
      texture: "\u8cbc\u8eab、\u7d30\u5bc6、\u5c11\u5e95\u6bdb",
      undercoat: "\u7a00\u758f；\u5e7e\u4e4e\u4e0d\u6389\u6bdb",
    },
  },
  patterns: [
    { pattern_id: "seal_point", name_zh: "\u6d77\u8c79\u91cd\u9ede\u8272", description: "\u81c9\u8033\u8173\u5c3e\u6df1\u8910\u8fd1\u9ed1，\u8ec0\u5e79\u5976\u6cb9\u8272——\u6700\u7d93\u5178", image_url: "" },
    { pattern_id: "chocolate_point", name_zh: "\u5de7\u514b\u529b\u91cd\u9ede\u8272", description: "\u5976\u8336\u8910\u91cd\u9ede，\u6574\u9ad4\u8f03\u67d4\u548c", image_url: "" },
    { pattern_id: "blue_point", name_zh: "\u85cd\u8272\u91cd\u9ede\u8272", description: "\u85cd\u7070\u91cd\u9ede\u914d\u51b7\u8abf\u8ec0\u5e79", image_url: "" },
    { pattern_id: "lilac_point", name_zh: "\u4e01\u9999\u91cd\u9ede\u8272", description: "\u7c89\u7070\u6de1\u7d2b\u91cd\u9ede，\u6700\u6de1\u96c5", image_url: "" },
  ],
  colors: [
    { color_id: "seal", name_zh: "\u6d77\u8c79\u8272", description: "\u7d93\u5178\u6df1\u8910\u91cd\u9ede" },
    { color_id: "chocolate", name_zh: "\u5de7\u514b\u529b\u8272", description: "\u6696\u8910\u91cd\u9ede" },
    { color_id: "blue", name_zh: "\u85cd\u8272", description: "\u85cd\u7070\u91cd\u9ede" },
    { color_id: "lilac", name_zh: "\u4e01\u9999\u8272", description: "\u6de1\u7d2b\u7070\u91cd\u9ede" },
  ],
  personality_traits: [
    "\u8c93\u754c\u8a71\u9738：\u8a9e\u8abf\u8c50\u5bcc，\u559c\u6b61\u8207\u4e3b\u4eba「\u5c0d\u8a71」",
    "\u6975\u5ea6\u9ecf\u4eba\u8207\u71b1\u60c5，\u5206\u96e2\u7126\u616e\u98a8\u96aa\u8f03\u9ad8",
    "\u8070\u660e\u8b66\u89ba、\u597d\u5947\u5fc3\u5f37，\u9069\u5408\u76ca\u667a\u904a\u6232",
    "\u9700\u8981\u5927\u91cf\u4e92\u52d5，\u4e0d\u9069\u5408\u9577\u671f\u7368\u8655",
  ],
  care_and_health: {
    environment: "\u6015\u51b7；\u51ac\u5b63\u9700\u6696\u5e8a。\u9700\u8981\u966a\u4f34\u8207\u5782\u76f4\u6d3b\u52d5\u7a7a\u9593；\u53ef\u8a13\u7df4\u4e92\u52d5",
    genetic_risks: ["\u9032\u884c\u6027\u8996\u7db2\u819c\u840e\u7e2e (PRA，\u90e8\u5206\u8840\u7d71)", "\u6fb1\u7c89\u6a23\u8b8a\u6027／\u809d\u814e\u554f\u984c（\u90e8\u5206\u53e4\u8001\u8840\u7d71\u9700\u7559\u610f）", "\u7259\u79d1\u8207\u4e0a\u547c\u5438\u9053\u9700\u5b9a\u671f\u6aa2\u67e5"],
    digestive_health: "\u654f\u611f\u9ad4\u8cea\u4e0d\u5c11\u898b；\u63db\u7ce7\u9700 7-10 \u5929\u904e\u6e21",
    diet_management: "\u9ad8\u86cb\u767d、\u9069\u4e2d\u8102\u80aa\u7dad\u6301\u4fee\u9577\u9ad4\u578b；\u8db3\u5920\u76ca\u667a\u9935\u98df\u6e1b\u5c11\u7121\u804a\u66b4\u98df",
    grooming: "\u77ed\u6bdb\u6bcf\u9031\u8f15\u68b3 1 \u6b21\u5373\u53ef；\u5b9a\u671f\u5237\u7259\u8207\u8033\u90e8\u6aa2\u67e5",
  },
  media_assets: {
    status: "localized_gallery_sync",
    instruction_for_cursor: "\u66b9\u7f85\u5716\u5eab\u5df2\u672c\u5730\u5316：\u82f1\u96c4／\u6d77\u8c79\u9ede／\u7279\u5beb／\u85cd\u773c／\u7d93\u5178\u96cc\u8c93／\u5de7\u514b\u529b\u9ede。",
    images: [
      { tag: "hero_main", description: "\u6d77\u8c79\u91cd\u9ede\u8272\u66b9\u7f85（\u85cd\u773c）", src: "/images/cat-breeds/siamese.jpg", alt: "\u6d77\u8c79\u91cd\u9ede\u8272\u66b9\u7f85\u8c93" },
      { tag: "gallery_item_1", description: "\u6d77\u8c79\u9ede\u5168\u8eab\u8207\u9762\u7f69", src: "/images/cat-breeds/siamese-seal.jpg", alt: "\u6d77\u8c79\u9ede\u66b9\u7f85\u8c93\u5168\u8eab" },
      { tag: "gallery_item_2", description: "\u85cd\u773c\u674f\u4ec1\u773c\u7279\u5beb", src: "/images/cat-breeds/siamese-portrait.jpg", alt: "\u66b9\u7f85\u8c93\u85cd\u773c\u7279\u5beb" },
      { tag: "gallery_item_3", description: "\u512a\u96c5\u5750\u59ff\u66b9\u7f85", src: "/images/cat-breeds/siamese-blue.jpg", alt: "\u5750\u59ff\u66b9\u7f85\u8c93" },
      { tag: "gallery_item_4", description: "\u7d93\u5178\u96cc\u66b9\u7f85", src: "/images/cat-breeds/siamese-classic.jpg", alt: "\u7d93\u5178\u66b9\u7f85\u8c93" },
      { tag: "gallery_item_5", description: "\u5de7\u514b\u529b\u91cd\u9ede\u8272", src: "/images/cat-breeds/siamese-chocolate.jpg", alt: "\u5de7\u514b\u529b\u9ede\u66b9\u7f85\u8c93" },
    ],
  },
};

export const BENGAL_BREED_INFO: CatBreedInfo = {
  breed_id: "bengal",
  name_en: "Bengal",
  name_zh_hk: "\u5b5f\u52a0\u62c9\u8c93",
  aliases: ["\u8c79\u8c93", "Bengal", "\u73ab\u7470\u6591"],
  origin: {
    country: "\u7f8e\u570b",
    decade: "1970s-1980s",
    history_overview:
      "\u4ee5\u4e9e\u6d32\u8c79\u8c93\u8207\u5bb6\u8c93\u96dc\u4ea4\u5f8c\u4ee3\u7d93\u591a\u4ee3\u9078\u80b2\u800c\u6210\u7684\u5bb6\u8c93\u54c1\u7a2e，\u4fdd\u7559\u91ce\u6027\u8c79\u7d0b\u537b\u500b\u6027\u53ef\u89aa。\u4ee5\u73ab\u7470\u6591（rosettes）、\u91d1\u5c6c\u5149\u6fa4\u77ed\u6bdb\u8207\u7206\u767c\u529b\u8457\u7a31，\u662f\u7cbe\u529b\u5145\u6c9b\u7684\u904b\u52d5\u578b\u4f34\u4fb6。",
  },
  physical_characteristics: {
    eye_color: "\u7da0\u8272、\u91d1\u8272（\u96ea\u7cfb\u53ef\u6709\u85cd\u773c）",
    size_category: "\u4e2d\u81f3\u5927\u578b、\u808c\u8089\u767c\u9054、\u5f8c\u80a2\u6709\u529b",
    weight_kg: {
      male: { min: 4.5, max: 7.5 },
      female: { min: 3.5, max: 5.5 },
    },
    maturation_years: "\u7d04 2-3 \u5e74；\u6591\u7d0b\u96a8\u6210\u9577\u66f4\u6e05\u6670",
    coat: {
      length: "Short（\u77ed\u6bdb）",
      texture: "\u5bc6\u800c\u67d4\u8edf，\u5e38\u5e36「\u91d1\u9583／\u73cd\u73e0」\u91d1\u5c6c\u5149\u6fa4",
      undercoat: "\u9069\u4e2d；\u6389\u6bdb\u91cf\u901a\u5e38\u4e0d\u9ad8",
    },
  },
  patterns: [
    { pattern_id: "rosetted", name_zh: "\u73ab\u7470\u6591 (Rosettes)", description: "\u6700\u53d7\u6b61\u8fce：\u74b0\u72c0／\u7bad\u982d\u72c0\u8c79\u7d0b", image_url: "" },
    { pattern_id: "spotted", name_zh: "\u9ede\u6591", description: "\u6e05\u6670\u5713\u9ede\u6216\u788e\u6591", image_url: "" },
    { pattern_id: "marble", name_zh: "\u5927\u7406\u77f3\u7d0b", description: "\u6c34\u5e73\u6f29\u6e26\u6a6b\u7d0b，\u5982\u6d41\u52d5\u8c79\u7d0b", image_url: "" },
    { pattern_id: "snow", name_zh: "\u96ea\u7cfb (Snow)", description: "\u6dfa\u5e95\u6df1\u6591，\u90e8\u5206\u70ba\u91cd\u9ede\u8272\u85cd\u773c", image_url: "" },
  ],
  colors: [
    { color_id: "brown", name_zh: "\u68d5\u8272／\u91d1\u8272", description: "\u7d93\u5178\u91d1\u5e95\u9ed1\u8910\u6591" },
    { color_id: "silver", name_zh: "\u9280\u8272", description: "\u9280\u767d\u5e95\u914d\u9ed1\u6591" },
    { color_id: "snow_lynx", name_zh: "\u96ea\u5c71\u8c93", description: "\u6dfa\u8272\u91cd\u9ede\u611f，\u85cd\u773c" },
    { color_id: "charcoal", name_zh: "\u70ad\u9ed1\u7cfb", description: "\u6df1\u8272\u7f69\u6bdb\u5c0d\u6bd4\u5f37" },
  ],
  personality_traits: [
    "\u7cbe\u529b\u7121\u9650，\u9700\u8981\u5927\u91cf\u904a\u6232\u8207\u6500\u722c",
    "\u81ea\u4fe1\u52c7\u6562，\u559c\u6b61\u63a2\u7d22\u8207\u73a9\u6c34",
    "\u8070\u660e\u53ef\u8a13\u7df4，\u9069\u5408\u8dd1\u8f2a\u8207\u9ede\u64ca\u8a13\u7df4",
    "\u5c0d\u4eba\u53cb\u5584，\u4f46\u9700\u8981\u8db3\u5920\u6d3b\u52d5\u51fa\u53e3\u5426\u5247\u6613\u6417\u86cb",
  ],
  care_and_health: {
    environment: "\u5fc5\u9808\u6709\u9ad8\u5927\u8c93\u6a39、\u8dd1\u8f2a\u8207\u6bcf\u65e5 30-45 \u5206\u9418\u9ad8\u5f37\u5ea6\u4e92\u52d5；\u53ef\u63d0\u4f9b\u6c34\u6c60／\u6c34\u9f8d\u982d\u904a\u6232",
    genetic_risks: ["\u80a5\u539a\u578b\u5fc3\u808c\u75c5 (HCM)", "\u6241\u5e73\u80f8\u75c7\u5019\u7fa4（\u5e7c\u8c93\u5076\u898b）", "\u9032\u884c\u6027\u8996\u7db2\u819c\u840e\u7e2e (PRA-b，\u512a\u826f\u5834\u6703\u7be9\u6aa2)"],
    digestive_health: "\u90e8\u5206\u500b\u9ad4\u8178\u80c3\u654f\u611f；\u63db\u7ce7\u6f38\u9032、\u53ef\u9078\u9ad8\u6d88\u5316\u7387\u914d\u65b9",
    diet_management: "\u9ad8\u52d5\u7269\u86cb\u767d\u652f\u6301\u808c\u8089；\u88dc\u725b\u78fa\u9178\u8207\u95dc\u7bc0\u71df\u990a；\u63a7\u5236\u96f6\u98df\u907f\u514d\u904e\u80d6",
    grooming: "\u77ed\u6bdb\u6bcf\u9031\u68b3 1 \u6b21\u5373\u53ef；\u5b9a\u671f\u6307\u7532\u8207\u53e3\u8154\u8b77\u7406",
  },
  media_assets: {
    status: "localized_gallery_sync",
    instruction_for_cursor: "\u5b5f\u52a0\u62c9\u5716\u5eab\u5df2\u672c\u5730\u5316：\u82f1\u96c4／\u73ab\u7470\u6591／\u9ede\u6591／\u904b\u52d5\u59ff／\u91d1\u8272／\u5168\u8eab。",
    images: [
      { tag: "hero_main", description: "\u91d1\u5e95\u73ab\u7470\u6591\u5b5f\u52a0\u62c9", src: "/images/cat-breeds/bengal.jpg", alt: "\u5b5f\u52a0\u62c9\u8c79\u8c93" },
      { tag: "gallery_item_1", description: "\u6e05\u6670\u73ab\u7470\u6591\u7279\u5beb", src: "/images/cat-breeds/bengal-rosette.jpg", alt: "\u73ab\u7470\u6591\u5b5f\u52a0\u62c9\u8c93" },
      { tag: "gallery_item_2", description: "\u9ede\u6591\u8c79\u7d0b", src: "/images/cat-breeds/bengal-spots.jpg", alt: "\u9ede\u6591\u5b5f\u52a0\u62c9\u8c93" },
      { tag: "gallery_item_3", description: "\u808c\u8089\u767c\u9054\u904b\u52d5\u59ff\u614b", src: "/images/cat-breeds/bengal-athletic.jpg", alt: "\u904b\u52d5\u4e2d\u7684\u5b5f\u52a0\u62c9\u8c93" },
      { tag: "gallery_item_4", description: "\u91d1\u8272\u91d1\u5c6c\u5149\u6fa4\u88ab\u6bdb", src: "/images/cat-breeds/bengal-golden.jpg", alt: "\u91d1\u8272\u5b5f\u52a0\u62c9\u8c93" },
      { tag: "gallery_item_5", description: "\u5168\u8eab\u6591\u7d0b\u5c55\u793a", src: "/images/cat-breeds/bengal-full.jpg", alt: "\u5b5f\u52a0\u62c9\u8c93\u5168\u8eab\u7167" },
    ],
  },
};

export const SPHYNX_BREED_INFO: CatBreedInfo = {
  breed_id: "sphynx",
  name_en: "Sphynx",
  name_zh_hk: "\u65af\u82ac\u514b\u65af\u7121\u6bdb\u8c93",
  aliases: ["\u7121\u6bdb\u8c93", "\u52a0\u62ff\u5927\u7121\u6bdb\u8c93", "Sphynx"],
  origin: {
    country: "\u52a0\u62ff\u5927",
    decade: "1960s",
    history_overview:
      "1960 \u5e74\u4ee3\u52a0\u62ff\u5927\u81ea\u7136\u7a81\u8b8a\u7684\u7121\u6bdb\u5c0f\u8c93\u7d93\u9078\u80b2\u800c\u6210。\u770b\u4f3c\u7121\u6bdb，\u5be6\u70ba\u6975\u7d30\u7d68\u6216\u5b8c\u5168\u88f8\u819a，\u89f8\u611f\u5982\u6eab\u6696\u6843\u76ae。\u71b1\u60c5\u9ecf\u4eba，\u4ee3\u8b1d\u9ad8、\u6015\u51b7，\u9700\u7279\u5225\u8b77\u819a\u8207\u4fdd\u6696。",
  },
  physical_characteristics: {
    eye_color: "\u4efb\u4f55\u8272（\u7da0、\u91d1、\u85cd、\u7570\u8272\u7b49）",
    size_category: "\u4e2d\u578b、\u808c\u8089\u7d50\u5be6、\u809a\u76ae\u5713\u6f64；\u5927\u8033、\u76ba\u76ae\u819a",
    weight_kg: {
      male: { min: 3.5, max: 5.5 },
      female: { min: 2.5, max: 4.5 },
    },
    maturation_years: "\u7d04 2 \u5e74",
    coat: {
      length: "Hairless／\u6975\u77ed\u7d68（\u7121\u6bdb\u81f3\u6843\u76ae\u7d68）",
      texture: "\u6eab\u6696\u5982\u9e82\u76ae；\u76ae\u819a\u591a\u76ba\u8936（\u984d、\u9838、\u817f）",
      undercoat: "\u7121\u50b3\u7d71\u88ab\u6bdb；\u76ae\u8102\u5206\u6ccc\u8f03\u660e\u986f",
    },
  },
  patterns: [
    { pattern_id: "solid", name_zh: "\u7d14\u8272\u76ae\u819a", description: "\u7c89、\u7070、\u9ed1\u7b49\u55ae\u8272\u8272\u7d20\u6c89\u8457", image_url: "" },
    { pattern_id: "bicolor", name_zh: "\u96d9\u8272／\u767d\u6591", description: "\u76ae\u819a\u8272\u7d20\u584a\u9762\u5982\u96d9\u8272\u8c93", image_url: "" },
    { pattern_id: "pointed", name_zh: "\u91cd\u9ede\u8272\u611f", description: "\u81c9\u8033\u8173\u8272\u7d20\u8f03\u6df1", image_url: "" },
    { pattern_id: "calico_tortie", name_zh: "\u4e09\u82b1／\u73b3\u7441\u8272\u584a", description: "\u591a\u8272\u8272\u7d20\u6591\u99c1", image_url: "" },
  ],
  colors: [
    { color_id: "pink_white", name_zh: "\u7c89\u767d", description: "\u6dfa\u8272\u7d20\u5e38\u898b" },
    { color_id: "black_grey", name_zh: "\u6df1\u7070／\u9ed1", description: "\u6df1\u8272\u7d20\u76ae\u819a" },
    { color_id: "calico", name_zh: "\u4e09\u82b1\u8272\u584a", description: "\u591a\u8272\u6591\u99c1" },
    { color_id: "tuxedo", name_zh: "\u71d5\u5c3e\u670d\u8272\u584a", description: "\u6df1\u6dfa\u5c0d\u6bd4\u5206\u660e" },
  ],
  personality_traits: [
    "\u71b1\u60c5\u5982\u706b、\u6975\u5ea6\u9ecf\u4eba，\u88ab\u7a31\u70ba\u8c93\u754c\u5c0f\u5916\u661f\u4eba",
    "\u53cb\u5584\u597d\u5ba2，\u5e38\u4e3b\u52d5\u8fce\u63a5\u8a2a\u5ba2",
    "\u667a\u5546\u9ad8、\u611b\u73a9，\u9700\u8981\u966a\u4f34\u8207\u904a\u6232",
    "\u559c\u6b61\u947d\u88ab\u7aa9\u53d6\u6696，\u8cbc\u8eab\u7761\u7720",
  ],
  care_and_health: {
    environment: "\u6975\u5ea6\u6015\u51b7\u8207\u66ec\u50b7；\u51ac\u5929\u7a7f\u8863／\u6696\u5e8a，\u590f\u5929\u9632\u66ec。\u5ba4\u5167\u98fc\u990a",
    genetic_risks: ["\u80a5\u539a\u578b\u5fc3\u808c\u75c5 (HCM)——\u5efa\u8b70\u5b9a\u671f\u5fc3\u81df\u6aa2\u67e5", "\u76ae\u819a\u904e\u654f／\u6cb9\u8102\u5806\u7a4d\u5f15\u8d77\u7c89\u523a", "\u8033\u9053\u6cb9\u8102\u9700\u52e4\u6e05\u7406"],
    digestive_health: "\u4ee3\u8b1d\u9ad8、\u98df\u91cf\u5927；\u7559\u610f\u4fbf\u72c0\u8207\u76ae\u819a\u6cb9\u5206\u5e73\u8861",
    diet_management: "\u57fa\u790e\u4ee3\u8b1d\u9ad8，\u9700\u8f03\u9ad8\u71b1\u91cf\u512a\u8cea\u98f2\u98df；\u88dc Omega-3/6 \u8207\u7dad\u751f\u7d20 B \u7fa4\u8b77\u819a",
    grooming: "\u6bcf\u9031\u6eab\u6c34\u6d17\u6fa1 1 \u6b21\u53bb\u6cb9\u8102；\u6bcf\u65e5\u64e6\u8033\u8207\u8dbe\u9593；\u9632\u66ec\u8207\u4fdd\u6fd5\u4e26\u91cd",
  },
  media_assets: {
    status: "localized_gallery_sync",
    instruction_for_cursor: "\u65af\u82ac\u514b\u65af\u5716\u5eab\u5df2\u672c\u5730\u5316：\u82f1\u96c4／\u4e09\u82b1／\u71d5\u5c3e\u670d／\u7279\u5beb／\u5e7c\u8c93／\u5074\u81c9\u76ba\u8936。",
    images: [
      { tag: "hero_main", description: "\u7d93\u5178\u76ba\u76ae\u819a\u7121\u6bdb\u8c93", src: "/images/cat-breeds/sphynx.jpg", alt: "\u65af\u82ac\u514b\u65af\u7121\u6bdb\u8c93" },
      { tag: "gallery_item_1", description: "\u4e09\u82b1\u8272\u584a\u76ae\u819a", src: "/images/cat-breeds/sphynx-calico.jpg", alt: "\u4e09\u82b1\u65af\u82ac\u514b\u65af" },
      { tag: "gallery_item_2", description: "\u71d5\u5c3e\u670d\u8272\u584a\u5168\u8eab", src: "/images/cat-breeds/sphynx-tuxedo.jpg", alt: "\u71d5\u5c3e\u670d\u8272\u65af\u82ac\u514b\u65af" },
      { tag: "gallery_item_3", description: "\u5927\u8033\u85cd\u773c\u7279\u5beb", src: "/images/cat-breeds/sphynx-portrait.jpg", alt: "\u65af\u82ac\u514b\u65af\u81c9\u90e8\u7279\u5beb" },
      { tag: "gallery_item_4", description: "\u7121\u6bdb\u5e7c\u8c93", src: "/images/cat-breeds/sphynx-kitten.jpg", alt: "\u65af\u82ac\u514b\u65af\u5e7c\u8c93" },
      { tag: "gallery_item_5", description: "\u9838\u90e8\u76ba\u8936\u5074\u81c9", src: "/images/cat-breeds/sphynx-profile.jpg", alt: "\u65af\u82ac\u514b\u65af\u5074\u81c9" },
    ],
  },
};

export const DEVON_REX_BREED_INFO: CatBreedInfo = {
  breed_id: "devon_rex",
  name_en: "Devon Rex",
  name_zh_hk: "\u5fb7\u6587\u5377\u6bdb\u8c93",
  aliases: ["\u5fb7\u6587", "\u5c0f\u7cbe\u9748\u8c93", "Devon Rex"],
  origin: {
    country: "\u82f1\u570b",
    state: "\u5fb7\u6587\u90e1",
    decade: "1960s",
    history_overview:
      "1960 \u5e74\u4ee3\u82f1\u570b\u5fb7\u6587\u90e1\u767c\u73fe\u7684\u81ea\u7136\u5377\u6bdb\u7a81\u8b8a。\u5927\u8033、\u5927\u773c、\u77ed\u543b\u8207\u6ce2\u6d6a\u7d68\u6bdb\u9020\u5c31「\u5c0f\u7cbe\u9748／\u57c3\u7279\u5916\u661f\u4eba」\u5916\u8c8c。\u6389\u6bdb\u5c11、\u9ad4\u578b\u8f15\u5de7，\u6975\u9069\u5408\u90fd\u5e02\u516c\u5bd3\u751f\u6d3b。",
  },
  physical_characteristics: {
    eye_color: "\u4efb\u4f55\u8272（\u91d1、\u7da0、\u85cd、\u7570\u8272\u7b49）",
    size_category: "\u5c0f\u578b\u81f3\u4e2d\u578b、\u7e96\u7d30；\u982d\u5448\u6954\u5f62、\u8033\u5de8\u5927\u4f4e\u4f4d",
    weight_kg: {
      male: { min: 3.0, max: 4.5 },
      female: { min: 2.5, max: 3.5 },
    },
    maturation_years: "\u7d04 1.5-2 \u5e74",
    coat: {
      length: "Short wavy／curly（\u77ed\u5377\u6bdb）",
      texture: "\u67d4\u8edf\u6ce2\u6d6a\u81f3\u6372\u66f2，\u89f8\u611f\u5982\u71c8\u82af\u7d68",
      undercoat: "\u7a00\u758f；\u90e8\u5206\u500b\u9ad4\u6bdb\u91cf\u8f03\u5c11（\u4ecd\u975e\u7121\u6bdb）",
    },
  },
  patterns: [
    { pattern_id: "solid", name_zh: "\u7d14\u8272\u5377\u6bdb", description: "\u9ed1、\u85cd、\u767d、\u5976\u6cb9\u7b49", image_url: "" },
    { pattern_id: "bicolor", name_zh: "\u96d9\u8272", description: "\u767d\u5e95\u914d\u6df1\u8272\u584a\u5e38\u898b", image_url: "" },
    { pattern_id: "pointed", name_zh: "\u91cd\u9ede\u8272", description: "\u5976\u6cb9／\u4e01\u9999\u7b49\u91cd\u9ede\u8272\u5377\u6bdb", image_url: "" },
    { pattern_id: "tabby_tortie", name_zh: "\u864e\u6591／\u73b3\u7441", description: "\u5377\u6bdb\u4e0a\u53ef\u898b\u6591\u7d0b\u6216\u73b3\u7441\u8272", image_url: "" },
  ],
  colors: [
    { color_id: "blue", name_zh: "\u85cd\u8272", description: "\u7d93\u5178\u7070\u85cd\u5377\u6bdb" },
    { color_id: "black_white", name_zh: "\u9ed1\u767d", description: "\u96d9\u8272\u5c0d\u6bd4\u9bae\u660e" },
    { color_id: "cream_point", name_zh: "\u5976\u6cb9\u91cd\u9ede", description: "\u67d4\u548c\u6dfa\u8272\u9ede" },
    { color_id: "lilac_point", name_zh: "\u4e01\u9999\u91cd\u9ede", description: "\u6de1\u7d2b\u7070\u91cd\u9ede" },
  ],
  personality_traits: [
    "\u50cf\u5c0f\u7cbe\u9748：\u8abf\u76ae\u6d3b\u6f51、\u559c\u611f\u5341\u8db3",
    "\u6975\u89aa\u4eba\u985e，\u5e38\u8df3\u4e0a\u80a9\u8180\u966a\u4f34",
    "\u8070\u660e\u611b\u73a9，\u9069\u5408\u4e92\u52d5\u73a9\u5177",
    "\u6389\u6bdb\u5c11，\u9069\u5408\u5728\u610f\u8c93\u6bdb\u7684\u90fd\u5e02\u5bb6\u5ead",
  ],
  care_and_health: {
    environment: "\u6015\u51b7（\u6bdb\u8584）；\u63d0\u4f9b\u6696\u8655。\u559c\u6b61\u9ad8\u8655\u8207\u4eba\u80a9；\u5ba4\u5167\u98fc\u990a",
    genetic_risks: ["\u80a5\u539a\u578b\u5fc3\u808c\u75c5 (HCM)", "\u907a\u50b3\u6027\u808c\u75c5（\u90e8\u5206\u8840\u7d71，\u512a\u826f\u5834\u6703\u6ce8\u610f）", "\u5927\u8033\u9700\u5b9a\u671f\u6aa2\u67e5\u8033\u9053"],
    digestive_health: "\u901a\u5e38\u826f\u597d；\u63db\u7ce7\u6f38\u9032",
    diet_management: "\u9ad8\u54c1\u8cea\u86cb\u767d\u7dad\u6301\u8f15\u5de7\u808c\u8089；\u9069\u91cf\u92c5\u8207\u751f\u7269\u7d20\u6709\u52a9\u5377\u6bdb\u72c0\u614b",
    grooming: "\u5377\u6bdb\u5e7e\u4e4e\u4e0d\u6389，\u5076\u723e\u6fd5\u5e03\u64e6\u62ed\u5373\u53ef；\u907f\u514d\u904e\u5ea6\u68b3\u5237\u62c9\u65b7\u5377\u6bdb；\u5b9a\u671f\u6e05\u8033",
  },
  media_assets: {
    status: "localized_gallery_sync",
    instruction_for_cursor: "\u5fb7\u6587\u5716\u5eab\u5df2\u672c\u5730\u5316：\u85cd\u7070\u82f1\u96c4／\u96d9\u8272／\u5377\u6bdb\u7279\u5beb／\u5976\u6cb9\u9ede／\u6236\u5916／\u4e01\u9999\u9ede。",
    images: [
      { tag: "hero_main", description: "\u85cd\u8272\u5fb7\u6587\u5377\u6bdb\u5168\u8eab（\u5927\u8033）", src: "/images/cat-breeds/devon-rex.jpg", alt: "\u5fb7\u6587\u5377\u6bdb\u8c93" },
      { tag: "gallery_item_1", description: "\u9ed1\u767d\u96d9\u8272\u5fb7\u6587", src: "/images/cat-breeds/devon-rex-bicolor.jpg", alt: "\u96d9\u8272\u5fb7\u6587\u5377\u6bdb\u8c93" },
      { tag: "gallery_item_2", description: "\u6ce2\u6d6a\u5377\u6bdb\u8fd1\u8ddd\u96e2", src: "/images/cat-breeds/devon-rex-coat.jpg", alt: "\u5fb7\u6587\u5377\u6bdb\u7279\u5beb" },
      { tag: "gallery_item_3", description: "\u5976\u6cb9\u91cd\u9ede\u8272", src: "/images/cat-breeds/devon-rex-cream.jpg", alt: "\u5976\u6cb9\u9ede\u5fb7\u6587\u5377\u6bdb\u8c93" },
      { tag: "gallery_item_4", description: "\u6236\u5916\u5377\u6bdb\u7d30\u7bc0", src: "/images/cat-breeds/devon-rex-outdoor.jpg", alt: "\u6236\u5916\u5fb7\u6587\u5377\u6bdb\u8c93" },
      { tag: "gallery_item_5", description: "\u4e01\u9999\u91cd\u9ede\u8272\u68da\u62cd", src: "/images/cat-breeds/devon-rex-lilac.jpg", alt: "\u4e01\u9999\u9ede\u5fb7\u6587\u5377\u6bdb\u8c93" },
    ],
  },
};

export const MIX_SHORTHAIR_BREED_INFO: CatBreedInfo = {
  breed_id: "mix_shorthair",
  name_en: "Domestic Shorthair (Mix)",
  name_zh_hk: "\u5510\u8c93 / \u6e2f\u77ed (\u7c73\u514b\u65af)",
  aliases: ["\u5510\u8c93", "\u6e2f\u77ed", "\u7c73\u514b\u65af", "\u5bb6\u8c93", "DSH"],
  origin: {
    country: "\u9999\u6e2f／\u4e9e\u6d32\u5730\u5340（\u5168\u7403\u666e\u904d）",
    history_overview:
      "\u975e\u55ae\u4e00\u7d14\u7a2e，\u800c\u662f\u5404\u5730\u81ea\u7136\u7e41\u884d\u8207\u6df7\u8840\u7684\u77ed\u6bdb\u5bb6\u8c93。\u5728\u9999\u6e2f\u5e38\u7a31\u5510\u8c93\u6216\u6e2f\u77ed，\u82b1\u8272\u8207\u6027\u683c\u5343\u8b8a\u842c\u5316，\u666e\u904d\u9ad4\u8cea\u5f37\u5065、\u9069\u61c9\u529b\u6975\u4f73，\u662f\u6700\u591a\u5bb6\u5ead\u9078\u64c7\u7684\u5fe0\u5be6\u966a\u4f34\u8005。",
  },
  physical_characteristics: {
    eye_color: "\u91d1\u8272、\u7da0\u8272、\u85cd\u8272、\u7570\u8272\u77b3（\u4f9d\u500b\u9ad4）",
    size_category: "\u5c0f\u578b\u81f3\u4e2d\u5927\u578b\u7686\u6709；\u9ad4\u578b\u591a\u6a23",
    weight_kg: {
      male: { min: 3.5, max: 6.5 },
      female: { min: 2.5, max: 5.0 },
    },
    maturation_years: "\u7d04 1-2 \u5e74",
    coat: {
      length: "Short（\u77ed\u6bdb\u70ba\u4e3b；\u4ea6\u6709\u4e2d\u9577\u6bdb\u7c73\u514b\u65af）",
      texture: "\u4f9d\u8840\u7d71\u800c\u7570，\u591a\u70ba\u6613\u6253\u7406\u77ed\u6bdb",
      undercoat: "\u9069\u4e2d；\u63db\u6bdb\u5b63\u4ecd\u9700\u68b3\u6bdb",
    },
  },
  patterns: [
    { pattern_id: "tabby", name_zh: "\u864e\u6591", description: "\u9999\u6e2f\u6700\u5e38\u898b：\u9bc9\u9b5a\u7d0b、\u65cb\u6e26\u7d0b、\u9ede\u6591", image_url: "" },
    { pattern_id: "orange", name_zh: "\u6a58\u8c93", description: "\u6696\u6a58／\u6a58\u767d，\u6027\u683c\u5e38\u88ab\u5f62\u5bb9\u958b\u6717", image_url: "" },
    { pattern_id: "tuxedo_bicolor", name_zh: "\u71d5\u5c3e\u670d／\u96d9\u8272", description: "\u9ed1\u767d\u5206\u660e\u6216\u767d\u5e95\u8272\u584a", image_url: "" },
    { pattern_id: "calico_tortie_solid", name_zh: "\u4e09\u82b1／\u73b3\u7441／\u7d14\u8272", description: "\u4e09\u82b1、\u73b3\u7441、\u5168\u9ed1、\u5168\u767d\u7b49", image_url: "" },
  ],
  colors: [
    { color_id: "tabby", name_zh: "\u864e\u6591", description: "\u7070\u8910\u689d\u7d0b\u6700\u666e\u904d" },
    { color_id: "orange", name_zh: "\u6a58\u8272", description: "\u6a58\u8c93／\u6a58\u767d" },
    { color_id: "black", name_zh: "\u9ed1\u8272", description: "\u5168\u9ed1\u77ed\u6bdb" },
    { color_id: "tuxedo", name_zh: "\u71d5\u5c3e\u670d", description: "\u9ed1\u767d\u7d93\u5178\u914d" },
  ],
  personality_traits: [
    "\u6bcf\u96bb\u500b\u6027\u7368\u4e00\u7121\u4e8c：\u6709\u9ecf\u4eba\u578b\u4e5f\u6709\u7368\u7acb\u578b",
    "\u666e\u904d\u8070\u660e\u6a5f\u9748、\u9069\u61c9\u529b\u6975\u5f37",
    "\u6df7\u7a2e\u57fa\u56e0\u5e38\u5e36\u4f86\u8f03\u4f73\u6574\u9ad4\u5065\u5eb7",
    "\u9818\u990a\u5510\u8c93\u80fd\u7d66\u8857\u8c93／\u6536\u5bb9\u8c93\u4e00\u500b\u5bb6，\u610f\u7fa9\u7279\u5225",
  ],
  care_and_health: {
    environment: "\u5ba4\u5167\u98fc\u990a\u6700\u5b89\u5168；\u63d0\u4f9b\u8df3\u53f0、\u7a97\u666f\u8207\u65e5\u5e38\u4e92\u52d5\u5373\u53ef",
    genetic_risks: ["\u7121\u55ae\u4e00\u54c1\u7a2e\u907a\u50b3\u75c5，\u4f46\u4ecd\u9700\u9632\u80a5\u80d6、\u6ccc\u5c3f\u9053、\u7259\u5468\u8207\u5bc4\u751f\u87f2", "\u672a\u7d55\u80b2\u500b\u9ad4\u9700\u898f\u5283\u7d55\u80b2\u8207\u6676\u7247"],
    digestive_health: "\u591a\u6578\u8178\u80c3\u7a69\u5b9a；\u63db\u7ce7\u4ecd\u5efa\u8b70\u6f38\u9032；\u591a\u559d\u6c34\u8b77\u6ccc\u5c3f",
    diet_management: "\u5747\u8861\u5168\u50f9\u4e3b\u98df；\u591a\u6fd5\u7ce7\u88dc\u6c34；\u6210\u8c93\u5b9a\u6642\u5b9a\u91cf\u9632\u80d6",
    grooming: "\u77ed\u6bdb\u6bcf\u9031\u68b3 1 \u6b21；\u63db\u6bdb\u5b63\u52a0\u983b。\u5b9a\u671f\u9a45\u87f2、\u75ab\u82d7\u8207\u5065\u5eb7\u6aa2\u67e5",
  },
  media_assets: {
    status: "localized_gallery_sync",
    instruction_for_cursor: "\u5510\u8c93\u5716\u5eab\u5df2\u672c\u5730\u5316：\u864e\u6591\u82f1\u96c4／\u71d5\u5c3e\u670d／\u6a58\u8c93／\u7279\u5beb／\u6c34\u69fd\u864e\u6591／\u9ed1\u8c93。",
    images: [
      { tag: "hero_main", description: "\u7d93\u5178\u864e\u6591\u5510\u8c93", src: "/images/cat-breeds/mix-shorthair.jpg", alt: "\u864e\u6591\u5510\u8c93／\u6e2f\u77ed" },
      { tag: "gallery_item_1", description: "\u9ed1\u767d\u71d5\u5c3e\u670d\u7c73\u514b\u65af", src: "/images/cat-breeds/mix-shorthair-tuxedo.jpg", alt: "\u71d5\u5c3e\u670d\u5510\u8c93" },
      { tag: "gallery_item_2", description: "\u958b\u6717\u6a58\u8c93", src: "/images/cat-breeds/mix-shorthair-orange.jpg", alt: "\u6a58\u8272\u5510\u8c93" },
      { tag: "gallery_item_3", description: "\u5bb6\u8c93\u81c9\u90e8\u7279\u5beb", src: "/images/cat-breeds/mix-shorthair-portrait.jpg", alt: "\u5510\u8c93\u7279\u5beb" },
      { tag: "gallery_item_4", description: "\u864e\u6591\u65e5\u5e38\u5c45\u5bb6", src: "/images/cat-breeds/mix-shorthair-tabby.jpg", alt: "\u864e\u6591\u6e2f\u77ed\u65e5\u5e38" },
      { tag: "gallery_item_5", description: "\u5e25\u6c23\u9ed1\u8c93", src: "/images/cat-breeds/mix-shorthair-black.jpg", alt: "\u9ed1\u8272\u5510\u8c93" },
    ],
  },
};

export const catBreedsData: CatBreed[] = [
  {
    id: "1",
    slug: "british-shorthair",
    name: "\u82f1\u570b\u77ed\u6bdb\u8c93",
    nameEn: "British Shorthair",
    coatType: "short",
    coatLabel: "\u77ed\u6bdb",
    coatLabelEn: "Short hair",
    shortDescription: "\u6eab\u548c\u7a69\u5b9a、\u9ad4\u578b\u5713\u6efe，\u6ce8\u610f\u9ad4\u91cd\u7ba1\u7406。",
    shortDescriptionEn: "Calm and steady with a round, plush build — watch weight carefully after neutering.",
    imageUrl: "/images/cat-breeds/british-shorthair-golden.jpg",
    origin: "\u82f1\u570b",
    originEn: "United Kingdom",
    lifespan: "12 - 17 \u6b72",
    lifespanEn: "12 – 17 years",
    weight: "\u516c 5.0–8.0 kg／\u6bcd 4.0–6.0 kg",
    weightEn: "Males 5.0–8.0 kg / Females 4.0–6.0 kg",
    personality: [
      "\u6027\u683c\u6eab\u548c、\u7406\u6027、\u813e\u6c23\u6975\u597d",
      "\u6210\u719f\u7a69\u91cd，\u4e0d\u611b\u80e1\u9b27\u6216\u904e\u5ea6\u5435\u9b27",
      "\u7368\u7acb\u6027\u9ad8，\u975e\u5e38\u9069\u5408\u5fd9\u788c\u7684\u90fd\u5e02\u5bb6\u5ead\u8207\u4e0a\u73ed\u65cf",
      "\u5c0d\u4eba\u53cb\u5584，\u4f46\u901a\u5e38\u4e0d\u5c6c\u65bc\u9ecf\u4eba\u7cbe\u578b\u5225，\u559c\u6b61\u975c\u975c\u966a\u4f34\u5728\u65c1",
    ],
    personalityEn: [
      "Gentle, even-tempered, and easygoing",
      "Mature and composed — not overly noisy or chaotic",
      "Independent enough for busy urban homes and office schedules",
      "Friendly without being clingy; happy to keep quiet company nearby",
    ],
    careTips: [
      "\u96d6\u7136\u662f\u77ed\u6bdb\u8c93，\u4f46\u56e0\u5e95\u6bdb\u539a\u5bc6，\u5e73\u6642\u6bcf\u9031\u9700\u68b3\u6bdb 1-2 \u6b21。",
      "\u63db\u6bdb\u5b63\u6389\u6bdb\u91cf\u5927，\u9700\u589e\u52a0\u68b3\u6bdb\u983b\u7387\u4ee5\u9632\u6bdb\u7403\u75c7。",
      "\u8cfc\u8cb7\u524d\u5efa\u8b70\u78ba\u8a8d\u7236\u6bcd\u5df2\u505a HCM／PKD \u57fa\u56e0\u6aa2\u6e2c。",
    ],
    careTipsEn: [
      "Short coat, but dense undercoat — brush 1–2 times weekly.",
      "Increase brushing in shedding season to reduce hairballs.",
      "Ask breeders for HCM/PKD genetic testing on the parents before purchase.",
    ],
    nutritionAdvice: [
      "\u7d55\u80b2\u5f8c\u6975\u5bb9\u6613\u767c\u80d6，\u5fc5\u9808\u56b4\u683c\u5b9a\u6642\u5b9a\u91cf\u63a7\u5236\u71b1\u91cf。",
      "\u63d0\u4f9b\u8db3\u5920\u7684\u6d3b\u6c34\u8207\u6eab\u548c\u904b\u52d5，\u7dad\u6301\u7406\u60f3\u9ad4\u578b。",
      "\u5efa\u8b70\u9ad8\u86cb\u767d\u8cea\u914d\u65b9，\u4e26\u53ef\u9069\u91cf\u88dc\u5145\u9b5a\u6cb9\u7dad\u6301\u7d68\u6bdb\u5149\u6fa4。",
    ],
    nutritionAdviceEn: [
      "Easy to gain weight after neutering — feed measured meals on a schedule.",
      "Provide fresh water and gentle daily play to keep an ideal body condition.",
      "Choose a high-protein diet; a little fish oil can support coat sheen.",
    ],
    fullDescription:
      "\u82f1\u570b\u77ed\u6bdb\u8c93\u64c1\u6709\u60a0\u4e45\u6b77\u53f2，\u7531\u53e4\u4ee3\u7f85\u99ac\u8c93\u5f15\u5165\u82f1\u570b\u672c\u571f\u8c93\u6539\u826f\u800c\u6210，\u662f\u6b50\u6d32\u6700\u53e4\u8001\u7684\u8c93\u54c1\u7a2e\u4e4b\u4e00。\u7260\u5011\u4ee5\u5713\u6efe\u6efe\u7684\u81c9\u9f90、\u539a\u5bc6「\u7d68\u6bdb\u611f」\u77ed\u6bdb\u805e\u540d，\u6027\u683c\u6eab\u548c\u7406\u6027，\u975e\u5e38\u9069\u5408\u5fd9\u788c\u7684\u90fd\u5e02\u5bb6\u5ead。",
    fullDescriptionEn:
      "One of Europe’s oldest cat breeds, the British Shorthair descends from cats brought by the Romans and refined with British stock. Famous for a round face and dense, plush short coat, they are calm, rational companions well suited to busy city households.",
    breedInfo: BRITISH_SHORTHAIR_BREED_INFO,
  },
  {
    id: "2",
    slug: "american-shorthair",
    name: "\u7f8e\u570b\u77ed\u6bdb\u8c93",
    nameEn: "American Shorthair",
    coatType: "short",
    coatLabel: "\u77ed\u6bdb",
    coatLabelEn: "Short hair",
    shortDescription: "\u6d3b\u6f51\u597d\u52d5、\u9069\u61c9\u529b\u5f37，\u9700\u88dc\u8db3\u6bcf\u65e5\u904b\u52d5\u91cf。",
    shortDescriptionEn: "Active, adaptable, and sturdy — needs daily play to burn energy.",
    imageUrl: "/images/cat-breeds/american-shorthair.jpg",
    origin: "\u7f8e\u570b",
    originEn: "United States",
    lifespan: "15 - 20 \u6b72",
    lifespanEn: "15 – 20 years",
    weight: "\u516c 5.0–7.5 kg／\u6bcd 3.5–5.5 kg",
    weightEn: "Males 5.0–7.5 kg / Females 3.5–5.5 kg",
    personality: [
      "\u8070\u660e\u6d3b\u6f51，\u597d\u5947\u5fc3\u5f37，\u559c\u6b61\u89c0\u5bdf\u5bb6\u4e2d\u52d5\u975c",
      "\u5c0d\u4eba\u53cb\u5584，\u901a\u5e38\u80fd\u8207\u5152\u7ae5\u53ca\u5176\u4ed6\u5bf5\u7269\u548c\u7766\u76f8\u8655",
      "\u9069\u61c9\u529b\u5f37，\u9069\u5408\u4f5c\u70ba\u5fd9\u788c\u90fd\u5e02\u5bb6\u5ead\u7684\u966a\u4f34\u8c93",
      "\u73a9\u800d\u6642\u7cbe\u529b\u5145\u6c9b，\u5e73\u6642\u4e5f\u80fd\u5b89\u975c\u5730\u966a\u4f34\u5728\u65c1",
    ],
    personalityEn: [
      "Bright and curious, always watching household life",
      "People-friendly and usually good with children and other pets",
      "Highly adaptable — a solid companion for busy urban families",
      "Playful bursts of energy balanced with calm downtime",
    ],
    careTips: [
      "\u77ed\u6bdb\u6613\u6253\u7406，\u5e73\u6642\u6bcf\u9031\u68b3\u6bdb 1 \u6b21；\u63db\u6bdb\u5b63\u53ef\u589e\u81f3 2-3 \u6b21。",
      "\u7cbe\u529b\u5145\u6c9b，\u5efa\u8b70\u6bcf\u5929\u4e92\u52d5\u904a\u6232，\u4e26\u63d0\u4f9b\u8c93\u6293\u677f\u8207\u8df3\u53f0。",
      "\u5b9a\u671f\u6e05\u6f54\u7259\u9f52，\u7559\u610f HCM \u7b49\u907a\u50b3\u98a8\u96aa\u8207\u5065\u5eb7\u6aa2\u67e5。",
    ],
    careTipsEn: [
      "Easy short coat: brush about once a week; 2–3 times in shedding season.",
      "Offer daily interactive play plus scratchers and climbing spots.",
      "Keep up dental care and routine checks; watch for HCM in some lines.",
    ],
    nutritionAdvice: [
      "\u808c\u8089\u767c\u9054，\u9700\u88dc\u5145\u512a\u8cea\u52d5\u7269\u6027\u86cb\u767d\u4ee5\u7dad\u6301\u9ad4\u614b。",
      "\u53ef\u642d\u914d\u8edf\u9aa8\u7d20\u8207\u8461\u8404\u7cd6\u80fa，\u7167\u9867\u65e5\u5e38\u8df3\u8e8d\u7684\u95dc\u7bc0\u5065\u5eb7。",
      "\u6210\u8c93\u9700\u5b9a\u6642\u5b9a\u91cf，\u4e26\u63d0\u4f9b\u8db3\u5920\u65b0\u9bae\u98f2\u7528\u6c34。",
    ],
    nutritionAdviceEn: [
      "Muscular build needs quality animal protein to stay athletic.",
      "Joint support (glucosamine/chondroitin) can help active jumpers.",
      "Feed adult cats on a schedule with plenty of fresh water.",
    ],
    fullDescription:
      "\u7f8e\u570b\u77ed\u6bdb\u8c93\u7956\u5148\u96a8\u79fb\u6c11\u8239\u4f86\u5230\u5317\u7f8e，\u7d93\u9577\u671f\u9078\u80b2\u6210\u70ba\u9ad4\u683c\u5f37\u5065、\u9069\u61c9\u529b\u6975\u9ad8\u7684\u7d93\u5178\u5bb6\u8c93。\u4ee5\u9280\u864e\u6591\u8207\u5404\u8272\u864e\u6591\u805e\u540d，\u500b\u6027\u5916\u5411\u53cb\u5584，\u975e\u5e38\u9069\u5408\u9999\u6e2f\u5fd9\u788c\u7684\u90fd\u5e02\u5bb6\u5ead。",
    fullDescriptionEn:
      "Descended from ship cats that traveled with immigrants to North America, the American Shorthair was shaped into a hardy, adaptable family cat. Known for striking tabby patterns—especially silver—they are outgoing, friendly companions for Hong Kong city homes.",
    breedInfo: AMERICAN_SHORTHAIR_BREED_INFO,
  },
  {
    id: "3",
    slug: "ragdoll",
    name: "\u5e03\u5076\u8c93",
    nameEn: "Ragdoll",
    coatType: "long",
    coatLabel: "\u4e2d\u9577\u6bdb",
    coatLabelEn: "Medium–long hair",
    shortDescription: "\u6027\u683c\u6eab\u9806、\u6bdb\u9aee\u8c50\u76c8，\u9700\u6ce8\u91cd\u8178\u80c3\u8207\u5b9a\u671f\u68b3\u6bdb。",
    shortDescriptionEn: "Ultra-gentle and plush-coated; prioritize gut care and regular grooming.",
    imageUrl:
      "/images/cat-breeds/ragdoll.jpg",
    origin: "\u7f8e\u570b\u52a0\u5dde",
    originEn: "California, USA",
    lifespan: "12 - 15 \u6b72（\u665a\u719f 3-4 \u5e74）",
    lifespanEn: "12 – 15 years (late maturing, 3–4 years)",
    weight: "\u516c 6.0–9.0 kg／\u6bcd 4.5–7.0 kg",
    weightEn: "Males 6.0–9.0 kg / Females 4.5–7.0 kg",
    personality: [
      "\u6975\u5ea6\u9ecf\u4eba（Puppy Cat \u6027\u683c）",
      "\u813e\u6c23\u6eab\u548c，\u5c0d\u5152\u7ae5\u8207\u5bf5\u7269\u5fcd\u8010\u529b\u9ad8",
      "\u53eb\u8072\u8f15\u67d4\u5b89\u975c",
      "\u9ad8\u60c5\u5546，\u5584\u65bc\u966a\u4f34\u8207\u5bdf\u89ba\u60c5\u7dd2",
    ],
    personalityEn: [
      "Extremely affectionate “puppy-cat” temperament",
      "Patient with children and other pets",
      "Soft, quiet voice",
      "Emotionally tuned-in companion that loves to be near you",
    ],
    careTips: [
      "100% \u5ba4\u5167\u98fc\u990a（\u9632\u79a6\u529b\u4f4e，\u5207\u52ff\u653e\u990a）",
      "\u6bcf\u9031 2-3 \u6b21\u68b3\u6bdb，\u5b9a\u671f\u4fee\u526a\u81c0\u90e8\u96dc\u6bdb",
      "\u7559\u610f HCM／PKD \u7b49\u907a\u50b3\u98a8\u96aa，\u5b9a\u671f\u5065\u5eb7\u6aa2\u67e5",
    ],
    careTipsEn: [
      "Indoor-only — they have limited street sense and should not free-roam.",
      "Brush 2–3 times weekly; trim fluffy rear fur as needed.",
      "Screen for HCM/PKD and keep up regular veterinary checks.",
    ],
    nutritionAdvice: [
      "\u73bb\u7483\u80c3（\u8178\u80c3\u654f\u611f），\u63db\u7ce7\u9700 7-10 \u5929\u904e\u6e21，\u5efa\u8b70\u88dc\u5145\u76ca\u751f\u83cc",
      "\u5b9a\u6642\u5b9a\u91cf\u9935\u98df，\u9810\u9632\u80a5\u80d6",
      "\u88dc\u5145 Omega-3 / Omega-6 \u8102\u80aa\u9178，\u4fdd\u6301\u98c4\u9038\u6bdb\u9aee\u67d4\u9806",
    ],
    nutritionAdviceEn: [
      "Sensitive digestion (“glass stomach”) — transition food over 7–10 days; probiotics help.",
      "Measured meals prevent obesity in this relaxed breed.",
      "Omega-3/Omega-6 fatty acids support their flowing coat.",
    ],
    fullDescription:
      "\u88ab\u8b7d\u70ba「\u8c93\u754c\u4ed9\u5973」\u7684\u5e03\u5076\u8c93，\u64c1\u6709\u6df1\u9083\u7684\u85cd\u773c\u775b\u8207\u8c50\u6eff\u7684\u4e2d\u9577\u6bdb。\u7576\u4f60\u62b1\u8d77\u7260\u6642，\u7260\u6703\u50cf\u8edf\u7dbf\u7dbf\u7684\u5e03\u5076\u4e00\u6a23\u653e\u9b06，\u662f\u6975\u5177\u7642\u7652\u611f\u7684\u60c5\u611f\u966a\u4f34\u5bf5\u7269。",
    fullDescriptionEn:
      "Nicknamed the “fairy of the cat world,” Ragdolls are known for deep blue eyes and a silky semi-long coat. When held, many go limp and relaxed like a cloth doll — a deeply soothing emotional companion.",
    breedInfo: RAGDOLL_BREED_INFO,
  },
  {
    id: "4",
    slug: "russian-blue",
    name: "\u4fc4\u7f85\u65af\u85cd\u8c93",
    nameEn: "Russian Blue",
    coatType: "short",
    coatLabel: "\u77ed\u6bdb",
    coatLabelEn: "Short hair",
    shortDescription: "\u9280\u5149\u85cd\u7070、\u7fe1\u7fe0\u7da0\u773c；\u6587\u975c\u5fe0\u8aa0，\u9069\u5408\u5be7\u975c\u5c45\u5bb6。",
    shortDescriptionEn: "Elegant silver-blue coat and emerald eyes; reserved yet deeply loyal.",
    imageUrl: "/images/cat-breeds/russian-blue.jpg",
    origin: "\u4fc4\u7f85\u65af（\u963f\u723e\u6f22\u683c\u723e\u65af\u514b）",
    originEn: "Russia (Archangel region)",
    lifespan: "15 - 20 \u6b72",
    lifespanEn: "15 – 20 years",
    weight: "\u516c 3.5–5.5 kg／\u6bcd 2.5–4.5 kg",
    weightEn: "Males 3.5–5.5 kg / Females 3.0–4.5 kg",
    personality: [
      "\u5c0d\u964c\u751f\u4eba\u504f\u5bb3\u7f9e，\u5c0d\u5bb6\u4eba\u6975\u70ba\u5fe0\u8aa0\u89aa\u5bc6",
      "\u53eb\u8072\u8f15\u67d4、\u6c23\u8cea\u5b89\u975c\u512a\u96c5",
      "\u8070\u6167\u654f\u92b3，\u559c\u6b61\u667a\u529b\u904a\u6232\u8207\u89c0\u5bdf",
      "\u74b0\u5883\u654f\u611f，\u9700\u8981\u7a69\u5b9a\u4f5c\u606f\u8207\u5b89\u5168\u4f11\u606f\u5340",
    ],
    personalityEn: [
      "Quiet, graceful, and gently reserved with strangers",
      "Forms deep bonds with their trusted people",
      "Intelligent and observant without being demanding",
      "Prefers predictable routines and calm homes",
    ],
    careTips: [
      "\u9280\u85cd\u96d9\u5c64\u77ed\u6bdb\u6389\u6bdb\u5c11，\u6bcf\u9031\u68b3\u6bdb 1 \u6b21\u5373\u53ef；\u63db\u6bdb\u5b63\u53ef\u7565\u589e",
      "\u5c0d\u74b0\u5883\u8b8a\u5316\u654f\u611f，\u5bb6\u4e2d\u61c9\u4fdd\u7559\u5b89\u975c\u8eb2\u85cf／\u4f11\u606f\u7a7a\u9593",
      "\u9f13\u52f5\u591a\u559d\u6c34，\u7559\u610f\u6ccc\u5c3f\u5065\u5eb7；\u9069\u5408\u85cf\u98df\u73a9\u5177\u7b49\u667a\u529b\u6311\u6230",
    ],
    careTipsEn: [
      "Dense double coat: brush weekly; more often when shedding.",
      "Give vertical space and quiet hideaways to feel secure.",
      "Encourage water intake; watch urinary health closely.",
    ],
    nutritionAdvice: [
      "\u7dad\u6301\u9ad8\u6d88\u5316\u7387\u512a\u8cea\u86cb\u767d，\u4fdd\u6301\u4fee\u9577\u8f15\u76c8\u9ad4\u578b",
      "\u63a7\u5236\u8102\u80aa\u8207\u71b1\u91cf，\u907f\u514d\u56e0\u5ba4\u5167\u6d3b\u52d5\u504f\u5c11\u800c\u767c\u80d6",
      "\u88dc\u8db3\u725b\u78fa\u9178（Taurine），\u4fdd\u8b77\u7da0\u773c\u775b\u8207\u5fc3\u81df\u5065\u5eb7",
    ],
    nutritionAdviceEn: [
      "High-quality protein supports lean muscle and silver coat tip sheen.",
      "Wet food helps hydration and urinary tract comfort.",
      "Keep portions controlled — they look refined when kept lean.",
    ],
    fullDescription:
      "\u4fc4\u7f85\u65af\u85cd\u8c93\u64c1\u6709\u9280\u5149\u9583\u8000\u7684\u85cd\u7070\u8272\u96d9\u5c64\u77ed\u6bdb\u8207\u7fe1\u7fe0\u822c\u7684\u7da0\u773c\u775b，\u9ad4\u614b\u4fee\u9577\u512a\u96c5。\u7260\u5011\u6587\u975c\u5167\u6582，\u5c0d\u964c\u751f\u4eba\u8f03\u70ba\u5bb3\u7f9e，\u4f46\u5c0d\u8a8d\u5b9a\u7684\u4e3b\u4eba\u6975\u70ba\u5fe0\u8aa0\u89aa\u5bc6，\u662f\u9069\u5408\u559c\u6b61\u5be7\u975c\u966a\u4f34\u7684\u7d93\u5178\u77ed\u6bdb\u54c1\u7a2e。",
    fullDescriptionEn:
      "The Russian Blue is prized for a shimmering silver-blue coat and vivid green eyes. Elegant and somewhat shy at first, they become steadfast, affectionate companions once trust is earned — ideal for quieter households that value grace and loyalty.",
    breedInfo: RUSSIAN_BLUE_BREED_INFO,
  },
  {
    id: "5",
    slug: "munchkin",
    name: "\u66fc\u8d64\u56e0\u77ed\u817f\u8c93",
    nameEn: "Munchkin",
    coatType: "short",
    coatLabel: "\u77ed\u6bdb / \u9577\u6bdb",
    coatLabelEn: "Short / long hair",
    shortDescription: "\u77ed\u817f\u9577\u8eab、\u5929\u771f\u6d3b\u6f51；\u56b4\u683c\u63a7\u91cd\u4e26\u7167\u9867\u95dc\u7bc0\u810a\u690e。",
    shortDescriptionEn: "Short-legged and playful; manage weight carefully to protect joints and spine.",
    imageUrl: "/images/cat-breeds/munchkin.jpg",
    origin: "\u7f8e\u570b",
    originEn: "United States",
    lifespan: "12 - 15 \u6b72",
    lifespanEn: "12 – 15 years",
    weight: "\u516c 2.7–4.0 kg／\u6bcd 2.3–3.6 kg",
    weightEn: "Males 2.7–4.0 kg / Females 2.3–3.6 kg",
    personality: [
      "\u5929\u771f\u6d3b\u6f51，\u50cf\u9577\u4e0d\u5927\u7684\u5b69\u5b50",
      "\u793e\u4ea4\u6027\u9ad8，\u901a\u5e38\u5c0d\u4eba\u8207\u5bf5\u7269\u53cb\u5584",
      "\u597d\u5947\u5fc3\u5f37，\u77ed\u817f\u4ecd\u654f\u6377\u80fd\u8dd1\u80fd\u73a9",
      "\u89aa\u4eba\u8a0e\u62b1，\u662f\u5bb6\u4e2d\u958b\u5fc3\u679c",
    ],
    personalityEn: [
      "Cheerful and puppy-like energy",
      "Sociable with people and usually other pets",
      "Curious and surprisingly agile despite short legs",
      "Affectionate entertainers of the household",
    ],
    careTips: [
      "\u907f\u514d\u904e\u9ad8\u8df3\u53f0\u8207\u91cd\u6454；\u63d0\u4f9b\u4f4e\u77ee\u8df3\u53f0、\u659c\u5761\u8207\u9632\u6ed1\u5730\u9762",
      "\u5b9a\u671f\u4fee\u526a\u6307\u7532，\u6e1b\u5c11\u77ed\u817f\u8e29\u6ed1\u53d7\u50b7",
      "\u77ed\u6bdb\u6bcf\u9031\u68b3 1 \u6b21；\u9577\u6bdb\u578b 2-3 \u6b21，\u4e26\u4fdd\u6301\u9069\u5ea6\u904b\u52d5",
    ],
    careTipsEn: [
      "Avoid very high jumps; offer low perches, ramps, and non-slip floors.",
      "Trim nails regularly to reduce slipping injuries.",
      "Brush short coats weekly; longhair types 2–3 times; keep them gently active.",
    ],
    nutritionAdvice: [
      "\u56b4\u683c\u63a7\u5236\u9ad4\u91cd，\u6e1b\u8f15\u810a\u690e\u8207\u77ed\u817f\u58d3\u529b",
      "\u88dc\u5145\u95dc\u7bc0\u71df\u990a（\u8461\u8404\u7cd6\u80fa、MSM、\u9069\u91cf\u9223\u8207\u7dad\u751f\u7d20 D3）",
      "\u53ef\u9078\u5c0f\u9846\u7c92\u4e7e\u7ce7，\u65b9\u4fbf\u8f03\u5c0f\u53e3\u8154\u5480\u56bc",
    ],
    nutritionAdviceEn: [
      "Strict weight control reduces stress on the spine and short legs.",
      "Support joints with glucosamine, MSM, and balanced calcium/D3 as advised by a vet.",
      "Smaller kibble can be easier for a smaller mouth.",
    ],
    fullDescription:
      "\u66fc\u8d64\u56e0\u8c93\u4ee5\u6a19\u8a8c\u6027\u7684\u77ed\u817f\u548c\u9577\u8eab\u8ec0\u805e\u540d，\u88ab\u7a31\u70ba「\u8c93\u754c\u81d8\u8178\u72d7」。\u77ed\u817f\u4f86\u81ea\u81ea\u7136\u986f\u6027\u57fa\u56e0，\u6027\u683c\u50cf\u5c0f\u72d7\u822c\u71b1\u60c5\u6d3b\u6f51，\u5954\u8dd1\u8207\u7ad9\u7acb\u73a9\u800d\u90fd\u9748\u5de7\u53ef\u611b，\u662f\u5bb6\u4e2d\u7684\u958b\u5fc3\u679c。",
    fullDescriptionEn:
      "Famous for short legs and a longer body — often called the “dachshund of cats” — Munchkins carry a natural dominant gene for shortened limbs. They stay playful, affectionate, and surprisingly nimble runners and standers, bringing joy to the home.",
    breedInfo: MUNCHKIN_BREED_INFO,
  },
  {
    id: "6",
    slug: "norwegian-forest",
    name: "\u632a\u5a01\u68ee\u6797\u8c93",
    nameEn: "Norwegian Forest Cat",
    coatType: "long",
    coatLabel: "\u9577\u6bdb",
    coatLabelEn: "Long hair",
    shortDescription: "\u5927\u578b\u9632\u6c34\u9577\u6bdb、\u6500\u722c\u9ad8\u624b；\u63db\u6bdb\u5b63\u9700\u52e4\u68b3\u4e26\u6ce8\u610f\u6bdb\u7403。",
    shortDescriptionEn: "Large, weatherproof double coat; focus on grooming and hairball control.",
    imageUrl: "/images/cat-breeds/norwegian-forest.jpg",
    origin: "\u632a\u5a01",
    originEn: "Norway",
    lifespan: "14 - 16 \u6b72",
    lifespanEn: "14 – 16 years",
    weight: "\u516c 5.5–9.0 kg／\u6bcd 4.0–6.5 kg",
    weightEn: "Males 5.5–9.0 kg / Females 4.0–7.0 kg",
    personality: [
      "\u52c7\u6562\u63a2\u7d22，\u5929\u751f\u6500\u722c\u9ad8\u624b",
      "\u5916\u8868\u5a01\u56b4，\u5c0d\u4eba\u6eab\u548c\u53cb\u5584",
      "\u9069\u61c9\u529b\u4f73，\u80fd\u8207\u5152\u7ae5\u53ca\u5bf5\u7269\u5171\u8655",
      "\u7368\u7acb\u4e2d\u5e36\u89aa\u5bc6，\u559c\u6b61\u5b89\u975c\u966a\u4f34",
    ],
    personalityEn: [
      "Confident explorers and skilled climbers",
      "Calm, dignified presence",
      "Friendly without being needy",
      "Gentle with family when raised with kindness",
    ],
    careTips: [
      "\u96d9\u5c64\u9632\u6c34\u6bdb\u539a\u5be6，\u5e73\u6642\u6bcf\u9031\u68b3 2-3 \u6b21；\u63db\u6bdb\u5b63\u5efa\u8b70\u6bcf\u65e5\u68b3\u7406",
      "\u5bb6\u4e2d\u9700\u6709\u9ad8\u8073\u8c93\u6a39\u6216\u7246\u9762\u8df3\u53f0，\u6eff\u8db3\u6500\u9ad8\u5929\u6027",
      "\u590f\u5b63\u6ce8\u610f\u5ba4\u5167\u901a\u98a8\u6563\u71b1，\u907f\u514d\u539a\u6bdb\u4e2d\u6691",
    ],
    careTipsEn: [
      "Thick double coat needs thorough brushing, especially in seasonal sheds.",
      "Provide tall cat trees or wall shelves — they love height.",
      "Keep indoor temperatures comfortable in summer under that heavy coat.",
    ],
    nutritionAdvice: [
      "\u5927\u578b\u665a\u719f（\u7d04 3-5 \u5e74），\u9700\u9577\u671f\u512a\u8cea\u9ad8\u86cb\u767d\u8207\u8db3\u5920\u71b1\u91cf",
      "\u88dc\u7e96\u7dad\u5354\u52a9\u6392\u51fa\u6bdb\u7403；\u53ef\u52a0\u8461\u8404\u7cd6\u80fa\u652f\u6301\u9aa8\u9abc",
      "\u6210\u8c93\u5b9a\u6642\u5b9a\u91cf，\u907f\u514d\u56e0\u6d3b\u52d5\u91cf\u8b8a\u5316\u800c\u767c\u80d6",
    ],
    nutritionAdviceEn: [
      "Large, slow-growing cats (maturity ~3–5 years) need sustained quality protein and calories while growing.",
      "Fiber and oils help move hairballs through the gut.",
      "Glucosamine can support joints in a heavier frame.",
    ],
    fullDescription:
      "\u6e90\u81ea\u5317\u6b50\u68ee\u6797\u7684\u5927\u578b\u81ea\u7136\u8c93\u7a2e，\u64c1\u6709\u9069\u61c9\u56b4\u5bd2\u7684\u9632\u6c34\u96d9\u5c64\u9577\u6bdb、\u5c71\u8c93\u8033\u5c16\u8207\u5f37\u58ef\u8ec0\u5e79。\u7260\u5011\u662f\u5929\u751f\u7684\u6500\u722c\u8005，\u5916\u8868\u5a01\u56b4\u4f46\u6027\u683c\u6eab\u548c\u5305\u5bb9，\u9069\u5408\u6709\u5782\u76f4\u6d3b\u52d5\u7a7a\u9593\u7684\u5bb6\u5ead。",
    fullDescriptionEn:
      "A large natural breed from Nordic forests, the Norwegian Forest Cat wears a water-resistant double coat and a powerful build. Born climbers with a majestic look, they are typically gentle and tolerant family companions.",
    breedInfo: NORWEGIAN_FOREST_BREED_INFO,
  },
  {
    id: "7",
    slug: "exotic-shorthair",
    name: "\u7570\u570b\u77ed\u6bdb\u8c93 (\u52a0\u83f2\u8c93)",
    nameEn: "Exotic Shorthair",
    coatType: "short",
    coatLabel: "\u77ed\u6bdb",
    coatLabelEn: "Short hair",
    shortDescription: "\u6241\u81c9\u5713\u773c、\u6eab\u67d4\u5b89\u975c；\u6bcf\u65e5\u6e05\u7406\u773c\u89d2\u4e26\u56b4\u683c\u63a7\u91cd。",
    shortDescriptionEn: "Flat-faced and teddy-bear sweet; daily eye care and cool airflow matter.",
    imageUrl: "/images/cat-breeds/exotic-shorthair.jpg",
    origin: "\u7f8e\u570b",
    originEn: "United States",
    lifespan: "12 - 15 \u6b72",
    lifespanEn: "12 – 15 years",
    weight: "\u516c 4.0–6.5 kg／\u6bcd 3.0–5.0 kg",
    weightEn: "Males 4.0–6.5 kg / Females 3.5–5.5 kg",
    personality: [
      "\u6587\u975c\u5446\u840c，\u559c\u6b61\u5b89\u975c\u966a\u4f34",
      "\u6eab\u67d4\u8a0e\u62b1，\u60c5\u611f\u8c50\u5bcc\u4f46\u4e0d\u5435\u9b27",
      "\u9069\u5408\u516c\u5bd3\u5ba4\u5167\u751f\u6d3b",
      "\u7bc0\u594f\u504f\u6162，\u4eab\u53d7\u7a97\u908a\u89c0\u5bdf\u8207\u5348\u7761",
    ],
    personalityEn: [
      "Quiet, endearing “teddy” demeanor",
      "Loves lap time and gentle affection",
      "Low-drama and rarely noisy",
      "Emotionally present without being demanding",
    ],
    careTips: [
      "\u6241\u81c9\u6613\u6dda\u6ea2，\u6bcf\u5929\u7528\u6eab\u6fd5\u68c9\u7247\u6e05\u7406\u773c\u89d2\u8207\u81c9\u647a",
      "\u9f3b\u77ed\u9700\u6ce8\u610f\u901a\u98a8\u6563\u71b1；\u98df\u7897\u9078\u6dfa\u53e3\u8f03\u6613\u9032\u98df",
      "\u6bcf\u9031\u68b3\u6bdb 2-3 \u6b21（\u5e95\u6bdb\u539a），\u4e26\u5b9a\u671f\u6aa2\u67e5\u9f3b\u5468\u570d\u6e05\u6f54",
    ],
    careTipsEn: [
      "Flat face means tear staining — clean eye corners daily with soft damp cotton.",
      "Shorter airways: keep rooms ventilated and cool in hot weather.",
      "Use shallow or slightly tilted bowls for easier eating.",
    ],
    nutritionAdvice: [
      "\u56b4\u683c\u63a7\u91cd，\u6e1b\u8f15\u5fc3\u80ba\u8ca0\u64d4",
      "\u53ef\u9078\u6613\u54ac\u788e\u9846\u7c92，\u65b9\u4fbf\u6241\u81c9\u5480\u56bc",
      "\u88dc\u5145\u8b77\u773c\u6297\u6c27\u5316\u914d\u65b9，\u7559\u610f PKD \u7b49\u907a\u50b3\u98a8\u96aa",
    ],
    nutritionAdviceEn: [
      "Special kibble shapes can help flat-faced cats chew more easily.",
      "Antioxidants/lutein support eye comfort in some formulas.",
      "Control calories — extra weight strains breathing and heart.",
    ],
    fullDescription:
      "\u7570\u570b\u77ed\u6bdb\u8c93\u662f\u6ce2\u65af\u8c93\u7684\u77ed\u6bdb\u7248\u672c，\u64c1\u6709\u6a19\u8a8c\u6027\u7684\u6241\u6241\u5927\u81c9、\u5713\u6efe\u5927\u773c\u8207\u6fc3\u5bc6\u77ed\u6bdb，\u6027\u683c\u6eab\u67d4\u8a0e\u559c，\u88ab\u5927\u5bb6\u89aa\u5207\u5730\u7a31\u70ba「\u52a0\u83f2\u8c93」，\u662f\u9069\u5408\u5b89\u975c\u966a\u4f34\u7684\u5ba4\u5167\u660e\u661f\u54c1\u7a2e。",
    fullDescriptionEn:
      "Often called the “Garfield cat,” the Exotic Shorthair is essentially a short-coated Persian: round face, plush body, and a sweet, quiet temperament. They thrive in calm indoor homes with owners ready for daily facial care.",
    breedInfo: EXOTIC_SHORTHAIR_BREED_INFO,
  },
  {
    id: "8",
    slug: "maine-coon",
    name: "\u7dec\u56e0\u8c93",
    nameEn: "Maine Coon",
    coatType: "long",
    coatLabel: "\u9577\u6bdb",
    coatLabelEn: "Long hair",
    shortDescription: "\u6eab\u67d4\u7684\u5de8\u4eba、\u9ad4\u578b\u9f90\u5927；\u6ce8\u91cd\u5fc3\u81df、\u95dc\u7bc0\u8207\u9577\u6bdb\u8b77\u7406。",
    shortDescriptionEn: "Gentle giant with lynx tips and a plumed tail — brush often and screen for HCM.",
    imageUrl: "/images/cat-breeds/maine-coon.jpg",
    origin: "\u7f8e\u570b（\u7dec\u56e0\u5dde）",
    originEn: "Maine, USA",
    lifespan: "12 - 15 \u6b72",
    lifespanEn: "12 – 15 years",
    weight: "\u516c 6.0–11.0 kg／\u6bcd 4.0–7.5 kg",
    weightEn: "Males 6.0–11.0 kg / Females 4.5–7.5 kg",
    personality: [
      "\u6eab\u67d4\u5de8\u4eba，\u5c0d\u4eba\u53cb\u5584\u5fe0\u8aa0",
      "\u8072\u97f3\u7d30\u5c0f，\u5e38\u767c\u51fa\u5431\u5431\u53eb",
      "\u667a\u529b\u9ad8，\u90e8\u5206\u559c\u6b61\u73a9\u6c34",
      "\u9069\u5408\u6709\u7a7a\u9593\u7684\u5bb6\u5ead",
    ],
    personalityEn: [
      "Friendly “gentle giant” personality",
      "Dog-like loyalty and follow-you habits",
      "Playful well into adulthood",
      "Usually good with children and other pets",
    ],
    careTips: [
      "\u6bcf\u9031\u68b3 2-3 \u6b21，\u91cd\u9ede\u814b\u4e0b、\u809a\u76ae\u8207\u5c3e\u6839；\u63db\u6bdb\u5b63\u6bcf\u65e5\u68b3",
      "\u914d\u5099\u8d85\u5927\u8c93\u7802\u76c6\u8207\u52a0\u56fa\u9ad8\u8073\u8c93\u6a39",
      "\u5b9a\u671f\u5fc3\u81df\u6aa2\u67e5（HCM），\u907f\u514d\u904e\u80d6\u52a0\u91cd\u95dc\u7bc0\u8ca0\u64d4",
    ],
    careTipsEn: [
      "Brush several times a week focusing on the ruff, britches, and plume tail.",
      "Offer sturdy tall trees — they are heavy climbers.",
      "Prioritize cardiac screening (HCM) and joint-friendly environments.",
    ],
    nutritionAdvice: [
      "\u5927\u578b\u665a\u719f\u9700\u9577\u671f\u9ad8\u86cb\u767d\u8207\u8db3\u5920\u71b1\u91cf",
      "\u88dc\u5145\u8461\u8404\u7cd6\u80fa、\u8edf\u9aa8\u7d20\u8207 Omega-3",
      "\u5927\u9846\u7c92\u4e7e\u7ce7\u6709\u52a9\u5480\u56bc\u4e26\u6e1b\u6162\u9032\u98df",
    ],
    nutritionAdviceEn: [
      "Large-breed growth needs careful, high-quality nutrition through a long adolescence.",
      "Joint-support nutrients help big frames.",
      "Measured adult feeding prevents excess weight on hips and heart.",
    ],
    fullDescription:
      "\u7dec\u56e0\u8c93\u662f\u9ad4\u578b\u6700\u5927\u7684\u5bb6\u8c93\u54c1\u7a2e\u4e4b\u4e00，\u8033\u6735\u5e36\u6709\u5c71\u8c93\u7c07\u6bdb，\u5c3e\u5df4\u5982\u7fbd\u6247\u822c\u8c50\u6eff。\u96d6\u7136\u5916\u8868\u9738\u6c23，\u4f46\u6027\u683c\u537b\u50cf\u5c0f\u72d7\u822c\u5fe0\u8aa0\u6eab\u67d4，\u662f\u9069\u5408\u6709\u7a7a\u9593\u5bb6\u5ead\u7684「\u6eab\u67d4\u5de8\u4eba」。",
    fullDescriptionEn:
      "One of the largest domesticated cats, Maine Coons are known for tufted ears, a boxed muzzle, and a magnificent plumed tail. Despite their size, they are famously gentle, social, and playful family companions.",
    breedInfo: MAINE_COON_BREED_INFO,
  },
  {
    id: "9",
    slug: "persian",
    name: "\u6ce2\u65af\u8c93",
    nameEn: "Persian",
    coatType: "long",
    coatLabel: "\u9577\u6bdb",
    coatLabelEn: "Long hair",
    shortDescription: "\u83ef\u9e97\u9577\u6bdb\u8207\u6241\u5e73\u9762\u5b54\u7684\u512a\u96c5\u4ee3\u8868，\u9700\u6bcf\u65e5\u68b3\u6bdb\u8b77\u7406。",
    shortDescriptionEn: "Luxurious long coat and flat face — daily brushing is non-negotiable.",
    imageUrl: "/images/cat-breeds/persian.jpg",
    origin: "\u4f0a\u6717／\u6ce2\u65af",
    originEn: "Iran / Persia",
    lifespan: "12 - 17 \u6b72",
    lifespanEn: "12 – 17 years",
    weight: "3.5 - 7.0 kg",
    weightEn: "3.5 – 7.0 kg",
    personality: ["\u6eab\u67d4", "\u5b89\u975c", "\u512a\u96c5", "\u9ecf\u4eba"],
    personalityEn: [
      "Gentle and quiet",
      "Elegant, unhurried rhythm",
      "Affectionate in a calm way",
      "Prefers peaceful, predictable homes",
    ],
    careTips: [
      "\u9577\u6bdb\u6975\u6613\u6253\u7d50，\u5efa\u8b70\u6bcf\u5929\u7528\u91dd\u68b3／\u6392\u68b3\u5fb9\u5e95\u68b3\u7406。",
      "\u6241\u81c9\u69cb\u9020\u9700\u6bcf\u65e5\u6e05\u7406\u773c\u89d2\u6dda\u75d5，\u4e26\u7559\u610f\u547c\u5438\u8207\u6563\u71b1\u8212\u9069\u5ea6。",
      "\u53ef\u5b9a\u671f\u5c08\u696d\u7f8e\u5bb9，\u4f46\u65e5\u5e38\u68b3\u6bdb\u4e0d\u80fd\u7701；\u63db\u6bdb\u5b63\u52a0\u5f37\u68b3\u7406\u6e1b\u5c11\u6bdb\u7403。",
    ],
    careTipsEn: [
      "Brush thoroughly every day — mats form quickly in dense long hair.",
      "Clean tear stains daily and watch breathing comfort in heat.",
      "Professional grooming helps, but daily home brushing is essential.",
    ],
    nutritionAdvice: [
      "\u9078\u64c7\u6709\u52a9\u6bdb\u7403\u63a7\u5236、\u6613\u6d88\u5316\u7684\u512a\u8cea\u6210\u8c93\u914d\u65b9。",
      "\u63a7\u5236\u4efd\u91cf，\u907f\u514d\u56e0\u6d3b\u52d5\u91cf\u8f03\u4f4e\u800c\u904e\u91cd。",
      "\u4e7e\u6fd5\u642d\u914d\u6709\u52a9\u6c34\u5206\u651d\u53d6；\u6241\u81c9\u8c93\u53ef\u9078\u6dfa\u53e3\u6216\u5fae\u50be\u659c\u98df\u7897。",
    ],
    nutritionAdviceEn: [
      "Choose digestible formulas that support hairball control.",
      "Portion carefully — lower activity means easy weight gain.",
      "Wet + dry feeding aids hydration; shallow bowls suit flat faces.",
    ],
    fullDescription:
      "\u6ce2\u65af\u8c93\u662f\u4e16\u754c\u4e0a\u6700\u77e5\u540d\u7684\u9577\u6bdb\u8c93\u4e4b\u4e00，\u7279\u5fb5\u70ba\u8c50\u6eff\u7684\u9577\u6bdb、\u5713\u6f64\u7684\u8eab\u9ad4\u8207\u6241\u5e73\u9762\u5b54。\u6027\u683c\u6eab\u67d4、\u5b89\u975c、\u512a\u96c5，\u559c\u6b61\u5e73\u7a69\u7684\u65e5\u5e38，\u9069\u5408\u516c\u5bd3\u8207\u8f03\u5b89\u975c\u7684\u5bb6\u5ead。\u6bcf\u65e5\u68b3\u6bdb\u4e0d\u53ef\u6216\u7f3a；\u6241\u81c9\u69cb\u9020\u4e5f\u9700\u7279\u5225\u7559\u610f\u773c\u90e8\u5206\u6ccc\u8207\u547c\u5438\u8212\u9069\u5ea6。",
    fullDescriptionEn:
      "Among the world’s most iconic longhairs, Persians are known for a full coat, cobby body, and flat face. Sweet, quiet, and graceful, they suit apartments and calm households committed to daily grooming and facial care.",
    breedInfo: PERSIAN_BREED_INFO,
  },
  {
    id: "10",
    slug: "scottish-fold",
    name: "\u8607\u683c\u862d\u647a\u8033\u8c93",
    nameEn: "Scottish Fold",
    coatType: "short",
    coatLabel: "\u77ed\u6bdb / \u9577\u6bdb",
    coatLabelEn: "Short / long hair",
    shortDescription: "\u5713\u982d\u647a\u8033、\u6eab\u548c\u9ecf\u4eba；\u5fc5\u9808\u95dc\u6ce8\u8edf\u9aa8\u8207\u95dc\u7bc0\u5065\u5eb7。",
    shortDescriptionEn: "Iconic folded ears and owl-like face; monitor joints and keep ears clean.",
    imageUrl: "/images/cat-breeds/scottish-fold.jpg",
    origin: "\u8607\u683c\u862d",
    originEn: "Scotland",
    lifespan: "11 - 14 \u6b72",
    lifespanEn: "11 – 15 years",
    weight: "\u516c 4.0–6.0 kg／\u6bcd 2.7–4.5 kg",
    weightEn: "Males 4.0–6.0 kg / Females 2.7–4.5 kg",
    personality: [
      "\u6eab\u548c\u9ecf\u4eba，\u611f\u60c5\u8c50\u5bcc",
      "\u5e38\u51fa\u73fe\u5927\u53d4\u5750\u59ff\u7b49\u53ef\u611b\u59ff\u52e2",
      "\u5b89\u975c\u4e0d\u5435，\u9069\u5408\u5ba4\u5167\u966a\u4f34",
      "\u5c0d\u4e3b\u4eba\u4f9d\u6200，\u559c\u6b61\u5f85\u5728\u8eab\u908a",
    ],
    personalityEn: [
      "Sweet, adaptable, and people-oriented",
      "Quiet voice and gentle manners",
      "Enjoys company without constant demands",
      "Often sits in charming “Buddha” poses",
    ],
    careTips: [
      "\u6bcf\u9031\u6e05\u6f54\u647a\u8033\u5167\u5074，\u907f\u514d\u6fd5\u6c23\u8207\u8033\u57a2\u5806\u7a4d",
      "\u5bc6\u5207\u7559\u610f\u8d70\u59ff\u8207\u5c3e\u5df4\u67d4\u8edf\u5ea6（\u8edf\u9aa8\u767c\u80b2\u76f8\u95dc\u98a8\u96aa）",
      "\u907f\u514d\u904e\u9ad8\u8df3\u8e8d；\u56b4\u683c\u63a7\u91cd\u4e26\u88dc\u5145\u95dc\u7bc0\u71df\u990a",
    ],
    careTipsEn: [
      "Clean folded ears regularly — wax and debris collect more easily.",
      "Watch gait, mobility, and tail flexibility; discuss cartilage health with your vet.",
      "Provide soft resting spots and avoid forcing high-impact play.",
    ],
    nutritionAdvice: [
      "\u9577\u671f\u88dc\u5145\u8461\u8404\u7cd6\u80fa、\u8edf\u9aa8\u7d20、\u7da0\u5507\u8cbd\u8c9d\u7b49",
      "\u56b4\u683c\u7cbe\u7b97\u71b1\u91cf，\u63a7\u91cd\u662f\u4fdd\u8b77\u95dc\u7bc0\u7684\u95dc\u9375",
      "\u5747\u8861\u5168\u50f9\u98f2\u98df，\u63db\u7ce7\u9700\u6f38\u9032",
    ],
    nutritionAdviceEn: [
      "Keep lean to reduce joint load.",
      "Joint-support diets may help; follow veterinary advice.",
      "Stable, high-quality feeding routine supports overall health.",
    ],
    fullDescription:
      "\u8607\u683c\u862d\u647a\u8033\u8c93\u4ee5\u5411\u524d\u4e0b\u6298\u7684\u8033\u6735\u548c\u5713\u6efe\u6efe\u5927\u982d\u5916\u8c8c\u805e\u540d，\u50cf\u4e00\u96bb\u6eab\u67d4\u7684\u5c0f\u8c93\u982d\u9df9。\u6027\u683c\u6eab\u548c\u89aa\u4eba，\u4f46\u647a\u8033\u57fa\u56e0\u8207\u8edf\u9aa8\u5065\u5eb7\u606f\u606f\u76f8\u95dc，\u98fc\u990a\u524d\u52d9\u5fc5\u4e86\u89e3\u5065\u5eb7\u98a8\u96aa\u8207\u8ca0\u8cac\u4efb\u7e41\u6b96。",
    fullDescriptionEn:
      "Scottish Folds are loved for forward-folding ears and a round, owl-like expression. Affectionate and easygoing, they need owners who understand fold-related cartilage/joint considerations and provide attentive, gentle care.",
    breedInfo: SCOTTISH_FOLD_BREED_INFO,
  },
  {
    id: "11",
    slug: "siamese",
    name: "\u66b9\u7f85\u8c93",
    nameEn: "Siamese",
    coatType: "short",
    coatLabel: "\u77ed\u6bdb",
    coatLabelEn: "Short hair",
    shortDescription: "\u91cd\u9ede\u8272\u85cd\u773c\u8a71\u9738；\u9700\u8981\u5927\u91cf\u4e92\u52d5\u8207\u966a\u4f34。",
    shortDescriptionEn: "Vocal, sleek colorpoint athletes that crave interaction and vertical space.",
    imageUrl: "/images/cat-breeds/siamese.jpg",
    origin: "\u6cf0\u570b（\u66b9\u7f85）",
    originEn: "Thailand (Siam)",
    lifespan: "15 - 20 \u6b72",
    lifespanEn: "15 – 20 years",
    weight: "\u516c 3.0–5.0 kg／\u6bcd 2.5–4.0 kg",
    weightEn: "Males 3.5–5.5 kg / Females 2.5–4.5 kg",
    personality: [
      "\u71b1\u60c5\u591a\u8a71，\u559c\u6b61\u8207\u4e3b\u4eba\u5c0d\u8a71",
      "\u6975\u5ea6\u9ecf\u4eba，\u5206\u96e2\u7126\u616e\u98a8\u96aa\u8f03\u9ad8",
      "\u8070\u660e\u8b66\u89ba、\u597d\u5947\u5fc3\u65fa\u76db",
      "\u9700\u8981\u5927\u91cf\u4e92\u52d5，\u4e0d\u9069\u5408\u9577\u671f\u7368\u8655",
    ],
    personalityEn: [
      "Highly social and talkative",
      "Bond intensely with their people",
      "Intelligent, curious, and trainable",
      "Thrive on play and conversation",
    ],
    careTips: [
      "\u63d0\u4f9b\u5927\u91cf\u966a\u4f34\u8207\u76ca\u667a\u904a\u6232，\u6e1b\u5c11\u5206\u96e2\u7126\u616e",
      "\u6015\u51b7，\u51ac\u5b63\u6e96\u5099\u6696\u5e8a；\u77ed\u6bdb\u6bcf\u9031\u8f15\u68b3\u5373\u53ef",
      "\u5b9a\u671f\u7259\u79d1\u8207\u5065\u5eb7\u6aa2\u67e5",
    ],
    careTipsEn: [
      "Short coat is low-maintenance; weekly wipe/brush is enough.",
      "Provide climbing trees, puzzle toys, and daily interactive play.",
      "They dislike long alone time — plan companionship or enrichment.",
    ],
    nutritionAdvice: [
      "\u9ad8\u86cb\u767d、\u9069\u4e2d\u8102\u80aa，\u7dad\u6301\u4fee\u9577\u512a\u96c5\u9ad4\u578b",
      "\u63db\u7ce7\u9700\u6f38\u9032；\u53ef\u7528\u85cf\u98df\u73a9\u5177\u6eff\u8db3\u5fc3\u667a\u9700\u6c42",
      "\u5145\u8db3\u98f2\u6c34\u8207\u5747\u8861\u4e3b\u98df",
    ],
    nutritionAdviceEn: [
      "Lean, muscular body needs quality protein and controlled carbs.",
      "Measured meals keep the elegant silhouette.",
      "Fresh water always available; wet food supports hydration.",
    ],
    fullDescription:
      "\u6e90\u81ea\u6cf0\u570b\u7687\u5ba4\u7684\u53e4\u8001\u8c93\u7a2e，\u64c1\u6709\u7368\u7279\u91cd\u9ede\u8272\u9762\u7f69、\u85cd\u8272\u674f\u4ec1\u773c\u8207\u82d7\u689d\u512a\u96c5\u9ad4\u578b。\u7260\u5011\u71b1\u60c5\u4e14\u6975\u5ea6\u4f9d\u8cf4\u4e3b\u4eba，\u662f\u500b\u6027\u6700\u9bae\u660e、\u6700\u6703「\u8aaa\u8a71」\u7684\u8c93\u54aa\u4e4b\u4e00。",
    fullDescriptionEn:
      "An ancient colorpoint breed from Thailand, Siamese cats are famous for sapphire eyes, a sleek body, and an unmistakable voice. Devoted and expressive, they flourish with owners who enjoy an interactive, conversational cat.",
    breedInfo: SIAMESE_BREED_INFO,
  },
  {
    id: "12",
    slug: "bengal",
    name: "\u5b5f\u52a0\u62c9\u8c93 (\u8c79\u8c93)",
    nameEn: "Bengal",
    coatType: "short",
    coatLabel: "\u77ed\u6bdb",
    coatLabelEn: "Short hair",
    shortDescription: "\u73ab\u7470\u6591\u8c79\u7d0b、\u7cbe\u529b\u5145\u6c9b；\u9700\u8981\u5ee3\u95ca\u6d3b\u52d5\u8207\u6bcf\u65e5\u904a\u6232。",
    shortDescriptionEn: "Wild-looking rosettes and high drive — needs serious daily enrichment.",
    imageUrl: "/images/cat-breeds/bengal.jpg",
    origin: "\u7f8e\u570b",
    originEn: "United States",
    lifespan: "12 - 16 \u6b72",
    lifespanEn: "12 – 16 years",
    weight: "\u516c 4.5–7.5 kg／\u6bcd 3.5–5.5 kg",
    weightEn: "Males 4.5–7.0 kg / Females 3.5–5.5 kg",
    personality: [
      "\u7cbe\u529b\u7121\u9650，\u71b1\u611b\u63a2\u7d22\u8207\u6500\u722c",
      "\u81ea\u4fe1\u52c7\u6562，\u8a31\u591a\u500b\u9ad4\u559c\u6b61\u73a9\u6c34",
      "\u8070\u660e\u53ef\u8a13\u7df4，\u9069\u5408\u8dd1\u8f2a\u8207\u9ede\u64ca\u8a13\u7df4",
      "\u9700\u8981\u8db3\u5920\u6d3b\u52d5\u51fa\u53e3，\u5426\u5247\u6613\u6417\u86cb",
    ],
    personalityEn: [
      "Energetic, athletic, and bold",
      "Curious problem-solvers",
      "Often water-fascinated",
      "Best with engaged, active guardians",
    ],
    careTips: [
      "\u6bcf\u5929\u81f3\u5c11 30-45 \u5206\u9418\u9ad8\u5f37\u5ea6\u9017\u8c93\u904a\u6232",
      "\u8a2d\u7f6e\u9ad8\u5927\u8c93\u6a39\u8207\u8dd1\u8f2a；\u53ef\u63d0\u4f9b\u5b89\u5168\u73a9\u6c34\u6a5f\u6703",
      "\u77ed\u6bdb\u6bcf\u9031\u68b3 1 \u6b21；\u5b9a\u671f\u5fc3\u81df\u8207\u773c\u775b\u76f8\u95dc\u6aa2\u67e5",
    ],
    careTipsEn: [
      "Expect high activity — climbing walls, wheels, and long play sessions help.",
      "Secure windows and balconies; clever escape artists.",
      "Short glittery coat needs only light weekly grooming.",
    ],
    nutritionAdvice: [
      "\u9ad8\u52d5\u7269\u86cb\u767d\u652f\u6301\u767c\u9054\u808c\u8089",
      "\u88dc\u5145\u725b\u78fa\u9178\u8207\u95dc\u7bc0\u71df\u990a",
      "\u63a7\u5236\u96f6\u98df\u71b1\u91cf，\u907f\u514d\u56e0\u7cbe\u529b\u65fa\u76db\u5f8c\u975c\u4e0b\u4f86\u767c\u80d6",
    ],
    nutritionAdviceEn: [
      "High-protein, meat-forward diets suit their athletic metabolism.",
      "Puzzle feeders channel hunting drive.",
      "Keep them lean and muscled, not heavy.",
    ],
    fullDescription:
      "\u64c1\u6709\u5982\u91ce\u751f\u8c79\u5b50\u822c\u5962\u83ef\u7684\u73ab\u7470\u6591\u7d0b\u8207\u91d1\u5c6c\u5149\u6fa4\u77ed\u6bdb，\u500b\u6027\u537b\u53ef\u89aa\u53ef\u8a13。\u7260\u5011\u662f\u904b\u52d5\u578b\u8c93\u54aa\u7684\u6975\u81f4\u4ee3\u8868，\u6700\u9069\u5408\u80fd\u63d0\u4f9b\u5927\u91cf\u904a\u6232\u8207\u5782\u76f4\u7a7a\u9593\u7684\u6d3b\u8e8d\u5bb6\u5ead。",
    fullDescriptionEn:
      "Bengals carry the striking rosettes and sheen of their Asian leopard cat ancestry within a domestic companion. Gorgeous and intense, they need experienced owners ready for enrichment, training, and lots of play.",
    breedInfo: BENGAL_BREED_INFO,
  },
  {
    id: "13",
    slug: "sphynx",
    name: "\u65af\u82ac\u514b\u65af\u7121\u6bdb\u8c93",
    nameEn: "Sphynx",
    coatType: "short",
    coatLabel: "\u7121\u6bdb / \u6975\u77ed\u7d68\u6bdb",
    coatLabelEn: "Hairless",
    shortDescription: "\u71b1\u60c5\u9ecf\u4eba、\u6015\u51b7；\u9700\u6bcf\u9031\u6d17\u6fa1\u8b77\u819a\u8207\u4fdd\u6696。",
    shortDescriptionEn: "Warm, wrinkled, and cuddly — plan regular skin baths and ear cleaning.",
    imageUrl: "/images/cat-breeds/sphynx.jpg",
    origin: "\u52a0\u62ff\u5927",
    originEn: "Canada",
    lifespan: "12 - 15 \u6b72",
    lifespanEn: "12 – 14 years",
    weight: "\u516c 3.5–5.5 kg／\u6bcd 2.5–4.5 kg",
    weightEn: "Males 3.5–5.5 kg / Females 3.0–4.5 kg",
    personality: [
      "\u71b1\u60c5\u5982\u706b、\u6975\u5ea6\u9ecf\u4eba",
      "\u53cb\u5584\u597d\u5ba2，\u5e38\u4e3b\u52d5\u8fce\u63a5\u8a2a\u5ba2",
      "\u667a\u5546\u9ad8、\u611b\u73a9，\u9700\u8981\u966a\u4f34",
      "\u559c\u6b61\u947d\u88ab\u7aa9\u53d6\u6696、\u8cbc\u8eab\u7761\u7720",
    ],
    personalityEn: [
      "Extroverted heat-seekers",
      "Extremely affectionate and social",
      "Clownish entertainers",
      "Want to be involved in everything",
    ],
    careTips: [
      "\u6bcf\u9031\u6eab\u6c34\u6d17\u6fa1\u53bb\u6cb9\u8102；\u6bcf\u65e5\u64e6\u8033\u8207\u8dbe\u9593",
      "\u51ac\u5929\u7a7f\u8863／\u6696\u5e8a，\u590f\u5929\u9632\u66ec，\u907f\u514d\u53d7\u6dbc\u8207\u66ec\u50b7",
      "\u5efa\u8b70\u5b9a\u671f\u5fc3\u81df\u6aa2\u67e5（HCM）",
    ],
    careTipsEn: [
      "Bathe regularly to manage skin oils; moisturize as needed.",
      "Clean ears often — wax builds up without hair.",
      "Keep them warm with sweaters/blankets and away from drafts/sunburn.",
    ],
    nutritionAdvice: [
      "\u4ee3\u8b1d\u9ad8，\u9700\u8f03\u9ad8\u71b1\u91cf\u512a\u8cea\u98f2\u98df\u7dad\u6301\u9ad4\u6eab",
      "\u88dc\u5145 Omega-3/6 \u8207\u7dad\u751f\u7d20 B \u7fa4\u5f37\u5316\u76ae\u819a\u5c4f\u969c",
      "\u9ad8\u6d88\u5316\u7387\u914d\u65b9，\u7559\u610f\u9ad4\u614b\u8207\u76ae\u8102\u5e73\u8861",
    ],
    nutritionAdviceEn: [
      "Higher metabolism may mean more calories — monitor body condition.",
      "Quality protein supports skin health.",
      "Avoid diets that worsen greasy skin; ask your vet if issues persist.",
    ],
    fullDescription:
      "\u65af\u82ac\u514b\u65af\u770b\u4f3c\u5916\u661f\u751f\u7269，\u89f8\u611f\u537b\u50cf\u6eab\u6696\u67d4\u8edf\u7684\u6843\u5b50\u76ae。\u7260\u5011\u6975\u5ea6\u71b1\u60c5\u9ecf\u4eba，\u88ab\u7a31\u70ba「\u8c93\u754c\u5c0f\u5916\u661f\u4eba」，\u9069\u5408\u80fd\u7d30\u5fc3\u8b77\u819a\u4fdd\u6696、\u4e26\u7d66\u4e88\u5927\u91cf\u966a\u4f34\u7684\u98fc\u4e3b。",
    fullDescriptionEn:
      "The Sphynx isn’t truly “skin only” — fine peach fuzz covers a warm, wrinkled body. Famous for Velcro-like affection and comic energy, they need owners committed to bathing, ear care, and keeping them cozy.",
    breedInfo: SPHYNX_BREED_INFO,
  },
  {
    id: "14",
    slug: "devon-rex",
    name: "\u5fb7\u6587\u5377\u6bdb\u8c93",
    nameEn: "Devon Rex",
    coatType: "short",
    coatLabel: "\u77ed\u5377\u6bdb",
    coatLabelEn: "Short / curly",
    shortDescription: "\u5c0f\u7cbe\u9748\u5927\u8033\u5377\u6bdb、\u6389\u6bdb\u5c11；\u6975\u9069\u5408\u90fd\u5e02\u516c\u5bd3。",
    shortDescriptionEn: "Elf-eared and wavy-coated jesters that love shoulders and shared meals vibes.",
    imageUrl: "/images/cat-breeds/devon-rex.jpg",
    origin: "\u82f1\u570b（\u5fb7\u6587\u90e1）",
    originEn: "Devon, England",
    lifespan: "12 - 15 \u6b72",
    lifespanEn: "12 – 16 years",
    weight: "\u516c 3.0–4.5 kg／\u6bcd 2.5–3.5 kg",
    weightEn: "Males 3.5–5.0 kg / Females 2.5–4.0 kg",
    personality: [
      "\u50cf\u5c0f\u7cbe\u9748：\u8abf\u76ae\u6d3b\u6f51、\u559c\u611f\u5341\u8db3",
      "\u6975\u89aa\u4eba\u985e，\u5e38\u8df3\u4e0a\u80a9\u8180\u966a\u4f34",
      "\u8070\u660e\u611b\u73a9，\u9069\u5408\u4e92\u52d5\u73a9\u5177",
      "\u6389\u6bdb\u5c11，\u9069\u5408\u5728\u610f\u8c93\u6bdb\u7684\u5bb6\u5ead",
    ],
    personalityEn: [
      "Mischievous, funny, and people-focused",
      "Often ride on shoulders",
      "Intelligent and interactive",
      "Bond closely with their household",
    ],
    careTips: [
      "\u5377\u6bdb\u5e7e\u4e4e\u4e0d\u6389，\u5076\u723e\u6fd5\u5e03\u64e6\u62ed\u5373\u53ef，\u907f\u514d\u904e\u5ea6\u68b3\u5237",
      "\u5927\u8033\u9700\u5b9a\u671f\u6aa2\u67e5\u8033\u9053；\u6bdb\u8584\u6015\u51b7，\u63d0\u4f9b\u6696\u8655",
      "\u5ba4\u5167\u98fc\u990a\u4e26\u7d66\u4e88\u8db3\u5920\u904a\u6232\u8207\u966a\u4f34",
    ],
    careTipsEn: [
      "Soft wavy coat: gentle weekly grooming; avoid over-bathing.",
      "Large ears need regular checks and cleaning.",
      "They seek warmth — cozy beds and sunny (safe) spots help.",
    ],
    nutritionAdvice: [
      "\u9ad8\u54c1\u8cea\u86cb\u767d\u7dad\u6301\u8f15\u5de7\u808c\u8089",
      "\u9069\u91cf\u92c5\u8207\u751f\u7269\u7d20\u6709\u52a9\u5377\u6bdb\u72c0\u614b",
      "\u53ef\u642d\u914d\u4e3b\u98df\u7f50\u6eff\u8db3\u597d\u5947\u5473\u857e",
    ],
    nutritionAdviceEn: [
      "Small-to-medium appetite; keep high-quality balanced meals.",
      "Some have sensitive digestion — transition foods slowly.",
      "Maintain a lean, springy body for their acrobatic play.",
    ],
    fullDescription:
      "\u64c1\u6709\u5927\u8033\u6735、\u5927\u773c\u775b\u8207\u53ef\u611b\u6ce2\u6d6a\u5377\u6bdb\u7684\u5fb7\u6587\u5377\u6bdb\u8c93，\u5b9b\u5982\u7ae5\u8a71\u5c0f\u7cbe\u9748。\u6389\u6bdb\u6975\u5c11、\u6027\u683c\u6d3b\u6f51\u5e7d\u9ed8，\u662f\u5ba4\u5167\u90fd\u5e02\u751f\u6d3b\u7d55\u4f73\u7684\u958b\u5fc3\u679c。",
    fullDescriptionEn:
      "Devon Rex cats are instantly recognizable for oversized ears, big eyes, and a soft wavy coat. Playful elves of the cat world, they thrive on human company and lighthearted daily interaction.",
    breedInfo: DEVON_REX_BREED_INFO,
  },
  {
    id: "15",
    slug: "mix-shorthair",
    name: "\u5510\u8c93 / \u6e2f\u77ed (\u7c73\u514b\u65af)",
    nameEn: "Hong Kong Shorthair / Mixed Breed (Tong Cat)",
    coatType: "short",
    coatLabel: "\u77ed\u6bdb",
    coatLabelEn: "Short hair",
    shortDescription: "\u82b1\u8272\u591a\u5143、\u9ad4\u8cea\u5f37\u5065；\u9999\u6e2f\u6700\u666e\u904d\u7684\u6eab\u6696\u966a\u4f34\u8005。",
    shortDescriptionEn: "Street-smart, resilient companions — the warm heart of many HK homes.",
    imageUrl: "/images/cat-breeds/mix-shorthair.jpg",
    origin: "\u9999\u6e2f／\u4e9e\u6d32\u5730\u5340",
    originEn: "Hong Kong / Asia",
    lifespan: "15 - 20 \u6b72",
    lifespanEn: "12 – 18 years (with good care)",
    weight: "\u516c 3.5–6.5 kg／\u6bcd 2.5–5.0 kg",
    weightEn: "Typically 3.0–6.0 kg (varies widely)",
    personality: [
      "\u6bcf\u96bb\u500b\u6027\u7368\u4e00\u7121\u4e8c",
      "\u8070\u660e\u6a5f\u9748、\u9069\u61c9\u529b\u6975\u5f37",
      "\u6df7\u7a2e\u57fa\u56e0\u5e38\u5e36\u4f86\u8f03\u4f73\u6574\u9ad4\u5065\u5eb7",
      "\u9818\u990a\u5510\u8c93\u610f\u7fa9\u7279\u5225\u6eab\u6696",
    ],
    personalityEn: [
      "Clever and highly adaptable",
      "Personalities range from independent to velcro",
      "Often excellent household problem-solvers",
      "Deeply rewarding adopted companions",
    ],
    careTips: [
      "\u77ed\u6bdb\u6bcf\u9031\u68b3 1 \u6b21；\u5ba4\u5167\u98fc\u990a\u6700\u5b89\u5168",
      "\u5b9a\u671f\u75ab\u82d7、\u9a45\u87f2、\u7d55\u80b2\u8207\u5065\u5eb7\u6aa2\u67e5",
      "\u63d0\u4f9b\u8df3\u53f0、\u7a97\u666f\u8207\u65e5\u5e38\u4e92\u52d5\u5efa\u7acb\u4fe1\u4efb",
    ],
    careTipsEn: [
      "Short coat: weekly brushing; indoor living is safest.",
      "Keep vaccines, parasite control, desexing, and checkups current.",
      "Offer trees, window views, and daily interaction to build trust.",
    ],
    nutritionAdvice: [
      "\u5747\u8861\u5168\u50f9\u4e3b\u98df\u5373\u53ef；\u591a\u6fd5\u7ce7\u88dc\u6c34\u8b77\u6ccc\u5c3f",
      "\u6210\u8c93\u5b9a\u6642\u5b9a\u91cf，\u9810\u9632\u80a5\u80d6",
      "\u53ef\u642d\u914d\u76ca\u751f\u83cc\u7dad\u6301\u8178\u9053\u7a69\u5b9a",
    ],
    nutritionAdviceEn: [
      "A complete balanced diet is enough; more wet food supports urinary health.",
      "Adults do best on scheduled portions to prevent obesity.",
      "Probiotics can help keep digestion steady.",
    ],
    fullDescription:
      "\u5510\u8c93（\u7c73\u514b\u65af／\u6e2f\u77ed）\u5305\u542b\u864e\u6591、\u6a58\u8c93、\u9ed1\u8c93、\u71d5\u5c3e\u670d\u8207\u4e09\u82b1\u7b49\u8c50\u5bcc\u82b1\u8272。\u7260\u5011\u64c1\u6709\u6975\u9ad8\u667a\u5546\u8207\u5f37\u5065\u9ad4\u8cea，\u662f\u9999\u6e2f\u5bb6\u5ead\u4e2d\u6700\u53d7\u6b61\u8fce、\u6700\u6eab\u6696\u7684\u9748\u9b42\u4f34\u4fb6。",
    fullDescriptionEn:
      "Tong cats (HK shorthairs / mixed breeds) come in tabby, ginger, black, tuxedo, calico, and more. Intelligent and robust, they are among the most beloved soul companions in Hong Kong homes — especially through adoption.",
    breedInfo: MIX_SHORTHAIR_BREED_INFO,
  },
];

/** Alias used across listing / detail routes. */
export const CAT_BREEDS = catBreedsData;

export function filterCatBreeds(
  filter: CatCoatFilter,
  breeds: CatBreed[] = CAT_BREEDS,
): CatBreed[] {
  if (filter === "all") return breeds;
  if (filter === "short") {
    return breeds.filter((breed) => breed.coatType === "short");
  }
  return breeds.filter((breed) => breed.coatType === "long");
}

export function getCatBreedBySlug(slug: string): CatBreed | undefined {
  return CAT_BREEDS.find((breed) => breed.slug === slug);
}

export function isCatBreedSlug(slug: string): boolean {
  return CAT_BREEDS.some((breed) => breed.slug === slug);
}
