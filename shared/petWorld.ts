export type CatBreedGuide = {
  name: string;
  image: string;
  temperament: string;
  care: string;
  note: string;
};

export const catBreedGuides: CatBreedGuide[] = [
  { name: "英國短毛貓", image: "/manus-storage/cat-breed-british-shorthair_e98a5026.jpg", temperament: "穩重、親人而不過分黏人", care: "短毛仍需要定期梳理，並安排溫和的互動遊戲。", note: "圓潤體型適合以玩耍及均衡份量維持日常活動。" },
  { name: "美國短毛貓", image: "/manus-storage/cat-breed-american-shorthair_0b339cf4.jpg", temperament: "活潑、適應力強、喜歡探索", care: "準備攀爬、追逐及益智玩具，讓牠每天都有消耗精力的機會。", note: "對新環境通常較有彈性，但仍應循序漸進介紹新事物。" },
  { name: "布偶貓", image: "/manus-storage/cat-breed-ragdoll_7d3def97.jpg", temperament: "溫柔、安靜、喜歡陪伴", care: "半長毛需要固定梳理，並留意打結及居家活動空間。", note: "抱起或互動時應托好身體，讓牠保持安全與放鬆。" },
  { name: "暹羅貓", image: "/manus-storage/cat-breed-siamese_dcf10986.jpg", temperament: "聰明、愛交流、互動需求高", care: "使用互動玩具及簡單訓練保持刺激，亦要預留陪伴時間。", note: "牠們常以聲音表達需要，穩定作息有助建立安全感。" },
  { name: "緬因貓", image: "/manus-storage/cat-breed-maine-coon_04b54b92.jpg", temperament: "友善、從容、體型較大", care: "提供足夠承托力的休息處、寬敞動線及適合大貓使用的用品。", note: "梳理時可分區慢慢進行，讓長毛及尾部保持整潔。" },
  { name: "蘇格蘭摺耳貓", image: "/manus-storage/cat-breed-scottish-fold_e91ed246.jpg", temperament: "溫和、好奇、喜歡安靜陪伴", care: "選擇舒適而不需過度跳躍的環境，並定期觀察日常活動狀態。", note: "如發現活動、步態或食慾明顯改變，應向獸醫尋求專業意見。" },
  { name: "俄羅斯藍貓", image: "/manus-storage/cat-breed-russian-blue_53f87bae.jpg", temperament: "文靜、細膩、對熟悉環境有安全感", care: "保持固定作息及安靜的休息角落，互動可由短時間慢慢開始。", note: "穩定的家庭節奏及溫柔接觸通常比頻繁改變更適合牠。" },
  { name: "伯曼貓", image: "/manus-storage/cat-breed-birman_c871a1d5.jpg", temperament: "親和、溫柔、喜歡家庭活動", care: "準備柔軟休息位及適量互動，並以定期梳理維持半長毛狀態。", note: "牠們適合融入家庭日常，但仍需要可獨處的安全角落。" },
  { name: "孟加拉貓", image: "/manus-storage/cat-breed-bengal_67785d72.jpg", temperament: "精力充沛、好動、喜歡挑戰", care: "加入攀爬架、藏食及益智遊戲，讓體力與好奇心有健康出口。", note: "高互動需求的貓咪需要每日安排專注遊戲時間。" },
  { name: "波斯貓", image: "/manus-storage/cat-breed-persian_1b7b6169.jpg", temperament: "安靜、溫柔、喜歡舒適環境", care: "長毛需要每日或隔日溫和梳理，並保持眼周及休息區清潔。", note: "居家環境宜通風、整潔及避免過熱，日常觀察同樣重要。" },
  { name: "異國短毛貓", image: "/manus-storage/cat-breed-exotic-shorthair_b764daf3.jpg", temperament: "親人、悠閒、喜歡穩定陪伴", care: "短毛也要規律梳理，活動以舒適、適量及不過度勉強為原則。", note: "保持飲食、飲水及休息節奏穩定，並留意個體差異。" },
  { name: "阿比西尼亞貓", image: "/manus-storage/cat-breed-abyssinian_d9af4592.jpg", temperament: "敏捷、好奇、喜歡參與家庭活動", care: "提供垂直空間、追逐玩具及輪替遊戲，避免環境過於單調。", note: "以正向互動建立信任，讓牠在探索與休息之間自由選擇。" },
];

export const catCareGuides = [
  { title: "飲食與飲水", body: "按貓咪年齡、體型、活動量及實際需要選擇合適食物，維持清潔飲水位置；轉換食物時宜逐步進行，觀察食慾及排便狀況。" },
  { title: "梳理與日常清潔", body: "短毛貓可定期梳理，長毛貓通常需要更頻密照顧。梳理同時是檢查皮膚、毛髮及身體狀態的好時機，動作應輕柔而循序漸進。" },
  { title: "居家安全", body: "窗戶、露台、電線、細小物件及有毒植物都應納入家居檢查。為貓咪提供安靜的躲藏位、休息位及清晰的活動動線。" },
  { title: "遊戲與環境豐富化", body: "每天安排幾段短時間互動遊戲，輪替逗貓棒、益智玩具、抓板及高低休息位，讓貓咪可以追逐、探索、抓磨及休息。" },
  { title: "貓砂與習慣觀察", body: "貓砂盆應放在安靜、容易到達的位置並保持清潔。留意使用次數、食慾、飲水、活動及情緒變化，持續異常時應諮詢獸醫。" },
  { title: "建立溫柔的陪伴節奏", body: "尊重貓咪選擇接近或暫時退開的需要，以固定作息、低壓互動及正向獎勵建立信任。每隻貓的性格與照顧需要都不一樣，應以個體狀況為準。" },
];
