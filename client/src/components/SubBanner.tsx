import { Button } from "@/components/ui/button";

/**
 * Sub Banner Component
 * Design: Japanese Healing Aesthetic
 * - Secondary banner image: IMG_0383 (warm, cozy moment)
 * - Asymmetric layout with text
 * - Enhanced signature elements: felt-like borders, warm glow
 * - Warm, caring brand voice
 */
export default function SubBanner() {
  return (
    <section id="about" className="relative scroll-mt-20 py-12 md:py-24 overflow-hidden">
      {/* Decorative Background with Warm Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="container relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left: Image with Felt-like Border */}
          <div className="relative group">
            {/* Warm glow background */}
            <div className="absolute -inset-4 bg-gradient-to-br from-primary/15 to-secondary/10 rounded-3xl blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            
            {/* Image with felt border effect */}
            <div className="relative border-4 border-dashed border-primary/20 rounded-2xl p-2 bg-white/50 backdrop-blur-sm">
              <img
                src="/manus-storage/IMG_0383(2)_d26569d4.png"
                alt="與毛孩的日常治癒"
                className="relative w-full h-auto rounded-xl shadow-lg object-cover"
              />
            </div>
          </div>

          {/* Right: Content with Warm Aesthetic */}
          <div className="space-y-6">
            {/* Accent Badge with Signature Style */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 pointer-events-none">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-primary">✨ 溫馨時刻</span>
            </div>

            {/* Heading - Warm, Caring Tone */}
            <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
              與毛孩的日常治癒
            </h2>

            {/* Description - Caring Brand Voice */}
            <p className="text-base md:text-lg text-foreground/75 leading-relaxed">
              精選日本天然寵物用品，陪伴毛孩每一個溫暖時刻。從營養美食到舒適用品，為您的毛孩慢慢挑選最好的照顧。
            </p>

            {/* Features List - Signature Elements */}
            <div className="space-y-3 pt-4">
              {[
                "日本直送優質產品",
                "嚴格品質把關",
                "天然成分，安心照顧"
              ].map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3 group/item">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover/item:from-primary/50 group-hover/item:to-primary/20 transition-all">
                    <div className="w-2.5 h-2.5 bg-primary rounded-full" />
                  </div>
                  <span className="text-sm md:text-base text-foreground/80 group-hover/item:text-foreground transition-colors">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA Button - Warm Invitation */}
            <div className="pt-4">
              <Button
                asChild
                size="lg"
                className="bg-[#D3A87C] text-white hover:bg-[#C2976B] font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group/btn"
              >
                <a href="/products">
                  為毛孩探索更多 →
                  <span className="ml-2 inline-block transition-transform group-hover/btn:translate-x-1" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
