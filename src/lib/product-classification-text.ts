/**
 * Minimal, purpose-built Simplified → Traditional normalization for catalog
 * classification. It deliberately covers category-bearing product vocabulary
 * only; storefront display copy remains authored in its original language unless
 * explicitly corrected in Stripe metadata.
 */
const CLASSIFICATION_ALIASES: ReadonlyArray<readonly [string, string]> = [
  ["狗狗冻干食品", "狗狗冷凍脫水食品"],
  ["狗狗凍乾食品", "狗狗冷凍脫水食品"],
  ["猫冻干", "冷凍脫水系列"],
  ["貓冻干", "冷凍脫水系列"],
  ["猫凍乾", "冷凍脫水系列"],
  ["冷冻脱水", "冷凍脫水"],
  ["冻干", "凍乾"],
  ["猫咪", "貓咪"],
  ["猫猫", "貓貓"],
  ["猫用", "貓用"],
  ["猫砂", "貓砂"],
  ["猫罐头", "貓罐頭"],
  ["猫罐", "貓罐"],
  ["猫粮", "貓糧"],
  ["干粮", "乾糧"],
  ["湿粮", "濕糧"],
  ["湿食", "濕食"],
  ["罐头", "罐頭"],
  ["零食", "零食"],
  ["宠物", "寵物"],
  ["小动物", "小動物"],
  ["小宠物", "小寵物"],
  ["仓鼠", "倉鼠"],
  ["龙猫", "龍貓"],
  ["荷兰猪", "荷蘭豬"],
  ["刺猬", "刺蝟"],
  ["飞鼠", "飛鼠"],
  ["厕所", "廁所"],
  ["尿垫", "尿墊"],
  ["清洁", "清潔"],
  ["营养", "營養"],
  ["训练", "訓練"],
  ["护理", "護理"],
  ["护", "護"],
  ["牵引", "牽引"],
  ["颈圈", "頸圈"],
  ["笼舍", "籠舍"],
  ["睡窝", "睡窩"],
  ["热卖", "熱賣"],
  ["优惠", "優惠"],
  ["猫", "貓"],
  ["粮", "糧"],
  ["湿", "濕"],
  ["冻", "凍"],
  ["脱", "脫"],
  ["头", "頭"],
  ["垫", "墊"],
  ["宠", "寵"],
  ["笼", "籠"],
  ["窝", "窩"],
  ["龙", "龍"],
  ["兰", "蘭"],
  ["猬", "蝟"],
  ["飞", "飛"],
  ["厕", "廁"],
  ["洁", "潔"],
  ["营", "營"],
  ["训", "訓"],
  ["练", "練"],
  ["颈", "頸"],
  ["牵", "牽"],
  ["卖", "賣"],
  ["优", "優"],
  ["鸡", "雞"],
  ["饭", "飯"],
];

/**
 * Normalize only text used for catalog routing and keyword matching.
 * The function is idempotent and leaves unrelated Simplified display text alone.
 */
export function normalizeProductClassificationText(value: string | undefined): string {
  if (!value) return "";
  return CLASSIFICATION_ALIASES.reduce(
    (text, [simplified, traditional]) => text.replaceAll(simplified, traditional),
    value,
  );
}
