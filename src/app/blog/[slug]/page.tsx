import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product/ProductCard";
import { getCatalogSnapshot } from "@/lib/catalog-server";
import { getKnowledgeArticle, KNOWLEDGE_ARTICLES, type KnowledgeArticle } from "@/lib/knowledge";
import type { Product } from "@/lib/products";

const SITE_URL = "https://www.mofuhavenhk.com";

type EnglishArticleCopy = {
  category: string;
  title: string;
  excerpt: string;
  coverAlt: string;
  tags: string[];
  intro: string;
  cta: string;
};

const ENGLISH_ARTICLES: Record<string, EnglishArticleCopy> = {
  "venison-benefits": {
    category: "Dog nutrition",
    title: "Venison for Dogs: A Lean, Thoughtful Protein Choice",
    excerpt: "A practical guide to venison, single-protein treats and everyday rotation for sensitive, neutered or picky dogs.",
    coverAlt: "A dog enjoying a natural meat treat",
    tags: ["#LeanProtein", "#DHA", "#SensitiveDogs"],
    intro: "Venison is not a miracle cure, but with transparent sourcing, simple ingredients and sensible portions, it can be a thoughtful lean-meat option for dogs.",
    cta: "Start with a thoughtful venison treat",
  },
  "picky-eater-toppings": {
    category: "Picky eating",
    title: "Four Gentle Toppers to Make Every Meal More Appealing",
    excerpt: "Build appetite with small, clear ingredients across meat, seafood, vegetables and cheese without relying on heavy sauces.",
    coverAlt: "Natural meat toppers prepared for a pet meal",
    tags: ["#PickyEaters", "#MealToppers", "#SimpleIngredients"],
    intro: "A dog losing interest in dry food may be responding to teeth, digestion, stress, treat balance or freshness. Small, trackable toppers can add aroma without turning every meal into a recipe experiment.",
    cta: "Make every meal more inviting",
  },
  "can-cats-eat-dog-food": {
    category: "Cat health",
    title: "Can Cats Eat Dog Food? What to Know About Taurine and Complete Nutrition",
    excerpt: "An occasional bite is different from replacing a cat’s complete diet. Learn where feline and canine nutritional needs differ.",
    coverAlt: "Cat-specific food and everyday nutrition",
    tags: ["#CatNutrition", "#Taurine", "#MultiPetHomes"],
    intro: "An occasional stolen piece of dog food is usually not an emergency. The important distinction is between a rare bite and using dog food as a cat’s everyday main diet.",
    cta: "Choose treats made for cats",
  },
  "hypoallergenic-red-meat": {
    category: "Sensitive-pet guide",
    title: "Sensitive Skin and Red Meat: A Clearer Way to Observe Food Reactions",
    excerpt: "From single proteins to slow introductions, learn how a steady routine can make food observations more useful.",
    coverAlt: "A dog resting calmly during a sensitive-care routine",
    tags: ["#SensitivePets", "#SingleProtein", "#SlowSwitch"],
    intro: "Itching and redness can have many causes. Red meat is not a universal solution, but a simple single-protein routine can help pet parents observe changes more systematically alongside veterinary advice.",
    cta: "Start with clear ingredients",
  },
  "soft-vs-hard-treats": {
    category: "Safe feeding",
    title: "Soft or Hard Treats? Choosing Texture for Every Life Stage",
    excerpt: "Puppies, adults and senior dogs have different teeth, chewing strength and swallowing habits. Match the texture to the pet.",
    coverAlt: "A dog with a natural dental chew",
    tags: ["#SafeFeeding", "#PuppyGuide", "#DentalChews"],
    intro: "Choosing a treat is not only about the word ‘long-lasting’. Texture should match age, dental condition, chewing strength and the supervision available at feeding time.",
    cta: "Choose the right texture for your pet",
  },
};

