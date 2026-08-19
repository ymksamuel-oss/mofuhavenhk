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
    <section className="relative h-[280px] w-full overflow-hidden sm:h-[320px] md:h-[460px] lg:h-[560px]">
      {/* Main Banner Image */}
      <img
        src="/manus-storage/mofu-haven-website-b.png(6)_c71484d9.png"
        alt="Mofu Haven - 寵物與產品"
        className="w-full h-full object-cover"
      />

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent pointer-events-none" />

      {/* Content Overlay */}
      <div className="container pointer-events-auto absolute inset-0 flex items-center">
        <div className="max-w-[19rem] space-y-1.5 text-white sm:max-w-md sm:space-y-3 md:max-w-lg md:space-y-5">
          {/* Badge */}
          <div className="pointer-events-none inline-block rounded-full border border-white/30 bg-white/20 px-3 py-1.5 backdrop-blur-sm sm:px-4 sm:py-2">
            <span className="text-xs font-medium sm:text-sm">日本直送・嚴選寵物好物</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl lg:text-6xl">
            Mofu Haven
          </h1>

          {/* Subheading */}
          <p className="text-base text-white/90 sm:text-lg md:text-xl">
            日本寵物用品專門店
          </p>

          {/* Description */}
          <p className="max-w-sm text-sm text-white/80 sm:text-base md:text-lg">
            直送日本優質寵物用品，讓您嘅貓貓狗狗幸福滿分。
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-start gap-2 pt-1.5 sm:flex-row sm:gap-3 sm:pt-3">
            <Button
              asChild
              size="lg"
              className="w-fit self-start bg-[#D3A87C] px-5 py-2.5 text-white hover:bg-[#C2976B] font-semibold shadow-md"
            >
              <a href="/#product-list">立即選購 →</a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-fit self-start border-[#F3E5D5] bg-transparent px-4 py-2.5 text-white hover:bg-[#D3A87C]/30 hover:text-white"
            >
              <a href="/about"><ArrowDown className="mr-2 h-4 w-4" />探索品牌故事</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
