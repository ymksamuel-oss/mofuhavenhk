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
  const description = brand.description?.trim();
  return description && !/[\u3400-\u9fff]/.test(description)
    ? description
    : `Curated Japanese pet food and everyday essentials from ${brand.name}.`;
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
  if (key === "ciao") return { displayName: "CIAO (チャオ)", origin: "🇯🇵 \u65e5\u672c\u539f\u88dd\u76f4\u9001", audience: "🐱 \u8c93\u54aa\u5c08\u7528", specialty: "\u4eba\u985e\u98df\u7528\u7d1a\u539f\u6599・\u7d30\u7dfb\u7f8e\u5473", introduction: "CIAO \u662f\u65e5\u672c Inaba \u65d7\u4e0b\u6df1\u53d7\u8c93\u5974\u559c\u611b\u7684\u5bf5\u7269\u98df\u54c1\u54c1\u724c，\u9577\u5e74\u5c08\u6ce8\u65bc\u8c93\u54aa\u7f50\u982d、\u8089\u6ce5\u8207\u65e5\u5e38\u96f6\u98df。\u54c1\u724c\u5805\u6301\u56b4\u9078\u539f\u6599\u8207\u7d30\u81a9\u53e3\u611f，\u8b93\u6bcf\u65e5\u9935\u98df\u90fd\u6210\u70ba\u5b89\u5fc3\u53c8\u5e78\u798f\u7684\u6642\u5149。" };
  if (key === "inaba") return { displayName: "INABA (いなば)", origin: "🇯🇵 \u65e5\u672c\u54c1\u724c", audience: "🐱🐶 \u5168\u9f61\u8c93\u72d7", specialty: "\u5929\u7136\u98df\u6750・\u5b89\u5fc3\u914d\u65b9", introduction: "INABA \u5275\u7acb\u65bc\u65e5\u672c，\u6191\u85c9\u5c0d\u98df\u6750\u8207\u88fd\u9020\u54c1\u8cea\u7684\u5805\u6301，\u6210\u70ba\u4e9e\u6d32\u5bb6\u5ead\u719f\u6089\u7684\u5bf5\u7269\u98df\u54c1\u54c1\u724c。\u5f9e\u6fd5\u7ce7\u5230\u71df\u990a\u96f6\u98df，\u7522\u54c1\u91cd\u8996\u9069\u53e3\u6027\u8207\u65e5\u5e38\u88dc\u6c34，\u966a\u4f34\u6bdb\u5b69\u5065\u5eb7\u6210\u9577。" };
  if (key === "combo") return { displayName: "COMBO (コンボ)", origin: "🇯🇵 \u65e5\u672c\u539f\u88dd\u76f4\u9001", audience: "🐱🐶 \u5168\u9f61\u8c93\u72d7", specialty: "\u5747\u8861\u71df\u990a・\u65e5\u5e38\u8b77\u7406", introduction: "COMBO \u662f\u65e5\u672c\u5bb6\u5ead\u5e38\u898b\u7684\u5bf5\u7269\u4e3b\u98df\u8207\u96f6\u98df\u54c1\u724c，\u8457\u91cd\u5747\u8861\u71df\u990a\u548c\u6bdb\u5b69\u6bcf\u5929\u90fd\u9858\u610f\u4eab\u7528\u7684\u98a8\u5473。\u54c1\u724c\u4ee5\u7a69\u5b9a\u54c1\u8cea\u53ca\u5be6\u7528\u914d\u65b9，\u7167\u9867\u8c93\u72d7\u4e0d\u540c\u6210\u9577\u968e\u6bb5\u7684\u9700\u8981。" };
  if (key === "doggyman") return { displayName: "DoggyMan (ドギーマン)", origin: "🇯🇵 \u65e5\u672c\u54c1\u724c", audience: "🐶 \u72d7\u72d7\u5c08\u7528", specialty: "\u5bf5\u7269\u96f6\u98df・\u751f\u6d3b\u7528\u54c1", introduction: "DoggyMan \u9577\u5e74\u6df1\u8015\u65e5\u672c\u5bf5\u7269\u751f\u6d3b\u5e02\u5834，\u5f9e\u72d7\u72d7\u96f6\u98df\u5230\u65e5\u5e38\u7528\u54c1\u90fd\u4ee5\u5b89\u5168、\u597d\u7528\u548c\u5bb9\u6613\u878d\u5165\u5bb6\u5ead\u70ba\u6838\u5fc3。\u54c1\u724c\u719f\u6089\u6bdb\u5b69\u7684\u751f\u6d3b\u7fd2\u6163，\u63d0\u4f9b\u591a\u5143\u800c\u8cbc\u5fc3\u7684\u65e5\u5e38\u9078\u64c7。" };
  if (key === "d.b.f") return { displayName: "d.b.f (デビフ)", origin: "🇯🇵 \u65e5\u672c\u539f\u88dd\u76f4\u9001", audience: "🐶 \u72d7\u72d7\u5c08\u7528", specialty: "\u71df\u990a\u88dc\u7d66・\u4e0b\u90e8\u5c3f\u8def\u914d\u65b9", introduction: "d.b.f \u662f\u65e5\u672c\u5c08\u6ce8\u72ac\u7528\u98df\u54c1\u7684\u54c1\u724c，\u91cd\u8996\u4e0d\u540c\u5e74\u9f61\u8207\u9ad4\u8cea\u72d7\u72d7\u7684\u71df\u990a\u9700\u6c42。\u65d7\u4e0b\u6fd5\u7ce7\u53ca\u71df\u990a\u88dc\u7d66\u914d\u65b9\u8b1b\u7a76\u98df\u6750\u6bd4\u4f8b，\u8b93\u4e3b\u4eba\u80fd\u70ba\u6bdb\u5b69\u9078\u64c7\u66f4\u5408\u9069\u7684\u65e5\u5e38\u7167\u8b77。" };
  return { displayName: brand.name, origin: "🇯🇵 \u65e5\u672c\u76f4\u9001\u6b63\u8ca8", audience: "🐱🐶 \u8c93\u72d7\u9069\u7528", specialty: "\u56b4\u9078\u914d\u65b9・\u5b89\u5fc3\u54c1\u8cea", introduction: brandDescription(brand) };
}

