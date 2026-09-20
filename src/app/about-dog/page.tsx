import type { Metadata } from "next";
import { AboutDogBook } from "@/components/about/AboutDogBook";

export const metadata: Metadata = {
  title: "\u95dc\u65bc\u72ac｜\u6bdb\u6bdb\u6e2f Mofu Haven HK",
  description: "\u65e5\u7cfb\u6eab\u99a8\u7e6a\u672c\u98a8\u683c\u7684\u72d7\u72d7\u7167\u8b77\u6307\u5357——\u5f9e\u8fce\u72ac\u56de\u5bb6\u5230\u5065\u5eb7\u9632\u8b77。",
};

export default function AboutDogPage() {
  return (
    <div className="min-h-full w-full bg-[#FBF9F6]">
      <AboutDogBook />
    </div>
  );
}
