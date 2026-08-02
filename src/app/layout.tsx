import type { Metadata } from "next";
import { Noto_Sans_TC, Outfit } from "next/font/google";
import { Header } from "@/components/Header";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
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
          <Header />
          <main>{children}</main>
        </I18nProvider>
      </body>
    </html>
  );
}
