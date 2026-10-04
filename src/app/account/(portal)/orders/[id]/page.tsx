import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { z } from "zod";
import { requireCustomer } from "@/lib/account/server";
import { getAccountLocale } from "@/lib/account/locale";
import { formatAccountDate, formatAccountMoney, orderStatusLabel, parseAccountOrderItems } from "@/lib/account/presentation";

export const dynamic = "force-dynamic";
type RouteParams = { params: Promise<{ id: string }> };

function textField(info: Record<string, unknown>, keys: string[]) {
  for (const key of keys) if (typeof info[key] === "string" && String(info[key]).trim()) return String(info[key]).trim();
  return "";
}

export default async function AccountOrderDetailPage({ params }: RouteParams) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();
  const [{ supabase, user }, locale] = await Promise.all([requireCustomer(`/account/orders/${id}`), getAccountLocale()]);
  const { data: order, error } = await supabase.from("orders").select("id, order_number, status, total, items, created_at, customer_info, payment_intent_id, payment_method_label, tracking_number").eq("id", id).eq("user_id", user.id).maybeSingle();
  if (error || !order) notFound();
  const info = order.customer_info && typeof order.customer_info === "object" && !Array.isArray(order.customer_info) ? order.customer_info as Record<string, unknown> : {};
  const items = parseAccountOrderItems(order.items);
  const sfCode = textField(info, ["sfStationCode", "sf_station_code", "pickupPointCode", "pickup_point_code"]);
  const address = textField(info, ["address", "shippingAddress", "shipping_address"]);
  const addressLine2 = textField(info, ["addressLine2", "address_line2", "pickupPointName"]);
  const district = textField(info, ["district", "shippingDistrict"]);
  const paymentMethod = order.payment_method_label || textField(info, ["paymentMethod", "payment_method"]) || (order.payment_intent_id ? "Stripe" : "—");
  const sfTrackUrl = "https://htm.sf-express.com/hk/tc/dynamic_function/waybill/";
  return (
    <div className="space-y-5">
      <Link href="/account/orders" className="inline-flex min-h-11 items-center text-sm font-medium text-[color:var(--accent)]">← {locale === "en" ? "Back to orders" : "返回訂單列表"}</Link>
      <section className="rounded-2xl border border-[color:var(--line)] bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-xl font-semibold text-[color:var(--ink)]">{order.order_number || (locale === "en" ? "Order details" : "訂單詳情")}</h1><p className="mt-1 text-sm text-[color:var(--muted)]">{formatAccountDate(order.created_at, locale)}</p></div><span className="rounded-full bg-[color:var(--accent-soft)] px-3 py-1.5 text-xs font-semibold">{orderStatusLabel(order.status, locale)}</span></div>
        <div className="mt-4 flex items-center justify-between border-t border-[color:var(--line)] pt-4"><span className="text-sm text-[color:var(--muted)]">{locale === "en" ? "Paid total" : "實付總額"}</span><strong className="text-lg">{formatAccountMoney(order.total, locale)}</strong></div>
        {order.tracking_number ? <a href={sfTrackUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl border border-[color:var(--line)] px-3.5 py-2.5 text-sm font-semibold text-[color:var(--accent)]">{locale === "en" ? "Track on official SF Express site" : "前往順豐官方物流追蹤"}<span className="font-mono">{order.tracking_number}</span><span aria-hidden="true">↗</span></a> : null}
      </section>
      <section className="rounded-2xl border border-[color:var(--line)] bg-white p-5 sm:p-6"><h2 className="text-lg font-semibold">{locale === "en" ? "Items" : "商品明細"}</h2><ul className="mt-3 divide-y divide-[color:var(--line)]">{items.map((item) => <li key={`${item.id}-${item.name}`} className="flex min-w-0 items-center gap-3 py-3">{item.image && item.image !== "catalog-placeholder" ? <Image src={item.image} alt="" width={56} height={56} unoptimized className="h-14 w-14 shrink-0 rounded-xl border border-[color:var(--line)] object-contain" /> : <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[color:var(--background)]">🐾</span>}<span className="min-w-0 flex-1"><span className="block break-words text-sm font-medium">{item.name}</span><span className="mt-1 block text-xs text-[color:var(--muted)]">{locale === "en" ? `Qty ${item.quantity}` : `數量 ${item.quantity}`}</span></span><span className="shrink-0 text-sm font-semibold">{formatAccountMoney(item.unitPrice * item.quantity, locale)}</span></li>)}</ul></section>
      <div className="grid gap-5 sm:grid-cols-2">
        <section className="rounded-2xl border border-[color:var(--line)] bg-white p-5"><h2 className="text-lg font-semibold">{locale === "en" ? "Recipient & delivery" : "收件人與配送資料"}</h2><dl className="mt-3 space-y-2 text-sm"><div><dt className="text-xs text-[color:var(--muted)]">{locale === "en" ? "Recipient" : "收件人"}</dt><dd className="mt-0.5 break-words">{textField(info, ["name", "recipientName", "recipient_name"]) || "—"}</dd></div><div><dt className="text-xs text-[color:var(--muted)]">Email / {locale === "en" ? "Phone" : "電話"}</dt><dd className="mt-0.5 break-all">{textField(info, ["email"]) || "—"} · {textField(info, ["phone", "phoneNumber", "phone_number"]) || "—"}</dd></div><div><dt className="text-xs text-[color:var(--muted)]">{locale === "en" ? "Address" : "地址"}</dt><dd className="mt-0.5 break-words leading-6">{[district, addressLine2, address].filter(Boolean).join(" · ") || "—"}</dd></div>{sfCode ? <div><dt className="text-xs text-[color:var(--muted)]">{locale === "en" ? "SF pickup point code" : "順豐自提網點代碼"}</dt><dd className="mt-0.5 font-mono font-semibold">{sfCode}</dd></div> : null}</dl></section>
        <section className="rounded-2xl border border-[color:var(--line)] bg-white p-5"><h2 className="text-lg font-semibold">{locale === "en" ? "Payment" : "付款資料"}</h2><dl className="mt-3 space-y-2 text-sm"><div><dt className="text-xs text-[color:var(--muted)]">{locale === "en" ? "Method" : "付款方式"}</dt><dd className="mt-0.5 break-words">{paymentMethod}</dd></div>{order.payment_intent_id ? <div><dt className="text-xs text-[color:var(--muted)]">Payment reference</dt><dd className="mt-0.5 break-all font-mono text-xs">{order.payment_intent_id}</dd></div> : null}<div><dt className="text-xs text-[color:var(--muted)]">{locale === "en" ? "Total" : "實付金額"}</dt><dd className="mt-0.5 font-semibold">{formatAccountMoney(order.total, locale)}</dd></div></dl></section>
      </div>
    </div>
  );
}
