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
  coatType: CatCoatType;
  coatLabel: string;
  shortDescription: string;
  imageUrl: string;
  origin: string;
  lifespan: string;
  weight: string;
  personality: string[];
  careTips: string[];
  nutritionAdvice: string[];
  fullDescription: string;
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
  name_zh_hk: "美國短毛貓",
  aliases: ["美短", "虎斑美短"],
  origin: {
    country: "美國",
    history_overview:
      "祖先隨歐洲移民船隻來到北美，經過長期自然選育與品種改良，成為體格強健、適應力極高的經典家貓。以銀虎斑與各色虎斑聞名，是美國家庭最受歡迎的短毛品種之一。",
  },
  physical_characteristics: {
    eye_color: "金色、綠色、榛果色（依毛色而異）",
    size_category: "中至大型、肌肉發達的矩形體型",
    weight_kg: {
      male: { min: 5.0, max: 7.5 },
      female: { min: 3.5, max: 5.5 },
    },
    maturation_years: "約 3-4 年",
    coat: {
      length: "Short（短毛）",
      texture: "硬密、富光澤",
      undercoat: "適中底毛，換毛季較明顯",
    },
  },
  patterns: [
    {
      pattern_id: "classic_tabby",
      name_zh: "經典虎斑 (Classic / Blotched Tabby)",
      description: "側身可見旋渦／牛眼紋，額頭常有『M』字斑紋",
      image_url: "",
    },
    {
      pattern_id: "silver_tabby",
      name_zh: "銀虎斑 (Silver Tabby)",
      description: "銀白底毛配清晰黑色斑紋，是美短最代表性花色之一",
      image_url: "",
    },
    {
      pattern_id: "brown_tabby",
      name_zh: "棕色虎斑 (Brown Tabby)",
      description: "暖棕底色與深色條紋，野外感強、辨識度高",
      image_url: "",
    },
    {
      pattern_id: "solid_and_bicolor",
      name_zh: "純色／雙色",
      description: "亦有純黑、純白、藍白等，但虎斑仍最常見",
      image_url: "",
    },
  ],
  colors: [
    {
      color_id: "silver_tabby",
      name_zh: "銀虎斑",
      description: "經典代表色",
    },
    {
      color_id: "brown_tabby",
      name_zh: "棕色虎斑",
      description: "溫暖野外感",
    },
    {
      color_id: "red_tabby",
      name_zh: "紅色虎斑",
      description: "橘紅條紋",
    },
    {
      color_id: "bicolor",
      name_zh: "雙色",
      description: "白底配虎斑或其他色塊",
    },
  ],
  personality_traits: [
    "聰明活潑，好奇心強，喜歡觀察家中動靜",
    "對人友善，通常能與兒童及其他寵物和睦相處",
    "適應力強，適合作為忙碌都市家庭的陪伴貓",
    "玩耍時精力充沛，平時也能安靜地陪伴在旁",
  ],
  care_and_health: {
    environment:
      "需要足夠活動空間與跳台／貓抓板；每天互動遊戲有助釋放精力",
    genetic_risks: [
      "肥厚型心肌病 (HCM)",
      "多囊性腎臟病 (PKD，部分血統需注意)",
    ],
    digestive_health: "整體腸胃穩定，換糧仍建議漸進過渡",
    diet_management:
      "肌肉發達需優質動物蛋白；成貓需定時定量，避免因活動量下降而發胖",
    grooming:
      "短毛易打理，平時每週梳毛 1 次；換毛季可增至 2-3 次，減少毛球",
  },
  media_assets: {
    status: "localized_gallery_sync",
    instruction_for_cursor:
      "美短圖庫已本地化：經典虎斑 / 銀虎斑 / 戶外 / 居家日常。",
    images: [
      {
        tag: "hero_main",
        description: "棕色虎斑美國短毛貓戶外特寫",
        src: "/images/cat-breeds/american-shorthair.jpg",
        alt: "棕色虎斑美國短毛貓",
      },
      {
        tag: "gallery_item_1",
        description: "標誌性銀虎斑（旋渦經典紋）",
        src: "/images/cat-breeds/american-shorthair-silver.jpg",
        alt: "銀虎斑美國短毛貓",
      },
      {
        tag: "gallery_item_2",
        description: "棕色虎斑與白斑近距離肖像",
        src: "/images/cat-breeds/american-shorthair-tabby.jpg",
        alt: "棕色虎斑美國短毛貓特寫",
      },
      {
        tag: "gallery_item_3",
        description: "戶外探索中的美短",
        src: "/images/cat-breeds/american-shorthair-outdoor.jpg",
        alt: "戶外的美國短毛貓",
      },
      {
        tag: "gallery_item_4",
        description: "居家休息的銀虎斑美短",
        src: "/images/cat-breeds/american-shorthair-cozy.jpg",
        alt: "室內休息的美國短毛貓",
      },
    ],
  },
};

/** British Shorthair rich profile for `/cat-breeds/british-shorthair`. */
export const BRITISH_SHORTHAIR_BREED_INFO: CatBreedInfo = {
  breed_id: "british_shorthair",
  name_en: "British Shorthair",
  name_zh_hk: "英國短毛貓",
  aliases: ["英短", "藍貓"],
  origin: {
    country: "英國",
    history_overview:
      "擁有悠久歷史，由古代羅馬貓引入英國本土貓改良而成，是歐洲最古老的貓品種之一。",
  },
  physical_characteristics: {
    eye_color: "古銅色 / 橘色、藍色、綠色、深金色",
    size_category: "Cobby（圓滾滾的臉龐、厚實圓潤的五短身材、骨架扎實）",
    weight_kg: {
      male: { min: 5.0, max: 8.0 },
      female: { min: 4.0, max: 6.0 },
    },
    maturation_years: "約 3 年",
    coat: {
      length: "Short（短毛）",
      texture: "厚密絨毛感",
      undercoat: "雙層短毛",
    },
  },
  patterns: [
    {
      pattern_id: "british_blue",
      name_zh: "經典藍灰色 (British Blue)",
      description: "最標誌性單色",
      image_url: "",
    },
    {
      pattern_id: "golden_shade",
      name_zh: "金漸層 (Golden Shaded / NY12等)",
      description: "近年極受歡迎的溫暖金色調，毛尖帶黑色暈染",
      image_url: "",
    },
    {
      pattern_id: "silver_tabby",
      name_zh: "銀虎斑 (Silver Tabby)",
      description: "帶有清晰斑紋與綠色/榛果色眼睛",
      image_url: "",
    },
    {
      pattern_id: "bicolor",
      name_zh: "雙色 (Bicolor)",
      description: "白底配搭藍色、灰色或虎斑塊",
      image_url: "",
    },
  ],
  colors: [
    {
      color_id: "british_blue",
      name_zh: "經典藍灰色",
      description: "最標誌性單色",
    },
    {
      color_id: "golden_shade",
      name_zh: "金漸層",
      description: "溫暖金色調，毛尖帶黑色暈染",
    },
    {
      color_id: "silver_tabby",
      name_zh: "銀虎斑",
      description: "清晰斑紋，綠/榛果色眼睛",
    },
    {
      color_id: "bicolor",
      name_zh: "雙色",
      description: "白底配搭藍色、灰色或虎斑塊",
    },
  ],
  personality_traits: [
    "性格溫和、理性、脾氣極好",
    "成熟穩重，不愛胡鬧或過度吵鬧",
    "獨立性高，非常適合忙碌的都市家庭與上班族",
    "對人友善，但通常不屬於黏人精型別，喜歡靜靜陪伴在旁",
  ],
  care_and_health: {
    environment: "適合忙碌的都市家庭與上班族；喜歡靜靜陪伴在旁",
    genetic_risks: [
      "肥厚型心肌病 (HCM)",
      "多囊性腎臟病 (PKD，建議購買前確認父母基因檢測)",
    ],
    digestive_health: "圓骨架體質，絕育後需特別留意熱量與體重管理",
    diet_management:
      "絕育後極容易發胖，且屬於圓骨架體質，必須嚴格定時定量控制熱量，並提供足夠的活水與溫和運動",
    grooming:
      "雖然是短毛貓，但因底毛厚密，平時每週需梳毛 1-2 次；換毛季時掉毛量大，需增加梳毛頻率以防毛球症",
  },
  media_assets: {
    status: "localized_gallery_sync",
    instruction_for_cursor:
      "英短圖庫已本地化：金漸層 / 藍貓 / 銀虎斑 / 日常，路徑 /images/cat-breeds/*.jpg",
    images: [
      {
        tag: "hero_main",
        description: "金漸層 (Golden Shaded)",
        src: "/images/cat-breeds/british-shorthair-golden.jpg",
        alt: "金漸層英國短毛貓",
      },
      {
        tag: "gallery_item_1",
        description: "經典藍貓 (British Blue)",
        src: "/images/cat-breeds/british-shorthair-blue.jpg",
        alt: "經典藍灰色英國短毛貓",
      },
      {
        tag: "gallery_item_2",
        description: "銀虎斑 (Silver Tabby)",
        src: "/images/cat-breeds/british-shorthair-silver.jpg",
        alt: "銀虎斑英國短毛貓",
      },
      {
        tag: "gallery_item_3",
        description: "日常慵懶/居家情境",
        src: "/images/cat-breeds/british-shorthair-cozy.jpg",
        alt: "室內休息的英國短毛貓",
      },
    ],
  },
};


