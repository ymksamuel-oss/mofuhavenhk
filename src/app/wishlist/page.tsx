import type { Metadata } from "next";
import { WishlistPage } from "@/components/wishlist/WishlistPage";

export const metadata: Metadata = {
  title: "我的最愛｜毛毛港 Mofu Haven HK",
  description: "查看你收藏的日本寵物食品、零食及生活用品。",
};

export default function WishlistRoute() {
  return <WishlistPage />;
}
