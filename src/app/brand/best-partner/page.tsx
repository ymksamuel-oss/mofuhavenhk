import type { Metadata } from "next";
import { BestPartnerConceptContent } from "@/components/BestPartnerConceptContent";
export const metadata: Metadata = {
  title: "Best Partner 品牌故事｜日本天然寵物食品｜毛毛港 Mofu Haven",
  description: "認識 Best Partner 日本原裝品牌理念：嚴選在地天然原料、堅持無添加，並以愛知縣職人低溫慢烘工藝，為毛孩帶來純粹安心的日常美味。",
};

export default function BestPartnerConceptPage() {
  return <BestPartnerConceptContent />;
}
