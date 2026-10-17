"use client";

import { usePathname } from "next/navigation";
import { AdminLayout } from "@/components/AdminLayout";
import { Header } from "@/components/Header";
import { CartDrawerHost } from "@/components/cart/CartDrawerHost";
import { FloatingMobileDock } from "@/components/FloatingMobileDock";
import { BrandServiceStrip } from "@/components/BrandServiceStrip";
import { ShopFlowNav } from "@/components/ShopFlowNav";
import { Footer } from "@/components/Footer";
import { useCatalog } from "@/lib/catalog-context";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { catalogFallback } = useCatalog();
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdmin) {
    return <AdminLayout>{children}</AdminLayout>;
  }

  return (
    <>
      <Header />
      <CartDrawerHost />
      <FloatingMobileDock />
      <BrandServiceStrip />
      {catalogFallback ? (
        <aside role="status" aria-live="polite" className="border-y border-amber-200 bg-amber-50 px-4 py-3 text-center text-xs leading-5 text-amber-950 sm:text-sm">
          <p className="font-semibold">商品目錄暫以最近快照供瀏覽；即時庫存與付款價格暫不可用，現時暫停下單。</p>
          <p lang="en" className="text-amber-900">Catalog read-only mode: live inventory and payment pricing are unavailable, so ordering is temporarily paused.</p>
        </aside>
      ) : null}
      <ShopFlowNav>
        <main className="w-full max-w-full overflow-x-clip bg-white pb-28 sm:pb-32 md:pb-0">
          {children}
        </main>
      </ShopFlowNav>
      <Footer />
    </>
  );
}
