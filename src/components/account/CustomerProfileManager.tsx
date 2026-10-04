"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { profileSchema } from "@/lib/account/validation";

export function CustomerProfileManager() {
  const { locale } = useI18n(); const en = locale === "en";
  const [displayName, setDisplayName] = useState(""); const [phone, setPhone] = useState(""); const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true); const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [notice, setNotice] = useState("");
  useEffect(() => { let alive = true; void fetch("/api/account/profile", { cache: "no-store" }).then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(); if (!alive) return; setDisplayName(data.profile?.display_name ?? ""); setPhone(data.profile?.phone ?? ""); setEmail(data.email ?? ""); }).catch(() => { if (alive) setError(en ? "Unable to load profile." : "個人資料暫時無法載入。 "); }).finally(() => { if (alive) setLoading(false); }); return () => { alive = false; }; }, [en]);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setBusy(true); setError(""); setNotice(""); try { const parsed = profileSchema.safeParse({ displayName, phone }); if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? (en ? "Check the profile fields." : "請檢查個人資料。")); return; } const response = await fetch("/api/account/profile", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(parsed.data) }); const data = await response.json(); if (!response.ok) throw new Error(); setDisplayName(data.profile?.display_name ?? displayName); setPhone(data.profile?.phone ?? phone); setNotice(en ? "Profile updated." : "個人資料已更新。"); } catch { setError(en ? "Could not save profile. Check the display name." : "儲存失敗，請檢查稱呼是否已填寫。 "); } finally { setBusy(false); } }
  const inputClass = "min-h-12 w-full rounded-xl border border-[color:var(--line)] bg-white px-3.5 py-3 text-base outline-none focus:border-[color:var(--accent)] sm:text-sm";
  if (loading) return <div className="space-y-3"><div className="h-14 animate-pulse rounded-xl bg-stone-100" /><div className="h-14 animate-pulse rounded-xl bg-stone-100" /></div>;
  return <form onSubmit={submit} className="space-y-4">
    <label className="block space-y-1.5"><span className="text-sm font-medium">{en ? "Verified email" : "已驗證 Email"}</span><input className={`${inputClass} bg-stone-50`} type="email" value={email} readOnly aria-readonly="true" /></label>
    <label className="block space-y-1.5"><span className="text-sm font-medium">{en ? "Display name" : "會員稱呼"} *</span><input className={inputClass} required maxLength={100} value={displayName} onChange={(event) => setDisplayName(event.target.value)} autoComplete="name" /></label>
    <label className="block space-y-1.5"><span className="text-sm font-medium">{en ? "Phone" : "聯絡電話"}</span><input className={inputClass} type="tel" maxLength={32} value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" /></label>
    {error ? <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}{notice ? <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">{notice}</p> : null}
    <button type="submit" disabled={busy} className="min-h-12 rounded-xl bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{busy ? (en ? "Saving…" : "儲存中…") : (en ? "Save profile" : "儲存個人資料")}</button>
  </form>;
}
