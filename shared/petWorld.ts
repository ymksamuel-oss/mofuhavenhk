export type CatBreedGuide = {
  name: string;
  image: string; // backwards compatibility
  images: string[];
  temperament: string;
  care: string;
  note: string;
  isRealPhoto: boolean;
  photoCredit?: string;
  sourceUrl?: string;
};

export type CatCareGuide = {
  title: string;
  body: string;
};

export const catCareGuides: CatCareGuide[] = [
  { title: "每日飲食與水分管理", body: "貓咪天生對水分攝取較不敏感，建議日常飲食結合主食罐或流質點心，並在多處放置新鮮流動水源，幫助維護泌尿系統健康。" },
  { title: "毛髮梳理與日常清潔", body: "定期梳理不僅能減少廢毛吞入引發毛球症，也能及早發現皮膚異常。長毛貓需要每日梳理，短毛貓則建議每週 2-3 次。" },
  { title: "適度遊戲與環境豐富化", body: "透過逗貓棒、益智玩具及垂直空間（如貓跳台、窗邊觀景台），滿足貓咪的狩獵本能與登高天性，降低焦慮與壓力。" },
  { title: "貓砂盆維護與排泄觀察", body: "保持貓砂盆清潔（建議每日清理 1-2 次），並觀察排泄頻率與型態，這是掌握貓咪健康狀況最直接的指標。" },
  { title: "定期健康檢查與疫苗", body: "成年貓建議每年進行一次全面健檢；老年貓（7歲以上）則建議每半年檢查一次，及早預防慢性疾病。" },
  { title: "溫柔互動與社交建立", body: "尊重貓咪的自主權與安全距離，透過緩慢的眼神接觸（慢眨眼）與正向獎勵建立信任，切忌強行抱持。" },
];

