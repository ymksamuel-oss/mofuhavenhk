"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const buttonClass = "rounded-xl px-4 py-3 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-50";

type Item = {
  id: string;
  name: string;
  status: string;
  matchMethod?: string;
  sourceTitle?: string;
  sourceJan?: string;
  sourceUrl?: string;
  imageUrl?: string;
  error?: string;
};

type Result = {
  mode: string;
  source: string;
  limit: number;
  totalCandidates: number;
  matched: number;
  uploaded: number;
  updated: number;
  skipped: number;
  failed: number;
  items: Item[];
};

function statusLabel(status: string) {
  return {
    updated: "\u5df2\u5339\u914d\u4e26\u66f4\u65b0",
    would_update: "\u9810\u89bd：\u5c07\u66f4\u65b0",
    no_match: "\u627e\u4e0d\u5230\u5b98\u65b9\u5339\u914d",
    failed: "\u66f4\u65b0\u5931\u6557",
  }[status] || status;
}

export default function ImageOpsPage() {
  const router = useRouter();
  const [limit, setLimit] = useState("20");
  const [overwrite, setOverwrite] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  async function run(apply: boolean) {
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch("/api/admin/image-ops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: Number(limit), apply, overwrite }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) {
        router.replace("/admin/login");
        return;
      }
      if (!response.ok) throw new Error(data.error || "\u540c\u6b65\u5931\u6557");
      setResult(data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "\u540c\u6b65\u5931\u6557，\u8acb\u7a0d\u5f8c\u518d\u8a66。");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f3ed] px-4 py-6 text-[#2f2a26] md:px-8">
      <div className="mx-auto max-w-5xl">
        <button type="button" onClick={() => router.push("/admin")} className="mb-5 text-sm font-medium text-[#806b5d] hover:text-[#2f4a3c]">← \u8fd4\u56de\u7ba1\u7406\u5f8c\u53f0</button>
        <section className="rounded-3xl bg-white p-5 shadow-sm md:p-8">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#a36b42]">Official image operations</p>
          <h1 className="mt-2 text-3xl font-semibold text-[#2f4a3c]">Best Partner \u5b98\u65b9\u5716\u7247\u81ea\u52d5\u88dc\u5716</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#806b5d]">\u7cfb\u7d71\u6703\u76f4\u63a5\u6bd4\u5c0d Best Partner \u5b98\u65b9\u7db2\u7ad9。\u512a\u5148\u4f7f\u7528 13 \u4f4d JAN \u689d\u78bc；\u6c92\u6709\u547d\u4e2d\u6642，\u6703\u6e05\u7406「\u65e5\u672c\u539f\u88dd Best Partner \u5929\u7136\u5bf5\u7269\u96f6\u98df｜」\u524d\u7db4、\u898f\u683c\u53ca\u7b26\u865f，\u518d\u4ee5\u7d14\u65e5\u6587\u54c1\u540d\u9032\u884c\u7cbe\u6e96\u6bd4\u5c0d。\u6210\u529f\u5f8c\u4e0b\u8f09\u5b98\u65b9\u539f\u5716\u81f3 Supabase，\u4e26\u5373\u6642\u66f4\u65b0\u5546\u54c1\u5716\u7247。</p>
          <div className="mt-4 rounded-2xl border border-[#eaded5] bg-[#fffaf4] p-4 text-sm leading-6 text-[#6f6258]">
            <strong className="text-[#2f4a3c]">\u5b89\u5168\u8a2d\u5b9a：</strong>\u9810\u89bd\u6a21\u5f0f\u4e0d\u6703\u6539\u52d5\u8cc7\u6599\u5eab；\u5957\u7528\u6a21\u5f0f\u53ea\u6703\u8655\u7406\u6c92\u6709\u5716\u7247\u7684\u5546\u54c1。\u52fe\u9078「\u8986\u84cb\u5df2\u6709\u5716\u7247」\u5f8c\u624d\u6703\u66f4\u65b0\u5df2\u6709\u5716\u7247，\u4e26\u4fdd\u7559\u539f\u6709\u5716\u7247\u4f5c\u70ba\u5f8c\u5099。
          </div>

          <div className="mt-7 grid gap-4 rounded-2xl border border-[#eaded5] bg-[#fffaf4] p-4 md:grid-cols-[180px_1fr] md:items-end">
            <label className="text-sm"><span className="mb-2 block font-medium">\u6700\u591a\u8655\u7406\u6578\u91cf（\u6700\u591a 50）</span><input type="number" min="1" max="50" value={limit} onChange={(event) => setLimit(event.target.value)} className="w-full rounded-xl border border-[#ded5cc] bg-white px-3 py-3 outline-none focus:border-[#a36b42]" /></label>
            <label className="flex items-center gap-3 pb-3 text-sm"><input type="checkbox" checked={overwrite} onChange={(event) => setOverwrite(event.target.checked)} className="h-4 w-4 accent-[#a36b42]" />\u8986\u84cb\u5df2\u6709\u5716\u7247（\u6703\u4fdd\u7559\u820a\u5716\u4f5c\u70ba\u5f8c\u5099）</label>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={() => run(false)} disabled={busy} className={`${buttonClass} border border-[#2f4a3c] bg-[#f8fbf8] text-[#2f4a3c] hover:bg-[#edf5ef]`}>{busy ? "\u8655\u7406\u4e2d…" : "\u5148\u9810\u89bd\u5b98\u65b9\u5339\u914d"}</button>
            <button type="button" onClick={() => run(true)} disabled={busy} className={`${buttonClass} bg-[#a36b42] text-white hover:bg-[#8f5b37]`}>{busy ? "\u4e0b\u8f09\u53ca\u66f4\u65b0\u4e2d…" : "\u4e00\u9375\u6279\u6b21\u88dc\u5716\u4e26\u66f4\u65b0"}</button>
          </div>
          <p className="mt-3 text-xs leading-5 text-[#8b7c70]">\u4f86\u6e90：<a href="https://best-partner.co.jp/" target="_blank" rel="noreferrer" className="underline">best-partner.co.jp</a>。\u5efa\u8b70\u5148\u9810\u89bd，\u78ba\u8a8d JAN／\u65e5\u6587\u54c1\u540d\u53ca\u5b98\u65b9\u7e2e\u5716\u5f8c，\u518d\u57f7\u884c\u6279\u6b21\u66f4\u65b0。</p>
          {error && <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        </section>

        {result && <section className="mt-5 rounded-3xl bg-white p-5 shadow-sm md:p-8">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">{[["\u5019\u9078", result.totalCandidates], ["\u5b98\u65b9\u5339\u914d", result.matched], ["\u5df2\u4e0b\u8f09", result.uploaded], ["\u5df2\u66f4\u65b0", result.updated], ["\u8df3\u904e／\u5931\u6557", result.skipped + result.failed]].map(([label, value]) => <div key={String(label)} className="rounded-2xl bg-[#fffaf4] p-3"><p className="text-xs text-[#8b7c70]">{label}</p><p className="mt-1 text-2xl font-semibold text-[#2f4a3c]">{value}</p></div>)}</div>
          <div className="mt-6 space-y-3">{result.items.map((item) => <div key={item.id} className="rounded-2xl border border-[#eaded5] p-4"><div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"><div className="flex min-w-0 gap-3"><div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#f7f3ed]">{item.imageUrl && <img src={item.imageUrl} alt="\u5b98\u65b9\u5546\u54c1\u5716\u7247\u9810\u89bd" className="h-full w-full object-contain" />}</div><div className="min-w-0"><p className="font-medium">{item.name}</p>{item.sourceTitle && <p className="mt-1 text-sm text-[#2f4a3c]">\u5b98\u65b9：{item.sourceTitle}</p>}{item.sourceJan && <p className="mt-1 text-xs text-[#8b7c70]">JAN：{item.sourceJan} · \u5339\u914d\u65b9\u5f0f：{item.matchMethod}</p>}{item.sourceUrl && <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="mt-1 block break-all text-xs text-[#a36b42] underline">\u67e5\u770b\u5b98\u65b9\u5546\u54c1\u9801</a>}</div></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${item.status === "updated" ? "bg-emerald-50 text-emerald-700" : item.status === "no_match" ? "bg-amber-50 text-amber-700" : item.status === "failed" ? "bg-red-50 text-red-700" : "bg-[#f7efe7] text-[#805536]"}`}>{statusLabel(item.status)}</span></div>{item.error && <p className="mt-2 text-xs text-red-600">{item.error}</p>}</div>)}</div>
        </section>}
      </div>
    </main>
  );
}
