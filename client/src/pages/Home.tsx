import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import CategoryGrid from "@/components/CategoryGrid";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { BookOpen, PawPrint } from "lucide-react";

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
        <CategoryGrid />
        <ProductGrid />
        <section aria-labelledby="pet-world-teaser" className="border-t border-[#D3A87C]/20 bg-[#F3E5D5] py-10 md:py-14">
          <div className="container flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#8C6B53]"><PawPrint className="h-4 w-4" />探索寵物世界</p>
              <h2 id="pet-world-teaser" className="mt-2 text-2xl font-bold text-[#6F5645] md:text-3xl">認識貓咪品種與日常飼養小筆記</h2>
              <p className="mt-2 text-sm leading-7 text-[#6F5645]/75">由 12 種常見貓咪品種到飲食、梳理、居家安全及遊戲提示，慢慢建立適合你與毛孩的生活節奏。</p>
            </div>
            <Button asChild className="w-fit rounded-full bg-[#D3A87C] text-white hover:bg-[#C2976B]"><Link href="/pet-world"><BookOpen className="h-4 w-4" />瀏覽探索指南</Link></Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
