import type { Metadata } from "next";
import { cookies } from "next/headers";
import { BestPartnerConceptContent } from "@/components/BestPartnerConceptContent";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await cookies()).get("NEXT_LOCALE")?.value;
  return locale === "en" || locale === "en-HK"
    ? {
        title: "Best Partner Brand Story | Mofu Haven HK",
        description: "Discover Best Partner's Japanese commitment to domestic ingredients, additive-free recipes and gentle low-temperature drying.",
      }
    : {
        title: "Best Partner 品牌故事｜日本天然寵物食品｜毛毛港 Mofu Haven",
        description: "認識 Best Partner 日本原裝品牌理念：嚴選在地天然原料、堅持無添加，並以愛知縣職人低溫慢烘工藝，為毛孩帶來純粹安心的日常美味。",
      };
}

export default function BestPartnerConceptPage() {
  return <BestPartnerConceptContent />;
}
