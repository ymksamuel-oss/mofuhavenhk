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
  address: string;
  district: string;
  note?: string;
};

export const SF_PICKUP_POINTS = sourcePoints as unknown as SfPickupPoint[];

export function findSfPickupPointByCode(code: string): SfPickupPoint | undefined {
  const normalized = code.trim().toUpperCase();
  return SF_PICKUP_POINTS.find((point) => point.code === normalized);
}
