import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, ShoppingBag } from "lucide-react";
import { useMemo } from "react";

export default function CheckoutReturn() {
  const status = useMemo(() => new URLSearchParams(window.location.search).get("status"), []);
  const isSuccess = status === "success";

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-foreground">
      <Header />
      <main className="container flex min-h-[55vh] items-center justify-center py-16">
        <section className="w-full max-w-xl rounded-3xl border border-[#D3A87C]/25 bg-white/85 p-8 text-center shadow-sm md:p-12">
          {isSuccess ? <CheckCircle2 className="mx-auto h-14 w-14 text-[#8C6B53]" /> : <AlertCircle className="mx-auto h-14 w-14 text-[#D3A87C]" />}
          <h1 className="mt-5 text-3xl font-bold text-[#8C6B53]">{isSuccess ? "付款流程已完成" : "付款流程已取消"}</h1>
          <p className="mx-auto mt-4 max-w-md leading-7 text-muted-foreground">
            {isSuccess ? "Stripe 已將你帶回 Mofu Haven。若使用 AlipayHK 或 WeChat Pay，最終付款狀態會以 Stripe Dashboard 及付款通知為準。" : "今次付款未完成，你可以返回商品頁繼續購物，購物車內容會保留。"}
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild className="rounded-full bg-[#D3A87C] text-white hover:bg-[#C2976B]"><a href="/products?category=all"><ShoppingBag className="h-4 w-4" />繼續購物</a></Button>
            <Button asChild variant="outline" className="rounded-full border-[#D3A87C]/50 text-[#8C6B53] hover:bg-[#F3E5D5]"><a href="/">返回首頁</a></Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
