import type { Metadata } from "next";
import { Suspense } from "react";
import { CatBreedsGuide } from "@/components/about/CatBreedsGuide";

export const metadata: Metadata = {
  title: "\u8c93\u54aa\u54c1\u7a2e\u5716\u9451｜\u6bdb\u6bdb\u6e2f Mofu Haven HK",
  description: "\u63a2\u7d22\u5e38\u898b\u8c93\u54aa\u54c1\u7a2e\u7684\u65e5\u5e38\u7279\u8cea\u8207\u8b77\u7406\u91cd\u9ede——\u77ed\u6bdb、\u9577\u6bdb\u4e00\u6b21\u770b\u61c2。",
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
