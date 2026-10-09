/**
 * Shared meat-source taxonomy used by ingredient filters and collection logic.
 * Keep these expressions deliberately inclusive of product cuts and Japanese names.
 */
export const PRODUCT_MEAT_FAMILY_PATTERNS = {
  PORK: /(?:黑豚|豚(?:肉|耳|蹄|骨|腳|足|皮|舌|心)?|(?<!野)豬(?:肉|耳|喉|蹄|腳|頸|氣管|食道|肋|肝|皮|骨)|\bpork\b|\bswine\b|\bpig\s+(?:meat|ear|ears|trotter|skin|rib|ribs)\b)/i,
  BOAR: /(?:野豬(?:肉|耳|骨|肋)?|\bwild\s+boar\b|\bboar\b)/i,
  HORSE: /(?:馬|马|馬肉|馬蹄筋|馬筋|馬背筋|馬肺|馬肉脆片|馬肉棒|馬皮|馬骨|馬腱|ホース|\bhorse(?:\s+meat)?\b)/i,
  VENISON: /(?:蝦夷鹿|エゾ鹿|(?:野生|天然)?鹿(?!兒島|儿岛)(?:肉|肋排|骨|角|肩胛|脊骨|原肉|排骨|扒|筋)?|日本鹿|\bvenison\b|\bdeer\b)/i,
  BEEF: /(?:牛|ビーフ|牛肉|牛大筋|牛蹄|牛肋排|牛舌|牛心|牛皮|牛骨|牛筋|牛食道|牛肝|牛頸|\bbeef\b|\bbull\b)/i,
  CHICKEN: /(?:雞|鸡|鶏|雞肉|雞肉碎|雞胸|雞肝|雞胗|雞砂肝|雞里肌|里肌|雞腳|雞冠|雞軟骨|雞手羽|ささみ|砂肝|\bchicken\b)/i,
  LAMB: /(?:羊肉|羊骨|羊肋|羊肺|羔羊|小羊|ラム(?:肉)?|\blamb\b|\bsheep\b)/i,
  GOAT: /(?:山羊(?:肉|奶|乳)?|\bgoat(?:\s+meat)?\b)/i,
  DUCK: /(?:鴨(?:肉|胸|腿|肝)?|鸭(?:肉|胸|腿|肝)?|カモ|\bduck\b)/i,
  KANGAROO: /(?:袋鼠(?:肉)?|カンガルー|\bkangaroo\b)/i,
  FISH: /(?:魚|鱼|魚類|魚肉|魚介|金槍魚|吞拿魚|黑鮪魚|鮪魚|鰹魚|小魚乾|鯊魚|柴魚|マグロ|かつお|三文魚|鮭|鱈|鯖|鯛|鰻|鱧|\bfish\b|\btuna\b|\bbonito\b|\bsalmon\b|\bcod\b|\bshark\b|\bseafood\b)/i,
} as const;

export type ProductMeatFamily = keyof typeof PRODUCT_MEAT_FAMILY_PATTERNS;
