import type { Metadata } from "next";
import { AboutDogBook } from "@/components/about/AboutDogBook";

export const metadata: Metadata = {
  title: "關於犬｜Mofu Haven HK",
  description: "日系溫馨繪本風格的狗狗照護指南——從迎犬回家到健康防護。",
};

export default function AboutDogPage() {
  return <AboutDogBook />;
}
