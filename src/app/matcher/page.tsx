import type { Metadata } from "next";
import { PetMatcherWizard } from "@/components/matcher/PetMatcherWizard";
import { MatcherPageHeader } from "@/components/matcher/MatcherPageHeader";

export const metadata: Metadata = {
  title: "Tailored Japanese Pet Essentials Matcher | Mofu Haven HK",
  description: "Tell us about your pet and get a tailored recommendation of natural Japanese whole-meat treats.",
};

export default function MatcherPage() {
  return (
    <main className="min-h-[60vh] bg-white px-4 py-10 text-[#4b352a] sm:px-6 sm:py-14">
      <MatcherPageHeader />
      <PetMatcherWizard variant="home" autoOpen />
    </main>
  );
}
