export type CatCoatFilter = "all" | "short" | "long";

export type CatCoatType = "short" | "long" | "both";

export type LocalizedText = { zh: string; en: string };

export type CatBreed = {
  id: string;
  slug: string;
  coat: CatCoatType;
  image: string;
  name: LocalizedText;
  coatLabel: LocalizedText;
  summary: LocalizedText;
  imageAlt: LocalizedText;
  origin: LocalizedText;
  lifespan: LocalizedText;
  weight: LocalizedText;
  personality: LocalizedText;
  careTips: LocalizedText;
  nutritionAdvice: LocalizedText;
  fullDescription: LocalizedText;
};

/** Shared Unsplash fallback when a breed portrait fails to load. */
export const CAT_BREED_IMAGE_FALLBACK =
  "https://images.unsplash.com/photo-1574231164645-d6f0e8553590?q=80&w=600&auto=format&fit=crop";

/** Popular breeds for `/cat-breeds` and `/cat-breeds/[slug]`. */
export const CAT_BREEDS: CatBreed[] = [
  {
    id: "british-shorthair",
    slug: "british-shorthair",
    coat: "short",
    image:
      "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&auto=format&fit=crop",
    name: { zh: "英國短毛貓", en: "British Shorthair" },
    coatLabel: { zh: "短毛", en: "Short hair" },
    summary: {
      zh: "溫和穩定、體型圓滾，注意體重管理。",
      en: "Gentle and steady with a round build — watch weight carefully.",
    },
    imageAlt: {
      zh: "英國短毛貓肖像",
      en: "Portrait of a British Shorthair cat",
    },
    origin: { zh: "英國", en: "United Kingdom" },
    lifespan: { zh: "12–17 年", en: "12–17 years" },
    weight: { zh: "公 4–8 kg／母 3–6 kg", en: "Males 4–8 kg / Females 3–6 kg" },
    personality: {
      zh: "性格沉穩、溫柔且不黏人過頭，喜歡安靜陪伴。對家庭環境適應佳，適合節奏平穩的同居生活，不喜歡突兀噪音與過度刺激。",
      en: "Calm, gentle, and affectionately independent. Adapts well to steady homes and prefers quiet companionship over constant stimulation.",
    },
    careTips: {
      zh: "每週梳毛 1–2 次即可；留意體態與活動量，避免體重快速增加。提供穩固跳台與舒適睡窩，減少關節負擔。定期檢查口腔與指甲。",
      en: "Brush 1–2 times weekly. Monitor body condition and activity to prevent weight gain. Offer sturdy perches and soft beds, and keep teeth and nails in routine care.",
    },
    nutritionAdvice: {
      zh: "選擇適量熱量的優質成貓糧，必要時改用體重管理配方。定時定量餵食，搭配充足清水與濕糧，維持泌尿與代謝健康。",
      en: "Choose quality adult food with sensible calories; use weight-management formulas if needed. Feed measured meals with plenty of water and some wet food.",
    },
    fullDescription: {
      zh: "英國短毛貓以圓潤臉型、濃密短毛與穩定氣質聞名，是許多家庭首選的陪伴品種。牠們外表「泰迪熊」般討喜，內心卻安靜內斂；適度遊戲與穩定作息，能讓牠們長期保持健康與好心情。",
      en: "British Shorthairs are known for round faces, dense short coats, and steady temperaments. Teddy-bear looks meet a quietly affectionate nature — balanced play and routine keep them well for years.",
    },
  },
  {
    id: "american-shorthair",
    slug: "american-shorthair",
    coat: "short",
    image:
      "https://images.unsplash.com/photo-1548247416-ec66f4900b2e?q=80&w=800&auto=format&fit=crop",
    name: { zh: "美國短毛貓", en: "American Shorthair" },
    coatLabel: { zh: "短毛", en: "Short hair" },
    summary: {
      zh: "活潑好動、適應力強，需補足每日運動量。",
      en: "Playful and adaptable — make sure daily exercise is enough.",
    },
    imageAlt: {
      zh: "美國短毛貓肖像",
      en: "Portrait of an American Shorthair cat",
    },
    origin: { zh: "美國", en: "United States" },
    lifespan: { zh: "15–20 年", en: "15–20 years" },
    weight: { zh: "公 5–7 kg／母 3.5–5.5 kg", en: "Males 5–7 kg / Females 3.5–5.5 kg" },
    personality: {
      zh: "好奇心強、友善且適應力佳，對人與其他寵物通常表現開放。喜愛狩獵遊戲與探索，能融入熱鬧或安靜的家庭節奏。",
      en: "Curious, friendly, and adaptable with people and other pets. Loves hunting-style play and exploring, fitting both lively and calm households.",
    },
    careTips: {
      zh: "每日安排互動遊戲與爬高空間，滿足活動需求。短毛好照顧，但仍需定期梳毛減少掉毛。注意心血管家族史，定期健康檢查很重要。",
      en: "Schedule daily interactive play and vertical space. Short coats are easy, but brush regularly. Watch cardiac family history with routine vet checks.",
    },
    nutritionAdvice: {
      zh: "高品質蛋白質主食有助維持肌肉；依活動量調整熱量。避免過度零食，並確保全天候新鮮飲水。",
      en: "Quality protein supports muscle tone; match calories to activity. Limit treats and keep fresh water available all day.",
    },
    fullDescription: {
      zh: "美國短毛貓是經典的「家庭全能貓」：強壯、聰明又好脾氣。銀虎斑等花色最具辨識度。只要給足遊戲時間與均衡飲食，牠們能成為長期穩定的好夥伴。",
      en: "American Shorthairs are classic all-round family cats — sturdy, smart, and good-natured. Silver tabbies are especially iconic. With play and balanced meals, they make lasting companions.",
    },
  },
  {
    id: "ragdoll",
    slug: "ragdoll",
    coat: "long",
    image:
      "https://images.unsplash.com/photo-1627341394541-11910609a632?q=80&w=800&auto=format&fit=crop",
    name: { zh: "布偶貓", en: "Ragdoll" },
    coatLabel: { zh: "長毛", en: "Long hair" },
    summary: {
      zh: "性格溫順、毛髮豐盈，需注重腸胃與定期梳毛。",
      en: "Sweet-tempered with a plush coat — mind digestion and brushing.",
    },
    imageAlt: {
      zh: "布偶貓肖像",
      en: "Portrait of a Ragdoll cat",
    },
    origin: { zh: "美國加州", en: "California, USA" },
    lifespan: { zh: "12–17 年", en: "12–17 years" },
    weight: { zh: "公 6–9 kg／母 4.5–7 kg", en: "Males 6–9 kg / Females 4.5–7 kg" },
    personality: {
      zh: "溫柔黏人、安全感強，常被形容為「狗般忠誠」。喜歡跟隨家人走動，對粗暴對待敏感，適合耐心細膩的照顧者。",
      en: "Gentle and people-oriented — often called dog-like in loyalty. Follows family around and thrives with patient, kind handling.",
    },
    careTips: {
      zh: "長毛需每週多次梳理，重點清理胸腹與後腿防結塊。室內飼養較安全；注意關節負擔，提供低矮舒適休息區。定期檢查心臟相關健康指標。",
      en: "Brush several times weekly, especially chest and hind legs. Indoor living is safer; ease joints with low soft resting spots and monitor heart health.",
    },
    nutritionAdvice: {
      zh: "腸胃較敏感者可選易消化配方與適度纖維。大型體格需控制總熱量，搭配適量濕糧提升水分攝取。",
      en: "Sensitive digesters do well on gentle formulas with moderate fiber. Larger frames need calorie control plus wet food for hydration.",
    },
    fullDescription: {
      zh: "布偶貓以藍眼睛、軟綿綿體態與放鬆時「布偶式」癱軟聞名。牠們需要情感陪伴，也需要認真梳毛與體重管理；細心照顧下，是極具療癒感的家庭成員。",
      en: "Ragdolls are known for blue eyes, plush bodies, and their floppy ‘ragdoll’ relaxation. They need emotional company plus grooming and weight care — deeply soothing family cats when tended well.",
    },
  },
  {
    id: "russian-blue",
    slug: "russian-blue",
    coat: "short",
    image:
      "https://images.unsplash.com/photo-1574063413132-3407983637cc?q=80&w=800&auto=format&fit=crop",
    name: { zh: "俄羅斯藍貓", en: "Russian Blue" },
    coatLabel: { zh: "短毛", en: "Short hair" },
    summary: {
      zh: "敏感聰穎、短毛濃密，提供安靜的休息空間。",
      en: "Sensitive and bright with dense short fur — offer quiet rest space.",
    },
    imageAlt: {
      zh: "俄羅斯藍貓肖像",
      en: "Portrait of a Russian Blue cat",
    },
    origin: { zh: "俄羅斯／北歐地區", en: "Russia / Northern Europe" },
    lifespan: { zh: "15–20 年", en: "15–20 years" },
    weight: { zh: "公 4–6 kg／母 3–5 kg", en: "Males 4–6 kg / Females 3–5 kg" },
    personality: {
      zh: "聰明敏感、對熟人溫柔，對陌生人可能害羞。喜歡可預期的日常與專屬安靜角落，適合尊重界線的陪伴方式。",
      en: "Intelligent and sensitive — soft with familiars, shy with strangers. Prefers predictable routines and quiet corners, with respectful companionship.",
    },
    careTips: {
      zh: "雙層短毛可用橡膠梳輕輕梳理以減少掉毛。保持環境穩定，避免頻繁搬家或嘈雜。提供藏匿處與高處觀察點。",
      en: "Dense double coat benefits from gentle rubber-brush grooming. Keep the environment steady and offer hideaways plus high lookout spots.",
    },
    nutritionAdvice: {
      zh: "代謝偏高者需注意熱量密度與體態。優質蛋白質與穩定餵食時間有助情緒與腸胃；可適度補充 omega 脂肪酸護毛。",
      en: "Watch calorie density for active metabolisms. Quality protein and steady meal times help mood and gut; omega fatty acids support the coat.",
    },
    fullDescription: {
      zh: "俄羅斯藍貓以銀藍毛色與翠綠色眼睛為標誌，氣質優雅而內斂。牠們不是「吵鬧型」伴侶，卻能在信任建立後展現深厚情感連結。",
      en: "Russian Blues are marked by silver-blue coats and emerald eyes — elegant and reserved. Not loud companions, yet deeply bonded once trust is earned.",
    },
  },
  {
    id: "munchkin",
    slug: "munchkin",
    coat: "both",
    image:
      "https://images.unsplash.com/photo-1529778873920-4da4926a72c2?w=800&auto=format&fit=crop",
    name: { zh: "曼赤因短腿貓", en: "Munchkin" },
    coatLabel: { zh: "短毛／長毛", en: "Short / long hair" },
    summary: {
      zh: "活潑親人，注意關節與脊椎保健。",
      en: "Lively and affectionate — mind joint and spine care.",
    },
    imageAlt: {
      zh: "曼赤因短腿貓肖像",
      en: "Portrait of a Munchkin cat",
    },
    origin: { zh: "美國", en: "United States" },
    lifespan: { zh: "12–15 年", en: "12–15 years" },
    weight: { zh: "約 2.5–4 kg", en: "About 2.5–4 kg" },
    personality: {
      zh: "活潑好奇且親人，短腿並不影響玩耍熱情。喜歡追逐玩具、觀察家人，適合互動頻繁的家庭。",
      en: "Vivacious, curious, and people-loving — short legs don’t dampen play drive. Enjoys toys and family watching in interactive homes.",
    },
    careTips: {
      zh: "避免過高垂直跳躍與過重負擔；提供斜坡式貓樹與防滑地面。短腿結構需關注關節與脊椎，定期獸醫評估。毛長型需額外梳毛。",
      en: "Limit extreme jumping and excess weight; use ramped trees and non-slip floors. Monitor joints and spine with vet checkups; long coats need extra brushing.",
    },
    nutritionAdvice: {
      zh: "維持理想體重是關節保健關鍵。選擇營養均衡主食，避免高熱量零食；可與獸醫討論關節支援配方。",
      en: "Ideal weight is key for joint care. Use balanced staples, skip calorie-heavy treats, and ask your vet about joint-support diets.",
    },
    fullDescription: {
      zh: "曼赤因短腿貓以短肢萌態聞名，活力卻一點不輸。飼養重點在尊重身體結構：安全空間、體重控制與溫柔遊戲，讓牠快樂奔跑又不勉強身體。",
      en: "Munchkins are famous for short legs and big energy. Care means respecting structure — safe spaces, weight control, and gentle play so they can zip around without strain.",
    },
  },
  {
    id: "norwegian-forest",
    slug: "norwegian-forest",
    coat: "long",
    image:
      "https://images.unsplash.com/photo-1513245543132-31f507417b26?w=800&auto=format&fit=crop",
    name: { zh: "挪威森林貓", en: "Norwegian Forest Cat" },
    coatLabel: { zh: "長毛", en: "Long hair" },
    summary: {
      zh: "體型高大、毛樣厚實，需特別注意毛球排空。",
      en: "Large and thick-coated — pay special attention to hairball care.",
    },
    imageAlt: {
      zh: "挪威森林貓肖像",
      en: "Portrait of a Norwegian Forest Cat",
    },
    origin: { zh: "挪威", en: "Norway" },
    lifespan: { zh: "14–16 年", en: "14–16 years" },
    weight: { zh: "公 5–9 kg／母 4–7 kg", en: "Males 5–9 kg / Females 4–7 kg" },
    personality: {
      zh: "獨立中帶溫柔，喜歡高處與觀察。不常過度黏人，但對家庭成員忠誠；適合有空間讓牠攀爬探索的環境。",
      en: "Independently affectionate and loyal. Loves heights and watching from above — thrives where climbing and exploring are welcome.",
    },
    careTips: {
      zh: "雙層厚毛需勤加梳理，換季尤甚，並協助毛球排出。提供堅固高貓樹；注意腎臟與關節相關健檢。",
      en: "Brush the double coat often, especially in shed season, and support hairball clearance. Offer sturdy tall trees and monitor kidney and joint health.",
    },
    nutritionAdvice: {
      zh: "大型品種需足夠蛋白質與控管熱量。可選擇有助毛球控制的配方，並確保飲水量充足。",
      en: "Large breeds need solid protein with calorie control. Hairball-support formulas and strong hydration help thick-coated cats.",
    },
    fullDescription: {
      zh: "挪威森林貓來自北歐神話般的森林印象：厚實鬃毛、強壯體格與優雅攀爬力。牠們需要空間與梳毛時間，回報則是沉穩又有存在感的陪伴。",
      en: "Norwegian Forest Cats evoke northern woods — thick manes, strong frames, and graceful climbing. They need space and grooming time, returning steady, presence-filled companionship.",
    },
  },
];

export function filterCatBreeds(
  filter: CatCoatFilter,
  breeds: CatBreed[] = CAT_BREEDS,
): CatBreed[] {
  if (filter === "all") return breeds;
  if (filter === "short") {
    return breeds.filter((breed) => breed.coat === "short" || breed.coat === "both");
  }
  return breeds.filter((breed) => breed.coat === "long" || breed.coat === "both");
}

export function getCatBreedBySlug(slug: string): CatBreed | undefined {
  return CAT_BREEDS.find((breed) => breed.slug === slug);
}

export function isCatBreedSlug(slug: string): boolean {
  return CAT_BREEDS.some((breed) => breed.slug === slug);
}
