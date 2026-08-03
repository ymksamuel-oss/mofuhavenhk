import type { Metadata, Viewport } from "next";
import { Noto_Sans_TC, Outfit } from "next/font/google";
import { Header } from "@/components/Header";
import { ShopFlowNav } from "@/components/ShopFlowNav";
import { SiteFooter } from "@/components/SiteFooter";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
import { CartProvider } from "@/lib/shop/cart";
import { WishlistProvider } from "@/lib/shop/wishlist";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const notoSansTc = Noto_Sans_TC({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-HK"
      className="site-shell bg-[#f8f0e2]"
      style={{ backgroundColor: "#f8f0e2" }}
    >
      <body
        className={`${outfit.variable} ${notoSansTc.variable} site-shell bg-[#f8f0e2] antialiased`}
        style={{ backgroundColor: "#f8f0e2" }}
      >
        {/* Fixed cream plane behind everything — blocks any white overscroll flash */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-10 bg-[#f8f0e2]"
          style={{ backgroundColor: "#f8f0e2" }}
        />
        <I18nProvider>
          <CartProvider>
            <WishlistProvider>
              <div className="site-shell relative flex min-h-dvh flex-col bg-[#f8f0e2]">
                <Header />
                <ShopFlowNav>
                  <main className="w-full max-w-full flex-1 overflow-x-clip bg-[#f8f0e2]">
                    {children}
                  </main>
                </ShopFlowNav>
                <SiteFooter />
              </div>
            </WishlistProvider>
          </CartProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
