import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import CategoryGrid from "@/components/CategoryGrid";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { BookOpen, PawPrint } from "lucide-react";
import { catBreedGuides } from "@shared/petWorld";

const featuredCatBreeds = catBreedGuides.slice(0, 3);

/**
 * Mofu Haven storefront home page.
 * Product data is loaded from Stripe through the public tRPC store router.
 */
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <HeroBanner />
        <section aria-labelledby="pet-world-banner" className="group relative overflow-hidden bg-gradient-to-r from-[#FDF8F2] via-[#F6EDE2] to-[#F1E4D6] py-5 md:py-8 border-y border-[#D3A87C]/25 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_16px_36px_rgba(140,107,83,0.18)] motion-reduce:transition-none motion-reduce:hover:transform-none">
          <div className="container relative z-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#D3A87C]/15 px-3.5 py-1 text-xs font-semibold text-[#8C6B53] md:text-sm">
                <PawPrint className="h-4 w-4 text-[#D3A87C]" />
                Mofu Haven 專題指南
              </div>
              <h2 id="pet-world-banner" className="text-2xl font-bold tracking-tight text-[#6F5645] md:text-4xl font-serif">
                探索寵物世界
              </h2>
              <p className="text-sm leading-relaxed text-[#6F5645]/80 md:text-base">
                精選 10 多種人氣貓咪品種深入介紹，結合日系治癒風格與科學飼養小筆記，陪伴您與毛孩共度溫馨愉悅的每一天。
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2" aria-label="熱門貓咪品種">
                {featuredCatBreeds.map((breed, index) => (
                  <a key={breed.name} href={`/pet-world#breed-${index + 1}`} className="group/breed relative block h-11 w-11 overflow-hidden rounded-full border-2 border-white bg-[#F3E5D5] shadow-sm transition-transform duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8C6B53] md:h-14 md:w-14" aria-label={`查看${breed.name}介紹`} title={breed.name}>
                    <img src={breed.image} alt={`${breed.name} 預覽`} loading="lazy" className="h-full w-full object-cover" onError={(event) => { event.currentTarget.style.opacity = "0.35"; }} />
                  </a>
                ))}
              </div>
              <Button asChild size="lg" className="rounded-full bg-[#D3A87C] text-white shadow-md hover:bg-[#C2976B] px-6 py-3 font-medium transition-all duration-300 hover:scale-105">
                <Link href="/pet-world">
                  <BookOpen className="h-4 w-4 mr-2" />
                  立即探索 →
                </Link>
              </Button>
            </div>
          </div>
        </section>
        <CategoryGrid />
        <ProductGrid />
      </main>
      <Footer />
    </div>
  );
}
