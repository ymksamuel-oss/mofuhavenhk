import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import type { ProductCategory } from "@shared/productCatalog";
import { ExternalLink, RefreshCw, Search, ShoppingBag, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const categoryLabels: Record<ProductCategory, string> = {
  all: "全部商品",
  cats: "貓咪商品",
  dogs: "狗狗商品",
  treats: "寵物零食",
  "wet-cans": "貓咪罐罐",
  toys: "寵物玩具",
  supplements: "營養保健",
  cleaning: "居家清潔",
  deals: "限時優惠",
  bestsellers: "熱賣商品",
  outdoor: "外出用品",
};

const validCategories = new Set<ProductCategory>(Object.keys(categoryLabels) as ProductCategory[]);

function getUrlFilters(): { category: ProductCategory; q: string } {
  const params = new URLSearchParams(window.location.search);
  const requestedCategory = params.get("category") as ProductCategory | null;
  return {
    category: requestedCategory && validCategories.has(requestedCategory) ? requestedCategory : "all",
    q: params.get("q") ?? "",
  };
}

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
      <CardHeader className="space-y-2"><Skeleton className="h-5 w-4/5" /><Skeleton className="h-4 w-2/5" /></CardHeader>
      <CardContent><Skeleton className="h-4 w-full" /></CardContent>
      <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
    </Card>
  );
}

export default function ProductGrid() {
  const [filters, setFilters] = useState(getUrlFilters);
  const [searchInput, setSearchInput] = useState(filters.q);
  const input = useMemo(() => ({ category: filters.category, q: filters.q }), [filters.category, filters.q]);
  const productsQuery = trpc.store.products.useQuery(input, { staleTime: 60_000, retry: 2 });
  const checkout = trpc.store.checkout.useMutation();

  useEffect(() => {
    const syncFromUrl = () => {
      const next = getUrlFilters();
      setFilters(next);
      setSearchInput(next.q);
    };
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  const updateUrl = (next: { category?: ProductCategory; q?: string }) => {
    const params = new URLSearchParams(window.location.search);
    const category = next.category ?? filters.category;
    const q = next.q ?? filters.q;
    if (category === "all") params.delete("category"); else params.set("category", category);
    if (q) params.set("q", q); else params.delete("q");
    const query = params.toString();
    window.history.pushState({}, "", `/${query ? `?${query}` : ""}#products`);
    setFilters({ category, q });
    window.requestAnimationFrame(() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateUrl({ q: searchInput.trim() });
  };

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

  const hasFilter = filters.category !== "all" || Boolean(filters.q);

  return (
    <section id="products" className="relative scroll-mt-20 overflow-hidden bg-secondary/20 py-16 md:py-24">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      <div className="container relative z-10">
        <div className="mb-8 flex flex-col gap-5 md:mb-12 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary"><ShoppingBag className="h-4 w-4" />Stripe 商品目錄</p>
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">為毛孩慢慢挑選真正可購買的好物</h2>
            <p className="mt-3 max-w-2xl text-foreground/70">商品、圖片、價格和分類直接來自已核實的 Stripe Live 商品資料。</p>
          </div>
          {productsQuery.data && <span className="shrink-0 text-sm font-medium text-muted-foreground">目前顯示 {productsQuery.data.total} 件／共 {productsQuery.data.totalAvailable} 件</span>}
        </div>

        <form onSubmit={submitSearch} className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="搜尋貓咪商品、零食、罐罐⋯" aria-label="搜尋商品" className="h-12 w-full rounded-xl border border-border bg-background pl-11 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>
          <Button type="submit" className="h-12 px-6">搜尋商品</Button>
        </form>

        <div className="mb-8 flex flex-wrap items-center gap-2">
          {(Object.keys(categoryLabels) as ProductCategory[]).map((category) => (
            <Button key={category} type="button" size="sm" variant={filters.category === category ? "default" : "outline"} onClick={() => updateUrl({ category })}>
              {categoryLabels[category]}
            </Button>
          ))}
          {hasFilter && <Button type="button" size="sm" variant="ghost" onClick={() => { setSearchInput(""); updateUrl({ category: "all", q: "" }); }}><X className="h-4 w-4" />清除篩選</Button>}
        </div>

        {hasFilter && <p className="mb-5 text-sm text-muted-foreground">目前篩選：<span className="font-semibold text-foreground">{categoryLabels[filters.category]}</span>{filters.q && <>，搜尋「<span className="font-semibold text-foreground">{filters.q}</span>」</>}</p>}

        {productsQuery.isLoading && <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <ProductSkeleton key={index} />)}</div>}

        {productsQuery.isError && <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center"><h3 className="text-lg font-semibold text-foreground">暫時未能載入商品</h3><p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">商品服務未能連線。請重新整理此頁面，或確認 Stripe 整合已啟用。</p><Button className="mt-5" variant="outline" onClick={() => productsQuery.refetch()}><RefreshCw className="h-4 w-4" />重新載入</Button></div>}

        {!productsQuery.isLoading && !productsQuery.isError && productsQuery.data?.products.length === 0 && <div className="rounded-2xl border border-dashed border-primary/30 bg-background/70 p-10 text-center"><h3 className="text-lg font-semibold">呢個分類暫時未有商品</h3><p className="mt-2 text-sm text-muted-foreground">請嘗試其他分類或清除搜尋字詞。</p><Button className="mt-5" variant="outline" onClick={() => { setSearchInput(""); updateUrl({ category: "all", q: "" }); }}>查看全部商品</Button></div>}

        {!productsQuery.isLoading && !productsQuery.isError && productsQuery.data && productsQuery.data.products.length > 0 && <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">{productsQuery.data.products.map((product) => <Card key={product.id} className="group flex h-full flex-col overflow-hidden border-border/70 bg-background/90 transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"><div className="relative aspect-square overflow-hidden bg-muted">{product.image ? <img src={product.image} alt={product.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-muted-foreground"><ShoppingBag className="h-10 w-10" /></div>}</div><CardHeader className="gap-2 p-4"><h3 className="line-clamp-2 text-sm font-semibold leading-5 text-foreground md:text-base">{product.name}</h3><p className="text-base font-bold text-primary">{formatPrice(product.unitAmount, product.currency)}</p></CardHeader>{product.description && <CardContent className="flex-1 px-4 pb-2 pt-0"><p className="line-clamp-3 text-xs leading-5 text-muted-foreground">{product.description}</p></CardContent>}<CardFooter className="p-4 pt-2"><Button className="w-full" disabled={!product.priceId || checkout.isPending} onClick={() => void handleBuy(product.priceId)}>{checkout.isPending ? "處理中…" : "查看及購買"}<ExternalLink className="h-4 w-4" /></Button></CardFooter></Card>)}</div>}
      </div>
    </section>
  );
}
