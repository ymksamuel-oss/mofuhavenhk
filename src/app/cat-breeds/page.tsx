import type { Metadata } from "next";
import { Suspense } from "react";
import { CatBreedsGuide } from "@/components/about/CatBreedsGuide";

export const metadata: Metadata = {
  title: "貓咪品種圖鑑｜毛毛港 Mofu Haven HK",
  description: "探索常見貓咪品種的日常特質與護理重點——短毛、長毛一次看懂。",
};

export default function CatBreedsPage() {
  return (
    <div className="min-h-full w-full bg-[#FBF9F6]">
      <Suspense fallback={<div className="min-h-[60vh]" aria-hidden="true" />}>
        <CatBreedsGuide />
      </Suspense>
    </div>
  );
}
