import type { Locale } from "@/lib/i18n/translations";
import type { Product } from "@/lib/products";

const NAME_REPLACEMENTS: Array<[string, string]> = [
  ["One Touch盒裝糊仔小食", "One Touch Boxed Puree"],
  ["CIAO糊仔小食", "CIAO Puree Treats"],
  ["糊仔小食 4條裝", "Puree Treats (4 Sticks)"],
  ["4條裝糊仔", "Puree Treats (4 Sticks)"],
  ["護臟系肉泥小食", "Organ Care Puree Treats"],
  ["抑制血糖肉泥小食", "Blood Sugar Care Puree"],
  ["乳酸菌肉泥", "Lactic Acid Bacteria Puree"],
  ["烤鰹魚 & 木魚乾", "Grilled Bonito & Dried Bonito"],
  ["烤鰹魚 & 蟹肉", "Grilled Bonito & Crab Meat"],
  ["鰹魚 海鮮綜合味", "Bonito Seafood Medley"],
  ["雞肉 海鮮綜合味", "Chicken Seafood Medley"],
  ["白肉金槍魚", "White Meat Tuna"],
  ["金鮪魚味", "Gold Tuna Flavor"],
  ["雞肉帆立貝", "Chicken & Scallop"],
  ["帆立貝味", "Scallop Flavor"],
  ["下部尿路配方", "Lower Urinary Tract Care"],
  ["1歲前幼貓用", "For Kittens under 1 Year"],
  ["1歲前食用", "For Kittens under 1 Year"],
  ["腸內環境", "Gut Health Care"],
  ["低脂肪", "Low Fat"],
  ["狗罐頭", "Dog Can"],
  ["貓罐頭", "Cat Can"],
  ["罐頭", "Cat Can"],
  ["雞肉", "Chicken"],
];

function translateChineseName(name: string): string {
  let translated = name;
  for (const [source, target] of NAME_REPLACEMENTS) translated = translated.replaceAll(source, target);
  return translated
    .replaceAll("（", " (")
    .replaceAll("）", ")")
    .replaceAll("－", "-")
    .replaceAll("–", "-")
    .replaceAll("　", " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function getLocalizedProductName(product: Product, locale: Locale): string {
  if (locale !== "en") return product.name.zh || product.name.en || "商品";
  const explicitEnglish = product.name.en?.trim();
  if (explicitEnglish && explicitEnglish !== product.name.zh?.trim()) return explicitEnglish;
  return translateChineseName(product.name.zh || explicitEnglish || "Product");
}
