export type DogBreed = {
  id: string;
  slug: string;
  name: string;
  nameEn: string;
  coatLabel: string;
  coatLabelEn: string;
  coatType: "short" | "long";
  shortDescription: string;
  shortDescriptionEn: string;
  personality: string;
  personalityEn: string;
  care: string;
  careEn: string;
  exercise: string;
  exerciseEn: string;
  fullDescription?: string;
  fullDescriptionEn?: string;
  appearance?: string[];
  appearanceEn?: string[];
  health?: string[];
  healthEn?: string[];
  adoptionNote?: string;
  adoptionNoteEn?: string;
  imageUrl: string;
  sourceUrl: string;
};

/**
 * Curated educational profiles for the homepage dog-breed guide.
 * Images are Wikimedia Commons references collected for this editorial section.
 */
export const DOG_BREEDS: DogBreed[] = [
  {
    id: "dog-01",
    slug: "labrador-retriever",
    name: "拉布拉多尋回犬",
    nameEn: "Labrador Retriever",
    coatLabel: "短毛雙層毛",
    coatLabelEn: "Short double coat",
    coatType: "short",
    shortDescription: "性格友善、充滿活力，是受歡迎的家庭伴侶犬。",
    shortDescriptionEn: "A friendly, energetic family companion with an easygoing nature.",
    personality: "開朗、忠誠而喜愛社交，通常親近人和其他動物。",
    personalityEn: "Outgoing, loyal and social, often friendly with people and other animals.",
    care: "定期梳理短雙層毛，並留意體重及日常口腔清潔。",
    careEn: "Brush the short double coat regularly and keep weight and dental care in mind.",
    exercise: "活動量高，需要每日運動及互動遊戲。",
    exerciseEn: "High activity needs call for daily exercise and interactive play.",
    fullDescription: "拉布拉多尋回犬起源於加拿大紐芬蘭，後在英國培育發揚，是智商高、溫和友善的中大型工作獵犬，亦常見於導盲及搜救工作。",
    fullDescriptionEn: "The Labrador Retriever originated in Newfoundland, Canada and was further developed in Britain. It is an intelligent, gentle and friendly medium-to-large working dog, widely known for guide and search-and-rescue work.",
    appearance: ["短厚防潑水雙層毛，適合冰冷水域。", "粗壯的水獺尾，游泳時可作舵使用。", "常見黃色、奶油白、黑色及朱古力色。", "成年公犬約 30–36 公斤，母犬約 25–32 公斤。"],
    appearanceEn: ["A short, dense water-resistant double coat suited to cold water.", "A strong otter tail that acts like a rudder while swimming.", "Common colours include yellow, cream, black and chocolate.", "Adult males are around 30–36 kg and females around 25–32 kg."],
    health: ["容易貪吃及肥胖，應控制份量並維持理想體重。", "換季掉毛量大，需定期梳理雙層毛。", "留意髖關節發育不良、胃扭轉、耳道感染及視網膜萎縮等風險。", "每日需要至少約 1 小時運動、互動遊戲及訓練。"],
    healthEn: ["A strong appetite can lead to obesity, so portions and healthy weight should be managed.", "Seasonal shedding can be heavy; regular brushing is important.", "Be aware of risks including hip dysplasia, gastric torsion, ear infections and progressive retinal atrophy.", "Plan for at least about one hour of daily exercise, interactive play and training."],
    adoptionNote: "在香港，合資格犬舍幼犬價格常見約 HK$15,000–30,000；亦可考慮向動物收容所或品種救援團體領養。實際健康風險及價格會因個體而異，帶回家前應先作專業評估。",
    adoptionNoteEn: "In Hong Kong, puppies from qualified breeders are often quoted at around HK$15,000–30,000; adoption through shelters or breed-rescue groups is another option. Health risks and prices vary by individual, so seek professional advice before bringing a dog home.",
    imageUrl: "/images/dog-breeds/labrador-retriever.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/Category:Labrador_Retrievers",
  },
  {
    id: "dog-02",
    slug: "shiba-inu",
    name: "柴犬",
    nameEn: "Shiba Inu",
    coatLabel: "短毛雙層毛",
    coatLabelEn: "Short double coat",
    coatType: "short",
    shortDescription: "警覺而獨立的日本犬種，擁有鮮明個性。",
    shortDescriptionEn: "An alert, independent Japanese breed with a distinctive personality.",
    personality: "對家庭忠誠親近，但通常保留獨立一面，早期社交有助建立信任。",
    personalityEn: "Loyal to family while independent by nature; early socialisation helps build confidence.",
    care: "定期梳理，換毛期需增加頻率，並保持皮膚乾爽。",
    careEn: "Brush regularly and increase grooming during seasonal shedding.",
    exercise: "每日適度散步及嗅聞遊戲有助消耗精力。",
    exerciseEn: "Moderate daily walks and scent-based play help channel their energy.",
    fullDescription: "柴犬是源自日本的古老中小型獵犬，以狐狸臉、捲曲鐮刀尾及獨立而傲嬌的個性聞名，平均壽命約 12–15 年。",
    fullDescriptionEn: "The Shiba Inu is an ancient small-to-medium Japanese hunting dog known for its fox-like face, curled sickle tail and independent, spirited personality. Its average lifespan is around 12–15 years.",
    appearance: ["雄性肩高約 38–41 公分、體重約 9–11 公斤；雌性肩高約 35–38 公分、體重約 7–9 公斤。", "三角形立耳、深棕色上揚眼角、飽滿臉頰及捲曲尾巴。", "擁有外層粗硬防水、內層柔軟保暖的雙層被毛，臉部、胸口、腹部及尾巴內側常見裏白。", "四大常見毛色包括赤柴、黑柴、白柴及胡麻柴。"],
    appearanceEn: ["Males are around 38–41 cm at the shoulder and 9–11 kg; females are around 35–38 cm and 7–9 kg.", "Distinctive triangular upright ears, deep brown upturned eyes, full cheeks and a curled tail.", "A double coat with a coarse, water-resistant outer layer and a soft insulating undercoat; urajiro cream markings are typical on the face, chest, belly and underside of the tail.", "The four commonly recognised colours are red, black and tan, cream, and sesame."],
    health: ["六個月前把握社會化減敏及正向訓練，避免打罵，以獎勵和耐心建立合作。", "平時每週梳毛 2–3 次；春秋換毛期可能需要每日梳理。", "外出必須使用牽繩，成年柴犬每天約需要 30–60 分鐘規律戶外活動。", "香港潮濕環境要留意皮膚敏感；亦應關注膝蓋骨脫臼、髖關節問題及青光眼、白內障等眼睛異常。", "通常不需過度洗澡，約每 3–4 週一次並按皮膚狀況調整；如出現異常流淚或瞇眼應及早求醫。"],
    healthEn: ["Use the early puppy period, especially before six months, for socialisation, desensitisation and reward-based training rather than punishment.", "Brush two to three times weekly in normal periods; daily brushing may be needed during spring and autumn shedding.", "Use a lead outdoors, as the breed can be an accomplished escape artist; adult Shibas generally need around 30–60 minutes of regular outdoor activity daily.", "In humid Hong Kong conditions, watch for skin sensitivity; also discuss patellar luxation, hip problems and eye conditions such as glaucoma or cataracts with a veterinarian.", "Avoid excessive bathing; around every three to four weeks may suit many dogs, adjusted to skin condition. Seek veterinary care for unusual tearing or squinting."],
    adoptionNote: "柴犬自主性強、地盤意識及捕獵心較明顯，帶回家前應評估居住環境、訓練時間及安全外出安排；實際健康情況應由獸醫評估。",
    adoptionNoteEn: "Shibas are independent and may have strong territorial and prey-drive behaviours. Before bringing one home, assess your living space, training time and secure outdoor routine; individual health should be assessed by a veterinarian.",
    imageUrl: "/images/dog-breeds/shiba-inu.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/Category:Shiba_Inu",
  },
  {
    id: "dog-03",
    slug: "siberian-husky",
    name: "西伯利亞哈士奇",
    nameEn: "Siberian Husky",
    coatLabel: "雙層中長毛",
    coatLabelEn: "Medium double coat",
    coatType: "long",
    shortDescription: "友善活潑而精力旺盛，需要充足活動和陪伴。",
    shortDescriptionEn: "A friendly, spirited breed that thrives with active engagement.",
    personality: "聰明、友善而獨立，適合能投入時間訓練及互動的家庭。",
    personalityEn: "Intelligent, friendly and independent, best matched with active households.",
    care: "濃密雙層毛在換毛期會大量掉毛，炎熱天氣要注意通風降溫。",
    careEn: "The dense double coat sheds heavily seasonally; provide ventilation and cooling in warm weather.",
    exercise: "運動需求極高，需要長時間散步、奔跑或心智遊戲。",
    exerciseEn: "Very high exercise needs require long walks, running or engaging mental games.",
    fullDescription: "西伯利亞哈士奇是源自俄羅斯西伯利亞東北部的古老中型雪橇犬，以狼一般的外型、濃密雙層毛、旺盛精力及逗趣而獨立的性格聞名，平均壽命約 12–15 年。",
    fullDescriptionEn: "The Siberian Husky is an ancient medium-sized sled dog from northeastern Siberia, known for its wolf-like appearance, dense double coat, high energy and playful independent personality. Its average lifespan is around 12–15 years.",
    appearance: ["公犬肩高約 53–60 公分、體重約 20–27 公斤；母犬通常稍小。", "三角直立耳、杏仁形眼睛，常見藍色、棕色及異色瞳。", "濃密雙層毛，常見黑白、灰白、紅／銅色、野狼色及純白毛色。", "哈士奇通常較阿拉斯加雪橇犬輕巧；可有藍眼或異色瞳，尾巴放鬆時多會下垂。"],
    appearanceEn: ["Males are around 53–60 cm at the shoulder and 20–27 kg; females are generally smaller.", "Triangular upright ears and almond-shaped eyes, commonly blue, brown or heterochromic.", "A dense double coat commonly seen in black-and-white, grey-and-white, red or copper, wolf-grey and white.", "The Husky is generally lighter and more compact than the Alaskan Malamute; blue or mismatched eyes may occur, and the tail is often carried down when relaxed."],
    health: ["耐寒但不耐熱；香港及亞洲夏季應使用冷氣、保持通風，並避免正午散步以降低中暑風險。", "每年可能有兩次大型換毛，換毛期需要每日梳理及更仔細清潔。", "需要一致而有耐心的訓練；聰明但自主性強，未消耗精力時可能拆家、挖洞或長嚎。", "應向獸醫了解遺傳性白內障、進行性視網膜萎縮（PRA）、髖關節發育不良、脂漏性皮膚炎及外耳炎等風險。", "不適合作為主要守衛犬；外出應使用可靠牽繩及做好防走失措施。"],
    healthEn: ["Huskies tolerate cold better than heat; in Hong Kong and other Asian summers, provide air conditioning, ventilation and avoid midday walks to reduce heatstroke risk.", "They may have two heavy seasonal sheds each year, requiring daily brushing and more thorough cleaning during those periods.", "Use consistent, patient training; they are intelligent but independent, and under-exercised dogs may chew, dig or howl.", "Ask a veterinarian about risks including hereditary cataracts, progressive retinal atrophy (PRA), hip dysplasia, seborrheic dermatitis and otitis externa.", "They are not ideal as primary guard dogs; use a secure lead and reliable escape-prevention measures outdoors."],
    adoptionNote: "哈士奇適合能提供充足運動、訓練及夏季降溫安排的家庭。帶回家前應評估居住環境、每日可投入時間及防走失措施，並由獸醫評估個別健康狀況。",
    adoptionNoteEn: "Huskies suit households able to provide substantial exercise, training and reliable summer cooling. Before bringing one home, assess your living space, daily time commitment and escape-prevention plan, and have the individual dog's health assessed by a veterinarian.",
    imageUrl: "/images/dog-breeds/siberian-husky.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/Category:Siberian_Husky",
  },
  {
    id: "dog-04",
    slug: "french-bulldog",
    name: "法國鬥牛犬",
    nameEn: "French Bulldog",
    coatLabel: "短毛",
    coatLabelEn: "Short coat",
    coatType: "short",
    shortDescription: "體型嬌小、親人溫和，適合都市生活的伴侶犬。",
    shortDescriptionEn: "A small, affectionate companion often suited to city living.",
    personality: "通常溫和親人，喜歡陪伴家人，個體性格及適應力各有不同。",
    personalityEn: "Usually gentle and affectionate with family; temperament and adaptability vary by individual.",
    care: "定期梳理及清潔皺褶，並特別留意面部衛生與炎熱環境。",
    careEn: "Brush regularly, clean facial folds and take extra care in hot conditions.",
    exercise: "每日短時間散步及輕量玩耍即可，避免過度消耗。",
    exerciseEn: "Short daily walks and light play are often enough; avoid overexertion.",
    fullDescription: "法國鬥牛犬是深受歡迎的小型伴侶犬，以蝙蝠耳、扁平臉部皺褶及溫和黏人的性格聞名。外表嚴肅，實際上通常活潑親人並非常依賴家庭陪伴。",
    fullDescriptionEn: "The French Bulldog is a popular small companion breed known for its bat ears, flat wrinkled face and affectionate nature. Despite a serious-looking expression, it is often playful, people-oriented and highly dependent on family companionship.",
    appearance: ["直立蝙蝠耳基部寬、耳尖圓，是最具辨識度的外觀特徵。", "短吻扁平臉屬短頭顱結構，鼻樑短並有明顯皮膚皺褶。", "身形結實，前軀寬厚，體重通常約 8–14 公斤。", "被毛短而光滑，常見虎斑、花斑、奶油色及淺黃褐色。"],
    appearanceEn: ["Broad-based upright bat ears with rounded tips are a defining feature.", "A short, flat muzzle with brachycephalic structure and pronounced facial folds.", "A compact, muscular build with a broad front; typical weight is around 8–14 kg.", "A short, smooth coat commonly seen in brindle, pied, cream and fawn."],
    health: ["短頭顱結構令散熱及呼吸能力較弱，炎熱潮濕天氣應保持涼爽通風，避免正午及劇烈運動。", "留意短頭顱犬阻塞性氣道症候群、打呼、呼吸吃力及中暑警號；出現異常應立即求醫。", "臉部及尾部皺褶容易藏污納垢，需定期溫和清潔並保持乾爽，避免皮膚炎。", "腸胃較敏感，可能出現胃脹氣或消化不良；應按獸醫建議選擇飲食及控制體重。", "脊椎及關節需要保護，應避免頻繁跳躍、從高處落下及過度負重。"],
    healthEn: ["Brachycephalic structure can reduce heat dissipation and breathing efficiency; keep the dog cool and ventilated in hot, humid weather and avoid midday or strenuous exercise.", "Watch for brachycephalic obstructive airway syndrome, loud snoring, laboured breathing and signs of heatstroke; seek urgent veterinary care for unusual symptoms.", "Facial and tail folds can trap moisture and debris, so clean them gently and regularly and keep them dry to reduce dermatitis risk.", "The digestive system may be sensitive, with gas or indigestion possible; choose food and manage weight with veterinary guidance.", "Protect the spine and joints by avoiding frequent jumping, high falls and excessive load."],
    adoptionNote: "法鬥雖然運動量較低、適合都市生活，但不是低照護犬種。帶回家前應評估夏季降溫、呼吸道及皮膚護理、醫療預算與陪伴時間；亦可考慮向本地收容所領養。",
    adoptionNoteEn: "Although French Bulldogs have lower exercise needs and may suit city living, they are not a low-care breed. Before bringing one home, plan for summer cooling, airway and skin care, veterinary costs and companionship time; local shelter adoption is also worth considering.",
    imageUrl: "/images/dog-breeds/french-bulldog.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/Category:French_Bulldogs",
  },
  {
    id: "dog-05",
    slug: "pembroke-welsh-corgi",
    name: "彭布羅克威爾斯柯基犬",
    nameEn: "Pembroke Welsh Corgi",
    coatLabel: "雙層中長毛",
    coatLabelEn: "Medium double coat",
    coatType: "long",
    shortDescription: "機警、親人而充滿活力，喜歡與家人互動。",
    shortDescriptionEn: "An alert, affectionate and lively companion who enjoys family interaction.",
    personality: "聰明友善而忠誠，牧羊本能可能帶來驅趕或輕咬腳跟行為。",
    personalityEn: "Bright, friendly and loyal; herding instincts can show as chasing or heel-nipping.",
    care: "定期梳理濃密雙層毛，並注意體重及脊椎保護。",
    careEn: "Brush the dense double coat regularly and support healthy weight and back care.",
    exercise: "每日散步配合心智刺激，滿足好奇心和活動需要。",
    exerciseEn: "Daily walks with mental stimulation help satisfy curiosity and energy.",
    imageUrl: "/images/dog-breeds/pembroke-welsh-corgi.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/Category:Pembroke_Welsh_Corgis",
  },
  {
    id: "dog-06",
    slug: "dachshund",
    name: "臘腸犬",
    nameEn: "Dachshund",
    coatLabel: "短毛／長毛／剛毛",
    coatLabelEn: "Smooth, long or wire coat",
    coatType: "short",
    shortDescription: "長身短腿、聰明親人而帶有活潑勇敢的個性。",
    shortDescriptionEn: "A distinctive long-bodied breed that is clever, affectionate and playful.",
    personality: "親人、聰明而勇敢，適合多種家庭但需要溫和一致的訓練。",
    personalityEn: "Affectionate, clever and courageous; gentle, consistent training is helpful.",
    care: "按毛型梳理，並避免過度跳躍，日常留意脊椎負荷。",
    careEn: "Groom according to coat type and limit excessive jumping to support the back.",
    exercise: "適度散步及遊戲即可，配合安全的地面活動。",
    exerciseEn: "Moderate walks and play are suitable, with safe low-impact movement.",
    imageUrl: "/images/dog-breeds/dachshund.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/Category:Dachshunds",
  },
  {
    id: "dog-07",
    slug: "pomeranian",
    name: "博美犬",
    nameEn: "Pomeranian",
    coatLabel: "豐厚雙層長毛",
    coatLabelEn: "Dense double coat",
    coatType: "long",
    shortDescription: "體型嬌小、活潑警覺，擁有蓬鬆可愛的外表。",
    shortDescriptionEn: "A compact, lively companion with an alert nature and plush coat.",
    personality: "聰明好奇而警覺，早期社交及訓練有助管理吠叫傾向。",
    personalityEn: "Smart, curious and alert; early socialisation can help manage vocal tendencies.",
    care: "需要定期梳理以防打結，並照顧牙齒及眼周清潔。",
    careEn: "Regular brushing helps prevent tangles; include routine dental and eye-area care.",
    exercise: "短途散步及室內互動通常足夠，適合較小居住空間。",
    exerciseEn: "Short walks and indoor play are often enough for this compact companion.",
    imageUrl: "/images/dog-breeds/pomeranian.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/Category:Pomeranians",
  },
  {
    id: "dog-08",
    slug: "border-collie",
    name: "邊境牧羊犬",
    nameEn: "Border Collie",
    coatLabel: "雙層中長毛",
    coatLabelEn: "Medium double coat",
    coatType: "long",
    shortDescription: "學習力極高、敏捷而充滿工作熱情的犬種。",
    shortDescriptionEn: "An exceptionally intelligent, agile working breed with high drive.",
    personality: "聰明、警覺且忠誠，適合能提供持續心智訓練的活躍家庭。",
    personalityEn: "Highly intelligent, alert and loyal, best for active homes with time for training.",
    care: "定期梳理雙層毛，換毛期增加頻率並留意打結。",
    careEn: "Brush the double coat regularly and increase frequency during shedding seasons.",
    exercise: "需要大量每日運動、訓練及心智遊戲，以滿足工作本能。",
    exerciseEn: "Needs vigorous daily exercise, training and mental games to fulfil working instincts.",
    imageUrl: "/images/dog-breeds/border-collie.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/Category:Border_Collies",
  },
];

export function getDogBreedBySlug(slug: string): DogBreed | undefined {
  return DOG_BREEDS.find((breed) => breed.slug === slug);
}

export function isDogBreedSlug(slug: string): boolean {
  return DOG_BREEDS.some((breed) => breed.slug === slug);
}