/** Ragdoll rich profile for `/cat-breeds/ragdoll`. */
export const RAGDOLL_BREED_INFO: CatBreedInfo = {
  breed_id: "ragdoll",
  name_en: "Ragdoll",
  name_zh_hk: "布偶貓",
  aliases: ["仙女貓", "Puppy Cat", "棉花布娃娃貓"],
  origin: {
    country: "United States",
    state: "California",
    decade: "1960s",
    creator: "Ann Baker",
  },
  physical_characteristics: {
    eye_color: "Blue (必為藍眼睛)",
    size_category: "Large (大型貓)",
    weight_kg: {
      male: { min: 6.0, max: 9.0 },
      female: { min: 4.5, max: 7.0 },
    },
    maturation_years: "3-4 年（晚熟型）",
    coat: {
      length: "Medium-long (中長毛)",
      texture: "Silky (絲滑)",
      undercoat: "Sparse (底毛稀疏)",
    },
  },
  patterns: [
    {
      pattern_id: "bicolor",
      name_zh: "雙色",
      description: "臉部有對稱倒V字白斑，下巴、胸腹與四肢為白色",
      image_url: "/images/cat-breeds/ragdoll.jpg",
    },
    {
      pattern_id: "mitted",
      name_zh: "手套色",
      description: "前肢白色手套，後肢白色高筒靴，下巴至腹部有白色帶",
      image_url:
        "https://cdn2.thecatapi.com/images/HDxfaNlLj.jpg",
    },
    {
      pattern_id: "colorpoint",
      name_zh: "重點色",
      description: "面部、耳朵、四肢與尾巴為深色，軀幹為淺色",
      image_url:
        "https://cdn2.thecatapi.com/images/nqS9tUT3i.jpg",
    },
  ],
  colors: [
    { color_id: "seal", name_zh: "海豹色", description: "經典深褐" },
    { color_id: "blue", name_zh: "藍色", description: "灰色" },
    { color_id: "chocolate", name_zh: "巧克力色", description: "淺褐色" },
    { color_id: "lilac", name_zh: "丁香色", description: "淡紫灰色" },
    { color_id: "red", name_zh: "紅色", description: "暖橘紅" },
    { color_id: "cream", name_zh: "奶油色", description: "淺奶油色" },
    { color_id: "lynx", name_zh: "山貓紋", description: "帶有虎斑紋路" },
  ],
  personality_traits: [
    "極度黏人（Puppy Cat 性格）",
    "脾氣溫和，對兒童與寵物忍耐力高",
    "叫聲輕柔安靜",
    "高情商，善於陪伴與察覺情緒",
  ],
  care_and_health: {
    environment: "100% 室內飼養（防禦力低，切勿放養）",
    genetic_risks: ["肥厚型心肌病 (HCM)", "多囊性腎臟病 (PKD)"],
    digestive_health:
      "玻璃胃（腸胃敏感），換糧需 7-10 天過渡，建議補充益生菌",
    diet_management: "定時定量餵食，預防肥胖",
    grooming: "每週 2-3 次梳毛，定期修剪臀部雜毛",
  },
  media_assets: {
    status: "local_ready",
    images: [
      {
        tag: "hero_main",
        description: "湛藍眼睛與柔順長毛的雙色布偶貓特寫",
        src: "/images/cat-breeds/ragdoll.jpg",
        alt: "雙色布偶貓湛藍眼睛特寫",
      },
      {
        tag: "gallery_item_1",
        description: "手套色（Mitted）布偶：白手套與白腳的經典花色",
        src: "/images/cat-breeds/ragdoll-mitted.jpg",
        alt: "手套色布偶貓",
      },
      {
        tag: "gallery_item_2",
        description: "倒V字雙色布偶全身照（參考圖）",
        src: "https://cdn2.thecatapi.com/images/HDxfaNlLj.jpg",
        alt: "雙色布偶貓全身",
      },
      {
        tag: "gallery_item_3",
        description: "重點色布偶：臉耳尾色深、軀幹較淺",
        src: "https://cdn2.thecatapi.com/images/nqS9tUT3i.jpg",
        alt: "重點色布偶貓",
      },
    ],
  },
};

export const RUSSIAN_BLUE_BREED_INFO: CatBreedInfo = {
  breed_id: "russian_blue",
  name_en: "Russian Blue",
  name_zh_hk: "俄羅斯藍貓",
  aliases: ["俄藍", "藍貓", "Archangel Cat", "馬爾他藍貓（舊稱）"],
  origin: {
    country: "俄羅斯",
    state: "阿爾漢格爾斯克（Archangel）一帶",
    history_overview:
      "相傳源自俄羅斯北部港口阿爾漢格爾斯克的自然短毛貓，後經英國與北歐育種家選育定型。以銀光藍灰毛與翡翠綠眼睛聞名，是氣質優雅、聲音輕柔的經典短毛品種。",
  },
  physical_characteristics: {
    eye_color: "成貓為鮮艷翡翠綠（幼貓多為黃／琥珀，隨成長轉綠）",
    size_category: "Foreign／Semi-foreign（修長優雅、骨量適中而肌肉結實）",
    weight_kg: {
      male: { min: 3.5, max: 5.5 },
      female: { min: 2.5, max: 4.5 },
    },
    maturation_years: "約 2-3 年（眼睛與體型逐漸定型）",
    coat: {
      length: "Short（短毛）",
      texture: "厚密絨感、觸感如海豹皮",
      undercoat: "雙層短毛；表毛銀尖（silver tipping）帶金屬光澤",
    },
  },
  patterns: [
    {
      pattern_id: "silver_tipped_blue",
      name_zh: "銀尖藍灰色 (Silver-tipped Blue)",
      description: "絕大多數貓協認可的唯一標準色；毛尖銀白，整體呈金屬光澤",
      image_url: "",
    },
    {
      pattern_id: "american_type",
      name_zh: "美國型 (American Type)",
      description: "頭部稍圓、臉頰較豐滿，被毛更厚實絨密",
      image_url: "",
    },
    {
      pattern_id: "european_type",
      name_zh: "歐洲型 (European Type)",
      description: "臉型較尖、耳位較高，體型更修長優雅",
      image_url: "",
    },
    {
      pattern_id: "emerald_eyes",
      name_zh: "翡翠綠眼睛",
      description: "成貓必備標誌；幼貓眼色由黃轉綠約需一年以上",
      image_url: "",
    },
  ],
  colors: [
    {
      color_id: "blue",
      name_zh: "藍灰色",
      description: "均勻藍灰底色，無虎斑或白斑（標準）",
    },
    {
      color_id: "silver_tipping",
      name_zh: "銀尖光澤",
      description: "表毛末端銀白，光線下呈絲綢／金屬閃光",
    },
    {
      color_id: "lavender_pads",
      name_zh: "薰衣草色肉墊",
      description: "鼻頭石板灰、肉墊偏粉紫／薰衣草色為典型特徵",
    },
  ],
  personality_traits: [
    "對陌生人偏害羞內斂，對認定的家人極為忠誠親密",
    "叫聲輕柔、氣質安靜，適合喜歡寧靜居家氛圍的飼主",
    "聰慧敏銳，喜歡觀察與智力遊戲（藏食玩具等）",
    "環境敏感度高，需要穩定作息與專屬安全休息區",
  ],
  care_and_health: {
    environment:
      "適合安靜室內環境；搬屋、訪客或噪音大時需給予躲藏空間，避免強迫社交",
    genetic_risks: [
      "膀胱結石／泌尿道問題風險相對偏高（多喝水、留意尿量）",
      "整體屬健康長壽品種，仍建議定期健康檢查",
    ],
    digestive_health: "腸胃通常穩定；換糧仍建議漸進過渡",
    diet_management:
      "維持輕盈優雅體型，控制脂肪與熱量；補充牛磺酸有助眼睛與心臟健康；鼓勵多喝水",
    grooming:
      "銀藍雙層短毛掉毛量相對少，每週梳毛 1 次即可；換毛季可略增次數以保持銀光澤",
  },
  media_assets: {
    status: "localized_gallery_sync",
    instruction_for_cursor:
      "俄藍圖庫已本地化（7 張）：英雄／特寫／優雅／窗邊／居家／桌邊姿態／肉墊特寫。",
    images: [
      {
        tag: "hero_main",
        description: "美國型銀藍俄藍（翡翠綠眼睛）",
        src: "/images/cat-breeds/russian-blue.jpg",
        alt: "銀藍灰色俄羅斯藍貓",
      },
      {
        tag: "gallery_item_1",
        description: "銀光被毛與綠眼近距離特寫",
        src: "/images/cat-breeds/russian-blue-portrait.jpg",
        alt: "俄羅斯藍貓臉部特寫",
      },
      {
        tag: "gallery_item_2",
        description: "修長優雅的側身坐姿",
        src: "/images/cat-breeds/russian-blue-elegant.jpg",
        alt: "優雅姿態的俄羅斯藍貓",
      },
      {
        tag: "gallery_item_3",
        description: "窗邊日光下的銀藍光澤",
        src: "/images/cat-breeds/russian-blue-window.jpg",
        alt: "窗邊的俄羅斯藍貓",
      },
      {
        tag: "gallery_item_4",
        description: "居家休息的安靜日常",
        src: "/images/cat-breeds/russian-blue-cozy.jpg",
        alt: "室內休息的俄羅斯藍貓",
      },
      {
        tag: "gallery_item_5",
        description: "桌邊警覺坐姿與綠眼",
        src: "/images/cat-breeds/russian-blue-pose.jpg",
        alt: "桌邊的俄羅斯藍貓",
      },
      {
        tag: "gallery_item_6",
        description: "舉手展示薰衣草色肉墊",
        src: "/images/cat-breeds/russian-blue-paw.jpg",
        alt: "展示肉墊的俄羅斯藍貓",
      },
    ],
  },
};

export const MUNCHKIN_BREED_INFO: CatBreedInfo = {
  breed_id: "munchkin",
  name_en: "Munchkin",
  name_zh_hk: "曼赤因短腿貓",
  aliases: ["短腿貓", "臘腸貓", "Munchkin"],
  origin: {
    country: "美國",
    decade: "1980s",
    history_overview:
      "1980 年代於美國發現帶有自然短肢基因的家貓，後經育種定型。以短腿、長身軀聞名，被稱為「貓界臘腸狗」；短腿來自體染色體顯性基因，身體其餘比例與一般家貓相近。",
  },
  physical_characteristics: {
    eye_color: "金色、綠色、藍色、異色瞳（依毛色而異）",
    size_category: "短腿長身、中小型；四肢明顯短於標準家貓",
    weight_kg: {
      male: { min: 2.7, max: 4.0 },
      female: { min: 2.3, max: 3.6 },
    },
    maturation_years: "約 1.5-2 年",
    coat: {
      length: "Short 或 Long（短毛／長毛皆有）",
      texture: "柔軟中等密度",
      undercoat: "適中；長毛型頸部與尾毛較豐",
    },
  },
  patterns: [
    {
      pattern_id: "short_legs",
      name_zh: "短肢特徵",
      description: "前肢尤為短小，身軀相對修長；仍可敏捷奔跑、站立玩耍",
      image_url: "",
    },
    {
      pattern_id: "tabby",
      name_zh: "虎斑",
      description: "常見棕色／銀色虎斑，額頭常有『M』字",
      image_url: "",
    },
    {
      pattern_id: "bicolor_point",
      name_zh: "雙色／重點色",
      description: "亦有雙色、重點色（point）等多樣花色",
      image_url: "",
    },
    {
      pattern_id: "longhair",
      name_zh: "長毛型",
      description: "長毛曼赤因尾毛與頸毛更豐，外觀更圓潤",
      image_url: "",
    },
  ],
  colors: [
    { color_id: "tabby", name_zh: "虎斑", description: "最常見花色之一" },
    { color_id: "bicolor", name_zh: "雙色", description: "白底配深色塊" },
    { color_id: "point", name_zh: "重點色", description: "臉耳尾較深、軀幹較淺" },
    { color_id: "solid", name_zh: "純色", description: "白、黑、藍等單色" },
  ],
  personality_traits: [
    "天真活潑，像長不大的孩子，喜歡追逐與站立玩耍",
    "社交性高，通常對人與其他寵物友善",
    "好奇心強，短腿不影響攀爬與速度",
    "親人討抱，適合作為家庭開心果",
  ],
  care_and_health: {
    environment:
      "避免過高跳台與強迫高處落地；提供低矮跳台、斜坡與防滑地面。雖敏捷仍建議室內飼養。",
    genetic_risks: [
      "短肢基因相關的腰椎／關節負擔需長期留意",
      "肥胖會明顯加重脊椎與短腿壓力",
    ],
    digestive_health: "整體腸胃穩定；換糧仍建議漸進",
    diet_management:
      "嚴格控重；補充關節營養（葡萄糖胺、MSM、適量鈣與維生素 D3）；可選小顆粒乾糧",
    grooming:
      "短毛每週梳 1 次；長毛型 2-3 次。定期修剪指甲，減少短腿踩滑受傷",
  },
  media_assets: {
    status: "localized_gallery_sync",
    instruction_for_cursor:
      "曼赤因圖庫已本地化：英雄全身／虎斑／站立／雙色／玩耍。",
    images: [
      {
        tag: "hero_main",
        description: "長毛曼赤因全身（短腿特徵清晰）",
        src: "/images/cat-breeds/munchkin.jpg",
        alt: "曼赤因短腿貓全身照",
      },
      {
        tag: "gallery_item_1",
        description: "棕色虎斑短腿曼赤因",
        src: "/images/cat-breeds/munchkin-tabby.jpg",
        alt: "虎斑曼赤因短腿貓",
      },
      {
        tag: "gallery_item_2",
        description: "重點色曼赤因站立姿態",
        src: "/images/cat-breeds/munchkin-standing.jpg",
        alt: "站立的曼赤因短腿貓",
      },
      {
        tag: "gallery_item_3",
        description: "巧克力雙色短腿特寫",
        src: "/images/cat-breeds/munchkin-bicolor.jpg",
        alt: "雙色曼赤因短腿貓",
      },
      {
        tag: "gallery_item_4",
        description: "後肢站立玩耍的活潑日常",
        src: "/images/cat-breeds/munchkin-play.jpg",
        alt: "玩耍中的曼赤因短腿貓",
      },
    ],
  },
};

