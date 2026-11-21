import { z } from "zod";
import { translations, type Locale } from "@/lib/i18n/translations";

export function createAccountValidationSchemas(locale: Locale) {
  const copy = translations[locale];
  const emailSchema = z
    .string()
    .trim()
    .email(copy.validationInvalidEmail)
    .max(254, copy.validationEmailTooLong)
    .transform((value) => value.toLowerCase());

  const passwordSchema = z
    .string()
    .min(12, copy.validationPasswordTooShort)
    .max(128, copy.validationPasswordTooLong)
    .refine((value) => new TextEncoder().encode(value).length <= 72, copy.validationPasswordUtf8TooLong);

  const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, copy.validationPasswordRequired),
    returnTo: z.string().optional(),
  });

  const signupSchema = z.object({
    displayName: z.string().trim().min(1, copy.validationDisplayNameRequired).max(100, copy.validationDisplayNameTooLong),
    email: emailSchema,
    password: passwordSchema,
    returnTo: z.string().optional(),
  });

  const forgotPasswordSchema = z.object({ email: emailSchema });
  const resetPasswordSchema = z.object({ password: passwordSchema, confirmPassword: z.string() })
    .refine((value) => value.password === value.confirmPassword, {
      path: ["confirmPassword"],
      message: copy.validationPasswordsDoNotMatch,
    });

  const profileSchema = z.object({
    displayName: z.string().trim().min(1, copy.validationDisplayNameRequired).max(100),
    phone: z.string().trim().max(32).default(""),
  });

  const addressBaseSchema = z.object({
    label: z.string().trim().min(1).max(80),
    addressType: z.enum(["home", "business", "sf_pickup"]),
    recipientName: z.string().trim().min(1).max(100),
    recipientPhone: z.string().trim().min(8, copy.validationPhoneTooShort)
      .max(32, copy.validationPhoneTooLong)
      .refine((value) => (value.match(/\d/g)?.length ?? 0) >= 8, copy.validationPhoneDigitsTooShort),
    address: z.string().trim().max(500),
    addressLine2: z.string().trim().max(300).default(""),
    district: z.string().trim().max(80),
    region: z.string().trim().max(40).optional().default(""),
    pickupPointCode: z.string().trim().max(32).optional().default(""),
    pickupPointName: z.string().trim().max(200).optional().default(""),
    pickupPointType: z.enum(["station", "locker", "partner"]).optional().nullable(),
    isDefault: z.boolean().default(false),
  });

  const addressSchema = addressBaseSchema.superRefine((value, context) => {
    if (value.addressType === "sf_pickup") {
      if (!value.pickupPointCode) context.addIssue({ code: "custom", path: ["pickupPointCode"], message: copy.validationPickupPointRequired });
      if (!value.pickupPointName) context.addIssue({ code: "custom", path: ["pickupPointName"], message: copy.validationPickupPointNameRequired });
      if (!value.address) context.addIssue({ code: "custom", path: ["address"], message: copy.validationPickupAddressRequired });
    } else {
      if (!value.address) context.addIssue({ code: "custom", path: ["address"], message: copy.validationAddressRequired });
      if (!value.district) context.addIssue({ code: "custom", path: ["district"], message: copy.validationDistrictRequired });
    }
  });

  const petSchema = z.object({
    name: z.string().trim().min(1, copy.validationPetNameRequired).max(80),
    species: z.enum(["dog", "cat"]),
    birthday: z.string().optional().default(""),
    breed: z.string().trim().max(100).default(""),
    allergyIngredients: z.array(z.string().trim().min(1).max(100)).max(30).default([]),
    specialNotes: z.string().trim().max(2000).default(""),
  }).superRefine((value, context) => {
    if (value.birthday && !/^\d{4}-\d{2}-\d{2}$/.test(value.birthday)) {
      context.addIssue({ code: "custom", path: ["birthday"], message: copy.validationBirthdayFormat });
    } else if (value.birthday) {
      const parsedDate = new Date(`${value.birthday}T00:00:00.000Z`);
      if (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== value.birthday) {
        context.addIssue({ code: "custom", path: ["birthday"], message: copy.validationBirthdayInvalid });
      }
    }
  });

  return { loginSchema, signupSchema, forgotPasswordSchema, resetPasswordSchema, profileSchema, addressSchema, petSchema };
}

// Keep the existing exports backwards-compatible for server/API consumers that do not carry locale state.
export const { loginSchema, signupSchema, forgotPasswordSchema, resetPasswordSchema, profileSchema, addressSchema, petSchema } = createAccountValidationSchemas("zh");

export type AddressInput = z.infer<typeof addressSchema>;
export type PetInput = z.infer<typeof petSchema>;
