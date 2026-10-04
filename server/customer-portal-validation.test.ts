import { describe, expect, it } from "vitest";
import { safeReturnPath } from "@/lib/account/redirects";
import { addressSchema, loginSchema, petSchema, signupSchema } from "@/lib/account/validation";

describe("customer portal validation", () => {
  it("allows only safe same-site return paths", () => {
    expect(safeReturnPath("/account/orders?tab=recent")).toBe("/account/orders?tab=recent");
    expect(safeReturnPath("https://attacker.example/steal")).toBe("/account");
    expect(safeReturnPath("//attacker.example/steal")).toBe("/account");
    expect(safeReturnPath("/\\attacker.example")).toBe("/account");
    expect(safeReturnPath("/account/login?returnTo=/account")).toBe("/account");
  });

  it("normalizes emails and enforces account password requirements", () => {
    expect(loginSchema.safeParse({ email: " Customer@Example.com ", password: "x", returnTo: "/checkout" }).success).toBe(true);
    expect(signupSchema.safeParse({ displayName: "Mofu", email: "x", password: "123", returnTo: "/account" }).success).toBe(false);
    expect(signupSchema.parse({ displayName: " Mofu ", email: "CUSTOMER@example.com", password: "SecurePass1234", returnTo: "/account" }).email).toBe("customer@example.com");
  });

  it("requires a real SF pickup point identity for saved pickup addresses", () => {
    const valid = addressSchema.safeParse({ label: "Office locker", addressType: "sf_pickup", recipientName: "Mofu", recipientPhone: "+85291234567", address: "Kwun Tong", district: "觀塘區", pickupPointCode: "852TAL", pickupPointName: "Test SF Station", pickupPointType: "station", isDefault: false });
    const invalid = addressSchema.safeParse({ label: "Pickup", addressType: "sf_pickup", recipientName: "Mofu", recipientPhone: "+85291234567", address: "", district: "", pickupPointCode: "", pickupPointName: "", isDefault: false });
    expect(valid.success).toBe(true);
    expect(invalid.success).toBe(false);
    expect(addressSchema.safeParse({ label: "Home", addressType: "home", recipientName: "Mofu", recipientPhone: "+852 ", address: "1 Road", district: "中西區", isDefault: false }).success).toBe(false);
  });

  it("accepts pet species and keeps allergy/special-note inputs bounded", () => {
    expect(petSchema.safeParse({ name: "Momo", species: "cat", birthday: "2021-02-03", breed: "Domestic", allergyIngredients: ["Chicken"], specialNotes: "Sensitive stomach" }).success).toBe(true);
    expect(petSchema.safeParse({ name: "Momo", species: "cat", birthday: "2021-02-31", breed: "Domestic", allergyIngredients: [], specialNotes: "" }).success).toBe(false);
    expect(petSchema.safeParse({ name: "Momo", species: "rabbit", birthday: "", breed: "", allergyIngredients: [], specialNotes: "" }).success).toBe(false);
  });
});
