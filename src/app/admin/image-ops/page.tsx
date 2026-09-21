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
    updated: "已匹配並更新",
    would_update: "預覽：將更新",
    no_match: "找不到官方匹配",
    failed: "更新失敗",
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
      <div className="mx-auto max-w-5xl">
        <button type="button" onClick={() => router.push("/admin")} className="mb-5 text-sm font-medium text-[#806b5d] hover:text-[#2f4a3c]">← 返回管理後台</button>
        <section className="rounded-3xl bg-white p-5 shadow-sm md:p-8">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#a36b42]">Official image operations</p>
          <h1 className="mt-2 text-3xl font-semibold text-[#2f4a3c]">Best Partner 官方圖片自動補圖</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#806b5d]">系統會直接比對 Best Partner 官方網站。優先使用 13 位 JAN 條碼；沒有命中時，會清理「日本原裝 Best Partner 天然寵物零食｜」前綴、規格及符號，再以純日文品名進行精準比對。成功後下載官方原圖至 Supabase，並即時更新商品圖片。</p>
          <div className="mt-4 rounded-2xl border border-[#eaded5] bg-[#fffaf4] p-4 text-sm leading-6 text-[#6f6258]">
            <strong className="text-[#2f4a3c]">安全設定：</strong>預覽模式不會改動資料庫；套用模式只會處理沒有圖片的商品。勾選「覆蓋已有圖片」後才會更新已有圖片，並保留原有圖片作為後備。
          </div>

          <div className="mt-7 grid gap-4 rounded-2xl border border-[#eaded5] bg-[#fffaf4] p-4 md:grid-cols-[180px_1fr] md:items-end">
            <label className="text-sm"><span className="mb-2 block font-medium">最多處理數量（最多 50）</span><input type="number" min="1" max="50" value={limit} onChange={(event) => setLimit(event.target.value)} className="w-full rounded-xl border border-[#ded5cc] bg-white px-3 py-3 outline-none focus:border-[#a36b42]" /></label>
            <label className="flex items-center gap-3 pb-3 text-sm"><input type="checkbox" checked={overwrite} onChange={(event) => setOverwrite(event.target.checked)} className="h-4 w-4 accent-[#a36b42]" />覆蓋已有圖片（會保留舊圖作為後備）</label>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={() => run(false)} disabled={busy} className={`${buttonClass} border border-[#2f4a3c] bg-[#f8fbf8] text-[#2f4a3c] hover:bg-[#edf5ef]`}>{busy ? "處理中…" : "先預覽官方匹配"}</button>
            <button type="button" onClick={() => run(true)} disabled={busy} className={`${buttonClass} bg-[#a36b42] text-white hover:bg-[#8f5b37]`}>{busy ? "下載及更新中…" : "一鍵批次補圖並更新"}</button>
          </div>
          <p className="mt-3 text-xs leading-5 text-[#8b7c70]">來源：<a href="https://best-partner.co.jp/" target="_blank" rel="noreferrer" className="underline">best-partner.co.jp</a>。建議先預覽，確認 JAN／日文品名及官方縮圖後，再執行批次更新。</p>
          {error && <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        </section>

        {result && <section className="mt-5 rounded-3xl bg-white p-5 shadow-sm md:p-8">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">{[["候選", result.totalCandidates], ["官方匹配", result.matched], ["已下載", result.uploaded], ["已更新", result.updated], ["跳過／失敗", result.skipped + result.failed]].map(([label, value]) => <div key={String(label)} className="rounded-2xl bg-[#fffaf4] p-3"><p className="text-xs text-[#8b7c70]">{label}</p><p className="mt-1 text-2xl font-semibold text-[#2f4a3c]">{value}</p></div>)}</div>
          <div className="mt-6 space-y-3">{result.items.map((item) => <div key={item.id} className="rounded-2xl border border-[#eaded5] p-4"><div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"><div className="flex min-w-0 gap-3"><div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#f7f3ed]">{item.imageUrl && <img src={item.imageUrl} alt="官方商品圖片預覽" className="h-full w-full object-contain" />}</div><div className="min-w-0"><p className="font-medium">{item.name}</p>{item.sourceTitle && <p className="mt-1 text-sm text-[#2f4a3c]">官方：{item.sourceTitle}</p>}{item.sourceJan && <p className="mt-1 text-xs text-[#8b7c70]">JAN：{item.sourceJan} · 匹配方式：{item.matchMethod}</p>}{item.sourceUrl && <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="mt-1 block break-all text-xs text-[#a36b42] underline">查看官方商品頁</a>}</div></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${item.status === "updated" ? "bg-emerald-50 text-emerald-700" : item.status === "no_match" ? "bg-amber-50 text-amber-700" : item.status === "failed" ? "bg-red-50 text-red-700" : "bg-[#f7efe7] text-[#805536]"}`}>{statusLabel(item.status)}</span></div>{item.error && <p className="mt-2 text-xs text-red-600">{item.error}</p>}</div>)}</div>
        </section>}
      </div>
    </main>
  );
}
