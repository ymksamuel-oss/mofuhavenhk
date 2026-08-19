import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { trpc } from "@/lib/trpc";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";

const PRODUCT_PLACEHOLDER = "/manus-storage/mofu-haven-product-placeholder_002825b0.svg";

function formatPrice(amount: number | null, currency: string | null) {
  if (amount === null || !currency) return "價格待確認";
  return new Intl.NumberFormat("zh-HK", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 2,
  }).format(amount / 100);
}

export default function CartDrawer() {
  const { items, subtotal, isOpen, closeCart, updateQuantity, removeItem } = useCart();
  const checkout = trpc.store.checkout.useMutation();

  const handleCheckout = async () => {
    const checkoutItems = items
      .filter((item) => item.priceId)
      .map((item) => ({ priceId: item.priceId as string, quantity: item.quantity }));
    if (!checkoutItems.length) {
      toast.error("購物車內沒有可結帳商品。");
      return;
    }
    try {
      const result = await checkout.mutateAsync({ items: checkoutItems });
      window.open(result.url, "_blank", "noopener,noreferrer");
      toast.success("正在開啟安全結帳頁面");
    } catch (error) {
      console.error("[Cart] Checkout failed", error);
      toast.error("暫時未能建立結帳頁面，請稍後再試或聯絡我們。");
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) closeCart(); }}>
      <SheetContent side="right" className="w-full border-[#D3A87C]/25 bg-[#FFFDF9] sm:max-w-md">
        <SheetHeader className="border-b border-border/70 pr-10">
          <SheetTitle className="flex items-center gap-2 text-[#8C6B53]"><ShoppingBag className="h-5 w-5" />你的購物車</SheetTitle>
          <SheetDescription>先加入喜歡的商品，準備好後再前往 Stripe 安全結帳。</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {items.length === 0 ? (
            <div className="flex h-full min-h-52 flex-col items-center justify-center text-center">
              <ShoppingBag className="h-10 w-10 text-[#D3A87C]" />
              <p className="mt-4 font-semibold text-foreground">購物車暫時是空的</p>
              <p className="mt-2 text-sm text-muted-foreground">加入商品後可以繼續瀏覽，最後再一次結帳。</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <article key={item.id} className="flex gap-3 rounded-2xl border border-border/70 bg-white/80 p-3">
                  <img
                    src={item.image || PRODUCT_PLACEHOLDER}
                    alt={item.name}
                    className="h-20 w-20 shrink-0 rounded-xl bg-[#f5f0eb] object-contain p-2"
                    onError={(event) => { event.currentTarget.src = PRODUCT_PLACEHOLDER; }}
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="line-clamp-2 pr-5 text-sm font-semibold leading-5 text-foreground">{item.name}</h3>
                    <p className="mt-1 text-sm font-bold text-[#8C6B53]">{formatPrice(item.unitAmount, item.currency)}</p>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div className="inline-flex items-center rounded-full border border-[#D3A87C]/45 bg-[#FFFDF9]">
                        <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="rounded-full p-1.5 text-[#8C6B53] hover:bg-[#F3E5D5]" aria-label={`減少 ${item.name} 數量`}><Minus className="h-3.5 w-3.5" /></button>
                        <span className="min-w-7 text-center text-xs font-semibold" aria-label={`${item.name} 數量`}>{item.quantity}</span>
                        <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="rounded-full p-1.5 text-[#8C6B53] hover:bg-[#F3E5D5]" aria-label={`增加 ${item.name} 數量`}><Plus className="h-3.5 w-3.5" /></button>
                      </div>
                      <button type="button" onClick={() => removeItem(item.id)} className="rounded-full p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label={`移除 ${item.name}`}><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <SheetFooter className="border-t border-border/70 bg-white/70">
          <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">商品小計</span><strong className="text-lg text-[#8C6B53]">{formatPrice(subtotal, items[0]?.currency ?? "hkd")}</strong></div>
          <Button type="button" disabled={!items.length || checkout.isPending} onClick={() => void handleCheckout()} className="w-full rounded-full bg-[#D3A87C] text-white hover:bg-[#C2976B]">
            {checkout.isPending ? "建立結帳中…" : "前往結帳"}<ArrowRight className="h-4 w-4" />
          </Button>
          <p className="text-center text-xs text-muted-foreground">結帳頁將提供信用卡，以及已在 Stripe Dashboard 啟用的 AlipayHK／WeChat Pay 選項。</p>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
