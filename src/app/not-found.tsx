import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-[70vh] overflow-hidden bg-[#f8f3ed] px-5 py-10 sm:px-8 sm:py-16">
      <section className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-[#e2d0bf] bg-[#fdfaf6] shadow-[0_28px_70px_-44px_rgba(70,47,34,0.6)]">
        <Image
          src="/images/mofu-visuals/not-found-healing.jpg"
          alt="\u4e00\u96bb\u8c93\u54aa\u5f9e\u6728\u6ac3\u65c1\u63a2\u982d，\u72d7\u72d7\u6b63\u5728\u5bf5\u7269\u7aa9\u65c1\u5c0b\u627e\u597d\u7269。"
          width={2048}
          height={1150}
          priority
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#fffaf5]/95 via-[#fffaf5]/82 to-[#fffaf5]/8 sm:from-[#fffaf5]/92 sm:via-[#fffaf5]/66 sm:to-transparent" />
        <div className="relative flex min-h-[34rem] max-w-xl flex-col justify-center px-7 py-14 sm:min-h-[38rem] sm:px-14 lg:px-20">
          <p className="inline-flex w-fit items-center gap-2 rounded-full border border-[#d9c5b3] bg-white/75 px-4 py-2 text-xs font-semibold tracking-[0.16em] text-[#835d49] backdrop-blur-sm">
            MOFU HAVEN · LET&apos;S FIND THE WAY HOME
          </p>
          <p className="mt-8 font-[family-name:var(--font-display)] text-7xl leading-none text-[#5b3d2e] sm:text-9xl">404</p>
          <h1 className="mt-5 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight tracking-wide text-[#51372a] sm:text-5xl">
            \u9019\u88e1\u66ab\u6642\u627e\u4e0d\u5230，
            <br />
            \u4f46\u6bdb\u5b69\u7684\u597d\u7269\u9084\u5728\u7b49\u4f60。
          </h1>
          <p className="mt-5 max-w-md text-sm leading-7 text-[#775e50] sm:text-base">
            \u4e5f\u8a31\u9019\u4e00\u9801\u6b63\u5728\u6563\u6b65。\u4e0d\u5982\u5148\u56de\u5230\u9996\u9801，\u6216\u8005\u5230\u5546\u54c1\u76ee\u9304\u7e7c\u7e8c\u5c0b\u627e\u9069\u5408\u6bdb\u5b69\u7684\u65e5\u5e38\u5c0f\u9a5a\u559c。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/" className="inline-flex items-center gap-2 rounded-full bg-[#694633] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_22px_-15px_rgba(74,44,29,0.8)] transition hover:-translate-y-0.5 hover:bg-[#563526] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8e644d] focus-visible:ring-offset-2">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              \u8fd4\u56de\u9996\u9801
            </Link>
            <Link href="/menu" className="inline-flex items-center gap-2 rounded-full border border-[#cdb49e] bg-white/75 px-5 py-3 text-sm font-semibold text-[#694633] backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8e644d] focus-visible:ring-offset-2">
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              \u700f\u89bd\u5546\u54c1
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
