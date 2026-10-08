import type { Metadata } from "next";
import { PetMatcherWizard } from "@/components/matcher/PetMatcherWizard";

export const metadata: Metadata = {
  title: "毛孩專屬智能選品配對｜Mofu Haven HK",
  description: "選擇毛孩、品種、年齡與照護需求，取得日本天然原肉零食推薦。",
};

export default function MatcherPage() {
  return (
    <main className="min-h-[60vh] bg-white px-4 py-10 text-[#4b352a] sm:px-6 sm:py-14">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a36b42]">MOFU HAVEN · PET MATCHER</p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold sm:text-4xl">🐾 毛孩專屬日系好物配對</h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#76594a] sm:text-base">毛孩有挑食、過敏或潔齒需求？30秒為毛孩量身推薦日本天然原肉零食。</p>
      </div>
      <PetMatcherWizard variant="home" autoOpen />
    </main>
  );
}
