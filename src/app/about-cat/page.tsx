import type { Metadata } from "next";
import { AboutCatBook } from "@/components/about/AboutCatBook";

export const metadata: Metadata = {
  title: "關於貓｜Mofu Haven HK",
  description: "日系溫馨繪本風格的貓咪照護指南——從迎貓回家到健康守護。",
};

export default function AboutCatPage() {
  return <AboutCatBook />;
}
