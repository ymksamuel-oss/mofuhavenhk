import { PetProfileManager } from "@/components/account/PetProfileManager";
import { getAccountLocale } from "@/lib/account/locale";

export const dynamic = "force-dynamic";

export default async function AccountPetsPage() {
  const locale = await getAccountLocale();
  return <section className="space-y-4"><div><h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[color:var(--ink)]">{locale === "en" ? "Pet profiles" : "毛孩檔案"}</h1><p className="mt-1 text-sm leading-6 text-[color:var(--muted)]">{locale === "en" ? "Store birthdays, breeds, allergies, and special dietary notes for your pets." : "記錄毛孩名字、犬貓、生日、品種、過敏食材及特殊體質備註。"}</p></div><PetProfileManager /></section>;
}
