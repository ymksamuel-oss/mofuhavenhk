const VALUES = [
  {
    icon: "🥩",
    title: "低溫慢火烘乾",
    body: "極致濃縮原肉香氣，零化學防腐劑天然保鮮。",
  },
  {
    icon: "🦷",
    title: "天然咀嚼潔牙",
    body: "帶韌嚼勁鍛鍊下顎，刺激唾液自然維持口腔健康。",
  },
  {
    icon: "🌿",
    title: "低敏單一肉源",
    body: "透明配方無繁雜添加物，溫柔呵護敏感腸胃。",
  },
] as const;

export function BestPartnerValues() {
  return (
    <section
      aria-labelledby="best-partner-values-title"
      className="border-y border-[#e7d8c8] bg-[#f5ede3] px-4 py-12 sm:px-8 sm:py-16 lg:px-10"
    >
      <div className="mx-auto max-w-6xl rounded-[2rem] border border-[#eadbcb] bg-[#fffaf4] px-5 py-9 shadow-[0_22px_55px_-34px_rgba(93,67,48,0.55)] sm:px-8 sm:py-12 lg:px-14">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#d9c0a8] bg-[#f4e5d6] px-3.5 py-1.5 text-[11px] font-bold tracking-[0.14em] text-[#7c5841]">
            <span aria-hidden="true">✦</span> 日本愛知縣原廠製造・正規進口
          </span>
          <h2
            id="best-partner-values-title"
            className="mt-4 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight tracking-tight text-[#49372c] sm:text-3xl lg:text-4xl"
          >
            堅持「日本產・無添加・無著色」，每一口都是純粹安心
          </h2>
          <p className="mt-4 text-sm leading-7 text-[#725e50] sm:text-base sm:leading-8">
            從原料、製法到包裝都堅持透明可追溯，讓毛拔麻為毛孩挑選時更簡單、更放心。
          </p>
        </div>

        <div className="mt-8 grid gap-3 sm:mt-10 lg:grid-cols-3 lg:gap-5">
          {VALUES.map((value) => (
            <div
              key={value.title}
              className="group flex items-start gap-4 rounded-2xl border border-[#eadbcb] bg-[#fbf6ef] px-4 py-5 shadow-[0_12px_24px_-22px_rgba(92,62,39,0.8)] transition duration-200 hover:-translate-y-0.5 hover:border-[#d5b496] hover:bg-[#f8efe5] sm:px-5"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#ead7c4] text-2xl shadow-inner" aria-hidden="true">
                {value.icon}
              </span>
              <div className="min-w-0">
                <h3 className="text-sm font-bold tracking-wide text-[#49372c] sm:text-base">{value.title}</h3>
                <p className="mt-1.5 text-xs leading-5 text-[#806d5d] sm:text-sm sm:leading-6">{value.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