export function generateStaticParams() {
  return KNOWLEDGE_ARTICLES.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = getKnowledgeArticle(slug);
  const english = ENGLISH_ARTICLES[slug];
  if (!article) return { title: "Article not found | Mofu Haven" };
  return {
    title: `${english?.title ?? article.title} | Mofu Haven Pet Guide`,
    description: english?.excerpt ?? article.excerpt,
    alternates: { canonical: `${SITE_URL}/blog/${article.slug}` },
    openGraph: { type: "article", url: `${SITE_URL}/blog/${article.slug}`, title: english?.title ?? article.title, description: english?.excerpt ?? article.excerpt, images: [{ url: `${SITE_URL}${article.cover}`, alt: english?.coverAlt ?? article.coverAlt }] },
  };
}

function englishArticle(article: KnowledgeArticle): KnowledgeArticle {
  const copy = ENGLISH_ARTICLES[article.slug] ?? {
    category: "Pet care guide",
    title: "A practical guide to everyday pet care",
    excerpt: "Thoughtful, practical ideas for a healthier everyday routine with your companion.",
    coverAlt: "A pet enjoying a gentle everyday moment",
    tags: ["#PetCare"],
    intro: "Small, consistent choices can make everyday care clearer and more comfortable for your companion.",
    cta: "Explore thoughtful everyday essentials",
  };
  return {
    ...article,
    ...copy,
    readingTime: `${article.readingTime.match(/\d+/)?.[0] ?? "5"} min read`,
    sections: article.sections.map((section, index) => ({
      ...section,
      eyebrow: `${String(index + 1).padStart(2, "0")} · EVERYDAY CARE`,
      heading: ["Start with clear ingredients", "Build a steady routine", "Observe the details", "Choose with confidence"][index] ?? "Choose with confidence",
      body: "Choose clear ingredients, introduce changes gradually and observe your pet’s appetite, digestion, skin and energy. If symptoms persist or worsen, pause the experiment and speak with a registered veterinarian.",
      bullets: section.bullets?.map((_, bulletIndex) => ["Read the complete ingredient list", "Change one variable at a time", "Keep notes and ask your veterinarian"][bulletIndex] ?? "Keep the routine consistent"),
    })),
  };
}

function productSku(product: Product): string {
  return product.metadata?.mofu_sku?.trim() || product.tags?.find((tag) => /^\d{8,14}$/.test(tag)) || "";
}

function pickProducts(products: Product[], skus: string[]): Product[] {
  const bySku = new Map(products.map((product) => [productSku(product), product]));
  return skus.map((sku) => bySku.get(sku)).filter((product): product is Product => Boolean(product));
}

function ArticleHeader({ article, english }: { article: KnowledgeArticle; english: boolean }) {
  return (
    <header className="relative isolate overflow-hidden bg-[#FFFFFF]"><div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(91,55,37,.74),rgba(91,55,37,.18))]" /><div className="relative mx-auto grid max-w-6xl gap-8 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:py-24"><div className="max-w-3xl text-white"><Link href="/#explore-pets" className="text-xs font-bold tracking-[0.18em] text-white/80 hover:text-white">{english ? "Explore the pet world" : "探索寵物世界"} / {article.category}</Link><div className="mt-8 flex flex-wrap items-center gap-2 text-xs font-semibold"><span className="rounded-full border border-white/35 bg-white/15 px-3 py-1.5 backdrop-blur">{article.category}</span><span className="text-white/75">{english ? "Reading time" : "閱讀時間"} {article.readingTime}</span></div><h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.13] tracking-tight sm:text-5xl lg:text-6xl">{article.title}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-white/90">{article.excerpt}</p><div className="mt-7 flex flex-wrap gap-2">{article.tags.map((tag) => <span key={tag} className="rounded-full bg-[#FFFFFF]/90 px-3 py-1.5 text-xs font-bold text-[#7d5037] shadow-sm">{tag}</span>)}</div></div><div className="relative overflow-hidden rounded-[2rem] border border-white/50 bg-[#FFFFFF] shadow-[0_24px_60px_-30px_rgba(60,37,25,.65)]"><img src={article.cover} alt={article.coverAlt} className="aspect-[4/3] w-full object-cover" /><div className="absolute bottom-4 left-4 rounded-2xl bg-white/90 px-4 py-3 text-sm font-semibold text-[#634331] shadow-lg backdrop-blur">Mofu Haven · {english ? "Pet guide" : "探索寵物世界"}</div></div></div></header>
  );
}

