import Link from "next/link";
import Image from "next/image";
import { requireCustomer, customerSummary } from "@/lib/account/server";
import { getAccountLocale } from "@/lib/account/locale";
import { formatAccountDate, formatAccountMoney, orderStatusLabel, parseAccountOrderItems } from "@/lib/account/presentation";

export const dynamic = "force-dynamic";

export default async function AccountOverviewPage() {
  const [{ supabase, user }, locale] = await Promise.all([requireCustomer("/account"), getAccountLocale()]);
  const [{ data: profile }, { data: recentOrder }, { data: defaultAddress }] = await Promise.all([
    supabase.from("customer_profiles").select("display_name, phone").eq("user_id", user.id).maybeSingle(),
    supabase.from("orders").select("id, order_number, status, total, items, created_at, tracking_number").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("customer_addresses").select("label, address_type, address, district, pickup_point_code, pickup_point_name, is_default").eq("user_id", user.id).eq("is_default", true).maybeSingle(),
  ]);
  const summary = customerSummary(user);
  const name = profile?.display_name || summary.displayName || (locale === "en" ? "Mofu member" : "會員");
  const items = parseAccountOrderItems(recentOrder?.items);
  return (
    <div className="space-y-5">
      <section className="milk-tea-card p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--accent)]">Mofu Haven</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-[color:var(--ink)] sm:text-3xl">{locale === "en" ? `Hello, ${name}` : `你好，${name}`}</h1>
        <p className="mt-2 break-all text-sm text-[color:var(--muted)]">{user.email}</p>
        <div className="mt-4 flex flex-wrap gap-2"><Link href="/account/orders" className="min-h-11 rounded-xl bg-[color:var(--accent)] px-4 py-3 text-sm font-semibold text-white">{locale === "en" ? "My orders" : "查看我的訂單"}</Link><Link href="/account/profile" className="min-h-11 rounded-xl border border-[color:var(--line)] bg-white px-4 py-3 text-sm font-semibold text-[color:var(--ink)]">{locale === "en" ? "Edit profile" : "編輯個人資料"}</Link></div>
      </section>
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border border-[color:var(--line)] bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold text-[color:var(--ink)]">{locale === "en" ? "Latest order" : "最近訂單"}</h2><Link href="/account/orders" className="text-sm font-medium text-[color:var(--accent)]">{locale === "en" ? "All orders →" : "全部訂單 →"}</Link></div>
          {recentOrder ? <div className="mt-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2"><div><p className="font-semibold">{recentOrder.order_number || (locale === "en" ? "Order" : "訂單")}</p><p className="mt-1 text-xs text-[color:var(--muted)]">{formatAccountDate(recentOrder.created_at, locale)}</p></div><span className="rounded-full bg-[color:var(--accent-soft)] px-3 py-1.5 text-xs font-semibold">{orderStatusLabel(recentOrder.status, locale)}</span></div>
            <div className="flex flex-wrap gap-2">{items.slice(0, 4).map((item) => <div key={`${item.id}-${item.name}`} className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-[color:var(--line)] bg-stone-50" title={`${item.name} × ${item.quantity}`}>{item.image && item.image !== "catalog-placeholder" ? <Image src={item.image} alt="" width={48} height={48} unoptimized className="h-full w-full object-contain" /> : <span aria-hidden="true" className="text-xs">🐾</span>}</div>)}</div>
            <div className="flex items-center justify-between border-t border-[color:var(--line)] pt-3"><span className="text-sm text-[color:var(--muted)]">{locale === "en" ? "Paid total" : "實付"}</span><strong>{formatAccountMoney(recentOrder.total, locale)}</strong></div>
            {recentOrder.tracking_number ? <a href="https://htm.sf-express.com/hk/tc/dynamic_function/waybill/" target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center text-sm font-semibold text-[color:var(--accent)] underline underline-offset-4">{locale === "en" ? "SF Express tracking" : "順豐官方追蹤"} · {recentOrder.tracking_number}</a> : null}
            <Link href={`/account/orders/${recentOrder.id}`} className="inline-flex min-h-11 items-center text-sm font-semibold text-[color:var(--accent)]">{locale === "en" ? "Order details →" : "查看訂單詳情 →"}</Link>
          </div> : <p className="mt-4 rounded-xl bg-[color:var(--background)] p-4 text-sm leading-6 text-[color:var(--muted)]">{locale === "en" ? "No linked orders yet. Orders placed with this verified email will appear here." : "尚未找到已歸戶訂單。以此已驗證 Email 下單的訂單會自動顯示於此。"}</p>}
        </section>
        <section className="rounded-2xl border border-[color:var(--line)] bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold text-[color:var(--ink)]">{locale === "en" ? "Default delivery address" : "常用配送地址"}</h2><Link href="/account/addresses" className="text-sm font-medium text-[color:var(--accent)]">{locale === "en" ? "Manage →" : "管理 →"}</Link></div>
          {defaultAddress ? <div className="mt-4 rounded-xl bg-[color:var(--background)] p-4"><p className="font-semibold">{defaultAddress.label}</p><p className="mt-1 break-words text-sm leading-6 text-[color:var(--muted)]">{defaultAddress.address_type === "sf_pickup" ? `${defaultAddress.pickup_point_name ?? "SF pickup point"} · ${defaultAddress.pickup_point_code ?? ""}` : `${defaultAddress.district} · ${defaultAddress.address}`}</p></div> : <p className="mt-4 rounded-xl bg-[color:var(--background)] p-4 text-sm leading-6 text-[color:var(--muted)]">{locale === "en" ? "Save a home, business, or SF pickup address for faster checkout." : "儲存住宅、工商地址或順豐自提點，結帳時即可快速帶入。"}</p>}
          <Link href="/account/pets" className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-[color:var(--accent)]">{locale === "en" ? "Manage pet profiles →" : "管理毛孩檔案 →"}</Link>
        </section>
      </div>
    </div>
  );
}
