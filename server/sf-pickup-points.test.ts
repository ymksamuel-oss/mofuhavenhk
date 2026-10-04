import { describe, expect, it } from "vitest";
import { SF_PICKUP_POINTS } from "@/lib/sf-pickup-points";

describe("official SF Express HK pickup-point snapshot", () => {
  it("contains only unique HK pickup codes with usable addresses", () => {
    const codes = SF_PICKUP_POINTS.map((point) => point.code);
    expect(new Set(codes).size).toBe(codes.length);
    expect(SF_PICKUP_POINTS.every((point) => point.code.startsWith("852") || point.code.startsWith("H852"))).toBe(true);
    expect(SF_PICKUP_POINTS.every((point) => point.address.trim().length > 0)).toBe(true);
    expect(SF_PICKUP_POINTS.some((point) => /只供住戶|只供職員|只有自寄|不設取件服務/.test(point.address))).toBe(false);
  });

  it("retains the official 852TAL station code and address", () => {
    expect(SF_PICKUP_POINTS.find((point) => point.code === "852TAL")).toMatchObject({
      type: "station",
      region: "hong-kong-island",
      district: "南區",
      address: "香港香港島南區香港仔大道234號富嘉工業大廈9樓6室",
    });
  });

  it("includes the audited official public point counts by type", () => {
    expect(SF_PICKUP_POINTS.filter((point) => point.type === "station")).toHaveLength(137);
    expect(SF_PICKUP_POINTS.filter((point) => point.type === "locker")).toHaveLength(675);
    expect(SF_PICKUP_POINTS.filter((point) => point.type === "partner")).toHaveLength(441);
  });
});
