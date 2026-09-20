import type { Metadata } from "next";
import { AboutUsPage } from "@/components/AboutUsPage";

export const metadata: Metadata = {
  title: "\u95dc\u65bc\u6211\u5011｜\u65e5\u672c\u5929\u7136\u5bf5\u7269\u98df\u54c1\u8207\u6bdb\u5b69\u521d\u5fc3｜\u6bdb\u6bdb\u6e2f Mofu Haven",
  description:
    "\u8a8d\u8b58\u6bdb\u6bdb\u6e2f Mofu Haven \u7684\u5275\u7acb\u521d\u5fc3、\u4e09\u5927\u54c1\u8cea\u627f\u8afe，\u4ee5\u53ca\u6211\u5011\u5982\u4f55\u70ba\u9999\u6e2f\u8c93\u72d7\u56b4\u9078\u65e5\u672c\u539f\u88dd\u5929\u7136\u7121\u6dfb\u52a0\u98df\u54c1\u8207\u751f\u6d3b\u826f\u54c1。",
};

export default function AboutPage() {
  return <AboutUsPage />;
}
