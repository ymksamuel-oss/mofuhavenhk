export type KnowledgeSection = {
  eyebrow: string;
  heading: string;
  body: string;
  bullets?: string[];
};

export type KnowledgeArticle = {
  slug: string;
  category: string;
  readingTime: string;
  title: string;
  excerpt: string;
  cover: string;
  coverAlt: string;
  tags: string[];
  intro: string;
  sections: KnowledgeSection[];
  productSkus: string[];
  cta: string;
};

export const KNOWLEDGE_ARTICLES: readonly KnowledgeArticle[] = [
  {
    slug: "venison-benefits",
    category: "狗狗營養",
    readingTime: "6 分鐘",
    title: "【鹿肉營養】點解日本獸醫極力推介「鹿肉」？低脂防肥、DHA護腦與低敏全解析",
    excerpt: "由低脂高蛋白、天然 DHA 到單一肉源，拆解鹿肉如何成為敏感、絕育與挑食狗狗的日常輪替選擇。",
    cover: "/images/hero-natural-meat.jpg",
    coverAlt: "狗狗享用天然原肉零食",
    tags: ["#低脂低卡", "#DHA護腦", "#過敏犬救星"],
    intro: "鹿肉不是神奇治療品，但在產地透明、配料簡潔和適量餵食的前提下，確實是毛拔麻值得認識的低脂紅肉。對容易增磅、正在做飲食排查，或者想輪替蛋白質的狗狗，鹿肉可以由一小口獎勵開始。",
    sections: [
      { eyebrow: "01 · LEAN & LIGHT", heading: "高蛋白、極低脂：絕育與減肥犬的清爽肉香", body: "鹿肉通常屬於較瘦的紅肉，蛋白質密度高、脂肪相對低。把高油脂零食換成小份量鹿肉乾，有助毛拔麻更容易控制每日熱量；不過零食仍要計入總攝取，不能因為低脂就無上限餵食。" },
      { eyebrow: "02 · BRAIN & COAT", heading: "天然 DHA 與高鐵質：由腦部到毛色的日常支援", body: "DHA 與鐵質是鹿肉常被討論的營養亮點，但真正重要的是整體配方與攝取量。鹿肉零食可作為日常獎勵或拌糧點綴，不應取代完整主食，也不要把一般營養支持誇大成治療效果。" },
      { eyebrow: "03 · SINGLE PROTEIN", heading: "低敏單一肉源：讓飲食排查更容易觀察", body: "選擇單一肉源、配料表簡潔的鹿肉零食，較容易記錄狗狗在觀察期的反應。低敏不等於零過敏；若有持續抓癢、紅疹或腸胃症狀，應先由獸醫排查。", bullets: ["看清完整配料表", "轉換時慢慢增加份量", "記錄便便、皮膚與精神狀態"] },
      { eyebrow: "04 · JAPAN CHECKLIST", heading: "日本專家式挑選標準：產地透明、無鉛檢驗、100%無添加", body: "野生鹿肉更要重視來源管理與檢驗資訊。優先選擇清楚標示製造國、原料來源、檢驗標準及保存方式的品牌，配料越簡潔，越有助毛拔麻持續觀察毛孩反應。" },
    ],
    productSkus: ["4976064026545", "4976064026743", "4976064025081"],
    cta: "由一小口安心鹿肉開始",
  },
  {
    slug: "picky-eater-toppings",
    category: "挑食對策",
    readingTime: "5 分鐘",
    title: "【挑食對策】狗狗乾糧食厭咗？日本流行的「4重拌糧伴侶」秘訣與食譜",
    excerpt: "不靠重口味醬汁，從肉香、魚鮮、蔬果與芝士四個層次，打造更有吸引力的日常拌糧方法。",
    cover: "/images/hero-natural-meat.jpg",
    coverAlt: "天然肉類拌糧概念",
    tags: ["#挑食救星", "#日本拌糧", "#低負擔食譜"],
    intro: "狗狗突然對乾糧失去興趣，未必只是「扭計」；牙齒、腸胃、壓力、零食比例和食物新鮮度都可能有關。日本毛拔麻常用的拌糧思路，是用少量、清晰、可追蹤的配料增加香氣，而不是每餐無限加料。",
    sections: [
      { eyebrow: "01 · MEAT", heading: "第一重：純肉香，先喚醒食慾", body: "以純雞肉碎、鹿肉或馬肉等單一肉源作少量 topping，先讓狗狗聞到熟悉肉香。建議由一茶匙開始，觀察便便和食慾，不要同時更換主糧。" },
      { eyebrow: "02 · SEAFOOD", heading: "第二重：魚鮮與天然脂香", body: "黑鮪魚、柴魚等魚介 topping 能增加香氣和口感，但要留意鹽分與配料。魚鮮只是點綴，不應取代均衡主食，亦要配合狗狗本身的敏感狀況。" },
      { eyebrow: "03 · PLANT", heading: "第三重：蔬果粉的柔和甜香", body: "少量天然蔬果粉可提供不同氣味層次。挑選時看清是否含糖、洋蔥、蒜頭或其他不適合狗狗的成分，並以簡潔配方為先。" },
      { eyebrow: "04 · RECIPE", heading: "第四重：芝士粉的香濃收尾", body: "芝士粉適合用「灑」而不是「倒」的方式。可以試試下面這個四重拌糧比例：每餐主糧上加入肉碎 1 茶匙、魚鮮少許、蔬果粉半茶匙、芝士粉一小撮，再加溫水拌勻。", bullets: ["每次只改一項，方便找出真正有效的香氣", "零食與 topping 建議控制在每日熱量一成內", "持續拒食或伴隨嘔吐、腹瀉，應盡快諮詢獸醫"] },
    ],
    productSkus: ["MOFU-BUNDLE-PICKY-01", "4976064024251", "4976064024893"],
    cta: "把每一餐變成期待的香氣",
  },
  {
    slug: "can-cats-eat-dog-food",
    category: "貓咪健康",
    readingTime: "5 分鐘",
    title: "【貓咪健康】貓咪可唔可以食狗糧？解開「牛磺酸缺乏」的致命飲食真相",
    excerpt: "偶爾偷食與長期主食完全不同：了解貓狗營養需求差異，為貓咪守住牛磺酸與完整營養底線。",
    cover: "/images/mofu-visuals/category-cat-food.jpg",
    coverAlt: "貓咪專屬食物與營養",
    tags: ["#貓咪營養", "#牛磺酸", "#貓狗分糧"],
    intro: "貓咪偶爾偷食一兩粒狗糧，通常不代表立即中毒；真正需要重視的是長期用狗糧代替貓糧。貓咪是絕對肉食動物，對牛磺酸、維生素 A、花生四烯酸等營養有更特定的需求。",
    sections: [
      { eyebrow: "01 · THE SHORT ANSWER", heading: "偶爾一兩粒可以，長期當主食不可以", body: "狗糧是按狗狗需要設計，未必提供貓咪足夠的牛磺酸與其他貓咪必需營養。偶爾誤食與長期替代是兩回事；家中多寵物應分開放置主食碗。" },
      { eyebrow: "02 · TAURINE", heading: "牛磺酸不足，為何是貓咪的關鍵風險？", body: "牛磺酸參與貓咪的視網膜、心臟及膽汁酸功能。長期不足可能造成嚴重健康問題，而且早期未必容易從外觀察覺，所以不應以狗糧作為貓咪日常主食。" },
      { eyebrow: "03 · SNACK SMART", heading: "如果想獎勵貓咪，應選貓咪專屬小食", body: "挑選標示給貓咪使用、配料清晰的魚肉薄片或雞肉零食，份量小而頻率低。新零食要逐少加入，並留意鹽分、油脂和是否影響正餐。", bullets: ["主食以完整均衡貓糧為主", "零食不是營養補充品的替代", "持續不吃、嘔吐或精神差要立即求醫"] },
      { eyebrow: "04 · HOME SETUP", heading: "多貓多狗家庭的實用分糧方法", body: "把貓碗放在狗狗難以接觸的高處，定時收起剩餘食物，並為每隻毛孩建立自己的餵食紀錄。簡單的環境管理，往往比事後擔心更有效。" },
    ],
    productSkus: ["4976064013897", "4976064024725", "4976064024688"],
    cta: "為貓咪揀真正適合的專屬小食",
  },
  {
    slug: "hypoallergenic-red-meat",
    category: "低敏指南",
    readingTime: "6 分鐘",
    title: "【低敏指南】告別抓癢紅疹！羊肉與低敏紅肉如何拯救敏感毛孩",
    excerpt: "從排查飲食、單一蛋白到安全轉糧，了解紅肉輪替如何幫助毛拔麻更有系統地觀察敏感反應。",
    cover: "/images/hero-sleeping-shiba-taupe.jpg",
    coverAlt: "安靜休息中的狗狗",
    tags: ["#低敏飲食", "#單一蛋白", "#紅肉輪替"],
    intro: "抓癢與紅疹背後可能有很多原因，包括環境、寄生蟲、皮膚屏障和食物反應。紅肉不是萬能解藥，但以單一蛋白、簡潔配方配合獸醫排查，可以令毛拔麻更容易找到適合毛孩的輪替路線。",
    sections: [
      { eyebrow: "01 · NEW PROTEIN", heading: "為何有人會由雞肉轉向羊肉、鹿肉或馬肉？", body: "當狗狗長期接觸同一種蛋白質，毛拔麻可能希望在專業指導下引入較少見的肉源。重點不是某一款肉必然低敏，而是配方單純、紀錄完整，並給予足夠觀察時間。" },
      { eyebrow: "02 · READ THE LABEL", heading: "配料表比包裝上的「低敏」更值得看", body: "檢查零食是否同時混有雞油、牛肉香料、乳製品或多種肉類。對正在進行排查的狗狗，越簡潔的配料越容易理解；若標籤不清楚，就不適合作為排查期的第一選擇。" },
      { eyebrow: "03 · SLOW SWITCH", heading: "安全轉換：一次只加入一個變數", body: "先維持原有主食，只加入少量新零食；觀察皮膚、耳朵、便便與精神狀況。若症狀持續或惡化，應停止自行試驗並交由獸醫判斷。", bullets: ["不要同時換糧、換洗毛液和換零食", "用手機記錄日期、份量和身體反應", "嚴重紅腫、呼吸異常或反覆嘔吐需即時求醫"] },
      { eyebrow: "04 · DAILY CARE", heading: "低敏日常的核心，是穩定而不是不停試新款", body: "找到狗狗能接受的完整主食和零食後，維持一段穩定期，避免因為一時新鮮而頻繁更換。穩定紀錄，才是長期照顧敏感毛孩最可靠的工具。" },
    ],
    productSkus: ["4976064025623", "4976064026545", "4976064025791"],
    cta: "從清晰配料的紅肉小食開始",
  },
  {
    slug: "soft-vs-hard-treats",
    category: "安全餵食",
    readingTime: "5 分鐘",
    title: "【安全餵食】薄花 vs 耐嚼硬骨？幼犬、成犬與高齡犬的零食硬度挑選指南",
    excerpt: "同一款零食未必適合所有年齡：由牙齒、咬合力到吞嚥習慣，教你按生命階段挑選安全口感。",
    cover: "/images/hero-dental-chew.jpg",
    coverAlt: "狗狗潔齒耐咬零食",
    tags: ["#安全餵食", "#幼犬指南", "#潔齒耐咬"],
    intro: "挑零食不能只看「耐咬」兩個字。幼犬牙齒未成熟、高齡犬可能有牙周問題，而成犬也有狼吞虎嚥的個體差異；零食硬度要配合年齡、牙齒狀況和主人全程監察。",
    sections: [
      { eyebrow: "01 · SOFT & THIN", heading: "薄花、薄片：適合訓練與小口獎勵", body: "薄片或容易撕開的肉乾，較容易分成小份，適合訓練和需要控制熱量的毛孩。餵食時仍要按大小剪開，避免狗狗整片吞下。" },
      { eyebrow: "02 · CHEWING POWER", heading: "耐嚼硬骨：給咬力成熟、牙齒健康的成犬", body: "牛蹄、牛大筋或犛牛芝士棒等硬身產品，需要狗狗慢慢啃咬，而不是用力咬斷後吞食。主人要觀察磨損狀況，出現尖銳碎片、過細或裂開就應立即丟棄。" },
      { eyebrow: "03 · LIFE STAGE", heading: "幼犬、成犬、高齡犬：三種硬度思路", body: "幼犬以柔軟、可分割為先；成犬按咬力挑選中等至耐嚼產品；高齡犬或有牙齒問題的狗狗則應回到薄片、濕潤或獸醫建議的口感。", bullets: ["幼犬：避免極硬骨頭與大塊吞食", "成犬：全程監察、提供清水", "高齡犬：先檢查牙齒，再決定硬度"] },
      { eyebrow: "04 · SAFE ROUTINE", heading: "安全餵食的最後一步：份量與監察", body: "零食總量應控制在每日熱量的一成左右，餵食時不要離開現場。即使包裝寫著耐咬，也要按照狗狗實際咬合力和吞嚥習慣作調整。" },
    ],
    productSkus: ["4976064025210", "4976064025333", "4976064025661"],
    cta: "按毛孩年齡揀對口感",
  },
];

export function getKnowledgeArticle(slug: string): KnowledgeArticle | undefined {
  return KNOWLEDGE_ARTICLES.find((article) => article.slug === slug);
}