export const NORWEGIAN_FOREST_BREED_INFO: CatBreedInfo = {
  breed_id: "norwegian_forest",
  name_en: "Norwegian Forest Cat",
  name_zh_hk: "挪威森林貓",
  aliases: ["挪森", "森林貓", "Norsk skogkatt", "Wegie"],
  origin: {
    country: "挪威",
    history_overview:
      "北歐古老自然品種，相傳在斯堪地那維亞森林中適應嚴寒而生。擁有防水雙層長毛、健壯骨架與出色攀爬力，外表威嚴但性格溫和包容。",
  },
  physical_characteristics: {
    eye_color: "綠色、金色、銅色（與毛色協調）",
    size_category: "大型強壯、長身矩形；晚熟、骨量厚實",
    weight_kg: {
      male: { min: 5.5, max: 9.0 },
      female: { min: 4.0, max: 6.5 },
    },
    maturation_years: "約 3-5 年才完全成熟",
    coat: {
      length: "Long（長毛）",
      texture: "油亮防水表毛＋厚密底毛",
      undercoat: "雙層；冬季頸毛（ruff）與尾毛極豐",
    },
  },
  patterns: [
    {
      pattern_id: "tabby_white",
      name_zh: "虎斑／虎斑白",
      description: "常見棕色虎斑，常帶白胸、白腳與白鼻樑",
      image_url: "",
    },
    {
      pattern_id: "lynx_tips",
      name_zh: "山貓耳尖",
      description: "耳尖簇毛（lynx tips）與耳內長毛是標誌特徵",
      image_url: "",
    },
    {
      pattern_id: "winter_coat",
      name_zh: "冬毛／頸毛",
      description: "冬季雙層毛與胸前鬃毛更明顯，換毛季掉毛量大",
      image_url: "",
    },
    {
      pattern_id: "solid_smoke",
      name_zh: "單色／煙色等",
      description: "除巧克力／丁香／重點色外，多數花色皆可接受（視協會標準）",
      image_url: "",
    },
  ],
  colors: [
    { color_id: "brown_tabby", name_zh: "棕色虎斑", description: "經典森林感花色" },
    { color_id: "silver_tabby", name_zh: "銀虎斑", description: "銀白底配深紋" },
    { color_id: "black_white", name_zh: "黑白／雙色", description: "常見白斑組合" },
    { color_id: "red_tabby", name_zh: "紅色虎斑", description: "暖橘條紋" },
  ],
  personality_traits: [
    "勇敢探索、熱愛攀高，是天生的爬樹高手",
    "外表威嚴大氣，對人溫和友善、不黏膩",
    "適應力佳，能與兒童及其他寵物共處",
    "獨立中帶親密，喜歡安靜陪伴而非過度吵鬧",
  ],
  care_and_health: {
    environment:
      "需要高聳貓樹／牆面跳台；夏季注意厚毛散熱。適合有垂直活動空間的家庭。",
    genetic_risks: [
      "糖原儲積症 IV 型 (GSD IV，優良繁殖場會做基因篩檢)",
      "髖關節發育不良",
      "肥厚型心肌病 (HCM，部分血統)",
    ],
    digestive_health: "長毛易吞毛，需協助排毛球；換糧漸進",
    diet_management:
      "大型晚熟貓需長時間優質高蛋白；補纖維助排毛；可加葡萄糖胺支持骨骼",
    grooming:
      "平時每週梳 2-3 次；春秋換毛季建議每日梳理，特別是頸毛、腹側與尾根，減少毛結與毛球",
  },
  media_assets: {
    status: "localized_gallery_sync",
    instruction_for_cursor:
      "挪森圖庫已本地化：臉部英雄／雪地／戶外／銀虎斑特寫／雪中群像。",
    images: [
      {
        tag: "hero_main",
        description: "棕色虎斑挪森臉部（山貓耳尖）",
        src: "/images/cat-breeds/norwegian-forest.jpg",
        alt: "挪威森林貓臉部特寫",
      },
      {
        tag: "gallery_item_1",
        description: "雪中厚毛挪森",
        src: "/images/cat-breeds/norwegian-forest-snow.jpg",
        alt: "雪地中的挪威森林貓",
      },
      {
        tag: "gallery_item_2",
        description: "戶外自然環境中的挪森",
        src: "/images/cat-breeds/norwegian-forest-outdoor.jpg",
        alt: "戶外的挪威森林貓",
      },
      {
        tag: "gallery_item_3",
        description: "銀虎斑臉部與綠眼特寫",
        src: "/images/cat-breeds/norwegian-forest-portrait.jpg",
        alt: "銀虎斑挪威森林貓特寫",
      },
      {
        tag: "gallery_item_4",
        description: "雪地中的挪森群像",
        src: "/images/cat-breeds/norwegian-forest-pack.jpg",
        alt: "雪地中的挪威森林貓們",
      },
    ],
  },
};

export const EXOTIC_SHORTHAIR_BREED_INFO: CatBreedInfo = {
  breed_id: "exotic_shorthair",
  name_en: "Exotic Shorthair",
  name_zh_hk: "異國短毛貓",
  aliases: ["加菲貓", "異短", "Exotic"],
  origin: {
    country: "美國",
    decade: "1950s-1960s",
    history_overview:
      "以波斯貓為基礎，導入美國短毛等短毛血統育成，保留波斯的扁臉圓眼與溫柔性格，但被毛改為短而濃密、較易打理，因而常被暱稱為「加菲貓」。",
  },
  physical_characteristics: {
    eye_color: "銅色／橘色為常見；重點色可為藍眼；雙色可有異色瞳",
    size_category: "Cobby（矮胖結實、頭圓、鼻短、骨架扎實）",
    weight_kg: {
      male: { min: 4.0, max: 6.5 },
      female: { min: 3.0, max: 5.0 },
    },
    maturation_years: "約 2-3 年",
    coat: {
      length: "Short（短毛）",
      texture: "濃密絨毛感，毛稍立起如泰迪熊",
      undercoat: "厚密底毛，換毛季仍需勤梳",
    },
  },
  patterns: [
    {
      pattern_id: "tabby",
      name_zh: "虎斑",
      description: "棕色／銀色等虎斑，扁臉配大銅眼辨識度高",
      image_url: "",
    },
    {
      pattern_id: "bicolor",
      name_zh: "雙色",
      description: "白底配藍、橘、虎斑等色塊，常見「加菲」印象",
      image_url: "",
    },
    {
      pattern_id: "solid",
      name_zh: "純色",
      description: "白、黑、藍、紅、奶油等單色",
      image_url: "",
    },
    {
      pattern_id: "colorpoint",
      name_zh: "重點色",
      description: "類似喜馬拉雅／重點色波斯的短毛版，藍眼",
      image_url: "",
    },
  ],
  colors: [
    { color_id: "brown_tabby", name_zh: "棕色虎斑", description: "經典加菲感花色" },
    { color_id: "blue_white", name_zh: "藍白雙色", description: "灰藍配白胸臉" },
    { color_id: "cream_white", name_zh: "奶油白", description: "柔和淺色系" },
    { color_id: "calico", name_zh: "三花／玳瑁白", description: "橘、黑、白塊面" },
  ],
  personality_traits: [
    "文靜呆萌，喜歡安靜陪伴與輕柔互動",
    "對人溫柔討抱，情感豐富但不吵鬧",
    "適應室內生活，適合作為公寓陪伴貓",
    "節奏偏慢，享受窗邊觀察與午睡",
  ],
  care_and_health: {
    environment:
      "鼻短需注意通風散熱；避免過熱環境。提供淺口食碗與安靜休息區。",
    genetic_risks: [
      "多囊性腎臟病 (PKD，購買前確認父母基因檢測)",
      "扁臉相關的淚溢、鼻塞與呼吸負擔",
      "肥厚型心肌病 (HCM，部分血統)",
    ],
    digestive_health: "換糧需漸進；肥胖會加重心肺負擔",
    diet_management:
      "嚴格控重；可選易咬碎顆粒（扁臉較易咀嚼）；補充護眼抗氧化配方有助眼睛健康",
    grooming:
      "每天用溫濕棉片清理眼角與臉摺；每週梳毛 2-3 次（底毛厚）。定期檢查鼻周圍清潔",
  },
  media_assets: {
    status: "localized_gallery_sync",
    instruction_for_cursor:
      "異短圖庫已本地化：虎斑英雄／藍白雙色／側臉虎斑／居家慵懶／奶油白。",
    images: [
      {
        tag: "hero_main",
        description: "棕色虎斑異短（銅眼扁臉）",
        src: "/images/cat-breeds/exotic-shorthair.jpg",
        alt: "棕色虎斑異國短毛貓",
      },
      {
        tag: "gallery_item_1",
        description: "藍白雙色異短窗邊特寫",
        src: "/images/cat-breeds/exotic-shorthair-bicolor.jpg",
        alt: "藍白雙色異國短毛貓",
      },
      {
        tag: "gallery_item_2",
        description: "棕色虎斑側臉輪廓",
        src: "/images/cat-breeds/exotic-shorthair-tabby.jpg",
        alt: "虎斑異國短毛貓側臉",
      },
      {
        tag: "gallery_item_3",
        description: "奶油色異短居家休息",
        src: "/images/cat-breeds/exotic-shorthair-cozy.jpg",
        alt: "休息中的異國短毛貓",
      },
      {
        tag: "gallery_item_4",
        description: "奶油白異短向上凝視",
        src: "/images/cat-breeds/exotic-shorthair-cream.jpg",
        alt: "奶油白異國短毛貓",
      },
    ],
  },
};

