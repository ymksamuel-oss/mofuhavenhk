import { AddressBookManager } from "@/components/account/AddressBookManager";
import { getAccountLocale } from "@/lib/account/locale";

export const dynamic = "force-dynamic";

export default async function AccountAddressesPage() {
  const locale = await getAccountLocale();
  return <section className="space-y-4"><div><h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[color:var(--ink)]">{locale === "en" ? "Address book" : "常用地址簿"}</h1><p className="mt-1 text-sm leading-6 text-[color:var(--muted)]">{locale === "en" ? "Securely saved to your member account and available at checkout." : "地址安全儲存於會員帳戶，結帳時可直接帶入。"}</p></div><AddressBookManager /></section>;
}
