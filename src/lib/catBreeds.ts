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

/** Optional rich profile (currently used by Ragdoll detail). */
export type CatBreedInfo = {
  breed_id: string;
  name_en: string;
  name_zh_hk: string;
  aliases: string[];
  origin: {
    country: string;
    state: string;
    decade: string;
    creator: string;
  };
  physical_characteristics: {
    eye_color: string;
    size_category: string;
    weight_kg: {
      male: { min: number; max: number };
      female: { min: number; max: number };
    };
    maturation_years: string;
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

/** Ragdoll-exclusive rich profile for `/cat-breeds/ragdoll`. */
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
      image_url:
        "https://cdn2.thecatapi.com/images/oGefY4YoG.jpg",
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
        src: "https://cdn2.thecatapi.com/images/oGefY4YoG.jpg",
        alt: "雙色布偶貓湛藍眼睛特寫",
      },
      {
        tag: "bicolor",
        description: "倒V字雙色布偶貓全身照",
        src: "https://cdn2.thecatapi.com/images/oGefY4YoG.jpg",
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

export const catBreedsData: CatBreed[] = [
  {
    id: "1",
    slug: "british-shorthair",
    name: "英國短毛貓",
    coatType: "short",
    coatLabel: "短毛",
    shortDescription: "溫和穩定、體型圓滾，注意體重管理。",
    imageUrl:
      "https://images.unsplash.com/photo-1758431151232-890ae89275c8?auto=format&fit=crop&w=1200&q=80",
    origin: "英國",
    lifespan: "12 - 17 歲",
    weight: "4.0 - 8.0 kg",
    personality: ["溫和冷靜", "適應力強", "獨立不黏人", "喜歡陪伴"],
    careTips: [
      "換毛季每週需梳毛 2-3 次，減少毛球堆積。",
      "英短較少主動運動，容易發胖，需每天陪同遊戲 15 分鐘。",
      "注意保持耳道清潔，定期檢查耳垢。",
    ],
    nutritionAdvice: [
      "建議選擇高蛋白質、低碳水化合物的乾糧或主食罐。",
      "控制每日熱量攝取，加入 L-肉鹼成分有助於維持理想體型。",
      "適量補充深海魚油，維持厚實短毛的光澤度。",
    ],
    fullDescription:
      "英國短毛貓擁有悠久歷史，以圓滾滾的臉龐、大眼睛和厚密的「絨毛感」短毛聞名。牠們性格溫和理性，非常適合忙碌的都市家庭。",
  },
  {
    id: "2",
    slug: "american-shorthair",
    name: "美國短毛貓",
    coatType: "short",
    coatLabel: "短毛",
    shortDescription: "活潑好動、適應力強，需補足每日運動量。",
    imageUrl:
      "https://images.unsplash.com/photo-1548247416-ec66f4900b2e?q=80&w=800&auto=format&fit=crop",
    origin: "美國",
    lifespan: "15 - 20 歲",
    weight: "3.5 - 7.5 kg",
    personality: ["聰明活潑", "好奇心強", "友善親人", "體格健壯"],
    careTips: [
      "短毛極易照顧，每週梳毛 1 次即可。",
      "精力充沛，建議提供貓抓板與跳台滿足探索慾望。",
      "定期清潔牙齒，預防牙周健康問題。",
    ],
    nutritionAdvice: [
      "美短肌肉發達，需補充優質動物性蛋白以維持肌肉質量。",
      "可搭配軟骨素與葡萄糖胺，照顧日常跳躍的關節健康。",
      "提供足夠的新鮮飲用水，預防尿路系統問題。",
    ],
    fullDescription:
      "美國短毛貓以強健的體魄與標誌性的虎斑紋路著稱。牠們個性外向且充滿好奇心，能與兒童及其他寵物和睦相處。",
  },
  {
    id: "3",
    slug: "ragdoll",
    name: "布偶貓",
    coatType: "long",
    coatLabel: "中長毛",
    shortDescription: "性格溫順、毛髮豐盈，需注重腸胃與定期梳毛。",
    imageUrl:
      "https://cdn2.thecatapi.com/images/oGefY4YoG.jpg",
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
      "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?q=80&w=800&auto=format&fit=crop",
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
    shortDescription: "活潑親人，注意關節與脊椎保健。",
    imageUrl:
      "https://cdn2.thecatapi.com/images/j5cVSqLer.jpg",
    origin: "美國",
    lifespan: "12 - 15 歲",
    weight: "2.5 - 4.0 kg",
    personality: ["天真活潑", "長不大的孩子", "喜歡奔跑", "社交高手"],
    careTips: [
      "雖然腿短但行動極其敏捷，需注意防止從過高處重摔。",
      "定期檢查與修剪爪子，防止小短腿因踩滑受傷。",
      "保持適度運動，強健背部與腿部肌肉。",
    ],
    nutritionAdvice: [
      "特別注重骨骼與關節保護，補充有機鈣、維生素 D3 及 MSM。",
      "嚴格控制體重，減輕短腿與脊椎的承受壓力。",
      "選擇小顆粒乾糧，方便其較小的口腔咀嚼。",
    ],
    fullDescription:
      "曼赤因貓以標誌性的短腿和長身軀聞名，被稱為「貓界臘腸狗」。牠們性格像小狗般熱情活潑，奔跑速度飛快，是家中的開心果。",
  },
  {
    id: "6",
    slug: "norwegian-forest",
    name: "挪威森林貓",
    coatType: "long",
    coatLabel: "長毛",
    shortDescription: "體型高大、毛樣厚實，需特別注意毛球排空。",
    imageUrl:
      "https://cdn2.thecatapi.com/images/06dgGmEOV.jpg",
    origin: "挪威",
    lifespan: "14 - 16 歲",
    weight: "4.5 - 8.0 kg",
    personality: ["勇敢探索", "攀爬高手", "冷靜大氣", "對人友善"],
    careTips: [
      "雙層防風防水毛極其厚實，春秋換毛季需每日深度梳理。",
      "非常喜歡高處，建議家中有高聳的貓樹或牆面跳台。",
      "夏季室內需維持適宜溫度，防止厚毛引發暑熱。",
    ],
    nutritionAdvice: [
      "大型貓成長期長（約 3-5 年發育成熟），需持續補足高能量與優質肉類。",
      "富含天然纖維與植物油脂的配方，幫助順暢排出體內大塊毛球。",
      "加入葡萄糖胺，支持其較大體型的骨骼健康。",
    ],
    fullDescription:
      "源自北歐森林的大型自然貓種，擁有適應嚴寒的厚重毛皮與強壯軀幹。牠們是天生的攀爬者，外表威嚴但性格卻異常溫和包容。",
  },
  {
    id: "7",
    slug: "exotic-shorthair",
    name: "異國短毛貓 (加菲貓)",
    coatType: "short",
    coatLabel: "短毛",
    shortDescription: "扁臉呆萌、性格沉靜，需特別照顧面部與淚腺。",
    imageUrl:
      "https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&w=1200&q=80",
    origin: "美國",
    lifespan: "12 - 15 歲",
    weight: "3.5 - 6.5 kg",
    personality: ["文靜呆萌", "喜歡討抱", "安靜不吵鬧", "情感豐富"],
    careTips: [
      "因為面部結構平扁，淚腺容易積聚，每天需用溫濕棉花清理眼角。",
      "鼻腔較短，夏天需特別注意室內通風與散熱。",
      "食碗建議選擇淺口且微傾斜的設計，方便牠們進食。",
    ],
    nutritionAdvice: [
      "選擇易咬碎的特殊形狀顆粒（如三棱形或十字形），方便扁臉貓咀嚼。",
      "補充葉黃素與抗氧化配方，保護眼睛健康。",
      "控制飲食熱量，預防發胖增加心肺負擔。",
    ],
    fullDescription:
      "異國短毛貓是波斯貓的短毛版本，擁有標誌性的扁扁大臉與圓滾大眼，性格溫柔討喜，被大家親切地稱為「加菲貓」。",
  },
  {
    id: "8",
    slug: "maine-coon",
    name: "緬因貓",
    coatType: "long",
    coatLabel: "長毛",
    shortDescription: "溫柔的巨人、體型龐大，注重心臟與關節保護。",
    imageUrl:
      "https://images.unsplash.com/photo-1586289883499-f11d28aaf52f?q=80&w=800&auto=format&fit=crop",
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
      "https://cdn2.thecatapi.com/images/RhBsBQg6y.jpg",
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
      "https://images.unsplash.com/photo-1577622190237-821ff489d2ea?auto=format&fit=crop&w=1200&q=80",
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
      "https://images.unsplash.com/photo-1773769730444-7dec13f33b45?auto=format&fit=crop&w=1200&q=80",
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
      "https://cdn2.thecatapi.com/images/LSaDk6OjY.jpg",
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
      "https://cdn2.thecatapi.com/images/Br8qCwbS9.jpg",
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
      "https://images.unsplash.com/photo-1767884267022-9c80682bfe65?auto=format&fit=crop&w=1200&q=80",
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
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1200&q=80",
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