export const MAINE_COON_BREED_INFO: CatBreedInfo = {
  breed_id: "maine_coon",
  name_en: "Maine Coon",
  name_zh_hk: "緬因貓",
  aliases: ["緬因庫恩貓", "溫柔巨人", "Maine Coon"],
  origin: {
    country: "美國",
    state: "緬因州",
    history_overview:
      "北美最古老的自然長毛品種之一，相傳於緬因州嚴冬中演化出厚毛、大骨與防寒尾毛。體型為家貓之最，性格卻如小狗般忠誠溫柔，常被稱為「溫柔的巨人」。",
  },
  physical_characteristics: {
    eye_color: "綠色、金色、銅色（白貓可有藍眼／異色瞳）",
    size_category: "大型至超大型；長身矩形、骨量厚實、晚熟",
    weight_kg: {
      male: { min: 6.0, max: 11.0 },
      female: { min: 4.0, max: 7.5 },
    },
    maturation_years: "約 3-5 年才完全成熟",
    coat: {
      length: "Long（長毛）",
      texture: "絲綢感防水表毛，頸毛與尾毛豐滿",
      undercoat: "厚密底毛；耳尖常有山貓簇毛（lynx tips）",
    },
  },
  patterns: [
    { pattern_id: "classic_tabby", name_zh: "經典／斑紋虎斑", description: "最常見；額頭常有『M』字，尾毛如羽扇", image_url: "" },
    { pattern_id: "silver_tabby", name_zh: "銀虎斑", description: "銀白底配清晰深紋，氣勢十足", image_url: "" },
    { pattern_id: "bicolor", name_zh: "雙色／白斑", description: "白胸、白腳、白鼻樑等常見", image_url: "" },
    { pattern_id: "solid_smoke", name_zh: "純色／煙色", description: "黑、藍、紅、奶油等亦可見", image_url: "" },
  ],
  colors: [
    { color_id: "brown_tabby", name_zh: "棕色虎斑", description: "經典代表色" },
    { color_id: "silver_tabby", name_zh: "銀虎斑", description: "金屬感銀底" },
    { color_id: "red_tabby", name_zh: "紅色虎斑", description: "暖橘條紋" },
    { color_id: "bicolor", name_zh: "雙色", description: "白底配其他色塊" },
  ],
  personality_traits: [
    "溫柔巨人：外表霸氣，對人極為友善忠誠",
    "聲音細小（chirp／吱吱叫），甚少大聲嚎叫",
    "智力高、可訓練，部分個體喜歡玩水",
    "適合有空間的家庭，能與兒童及其他寵物共處",
  ],
  care_and_health: {
    environment: "需超大貓砂盆與加固高聳貓樹；體型大，活動空間要充足",
    genetic_risks: ["肥厚型心肌病 (HCM)", "髖關節發育不良", "脊髓肌萎縮症 (SMA，優良繁殖場會篩檢)"],
    digestive_health: "長毛易吞毛，需協助排毛球；換糧漸進",
    diet_management: "大型晚熟需長期高蛋白；補葡萄糖胺／軟骨素與 Omega-3；大顆粒乾糧可減慢進食",
    grooming: "每週梳 2-3 次，重點腋下、肚皮與尾根；換毛季增至每日，避免毛結",
  },
  media_assets: {
    status: "localized_gallery_sync",
    instruction_for_cursor: "緬因圖庫已本地化：戶外英雄／特寫／臉部／全身／群像／銀虎斑。",
    images: [
      { tag: "hero_main", description: "戶外棕色虎斑緬因（山貓耳尖）", src: "/images/cat-breeds/maine-coon.jpg", alt: "緬因貓戶外特寫" },
      { tag: "gallery_item_1", description: "長毛臉部近距離", src: "/images/cat-breeds/maine-coon-portrait.jpg", alt: "緬因貓臉部特寫" },
      { tag: "gallery_item_2", description: "方形吻部與綠眼", src: "/images/cat-breeds/maine-coon-face.jpg", alt: "緬因貓正面" },
      { tag: "gallery_item_3", description: "大型全身與羽狀尾", src: "/images/cat-breeds/maine-coon-full.jpg", alt: "緬因貓全身照" },
      { tag: "gallery_item_4", description: "三種花色緬因群像", src: "/images/cat-breeds/maine-coon-group.jpg", alt: "緬因貓群像" },
      { tag: "gallery_item_5", description: "銀虎斑緬因", src: "/images/cat-breeds/maine-coon-silver.jpg", alt: "銀虎斑緬因貓" },
    ],
  },
};

export const PERSIAN_BREED_INFO: CatBreedInfo = {
  breed_id: "persian",
  name_en: "Persian",
  name_zh_hk: "波斯貓",
  aliases: ["Persian Cat", "長毛波斯", "扁臉波斯"],
  origin: {
    country: "伊朗／波斯",
    history_overview:
      "波斯貓是最知名的長毛貓品種之一，以豐滿華麗的被毛、圓潤身體與扁平面孔聞名。性格溫柔安靜，適合寧靜的室內家庭；每日梳毛是飼養核心承諾。",
  },
  physical_characteristics: {
    eye_color: "銅橙色、藍色或異色（依毛色而異）",
    size_category: "中型、圓潤厚實（cobby）",
    weight_kg: {
      male: { min: 4.5, max: 7.0 },
      female: { min: 3.5, max: 5.5 },
    },
    maturation_years: "約 2-3 年",
    coat: {
      length: "Long（長毛）",
      texture: "豐滿柔軟、需每日梳理",
      undercoat: "濃密底毛，易打結",
    },
  },
  patterns: [
    {
      pattern_id: "solid_longhair",
      name_zh: "純色長毛",
      description: "白色、藍色、奶油等單色華麗披毛",
      image_url: "/images/cat-breeds/persian-cream.jpg",
    },
    {
      pattern_id: "bicolor",
      name_zh: "雙色／色塊",
      description: "白底配其他色塊的經典波斯外觀",
      image_url: "/images/cat-breeds/persian-fluffy.jpg",
    },
    {
      pattern_id: "face_type",
      name_zh: "扁臉構造",
      description: "圓臉、短鼻與大圓眼是波斯特徵",
      image_url: "/images/cat-breeds/persian-face.jpg",
    },
  ],
  colors: [
    { color_id: "white_cream", name_zh: "白／奶油", description: "經典淺色長毛" },
    { color_id: "blue", name_zh: "藍色", description: "藍灰長毛" },
    { color_id: "red_bicolor", name_zh: "橘白／紅虎斑", description: "暖色調雙色" },
  ],
  personality_traits: ["溫柔", "安靜", "優雅", "黏人", "節奏緩慢"],
  care_and_health: {
    environment: "安靜穩定的室內環境；避免過度嘈雜與高處強逼活動",
    genetic_risks: ["多囊腎病（PKD）等品種相關風險——認養宜查健康檢測", "扁臉相關淚溢與呼吸舒適度", "牙科咬合問題"],
    digestive_health: "注意毛球；梳毛不足時毛球與腸胃不適風險上升",
    diet_management: "優質成貓糧＋有助毛球控制的配方；控制份量避免過重",
    grooming: "每日梳毛必要；可定期專業美容，但日常梳理不能省",
  },
  media_assets: {
    status: "local_ready",
    images: [
      {
        tag: "hero_main",
        description: "經典波斯：豐滿長毛與扁平面孔的優雅代表",
        src: "/images/cat-breeds/persian.jpg",
        alt: "奶油白波斯貓正面特寫",
      },
      {
        tag: "gallery_item_01",
        description: "雪白／奶油長毛：圓潤輪廓與柔順被毛",
        src: "/images/cat-breeds/persian-cream.jpg",
        alt: "奶油色波斯貓",
      },
      {
        tag: "gallery_item_02",
        description: "蓬鬆披毛特寫：華麗長毛的質感",
        src: "/images/cat-breeds/persian-fluffy.jpg",
        alt: "長毛蓬鬆的波斯貓",
      },
      {
        tag: "gallery_item_03",
        description: "臉部特寫：扁臉構造與大圓眼",
        src: "/images/cat-breeds/persian-face.jpg",
        alt: "波斯貓扁臉特寫",
      },
      {
        tag: "gallery_item_04",
        description: "肖像角度：沉靜優雅的氣質",
        src: "/images/cat-breeds/persian-portrait.jpg",
        alt: "波斯貓肖像",
      },
      {
        tag: "gallery_item_05",
        description: "居家寧靜氛圍：適合穩定作息的室內伴侶",
        src: "/images/cat-breeds/persian-cozy.jpg",
        alt: "在家中休息的波斯貓",
      },
    ],
  },
};

export const SCOTTISH_FOLD_BREED_INFO: CatBreedInfo = {
  breed_id: "scottish_fold",
  name_en: "Scottish Fold",
  name_zh_hk: "蘇格蘭摺耳貓",
  aliases: ["折耳貓", "摺耳", "Scottish Fold"],
  origin: {
    country: "蘇格蘭",
    decade: "1960s",
    history_overview:
      "1960 年代於蘇格蘭發現 naturally folded ears 的農場貓，後經育種定型。圓頭、大眼與向前下折的耳朵造就「貓頭鷹」外貌；摺耳來自軟骨發育相關顯性基因，繁殖上需特別謹慎。",
  },
  physical_characteristics: {
    eye_color: "金色、銅色、綠色、藍色（依毛色）",
    size_category: "中型、圓潤結實；頭圓、身短、腿中等",
    weight_kg: {
      male: { min: 4.0, max: 6.0 },
      female: { min: 2.7, max: 4.5 },
    },
    maturation_years: "約 2-3 年；耳摺通常於數週齡開始出現",
    coat: {
      length: "Short 或 Long（短毛／長毛 Highland Fold）",
      texture: "濃密柔軟",
      undercoat: "適中至厚密",
    },
  },
  patterns: [
    { pattern_id: "folded_ears", name_zh: "摺耳特徵", description: "耳向前下折貼頭；同窩亦可有立耳 Scottish Straight", image_url: "" },
    { pattern_id: "solid", name_zh: "純色", description: "藍、白、黑、奶油等常見", image_url: "" },
    { pattern_id: "tabby", name_zh: "虎斑", description: "圓臉配虎斑辨識度高", image_url: "" },
    { pattern_id: "bicolor", name_zh: "雙色／點色", description: "白底配其他色或重點色", image_url: "" },
  ],
  colors: [
    { color_id: "blue", name_zh: "藍色", description: "經典灰藍摺耳" },
    { color_id: "white", name_zh: "白色", description: "圓臉大眼更突出" },
    { color_id: "tabby", name_zh: "虎斑", description: "常見花色" },
    { color_id: "bicolor", name_zh: "雙色", description: "白底配色塊" },
  ],
  personality_traits: [
    "溫和黏人，感情豐富但不吵鬧",
    "常出現「大叔坐姿」等可愛姿勢",
    "適應室內生活，適合安靜陪伴",
    "對主人依戀，喜歡待在人身邊",
  ],
  care_and_health: {
    environment: "避免過高跳躍與劇烈撞擊；提供低矮跳台與軟墊。室內飼養為主",
    genetic_risks: [
      "骨軟骨發育不良 (Osteochondrodysplasia)——摺耳基因相關，需定期觀察步態與尾部柔軟度",
      "摺耳處易藏垢，需定期清潔耳道",
      "肥厚型心肌病 (HCM，部分血統)",
    ],
    digestive_health: "整體穩定；換糧漸進",
    diet_management: "嚴格控重以減輕關節負擔；長期補充葡萄糖胺、軟骨素、綠唇貽貝等關節營養",
    grooming: "短毛每週梳 1-2 次；長毛型更勤。每週檢查並清潔摺耳內側",
  },
  media_assets: {
    status: "localized_gallery_sync",
    instruction_for_cursor: "摺耳圖庫已本地化：藍灰英雄／棚拍／戶外／虎斑／白摺耳／居家。",
    images: [
      { tag: "hero_main", description: "藍灰色摺耳特寫（銅眼）", src: "/images/cat-breeds/scottish-fold.jpg", alt: "藍灰色蘇格蘭摺耳貓" },
      { tag: "gallery_item_1", description: "棚拍全身摺耳", src: "/images/cat-breeds/scottish-fold-studio.jpg", alt: "蘇格蘭摺耳貓棚拍" },
      { tag: "gallery_item_2", description: "戶外藤籃中的摺耳", src: "/images/cat-breeds/scottish-fold-outdoor.jpg", alt: "戶外蘇格蘭摺耳貓" },
      { tag: "gallery_item_3", description: "棕色虎斑摺耳近拍", src: "/images/cat-breeds/scottish-fold-tabby.jpg", alt: "虎斑蘇格蘭摺耳貓" },
      { tag: "gallery_item_4", description: "白色摺耳大叔坐姿", src: "/images/cat-breeds/scottish-fold-white.jpg", alt: "白色蘇格蘭摺耳貓" },
      { tag: "gallery_item_5", description: "居家休息的摺耳", src: "/images/cat-breeds/scottish-fold-cozy.jpg", alt: "休息中的蘇格蘭摺耳貓" },
    ],
  },
};

