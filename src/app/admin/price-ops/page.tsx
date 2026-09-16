"use client";

import { useRouter } from "next/navigation";

export default function PriceOperationsPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#f7f3ed] px-4 py-6 text-[#2f2a26] md:px-8">
      <div className="mx-auto max-w-4xl">
        <button type="button" onClick={() => router.push("/admin")} className="mb-5 text-sm font-medium text-[#806b5d]">
          ← 返回管理後台
        </button>
        <section className="rounded-3xl bg-white p-5 shadow-sm md:p-8">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#a36b42]">Price operations</p>
          <h1 className="mt-2 text-3xl font-semibold text-[#2f4a3c]">自動定價已停用</h1>
          <p className="mt-3 text-sm leading-6 text-[#806b5d]">
            店舖現已採用日本直送精品路線。成本價與港幣零售價分開管理，不再使用人民幣匯率、1.88 倍率或 .90 尾數規則自動重算。
          </p>
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
            請在產品編輯器直接輸入成本價（JPY）、售價（HKD）及原價（HKD）。儲存時三者會按輸入值獨立寫入，港幣售價不會被成本價覆蓋。
          </div>
          <button type="button" onClick={() => router.push("/admin")} className="mt-6 rounded-xl bg-[#2f4a3c] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#22372d]">
            返回產品管理
          </button>
        </section>
      </div>
    </main>
  );
}
