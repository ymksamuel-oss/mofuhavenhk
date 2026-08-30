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
    if (!response.ok) { setError("密碼不正確，請再試一次。"); return; }
    router.replace("/admin");
  }
  return <main className="min-h-screen bg-[#f6f2eb] px-5 py-16 text-[#27231f]"><div className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-xl shadow-[#47362b]/10"><p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#a36b42]">Mofu Haven HK</p><h1 className="text-3xl font-semibold">管理員登入</h1><p className="mt-3 text-sm text-[#756a60]">登入後管理產品、分類、Banner、優惠碼、訂單及系統設定。</p><form onSubmit={submit} className="mt-8 space-y-4"><label className="block text-sm font-medium">管理員密碼<input autoFocus type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-[#ded5cc] px-4 py-3 outline-none focus:border-[#a36b42]" required /></label>{error && <p className="text-sm text-red-600">{error}</p>}<button disabled={loading} className="w-full rounded-xl bg-[#2f4a3c] px-4 py-3 font-semibold text-white disabled:opacity-50">{loading ? "登入中…" : "登入後台"}</button></form><Link href="/" className="mt-6 block text-center text-sm text-[#a36b42]">返回商店</Link></div></main>;
}
