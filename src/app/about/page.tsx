import type { Metadata } from "next";
import { AboutUsPage } from "@/components/AboutUsPage";

export const metadata: Metadata = {
  title: "關於我們｜毛毛港 Mofu Haven",
  description:
    "認識毛毛港 Mofu Haven——名字由來、三大品牌承諾，以及我們如何為香港毛孩嚴選日本好物。",
};

export default function AboutPage() {
  return <AboutUsPage />;
}
