import type { Metadata, Viewport } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ShopFlowNav } from "@/components/ShopFlowNav";
import { CatalogProvider } from "@/lib/catalog-context";
import { getCatalogSnapshot } from "@/lib/catalog-server";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
import { CartProvider } from "@/lib/shop/cart";
import "./globals.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/** Uses the HK-friendly system font stack defined in globals.css. */

export const metadata: Metadata = {
  title: "Mofu Haven HK",
  description: "Japan's finest pet supplies, delivered to Hong Kong",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f0e2" },
    { media: "(prefers-color-scheme: dark)", color: "#f8f0e2" },
  ],
  colorScheme: "light",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const catalog = await getCatalogSnapshot();

  return (
    <html lang="zh-HK" className="bg-[color:var(--background)]">
      <body className="bg-[color:var(--background)] font-sans antialiased">
        <I18nProvider>
          <CatalogProvider products={catalog.products}>
            <CartProvider>
              <Header />
              <ShopFlowNav>
                <main className="w-full max-w-full overflow-x-clip bg-[color:var(--background)]">
                  {children}
                </main>
              </ShopFlowNav>
              <Footer />
            </CartProvider>
          </CatalogProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
