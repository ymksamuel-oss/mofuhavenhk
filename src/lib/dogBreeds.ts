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
    imageUrl: "/images/dog-breeds/labrador-retriever.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/Category:Labrador_Retrievers",
  },
  {
    id: "dog-02",
    slug: "shiba-inu",
    name: "柴犬",
    nameEn: "Shiba Inu",
    coatLabel: "雙層毛",
    coatLabelEn: "Double coat",
    coatType: "short",
    shortDescription: "警覺而獨立的日本犬種，擁有鮮明個性。",
    shortDescriptionEn: "An alert, independent Japanese breed with a distinctive personality.",
    personality: "對家庭忠誠親近，但通常保留獨立一面，早期社交有助建立信任。",
    personalityEn: "Loyal to family while independent by nature; early socialisation helps build confidence.",
    care: "定期梳理，換毛期需增加頻率，並保持皮膚乾爽。",
    careEn: "Brush regularly and increase grooming during seasonal shedding.",
    exercise: "每日適度散步及嗅聞遊戲有助消耗精力。",
    exerciseEn: "Moderate daily walks and scent-based play help channel their energy.",
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
