"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const buttonClass = "rounded-xl px-4 py-3 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-50";

type Item = { id: string; name: string; status: string; sourceUrl?: string; imageUrl?: string; error?: string };
type Result = { mode: string; limit: number; totalCandidates: number; matched: number; uploaded: number; updated: number; skipped: number; failed: number; items: Item[] };

export default function ImageOpsPage() {
  const router = useRouter();
  const [limit, setLimit] = useState("5");
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
      if (!response.ok) throw new Error(data.error || "同步失敗");
      setResult(data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "同步失敗，請稍後再試。");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f3ed] px-4 py-6 text-[#2f2a26] md:px-8">
      <div className="mx-auto max-w-4xl">
        <button type="button" onClick={() => router.push("/admin")} className="mb-5 text-sm font-medium text-[#806b5d] hover:text-[#2f4a3c]">← 返回管理後台</button>
        <section className="rounded-3xl bg-white p-5 shadow-sm md:p-8">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#a36b42]">Image operations</p>
          <h1 className="mt-2 text-3xl font-semibold text-[#2f4a3c]">WT Japan 圖片自動補圖</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#806b5d]">系統會讀取沒有圖片的產品名稱，到 wt-japan.com 搜尋，只有產品名稱完全相同才會下載、上傳並更新圖片。SKU 不會參與匹配，瀏覽器也不會接觸 Supabase service-role key。</p>

          <div className="mt-7 grid gap-4 rounded-2xl border border-[#eaded5] bg-[#fffaf4] p-4 md:grid-cols-[180px_1fr] md:items-end">
            <label className="text-sm"><span className="mb-2 block font-medium">最多處理數量</span><input type="number" min="1" max="20" value={limit} onChange={(event) => setLimit(event.target.value)} className="w-full rounded-xl border border-[#ded5cc] bg-white px-3 py-3 outline-none focus:border-[#a36b42]" /></label>
            <label className="flex items-center gap-3 pb-3 text-sm"><input type="checkbox" checked={overwrite} onChange={(event) => setOverwrite(event.target.checked)} className="h-4 w-4 accent-[#a36b42]" />覆蓋已有圖片（一般情況請保持關閉）</label>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={() => run(false)} disabled={busy} className={`${buttonClass} border border-[#2f4a3c] bg-[#f8fbf8] text-[#2f4a3c] hover:bg-[#edf5ef]`}>{busy ? "處理中…" : "先預覽匹配結果"}</button>
            <button type="button" onClick={() => run(true)} disabled={busy} className={`${buttonClass} bg-[#a36b42] text-white hover:bg-[#8f5b37]`}>{busy ? "上載及更新中…" : "執行上載及更新"}</button>
          </div>
          <p className="mt-3 text-xs leading-5 text-[#8b7c70]">建議先按「先預覽匹配結果」，確認名稱及來源網址後，再按「執行上載及更新」。每次最多 20 件，避免一次請求過大。</p>
          {error && <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        </section>

        {result && <section className="mt-5 rounded-3xl bg-white p-5 shadow-sm md:p-8"><div className="grid grid-cols-2 gap-3 md:grid-cols-5">{[["候選", result.totalCandidates], ["精準匹配", result.matched], ["已上載", result.uploaded], ["已更新", result.updated], ["跳過／失敗", result.skipped + result.failed]].map(([label, value]) => <div key={String(label)} className="rounded-2xl bg-[#fffaf4] p-3"><p className="text-xs text-[#8b7c70]">{label}</p><p className="mt-1 text-2xl font-semibold text-[#2f4a3c]">{value}</p></div>)}</div><div className="mt-6 space-y-3">{result.items.map((item) => <div key={item.id} className="rounded-2xl border border-[#eaded5] p-4"><div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between"><div><p className="font-medium">{item.name}</p>{item.sourceUrl && <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="mt-1 block break-all text-xs text-[#a36b42] underline">查看來源商品</a>}</div><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.status === "updated" ? "bg-emerald-50 text-emerald-700" : item.status === "no_exact_match" ? "bg-amber-50 text-amber-700" : item.status === "failed" ? "bg-red-50 text-red-700" : "bg-[#f7efe7] text-[#805536]"}`}>{item.status === "updated" ? "已更新" : item.status === "no_exact_match" ? "找不到完全相同名稱" : item.status === "failed" ? "失敗" : item.status === "would_update" ? "預覽：將更新" : item.status}</span></div>{item.error && <p className="mt-2 text-xs text-red-600">{item.error}</p>}{item.imageUrl && <p className="mt-2 break-all text-xs text-[#8b7c70]">{item.imageUrl}</p>}</div>)}</div></section>}
      </div>
    </main>
  );
}