export const SIAMESE_BREED_INFO: CatBreedInfo = {
  breed_id: "siamese",
  name_en: "Siamese",
  name_zh_hk: "暹羅貓",
  aliases: ["暹羅", "Thai cat", "話霸貓"],
  origin: {
    country: "泰國（昔稱暹羅）",
    history_overview:
      "東南亞古老皇室貓種，以重點色（colorpoint）、杏仁藍眼與修長體態聞名。現代秀場型更為修長；傳統型（Thai／蘋果頭）臉型較圓。性格熱情多話，極依賴主人。",
  },
  physical_characteristics: {
    eye_color: "必為深邃藍色（杏仁眼）",
    size_category: "中型修長（Oriental／管狀體型），肌肉結實",
    weight_kg: {
      male: { min: 3.0, max: 5.0 },
      female: { min: 2.5, max: 4.0 },
    },
    maturation_years: "約 1-2 年；重點色隨成長與溫度加深",
    coat: {
      length: "Short（短毛）",
      texture: "貼身、細密、少底毛",
      undercoat: "稀疏；幾乎不掉毛",
    },
  },
  patterns: [
    { pattern_id: "seal_point", name_zh: "海豹重點色", description: "臉耳腳尾深褐近黑，軀幹奶油色——最經典", image_url: "" },
    { pattern_id: "chocolate_point", name_zh: "巧克力重點色", description: "奶茶褐重點，整體較柔和", image_url: "" },
    { pattern_id: "blue_point", name_zh: "藍色重點色", description: "藍灰重點配冷調軀幹", image_url: "" },
    { pattern_id: "lilac_point", name_zh: "丁香重點色", description: "粉灰淡紫重點，最淡雅", image_url: "" },
  ],
  colors: [
    { color_id: "seal", name_zh: "海豹色", description: "經典深褐重點" },
    { color_id: "chocolate", name_zh: "巧克力色", description: "暖褐重點" },
    { color_id: "blue", name_zh: "藍色", description: "藍灰重點" },
    { color_id: "lilac", name_zh: "丁香色", description: "淡紫灰重點" },
  ],
  personality_traits: [
    "貓界話霸：語調豐富，喜歡與主人「對話」",
    "極度黏人與熱情，分離焦慮風險較高",
    "聰明警覺、好奇心強，適合益智遊戲",
    "需要大量互動，不適合長期獨處",
  ],
  care_and_health: {
    environment: "怕冷；冬季需暖床。需要陪伴與垂直活動空間；可訓練互動",
    genetic_risks: ["進行性視網膜萎縮 (PRA，部分血統)", "澱粉樣變性／肝腎問題（部分古老血統需留意）", "牙科與上呼吸道需定期檢查"],
    digestive_health: "敏感體質不少見；換糧需 7-10 天過渡",
    diet_management: "高蛋白、適中脂肪維持修長體型；足夠益智餵食減少無聊暴食",
    grooming: "短毛每週輕梳 1 次即可；定期刷牙與耳部檢查",
  },
  media_assets: {
    status: "localized_gallery_sync",
    instruction_for_cursor: "暹羅圖庫已本地化：英雄／海豹點／特寫／藍眼／經典雌貓／巧克力點。",
    images: [
      { tag: "hero_main", description: "海豹重點色暹羅（藍眼）", src: "/images/cat-breeds/siamese.jpg", alt: "海豹重點色暹羅貓" },
      { tag: "gallery_item_1", description: "海豹點全身與面罩", src: "/images/cat-breeds/siamese-seal.jpg", alt: "海豹點暹羅貓全身" },
      { tag: "gallery_item_2", description: "藍眼杏仁眼特寫", src: "/images/cat-breeds/siamese-portrait.jpg", alt: "暹羅貓藍眼特寫" },
      { tag: "gallery_item_3", description: "優雅坐姿暹羅", src: "/images/cat-breeds/siamese-blue.jpg", alt: "坐姿暹羅貓" },
      { tag: "gallery_item_4", description: "經典雌暹羅", src: "/images/cat-breeds/siamese-classic.jpg", alt: "經典暹羅貓" },
      { tag: "gallery_item_5", description: "巧克力重點色", src: "/images/cat-breeds/siamese-chocolate.jpg", alt: "巧克力點暹羅貓" },
    ],
  },
};

export const BENGAL_BREED_INFO: CatBreedInfo = {
  breed_id: "bengal",
  name_en: "Bengal",
  name_zh_hk: "孟加拉貓",
  aliases: ["豹貓", "Bengal", "玫瑰斑"],
  origin: {
    country: "美國",
    decade: "1970s-1980s",
    history_overview:
      "以亞洲豹貓與家貓雜交後代經多代選育而成的家貓品種，保留野性豹紋卻個性可親。以玫瑰斑（rosettes）、金屬光澤短毛與爆發力著稱，是精力充沛的運動型伴侶。",
  },
  physical_characteristics: {
    eye_color: "綠色、金色（雪系可有藍眼）",
    size_category: "中至大型、肌肉發達、後肢有力",
    weight_kg: {
      male: { min: 4.5, max: 7.5 },
      female: { min: 3.5, max: 5.5 },
    },
    maturation_years: "約 2-3 年；斑紋隨成長更清晰",
    coat: {
      length: "Short（短毛）",
      texture: "密而柔軟，常帶「金閃／珍珠」金屬光澤",
      undercoat: "適中；掉毛量通常不高",
    },
  },
  patterns: [
    { pattern_id: "rosetted", name_zh: "玫瑰斑 (Rosettes)", description: "最受歡迎：環狀／箭頭狀豹紋", image_url: "" },
    { pattern_id: "spotted", name_zh: "點斑", description: "清晰圓點或碎斑", image_url: "" },
    { pattern_id: "marble", name_zh: "大理石紋", description: "水平漩渦橫紋，如流動豹紋", image_url: "" },
    { pattern_id: "snow", name_zh: "雪系 (Snow)", description: "淺底深斑，部分為重點色藍眼", image_url: "" },
  ],
  colors: [
    { color_id: "brown", name_zh: "棕色／金色", description: "經典金底黑褐斑" },
    { color_id: "silver", name_zh: "銀色", description: "銀白底配黑斑" },
    { color_id: "snow_lynx", name_zh: "雪山貓", description: "淺色重點感，藍眼" },
    { color_id: "charcoal", name_zh: "炭黑系", description: "深色罩毛對比強" },
  ],
  personality_traits: [
    "精力無限，需要大量遊戲與攀爬",
    "自信勇敢，喜歡探索與玩水",
    "聰明可訓練，適合跑輪與點擊訓練",
    "對人友善，但需要足夠活動出口否則易搗蛋",
  ],
  care_and_health: {
    environment: "必須有高大貓樹、跑輪與每日 30-45 分鐘高強度互動；可提供水池／水龍頭遊戲",
    genetic_risks: ["肥厚型心肌病 (HCM)", "扁平胸症候群（幼貓偶見）", "進行性視網膜萎縮 (PRA-b，優良場會篩檢)"],
    digestive_health: "部分個體腸胃敏感；換糧漸進、可選高消化率配方",
    diet_management: "高動物蛋白支持肌肉；補牛磺酸與關節營養；控制零食避免過胖",
    grooming: "短毛每週梳 1 次即可；定期指甲與口腔護理",
  },
  media_assets: {
    status: "localized_gallery_sync",
    instruction_for_cursor: "孟加拉圖庫已本地化：英雄／玫瑰斑／點斑／運動姿／金色／全身。",
    images: [
      { tag: "hero_main", description: "金底玫瑰斑孟加拉", src: "/images/cat-breeds/bengal.jpg", alt: "孟加拉豹貓" },
      { tag: "gallery_item_1", description: "清晰玫瑰斑特寫", src: "/images/cat-breeds/bengal-rosette.jpg", alt: "玫瑰斑孟加拉貓" },
      { tag: "gallery_item_2", description: "點斑豹紋", src: "/images/cat-breeds/bengal-spots.jpg", alt: "點斑孟加拉貓" },
      { tag: "gallery_item_3", description: "肌肉發達運動姿態", src: "/images/cat-breeds/bengal-athletic.jpg", alt: "運動中的孟加拉貓" },
      { tag: "gallery_item_4", description: "金色金屬光澤被毛", src: "/images/cat-breeds/bengal-golden.jpg", alt: "金色孟加拉貓" },
      { tag: "gallery_item_5", description: "全身斑紋展示", src: "/images/cat-breeds/bengal-full.jpg", alt: "孟加拉貓全身照" },
    ],
  },
};

