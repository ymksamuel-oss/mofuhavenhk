export const FLAVOR_TAXONOMY = {
  CHICKEN: [
    "雞", "鶏", "ささみ", "ササミ", "里肌", "砂肝", "雞冠", "とさか", "手羽", "軟骨", "雞肉", "もみじ", "チキン",
  ],
  BEEF: [
    "牛", "ビーフ", "牛骨", "牛すじ", "牛アキレス", "牛タン", "牛舌", "牛ハツ", "牛蹄", "牛大筋", "牛頸筋", "牛食道", "牛肋排", "牛肝",
  ],
  HORSE: [
    "馬", "ホース", "馬肉", "馬蹄筋", "馬皮", "馬肺", "馬すじ", "馬アキレス", "馬背筋", "馬腱",
  ],
  DEER: (name: string, desc = "") => {
    const text = `${name} ${desc}`;
    const hasDeer = /鹿|エゾ鹿|シカ/.test(text);
    const isOnlyKagoshima = /(鹿兒島|鹿児島)/.test(text) && !/(蝦夷鹿|エゾ鹿|日本鹿|鹿肉|鹿骨|鹿角|鹿の)/.test(text);
    return hasDeer && !isOnlyKagoshima;
  },
  PORK: [
    "豚", "豬", "ポーク", "豚肉", "豬肉", "豚耳", "豬耳", "豚気管", "豚食道", "豚ひづめ", "豬蹄", "豚足", "豬腳", "野豬",
  ],
  FISH: [
    "魚", "鮭", "サーモン", "まぐろ", "鮪", "金槍魚", "吞拿魚", "鱈", "たら", "タラ", "かつお", "鰹", "うなぎ", "鰻", "鮫", "鯊魚", "フカヒレ", "真鯛", "鯛", "小鯵", "鯵", "鱧", "なまず", "鯰", "きびなご", "丁香魚", "黍魚", "わかさぎ", "ホタテ", "帆立", "ぶり", "海鮮",
  ],
  LAMB: ["羊", "ラム", "山羊"],
} as const;

export type FlavorTaxonomyKey = keyof typeof FLAVOR_TAXONOMY;

export function matchesFlavorTaxonomy(key: FlavorTaxonomyKey, name: string, description = ""): boolean {
  const entry = FLAVOR_TAXONOMY[key];
  if (typeof entry === "function") return entry(name, description);
  const text = `${name} ${description}`;
  return entry.some((term) => text.includes(term));
}
