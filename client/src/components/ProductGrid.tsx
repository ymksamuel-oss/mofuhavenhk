import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { normalizeRequestedCategory, resolveSearchCategory, type ProductCategory } from "@shared/productCatalog";
import { ExternalLink, ImageOff, RefreshCw, Search, ShoppingBag, X } from "lucide-react";
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
  "small-pets": "小寵物商品",
  deals: "限時優惠",
  bestsellers: "熱賣商品",
  outdoor: "外出用品",
};

function getUrlFilters(): { category: ProductCategory; q: string } {
  const params = new URLSearchParams(window.location.search);
  const q = params.get("q") ?? "";
  const category = normalizeRequestedCategory(params.get("category"));
  return {
    category: resolveSearchCategory(category, q),
    q,
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
      <CardFooter className="flex justify-center"><Skeleton className="h-9 w-32" /></CardFooter>
    </Card>
  );
}

function ProductImage({ src, alt }: { src: string | null; alt: string }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = !src || failedSrc === src;

  return (
    <div className="relative flex aspect-square items-center justify-center overflow-hidden border-b border-border/60 bg-[#f5f0eb]">
      {!failed && src ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-[1.02] md:p-6"
          onError={() => setFailedSrc(src)}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-4 text-center text-muted-foreground" role="img" aria-label={`${alt} 圖片暫時不可用`}>
          <ImageOff className="h-8 w-8 text-primary/45" />
          <span className="text-xs">圖片暫時不可用</span>
        </div>
      )}
    </div>
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

    const params = new URLSearchParams(window.location.search);
    const initial = getUrlFilters();
    if (initial.q && params.has("category")) {
      params.delete("category");
      const query = params.toString();
      window.history.replaceState({}, "", `/${query ? `?${query}` : ""}#products`);
    }
    syncFromUrl();
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
    const query = searchInput.trim();
    updateUrl({ category: resolveSearchCategory(filters.category, query), q: query });
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

        {!productsQuery.isLoading && !productsQuery.isError && productsQuery.data && productsQuery.data.products.length > 0 && <div className="grid items-stretch grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">{productsQuery.data.products.map((product) => <Card key={product.id} className="group flex h-full min-h-[26rem] flex-col overflow-hidden border-border/70 bg-background/90 transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"><ProductImage src={product.image} alt={product.name} /><CardHeader className="gap-2 p-4"><h3 className="line-clamp-2 text-sm font-semibold leading-5 text-foreground md:text-base">{product.name}</h3><p className="text-base font-bold text-primary">{formatPrice(product.unitAmount, product.currency)}</p></CardHeader>{product.description && <CardContent className="flex-1 px-4 pb-2 pt-0"><p className="line-clamp-3 text-xs leading-5 text-muted-foreground">{product.description}</p></CardContent>}{!product.description && <div className="flex-1" />}<CardFooter className="mt-auto flex justify-center p-4 pt-2"><Button size="sm" className="h-9 w-auto max-w-full px-4 text-xs md:text-sm" disabled={!product.priceId || checkout.isPending} onClick={() => void handleBuy(product.priceId)}>{checkout.isPending ? "處理中…" : "查看及購買"}<ExternalLink className="h-3.5 w-3.5" /></Button></CardFooter></Card>)}</div>}
      </div>
    </section>
  );
}
