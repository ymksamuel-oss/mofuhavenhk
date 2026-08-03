import type { Metadata, Viewport } from "next";
import { Noto_Sans_TC, Outfit } from "next/font/google";
import { Header } from "@/components/Header";
import { PageTransition } from "@/components/PageTransition";
import { ShopFlowNav } from "@/components/ShopFlowNav";
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-HK">
      <body
        className={`${outfit.variable} ${notoSansTc.variable} antialiased`}
      >
        <I18nProvider>
          <CartProvider>
            <WishlistProvider>
              <Header />
              <ShopFlowNav>
                <main className="w-full max-w-full overflow-x-clip">
                  <PageTransition>{children}</PageTransition>
                </main>
              </ShopFlowNav>
            </WishlistProvider>
          </CartProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
