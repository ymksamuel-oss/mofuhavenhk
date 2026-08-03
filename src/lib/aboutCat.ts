export type AboutCatChapter = {
  id: string;
  image: string;
  imageAlt: { zh: string; en: string };
  title: { zh: string; en: string };
  body: { zh: string; en: string };
};

/** Picture-book chapters for `/about-cat`. */
export const ABOUT_CAT_CHAPTERS: AboutCatChapter[] = [
  {
    id: "welcome",
    image: "/images/about-cat/about-cat-01-welcome.webp",
    imageAlt: {
      zh: "迎貓回家的溫暖插畫",
      en: "Illustration of welcoming a kitten home",
    },
    title: {
      zh: "【迎貓回家】新手安全與必備物資",
      en: "Welcome Home — Safety & First Essentials",
    },
    body: {
      zh: "第一次把貓咪接回家，先準備一個安靜、溫暖的小天地。貓砂盆、食水碗、睡窩與抓板是基本配備；窗戶與陽台要檢查防逃。給毛孩幾天適應時間，不要急著介紹所有房間，讓信任慢慢長出來。",
      en: "Before your kitten arrives, prepare a quiet, warm corner with litter, bowls, a bed, and a scratcher. Secure windows and balconies. Give a few calm days to settle before opening the whole home — trust grows gently.",
    },
  },
  {
    id: "food",
    image: "/images/about-cat/about-cat-02-food.webp",
    imageAlt: {
      zh: "貓咪健康飲食插畫",
      en: "Illustration of healthy cat dining",
    },
    title: {
      zh: "【貓咪美味學】健康飲食與補水密碼",
      en: "Cat Cuisine — Diet & Hydration",
    },
    body: {
      zh: "選擇適合年齡與體質的優質貓糧，定時定量比自由取食更容易掌握體態。貓咪天生喝水偏少，可搭配濕糧或噴泉飲水器提升飲水量。換糧時請循序漸進，並留意精神與排泄變化。",
      en: "Choose food suited to age and body condition, with steady portions. Cats often drink little — wet food or a fountain helps. Transition diets gradually and watch energy, coat, and litter-box habits.",
    },
  },
  {
    id: "grooming",
    image: "/images/about-cat/about-cat-03-grooming.webp",
    imageAlt: {
      zh: "溫柔梳毛照護插畫",
      en: "Illustration of gentle cat grooming",
    },
    title: {
      zh: "【日常溫柔照護】梳毛、剪甲與清潔",
      en: "Gentle Care — Brushing, Nails & Cleanliness",
    },
    body: {
      zh: "短毛貓每週梳毛、長毛貓更需勤加梳理，減少毛球與掉毛。指甲過長易鉤傷家具與肉墊，可在放鬆時短時間修剪。貓砂盆保持乾淨，是貓咪情緒與健康的重要指標。",
      en: "Brush short coats weekly and longer coats more often to reduce hairballs. Trim nails gently when your cat is relaxed. A clean litter box is one of the clearest signs of comfort and health.",
    },
  },
  {
    id: "mind",
    image: "/images/about-cat/about-cat-04-mind.webp",
    imageAlt: {
      zh: "貓咪心靈陪伴插畫",
      en: "Illustration of a content cat by the window",
    },
    title: {
      zh: "【瞭解貓咪心事】陪伴與心理健康",
      en: "Cat Feelings — Companionship & Mental Care",
    },
    body: {
      zh: "貓咪需要垂直空間、躲藏處與可預期的日常節奏。每天留一點專屬遊戲時間，比長時間忽略後突然過度刺激更有幫助。尊重牠的界線，安靜陪伴也是愛的語言。",
      en: "Cats need height, hideaways, and a predictable rhythm. A short daily play ritual beats long neglect followed by overstimulation. Quiet presence and respect for boundaries are love, too.",
    },
  },
  {
    id: "health",
    image: "/images/about-cat/about-cat-05-health.webp",
    imageAlt: {
      zh: "貓咪健康守護插畫",
      en: "Illustration of gentle cat health care",
    },
    title: {
      zh: "【健康守護神】預防醫療與生病警號",
      en: "Health Guardian — Prevention & Warning Signs",
    },
    body: {
      zh: "定期疫苗、體內外驅蟲與健康檢查，是長遠守護的基礎。若出現突然不吃、持續嘔吐、精神萎靡、呼吸急促或躲藏不願互動，請盡快求助獸醫。早一步關心，就能多一分安心。",
      en: "Vaccines, parasite control, and check-ups build long-term care. Seek a vet promptly for sudden appetite loss, ongoing vomiting, lethargy, labored breathing, or unusual hiding — early attention brings peace of mind.",
    },
  },
];
