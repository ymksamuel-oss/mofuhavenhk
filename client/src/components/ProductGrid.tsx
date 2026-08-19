import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { normalizeRequestedCategory, resolveSearchCategory, type ProductCategory } from "@shared/productCatalog";
import {
  ArrowUpRight,
  Backpack,
  Bone,
  Cat,
  Dog,
  Droplet,
  Gamepad2,
  Heart,
  ImageOff,
  LayoutGrid,
  Maximize2,
  Rabbit,
  RefreshCw,
  Search,
  ShoppingBag,
  Tag,
  TrendingUp,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

const PRODUCT_PLACEHOLDER = "/manus-storage/mofu-haven-product-placeholder_002825b0.svg";

type StoreProduct = {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  images: string[];
  priceId: string | null;
  unitAmount: number | null;
  currency: string | null;
  active: boolean;
  metadata: Record<string, string>;
};

const categoryIcons: Record<ProductCategory, typeof Cat> = {
  all: LayoutGrid,
  cats: Cat,
  dogs: Dog,
  treats: Bone,
  "wet-cans": Droplet,
  toys: Gamepad2,
  supplements: Heart,
  "small-pets": Rabbit,
  deals: Tag,
  bestsellers: TrendingUp,
  outdoor: Backpack,
};

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

function ProductImage({ src, alt, className = "" }: { src: string | null; alt: string; className?: string }) {
  const [imageSrc, setImageSrc] = useState(src || PRODUCT_PLACEHOLDER);

  useEffect(() => {
    setImageSrc(src || PRODUCT_PLACEHOLDER);
  }, [src]);

  return (
    <div className={`relative flex aspect-square items-center justify-center overflow-hidden border-b border-border/60 bg-[#f5f0eb] ${className}`}>
      <img
        src={imageSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-contain p-4 transition-transform duration-300 md:p-6"
        onError={() => setImageSrc((current) => current === PRODUCT_PLACEHOLDER ? current : PRODUCT_PLACEHOLDER)}
      />
      {imageSrc === PRODUCT_PLACEHOLDER && (
        <span className="pointer-events-none absolute bottom-3 inline-flex items-center gap-1 rounded-full bg-white/85 px-3 py-1 text-xs text-[#8C6B53] shadow-sm">
          <ImageOff className="h-3.5 w-3.5" />圖片暫時不可用
        </span>
      )}
    </div>
  );
}

function ProductDetailModal({
  product,
  open,
  onOpenChange,
  onAddToCart,
}: {
  product: StoreProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToCart: (product: StoreProduct) => void;
}) {
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    const firstImage = product?.image ?? product?.images[0] ?? null;
    setActiveImage(firstImage);
    setLightboxOpen(false);
  }, [product]);

  if (!product) return null;

  const gallery = Array.from(new Set([product.image, ...product.images].filter(Boolean))) as string[];
  const currentImage = activeImage ?? gallery[0] ?? null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto border-[#D3A87C]/25 bg-[#FFFDF9] p-5 sm:p-7">
          <DialogHeader className="pr-8 text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8C6B53]">Mofu Haven 商品詳情</p>
            <DialogTitle className="text-xl leading-8 text-foreground md:text-2xl">{product.name}</DialogTitle>
            <DialogDescription className="text-sm leading-6 text-muted-foreground">
              {product.description || "這件商品的詳細介紹正在整理中，請以結帳頁顯示的資料為準。"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 md:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] md:items-start">
            <div>
              <button
                type="button"
                className="group relative block w-full cursor-zoom-in overflow-hidden rounded-2xl border border-border/70 bg-[#f5f0eb] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D3A87C]"
                onClick={() => setLightboxOpen(true)}
                aria-label={`放大查看 ${product.name} 商品圖片`}
              >
                <ProductImage src={currentImage} alt={product.name} className="border-0 bg-transparent" />
                <span className="pointer-events-none absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-xs font-semibold text-[#8C6B53] shadow-sm transition-transform group-hover:scale-[1.03]">
                  <Maximize2 className="h-4 w-4" />放大查看
                </span>
              </button>

              {gallery.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="商品圖片選擇">
                  {gallery.map((image, index) => (
                    <button
                      key={image}
                      type="button"
                      onClick={() => setActiveImage(image)}
                      className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border bg-[#f5f0eb] ${currentImage === image ? "border-[#D3A87C] ring-2 ring-[#D3A87C]/25" : "border-border/70"}`}
                      aria-label={`查看第 ${index + 1} 張商品圖片`}
                    >
                      <img src={image} alt="" className="h-full w-full object-contain p-1" onError={(event) => { event.currentTarget.src = PRODUCT_PLACEHOLDER; }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex min-h-full flex-col rounded-2xl border border-primary/15 bg-white/70 p-5">
              <p className="text-2xl font-bold text-[#8C6B53]">{formatPrice(product.unitAmount, product.currency)}</p>
              <div className="mt-5 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">詳細介紹</h3>
                  <p className="mt-2 whitespace-pre-line text-sm leading-7 text-muted-foreground">
                    {product.description || "目前沒有額外商品介紹。你可以先查看商品名稱及價格，或聯絡我們了解更多資料。"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">商品狀態</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{product.active ? "目前可購買" : "目前暫停供應"}</p>
                </div>
              </div>

              <DialogFooter className="mt-auto pt-7 sm:justify-start">
                <Button
                  type="button"
                  className="w-full rounded-full bg-[#D3A87C] text-white hover:bg-[#C2976B]"
                  disabled={!product.priceId}
                  onClick={() => onAddToCart(product)}
                >
                  加入購物車
                  <ShoppingBag className="h-4 w-4" />
                </Button>
              </DialogFooter>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-6xl border-white/10 bg-black/90 p-3 sm:p-5" aria-describedby={undefined}>
          <DialogHeader className="sr-only">
            <DialogTitle>放大查看：{product.name}</DialogTitle>
          </DialogHeader>
          <div className="flex max-h-[82vh] items-center justify-center overflow-hidden rounded-xl bg-black/30">
            <img
              src={currentImage || PRODUCT_PLACEHOLDER}
              alt={`${product.name} 大圖`}
              className="max-h-[80vh] w-full object-contain"
              onError={(event) => { event.currentTarget.src = PRODUCT_PLACEHOLDER; }}
            />
          </div>
          <DialogDescription className="text-center text-xs text-white/70">點擊右上角關閉圖片放大檢視</DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function ProductGrid() {
  const [filters, setFilters] = useState(getUrlFilters);
  const [searchInput, setSearchInput] = useState(filters.q);
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);
  const input = useMemo(() => ({ category: filters.category, q: filters.q }), [filters.category, filters.q]);
  const productsQuery = trpc.store.products.useQuery(input, { staleTime: 60_000, retry: 2 });

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
      const currentPath = window.location.pathname === "/products" ? "/products" : "/";
      const suffix = currentPath === "/products" ? "" : "#products";
      window.history.replaceState({}, "", `${currentPath}${query ? `?${query}` : ""}${suffix}`);
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
    const currentPath = window.location.pathname === "/products" ? "/products" : "/";
    const suffix = currentPath === "/products" ? "" : "#products";
    window.history.pushState({}, "", `${currentPath}${query ? `?${query}` : ""}${suffix}`);
    setFilters({ category, q });
    window.requestAnimationFrame(() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchInput.trim();
    updateUrl({ category: resolveSearchCategory(filters.category, query), q: query });
  };

  const { addItem, openCart } = useCart();

  const handleAddToCart = (product: StoreProduct) => {
    if (!product.priceId) {
      toast.error("這件商品暫時沒有可用價格，請稍後再試。");
      return;
    }
    addItem(product);
    openCart();
    toast.success("商品已加入購物車");
  };

  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, product: StoreProduct) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setSelectedProduct(product);
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

        <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {(Object.keys(categoryLabels) as ProductCategory[]).map((category) => {
            const CategoryIcon = categoryIcons[category];
            const isActive = filters.category === category;
            return (
              <Button
                key={category}
                type="button"
                size="sm"
                variant={isActive ? "default" : "outline"}
                className={`h-9 shrink-0 rounded-full px-3 text-xs md:text-sm ${isActive ? "bg-[#D3A87C] text-white hover:bg-[#C2976B]" : "border-[#D3A87C]/55 bg-[#FFFDF9] text-[#8C6B53] hover:bg-[#F3E5D5] hover:text-[#6F5645]"}`}
                onClick={() => updateUrl({ category })}
              >
                <CategoryIcon className="h-3.5 w-3.5" />
                {categoryLabels[category]}
              </Button>
            );
          })}
          {hasFilter && <Button type="button" size="sm" variant="ghost" className="shrink-0" onClick={() => { setSearchInput(""); updateUrl({ category: "all", q: "" }); }}><X className="h-4 w-4" />清除篩選</Button>}
        </div>

        {hasFilter && <p className="mb-5 text-sm text-muted-foreground">目前篩選：<span className="font-semibold text-foreground">{categoryLabels[filters.category]}</span>{filters.q && <>，搜尋「<span className="font-semibold text-foreground">{filters.q}</span>」</>}</p>}

        {productsQuery.isLoading && <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <ProductSkeleton key={index} />)}</div>}

        {productsQuery.isError && <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center"><h3 className="text-lg font-semibold text-foreground">暫時未能載入商品</h3><p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">商品服務未能連線。請重新整理此頁面，或確認 Stripe 整合已啟用。</p><Button className="mt-5" variant="outline" onClick={() => productsQuery.refetch()}><RefreshCw className="h-4 w-4" />重新載入</Button></div>}

        {!productsQuery.isLoading && !productsQuery.isError && productsQuery.data?.products.length === 0 && <div className="rounded-2xl border border-dashed border-primary/30 bg-background/70 p-10 text-center"><h3 className="text-lg font-semibold">呢個分類暫時未有商品</h3><p className="mt-2 text-sm text-muted-foreground">請嘗試其他分類或清除搜尋字詞。</p><Button className="mt-5" variant="outline" onClick={() => { setSearchInput(""); updateUrl({ category: "all", q: "" }); }}>查看全部商品</Button></div>}

        {!productsQuery.isLoading && !productsQuery.isError && productsQuery.data && productsQuery.data.products.length > 0 && (
          <div className="grid items-stretch grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {productsQuery.data.products.map((product) => (
              <Card
                key={product.id}
                role="button"
                tabIndex={0}
                aria-label={`查看 ${product.name} 商品詳情`}
                onClick={() => setSelectedProduct(product as StoreProduct)}
                onKeyDown={(event) => handleCardKeyDown(event, product as StoreProduct)}
                className="group flex h-full min-h-[26rem] cursor-pointer flex-col overflow-hidden border-border/70 bg-background/90 transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D3A87C]"
              >
                <ProductImage src={product.image} alt={product.name} />
                <CardHeader className="gap-2 p-4 text-left">
                  <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-foreground md:text-base">{product.name}</h3>
                  <p className="text-base font-bold text-primary">{formatPrice(product.unitAmount, product.currency)}</p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#8C6B53]">查看商品詳情 <ArrowUpRight className="h-3.5 w-3.5" /></span>
                </CardHeader>
                {product.description && <CardContent className="flex-1 px-4 pb-2 pt-0 text-left"><p className="line-clamp-3 text-xs leading-5 text-muted-foreground">{product.description}</p></CardContent>}
                {!product.description && <div className="flex-1" />}
                <CardFooter className="mt-auto flex justify-center p-4 pt-2">
                  <Button
                    size="sm"
                    className="h-9 w-auto max-w-full rounded-full px-4 text-xs md:text-sm"
                    disabled={!product.priceId}
                    onClick={(event) => { event.stopPropagation(); handleAddToCart(product as StoreProduct); }}
                  >
                    加入購物車<ShoppingBag className="h-3.5 w-3.5" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ProductDetailModal
        product={selectedProduct}
        open={Boolean(selectedProduct)}
        onOpenChange={(open) => { if (!open) setSelectedProduct(null); }}
        onAddToCart={handleAddToCart}
      />
    </section>
  );
}
