import { Button } from "@/components/ui/button";

/**
 * Sub Banner Component
 * Design: Japanese Healing Aesthetic
 * - Main banner image with proper Manus storage URL
 * - Warm, caring brand voice
 */
export default function SubBanner() {
  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 py-8">
      <div className="relative w-full rounded-2xl overflow-hidden shadow-sm bg-[oklch(0.95_0.01_70)] transition-all duration-300 ease-out hover:shadow-md">
        
        {/* Main Banner Image - Using Manus Storage URL */}
        <img 
          src="/manus-storage/mofu-haven-website-b.png(5)_36506602.png" 
          alt="Mofu Haven 毛毛港 日系質感寵物選物主視覺" 
          className="w-full h-auto object-contain block mx-auto rounded-2xl"
        />

        {/* Text Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none">
          <div className="max-w-xl space-y-3 text-white pointer-events-auto">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
              日本嚴選寵物用品
            </h1>
            <p className="text-sm md:text-base text-white/90">
              用溫暖陪伴毛孩每一刻
            </p>
            
            {/* CTA Button */}
            <div className="pt-4">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 font-semibold"
              >
                立即選購 →
              </Button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
