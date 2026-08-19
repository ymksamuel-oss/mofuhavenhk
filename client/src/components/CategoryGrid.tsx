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
  Rabbit,
} from "lucide-react";
import { storefrontCategories } from "@shared/categoryNavigation";

const categoryIcons = {
  cats: Cat,
  dogs: Dog,
  "small-pets": Rabbit,
  treats: Bone,
  "wet-cans": Droplet,
  toys: Gamepad2,
  supplements: Heart,
  deals: Tag,
  bestsellers: TrendingUp,
  outdoor: Backpack,
} as const;

const categories = storefrontCategories.map((category) => ({
  ...category,
  icon: categoryIcons[category.slug],
}));

export default function CategoryGrid() {
  return (
    <section aria-label="商品分類" className="relative overflow-hidden bg-[#FFFDF9] py-3 sm:py-4 md:py-12">
      <div className="pointer-events-none absolute left-0 top-1/3 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-secondary/5 blur-3xl" />

      <div className="container relative z-10">
        <div className="mb-2 hidden text-center md:mb-5 md:block">
          <h2 className="text-2xl font-bold text-foreground md:text-3xl">寵物分類導覽</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-foreground/70 md:text-base">
            為毛孩慢慢挑選心水商品，每一件都是我們精心把關的好物。
          </p>
        </div>

        <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <a key={category.slug} href={`/products?category=${category.slug}`} className="group shrink-0 snap-start">
                <Card className="flex h-9 min-h-9 w-max cursor-pointer flex-row items-center justify-center gap-1.5 rounded-full border border-[#D3A87C]/55 bg-[#FFFDF9]/95 px-2.5 text-center shadow-[0_5px_16px_rgba(140,107,83,0.08)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#C9A47C] hover:bg-[#F3E5D5] hover:shadow-[0_8px_20px_rgba(140,107,83,0.15)]">
                  <div className="relative flex shrink-0 items-center justify-center rounded-full border border-[#D3A87C]/35 bg-[#F3E5D5] p-1 transition-all duration-200 group-hover:bg-[#EAD2B9]">
                    <div className="pointer-events-none absolute inset-0 rounded-full bg-[#D3A87C]/25 blur-md opacity-0 transition-opacity group-hover:opacity-100" />
                    <Icon className="relative z-10 h-4 w-4 text-[#8C6B53]" />
                  </div>
                  <h3 className="mb-0 whitespace-nowrap text-[11px] font-semibold text-[#6F5645] transition-colors group-hover:text-[#8C6B53]">
                    {category.label}
                  </h3>
                </Card>
              </a>
            );
          })}
        </div>

        <div className="mt-3 hidden text-center md:mt-8 md:block">
          <Button asChild size="lg" className="rounded-full bg-[#C9A47C] px-7 font-semibold text-white shadow-[0_8px_20px_rgba(140,107,83,0.18)] transition-all duration-300 hover:bg-[#8C6B53] hover:shadow-[0_12px_26px_rgba(140,107,83,0.24)]">
            <a href="/products?category=all">為毛孩繼續選購 →</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
