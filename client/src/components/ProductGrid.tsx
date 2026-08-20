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
import { filterCatalogProducts, getSubCatalogs, normalizeRequestedCategory, resolveSearchCategory, type ProductCategory } from "@shared/productCatalog";
import { storefrontCategories } from "@shared/categoryNavigation";
import { isCatalogKey, type CatalogKey, type SubCatalogKey } from "@shared/catalogHierarchy";
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
  Sparkles,
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
  category: string;
  sub_category: string;
  metadata: Record<string, string>;
};

const categoryIcons: Partial<Record<ProductCategory, typeof Cat>> = {
  all: LayoutGrid,
  cat: Cat,
  dog: Dog,
  "small-pets": Rabbit,
  cats: Cat,
  dogs: Dog,
  treats: Bone,
  "wet-cans": Droplet,
  toys: Gamepad2,
  supplements: Heart,
  "cat-wet-food": Droplet,
  "cat-dry-food": LayoutGrid,
  "cat-litter": Sparkles,
  "cat-treats": Bone,
  "cat-supplies": Heart,
  "dog-wet-food": Droplet,
  "dog-dry-food": LayoutGrid,
  "dog-treats": Bone,
  "dog-supplies": Heart,
  "small-pet-food": LayoutGrid,
  "small-pet-treats": Bone,
  "small-pet-supplies": Backpack,
  deals: Tag,
  bestsellers: TrendingUp,
  outdoor: Backpack,
};

const compactCategories: CatalogKey[] = ["cat", "dog", "small-pets"];

