"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { HK_DISTRICTS } from "@/lib/hkDistricts";
import { SFExpressPickupSelector } from "@/components/checkout/SFExpressPickupSelector";
import type { SfPickupPoint } from "@/lib/sf-pickup-points";
import { addressSchema } from "@/lib/account/validation";

type AddressType = "home" | "business" | "sf_pickup";
type AddressRow = {
  id: string; label: string; address_type: AddressType; recipient_name: string; recipient_phone: string;
  address: string; address_line2: string; district: string; region: string | null;
  pickup_point_code: string | null; pickup_point_name: string | null; pickup_point_type: "station" | "locker" | "partner" | null; is_default: boolean;
};
type AddressForm = {
  label: string; addressType: AddressType; recipientName: string; recipientPhone: string;
  address: string; addressLine2: string; district: string; region: string;
  pickupPointCode: string; pickupPointName: string; pickupPointType: "station" | "locker" | "partner" | null; isDefault: boolean;
};
const EMPTY: AddressForm = { label: "", addressType: "home", recipientName: "", recipientPhone: "+852 ", address: "", addressLine2: "", district: "", region: "", pickupPointCode: "", pickupPointName: "", pickupPointType: null, isDefault: false };
const inputClass = "min-h-12 w-full rounded-xl border border-[color:var(--line)] bg-white px-3.5 py-3 text-base text-[color:var(--ink)] outline-none focus:border-[color:var(--accent)] sm:text-sm";

