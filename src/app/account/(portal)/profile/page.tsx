import { CustomerProfileManager } from "@/components/account/CustomerProfileManager";
import { getAccountLocale } from "@/lib/account/locale";

export const dynamic = "force-dynamic";

export default async function AccountProfilePage() {
  const locale = await getAccountLocale();
  return <section className="mx-auto w-full max-w-2xl space-y-4"><div><h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[color:var(--ink)]">{locale === "en" ? "Member profile" : "會員個人資料"}</h1><p className="mt-1 text-sm text-[color:var(--muted)]">{locale === "en" ? "Your verified email is managed securely by Supabase Auth." : "已驗證 Email 由 Supabase Auth 安全管理。"}</p></div><div className="rounded-2xl border border-[color:var(--line)] bg-white p-5 sm:p-6"><CustomerProfileManager /></div></section>;
}
