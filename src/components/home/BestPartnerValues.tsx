const VALUES = [
  {
    icon: "🥩",
    title: "低溫慢乾",
    body: "鮮味深層濃縮，零化學防腐劑",
  },
  {
    icon: "🦷",
    title: "天然嚼勁",
    body: "咀嚼鍛鍊下顎，維持口腔清潔",
  },
  {
    icon: "🌿",
    title: "低敏多元",
    body: "多款單一肉源，呵護腸胃健康",
  },
] as const;

export function BestPartnerValues() {
  return (
    <section
      aria-labelledby="best-partner-values-title"
      className="border-y border-[#e7d8c8] bg-[#f8f1e8] px-4 py-10 sm:px-8 sm:py-12 lg:px-10"
    >
      <div className="mx-auto max-w-6xl rounded-[2rem] border border-[#eadbcb] bg-[#fffaf4] px-5 py-8 shadow-[0_18px_45px_-34px_rgba(93,67,48,0.55)] sm:px-8 sm:py-10 lg:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full bg-[#eadbc9] px-3 py-1 text-[11px] font-bold tracking-[0.16em] text-[#7c5841]">
            BEST PARTNER 原廠堅持
          </span>
          <h2
            id="best-partner-values-title"
            className="mt-4 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight tracking-tight text-[#49372c] sm:text-3xl lg:text-4xl"
          >
            堅持『日本產 ‧ 無添加 ‧ 無著色』，每一口都是純粹安心
          </h2>
          <p className="mt-4 text-sm leading-7 text-[#725e50] sm:text-base sm:leading-8">
            為了在不使用防腐劑的前提下天然保鮮，我們以低溫慢火烘乾抽去水分。這不僅讓肉香極致濃縮，毛孩在咀嚼天然原肉嚼勁的同時，更能鍛鍊下顎肌肉並刺激唾液分泌，達到天然清潔口腔的健康效果。
          </p>
        </div>

        <div className="mt-8 grid gap-3 sm:mt-10 lg:grid-cols-3 lg:gap-5">
          {VALUES.map((value) => (
            <div
              key={value.title}
              className="flex items-center gap-3 rounded-2xl border border-[#eadbcb] bg-[#fbf6ef] px-4 py-4 sm:px-5"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#eee0cf] text-2xl" aria-hidden="true">
                {value.icon}
              </span>
              <div className="min-w-0">
                <h3 className="text-sm font-bold tracking-wide text-[#49372c] sm:text-base">{value.title}</h3>
                <p className="mt-1 text-xs leading-5 text-[#806d5d] sm:text-sm">{value.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
