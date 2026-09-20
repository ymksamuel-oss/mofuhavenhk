"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/I18nProvider";

const QUALITY_PROMISES = [
  {
    icon: "01",
    title: "\u5805\u6301『\u65e5\u672c\u570b\u7522 ‧ \u96f6\u6dfb\u52a0 ‧ \u7121\u8457\u8272』",
    body: "\u6211\u5011\u6df1\u4fe1\u5316\u5b78\u6dfb\u52a0\u7269\u4e26\u975e\u6bdb\u5b69\u6240\u9700。\u5168\u7cfb\u5217\u98df\u54c1\u7d55\u4e0d\u6dfb\u52a0\u4eba\u5de5\u9632\u8150\u5291、\u5408\u6210\u9999\u7cbe\u8207\u5316\u5b78\u8272\u7d20，\u8b93\u6bdb\u5b69\u6bcf\u4e00\u53e3\u5403\u5230\u7684，\u90fd\u662f\u98df\u6750\u672c\u4f86\u7684\u5473\u9053。",
  },
  {
    icon: "02",
    title: "\u6162\u706b\u4f4e\u6eab\u98a8\u4e7e，\u9396\u4f4f\u539f\u8089\u56bc\u52c1\u8207\u53e3\u8154\u5065\u5eb7",
    body: "\u65e5\u672c\u539f\u5ee0\u4ee5\u4f4e\u6eab\u6162\u706b\u70d8\u4e7e\u62bd\u8d70\u6c34\u5206，\u5c07\u8089\u9999\u8207\u9bae\u5473\u6fc3\u7e2e\u81f3\u6975\u81f4。\u5929\u7136\u539f\u8089\u7e96\u7dad\u8b93\u6bdb\u5b69\u5728\u5480\u56bc\u6642\u935b\u934a\u4e0b\u984e\u54ac\u5408\u529b、\u523a\u6fc0\u553e\u6db2\u5206\u6ccc，\u9054\u5230\u5929\u7136\u6f54\u9f52\u8207\u53e3\u8154\u6e05\u6f54\u7684\u6548\u679c。",
  },
  {
    icon: "03",
    title: "\u95dc\u6ce8\u654f\u611f\u9ad4\u8cea，\u63d0\u4f9b\u591a\u5143\u55ae\u4e00\u8089\u6e90",
    body: "\u5317\u6d77\u9053\u9e7f\u8089、\u4f4e\u654f\u99ac\u8089、\u7cbe\u9078\u725b\u8089、\u7d14\u5929\u7136\u96de\u8089\u53ca\u6df1\u6d77\u9b5a\u4ecb，\u8b93\u4e0d\u540c\u9ad4\u8cea\u7684\u6bdb\u5b69\u90fd\u80fd\u627e\u5230\u5b89\u5fc3、\u7121\u8ca0\u64d4\u7684\u71df\u990a\u88dc\u7d66。",
  },
] as const;

const SERVICE_PROMISES = [
  {
    icon: "📦",
    title: "\u9806\u8c50\u901f\u904b ‧ \u5feb\u901f\u51fa\u8ca8",
    body: "\u9999\u6e2f\u73fe\u8ca8\u65bc 1–2 \u500b\u5de5\u4f5c\u5929\u5167\u767c\u8ca8，\u5168\u55ae\u6eff HK$450 \u5373\u4eab\u672c\u5730\u9806\u8c50\u514d\u904b。",
  },
  {
    icon: "🏷️",
    title: "\u6b63\u898f\u7d93\u71df ‧ \u539f\u88dd\u6b63\u54c1",
    body: "\u6211\u5011\u6301\u6709\u6709\u6548\u9999\u6e2f\u5546\u696d\u767b\u8a18，\u5546\u54c1\u5747\u7531\u65e5\u672c\u539f\u88dd\u9032\u53e3，\u56b4\u683c\u628a\u95dc\u4fdd\u8cea\u671f\u8207\u5305\u88dd\u5b8c\u6574\u6027。",
  },
  {
    icon: "💬",
    title: "WhatsApp \u5c08\u4eba\u8aee\u8a62",
    body: "\u7121\u8ad6\u662f\u8001\u72ac\u5e7c\u72ac\u7684\u98df\u7269\u786c\u5ea6，\u9084\u662f\u654f\u611f\u9ad4\u8cea\u7684\u98df\u6750\u5efa\u8b70，\u90fd\u6b61\u8fce\u96a8\u6642\u8207\u6211\u5011\u4ea4\u6d41\u6bdb\u5b69\u7684\u98f2\u98df\u65e5\u5e38。",
  },
] as const;

