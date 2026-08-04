import type { Metadata } from "next";
import { AboutUsPage } from "@/components/AboutUsPage";

export const metadata: Metadata = {
  title: "關於我們｜Mofu Haven（毛毛港）",
  description:
    "認識 Mofu Haven（毛毛港）——名字由來、三大品牌承諾，以及我們如何為香港毛孩嚴選日本好物。",
};

export default function AboutPage() {
  return <AboutUsPage />;
}
