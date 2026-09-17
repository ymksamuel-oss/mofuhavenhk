export type Brand = {
  id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  description?: string | null;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
};

export type BrandProfile = {
  displayName: string;
  origin: string;
  audience: string;
  specialty: string;
  introduction: string;
};

export type BrandLocale = "zh" | "ja" | "en";

export function brandHref(slug: string): string {
  return `/brand/${encodeURIComponent(slug)}`;
}

export function brandDescription(brand: Brand): string {
  return brand.description?.trim() || `探索 ${brand.name} 的日本直送寵物食品及用品。`;
}

export function normalizeBrandSlug(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-").replace(/^-+|-+$/g, "");
}

const CORE_BRANDS = ["CIAO", "COMBO", "DoggyMan", "d.b.f", "Inaba"] as const;

export function getCoreBrands(brands: Brand[]): Brand[] {
  return CORE_BRANDS.flatMap((coreName) => {
    const matches = brands.filter((brand) => {
      const name = brand.name.trim().toLocaleLowerCase();
      const core = coreName.toLocaleLowerCase();
      return name === core || name.startsWith(`${core} `) || name.startsWith(`${core}-`) || name.startsWith(`${core}/`);
    });
    const first = matches.sort((a, b) => {
      const aExact = a.name.trim().toLocaleLowerCase() === coreName.toLocaleLowerCase();
      const bExact = b.name.trim().toLocaleLowerCase() === coreName.toLocaleLowerCase();
      if (aExact !== bExact) return aExact ? -1 : 1;
      return a.sort_order - b.sort_order;
    })[0];
    return first ? [first] : [];
  });
}

export function brandProfile(brand: Brand): BrandProfile {
  const key = brand.name.trim().toLocaleLowerCase();
  if (key === "ciao") return { displayName: "CIAO (チャオ)", origin: "🇯🇵 日本原裝直送", audience: "🐱 貓咪專用", specialty: "人類食用級原料・細緻美味", introduction: "CIAO 是日本 Inaba 旗下深受貓奴喜愛的寵物食品品牌，長年專注於貓咪罐頭、肉泥與日常零食。品牌堅持嚴選原料與細膩口感，讓每日餵食都成為安心又幸福的時光。" };
  if (key === "inaba") return { displayName: "INABA (いなば)", origin: "🇯🇵 日本品牌", audience: "🐱🐶 全齡貓狗", specialty: "天然食材・安心配方", introduction: "INABA 創立於日本，憑藉對食材與製造品質的堅持，成為亞洲家庭熟悉的寵物食品品牌。從濕糧到營養零食，產品重視適口性與日常補水，陪伴毛孩健康成長。" };
  if (key === "combo") return { displayName: "COMBO (コンボ)", origin: "🇯🇵 日本原裝直送", audience: "🐱🐶 全齡貓狗", specialty: "均衡營養・日常護理", introduction: "COMBO 是日本家庭常見的寵物主食與零食品牌，著重均衡營養和毛孩每天都願意享用的風味。品牌以穩定品質及實用配方，照顧貓狗不同成長階段的需要。" };
  if (key === "doggyman") return { displayName: "DoggyMan (ドギーマン)", origin: "🇯🇵 日本品牌", audience: "🐶 狗狗專用", specialty: "寵物零食・生活用品", introduction: "DoggyMan 長年深耕日本寵物生活市場，從狗狗零食到日常用品都以安全、好用和容易融入家庭為核心。品牌熟悉毛孩的生活習慣，提供多元而貼心的日常選擇。" };
  if (key === "d.b.f") return { displayName: "d.b.f (デビフ)", origin: "🇯🇵 日本原裝直送", audience: "🐶 狗狗專用", specialty: "營養補給・下部尿路配方", introduction: "d.b.f 是日本專注犬用食品的品牌，重視不同年齡與體質狗狗的營養需求。旗下濕糧及營養補給配方講究食材比例，讓主人能為毛孩選擇更合適的日常照護。" };
  return { displayName: brand.name, origin: "🇯🇵 日本直送正貨", audience: "🐱🐶 貓狗適用", specialty: "嚴選配方・安心品質", introduction: brandDescription(brand) };
}