export const SPHYNX_BREED_INFO: CatBreedInfo = {
  breed_id: "sphynx",
  name_en: "Sphynx",
  name_zh_hk: "斯芬克斯無毛貓",
  aliases: ["無毛貓", "加拿大無毛貓", "Sphynx"],
  origin: {
    country: "加拿大",
    decade: "1960s",
    history_overview:
      "1960 年代加拿大自然突變的無毛小貓經選育而成。看似無毛，實為極細絨或完全裸膚，觸感如溫暖桃皮。熱情黏人，代謝高、怕冷，需特別護膚與保暖。",
  },
  physical_characteristics: {
    eye_color: "任何色（綠、金、藍、異色等）",
    size_category: "中型、肌肉結實、肚皮圓潤；大耳、皺皮膚",
    weight_kg: {
      male: { min: 3.5, max: 5.5 },
      female: { min: 2.5, max: 4.5 },
    },
    maturation_years: "約 2 年",
    coat: {
      length: "Hairless／極短絨（無毛至桃皮絨）",
      texture: "溫暖如麂皮；皮膚多皺褶（額、頸、腿）",
      undercoat: "無傳統被毛；皮脂分泌較明顯",
    },
  },
  patterns: [
    { pattern_id: "solid", name_zh: "純色皮膚", description: "粉、灰、黑等單色色素沉著", image_url: "" },
    { pattern_id: "bicolor", name_zh: "雙色／白斑", description: "皮膚色素塊面如雙色貓", image_url: "" },
    { pattern_id: "pointed", name_zh: "重點色感", description: "臉耳腳色素較深", image_url: "" },
    { pattern_id: "calico_tortie", name_zh: "三花／玳瑁色塊", description: "多色色素斑駁", image_url: "" },
  ],
  colors: [
    { color_id: "pink_white", name_zh: "粉白", description: "淺色素常見" },
    { color_id: "black_grey", name_zh: "深灰／黑", description: "深色素皮膚" },
    { color_id: "calico", name_zh: "三花色塊", description: "多色斑駁" },
    { color_id: "tuxedo", name_zh: "燕尾服色塊", description: "深淺對比分明" },
  ],
  personality_traits: [
    "熱情如火、極度黏人，被稱為貓界小外星人",
    "友善好客，常主動迎接訪客",
    "智商高、愛玩，需要陪伴與遊戲",
    "喜歡鑽被窩取暖，貼身睡眠",
  ],
  care_and_health: {
    environment: "極度怕冷與曬傷；冬天穿衣／暖床，夏天防曬。室內飼養",
    genetic_risks: ["肥厚型心肌病 (HCM)——建議定期心臟檢查", "皮膚過敏／油脂堆積引起粉刺", "耳道油脂需勤清理"],
    digestive_health: "代謝高、食量大；留意便狀與皮膚油分平衡",
    diet_management: "基礎代謝高，需較高熱量優質飲食；補 Omega-3/6 與維生素 B 群護膚",
    grooming: "每週溫水洗澡 1 次去油脂；每日擦耳與趾間；防曬與保濕並重",
  },
  media_assets: {
    status: "localized_gallery_sync",
    instruction_for_cursor: "斯芬克斯圖庫已本地化：英雄／三花／燕尾服／特寫／幼貓／側臉皺褶。",
    images: [
      { tag: "hero_main", description: "經典皺皮膚無毛貓", src: "/images/cat-breeds/sphynx.jpg", alt: "斯芬克斯無毛貓" },
      { tag: "gallery_item_1", description: "三花色塊皮膚", src: "/images/cat-breeds/sphynx-calico.jpg", alt: "三花斯芬克斯" },
      { tag: "gallery_item_2", description: "燕尾服色塊全身", src: "/images/cat-breeds/sphynx-tuxedo.jpg", alt: "燕尾服色斯芬克斯" },
      { tag: "gallery_item_3", description: "大耳藍眼特寫", src: "/images/cat-breeds/sphynx-portrait.jpg", alt: "斯芬克斯臉部特寫" },
      { tag: "gallery_item_4", description: "無毛幼貓", src: "/images/cat-breeds/sphynx-kitten.jpg", alt: "斯芬克斯幼貓" },
      { tag: "gallery_item_5", description: "頸部皺褶側臉", src: "/images/cat-breeds/sphynx-profile.jpg", alt: "斯芬克斯側臉" },
    ],
  },
};

export const DEVON_REX_BREED_INFO: CatBreedInfo = {
  breed_id: "devon_rex",
  name_en: "Devon Rex",
  name_zh_hk: "德文卷毛貓",
  aliases: ["德文", "小精靈貓", "Devon Rex"],
  origin: {
    country: "英國",
    state: "德文郡",
    decade: "1960s",
    history_overview:
      "1960 年代英國德文郡發現的自然卷毛突變。大耳、大眼、短吻與波浪絨毛造就「小精靈／埃特外星人」外貌。掉毛少、體型輕巧，極適合都市公寓生活。",
  },
  physical_characteristics: {
    eye_color: "任何色（金、綠、藍、異色等）",
    size_category: "小型至中型、纖細；頭呈楔形、耳巨大低位",
    weight_kg: {
      male: { min: 3.0, max: 4.5 },
      female: { min: 2.5, max: 3.5 },
    },
    maturation_years: "約 1.5-2 年",
    coat: {
      length: "Short wavy／curly（短卷毛）",
      texture: "柔軟波浪至捲曲，觸感如燈芯絨",
      undercoat: "稀疏；部分個體毛量較少（仍非無毛）",
    },
  },
  patterns: [
    { pattern_id: "solid", name_zh: "純色卷毛", description: "黑、藍、白、奶油等", image_url: "" },
    { pattern_id: "bicolor", name_zh: "雙色", description: "白底配深色塊常見", image_url: "" },
    { pattern_id: "pointed", name_zh: "重點色", description: "奶油／丁香等重點色卷毛", image_url: "" },
    { pattern_id: "tabby_tortie", name_zh: "虎斑／玳瑁", description: "卷毛上可見斑紋或玳瑁色", image_url: "" },
  ],
  colors: [
    { color_id: "blue", name_zh: "藍色", description: "經典灰藍卷毛" },
    { color_id: "black_white", name_zh: "黑白", description: "雙色對比鮮明" },
    { color_id: "cream_point", name_zh: "奶油重點", description: "柔和淺色點" },
    { color_id: "lilac_point", name_zh: "丁香重點", description: "淡紫灰重點" },
  ],
  personality_traits: [
    "像小精靈：調皮活潑、喜感十足",
    "極親人類，常跳上肩膀陪伴",
    "聰明愛玩，適合互動玩具",
    "掉毛少，適合在意貓毛的都市家庭",
  ],
  care_and_health: {
    environment: "怕冷（毛薄）；提供暖處。喜歡高處與人肩；室內飼養",
    genetic_risks: ["肥厚型心肌病 (HCM)", "遺傳性肌病（部分血統，優良場會注意）", "大耳需定期檢查耳道"],
    digestive_health: "通常良好；換糧漸進",
    diet_management: "高品質蛋白維持輕巧肌肉；適量鋅與生物素有助卷毛狀態",
    grooming: "卷毛幾乎不掉，偶爾濕布擦拭即可；避免過度梳刷拉斷卷毛；定期清耳",
  },
  media_assets: {
    status: "localized_gallery_sync",
    instruction_for_cursor: "德文圖庫已本地化：藍灰英雄／雙色／卷毛特寫／奶油點／戶外／丁香點。",
    images: [
      { tag: "hero_main", description: "藍色德文卷毛全身（大耳）", src: "/images/cat-breeds/devon-rex.jpg", alt: "德文卷毛貓" },
      { tag: "gallery_item_1", description: "黑白雙色德文", src: "/images/cat-breeds/devon-rex-bicolor.jpg", alt: "雙色德文卷毛貓" },
      { tag: "gallery_item_2", description: "波浪卷毛近距離", src: "/images/cat-breeds/devon-rex-coat.jpg", alt: "德文卷毛特寫" },
      { tag: "gallery_item_3", description: "奶油重點色", src: "/images/cat-breeds/devon-rex-cream.jpg", alt: "奶油點德文卷毛貓" },
      { tag: "gallery_item_4", description: "戶外卷毛細節", src: "/images/cat-breeds/devon-rex-outdoor.jpg", alt: "戶外德文卷毛貓" },
      { tag: "gallery_item_5", description: "丁香重點色棚拍", src: "/images/cat-breeds/devon-rex-lilac.jpg", alt: "丁香點德文卷毛貓" },
    ],
  },
};

export const MIX_SHORTHAIR_BREED_INFO: CatBreedInfo = {
  breed_id: "mix_shorthair",
  name_en: "Domestic Shorthair (Mix)",
  name_zh_hk: "唐貓 / 港短 (米克斯)",
  aliases: ["唐貓", "港短", "米克斯", "家貓", "DSH"],
  origin: {
    country: "香港／亞洲地區（全球普遍）",
    history_overview:
      "非單一純種，而是各地自然繁衍與混血的短毛家貓。在香港常稱唐貓或港短，花色與性格千變萬化，普遍體質強健、適應力極佳，是最多家庭選擇的忠實陪伴者。",
  },
  physical_characteristics: {
    eye_color: "金色、綠色、藍色、異色瞳（依個體）",
    size_category: "小型至中大型皆有；體型多樣",
    weight_kg: {
      male: { min: 3.5, max: 6.5 },
      female: { min: 2.5, max: 5.0 },
    },
    maturation_years: "約 1-2 年",
    coat: {
      length: "Short（短毛為主；亦有中長毛米克斯）",
      texture: "依血統而異，多為易打理短毛",
      undercoat: "適中；換毛季仍需梳毛",
    },
  },
  patterns: [
    { pattern_id: "tabby", name_zh: "虎斑", description: "香港最常見：鯉魚紋、旋渦紋、點斑", image_url: "" },
    { pattern_id: "orange", name_zh: "橘貓", description: "暖橘／橘白，性格常被形容開朗", image_url: "" },
    { pattern_id: "tuxedo_bicolor", name_zh: "燕尾服／雙色", description: "黑白分明或白底色塊", image_url: "" },
    { pattern_id: "calico_tortie_solid", name_zh: "三花／玳瑁／純色", description: "三花、玳瑁、全黑、全白等", image_url: "" },
  ],
  colors: [
    { color_id: "tabby", name_zh: "虎斑", description: "灰褐條紋最普遍" },
    { color_id: "orange", name_zh: "橘色", description: "橘貓／橘白" },
    { color_id: "black", name_zh: "黑色", description: "全黑短毛" },
    { color_id: "tuxedo", name_zh: "燕尾服", description: "黑白經典配" },
  ],
  personality_traits: [
    "每隻個性獨一無二：有黏人型也有獨立型",
    "普遍聰明機靈、適應力極強",
    "混種基因常帶來較佳整體健康",
    "領養唐貓能給街貓／收容貓一個家，意義特別",
  ],
  care_and_health: {
    environment: "室內飼養最安全；提供跳台、窗景與日常互動即可",
    genetic_risks: ["無單一品種遺傳病，但仍需防肥胖、泌尿道、牙周與寄生蟲", "未絕育個體需規劃絕育與晶片"],
    digestive_health: "多數腸胃穩定；換糧仍建議漸進；多喝水護泌尿",
    diet_management: "均衡全價主食；多濕糧補水；成貓定時定量防胖",
    grooming: "短毛每週梳 1 次；換毛季加頻。定期驅蟲、疫苗與健康檢查",
  },
  media_assets: {
    status: "localized_gallery_sync",
    instruction_for_cursor: "唐貓圖庫已本地化：虎斑英雄／燕尾服／橘貓／特寫／水槽虎斑／黑貓。",
    images: [
      { tag: "hero_main", description: "經典虎斑唐貓", src: "/images/cat-breeds/mix-shorthair.jpg", alt: "虎斑唐貓／港短" },
      { tag: "gallery_item_1", description: "黑白燕尾服米克斯", src: "/images/cat-breeds/mix-shorthair-tuxedo.jpg", alt: "燕尾服唐貓" },
      { tag: "gallery_item_2", description: "開朗橘貓", src: "/images/cat-breeds/mix-shorthair-orange.jpg", alt: "橘色唐貓" },
      { tag: "gallery_item_3", description: "家貓臉部特寫", src: "/images/cat-breeds/mix-shorthair-portrait.jpg", alt: "唐貓特寫" },
      { tag: "gallery_item_4", description: "虎斑日常居家", src: "/images/cat-breeds/mix-shorthair-tabby.jpg", alt: "虎斑港短日常" },
      { tag: "gallery_item_5", description: "帥氣黑貓", src: "/images/cat-breeds/mix-shorthair-black.jpg", alt: "黑色唐貓" },
    ],
  },
};

