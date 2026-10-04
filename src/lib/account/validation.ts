import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .email("請輸入有效的 Email 地址。")
  .max(254, "Email 地址過長。")
  .transform((value) => value.toLowerCase());

const passwordSchema = z
  .string()
  .min(12, "密碼至少需要 12 個字元。")
  .max(128, "密碼不可多於 128 個字元。")
  .refine((value) => new TextEncoder().encode(value).length <= 72, "密碼 UTF-8 長度不可多於 72 bytes。請改用較短的密碼。");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "請輸入密碼。"),
  returnTo: z.string().optional(),
});

export const signupSchema = z.object({
  displayName: z.string().trim().min(1, "請輸入稱呼。此欄位為必填。").max(100, "稱呼不可多於 100 個字元。"),
  email: emailSchema,
  password: passwordSchema,
  returnTo: z.string().optional(),
});

export const forgotPasswordSchema = z.object({ email: emailSchema });
export const resetPasswordSchema = z.object({ password: passwordSchema, confirmPassword: z.string() })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "兩次輸入的密碼不一致。",
  });

export const profileSchema = z.object({
  displayName: z.string().trim().min(1, "請輸入稱呼。").max(100),
  phone: z.string().trim().max(32).default(""),
});

const addressBaseSchema = z.object({
  label: z.string().trim().min(1).max(80),
  addressType: z.enum(["home", "business", "sf_pickup"]),
  recipientName: z.string().trim().min(1).max(100),
  recipientPhone: z.string().trim().min(8, "請輸入有效的聯絡電話。至少需要 8 個字元。")
    .max(32, "聯絡電話不可多於 32 個字元。")
    .refine((value) => (value.match(/\d/g)?.length ?? 0) >= 8, "請輸入至少 8 位數字的聯絡電話。"),
  address: z.string().trim().max(500),
  addressLine2: z.string().trim().max(300).default(""),
  district: z.string().trim().max(80),
  region: z.string().trim().max(40).optional().default(""),
  pickupPointCode: z.string().trim().max(32).optional().default(""),
  pickupPointName: z.string().trim().max(200).optional().default(""),
  pickupPointType: z.enum(["station", "locker", "partner"]).optional().nullable(),
  isDefault: z.boolean().default(false),
});

export const addressSchema = addressBaseSchema.superRefine((value, context) => {
  if (value.addressType === "sf_pickup") {
    if (!value.pickupPointCode) context.addIssue({ code: "custom", path: ["pickupPointCode"], message: "請選擇順豐自提點。" });
    if (!value.pickupPointName) context.addIssue({ code: "custom", path: ["pickupPointName"], message: "自提點名稱不可留空。" });
    if (!value.address) context.addIssue({ code: "custom", path: ["address"], message: "自提點地址不可留空。" });
  } else {
    if (!value.address) context.addIssue({ code: "custom", path: ["address"], message: "請輸入地址。" });
    if (!value.district) context.addIssue({ code: "custom", path: ["district"], message: "請選擇地區。" });
  }
});

export const petSchema = z.object({
  name: z.string().trim().min(1, "請輸入毛孩名字。").max(80),
  species: z.enum(["dog", "cat"]),
  birthday: z.string().optional().default(""),
  breed: z.string().trim().max(100).default(""),
  allergyIngredients: z.array(z.string().trim().min(1).max(100)).max(30).default([]),
  specialNotes: z.string().trim().max(2000).default(""),
}).superRefine((value, context) => {
  if (value.birthday && !/^\d{4}-\d{2}-\d{2}$/.test(value.birthday)) {
    context.addIssue({ code: "custom", path: ["birthday"], message: "生日格式不正確。" });
  } else if (value.birthday) {
    const parsedDate = new Date(`${value.birthday}T00:00:00.000Z`);
    if (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== value.birthday) {
      context.addIssue({ code: "custom", path: ["birthday"], message: "請輸入有效的出生日期。" });
    }
  }
});

export type AddressInput = z.infer<typeof addressSchema>;
export type PetInput = z.infer<typeof petSchema>;
