import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Backpack,
  Bone,
  Cat,
  Dog,
  Droplet,
  Gamepad2,
  Heart,
  LayoutGrid,
  Rabbit,
  Sparkles,
} from "lucide-react";
import { catalogHierarchy, type CatalogKey, type SubCatalogKey } from "@shared/catalogHierarchy";

const categoryIcons: Record<CatalogKey, typeof Cat> = {
  cat: Cat,
  dog: Dog,
  "small-pets": Rabbit,
};

const subCatalogIcons: Record<SubCatalogKey, typeof Cat> = {
  "cat-wet-food": Droplet,
  "cat-dry-food": LayoutGrid,
  "cat-litter": Sparkles,
  "cat-treats": Bone,
  "cat-supplies": Heart,
  "dog-wet-food": Droplet,
  "dog-dry-food": LayoutGrid,
  "dog-treats": Bone,
  "dog-supplies": Heart,
  "small-pet-food": LayoutGrid,
  "small-pet-treats": Bone,
  "small-pet-supplies": Backpack,
};

export default function CategoryGrid() {
  return (
    <section aria-label="商品分類" className="relative overflow-hidden bg-[#F5EFE6] py-2 sm:py-3 md:py-8">
      <div className="pointer-events-none absolute left-0 top-1/3 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[#D3A87C]/10 blur-3xl" />

      <div className="container relative z-10">
        <div className="mb-2 hidden text-center md:mb-5 md:block">
          <h2 className="text-2xl font-bold text-foreground md:text-3xl">寵物分類導覽</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-foreground/70 md:text-base">
            先選擇毛孩種類，再按需要挑選主食、零食或日常用品。
          </p>
        </div>

        <div className="horizontal-scroll flex w-full min-w-0 snap-x snap-mandatory flex-nowrap gap-2 pb-2" aria-label="主分類" role="region" tabIndex={0}>
          {catalogHierarchy.map((category) => {
            const Icon = categoryIcons[category.key];
            return (
              <a key={category.key} href={`/products?category=${category.key}`} className="group shrink-0 snap-start">
                <Card className="flex h-10 min-h-10 w-max cursor-pointer flex-row items-center justify-center gap-1.5 rounded-full border border-[#D3A87C]/55 bg-white/95 px-3 text-center shadow-[0_5px_16px_rgba(140,107,83,0.08)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#C9A47C] hover:bg-[#F5EFE6] hover:shadow-[0_8px_20px_rgba(140,107,83,0.15)]">
                  <div className="relative flex shrink-0 items-center justify-center rounded-full border border-[#D3A87C]/35 bg-[#F5EFE6] p-1 transition-all duration-200 group-hover:bg-[#EAD2B9]">
                    <Icon className="relative z-10 h-4 w-4 text-[#8C6B53]" />
                  </div>
                  <h3 className="mb-0 whitespace-nowrap text-xs font-semibold text-[#6F5645] transition-colors group-hover:text-[#8C6B53]">
                    {category.label}
                  </h3>
                </Card>
              </a>
            );
          })}
        </div>

        <div className="horizontal-scroll mt-1 flex w-full min-w-0 snap-x snap-mandatory flex-nowrap gap-2 pb-2" aria-label="子分類" role="region" tabIndex={0}>
          {catalogHierarchy.flatMap((category) => category.subCatalogs).map((subCatalog) => {
            const Icon = subCatalogIcons[subCatalog.key];
            return (
              <a key={subCatalog.key} href={`/products?category=${subCatalog.key}`} className="group shrink-0 snap-start">
                <Card className="flex h-8 min-h-8 w-max cursor-pointer flex-row items-center gap-1 rounded-full border border-[#D3A87C]/35 bg-white/90 px-2.5 text-center transition-all duration-200 hover:border-[#C9A47C] hover:bg-[#F5EFE6]">
                  <Icon className="h-3.5 w-3.5 text-[#8C6B53]" />
                  <span className="whitespace-nowrap text-[11px] font-medium text-[#6F5645]">{subCatalog.label}</span>
                </Card>
              </a>
            );
          })}
        </div>

        <div className="mt-2 hidden text-center md:mt-5 md:block">
          <Button asChild size="lg" className="rounded-full bg-[#C9A47C] px-7 font-semibold text-white shadow-[0_8px_20px_rgba(140,107,83,0.18)] transition-all duration-300 hover:bg-[#8C6B53] hover:shadow-[0_12px_26px_rgba(140,107,83,0.24)]">
            <a href="/products">查看商品目錄 →</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
