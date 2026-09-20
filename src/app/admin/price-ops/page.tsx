"use client";

import { useRouter } from "next/navigation";

export default function PriceOperationsPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#f7f3ed] px-4 py-6 text-[#2f2a26] md:px-8">
      <div className="mx-auto max-w-4xl">
        <button type="button" onClick={() => router.push("/admin")} className="mb-5 text-sm font-medium text-[#806b5d]">
          ← \u8fd4\u56de\u7ba1\u7406\u5f8c\u53f0
        </button>
        <section className="rounded-3xl bg-white p-5 shadow-sm md:p-8">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#a36b42]">Price operations</p>
          <h1 className="mt-2 text-3xl font-semibold text-[#2f4a3c]">\u81ea\u52d5\u5b9a\u50f9\u5df2\u505c\u7528</h1>
          <p className="mt-3 text-sm leading-6 text-[#806b5d]">
            \u5e97\u8216\u73fe\u5df2\u63a1\u7528\u65e5\u672c\u76f4\u9001\u7cbe\u54c1\u8def\u7dda。\u6210\u672c\u50f9\u8207\u6e2f\u5e63\u96f6\u552e\u50f9\u5206\u958b\u7ba1\u7406，\u4e0d\u518d\u4f7f\u7528\u4eba\u6c11\u5e63\u532f\u7387、1.88 \u500d\u7387\u6216 .90 \u5c3e\u6578\u898f\u5247\u81ea\u52d5\u91cd\u7b97。
          </p>
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
            \u8acb\u5728\u7522\u54c1\u7de8\u8f2f\u5668\u76f4\u63a5\u8f38\u5165\u6210\u672c\u50f9（JPY）、\u552e\u50f9（HKD）\u53ca\u539f\u50f9（HKD）。\u5132\u5b58\u6642\u4e09\u8005\u6703\u6309\u8f38\u5165\u503c\u7368\u7acb\u5beb\u5165，\u6e2f\u5e63\u552e\u50f9\u4e0d\u6703\u88ab\u6210\u672c\u50f9\u8986\u84cb。
          </div>
          <button type="button" onClick={() => router.push("/admin")} className="mt-6 rounded-xl bg-[#2f4a3c] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#22372d]">
            \u8fd4\u56de\u7522\u54c1\u7ba1\u7406
          </button>
        </section>
      </div>
    </main>
  );
}
