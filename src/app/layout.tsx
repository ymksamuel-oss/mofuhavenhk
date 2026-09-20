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
import { MetaPixel } from "@/components/MetaPixel";
import type { Product } from "@/lib/products";
import type { StoreCategory } from "@/lib/store-categories";
import type { Brand } from "@/lib/brands";
import {
  EMPTY_PAYME_CHECKOUT_SETTINGS,
  getPayMeCheckoutSettings,
  type PayMeCheckoutSettings,
} from "@/lib/payme-checkout-settings";
import "./globals.css";

export const revalidate = 300;

export const metadata: Metadata = {
  metadataBase: new URL("https://mofuhavenhk.com"),
  alternates: { canonical: "/" },
  title: {
    default: "Mofu Haven HK | Japanese Pet Essentials",
    template: "%s | Mofu Haven",
  },
  description:
  "Mofu Haven curates Japanese pet food, treats and everyday essentials for Hong Kong. In-stock orders usually ship within 1–2 business days, with free local delivery over HK$450.",
  keywords: [
    "Mofu Haven",
    "Japanese pet supplies",
    "Hong Kong pet shop",
    "Japanese cat food",
    "Japanese dog food",
    "freeze-dried pet treats",
    "cat treats",
    "dog treats",
    "free Hong Kong delivery",
  ],
  authors: [{ name: "Mofu Haven" }],
  creator: "Mofu Haven",
  publisher: "Mofu Haven",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_HK",
    url: "https://mofuhavenhk.com",
    title: "Mofu Haven HK | Japanese Pet Essentials",
    description: "Curated Japanese pet food and everyday essentials, delivered across Hong Kong with free local shipping over HK$450.",
    siteName: "Mofu Haven",
    images: [
      {
        url: "/images/best-partner-plain-pack-series.png",
        width: 1194,
        height: 671,
        alt: "Japanese natural pet food collection",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mofu Haven HK | Japanese Pet Essentials",
    description: "Curated Japanese pet food and everyday essentials, delivered across Hong Kong with free local shipping over HK$450.",
    images: ["/images/best-partner-plain-pack-series.png"],
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
  let brands: Brand[] = [];
  let payMe: PayMeCheckoutSettings = EMPTY_PAYME_CHECKOUT_SETTINGS;
  try {
    const catalog = await getCatalogSnapshot();
    products = catalog.products || [];
    categories = catalog.categories || [];
    brands = catalog.brands || [];
    payMe = await getPayMeCheckoutSettings();
  } catch {
    products = [];
    categories = [];
    brands = [];
    payMe = await getPayMeCheckoutSettings();
  }

  return (
    <html lang="en-HK" className="bg-[color:var(--background)]">
      <head>
        <GoogleAnalytics />
        <MetaPixel />
      </head>
      <body className="bg-[color:var(--background)] font-sans antialiased">
        <I18nProvider>
          <CatalogProvider products={products} categories={categories} brands={brands} payMe={payMe}>
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
