export const FLAVOR_TAXONOMY = {
  // 純雞肉類：涵蓋里肌、砂肝（雞胗）、雞冠、雞翼手羽、軟骨、日文ささみ
  CHICKEN: [
    "雞", "鶏", "ささみ", "ササミ", "里肌", "砂肝", "雞冠", "とさか", "手羽", "軟骨", "雞肉", "もみじ", "チキン",
  ],
  // 純牛肉類：涵蓋牛筋、牛蹄、牛舌、牛心、牛食道、牛肋骨、牛肝（排除犛牛芝士）
  BEEF: [
    "牛", "ビーフ", "牛骨", "牛すじ", "牛アキレス", "牛タン", "牛舌", "牛ハツ", "牛蹄", "牛大筋", "牛頸筋", "牛食道", "牛肋排", "牛肝",
  ],
  // 純馬肉類：涵蓋馬蹄筋、馬皮、馬肺、馬背筋、馬腱
  HORSE: [
    "馬", "ホース", "馬肉", "馬蹄筋", "馬皮", "馬肺", "馬すじ", "馬アキレス", "馬背筋", "馬腱",
  ],
  // 野生鹿肉類：需排除產地「鹿兒島」（避免黑豚豬耳或蕃薯被誤歸類）
  DEER: (name: string, desc = "") => {
    const text = `${name} ${desc}`;
    const hasDeer = /鹿|エゾ鹿|シカ/.test(text);
    const isOnlyKagoshima = /(鹿兒島|鹿児島)/.test(text) && !/(蝦夷鹿|エゾ鹿|日本鹿|鹿肉|鹿骨|鹿角|鹿の)/.test(text);
    return hasDeer && !isOnlyKagoshima;
  },
  // 豚肉／豬肉類：涵蓋豬耳、氣管、食道、豬蹄、豬手、野豬
  PORK: [
    "豚", "豬", "ポーク", "豚肉", "豬肉", "豚耳", "豬耳", "豚気管", "豚食道", "豚ひづめ", "豬蹄", "豚足", "豬腳", "野豬",
  ],
  // 海鮮魚類：涵蓋鮭魚、鮪魚／金槍魚、鱈魚、鰹魚／柴魚、鰻魚、鯊魚、鯰魚、丁香魚、白子、扇貝
  FISH: [
    "魚", "鮭", "サーモン", "まぐろ", "鮪", "金槍魚", "吞拿魚", "鱈", "たら", "タラ", "かつお", "鰹", "うなぎ", "鰻", "鮫", "鯊魚", "フカヒレ", "真鯛", "鯛", "小鯵", "鯵", "鱧", "なまず", "鯰", "きびなご", "丁香魚", "黍魚", "わかさぎ", "ホタテ", "帆立", "ぶり", "海鮮",
  ],
  // 羊肉／乳製品類
  LAMB: ["羊", "ラム", "山羊"],
} as const;

export type FlavorTaxonomyKey = keyof typeof FLAVOR_TAXONOMY;

export function matchesFlavorTaxonomy(key: FlavorTaxonomyKey, name: string, description = ""): boolean {
  const entry = FLAVOR_TAXONOMY[key];
  if (typeof entry === "function") return entry(name, description);
  const text = `${name} ${description}`;
  // 「犛牛芝士」是 yak cheese，不能因為字面含「牛」而歸入純牛肉。
  if (key === "BEEF" && /犛牛.*(?:芝士|奶酪|乳酪)|(?:芝士|奶酪|乳酪).*犛牛/.test(text)) return false;
  return entry.some((term) => text.includes(term));
}
