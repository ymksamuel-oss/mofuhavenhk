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
const HOME_BREED_PLACEHOLDER = "/manus-storage/mofu-haven-product-placeholder_002825b0.svg";

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
        <section aria-labelledby="pet-world-banner" className="group relative overflow-hidden bg-[#F7F3EE] py-5 md:py-8 border-y border-[#B88A58]/25 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_16px_36px_rgba(140,107,83,0.18)] motion-reduce:transition-none motion-reduce:hover:transform-none">
          <div className="container relative z-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#B88A58]/15 px-3.5 py-1 text-xs font-semibold text-[#736859] md:text-sm">
                <PawPrint className="h-4 w-4 text-[#B88A58]" />
                Mofu Haven 專題指南
              </div>
              <h2 id="pet-world-banner" className="text-2xl font-bold tracking-tight text-[#3E3A37] md:text-4xl font-serif">
                探索寵物世界
              </h2>
              <p className="text-sm leading-relaxed text-[#3E3A37]/80 md:text-base">
                精選 10 多種人氣貓咪品種深入介紹，結合日系治癒風格與科學飼養小筆記，陪伴您與毛孩共度溫馨愉悅的每一天。
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2" aria-label="熱門貓咪品種">
                {featuredCatBreeds.map((breed, index) => (
                  <a key={breed.name} href={`/pet-world#breed-${index + 1}`} className="group/breed relative block h-11 w-11 overflow-hidden rounded-full border-2 border-white bg-[#F7F3EE] shadow-sm transition-transform duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#736859] md:h-14 md:w-14" aria-label={`查看${breed.name}介紹`} title={breed.name}>
                    <img src={breed.image || HOME_BREED_PLACEHOLDER} alt={`${breed.name} 預覽`} loading="lazy" className={`h-full w-full ${breed.image ? "object-cover" : "object-contain p-2"}`} onError={(event) => { event.currentTarget.src = HOME_BREED_PLACEHOLDER; event.currentTarget.className = "h-full w-full object-contain p-2"; }} />
                  </a>
                ))}
              </div>
              <Button asChild size="lg" className="rounded-full bg-[#B88A58] text-white shadow-md hover:bg-[#A67C52] px-6 py-3 font-medium transition-all duration-300 hover:scale-105">
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
