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
        description: "金漸層幼貓 (Golden Shaded)",
        src: "/images/cat-breeds/british-shorthair-golden.jpg",
        alt: "金漸層英國短毛貓特寫",
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
    status: "updated",
    instruction_for_cursor:
      "請 Cursor 搜尋並更新正確的布偶貓相片 URL 及 Alt Text，修正先前的圖片錯誤。",
    images: [
      {
        tag: "hero",
        description: "湛藍眼睛與柔順長毛的雙色布偶貓特寫",
        src: "/images/cat-breeds/ragdoll.jpg",
        alt: "雙色布偶貓湛藍眼睛特寫",
      },
      {
        tag: "bicolor",
        description: "倒V字雙色布偶貓全身照",
        src: "/images/cat-breeds/ragdoll.jpg",
        alt: "雙色布偶貓",
      },
      {
        tag: "mitted",
        description: "手套色布偶貓",
        src: "https://cdn2.thecatapi.com/images/HDxfaNlLj.jpg",
        alt: "手套色布偶貓",
      },
      {
        tag: "colorpoint",
        description: "重點色布偶貓",
        src: "https://cdn2.thecatapi.com/images/nqS9tUT3i.jpg",
        alt: "重點色布偶貓",
      },
    ],
  },
};

/** Munchkin rich profile for `/cat-breeds/munchkin`. */
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

/** Norwegian Forest Cat rich profile for `/cat-breeds/norwegian-forest`. */
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

