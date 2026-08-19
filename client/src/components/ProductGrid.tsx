import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { ShoppingBag, ExternalLink, RefreshCw } from "lucide-react";
import { toast } from "sonner";

function formatPrice(amount: number | null, currency: string | null) {
  if (amount === null || !currency) return "價格請查看結帳頁";
  return new Intl.NumberFormat("zh-HK", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 2,
  }).format(amount / 100);
}

function ProductSkeleton() {
  return (
    <Card className="overflow-hidden border-border/70 bg-card/90">
      <Skeleton className="aspect-square w-full rounded-none" />
      <CardHeader className="space-y-2">
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-4 w-2/5" />
      </CardHeader>
      <CardContent><Skeleton className="h-4 w-full" /></CardContent>
      <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
    </Card>
  );
}

export default function ProductGrid() {
  const productsQuery = trpc.store.products.useQuery(undefined, {
    staleTime: 60_000,
    retry: 2,
  });
  const checkout = trpc.store.checkout.useMutation();

  const handleBuy = async (priceId: string | null) => {
    if (!priceId) {
      toast.error("這件商品暫時沒有可用價格，請稍後再試。");
      return;
    }

    try {
      const result = await checkout.mutateAsync({ priceId });
      window.open(result.url, "_blank", "noopener,noreferrer");
      toast.success("正在開啟安全結帳頁面");
    } catch (error) {
      console.error("[Store] Checkout failed", error);
      toast.error("商品已顯示；付款連接仍需在專案 Payment 設定套用 Live Stripe 帳戶。");
    }
  };

  return (
    <section id="products" className="relative overflow-hidden bg-secondary/20 py-16 md:py-24">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      <div className="container relative z-10">
        <div className="mb-10 flex flex-col gap-4 md:mb-14 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              <ShoppingBag className="h-4 w-4" />
              Stripe 實時商品目錄
            </p>
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">為毛孩慢慢挑選真正可購買的好物</h2>
            <p className="mt-3 max-w-2xl text-foreground/70">
              商品、圖片、價格和分類直接來自您已核實的 Stripe Live 商品資料；目前共 91 件 Active 商品。
            </p>
          </div>
          {productsQuery.data && (
            <span className="shrink-0 text-sm font-medium text-muted-foreground">
              共 {productsQuery.data.total} 件商品
            </span>
          )}
        </div>

        {productsQuery.isLoading && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => <ProductSkeleton key={index} />)}
          </div>
        )}

        {productsQuery.isError && (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <h3 className="text-lg font-semibold text-foreground">暫時未能載入商品</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
              商品服務未能連線。請重新整理此頁面，或確認 Stripe 整合已啟用。
            </p>
            <Button className="mt-5" variant="outline" onClick={() => productsQuery.refetch()}>
              <RefreshCw className="h-4 w-4" />
              重新載入
            </Button>
          </div>
        )}

        {!productsQuery.isLoading && !productsQuery.isError && productsQuery.data?.products.length === 0 && (
          <div className="rounded-2xl border border-dashed border-primary/30 bg-background/70 p-10 text-center">
            <h3 className="text-lg font-semibold">目前沒有可售商品</h3>
            <p className="mt-2 text-sm text-muted-foreground">請在 Stripe 將商品設為 Active，並為商品建立有效價格。</p>
          </div>
        )}

        {!productsQuery.isLoading && !productsQuery.isError && productsQuery.data && productsQuery.data.products.length > 0 && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {productsQuery.data.products.map((product) => (
              <Card key={product.id} className="group flex h-full flex-col overflow-hidden border-border/70 bg-background/90 transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
                <div className="relative aspect-square overflow-hidden bg-muted">
                  {product.image ? (
                    <img src={product.image} alt={product.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground"><ShoppingBag className="h-10 w-10" /></div>
                  )}
                </div>
                <CardHeader className="gap-2 p-4">
                  <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-foreground md:text-base">{product.name}</h3>
                  <p className="text-base font-bold text-primary">{formatPrice(product.unitAmount, product.currency)}</p>
                </CardHeader>
                {product.description && (
                  <CardContent className="flex-1 px-4 pb-2 pt-0"><p className="line-clamp-3 text-xs leading-5 text-muted-foreground">{product.description}</p></CardContent>
                )}
                <CardFooter className="p-4 pt-2">
                  <Button className="w-full" disabled={!product.priceId || checkout.isPending} onClick={() => void handleBuy(product.priceId)}>
                    {checkout.isPending ? "處理中…" : "查看及購買"}
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
