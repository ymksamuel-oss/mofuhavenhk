import type { Metadata } from "next";
import { AboutUsPage } from "@/components/AboutUsPage";

export const metadata: Metadata = {
  title: "關於我們｜日本天然寵物食品與毛孩初心｜毛毛港 Mofu Haven",
  description:
    "認識毛毛港 Mofu Haven 的創立初心、三大品質承諾，以及我們如何為香港貓狗嚴選日本原裝天然無添加食品與生活良品。",
};

export default function AboutPage() {
  return <AboutUsPage />;
}
