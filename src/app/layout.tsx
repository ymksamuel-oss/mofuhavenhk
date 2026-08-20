import type { Metadata, Viewport } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ShopFlowNav } from "@/components/ShopFlowNav";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { CatalogProvider } from "@/lib/catalog-context";
import { getCatalogSnapshot } from "@/lib/catalog-server";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
import { CartProvider } from "@/lib/shop/cart";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL("https://mofuhavenhk.com"),
  title: {
    default: "Mofu Haven HK | 日本天然寵物用品・3-5日發貨・滿$450免運費",
    template: "%s | Mofu Haven HK 毛毛港",
  },
  description:
  "Mofu Haven（毛毛港）專營日本優質寵物糧食、凍乾肉食及精選生活用品。100% 正版日本直送，現貨 3-5 日順豐發貨，全店購物滿 HK$450 即享免運費，提供 7 日退換貨保障。",
  keywords: [
    "Mofu Haven",
    "毛毛港",
    "日本寵物用品",
    "香港寵物網店",
    "日本貓糧",
    "日本狗糧",
    "寵物凍乾",
    "貓咪零食",
    "狗狗零食",
    "3-5日發貨",
    "免運費",
  ],
  authors: [{ name: "Mofu Haven HK" }],
  creator: "Mofu Haven HK",
  publisher: "Mofu Haven HK",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "zh_HK",
    url: "https://mofuhavenhk.com",
    title: "Mofu Haven HK | 日本天然寵物用品・3-5日發貨・滿$450免運費",
    description:
      "專營日本優質寵物糧食、凍乾與用品。100% 正版日本直送，現貨 3-5 日順豐發貨，滿 HK$450 免運費！",
    siteName: "Mofu Haven HK 毛毛港",
    images: [
      {
        url: "/manus-storage/mofu-haven-logo_75fb6778.png",
        width: 800,
        height: 800,
        alt: "Mofu Haven HK 毛毛港 - 日本天然寵物用品",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mofu Haven HK | 日本天然寵物用品・3-5日發貨・滿$450免運費",
    description:
      "專營日本優質寵物糧食與用品，現貨 3-5 日順豐發貨，滿 HK$450 免運費！",
    images: ["/manus-storage/mofu-haven-logo_75fb6778.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
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
  let products = [];
  try {
    const catalog = await getCatalogSnapshot();
    products = catalog.products || [];
  } catch {
    products = [];
  }

  return (
    <html lang="zh-HK" className="bg-[color:var(--background)]">
      <body className="bg-[color:var(--background)] font-sans antialiased">
        <I18nProvider>
          <CatalogProvider products={products}>
            <CartProvider>
              <Header />
              <ShopFlowNav>
                <main className="w-full max-w-full overflow-x-clip bg-[color:var(--background)]">
                  {children}
                </main>
              </ShopFlowNav>
              <Footer />
              <FloatingWhatsApp />
            </CartProvider>
          </CatalogProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
