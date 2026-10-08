import Link from "next/link";
import Image from "next/image";
import { requireCustomer } from "@/lib/account/server";
import { getAccountLocale } from "@/lib/account/locale";
import { accountOrderQuantity, formatAccountDate, formatAccountMoney, orderStatusLabel, parseAccountOrderItems } from "@/lib/account/presentation";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 20;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AccountOrdersPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const rawPage = Array.isArray(params.page) ? params.page[0] : params.page;
  const page = Math.max(1, Math.min(10000, Number.parseInt(rawPage ?? "1", 10) || 1));
  const [{ supabase, user }, locale] = await Promise.all([requireCustomer("/account/orders"), getAccountLocale()]);
  const { data: orders, count, error } = await supabase.from("orders")
    .select("id, order_number, status, total, items, created_at", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));
  return (
    <section className="space-y-4">
      <div><h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[color:var(--ink)]">{locale === "en" ? "My orders" : "我的訂單"}</h1><p className="mt-1 text-sm text-[color:var(--muted)]">{locale === "en" ? "Order records associated with your verified account email." : "與此已驗證會員帳戶歸戶的訂單記錄。"}</p></div>
      {error ? <p role="alert" className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{locale === "en" ? "Order history is temporarily unavailable." : "訂單資料暫時無法載入，請稍後再試。"}</p> : null}
      {!error && (!orders || orders.length === 0) ? <div className="rounded-2xl border border-[color:var(--line)] bg-white p-6 text-sm leading-6 text-[color:var(--muted)]">{locale === "en" ? "No linked orders yet. Guest orders placed with this verified email are linked automatically." : "目前沒有已歸戶訂單。使用此 Email 完成驗證後，符合的訪客訂單會自動歸戶。"}</div> : null}
      <div className="space-y-3">{(orders ?? []).map((order) => {
        const items = parseAccountOrderItems(order.items);
        const totalQty = accountOrderQuantity(order.items);
        return <article key={order.id} className="rounded-2xl border border-[color:var(--line)] bg-white p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-2"><div><p className="font-semibold text-[color:var(--ink)]">{order.order_number || (locale === "en" ? "Order" : "訂單")}</p><p className="mt-1 text-xs text-[color:var(--muted)]">{formatAccountDate(order.created_at, locale)}</p></div><span className="rounded-full bg-[color:var(--accent-soft)] px-3 py-1.5 text-xs font-semibold">{orderStatusLabel(order.status, locale)}</span></div>
          <div className="mt-4 flex min-w-0 items-center gap-3">{items.slice(0, 3).map((item) => <div key={`${item.id}-${item.name}`} className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[color:var(--line)] bg-white">{item.image && item.image !== "catalog-placeholder" ? <Image src={item.image} alt="" width={48} height={48} unoptimized className="h-full w-full object-contain" /> : <span aria-hidden="true" className="text-xs">🐾</span>}</div>)}<p className="min-w-0 flex-1 text-xs leading-5 text-[color:var(--muted)]">{items.slice(0, 2).map((item) => `${item.name} × ${item.quantity}`).join(" · ")}{items.length > 2 ? ` · ${locale === "en" ? "and more" : "等 ${items.length - 2} 款"}` : ""}</p></div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[color:var(--line)] pt-3"><span className="text-sm text-[color:var(--muted)]">{locale === "en" ? `Items: ${totalQty}` : `商品件數：${totalQty}`}</span><span className="font-semibold">{formatAccountMoney(order.total, locale)}</span></div>
          <Link href={`/account/orders/${order.id}`} className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-[color:var(--accent)]">{locale === "en" ? "View details →" : "查看詳情 →"}</Link>
        </article>;
      })}</div>
      {count && count > PAGE_SIZE ? <nav aria-label={locale === "en" ? "Order pages" : "訂單分頁"} className="flex items-center justify-between"><Link aria-disabled={page <= 1} className={`min-h-11 rounded-xl border px-4 py-3 text-sm ${page <= 1 ? "pointer-events-none opacity-40" : "bg-white"}`} href={`/account/orders?page=${Math.max(1, page - 1)}`}>{locale === "en" ? "Previous" : "上一頁"}</Link><span className="text-sm text-[color:var(--muted)]">{page} / {totalPages}</span><Link aria-disabled={page >= totalPages} className={`min-h-11 rounded-xl border px-4 py-3 text-sm ${page >= totalPages ? "pointer-events-none opacity-40" : "bg-white"}`} href={`/account/orders?page=${Math.min(totalPages, page + 1)}`}>{locale === "en" ? "Next" : "下一頁"}</Link></nav> : null}
    </section>
  );
}