export default async function KnowledgeArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getKnowledgeArticle(slug);
  if (!article) notFound();
  const localeCookie = (await cookies()).get("NEXT_LOCALE")?.value;
  const english = localeCookie === "en" || localeCookie === "en-HK";
  const displayArticle = english ? englishArticle(article) : article;
  let products: Product[] = [];
  try { products = pickProducts((await getCatalogSnapshot()).products, displayArticle.productSkus); } catch (error) { console.error("[knowledge] catalog unavailable", error); }
  const articleJsonLd = { "@context": "https://schema.org", "@type": "Article", headline: displayArticle.title, description: displayArticle.excerpt, image: `${SITE_URL}${displayArticle.cover}`, datePublished: "2026-09-21", dateModified: "2026-09-21", author: { "@type": "Organization", name: "Mofu Haven" }, publisher: { "@type": "Organization", name: "Mofu Haven" }, mainEntityOfPage: `${SITE_URL}/blog/${displayArticle.slug}` };
  return <main className="min-h-screen bg-white text-[#4b352a]"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} /><ArticleHeader article={displayArticle} english={english} /><article className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14"><div className="rounded-3xl border border-[#F1F1F1] bg-[#FFFFFF] p-6 shadow-[0_20px_50px_-38px_rgba(84,57,45,.5)] sm:p-9"><p className="text-lg leading-8 text-[#634b3d] sm:text-xl">{displayArticle.intro}</p><p className="mt-5 text-sm leading-7 text-[#8a7163]">{english ? "This article is general pet-health education and cannot replace veterinary diagnosis. If your pet has persistent symptoms, a chronic condition or ongoing medication, consult your primary veterinarian before changing diet." : "本文為一般寵物健康教育，不能代替獸醫診斷。若毛孩有持續症狀、慢性病或正在服藥，轉換飲食前請先向主診獸醫確認。"}</p></div><div className="mt-14 space-y-14">{displayArticle.sections.map((section, index) => <section key={section.heading} aria-labelledby={`section-${index}`}><div className="mb-6 flex items-start gap-4"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#8b573f] text-xl text-white">{String(index + 1).padStart(2, "0")}</span><div><p className="text-xs font-bold tracking-[0.16em] text-[#a76443]">{section.eyebrow}</p><h2 id={`section-${index}`} className="mt-1 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-[#4b352a]">{section.heading}</h2></div></div><p className="text-base leading-8 text-[#634b3d]">{section.body}</p>{section.bullets ? <ul className="mt-5 grid gap-3 sm:grid-cols-3">{section.bullets.map((bullet) => <li key={bullet} className="rounded-2xl border border-[#F1F1F1] bg-[#FFFFFF] p-4 text-sm font-semibold leading-6 text-[#76594a]">✓ {bullet}</li>)}</ul> : null}</section>)}</div><section className="mt-16 rounded-3xl bg-[#5c4638] p-7 text-[#FFFFFF] sm:p-9" aria-labelledby="article-cta"><p className="text-xs font-bold tracking-[0.18em] text-[#eac4a5]">SHOP THE STORY</p><h2 id="article-cta" className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold">{displayArticle.cta}</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-white/80">{english ? "These products are selected around the article theme and loaded from the live catalog. Use the cart button on a product card to add an item." : "以下商品按文章主題精選，從店內目錄即時載入；商品卡上的購物車按鈕可以一鍵加入購物車。"}</p>{products.length ? <div className="mt-7 grid gap-5 sm:grid-cols-3">{products.map((product, index) => <ProductCard key={product.id} product={product} priority={index === 0} showPurchaseControls />)}</div> : <div className="mt-7 rounded-2xl border border-white/15 bg-white/10 p-6 text-sm text-white/75">{english ? "The catalog is updating. Please check back shortly for recommended products." : "商品目錄正在更新，請稍後再回來查看推薦商品。"}</div>}<Link href="/#explore-pets" className="mt-8 inline-flex text-sm font-bold text-[#f7d8bc] hover:text-white">{english ? "Back to explore the pet world →" : "返回探索寵物世界 →"}</Link></section></article></main>;
}
