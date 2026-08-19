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
                <Card className="flex h-full cursor-pointer flex-col items-center justify-center border-2 border-transparent bg-white/80 p-6 text-center backdrop-blur-sm transition-all duration-300 hover:border-dashed hover:border-primary/20 hover:bg-white hover:shadow-lg md:p-8">
                  <div className="relative mb-4 rounded-full bg-gradient-to-br from-primary/15 to-primary/5 p-4 transition-all duration-300 group-hover:from-primary/25 group-hover:to-primary/10">
                    <div className="pointer-events-none absolute inset-0 rounded-full bg-primary/10 blur-lg opacity-0 transition-opacity group-hover:opacity-100" />
                    <Icon className="relative z-10 h-6 w-6 text-primary md:h-8 md:w-8" />
                  </div>
                  <h3 className="mb-1 text-sm font-semibold text-foreground transition-colors group-hover:text-primary md:text-base">
                    {category.label}
                  </h3>
                  <p className="text-xs text-muted-foreground transition-colors group-hover:text-foreground/60">{category.desc}</p>
                </Card>
              </a>
            );
          })}
        </div>

        <div className="mt-12 text-center md:mt-16">
          <Button asChild size="lg" className="bg-primary font-semibold text-white shadow-lg transition-all duration-300 hover:bg-primary/90 hover:shadow-xl">
            <a href="/?category=all#products">為毛孩繼續選購 →</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
