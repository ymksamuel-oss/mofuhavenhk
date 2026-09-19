import type { Metadata } from "next";
import { PetGuidePage } from "@/components/PetGuidePage";

export const metadata: Metadata = {
  title: "探索寵物世界｜寵物圖鑑與日常護理｜毛毛港 Mofu Haven HK",
  description: "探索貓狗品種圖鑑、性格與護理重點，查看圖片及詳細介紹，並為毛孩挑選合適的天然食品與生活用品。",
};

export const revalidate = 300;

export default function PetGuideRoute() {
  return <PetGuidePage />;
}