export function AboutUsPage() {
  const { t } = useI18n();

  return (
    <main className="bg-[#fbf7f1]">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-[color:var(--muted)] transition hover:text-[color:var(--accent)]"
        >
          ← {t("infoPageBack")}
        </Link>

        <article className="mt-6 overflow-hidden rounded-[2rem] border border-[#e9dccd] bg-[#fffdf9] shadow-[0_28px_60px_-38px_rgba(91,65,45,0.38)]">
          <header className="relative overflow-hidden bg-[#f2e5d5] px-6 py-14 sm:px-12 sm:py-20 lg:px-20">
            <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#ead3bb]/55 blur-2xl" aria-hidden="true" />
            <div className="relative max-w-3xl">
              <p className="text-[11px] font-bold tracking-[0.2em] text-[#8a5d42]">MOFU HAVEN · ABOUT US</p>
              <h1 className="mt-5 max-w-3xl font-[family-name:var(--font-display)] text-3xl font-semibold leading-[1.2] tracking-tight text-[#49372c] sm:text-5xl lg:text-6xl">
                \u7d66\u6bdb\u5b69\u6700\u7d14\u7cb9\u7684\u611b，\u5f9e\u4e00\u53e3\u5b89\u5fc3\u7684\u5929\u7136\u597d\u8089\u958b\u59cb。
              </h1>
              <p className="mt-7 max-w-2xl font-[family-name:var(--font-display)] text-lg leading-8 text-[#725846] sm:text-xl">
                「\u8eab\u70ba\u6bdb\u5b69\u7684\u5bb6\u4eba，\u6211\u5011\u6bcf\u4e00\u6b21\u7ffb\u770b\u6210\u5206\u6a19\u7c64，\u5c0b\u627e\u7684\u4e0d\u904e\u662f\u4e00\u4efd\u8e0f\u5be6\u7684\u5b89\u5fc3。」
              </p>
            </div>
          </header>

          <section className="px-6 py-12 sm:px-12 sm:py-16 lg:px-20" aria-labelledby="origin-title">
            <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
              <div>
                <p className="text-xs font-bold tracking-[0.16em] text-[#a36b49]">OUR BEGINNING</p>
                <h2 id="origin-title" className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold text-[#49372c] sm:text-3xl">
                  \u6bdb\u6bdb\u6e2f\u7684\u8a95\u751f
                </h2>
              </div>
              <div className="space-y-5 text-[0.98rem] leading-8 text-[#725e50]">
                <p>\u5728\u9999\u6e2f\u9019\u5ea7\u5feb\u7bc0\u594f\u7684\u57ce\u5e02\u88e1，\u6bcf\u7576\u75b2\u618a\u6b78\u5bb6，\u770b\u898b\u6bdb\u5b69\u6416\u8457\u5c3e\u5df4\u8fce\u4e0a\u4f86、\u6216\u662f\u8e6d\u5728\u8173\u908a\u767c\u51fa\u547c\u5695\u8072，\u90a3\u4e00\u523b\u7684\u6eab\u6696，\u662f\u751f\u6d3b\u4e2d\u6700\u73cd\u8cb4\u7684\u6cbb\u7652。</p>
                <p>\u6211\u5011\u548c\u4f60\u4e00\u6a23，\u90fd\u662f\u5168\u5fc3\u5168\u610f\u611b\u8457\u6bdb\u5b69\u7684\u5bb6\u9577。\u6211\u5011\u6df1\u77e5\u5e02\u9762\u4e0a\u5145\u65a5\u8457\u542b\u6709\u5316\u5b78\u8a98\u98df\u5291、\u9632\u8150\u5291\u8207\u4eba\u5de5\u8272\u7d20\u7684\u96f6\u98df，\u7522\u5730\u8207\u539f\u6599\u6a19\u793a\u4ea6\u5f80\u5f80\u6a21\u7cca\u4e0d\u6e05。</p>
                <p>\u70ba\u4e86\u7d66\u5bb6\u88e1\u7684\u6bdb\u5b69\u5c0b\u627e\u6700\u4e7e\u6de8、\u6700\u7d14\u7cb9\u7684\u98df\u7269，\u6211\u5011\u5275\u7acb\u4e86「\u6bdb\u6bdb\u6e2f Mofu Haven」——\u4e00\u500b\u5c08\u70ba\u9999\u6e2f\u8c93\u72d7\u7cbe\u9078\u65e5\u672c\u539f\u88dd、\u5929\u7136\u7121\u6dfb\u52a0\u98df\u54c1\u8207\u751f\u6d3b\u826f\u54c1\u7684\u6eab\u99a8\u6e2f\u7063。</p>
              </div>
            </div>
          </section>

          <section className="border-t border-[#eee2d5] bg-[#faf4ec] px-6 py-12 sm:px-12 sm:py-16 lg:px-20" aria-labelledby="quality-title">
            <div className="max-w-2xl">
              <p className="text-xs font-bold tracking-[0.16em] text-[#a36b49]">OUR STANDARD</p>
              <h2 id="quality-title" className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold text-[#49372c] sm:text-3xl">\u4e09\u5927\u54c1\u8cea\u627f\u8afe</h2>
              <p className="mt-4 leading-7 text-[#725e50]">\u6211\u5011\u6df1\u5165\u65e5\u672c\u5728\u5730，\u56b4\u9078\u6b77\u53f2\u60a0\u4e45、\u5099\u53d7\u4fe1\u8cf4\u7684\u539f\u5ee0\u54c1\u724c。\u6bcf\u4e00\u4ef6\u62b5\u9054\u6bdb\u6bdb\u6e2f\u7684\u7522\u54c1，\u90fd\u9075\u5faa\u7121\u53ef\u59a5\u5354\u7684\u54c1\u8cea\u6a19\u6e96。</p>
            </div>
            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {QUALITY_PROMISES.map((promise) => (
                <article key={promise.icon} className="rounded-2xl border border-[#eadbcb] bg-[#fffdf9] p-5 shadow-[0_16px_30px_-28px_rgba(91,65,45,0.5)] sm:p-6">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#eadbc9] text-xs font-bold text-[#8a5d42]">{promise.icon}</span>
                  <h3 className="mt-5 font-[family-name:var(--font-display)] text-lg font-semibold leading-7 text-[#49372c]">{promise.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#806d5d]">{promise.body}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="px-6 py-12 sm:px-12 sm:py-16 lg:px-20" aria-labelledby="service-title">
            <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
              <div>
                <p className="text-xs font-bold tracking-[0.16em] text-[#a36b49]">OUR CARE</p>
                <h2 id="service-title" className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold text-[#49372c] sm:text-3xl">\u5728\u5730\u5b89\u5fc3\u670d\u52d9</h2>
              </div>
              <div className="grid gap-3">
                {SERVICE_PROMISES.map((service) => (
                  <article key={service.title} className="flex gap-4 rounded-2xl border border-[#eadbcb] bg-[#fffaf4] p-5 sm:p-6">
                    <span className="text-2xl" aria-hidden="true">{service.icon}</span>
                    <div>
                      <h3 className="font-semibold text-[#49372c]">{service.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-[#806d5d]">{service.body}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <footer className="border-t border-[#eadbcb] bg-[#f2e5d5] px-6 py-12 text-center sm:px-12 sm:py-16 lg:px-20">
            <p className="mx-auto max-w-2xl font-[family-name:var(--font-display)] text-xl font-semibold leading-9 text-[#49372c] sm:text-2xl">
              \u9858\u6bcf\u4e00\u4efd\u9001\u5230\u4f60\u624b\u4e0a\u7684\u65e5\u672c\u597d\u7269，\u90fd\u6210\u70ba\u6bdb\u5b69\u65e5\u5e38\u88e1\u4e00\u4efd\u6eab\u67d4\u800c\u8e0f\u5be6\u7684\u5e78\u798f。
            </p>
            <Link href="/menu" className="mt-7 inline-flex min-h-11 items-center justify-center rounded-2xl bg-[#7b4b31] px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_24px_-16px_rgba(91,65,45,0.8)] transition hover:-translate-y-0.5 hover:bg-[#694027] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7b4b31] focus-visible:ring-offset-2">
              \u63a2\u7d22\u5168\u5e97\u5546\u54c1
            </Link>
          </footer>
        </article>
      </div>
    </main>
  );
}
