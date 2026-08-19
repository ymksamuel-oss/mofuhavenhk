import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import SubBanner from "@/components/SubBanner";
import CategoryGrid from "@/components/CategoryGrid";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";

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
        <SubBanner />
        <ProductGrid />
        <CategoryGrid />
      </main>
      <Footer />
    </div>
  );
}