/** Exotic Shorthair rich profile for `/cat-breeds/exotic-shorthair`. */
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
    shortDescription: "敏感聰穎、短毛濃密，提供安靜的休息空間。",
    imageUrl:
      "/images/cat-breeds/russian-blue.jpg",
    origin: "俄羅斯",
    lifespan: "15 - 20 歲",
    weight: "3.0 - 5.5 kg",
    personality: ["文靜內斂", "忠誠專一", "敏銳聰明", "喜歡安靜"],
    careTips: [
      "銀藍色雙層短毛幾乎不掉毛，每週梳毛 1 次即可。",
      "對環境變化較敏感，家中應保持安靜穩定的休息區域。",
      "喜歡智力挑戰遊戲，如藏食玩具。",
    ],
    nutritionAdvice: [
      "維持高消化率的高品質蛋白質，保持靈巧輕盈的體型。",
      "控制脂肪攝取，避免因室內運動量較少而引發肥胖。",
      "補足 Taurine（牛磺酸），保護明亮的綠色眼睛與心臟健康。",
    ],
    fullDescription:
      "俄羅斯藍貓擁有銀光閃耀的藍灰色毛皮與翡翠般的綠眼睛。牠們文靜優雅，雖然對陌生人較為害羞，但對認定的主人非常忠誠親密。",
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
    shortDescription: "溫柔的巨人、體型龐大，注重心臟與關節保護。",
    imageUrl:
      "/images/cat-breeds/maine-coon.jpg",
    origin: "美國",
    lifespan: "12 - 15 歲",
    weight: "6.0 - 11.0 kg",
    personality: ["溫柔巨人", "喜歡玩水", "聲音細小", "智力極高"],
    careTips: [
      "長毛需要每週至少梳理 2-3 次，避免腋下與肚皮結塊。",
      "體型龐大，需配備超大號貓砂盆與加固型高聳貓樹。",
      "定期進行心臟超聲波檢查（留意 HCM 情況）。",
    ],
    nutritionAdvice: [
      "大顆粒貓糧能強迫牠們咀嚼，促進牙齒健康並減慢進食速度。",
      "高濃度的軟骨素、葡萄糖胺與 EPA/DHA，全方位維護重型骨骼與關節。",
      "補充優質肉類脂肪，為龐大體型提供足夠能量。",
    ],
    fullDescription:
      "緬因貓是體型最大的家貓品種之一，耳朵帶有羽狀長毛，尾巴如羽毛般豐滿。雖然外表霸氣，但性格卻像小狗般忠誠溫柔，甚至喜歡玩水！",
  },
  {
    id: "9",
    slug: "persian",
    name: "波斯貓",
    coatType: "long",
    coatLabel: "長毛",
    shortDescription: "貓中貴族、華麗長毛，需每天用心梳理毛髮。",
    imageUrl:
      "/images/cat-breeds/persian.jpg",
    origin: "伊朗 (波斯)",
    lifespan: "12 - 17 歲",
    weight: "3.5 - 6.0 kg",
    personality: ["高雅端莊", "喜歡安靜", "聲音甜美", "舉止優雅"],
    careTips: [
      "濃密的雙層長毛極易打結，必須每天徹底梳理 1 次。",
      "每天清理臉部褶皺與眼睛周圍，保持乾爽潔淨。",
      "極少主動劇烈運動，喜歡躺在舒適柔軟的墊子上休息。",
    ],
    nutritionAdvice: [
      "調配排毛球配方（如天然植物纖維與甜菜粕），促進腸道蠕動。",
      "添加琉璃苣油與鋅元素，滋養奢華華麗的長毛。",
      "選用高消化率蛋白質，減少腸胃負擔。",
    ],
    fullDescription:
      "波斯貓被譽為「貓中皇后」，擁有極其豐滿華麗的長毛與甜美的面龐。牠們文靜優雅，是室內高品質陪伴的完美選擇。",
  },
  {
    id: "10",
    slug: "scottish-fold",
    name: "蘇格蘭折耳貓",
    coatType: "short",
    coatLabel: "短毛 / 長毛",
    shortDescription: "貓頭圓滾、可愛貼耳，特別關注軟骨與骨骼健康。",
    imageUrl:
      "/images/cat-breeds/scottish-fold.jpg",
    origin: "蘇格蘭",
    lifespan: "11 - 14 歲",
    weight: "3.0 - 6.0 kg",
    personality: ["溫和黏人", "喜歡大叔坐姿", "感情豐富", "性格平靜"],
    careTips: [
      "耳折處容易積聚濕氣與耳垢，每週需用專業洗耳液清潔一次。",
      "密切留意其走姿與尾巴僵硬度（留意基因軟骨發育異常）。",
      "避免讓其進行高距離跳躍，減少關節衝擊。",
    ],
    nutritionAdvice: [
      "長期補充高品質關節保健品（如綠唇貽貝、葡萄糖胺、軟骨素）。",
      "控制體重是保護關節的最重要環節，嚴格精算每日熱量。",
      "補足抗氧化物（維生素 C/E），維護關節組織健康。",
    ],
    fullDescription:
      "蘇格蘭折耳貓以向前下折的耳朵和圓滾滾的「大頭貓」外貌吸引無數主人。牠們性格溫和親人，經常展現像人類一般的可愛坐姿。",
  },
  {
    id: "11",
    slug: "siamese",
    name: "暹羅貓",
    coatType: "short",
    coatLabel: "短毛",
    shortDescription: "貓界話霸、極度熱情，需要大量的互動與愛護。",
    imageUrl:
      "/images/cat-breeds/siamese.jpg",
    origin: "泰國 (暹羅)",
    lifespan: "15 - 20 歲",
    weight: "2.5 - 4.5 kg",
    personality: ["熱情多話", "極度黏人", "聰明警覺", "好奇心旺盛"],
    careTips: [
      "暹羅貓是典型的「話霸」，會用豐富語調與主人聊天說話。",
      "極度怕冷，冬季需準備暖床或保暖服飾。",
      "需要極多陪伴，若長時間獨處容易產生分離焦慮。",
    ],
    nutritionAdvice: [
      "修長高挑的體型需要高蛋白、低脂肪的飲食配方。",
      "其重點色毛皮會隨溫度變冷而變深，補充酪氨酸有助毛色均勻。",
      "提供多種益智玩具配合藏食，滿足其高智商心智發育。",
    ],
    fullDescription:
      "源自泰國皇室的古老貓種，擁有獨特的重點色面罩、藍色杏仁眼與苗條優雅的體型。牠們熱情且極度依賴主人，是個性最鮮明的貓咪之一。",
  },
  {
    id: "12",
    slug: "bengal",
    name: "孟加拉貓 (豹貓)",
    coatType: "short",
    coatLabel: "短毛",
    shortDescription: "野生豹紋、精力充沛，需要廣闊的活動空間。",
    imageUrl:
      "/images/cat-breeds/bengal.jpg",
    origin: "美國",
    lifespan: "12 - 16 歲",
    weight: "4.0 - 7.5 kg",
    personality: ["精力無限", "熱愛探索", "喜歡玩水", "自信勇敢"],
    careTips: [
      "精力極其旺盛，每天需要至少 30-45 分鐘的高強度逗貓遊戲。",
      "非常喜歡水，甚至會主動跳入浴室或玩水龍頭。",
      "建議設置高大複合貓樹與跑輪，釋放剩餘精力。",
    ],
    nutritionAdvice: [
      "需要比一般貓咪更高的動物性蛋白質，支持強大的肌肉力量。",
      "補充膠原蛋白與關節營養，維護高強度奔跑後的運動系統。",
      "補充天然牛磺酸與亞麻籽油，令金屬質感的斑紋更加閃亮。",
    ],
    fullDescription:
      "擁有如野生豹子般奢華的玫瑰斑紋（Rosettes），但個性卻溫順友善。牠們是運動型貓咪的極致代表，肌肉發達且充滿活力。",
  },
  {
    id: "13",
    slug: "sphynx",
    name: "斯芬克斯無毛貓",
    coatType: "short",
    coatLabel: "無毛 / 極短絨毛",
    shortDescription: "感情專一、親人怕冷，需注重皮膚清潔與保暖。",
    imageUrl:
      "/images/cat-breeds/sphynx.jpg",
    origin: "加拿大",
    lifespan: "12 - 15 歲",
    weight: "3.0 - 5.0 kg",
    personality: ["熱情如火", "黏人貼心", "友善好客", "智商超高"],
    careTips: [
      "雖然沒有毛髮，但皮膚會分泌油脂，每週需要用溫水洗澡 1 次。",
      "極度怕冷與曬傷，夏天需防曬，冬天必須穿著保暖衣服。",
      "耳朵與腳趾間容易積聚油脂，需定期細心擦拭。",
    ],
    nutritionAdvice: [
      "因為沒有毛髮保暖，基礎代謝率極高，需要較高卡路里的飲食來維持體溫。",
      "補充維生素 B 群與 Omega 3/6，強化皮膚屏障功能。",
      "提供高消化率、高密度的營養配方，維護健康代謝。",
    ],
    fullDescription:
      "加拿大無毛貓看似外星生物，實際上觸感像溫暖柔軟的桃子皮。牠們極度熱情黏人，被稱為「貓界小外星人」，深受對貓毛過敏主人的喜愛。",
  },
  {
    id: "14",
    slug: "devon-rex",
    name: "德文卷毛貓",
    coatType: "short",
    coatLabel: "短卷毛",
    shortDescription: "小精靈外貌、不易掉毛，非常適合都市家庭。",
    imageUrl:
      "/images/cat-breeds/devon-rex.jpg",
    origin: "英國",
    lifespan: "12 - 15 歲",
    weight: "2.5 - 4.5 kg",
    personality: ["像小精靈", "調皮活潑", "喜感十足", "極親人類"],
    careTips: [
      "獨特的波浪狀短卷毛幾乎不掉毛，只需偶爾用濕布擦拭。",
      "耳朵較大且直立，需定期檢查耳道健康。",
      "非常喜歡棲息在主人肩膀上，像小精靈一樣陪伴你。",
    ],
    nutritionAdvice: [
      "身材輕巧靈動，需要高品質蛋白質維護強健肌肉。",
      "適量補充鋅與生物素（Biotin），維護其獨特卷毛的彈性與光澤。",
      "提供豐富多樣的食物口感（如主食罐搭配乾糧），滿足其好奇挑剔的味蕾。",
    ],
    fullDescription:
      "擁有大耳朵、大眼睛和可愛波浪卷毛的德文卷毛貓，宛如童話故事裡的小精靈。牠們掉毛極少，性格活潑幽默，是室內生活絕佳的開心果。",
  },
  {
    id: "15",
    slug: "mix-shorthair",
    name: "唐貓 / 港短 (米克斯)",
    coatType: "short",
    coatLabel: "短毛",
    shortDescription: "基因優秀、體質強健，香港最普遍也最可愛的陪伴者。",
    imageUrl:
      "/images/cat-breeds/mix-shorthair.jpg",
    origin: "香港 / 亞洲地區",
    lifespan: "15 - 20 歲",
    weight: "3.0 - 6.5 kg",
    personality: ["聰明機靈", "個性獨特", "適應力極強", "忠誠感恩"],
    careTips: [
      "混種基因令牠們遺傳疾病極少，身體非常健壯。",
      "短毛容易照顧，每週梳毛 1 次並保持環境清潔即可。",
      "每隻唐貓的個性都獨一無二，給予時間建立信任會非常貼心。",
    ],
    nutritionAdvice: [
      "均衡的全價營養主食即可滿足健康需求。",
      "多補充水份與濕糧，維護長期泌尿系統健康。",
      "搭配綜合維生素與益生菌，讓牠們的免疫力更上一層樓。",
    ],
    fullDescription:
      "唐貓（米克斯/混種短毛貓）包含了玳瑁、橘貓、黑貓、三花與玳瑁等豐富花色。牠們擁有極高的智商與強健的體質，是香港家庭中最受歡迎、最溫暖的靈魂伴侶。",
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