export function brandProfileLocalized(brand: Brand, locale: BrandLocale): BrandProfile {
  if (locale === "zh") return brandProfile(brand);
  const key = brand.name.trim().toLocaleLowerCase();
  if (locale === "ja") {
    if (key === "ciao") return { displayName: "CIAO（チャオ）", origin: "🇯🇵 日本から直送", audience: "🐱 猫ちゃん向け", specialty: "人間用食材・抜群のおいしさ", introduction: "CIAOは日本のいなばが展開する人気のペットフードブランドです。猫ちゃんが喜ぶなめらかなペーストや、毎日の食事にぴったりなレシピをお届けします。" };
    if (key === "inaba") return { displayName: "INABA（いなば）", origin: "🇯🇵 日本ブランド", audience: "🐱🐶 全年齢対応", specialty: "天然素材・安心レシピ", introduction: "INABAは素材選びと製造品質にこだわる日本のペットフードブランドです。ウェットフードから栄養おやつまで、毎日の健康と水分補給をサポートします。" };
    if (key === "combo") return { displayName: "COMBO（コンボ）", origin: "🇯🇵 日本から直送", audience: "🐱🐶 全年齢対応", specialty: "バランス栄養・毎日のケア", introduction: "COMBOは日本の家庭で親しまれているペットフードブランドです。バランスのよい主食とおやつで、成長段階に合わせた毎日の食事を支えます。" };
    if (key === "doggyman") return { displayName: "DoggyMan（ドギーマン）", origin: "🇯🇵 日本ブランド", audience: "🐶 わんちゃん向け", specialty: "おやつ・ペット用品", introduction: "DoggyManは日本のペットライフを長く支えてきたブランドです。安全性と使いやすさにこだわったおやつや日用品を取り揃えています。" };
    if (key === "d.b.f") return { displayName: "d.b.f（デビフ）", origin: "🇯🇵 日本から直送", audience: "🐶 わんちゃん向け", specialty: "栄養サポート・下部尿路ケア", introduction: "d.b.fは年齢や体質に合わせた犬用フードを提案する日本ブランドです。毎日の健康管理に役立つウェットフードと栄養補給レシピをお届けします。" };
    return { displayName: brand.name, origin: "🇯🇵 日本正規品", audience: "🐱🐶 猫ちゃん・わんちゃん向け", specialty: "厳選レシピ・安心品質", introduction: brand.name + "の日本直送ペットフードと用品を厳選してお届けします。" };
  }
  if (key === "ciao") return { displayName: "CIAO (チャオ)", origin: "🇯🇵 Direct from Japan", audience: "🐱 Cat Only", specialty: "Human-grade ingredients · Irresistible taste", introduction: "CIAO is Japan's renowned pet treat brand by INABA, celebrated for high-palatability purees and holistic wellness recipes that pets love." };
  if (key === "inaba") return { displayName: "INABA (いなば)", origin: "🇯🇵 Japanese brand", audience: "🐱🐶 All Life Stages", specialty: "Natural ingredients · Reliable recipes", introduction: "INABA is a trusted Japanese pet food brand known for carefully selected ingredients, enjoyable textures and everyday recipes that help pets stay happy and well hydrated." };
  if (key === "combo") return { displayName: "COMBO (コンボ)", origin: "🇯🇵 Direct from Japan", audience: "🐱🐶 All Life Stages", specialty: "Balanced Nutrition · Daily Care", introduction: "COMBO is a popular Japanese pet food brand known for balanced daily meals and treats, carefully crafted to satisfy taste while supporting pets across every stage of growth." };
  if (key === "doggyman") return { displayName: "DoggyMan (ドギーマン)", origin: "🇯🇵 Japanese brand", audience: "🐶 Dog Only", specialty: "Treats · Lifestyle supplies", introduction: "DoggyMan offers high-quality treats and lifestyle supplies crafted in Japan to bring comfort and vitality to your dogs." };
  if (key === "d.b.f") return { displayName: "d.b.f (デビフ)", origin: "🇯🇵 Direct from Japan", audience: "🐶 Dog Only", specialty: "Nutritional support · Urinary care recipes", introduction: "d.b.f is a Japanese dog food brand focused on thoughtful nutrition for different ages and lifestyles, with wet food and supplement recipes made for everyday care." };
  return { displayName: brand.name, origin: "🇯🇵 Direct from Japan", audience: "🐱🐶 Cats & dogs", specialty: "Carefully selected · Reliable quality", introduction: "Carefully selected genuine Japanese brand, dedicated to providing high-quality and reliable daily meals and delicious treats for your beloved pets." };
}
