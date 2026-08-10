import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import SubBanner from "@/components/SubBanner";
import CategoryGrid from "@/components/CategoryGrid";
import Footer from "@/components/Footer";

/**
 * Home Page
 * Design: Japanese Healing Aesthetic
 * - Main Banner: mofu-haven-website-b.png (complete, no cropping)
 * - Sub Banner: IMG_0383 (warm, cozy moment)
 * - Product Categories: Card-based grid
 * - Warm color palette, soft interactions
 */
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Banner */}
        <HeroBanner />

        {/* Sub Banner */}
        <SubBanner />

        {/* Category Grid */}
        <CategoryGrid />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