export const catBreedsData: CatBreed[] = [
  {
    id: "1",
    slug: "british-shorthair",
    name: "英國短毛貓",
    coatType: "short",
    coatLabel: "短毛",
    shortDescription: "溫和穩定、體型圓滾，注意體重管理。",
    imageUrl: "/images/cat-breeds/british-shorthair-golden.jpg",
    origin: "英國",
    lifespan: "12 - 17 歲",
    weight: "公 5.0–8.0 kg／母 4.0–6.0 kg",
    personality: [
      "性格溫和、理性、脾氣極好",
      "成熟穩重，不愛胡鬧或過度吵鬧",
      "獨立性高，非常適合忙碌的都市家庭與上班族",
      "對人友善，但通常不屬於黏人精型別，喜歡靜靜陪伴在旁",
    ],
    careTips: [
      "雖然是短毛貓，但因底毛厚密，平時每週需梳毛 1-2 次。",
      "換毛季掉毛量大，需增加梳毛頻率以防毛球症。",
      "購買前建議確認父母已做 HCM／PKD 基因檢測。",
    ],
    nutritionAdvice: [
      "絕育後極容易發胖，必須嚴格定時定量控制熱量。",
      "提供足夠的活水與溫和運動，維持理想體型。",
      "建議高蛋白質配方，並可適量補充魚油維持絨毛光澤。",
    ],
    fullDescription:
      "英國短毛貓擁有悠久歷史，由古代羅馬貓引入英國本土貓改良而成，是歐洲最古老的貓品種之一。牠們以圓滾滾的臉龐、厚密「絨毛感」短毛聞名，性格溫和理性，非常適合忙碌的都市家庭。",
    breedInfo: BRITISH_SHORTHAIR_BREED_INFO,
  },
  {
    id: "2",
    slug: "american-shorthair",
    name: "美國短毛貓",
    coatType: "short",
    coatLabel: "短毛",
    shortDescription: "活潑好動、適應力強，需補足每日運動量。",
    imageUrl: "/images/cat-breeds/american-shorthair.jpg",
    origin: "美國",
    lifespan: "15 - 20 歲",
    weight: "公 5.0–7.5 kg／母 3.5–5.5 kg",
    personality: [
      "聰明活潑，好奇心強，喜歡觀察家中動靜",
      "對人友善，通常能與兒童及其他寵物和睦相處",
      "適應力強，適合作為忙碌都市家庭的陪伴貓",
      "玩耍時精力充沛，平時也能安靜地陪伴在旁",
    ],
    careTips: [
      "短毛易打理，平時每週梳毛 1 次；換毛季可增至 2-3 次。",
      "精力充沛，建議每天互動遊戲，並提供貓抓板與跳台。",
      "定期清潔牙齒，留意 HCM 等遺傳風險與健康檢查。",
    ],
    nutritionAdvice: [
      "肌肉發達，需補充優質動物性蛋白以維持體態。",
      "可搭配軟骨素與葡萄糖胺，照顧日常跳躍的關節健康。",
      "成貓需定時定量，並提供足夠新鮮飲用水。",
    ],
    fullDescription:
      "美國短毛貓祖先隨移民船來到北美，經長期選育成為體格強健、適應力極高的經典家貓。以銀虎斑與各色虎斑聞名，個性外向友善，非常適合香港忙碌的都市家庭。",
    breedInfo: AMERICAN_SHORTHAIR_BREED_INFO,
  },
  {
    id: "3",
    slug: "ragdoll",
    name: "布偶貓",
    coatType: "long",
    coatLabel: "中長毛",
    shortDescription: "性格溫順、毛髮豐盈，需注重腸胃與定期梳毛。",
    imageUrl:
      "/images/cat-breeds/ragdoll.jpg",
    origin: "美國加州",
    lifespan: "12 - 15 歲（晚熟 3-4 年）",
    weight: "公 6.0–9.0 kg／母 4.5–7.0 kg",
    personality: [
      "極度黏人（Puppy Cat 性格）",
      "脾氣溫和，對兒童與寵物忍耐力高",
      "叫聲輕柔安靜",
      "高情商，善於陪伴與察覺情緒",
    ],
    careTips: [
      "100% 室內飼養（防禦力低，切勿放養）",
      "每週 2-3 次梳毛，定期修剪臀部雜毛",
      "留意 HCM／PKD 等遺傳風險，定期健康檢查",
    ],
    nutritionAdvice: [
      "玻璃胃（腸胃敏感），換糧需 7-10 天過渡，建議補充益生菌",
      "定時定量餵食，預防肥胖",
      "補充 Omega-3 / Omega-6 脂肪酸，保持飄逸毛髮柔順",
    ],
    fullDescription:
      "被譽為「貓界仙女」的布偶貓，擁有深邃的藍眼睛與豐滿的中長毛。當你抱起牠時，牠會像軟綿綿的布偶一樣放鬆，是極具療癒感的情感陪伴寵物。",
    breedInfo: RAGDOLL_BREED_INFO,
  },
  {
    id: "4",
    slug: "russian-blue",
    name: "俄羅斯藍貓",
    coatType: "short",
    coatLabel: "短毛",
    shortDescription: "銀光藍灰、翡翠綠眼；文靜忠誠，適合寧靜居家。",
    imageUrl: "/images/cat-breeds/russian-blue.jpg",
    origin: "俄羅斯（阿爾漢格爾斯克）",
    lifespan: "15 - 20 歲",
    weight: "公 3.5–5.5 kg／母 2.5–4.5 kg",
    personality: [
      "對陌生人偏害羞，對家人極為忠誠親密",
      "叫聲輕柔、氣質安靜優雅",
      "聰慧敏銳，喜歡智力遊戲與觀察",
      "環境敏感，需要穩定作息與安全休息區",
    ],
    careTips: [
      "銀藍雙層短毛掉毛少，每週梳毛 1 次即可；換毛季可略增",
      "對環境變化敏感，家中應保留安靜躲藏／休息空間",
      "鼓勵多喝水，留意泌尿健康；適合藏食玩具等智力挑戰",
    ],
    nutritionAdvice: [
      "維持高消化率優質蛋白，保持修長輕盈體型",
      "控制脂肪與熱量，避免因室內活動偏少而發胖",
      "補足牛磺酸（Taurine），保護綠眼睛與心臟健康",
    ],
    fullDescription:
      "俄羅斯藍貓擁有銀光閃耀的藍灰色雙層短毛與翡翠般的綠眼睛，體態修長優雅。牠們文靜內斂，對陌生人較為害羞，但對認定的主人極為忠誠親密，是適合喜歡寧靜陪伴的經典短毛品種。",
    breedInfo: RUSSIAN_BLUE_BREED_INFO,
  },
  {
    id: "5",
    slug: "munchkin",
    name: "曼赤因短腿貓",
    coatType: "short",
    coatLabel: "短毛 / 長毛",
    shortDescription: "短腿長身、天真活潑；嚴格控重並照顧關節脊椎。",
    imageUrl: "/images/cat-breeds/munchkin.jpg",
    origin: "美國",
    lifespan: "12 - 15 歲",
    weight: "公 2.7–4.0 kg／母 2.3–3.6 kg",
    personality: [
      "天真活潑，像長不大的孩子",
      "社交性高，通常對人與寵物友善",
      "好奇心強，短腿仍敏捷能跑能玩",
      "親人討抱，是家中開心果",
    ],
    careTips: [
      "避免過高跳台與重摔；提供低矮跳台、斜坡與防滑地面",
      "定期修剪指甲，減少短腿踩滑受傷",
      "短毛每週梳 1 次；長毛型 2-3 次，並保持適度運動",
    ],
    nutritionAdvice: [
      "嚴格控制體重，減輕脊椎與短腿壓力",
      "補充關節營養（葡萄糖胺、MSM、適量鈣與維生素 D3）",
      "可選小顆粒乾糧，方便較小口腔咀嚼",
    ],
    fullDescription:
      "曼赤因貓以標誌性的短腿和長身軀聞名，被稱為「貓界臘腸狗」。短腿來自自然顯性基因，性格像小狗般熱情活潑，奔跑與站立玩耍都靈巧可愛，是家中的開心果。",
    breedInfo: MUNCHKIN_BREED_INFO,
  },
  {
    id: "6",
    slug: "norwegian-forest",
    name: "挪威森林貓",
    coatType: "long",
    coatLabel: "長毛",
    shortDescription: "大型防水長毛、攀爬高手；換毛季需勤梳並注意毛球。",
    imageUrl: "/images/cat-breeds/norwegian-forest.jpg",
    origin: "挪威",
    lifespan: "14 - 16 歲",
    weight: "公 5.5–9.0 kg／母 4.0–6.5 kg",
    personality: [
      "勇敢探索，天生攀爬高手",
      "外表威嚴，對人溫和友善",
      "適應力佳，能與兒童及寵物共處",
      "獨立中帶親密，喜歡安靜陪伴",
    ],
    careTips: [
      "雙層防水毛厚實，平時每週梳 2-3 次；換毛季建議每日梳理",
      "家中需有高聳貓樹或牆面跳台，滿足攀高天性",
      "夏季注意室內通風散熱，避免厚毛中暑",
    ],
    nutritionAdvice: [
      "大型晚熟（約 3-5 年），需長期優質高蛋白與足夠熱量",
      "補纖維協助排出毛球；可加葡萄糖胺支持骨骼",
      "成貓定時定量，避免因活動量變化而發胖",
    ],
    fullDescription:
      "源自北歐森林的大型自然貓種，擁有適應嚴寒的防水雙層長毛、山貓耳尖與強壯軀幹。牠們是天生的攀爬者，外表威嚴但性格溫和包容，適合有垂直活動空間的家庭。",
    breedInfo: NORWEGIAN_FOREST_BREED_INFO,
  },
  {
    id: "7",
    slug: "exotic-shorthair",
    name: "異國短毛貓 (加菲貓)",
    coatType: "short",
    coatLabel: "短毛",
    shortDescription: "扁臉圓眼、溫柔安靜；每日清理眼角並嚴格控重。",
    imageUrl: "/images/cat-breeds/exotic-shorthair.jpg",
    origin: "美國",
    lifespan: "12 - 15 歲",
    weight: "公 4.0–6.5 kg／母 3.0–5.0 kg",
    personality: [
      "文靜呆萌，喜歡安靜陪伴",
      "溫柔討抱，情感豐富但不吵鬧",
      "適合公寓室內生活",
      "節奏偏慢，享受窗邊觀察與午睡",
    ],
    careTips: [
      "扁臉易淚溢，每天用溫濕棉片清理眼角與臉摺",
      "鼻短需注意通風散熱；食碗選淺口較易進食",
      "每週梳毛 2-3 次（底毛厚），並定期檢查鼻周圍清潔",
    ],
    nutritionAdvice: [
      "嚴格控重，減輕心肺負擔",
      "可選易咬碎顆粒，方便扁臉咀嚼",
      "補充護眼抗氧化配方，留意 PKD 等遺傳風險",
    ],
    fullDescription:
      "異國短毛貓是波斯貓的短毛版本，擁有標誌性的扁扁大臉、圓滾大眼與濃密短毛，性格溫柔討喜，被大家親切地稱為「加菲貓」，是適合安靜陪伴的室內明星品種。",
    breedInfo: EXOTIC_SHORTHAIR_BREED_INFO,
  },
  {
    id: "8",
    slug: "maine-coon",
    name: "緬因貓",
    coatType: "long",
    coatLabel: "長毛",
    shortDescription: "溫柔的巨人、體型龐大；注重心臟、關節與長毛護理。",
    imageUrl: "/images/cat-breeds/maine-coon.jpg",
    origin: "美國（緬因州）",
    lifespan: "12 - 15 歲",
    weight: "公 6.0–11.0 kg／母 4.0–7.5 kg",
    personality: [
      "溫柔巨人，對人友善忠誠",
      "聲音細小，常發出吱吱叫",
      "智力高，部分喜歡玩水",
      "適合有空間的家庭",
    ],
    careTips: [
      "每週梳 2-3 次，重點腋下、肚皮與尾根；換毛季每日梳",
      "配備超大貓砂盆與加固高聳貓樹",
      "定期心臟檢查（HCM），避免過胖加重關節負擔",
    ],
    nutritionAdvice: [
      "大型晚熟需長期高蛋白與足夠熱量",
      "補充葡萄糖胺、軟骨素與 Omega-3",
      "大顆粒乾糧有助咀嚼並減慢進食",
    ],
    fullDescription:
      "緬因貓是體型最大的家貓品種之一，耳朵帶有山貓簇毛，尾巴如羽扇般豐滿。雖然外表霸氣，但性格卻像小狗般忠誠溫柔，是適合有空間家庭的「溫柔巨人」。",
    breedInfo: MAINE_COON_BREED_INFO,
  },
  {
    id: "9",
    slug: "persian",
    name: "波斯貓",
    coatType: "long",
    coatLabel: "長毛",
    shortDescription: "華麗長毛與扁平面孔的優雅代表，需每日梳毛護理。",
    imageUrl: "/images/cat-breeds/persian.jpg",
    origin: "伊朗／波斯",
    lifespan: "12 - 17 歲",
    weight: "3.5 - 7.0 kg",
    personality: ["溫柔", "安靜", "優雅", "黏人"],
    careTips: [
      "長毛極易打結，建議每天用針梳／排梳徹底梳理。",
      "扁臉構造需每日清理眼角淚痕，並留意呼吸與散熱舒適度。",
      "可定期專業美容，但日常梳毛不能省；換毛季加強梳理減少毛球。",
    ],
    nutritionAdvice: [
      "選擇有助毛球控制、易消化的優質成貓配方。",
      "控制份量，避免因活動量較低而過重。",
      "乾濕搭配有助水分攝取；扁臉貓可選淺口或微傾斜食碗。",
    ],
    fullDescription:
      "波斯貓是世界上最知名的長毛貓之一，特徵為豐滿的長毛、圓潤的身體與扁平面孔。性格溫柔、安靜、優雅，喜歡平穩的日常，適合公寓與較安靜的家庭。每日梳毛不可或缺；扁臉構造也需特別留意眼部分泌與呼吸舒適度。",
    breedInfo: PERSIAN_BREED_INFO,
  },
  {
    id: "10",
    slug: "scottish-fold",
    name: "蘇格蘭摺耳貓",
    coatType: "short",
    coatLabel: "短毛 / 長毛",
    shortDescription: "圓頭摺耳、溫和黏人；必須關注軟骨與關節健康。",
    imageUrl: "/images/cat-breeds/scottish-fold.jpg",
    origin: "蘇格蘭",
    lifespan: "11 - 14 歲",
    weight: "公 4.0–6.0 kg／母 2.7–4.5 kg",
    personality: [
      "溫和黏人，感情豐富",
      "常出現大叔坐姿等可愛姿勢",
      "安靜不吵，適合室內陪伴",
      "對主人依戀，喜歡待在身邊",
    ],
    careTips: [
      "每週清潔摺耳內側，避免濕氣與耳垢堆積",
      "密切留意走姿與尾巴柔軟度（軟骨發育相關風險）",
      "避免過高跳躍；嚴格控重並補充關節營養",
    ],
    nutritionAdvice: [
      "長期補充葡萄糖胺、軟骨素、綠唇貽貝等",
      "嚴格精算熱量，控重是保護關節的關鍵",
      "均衡全價飲食，換糧需漸進",
    ],
    fullDescription:
      "蘇格蘭摺耳貓以向前下折的耳朵和圓滾滾大頭外貌聞名，像一隻溫柔的小貓頭鷹。性格溫和親人，但摺耳基因與軟骨健康息息相關，飼養前務必了解健康風險與負責任繁殖。",
    breedInfo: SCOTTISH_FOLD_BREED_INFO,
  },
  {
    id: "11",
    slug: "siamese",
    name: "暹羅貓",
    coatType: "short",
    coatLabel: "短毛",
    shortDescription: "重點色藍眼話霸；需要大量互動與陪伴。",
    imageUrl: "/images/cat-breeds/siamese.jpg",
    origin: "泰國（暹羅）",
    lifespan: "15 - 20 歲",
    weight: "公 3.0–5.0 kg／母 2.5–4.0 kg",
    personality: [
      "熱情多話，喜歡與主人對話",
      "極度黏人，分離焦慮風險較高",
      "聰明警覺、好奇心旺盛",
      "需要大量互動，不適合長期獨處",
    ],
    careTips: [
      "提供大量陪伴與益智遊戲，減少分離焦慮",
      "怕冷，冬季準備暖床；短毛每週輕梳即可",
      "定期牙科與健康檢查",
    ],
    nutritionAdvice: [
      "高蛋白、適中脂肪，維持修長優雅體型",
      "換糧需漸進；可用藏食玩具滿足心智需求",
      "充足飲水與均衡主食",
    ],
    fullDescription:
      "源自泰國皇室的古老貓種，擁有獨特重點色面罩、藍色杏仁眼與苗條優雅體型。牠們熱情且極度依賴主人，是個性最鮮明、最會「說話」的貓咪之一。",
    breedInfo: SIAMESE_BREED_INFO,
  },
  {
    id: "12",
    slug: "bengal",
    name: "孟加拉貓 (豹貓)",
    coatType: "short",
    coatLabel: "短毛",
    shortDescription: "玫瑰斑豹紋、精力充沛；需要廣闊活動與每日遊戲。",
    imageUrl: "/images/cat-breeds/bengal.jpg",
    origin: "美國",
    lifespan: "12 - 16 歲",
    weight: "公 4.5–7.5 kg／母 3.5–5.5 kg",
    personality: [
      "精力無限，熱愛探索與攀爬",
      "自信勇敢，許多個體喜歡玩水",
      "聰明可訓練，適合跑輪與點擊訓練",
      "需要足夠活動出口，否則易搗蛋",
    ],
    careTips: [
      "每天至少 30-45 分鐘高強度逗貓遊戲",
      "設置高大貓樹與跑輪；可提供安全玩水機會",
      "短毛每週梳 1 次；定期心臟與眼睛相關檢查",
    ],
    nutritionAdvice: [
      "高動物蛋白支持發達肌肉",
      "補充牛磺酸與關節營養",
      "控制零食熱量，避免因精力旺盛後靜下來發胖",
    ],
    fullDescription:
      "擁有如野生豹子般奢華的玫瑰斑紋與金屬光澤短毛，個性卻可親可訓。牠們是運動型貓咪的極致代表，最適合能提供大量遊戲與垂直空間的活躍家庭。",
    breedInfo: BENGAL_BREED_INFO,
  },
  {
    id: "13",
    slug: "sphynx",
    name: "斯芬克斯無毛貓",
    coatType: "short",
    coatLabel: "無毛 / 極短絨毛",
    shortDescription: "熱情黏人、怕冷；需每週洗澡護膚與保暖。",
    imageUrl: "/images/cat-breeds/sphynx.jpg",
    origin: "加拿大",
    lifespan: "12 - 15 歲",
    weight: "公 3.5–5.5 kg／母 2.5–4.5 kg",
    personality: [
      "熱情如火、極度黏人",
      "友善好客，常主動迎接訪客",
      "智商高、愛玩，需要陪伴",
      "喜歡鑽被窩取暖、貼身睡眠",
    ],
    careTips: [
      "每週溫水洗澡去油脂；每日擦耳與趾間",
      "冬天穿衣／暖床，夏天防曬，避免受涼與曬傷",
      "建議定期心臟檢查（HCM）",
    ],
    nutritionAdvice: [
      "代謝高，需較高熱量優質飲食維持體溫",
      "補充 Omega-3/6 與維生素 B 群強化皮膚屏障",
      "高消化率配方，留意體態與皮脂平衡",
    ],
    fullDescription:
      "斯芬克斯看似外星生物，觸感卻像溫暖柔軟的桃子皮。牠們極度熱情黏人，被稱為「貓界小外星人」，適合能細心護膚保暖、並給予大量陪伴的飼主。",
    breedInfo: SPHYNX_BREED_INFO,
  },
  {
    id: "14",
    slug: "devon-rex",
    name: "德文卷毛貓",
    coatType: "short",
    coatLabel: "短卷毛",
    shortDescription: "小精靈大耳卷毛、掉毛少；極適合都市公寓。",
    imageUrl: "/images/cat-breeds/devon-rex.jpg",
    origin: "英國（德文郡）",
    lifespan: "12 - 15 歲",
    weight: "公 3.0–4.5 kg／母 2.5–3.5 kg",
    personality: [
      "像小精靈：調皮活潑、喜感十足",
      "極親人類，常跳上肩膀陪伴",
      "聰明愛玩，適合互動玩具",
      "掉毛少，適合在意貓毛的家庭",
    ],
    careTips: [
      "卷毛幾乎不掉，偶爾濕布擦拭即可，避免過度梳刷",
      "大耳需定期檢查耳道；毛薄怕冷，提供暖處",
      "室內飼養並給予足夠遊戲與陪伴",
    ],
    nutritionAdvice: [
      "高品質蛋白維持輕巧肌肉",
      "適量鋅與生物素有助卷毛狀態",
      "可搭配主食罐滿足好奇味蕾",
    ],
    fullDescription:
      "擁有大耳朵、大眼睛與可愛波浪卷毛的德文卷毛貓，宛如童話小精靈。掉毛極少、性格活潑幽默，是室內都市生活絕佳的開心果。",
    breedInfo: DEVON_REX_BREED_INFO,
  },
  {
    id: "15",
    slug: "mix-shorthair",
    name: "唐貓 / 港短 (米克斯)",
    coatType: "short",
    coatLabel: "短毛",
    shortDescription: "花色多元、體質強健；香港最普遍的溫暖陪伴者。",
    imageUrl: "/images/cat-breeds/mix-shorthair.jpg",
    origin: "香港／亞洲地區",
    lifespan: "15 - 20 歲",
    weight: "公 3.5–6.5 kg／母 2.5–5.0 kg",
    personality: [
      "每隻個性獨一無二",
      "聰明機靈、適應力極強",
      "混種基因常帶來較佳整體健康",
      "領養唐貓意義特別溫暖",
    ],
    careTips: [
      "短毛每週梳 1 次；室內飼養最安全",
      "定期疫苗、驅蟲、絕育與健康檢查",
      "提供跳台、窗景與日常互動建立信任",
    ],
    nutritionAdvice: [
      "均衡全價主食即可；多濕糧補水護泌尿",
      "成貓定時定量，預防肥胖",
      "可搭配益生菌維持腸道穩定",
    ],
    fullDescription:
      "唐貓（米克斯／港短）包含虎斑、橘貓、黑貓、燕尾服與三花等豐富花色。牠們擁有極高智商與強健體質，是香港家庭中最受歡迎、最溫暖的靈魂伴侶。",
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
