import type { Metadata } from "next";
import { PetGuidePage } from "@/components/PetGuidePage";

export const metadata: Metadata = {
  title: "\u63a2\u7d22\u5bf5\u7269\u4e16\u754c｜\u5bf5\u7269\u5716\u9451\u8207\u65e5\u5e38\u8b77\u7406｜\u6bdb\u6bdb\u6e2f Mofu Haven HK",
  description: "\u63a2\u7d22\u8c93\u72d7\u54c1\u7a2e\u5716\u9451、\u6027\u683c\u8207\u8b77\u7406\u91cd\u9ede，\u67e5\u770b\u5716\u7247\u53ca\u8a73\u7d30\u4ecb\u7d39，\u4e26\u70ba\u6bdb\u5b69\u6311\u9078\u5408\u9069\u7684\u5929\u7136\u98df\u54c1\u8207\u751f\u6d3b\u7528\u54c1。",
};

export const revalidate = 300;

export default function PetGuideRoute() {
  return <PetGuidePage />;
}
