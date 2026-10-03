import type { Metadata } from "next";
import { SupplierProfileSection } from "@/components/SupplierProfileSection";
import { SupplierProfileHero } from "@/components/SupplierProfileHero";

export const metadata: Metadata = {
  title: "Official Japanese Manufacturer | Mofu Haven HK",
  description: "Discover Best Partner's original facility in Toyohashi, Aichi, the company profile and Mofu Haven's authentic sourcing promise.",
  alternates: { canonical: "https://www.mofuhavenhk.com/supplier-profile" },
};

export default function SupplierProfilePage() {
  return (
    <main className="min-h-screen bg-[#FFFFFF] text-[#49372c]">
      <SupplierProfileHero />
      <SupplierProfileSection />
    </main>
  );
}
