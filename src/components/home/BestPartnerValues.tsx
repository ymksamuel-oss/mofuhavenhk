const VALUES = [
  {
    icon: "🥩",
    title: "Slow-Dried with Care",
    body: "Concentrates the natural aroma of meat without chemical preservatives.",
  },
  {
    icon: "🦷",
    title: "Natural Dental Chewing",
    body: "Satisfying texture supports jaw exercise and everyday oral care.",
  },
  {
    icon: "🌿",
    title: "Single-Protein Recipes",
    body: "Clear, uncomplicated recipes made to be gentle on sensitive stomachs.",
  },
] as const;

export function BestPartnerValues() {
  return (
    <section
      aria-labelledby="best-partner-values-title"
      className="border-y border-[#e7d8c8] bg-[#f5ede3] px-4 py-6 sm:px-8 sm:py-8 lg:px-10"
    >
      <div className="mx-auto max-w-6xl rounded-[2rem] border border-[#eadbcb] bg-[#fffaf4] px-5 py-6 shadow-[0_22px_55px_-34px_rgba(93,67,48,0.55)] sm:px-8 sm:py-8 lg:px-14">
        <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#d9c0a8] bg-[#f4e5d6] px-3.5 py-1.5 text-[11px] font-bold tracking-[0.14em] text-[#7c5841]">
            <span aria-hidden="true">✦</span> Made in Aichi, Japan・Officially Imported
          </span>
          <h2
            id="best-partner-values-title"
            className="mt-4 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight tracking-tight text-[#49372c] sm:text-3xl lg:text-4xl"
          >
            Japanese-made, additive-free and naturally coloured — pure peace of mind in every bite
          </h2>
          <p className="mt-4 text-sm leading-7 text-[#725e50] sm:text-base sm:leading-8">
            From ingredients and preparation to packaging, every detail is selected for clarity, quality and everyday confidence.
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:mt-6 lg:grid-cols-3 lg:gap-5">
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
