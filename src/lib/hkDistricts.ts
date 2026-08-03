/** Common HK districts — stored value is Chinese; labels switch with locale. */
export const HK_DISTRICTS = [
  { zh: "中西區", en: "Central and Western" },
  { zh: "灣仔", en: "Wan Chai" },
  { zh: "東區", en: "Eastern" },
  { zh: "南區", en: "Southern" },
  { zh: "油尖旺", en: "Yau Tsim Mong" },
  { zh: "深水埗", en: "Sham Shui Po" },
  { zh: "九龍城", en: "Kowloon City" },
  { zh: "黃大仙", en: "Wong Tai Sin" },
  { zh: "觀塘", en: "Kwun Tong" },
  { zh: "荃灣", en: "Tsuen Wan" },
  { zh: "葵青", en: "Kwai Tsing" },
  { zh: "屯門", en: "Tuen Mun" },
  { zh: "元朗", en: "Yuen Long" },
  { zh: "北區", en: "North" },
  { zh: "大埔", en: "Tai Po" },
  { zh: "沙田", en: "Sha Tin" },
  { zh: "西貢", en: "Sai Kung" },
  { zh: "離島", en: "Islands" },
] as const;

export type HkDistrict = (typeof HK_DISTRICTS)[number];

/** Resolve a stored district value to the label for the active locale. */
export function getDistrictLabel(
  value: string,
  locale: "zh" | "en",
): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const found = HK_DISTRICTS.find(
    (district) => district.zh === trimmed || district.en === trimmed,
  );
  if (!found) return trimmed;
  return locale === "en" ? found.en : found.zh;
}
