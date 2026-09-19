const FEATURES = [
  { icon: "🚚", title: "快速配送", body: "現貨商品安心寄送" },
  { icon: "🎁", title: "滿額免運", body: "滿 HK$450 即享免運" },
  { icon: "💬", title: "貼心客服", body: "有需要隨時聯絡我們" },
] as const;

export function FeatureBadges() {
  return (
    <section aria-label="配送服務、滿額免運及貼心客服" className="w-full bg-transparent px-4 py-3 sm:px-6">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-3 gap-2 sm:gap-4">
        {FEATURES.map((feature) => (
          <div key={feature.title} className="flex min-w-0 items-center justify-center gap-2 rounded-xl bg-[#fffaf4] px-2 py-3 text-center shadow-sm sm:gap-3 sm:px-4">
            <span className="text-xl sm:text-2xl" aria-hidden="true">{feature.icon}</span>
            <span className="min-w-0">
              <strong className="block truncate text-xs font-bold text-[#49372c] sm:text-sm">{feature.title}</strong>
              <span className="hidden text-xs text-[#806d5d] sm:block">{feature.body}</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
