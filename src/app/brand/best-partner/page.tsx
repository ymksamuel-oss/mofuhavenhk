import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Best Partner Brand Story | Mofu Haven HK",
  description: "Discover Best Partner's Japanese commitment to domestic ingredients, additive-free recipes and gentle low-temperature drying.",
};

const PRINCIPLES = [
  {
    number: "01",
    title: "Additive-Free and Naturally Pure",
    body: "We minimise artificial preservatives, colours and chemical additives so every bite stays close to the natural ingredient.",
  },
  {
    number: "02",
    title: "100% Japanese Ingredients",
    body: "We select locally sourced Japanese meats and produce with clear origins for dependable quality and authentic flavour.",
  },
  {
    number: "03",
    title: "Gentle Low-Temperature Drying",
    body: "Time and gentle heat remove moisture without relying on preservatives, preserving flavour while offering a satisfying natural chew.",
  },
] as const;

const PRODUCT_LINES = [
  {
    eyebrow: "FOR DOG",
    title: "Dog Treats",
    body: "Chicken, beef, venison, fish, freeze-dried produce, dental chews and meal toppers for dogs.",
    href: "/categories/dogs",
    cta: "Shop Dog Treats",
  },
  {
    eyebrow: "FOR CAT",
    title: "Cat Treats",
    body: "Additive-free fish, chicken and seafood treats with natural aroma and satisfying texture for cats.",
    href: "/categories/cats",
    cta: "Explore Cat Treats",
  },
  {
    eyebrow: "VALUE BUNDLES",
    title: "Official Food Bundles",
    body: "Curated Japanese food and treat combinations for everyday nourishment, dental care and variety.",
    href: "/collections/value-bundles",
    cta: "View Food Bundles",
  },
] as const;

export default function BestPartnerConceptPage() {
  return (
    <main className="min-h-screen bg-[#fbf7f2] text-[#49372c]">
      <section className="relative overflow-hidden border-b border-[#eadbcb] bg-[#f5eadf] px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
        <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-[#ead3bc]/45 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-[#e7d1b9]/35 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto max-w-5xl text-center">
          <p className="text-xs font-bold tracking-[0.28em] text-[#9a6547] sm:text-sm">BEST PARTNER · JAPAN</p>
          <h1 className="mx-auto mt-5 max-w-4xl font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight tracking-tight text-[#49372c] sm:text-5xl lg:text-6xl">
            Best Partner Japan · Domestic Ingredients, Additive-Free and Naturally Pure
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[#725e50] sm:text-lg">
            Pure, reassuring flavour for pets, bringing a little more happiness to every everyday meal.
          </p>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 sm:py-20 lg:px-12" aria-labelledby="principles-title">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold tracking-[0.24em] text-[#a36b42]">OUR PRINCIPLES</p>
            <h2 id="principles-title" className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold sm:text-4xl">Care in Every Production Detail</h2>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {PRINCIPLES.map((principle) => (
              <article key={principle.number} className="rounded-[1.75rem] border border-[#eadbcb] bg-[#fffdf9] p-6 shadow-[0_18px_42px_-32px_rgba(93,67,48,0.6)] sm:p-8">
                <span className="text-sm font-bold tracking-[0.18em] text-[#b27b50]">{principle.number}</span>
                <h3 className="mt-5 text-xl font-semibold leading-snug text-[#49372c]">{principle.title}</h3>
                <p className="mt-4 text-sm leading-7 text-[#725e50]">{principle.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#eadbcb] bg-[#f5eadf] px-5 py-14 sm:px-8 sm:py-20 lg:px-12" aria-labelledby="product-lines-title">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-xs font-bold tracking-[0.24em] text-[#a36b42]">PRODUCT LINES</p>
            <h2 id="product-lines-title" className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold sm:text-4xl">Thoughtful Everyday Essentials for Every Pet</h2>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {PRODUCT_LINES.map((line) => (
              <article key={line.title} className="flex flex-col rounded-[1.75rem] bg-[#fffdf9] p-6 shadow-[0_18px_42px_-32px_rgba(93,67,48,0.55)] sm:p-8">
                <p className="text-[11px] font-bold tracking-[0.24em] text-[#b27b50]">{line.eyebrow}</p>
                <h3 className="mt-3 text-2xl font-semibold text-[#49372c]">{line.title}</h3>
                <p className="mt-4 flex-1 text-sm leading-7 text-[#725e50]">{line.body}</p>
                <Link href={line.href} className="mt-7 inline-flex w-fit items-center rounded-full bg-[#7a4b31] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5e3928]">
                  {line.cta} <span className="ml-2" aria-hidden="true">→</span>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 sm:py-20 lg:px-12" aria-labelledby="recommendation-title">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-[#ddc5ad] bg-[#fffaf4] px-6 py-9 text-center shadow-[0_20px_48px_-34px_rgba(93,67,48,0.6)] sm:px-12 sm:py-12">
          <p className="text-2xl" aria-hidden="true">✦</p>
          <h2 id="recommendation-title" className="mt-4 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight sm:text-3xl">Recommended for Families Who Value Pure Everyday Care</h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#725e50] sm:text-base">
            A thoughtful choice for senior dogs, sensitive stomachs and families who value pure, minimally processed food.
          </p>
          <div className="mt-7 rounded-2xl bg-[#f5eadf] px-5 py-4 text-sm font-semibold leading-7 text-[#684a38]">
            Authenticity assured: genuine Japanese products officially imported by Mofu Haven HK.
          </div>
        </div>
      </section>
    </main>
  );
}
