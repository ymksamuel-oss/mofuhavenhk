import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

/**
 * Hero Banner Component
 * Design: Japanese Healing Aesthetic
 * - Main banner image: mofu-haven-website-b.png (complete, no cropping)
 * - Overlay with brand message
 * - Soft, warm aesthetic
 * Cache Bust: 2026-08-10T09:27:00Z
 */
export default function HeroBanner() {
  return (
    <section className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
      {/* Main Banner Image */}
      <img
        src="/manus-storage/mofu-haven-website-b.png(6)_c71484d9.png"
        alt="Mofu Haven - 寵物與產品"
        className="w-full h-full object-cover"
      />

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent pointer-events-none" />

      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col justify-center items-start container pointer-events-auto">
        <div className="max-w-md md:max-w-lg space-y-4 md:space-y-6 text-white">
          {/* Badge */}
          <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30 pointer-events-none">
            <span className="text-sm font-medium">日本直送・嚴選寵物好物</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            Mofu Haven
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-white/90">
            日本寵物用品專門店
          </p>

          {/* Description */}
          <p className="text-base md:text-lg text-white/80 max-w-sm">
            直送日本優質寵物用品，讓您嘅貓貓狗狗幸福滿分。
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              asChild
              size="lg"
              className="bg-[#D3A87C] text-white hover:bg-[#C2976B] font-semibold shadow-md"
            >
              <a href="/?category=all#products">立即選購 →</a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-[#F3E5D5] bg-transparent text-white hover:bg-[#D3A87C]/30 hover:text-white"
            >
              <a href="/#about"><ArrowDown className="w-4 h-4 mr-2" />探索品牌故事</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
