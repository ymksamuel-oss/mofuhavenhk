import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Cat,
  Dog,
  Bone,
  Gamepad2,
  Heart,
  Droplet,
  Tag,
  TrendingUp,
  Backpack,
} from "lucide-react";

/**
 * Category Grid Component
 * Design: Japanese Healing Aesthetic
 * - Card-based layout with icons
 * - Soft hover effects with signature elements
 * - Warm color palette
 * - Caring brand voice
 */

const categories = [
  { icon: Cat, label: "貓咪商品", desc: "為貓咪精心挑選", href: "#products" },
  { icon: Dog, label: "狗狗商品", desc: "狗狗的最愛", href: "#products" },
  { icon: Bone, label: "寵物小食", desc: "健康零食", href: "#products" },
  { icon: Gamepad2, label: "寵物玩具", desc: "快樂時光", href: "#products" },
  { icon: Heart, label: "營養保健", desc: "健康守護", href: "#products" },
  { icon: Droplet, label: "居家清潔", desc: "清爽環境", href: "#products" },
  { icon: Tag, label: "限時優惠", desc: "驚喜好康", href: "#products" },
  { icon: TrendingUp, label: "熱賣商品", desc: "人氣推薦", href: "#products" },
  { icon: Backpack, label: "外出用品", desc: "便利同行", href: "#products" },
];

export default function CategoryGrid() {
  return (
    <section id="products" className="scroll-mt-24 py-16 md:py-24 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute left-0 top-1/3 w-72 h-72 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute right-0 bottom-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -z-10" />

      <div className="container relative z-10">
        {/* Section Header - Warm, Inviting */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            寵物分類導覽
          </h2>
          <p className="text-base md:text-lg text-foreground/70 max-w-2xl mx-auto">
            為毛孩慢慢挑選心水商品，每一件都是我們精心把關的好物。
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <a
                key={index}
                href={category.href}
                className="group"
              >
                <Card className="h-full p-6 md:p-8 flex flex-col items-center justify-center text-center hover:shadow-lg hover:border-primary/40 transition-all duration-300 cursor-pointer bg-white/80 hover:bg-white backdrop-blur-sm border-2 border-transparent group-hover:border-dashed group-hover:border-primary/20">
                  {/* Icon Container with Warm Glow */}
                  <div className="mb-4 p-4 bg-gradient-to-br from-primary/15 to-primary/5 rounded-full group-hover:from-primary/25 group-hover:to-primary/10 transition-all duration-300 relative">
                    {/* Subtle glow effect */}
                    <div className="absolute inset-0 rounded-full bg-primary/10 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Icon className="w-6 h-6 md:w-8 md:h-8 text-primary relative z-10" />
                  </div>

                  {/* Label */}
                  <h3 className="text-sm md:text-base font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
                    {category.label}
                  </h3>

                  {/* Description - Caring Tone */}
                  <p className="text-xs text-muted-foreground group-hover:text-foreground/60 transition-colors">
                    {category.desc}
                  </p>
                </Card>
              </a>
            );
          })}
        </div>

        {/* CTA - Warm Invitation */}
        <div className="text-center mt-12 md:mt-16">
          <Button
            asChild
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <a href="#products">為毛孩繼續選購 →</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
