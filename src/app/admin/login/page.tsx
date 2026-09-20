"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError("");
    const response = await fetch("/api/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "login", password }) });
    setLoading(false);
    if (!response.ok) { setError("\u5bc6\u78bc\u4e0d\u6b63\u78ba，\u8acb\u518d\u8a66\u4e00\u6b21。"); return; }
    router.replace("/admin");
  }
  return <main className="min-h-screen bg-[#f6f2eb] px-5 py-16 text-[#27231f]"><div className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-xl shadow-[#47362b]/10"><p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#a36b42]">Mofu Haven HK</p><h1 className="text-3xl font-semibold">\u7ba1\u7406\u54e1\u767b\u5165</h1><p className="mt-3 text-sm text-[#756a60]">\u767b\u5165\u5f8c\u7ba1\u7406\u7522\u54c1、\u5206\u985e、Banner、\u7cbe\u9078\u5bf5\u7269\u5c08\u5340、\u512a\u60e0\u78bc、\u8a02\u55ae\u53ca\u7cfb\u7d71\u8a2d\u5b9a。</p><form onSubmit={submit} className="mt-8 space-y-4"><label className="block text-sm font-medium">\u7ba1\u7406\u54e1\u5bc6\u78bc<input autoFocus type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-[#ded5cc] px-4 py-3 outline-none focus:border-[#a36b42]" required /></label>{error && <p className="text-sm text-red-600">{error}</p>}<button disabled={loading} className="w-full rounded-xl bg-[#2f4a3c] px-4 py-3 font-semibold text-white disabled:opacity-50">{loading ? "\u767b\u5165\u4e2d…" : "\u767b\u5165\u5f8c\u53f0"}</button></form><Link href="/" className="mt-6 block text-center text-sm text-[#a36b42]">\u8fd4\u56de\u5546\u5e97</Link></div></main>;
}
