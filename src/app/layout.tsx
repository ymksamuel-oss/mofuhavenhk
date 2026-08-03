import type { Metadata, Viewport } from "next";
import { Noto_Sans_HK } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ShopFlowNav } from "@/components/ShopFlowNav";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
import { CartProvider } from "@/lib/shop/cart";
import "./globals.css";

/**
 * Premium HK-friendly sans for the whole site (nav → checkout → footer).
 * Falls back to SF Pro / system UI via globals.css.
 */
const notoSansHk = Noto_Sans_HK({
  variable: "--font-sans-face",
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
      className={`${notoSansHk.variable} bg-[color:var(--background)]`}
    >
      <body className="bg-[color:var(--background)] font-sans antialiased">
        <I18nProvider>
          <CartProvider>
            <Header />
            <ShopFlowNav>
              <main className="w-full max-w-full overflow-x-clip bg-[color:var(--background)]">
                {children}
              </main>
            </ShopFlowNav>
            <Footer />
          </CartProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