export function AddressBookManager() {
  const { locale } = useI18n();
  const en = locale === "en";
  const [addresses, setAddresses] = useState<AddressRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AddressForm>(EMPTY);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/account/addresses", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "load");
      setAddresses(data.addresses ?? []);
      setError("");
    } catch {
      setError(en ? "Unable to load addresses. Please refresh and try again." : "地址暫時無法載入，請重新整理再試。 ");
    } finally { setLoading(false); }
  }, [en]);
  useEffect(() => { void load(); }, [load]);

  const selectPoint = (point: SfPickupPoint) => setForm((current) => ({
    ...current, addressType: "sf_pickup", pickupPointCode: point.code, pickupPointName: point.name,
    address: point.address, addressLine2: point.name, district: point.district,
    region: point.region, pickupPointType: point.type,
  }));

  const startEdit = (row: AddressRow) => {
    setEditingId(row.id);
    setForm({ label: row.label, addressType: row.address_type, recipientName: row.recipient_name, recipientPhone: row.recipient_phone, address: row.address, addressLine2: row.address_line2, district: row.district, region: row.region ?? "", pickupPointCode: row.pickup_point_code ?? "", pickupPointName: row.pickup_point_name ?? "", pickupPointType: row.pickup_point_type, isDefault: row.is_default });
    setError(""); setNotice("");
  };
  const reset = () => { setEditingId(null); setForm(EMPTY); setError(""); setNotice(""); };
  const update = (key: keyof AddressForm, value: string | boolean | null) => setForm((current) => ({ ...current, [key]: value }));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      const validated = addressSchema.safeParse(form);
      if (!validated.success) {
        setError(validated.error.issues[0]?.message ?? (en ? "Check the address fields." : "請檢查地址資料。"));
        return;
      }
      const response = await fetch(editingId ? `/api/account/addresses/${editingId}` : "/api/account/addresses", {
        method: editingId ? "PATCH" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(validated.data),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "save");
      await load(); reset(); setNotice(en ? "Address saved." : "地址已安全儲存。");
    } catch {
      setError(en ? "Could not save this address. Check the required fields and try again." : "儲存失敗，請檢查必填欄位及自提點後再試。 ");
    } finally { setBusy(false); }
  }

  async function remove(row: AddressRow) {
    if (!window.confirm(en ? `Delete “${row.label}”?` : `確定刪除「${row.label}」？`)) return;
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/account/addresses/${row.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("delete");
      await load(); setNotice(en ? "Address deleted." : "地址已刪除。");
    } catch { setError(en ? "Could not delete this address." : "刪除失敗，請稍後再試。 "); }
    finally { setBusy(false); }
  }

  return <div className="space-y-5">
    <div className="grid gap-3 sm:grid-cols-2">{loading ? Array.from({ length: 2 }, (_, i) => <div key={i} className="h-36 animate-pulse rounded-2xl bg-zinc-50" />) : addresses.map((row) => <article key={row.id} className="rounded-2xl border border-[color:var(--line)] bg-white p-4 sm:p-5">
      <div className="flex items-start justify-between gap-2"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="break-words font-semibold">{row.label}</h2>{row.is_default ? <span className="rounded-full bg-[color:var(--accent-soft)] px-2.5 py-1 text-[10px] font-semibold">{en ? "DEFAULT" : "預設"}</span> : null}</div><p className="mt-1 text-xs text-[color:var(--muted)]">{row.address_type === "sf_pickup" ? (en ? "SF pickup point" : "順豐自提點") : row.address_type === "business" ? (en ? "Business" : "工商地址") : (en ? "Home" : "住宅")}</p></div></div>
      <p className="mt-3 break-words text-sm font-medium">{row.recipient_name} · {row.recipient_phone}</p><p className="mt-1 break-words text-sm leading-6 text-[color:var(--muted)]">{row.address_type === "sf_pickup" ? `${row.pickup_point_name} · ${row.pickup_point_code}` : `${row.district} ${row.address} ${row.address_line2}`}</p>
      <div className="mt-3 flex flex-wrap gap-2"><button type="button" disabled={busy} onClick={() => startEdit(row)} className="min-h-11 rounded-xl border border-[color:var(--line)] px-3 py-2 text-sm font-medium">{en ? "Edit" : "編輯"}</button><button type="button" disabled={busy || row.is_default} onClick={() => { startEdit(row); setForm((current) => ({ ...current, isDefault: true })); }} className="min-h-11 rounded-xl border border-[color:var(--line)] px-3 py-2 text-sm font-medium disabled:opacity-50">{en ? "Set default" : "設為預設"}</button><button type="button" disabled={busy} onClick={() => void remove(row)} className="min-h-11 rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-700 disabled:opacity-50">{en ? "Delete" : "刪除"}</button></div>
    </article>)}</div>
    {!loading && addresses.length === 0 ? <p className="rounded-2xl border border-dashed border-[color:var(--line)] bg-white p-5 text-sm leading-6 text-[color:var(--muted)]">{en ? "No saved addresses yet. Add a home, business, or SF pickup point below." : "尚未儲存地址。你可以加入住宅、工商地址或順豐自提點。"}</p> : null}

    <section className="rounded-2xl border border-[color:var(--line)] bg-white p-4 sm:p-6">
      <h2 className="text-lg font-semibold">{editingId ? (en ? "Edit address" : "編輯地址") : (en ? "Add an address" : "新增常用地址")}</h2>
      <form onSubmit={submit} className="mt-4 space-y-4">
        <div className="grid gap-3 sm:grid-cols-2"><label className="block space-y-1.5"><span className="text-sm font-medium">{en ? "Address label" : "地址名稱"} *</span><input className={inputClass} required maxLength={80} value={form.label} onChange={(event) => update("label", event.target.value)} placeholder={en ? "Home / Office" : "家中／公司"} /></label><label className="block space-y-1.5"><span className="text-sm font-medium">{en ? "Address type" : "地址類型"} *</span><select className={inputClass} value={form.addressType} onChange={(event) => { const type = event.target.value as AddressType; setForm((current) => ({ ...current, addressType: type, pickupPointCode: "", pickupPointName: "", pickupPointType: null, ...(type === "sf_pickup" ? {} : { region: "" }) })); }}><option value="home">{en ? "Home" : "住宅"}</option><option value="business">{en ? "Business" : "工商地址"}</option><option value="sf_pickup">{en ? "SF pickup point" : "順豐自提點"}</option></select></label></div>
        <div className="grid gap-3 sm:grid-cols-2"><label className="block space-y-1.5"><span className="text-sm font-medium">{en ? "Recipient" : "收件人"} *</span><input className={inputClass} required maxLength={100} autoComplete="name" value={form.recipientName} onChange={(event) => update("recipientName", event.target.value)} /></label><label className="block space-y-1.5"><span className="text-sm font-medium">{en ? "Phone" : "聯絡電話"} *</span><input className={inputClass} type="tel" required maxLength={32} autoComplete="tel" value={form.recipientPhone} onChange={(event) => update("recipientPhone", event.target.value)} placeholder="+852 9123 4567" /></label></div>
        {form.addressType === "sf_pickup" ? <SFExpressPickupSelector selectedCode={form.pickupPointCode} onSelect={selectPoint} onClearSelection={() => setForm((current) => ({ ...current, pickupPointCode: "", pickupPointName: "", pickupPointType: null, address: "", addressLine2: "", district: "", region: "" }))} /> : <>
          <label className="block space-y-1.5"><span className="text-sm font-medium">{en ? "District" : "地區"} *</span><select className={inputClass} required value={form.district} onChange={(event) => update("district", event.target.value)}><option value="">{en ? "Select a district" : "請選擇地區"}</option>{HK_DISTRICTS.map((district) => <option key={district.zh} value={district.zh}>{en ? district.en : district.zh}</option>)}</select></label>
          <label className="block space-y-1.5"><span className="text-sm font-medium">{en ? "Street address" : "詳細地址"} *</span><textarea className={`${inputClass} min-h-24 resize-y`} required maxLength={500} autoComplete="street-address" value={form.address} onChange={(event) => update("address", event.target.value)} /></label>
          <label className="block space-y-1.5"><span className="text-sm font-medium">{en ? "Building / floor / unit" : "大廈／樓層／室（選填）"}</span><input className={inputClass} maxLength={300} value={form.addressLine2} onChange={(event) => update("addressLine2", event.target.value)} /></label>
        </>}
        {form.addressType === "sf_pickup" && form.pickupPointCode ? <div className="rounded-xl bg-[color:var(--background)] p-3 text-sm leading-6"><span className="font-mono font-semibold">{form.pickupPointCode}</span><span className="ml-2 text-[color:var(--muted)]">{form.address}</span></div> : null}
        <label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" className="h-5 w-5 accent-[color:var(--accent)]" checked={form.isDefault} onChange={(event) => update("isDefault", event.target.checked)} />{en ? "Use as my default address" : "設為預設地址"}</label>
        {error ? <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}{notice ? <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">{notice}</p> : null}
        <div className="flex flex-wrap gap-2"><button type="submit" disabled={busy} className="min-h-12 rounded-xl bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60">{busy ? (en ? "Saving…" : "儲存中…") : editingId ? (en ? "Save changes" : "儲存修改") : (en ? "Save address" : "儲存地址")}</button>{editingId ? <button type="button" disabled={busy} onClick={reset} className="min-h-12 rounded-xl border border-[color:var(--line)] px-5 py-3 text-sm font-semibold">{en ? "Cancel" : "取消"}</button> : null}</div>
      </form>
    </section>
  </div>;
}
