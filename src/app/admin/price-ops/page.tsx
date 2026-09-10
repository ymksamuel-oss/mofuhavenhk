"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ProductResult = { id: string; name: string | null; sku?: string | null; oldPrice?: number | null; newPrice?: number; reason?: string; error?: string };
type Result = { rate: number; multiplier: number; total: number; changed: number; skipped: number; failed: number; changedProducts: ProductResult[]; skippedProducts: ProductResult[]; failedProducts: ProductResult[] };

export default function PriceOpsPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  async function normalizePrices() {
    setBusy(true); setResult(null); setError("");
    try {
      const response = await fetch("/api/admin/products/normalize-prices", { method: "POST" });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) { router.replace("/admin/login"); return; }
      if (!response.ok) throw new Error(data.error || "批次修正失敗");
      setResult(data);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "批次修正失敗"); }
    finally { setBusy(false); }
  }

  return <main className="min-h-screen bg-[#f7f3ed] px-4 py-6 text-[#2f2a26] md:px-8"><div className="mx-auto max-w-4xl"><button type="button" onClick={() => router.push("/admin")} className="mb-5 text-sm font-medium text-[#806b5d]">← 返回管理後台</button><section className="rounded-3xl bg-white p-5 shadow-sm md:p-8"><p className="text-sm font-medium uppercase tracking-[0.16em] text-[#a36b42]">Price operations</p><h1 className="mt-2 text-3xl font-semibold text-[#2f4a3c]">批次修正零售價</h1><p className="mt-3 text-sm leading-6 text-[#806b5d]">系統會讀取全部產品的人民幣來貨價，按目前後台 RMB/HKD 匯率及 1.88 倍定價規則重新計算，並將價格向上取至以 <strong>.90</strong> 結尾。沒有有效來貨價的產品會跳過，不會猜價。</p><div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">這個操作會實際更新 Supabase 產品價格，包括 price、original_price 及 current_hkd。完成後可在下方查看每項變更。</div><button type="button" onClick={normalizePrices} disabled={busy} className="mt-6 rounded-xl bg-[#a36b42] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#8f5b37] disabled:cursor-wait disabled:opacity-50">{busy ? "修正全部產品中…" : "立即修正所有非 .90 價格"}</button>{error && <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}</section>{result && <section className="mt-5 rounded-3xl bg-white p-5 shadow-sm md:p-8"><div className="grid grid-cols-2 gap-3 md:grid-cols-5">{[["全部產品", result.total], ["已修正", result.changed], ["跳過", result.skipped], ["失敗", result.failed], ["匯率／倍數", `${result.rate} × ${result.multiplier}`]].map(([label, value]) => <div key={String(label)} className="rounded-2xl bg-[#fffaf4] p-3"><p className="text-xs text-[#8b7c70]">{label}</p><p className="mt-1 text-xl font-semibold text-[#2f4a3c]">{value}</p></div>)}</div>{result.changedProducts.length > 0 && <div className="mt-6"><h2 className="mb-3 text-lg font-semibold">已修正產品</h2><div className="space-y-2">{result.changedProducts.map((item) => <div key={item.id} className="flex flex-col justify-between gap-1 rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3 text-sm md:flex-row"><span>{item.name}{item.sku ? `（${item.sku}）` : ""}</span><span className="font-semibold">HK${item.oldPrice ?? "—"} → HK${item.newPrice?.toFixed(2)}</span></div>)}</div></div>}{result.skippedProducts.length > 0 && <div className="mt-6"><h2 className="mb-3 text-lg font-semibold">跳過產品</h2><div className="space-y-2">{result.skippedProducts.map((item) => <div key={item.id} className="rounded-xl bg-amber-50 px-4 py-3 text-sm">{item.name}：{item.reason}</div>)}</div></div>}{result.failedProducts.length > 0 && <div className="mt-6"><h2 className="mb-3 text-lg font-semibold text-red-700">失敗產品</h2><div className="space-y-2">{result.failedProducts.map((item) => <div key={item.id} className="rounded-xl bg-red-50 px-4 py-3 text-sm">{item.name}：{item.error}</div>)}</div></div>}</section>}</div></main>;
}
