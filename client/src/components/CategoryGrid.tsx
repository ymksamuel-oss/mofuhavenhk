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

const categories = [
  { icon: Cat, label: "貓咪商品", desc: "為貓咪精心挑選", slug: "cats" },
  { icon: Dog, label: "狗狗商品", desc: "狗狗的最愛", slug: "dogs" },
  { icon: Bone, label: "寵物零食", desc: "健康小食", slug: "treats" },
  { icon: Droplet, label: "貓咪罐罐", desc: "濕糧與罐頭", slug: "wet-cans" },
  { icon: Gamepad2, label: "寵物玩具", desc: "快樂時光", slug: "toys" },
  { icon: Heart, label: "營養保健", desc: "健康守護", slug: "supplements" },
  { icon: Tag, label: "限時優惠", desc: "驚喜好康", slug: "deals" },
  { icon: TrendingUp, label: "熱賣商品", desc: "人氣推薦", slug: "bestsellers" },
  { icon: Backpack, label: "外出用品", desc: "便利同行", slug: "outdoor" },
  { icon: Rabbit, label: "小寵物商品", desc: "小動物的貼心照護", slug: "small-pets" },
];

export default function CategoryGrid() {
  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      <div className="pointer-events-none absolute left-0 top-1/3 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-secondary/5 blur-3xl" />

      <div className="container relative z-10">
        <div className="mb-12 text-center md:mb-16">
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">寵物分類導覽</h2>
          <p className="mx-auto max-w-2xl text-base text-foreground/70 md:text-lg">
            為毛孩慢慢挑選心水商品，每一件都是我們精心把關的好物。
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-3">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <a key={category.slug} href={`/?category=${category.slug}#products`} className="group">
                <Card className="flex h-10 min-h-10 cursor-pointer flex-row items-center justify-center gap-2 rounded-full border border-[#D3A87C]/55 bg-[#FFFDF9]/95 px-3 text-center shadow-[0_5px_16px_rgba(140,107,83,0.08)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#C9A47C] hover:bg-[#F3E5D5] hover:shadow-[0_8px_20px_rgba(140,107,83,0.15)] md:px-4">
                  <div className="relative flex shrink-0 items-center justify-center rounded-full border border-[#D3A87C]/35 bg-[#F3E5D5] p-1 transition-all duration-200 group-hover:bg-[#EAD2B9]">
                    <div className="pointer-events-none absolute inset-0 rounded-full bg-[#D3A87C]/25 blur-md opacity-0 transition-opacity group-hover:opacity-100" />
                    <Icon className="relative z-10 h-4 w-4 text-[#8C6B53]" />
                  </div>
                  <h3 className="mb-0 whitespace-nowrap text-xs font-semibold text-[#6F5645] transition-colors group-hover:text-[#8C6B53] md:text-sm">
                    {category.label}
                  </h3>
                </Card>
              </a>
            );
          })}
        </div>

        <div className="mt-12 text-center md:mt-16">
          <Button asChild size="lg" className="rounded-full bg-[#C9A47C] px-7 font-semibold text-white shadow-[0_8px_20px_rgba(140,107,83,0.18)] transition-all duration-300 hover:bg-[#8C6B53] hover:shadow-[0_12px_26px_rgba(140,107,83,0.24)]">
            <a href="/?category=all#products">為毛孩繼續選購 →</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
