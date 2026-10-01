import type { Metadata } from "next";
import Link from "next/link";
import { SupplierProfileSection } from "@/components/SupplierProfileSection";

export const metadata: Metadata = {
  title: "日本原裝製造商認證 | Mofu Haven HK",
  description: "查看 Best Partner 日本愛知縣豐橋市原廠資料、會社概要及 Mofu Haven 正品進口承諾。",
  alternates: { canonical: "https://www.mofuhavenhk.com/supplier-profile" },
};

export default function SupplierProfilePage() {
  return (
    <main className="min-h-screen bg-[#fbf9f5] text-[#49372c]">
      <section className="border-b border-[#eadbcb] bg-[#f5eadf] px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-bold tracking-[0.24em] text-[#a36b42]">✦ MOFU HAVEN OFFICIAL SOURCE ✦</p>
          <h1 className="mt-5 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
            🇯🇵 日本原裝製造商認證
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-8 text-[#725e50] sm:text-base">
            由日本愛知縣豐橋市 Best Partner 原廠，到香港毛孩家庭的日常餐桌；了解品牌會社概要、原廠位置及毛毛港正品進口承諾。
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/collections/bestsellers" className="inline-flex min-h-11 items-center rounded-full bg-[#7a4b31] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5e3928] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a36b42] focus-visible:ring-offset-2">
              瀏覽日本人氣商品
            </Link>
            <Link href="/brand/best-partner" className="inline-flex min-h-11 items-center rounded-full border border-[#cdb49e] bg-white px-5 py-3 text-sm font-semibold text-[#694633] transition hover:bg-[#fffaf4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a36b42] focus-visible:ring-offset-2">
              閱讀品牌故事
            </Link>
          </div>
        </div>
      </section>
      <SupplierProfileSection />
    </main>
  );
}
