/** Common HK districts — stored value is Chinese; labels switch with locale. */
export const HK_DISTRICTS = [
  { zh: "\u4e2d\u897f\u5340", en: "Central and Western" },
  { zh: "\u7063\u4ed4", en: "Wan Chai" },
  { zh: "\u6771\u5340", en: "Eastern" },
  { zh: "\u5357\u5340", en: "Southern" },
  { zh: "\u6cb9\u5c16\u65fa", en: "Yau Tsim Mong" },
  { zh: "\u6df1\u6c34\u57d7", en: "Sham Shui Po" },
  { zh: "\u4e5d\u9f8d\u57ce", en: "Kowloon City" },
  { zh: "\u9ec3\u5927\u4ed9", en: "Wong Tai Sin" },
  { zh: "\u89c0\u5858", en: "Kwun Tong" },
  { zh: "\u8343\u7063", en: "Tsuen Wan" },
  { zh: "\u8475\u9752", en: "Kwai Tsing" },
  { zh: "\u5c6f\u9580", en: "Tuen Mun" },
  { zh: "\u5143\u6717", en: "Yuen Long" },
  { zh: "\u5317\u5340", en: "North" },
  { zh: "\u5927\u57d4", en: "Tai Po" },
  { zh: "\u6c99\u7530", en: "Sha Tin" },
  { zh: "\u897f\u8ca2", en: "Sai Kung" },
  { zh: "\u96e2\u5cf6", en: "Islands" },
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
