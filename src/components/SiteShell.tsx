"use client";

import { usePathname } from "next/navigation";
import { AdminLayout } from "@/components/AdminLayout";
import { Header } from "@/components/Header";
import { CartDrawerHost } from "@/components/cart/CartDrawerHost";
import { BrandServiceStrip } from "@/components/BrandServiceStrip";
import { ShopFlowNav } from "@/components/ShopFlowNav";
import { Footer } from "@/components/Footer";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdmin) {
    return <AdminLayout>{children}</AdminLayout>;
  }

  return (
    <>
      <Header />
      <CartDrawerHost />
      <BrandServiceStrip />
      <ShopFlowNav>
        <main className="w-full max-w-full overflow-x-clip bg-[color:var(--background)]">
          {children}
        </main>
      </ShopFlowNav>
      <Footer />
    </>
  );
}
