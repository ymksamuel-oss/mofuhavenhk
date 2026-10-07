import sourcePoints from "@/data/sf-pickup-points.json";

/**
 * Snapshot of SF Express Hong Kong's official service-point directories,
 * refreshed 2026-10-04. Restricted residential/staff-only points and branches
 * marked as self-drop-only or not offering pickup are excluded.
 * Sources:
 * - https://hk.sf-express.com/hk/tc/more/sf-store-address
 * - https://hk.sf-express.com/hk/tc/more/sf-service-partner-address
 * - https://hk.sf-express.com/hk/tc/more/sf-locker
 * The checkout picker is an address/code helper only; it does not change
 * shipping prices. Some remote-island partner points carry an explicit note.
 */
export type SfPickupRegion =
  | "hong-kong-island"
  | "kowloon"
  | "new-territories"
  | "outlying-islands";

export type SfPickupType = "station" | "locker" | "partner";

export type SfPickupPoint = {
  code: string;
  type: SfPickupType;
  region: SfPickupRegion;
  area: string;
  name: string;
  title?: string;
  address: string;
  district: string;
  note?: string;
};

export const SF_PICKUP_POINTS = sourcePoints as unknown as SfPickupPoint[];

const SIMPLIFIED_TO_TRADITIONAL: Record<string, string> = {
  马: "馬",
  鞍: "鞍",
  山: "山",
  围: "圍",
  颂: "頌",
  安: "安",
  号: "號",
  门: "門",
  东: "東",
  西: "西",
  南: "南",
  北: "北",
  湾: "灣",
  湯: "湯",
  广: "廣",
  场: "場",
  城: "城",
  中: "中",
  心: "心",
  街: "街",
  道: "道",
  新: "新",
  港: "港",
  田: "田",
};

const SEARCH_TERM_ALIASES = [
  "馬鞍山",
  "沙田",
  "大圍",
  "新港城",
  "MOSTOWN",
  "鞍祿街",
  "頌安",
];

function toTraditional(value: string): string {
  return [...value].map((character) => SIMPLIFIED_TO_TRADITIONAL[character] ?? character).join("");
}

/** Normalizes case, Unicode width, whitespace, punctuation and common CJK variants. */
export function normalizeSfSearchText(value: string): string {
  return toTraditional(value.normalize("NFKC").toLocaleLowerCase()).replace(/[\s\p{P}\p{S}]+/gu, "");
}

/** Splits both explicitly spaced input and common Hong Kong place-name phrases. */
export function getSfSearchTokens(value: string): string[] {
  const normalized = normalizeSfSearchText(value);
  if (!normalized) return [];

  const discovered = SEARCH_TERM_ALIASES
    .map(normalizeSfSearchText)
    .filter((term) => normalized.includes(term));
  if (discovered.length > 0) return [...new Set(discovered)];

  return value
    .normalize("NFKC")
    .trim()
    .split(/\s+/u)
    .map(normalizeSfSearchText)
    .filter(Boolean);
}

export function getSfPickupSearchText(point: SfPickupPoint): string {
  const aliases = [
    point.area === "馬鞍山" ? "MOSTown" : "",
    point.address.includes("新港城") ? "MOSTown" : "",
  ];
  return normalizeSfSearchText(
    [point.code, point.name, point.title, point.area, point.address, point.district, ...aliases].join(" "),
  );
}

export function findSfPickupPointByCode(code: string): SfPickupPoint | undefined {
  const normalized = code.trim().toUpperCase();
  return SF_PICKUP_POINTS.find((point) => point.code.toUpperCase() === normalized);
}