export const catBreedGuides: CatBreedGuide[] = [
  {
    name: "英國短毛貓",
    image: "/assets/pet/british-shorthair_828cba70.jpg",
    images: ["/assets/pet/british-shorthair_828cba70.jpg"],
    temperament: "穩重、親人而不過分黏人",
    care: "短毛仍需要定期梳理，並安排溫和的互動遊戲。",
    note: "圓潤體型適合以玩耍及均衡份量維持日常活動。",
    isRealPhoto: true,
    photoCredit: "George E. Koronaios / Wikimedia Commons · CC BY-SA 4.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:A_British_Shorthair_cat.jpg",
  },
  {
    name: "美國短毛貓",
    image: "/assets/pet/american-shorthair_9cb75e41.jpg",
    images: ["/assets/pet/american-shorthair_9cb75e41.jpg", "/assets/pet/amer-2_95dbbc70.jpg"],
    temperament: "活潑、適應力強、喜歡探索",
    care: "準備攀爬、追逐及益智玩具，讓牠每天都有消耗精力的機會。",
    note: "對新環境通常較有彈性，但仍應循序漸進介紹新事物。",
    isRealPhoto: true,
    photoCredit: "Dustin Warrington / Wikimedia Commons · CC BY-SA 2.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:American_Shorthair.jpg",
  },
  {
    name: "布偶貓",
    image: "/assets/pet/ragdoll-verified.jpg",
    images: ["/assets/pet/ragdoll-verified.jpg"],
    temperament: "溫柔、安靜、喜歡陪伴",
    care: "半長毛需要固定梳理，並留意打結及居家活動空間。",
    note: "抱起或互動時應托好身體，讓牠保持安全與放鬆。",
    isRealPhoto: true,
    photoCredit: "Shadowmeld Photography · CC BY-SA 4.0 · Wikimedia Commons",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Adult_Ragdoll_Cat_ACAS-RG-11.jpg",
  },
  {
    name: "暹羅貓",
    image: "/assets/pet/siamese_844c7708.jpg",
    images: ["/assets/pet/siamese_844c7708.jpg"],
    temperament: "聰明、愛交流、互動需求高",
    care: "使用互動玩具及簡單訓練保持刺激，亦要預留陪伴時間。",
    note: "牠們常以聲音表達需要，穩定作息有助建立安全感。",
    isRealPhoto: true,
    photoCredit: "Martin Bahmann / Wikimedia Commons · CC BY-SA 3.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Siam_lilacpoint.jpg",
  },
  {
    name: "緬因貓",
    image: "/assets/pet/maine-coon_cd25cde9.jpg",
    images: ["/assets/pet/maine-coon_cd25cde9.jpg", "/assets/pet/maine-2_e2254aeb.jpg"],
    temperament: "友善、從容、體型較大",
    care: "提供足夠承托力的休息處、寬敞動線及適合大貓使用的用品。",
    note: "梳理時可分區慢慢進行，讓長毛及尾部保持整潔。",
    isRealPhoto: true,
    photoCredit: "Guayar / Wikimedia Commons · Public domain",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Maine_Coon_cat-6_months_old.jpg",
  },
  {
    name: "蘇格蘭摺耳貓",
    image: "/assets/pet/scottish-fold_120a23ab.jpg",
    images: ["/assets/pet/scottish-fold_120a23ab.jpg"],
    temperament: "溫和、好奇、喜歡安靜陪伴",
    care: "選擇舒適而不需過度跳躍的環境，並定期觀察日常活動狀態。",
    note: "如發現活動、步態或食慾明顯改變，應向獸醫尋求專業意見。",
    isRealPhoto: true,
    photoCredit: "Wikimedia Commons · CC BY-SA",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Scottish_Fold_cat_(blue).jpg",
  },
  {
    name: "俄羅斯藍貓",
    image: "/assets/pet/russian-blue-verified.jpg",
    images: ["/assets/pet/russian-blue-verified.jpg"],
    temperament: "文靜、細膩、對熟悉環境有安全感",
    care: "保持固定作息及安靜的休息角落，互動可由時間慢慢開始。",
    note: "穩定的家庭節奏及溫柔接觸通常比頻繁改變更適合牠。",
    isRealPhoto: true,
    photoCredit: "Kabir Bakie · CC BY-SA 2.5 · Wikimedia Commons",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Cat_Russian_Blue_02.jpg",
  },
  {
    name: "波斯貓",
    image: "/assets/pet/persian-verified.jpg",
    images: ["/assets/pet/persian-verified.jpg"],
    temperament: "文雅、恬靜、喜歡舒適環境",
    care: "每天梳理長毛及清潔眼周，維持溫和安靜的居家生活。",
    note: "適合喜歡陪伴安靜貓咪的主人，給予穩定而溫柔的照顧。",
    isRealPhoto: true,
    photoCredit: "Kyogrexu · CC BY-SA 4.0 · Wikimedia Commons",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Fluffy_White_Persian_Cat.jpg",
  },
  {
    name: "孟加拉貓",
    image: "/assets/pet/bengal-verified.jpg",
    images: ["/assets/pet/bengal-verified.jpg"],
    temperament: "精力充沛、好奇心旺盛、身手敏捷",
    care: "提供豐富的攀爬架與互動玩具，滿足大量運動及探索需求。",
    note: "需要主人的耐心陪伴與消耗體力，適合喜歡活潑貓咪的家庭。",
    isRealPhoto: true,
    photoCredit: "Wesam Saka · CC BY-SA 4.0 · Wikimedia Commons",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:A_Bengal_Cat_(cropped).jpg",
  },
  {
    name: "挪威森林貓",
    image: "/assets/pet/norwegian-forest-verified.jpg",
    images: ["/assets/pet/norwegian-forest-verified.jpg"],
    temperament: "獨立、勇敢、溫和友善",
    care: "提供高處跳台與適度梳理，適應力強且熱愛自然環境。",
    note: "換毛季節需要增加梳理頻率，維持毛髮健康亮麗。",
    isRealPhoto: true,
    photoCredit: "Bfe · CC BY-SA 3.0 · Wikimedia Commons",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Norwegian_forest_cat.jpg",
  },
  {
    name: "斯芬克斯貓",
    image: "/assets/pet/sphynx-verified.jpg",
    images: ["/assets/pet/sphynx-verified.jpg"],
    temperament: "熱情、親人、極度黏人",
    care: "定期溫和擦拭皮膚分泌物，注意室溫保暖與防曬。",
    note: "雖然沒有毛髮，但對人十分親近且性格外向。",
    isRealPhoto: true,
    photoCredit: "Dmitry Makeev · CC BY-SA 4.0 · Wikimedia Commons",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Sphynx_-_cat._img_031.jpg",
  },
  {
    name: "阿比西尼亞貓",
    image: "/assets/pet/abyssinian-verified.jpg",
    images: ["/assets/pet/abyssinian-verified.jpg"],
    temperament: "聰明、活潑、對周遭充滿好奇",
    care: "給予充足的互動與遊戲空間，享受與家人一起探索的樂趣。",
    note: "體態優雅且動作敏捷，是極具靈氣的貼心夥伴。",
    isRealPhoto: true,
    photoCredit: "Oleg Royko · CC BY-SA 4.0 · Wikimedia Commons",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Abyssinian_cat_-_Patricia.jpg",
  },
];