export function brandProfileLocalized(brand: Brand, locale: BrandLocale): BrandProfile {
  if (locale === "zh") return brandProfile(brand);
  const key = brand.name.trim().toLocaleLowerCase();
  if (key === "ciao") return { displayName: "CIAO", origin: "🇯🇵 Direct from Japan", audience: "🐱 Cat Only", specialty: "Human-grade ingredients · Irresistible taste", introduction: "CIAO is Japan's renowned pet treat brand by INABA, celebrated for high-palatability purees and holistic wellness recipes that pets love." };
  if (key === "inaba") return { displayName: "INABA", origin: "🇯🇵 Japanese brand", audience: "🐱🐶 All Life Stages", specialty: "Natural ingredients · Reliable recipes", introduction: "INABA is a trusted Japanese pet food brand known for carefully selected ingredients, enjoyable textures and everyday recipes that help pets stay happy and well hydrated." };
  if (key === "combo") return { displayName: "COMBO", origin: "🇯🇵 Direct from Japan", audience: "🐱🐶 All Life Stages", specialty: "Balanced Nutrition · Daily Care", introduction: "COMBO is a popular Japanese pet food brand known for balanced daily meals and treats, carefully crafted to satisfy taste while supporting pets across every stage of growth." };
  if (key === "doggyman") return { displayName: "DoggyMan", origin: "🇯🇵 Japanese brand", audience: "🐶 Dog Only", specialty: "Treats · Lifestyle supplies", introduction: "DoggyMan offers high-quality treats and lifestyle supplies crafted in Japan to bring comfort and vitality to your dogs." };
  if (key === "d.b.f") return { displayName: "d.b.f", origin: "🇯🇵 Direct from Japan", audience: "🐶 Dog Only", specialty: "Nutritional support · Urinary care recipes", introduction: "d.b.f is a Japanese dog food brand focused on thoughtful nutrition for different ages and lifestyles, with wet food and supplement recipes made for everyday care." };
  return { displayName: brand.name, origin: "🇯🇵 Direct from Japan", audience: "🐱🐶 Cats & dogs", specialty: "Carefully selected · Reliable quality", introduction: "Carefully selected genuine Japanese brand, dedicated to providing high-quality and reliable daily meals and delicious treats for your beloved pets." };
}