const categoryLabels: Partial<Record<ProductCategory, string>> = {
  all: "全部商品",
  cat: "貓咪商品",
  dog: "狗狗商品",
  "small-pets": "小寵物商品",
  cats: "貓咪商品",
  dogs: "狗狗商品",
  treats: "寵物零食",
  "wet-cans": "貓咪罐罐",
  toys: "寵物玩具",
  supplements: "營養保健",
  "cat-wet-food": "貓罐頭／濕糧",
  "cat-dry-food": "乾糧／主食糧",
  "cat-litter": "貓砂／清潔用品",
  "cat-treats": "貓咪零食／凍乾",
  "cat-supplies": "用品／玩具／保健",
  "dog-wet-food": "狗狗罐頭／濕糧",
  "dog-dry-food": "乾糧／主食糧",
  "dog-treats": "狗狗零食／骨頭",
  "dog-supplies": "用品／玩具／保健",
  "small-pet-food": "主食／牧草",
  "small-pet-treats": "零食／點心",
  "small-pet-supplies": "墊材／用品",
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
    <Card className="overflow-hidden border-border/70 bg-[#FFFDF9] jp-card-shadow">
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
    <div className={`relative flex aspect-square items-center justify-center overflow-hidden rounded-t-[12px] bg-[#FFFDF9] ${className}`}>
      <img
        src={imageSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-contain p-2.5 transition-transform duration-300 md:p-6"
        onError={() => setImageSrc((current) => current === PRODUCT_PLACEHOLDER ? current : PRODUCT_PLACEHOLDER)}
      />
      {imageSrc === PRODUCT_PLACEHOLDER && (
        <span className="pointer-events-none absolute bottom-3 inline-flex items-center gap-1 rounded-full bg-[#FFFDF9] jp-card-shadow/85 px-3 py-1 text-xs text-[#736859] shadow-sm">
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
        <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto border-[#B88A58]/25 bg-[#FFFDF9] jp-card-shadow p-5 sm:p-7">
          <DialogHeader className="pr-8 text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#736859]">Mofu Haven 商品詳情</p>
            <DialogTitle className="text-xl leading-8 text-foreground md:text-2xl">{product.name}</DialogTitle>
            <DialogDescription className="text-sm leading-6 text-muted-foreground">
              {product.description || "這件商品的詳細介紹正在整理中，請以結帳頁顯示的資料為準。"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 md:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] md:items-start">
            <div>
              <button
                type="button"
                className="group relative block w-full cursor-zoom-in overflow-hidden rounded-2xl border border-border/70 bg-[#FFFDF9] jp-card-shadow text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B88A58]"
                onClick={() => setLightboxOpen(true)}
                aria-label={`放大查看 ${product.name} 商品圖片`}
              >
                <ProductImage src={currentImage} alt={product.name} className="border-0 bg-transparent" />
                <span className="pointer-events-none absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-[#FFFDF9] jp-card-shadow/90 px-3 py-2 text-xs font-semibold text-[#736859] shadow-sm transition-transform group-hover:scale-[1.03]">
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
                      className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border bg-[#FFFDF9] jp-card-shadow ${currentImage === image ? "border-[#B88A58] ring-2 ring-[#B88A58]/25" : "border-border/70"}`}
                      aria-label={`查看第 ${index + 1} 張商品圖片`}
                    >
                      <img src={image} alt="" className="h-full w-full object-contain p-1" onError={(event) => { event.currentTarget.src = PRODUCT_PLACEHOLDER; }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex min-h-full flex-col rounded-2xl border border-primary/15 bg-[#FFFDF9] jp-card-shadow p-5">
              <p className="text-2xl font-bold text-[#736859]">{formatPrice(product.unitAmount, product.currency)}</p>
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
                  className="w-full rounded-full bg-[#B88A58] text-white hover:bg-[#A67C52]"
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
  const [debouncedSearch, setDebouncedSearch] = useState(filters.q);
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);
  const input = useMemo(() => ({
    // Search uses the full catalog; the actual text filter runs locally after debounce.
    category: searchInput.trim() ? "all" : filters.category,
  }), [filters.category, searchInput]);
  const productsQuery = trpc.store.products.useQuery(input, { staleTime: 60_000, retry: 2 });

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchInput), 200);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

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
    setDebouncedSearch(query);
    updateUrl({ category: resolveSearchCategory(filters.category, query), q: query });
  };

  const selectCategory = (category: ProductCategory) => {
    setSearchInput("");
    setDebouncedSearch("");
    updateUrl({ category, q: "" });
  };

  const { addItem } = useCart();
  const isProductsPage = window.location.pathname === "/products";
  const activeCategory = debouncedSearch.trim() ? "all" : filters.category;
  const activeCatalogKey: CatalogKey | null = isCatalogKey(activeCategory) ? activeCategory : null;
  const activeSubCatalogs = activeCatalogKey ? getSubCatalogs(activeCatalogKey) : [];
  const visibleProducts = useMemo(
    () => filterCatalogProducts(productsQuery.data?.products ?? [], activeCategory, debouncedSearch),
    [productsQuery.data?.products, activeCategory, debouncedSearch],
  );

  const handleAddToCart = (product: StoreProduct) => {
    if (!product.priceId) {
      toast.error("這件商品暫時沒有可用價格，請稍後再試。");
      return;
    }
    addItem(product);
    toast.success("已加入購物車", {
      duration: 2000,
      description: "可繼續瀏覽商品，按右上角購物車即可查看。",
    });
  };

  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, product: StoreProduct) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setSelectedProduct(product);
    }
  };

  return (
    <section id="product-list" className="relative scroll-mt-20 overflow-hidden bg-[#F7F3EE] py-1 sm:py-3 md:py-16">
      <div className="container relative z-10">
        <div className="mb-2 hidden flex-col gap-5 md:mb-12 md:flex md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary"><ShoppingBag className="h-4 w-4" />Stripe 商品目錄</p>
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">為毛孩慢慢挑選真正可購買的好物</h2>
            <p className="mt-3 max-w-2xl text-foreground/70">商品、圖片、價格和分類直接來自已核實的 Stripe Live 商品資料。</p>
          </div>
          {productsQuery.data && <span className="shrink-0 text-sm font-medium text-muted-foreground">目前顯示 {visibleProducts.length} 件／共 {productsQuery.data.totalAvailable} 件</span>}
        </div>

        {isProductsPage && (
          <>
            <div className="horizontal-scroll mb-1 flex w-full min-w-0 flex-nowrap gap-2 pb-1 pr-6" aria-label="主分類篩選" role="region" tabIndex={0}>
              {compactCategories.map((category) => {
                const CategoryIcon = categoryIcons[category] ?? LayoutGrid;
                const isActive = activeCatalogKey === category;
                return (
                  <Button key={category} type="button" size="sm" variant={isActive ? "default" : "outline"} className={`h-9 shrink-0 rounded-full px-3 text-xs md:text-sm ${isActive ? "bg-[#B88A58] text-white hover:bg-[#A67C52]" : "border-[#B88A58]/55 bg-[#FFFDF9] jp-card-shadow/95 text-[#736859] hover:bg-[#F7F3EE] hover:text-[#3E3A37]"}`} onClick={() => selectCategory(category)}>
                    <CategoryIcon className="h-3.5 w-3.5" />{categoryLabels[category] ?? category}
                  </Button>
                );
              })}
            </div>
            {activeSubCatalogs.length > 0 && (
              <div className="horizontal-scroll mb-2 flex w-full min-w-0 flex-nowrap gap-2 pb-1 pr-6" aria-label="子分類篩選" role="region" tabIndex={0}>
                {activeSubCatalogs.map((subCatalog) => {
                  const SubCategoryIcon = categoryIcons[subCatalog.key] ?? LayoutGrid;
                  const isActive = activeCategory === subCatalog.key;
                  return (
                    <Button key={subCatalog.key} type="button" size="sm" variant={isActive ? "default" : "outline"} className={`h-8 shrink-0 rounded-full px-2.5 text-[11px] md:text-xs ${isActive ? "bg-[#A67C52] text-white hover:bg-[#B28760]" : "border-[#B88A58]/40 bg-[#FFFDF9] jp-card-shadow/90 text-[#736859] hover:bg-[#F7F3EE] hover:text-[#3E3A37]"}`} onClick={() => selectCategory(subCatalog.key)}>
                      <SubCategoryIcon className="h-3.5 w-3.5" />{subCatalog.label}
                    </Button>
                  );
                })}
              </div>
            )}
          </>
        )}

        <form onSubmit={submitSearch} className="mb-1.5 flex">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="搜尋貓咪商品、零食、罐罐⋯" aria-label="搜尋商品" className="h-10 w-full rounded-full border border-[#B88A58]/35 bg-[#FFFDF9] jp-card-shadow/90 pl-10 pr-4 text-sm outline-none transition placeholder:text-[#736859]/65 focus:border-[#A67C52] focus:ring-2 focus:ring-[#B88A58]/20" />
          </div>
        </form>

        {productsQuery.isLoading && <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <ProductSkeleton key={index} />)}</div>}

        {productsQuery.isError && <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center"><h3 className="text-lg font-semibold text-foreground">暫時未能載入商品</h3><p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">商品服務未能連線。請重新整理此頁面，或確認 Stripe 整合已啟用。</p><Button className="mt-5" variant="outline" onClick={() => productsQuery.refetch()}><RefreshCw className="h-4 w-4" />重新載入</Button></div>}

        {!productsQuery.isLoading && !productsQuery.isError && visibleProducts.length === 0 && <div className="rounded-2xl border border-dashed border-primary/30 bg-[#FFFDF9] jp-card-shadow p-6 text-center md:p-10"><h3 className="text-lg font-semibold">呢個分類暫時未有商品</h3><p className="mt-2 text-sm text-muted-foreground">請嘗試其他分類或清除搜尋字詞。</p><Button className="mt-5" variant="outline" onClick={() => { setSearchInput(""); updateUrl({ category: "all", q: "" }); }}>查看全部商品</Button></div>}

        {!productsQuery.isLoading && !productsQuery.isError && productsQuery.data && visibleProducts.length > 0 && (
          <div className="grid items-stretch grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {visibleProducts.map((product) => (
              <Card
                key={product.id}
                role="button"
                tabIndex={0}
                aria-label={`查看 ${product.name} 商品詳情`}
                onClick={() => setSelectedProduct(product as StoreProduct)}
                onKeyDown={(event) => handleCardKeyDown(event, product as StoreProduct)}
                className="group flex h-full min-h-0 cursor-pointer flex-col overflow-hidden rounded-[12px] border-[#E6DFD5] bg-[#FFFDF9] jp-card-shadow transition-all duration-200 hover:-translate-y-1 hover:border-[#B88A58]/40 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B88A58] md:min-h-[21rem]"
              >
                <ProductImage src={product.image} alt={product.name} />
                <CardHeader className="gap-1.5 p-2.5 text-left md:p-4">
                  <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-[#736859] md:text-xs">{product.metadata.brand || product.metadata.brand_name || product.metadata.vendor || "Mofu Haven 精選"}</p>
                  <h3 className="line-clamp-2 text-xs font-semibold leading-4 text-foreground md:text-base md:leading-5">{product.name}</h3>
                  <p className="text-sm font-bold text-primary md:text-base">{formatPrice(product.unitAmount, product.currency)}</p>
                </CardHeader>
                <CardFooter className="mt-auto flex justify-center p-2.5 pt-1.5 md:p-4 md:pt-2">
                  <Button
                    size="sm"
                    className="h-8 w-auto max-w-full rounded-full px-3 text-[11px] md:h-9 md:px-4 md:text-sm"
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
