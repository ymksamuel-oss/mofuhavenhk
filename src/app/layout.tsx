import type { Metadata, Viewport } from "next";
import { BrandServiceStrip } from "@/components/BrandServiceStrip";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ShopFlowNav } from "@/components/ShopFlowNav";
import { CatalogProvider } from "@/lib/catalog-context";
import { getCatalogSnapshot } from "@/lib/catalog-server";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
import { CartProvider } from "@/lib/shop/cart";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import type { Product } from "@/lib/products";
import type { StoreCategory } from "@/lib/store-categories";
import "./globals.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  metadataBase: new URL("https://mofuhavenhk.com"),
  title: {
    default: "Mofu Haven HK | 日本天然寵物用品・1–2日寄出・5–7日收貨・滿$450免運費",
    template: "%s | Mofu Haven HK 毛毛港",
  },
  description:
  "Mofu Haven（毛毛港）專營日本優質寵物糧食、凍乾肉食及精選生活用品。現貨商品一般於 1–2 個工作天寄出，整體 5–7 個工作天收到；全店購物滿 HK$450 即享免運費，並提供 7 日退換貨保障。",
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
    "1–2日寄出・5–7日收貨",
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
    title: "Mofu Haven HK | 日本天然寵物用品・1–2日寄出・5–7日收貨・滿$450免運費",
    description:
      "專營日本優質寵物糧食及用品。現貨商品一般 1–2 個工作天寄出，整體 5–7 個工作天收到；滿 HK$450 免運費！",
    siteName: "Mofu Haven HK 毛毛港",
    images: [
      {
        url: "/images/mofu-haven-cat-dog-logo-transparent.png",
        width: 960,
        height: 1106,
        alt: "Mofu Haven HK 毛毛港 - 日本天然寵物用品",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mofu Haven HK | 日本天然寵物用品・1–2日寄出・5–7日收貨・滿$450免運費",
    description:
      "專營日本優質寵物糧食與用品，現貨商品一般 1–2 個工作天寄出，整體 5–7 個工作天收到；滿 HK$450 免運費！",
    images: ["/images/mofu-haven-cat-dog-logo-transparent.png"],
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
    { media: "(prefers-color-scheme: light)", color: "#FBF7F5" },
    { media: "(prefers-color-scheme: dark)", color: "#FBF7F5" },
  ],
  colorScheme: "light",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let products: Product[] = [];
  let categories: StoreCategory[] = [];
  try {
    const catalog = await getCatalogSnapshot();
    products = catalog.products || [];
    categories = catalog.categories || [];
  } catch {
    products = [];
    categories = [];
  }

  return (
    <html lang="zh-HK" className="bg-[color:var(--background)]">
      <head>
        <GoogleAnalytics />
      </head>
      <body className="bg-[color:var(--background)] font-sans antialiased">
        <I18nProvider>
          <CatalogProvider products={products} categories={categories}>
            <CartProvider>
              <Header />
              <BrandServiceStrip />
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
