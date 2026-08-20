import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import { ArrowLeft, BookOpen, Check, Heart, PawPrint, Share2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { catBreedGuides, catCareGuides } from "@shared/petWorld";

const BREED_PLACEHOLDER = "/manus-storage/mofu-haven-product-placeholder_002825b0.svg";
const FAVORITES_STORAGE_KEY = "mofu-haven-pet-world-favorites";

type FavoriteEntry = { key: string; title: string };

export default function PetWorld() {
  const [favorites, setFavorites] = useState<FavoriteEntry[]>([]);
  const [sharedKey, setSharedKey] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [imageRetryCounts, setImageRetryCounts] = useState<Record<string, number>>({});
  const [activeImageIndices, setActiveImageIndices] = useState<Record<string, number>>({});

  const handleImageScroll = (breedName: string, event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const index = Math.round(target.scrollLeft / target.clientWidth);
    setActiveImageIndices((current) => ({ ...current, [breedName]: index }));
  };

  const handlePrimaryImageError = (breedName: string, event: React.SyntheticEvent<HTMLImageElement>) => {
    const retryCount = imageRetryCounts[breedName] ?? 0;
    if (retryCount < 1) {
      setImageRetryCounts((current) => ({ ...current, [breedName]: retryCount + 1 }));
      const image = event.currentTarget;
      const retryUrl = new URL(image.currentSrc || image.src, window.location.origin);
      retryUrl.searchParams.set("pet-image-retry", String(retryCount + 1));
      image.src = retryUrl.toString();
      return;
    }
    setFailedImages((current) => ({ ...current, [breedName]: true }));
  };

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (saved) setFavorites(JSON.parse(saved) as FavoriteEntry[]);
    } catch {
      setFavorites([]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (key: string, title: string) => {
    const isSaved = favorites.some((entry) => entry.key === key);
    setFavorites((current) => isSaved ? current.filter((entry) => entry.key !== key) : [...current, { key, title }]);
    toast.success(isSaved ? "已從收藏移除" : "已加入收藏", { description: title });
  };

  const shareContent = async (key: string, title: string, text: string, hash: string) => {
    const url = `${window.location.origin}/pet-world${hash}`;
    try {
      const canShare = typeof navigator.share === "function";
      if (canShare) {
        await navigator.share({ title, text, url });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${title}｜${url}`);
      }
      setSharedKey(key);
      toast.success(canShare ? "分享視窗已開啟" : "連結已複製", { description: title });
      window.setTimeout(() => setSharedKey((current) => current === key ? null : current), 1800);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error("暫時未能分享", { description: "你可以複製瀏覽器網址再分享。" });
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="relative overflow-hidden bg-[#F7F3EE] py-14 md:py-24">
          <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-[#FFFDF9] jp-card-shadow/35 blur-3xl" />
          <div className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-[#B88A58]/25 blur-3xl" />
          <div className="container relative z-10 max-w-5xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#B88A58]/50 bg-[#FFFDF9] jp-card-shadow/60 px-4 py-2 text-sm font-semibold text-[#736859]">
              <PawPrint className="h-4 w-4" />探索寵物世界
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-tight text-[#3E3A37] md:text-6xl">認識貓咪的性格，慢慢找到合適的照顧方式</h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[#3E3A37]/80 md:text-lg">
              由品種特徵、互動習慣到日常環境，我們整理一份溫柔而實用的貓咪入門指南。每隻貓都有自己的節奏，以下內容適合作為日常觀察與照顧的起點。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="rounded-full bg-[#B88A58] text-white hover:bg-[#A67C52]"><a href="#cat-breeds">瀏覽貓咪品種</a></Button>
              <Button asChild variant="outline" className="rounded-full border-[#736859]/40 bg-[#FFFDF9] jp-card-shadow/50 text-[#736859] hover:bg-[#FFFDF9] jp-card-shadow"><a href="#care-guide"><BookOpen className="h-4 w-4" />日常飼養指南</a></Button>
            </div>
          </div>
        </section>

        <section className="bg-[#F7F3EE] py-8 md:py-12" aria-label="寵物專區">
          <div className="container max-w-6xl">
            <Tabs defaultValue="cats" className="w-full">
              <TabsList className="grid h-auto w-full max-w-2xl grid-cols-3 rounded-full bg-[#F7F3EE] p-1">
                <TabsTrigger value="cats" className="rounded-full px-3 py-2 text-xs text-[#736859] md:text-sm">貓咪專區</TabsTrigger>
                <TabsTrigger value="dogs" className="rounded-full px-3 py-2 text-xs text-[#736859] md:text-sm">狗狗專區（即將推出）</TabsTrigger>
                <TabsTrigger value="small-pets" className="rounded-full px-3 py-2 text-xs text-[#736859] md:text-sm">小寵物專區（即將推出）</TabsTrigger>
              </TabsList>

              <TabsContent value="cats" className="mt-8">
                <section id="cat-breeds" className="scroll-mt-20">
                  <div className="mb-8 flex flex-col gap-3 md:mb-10 md:flex-row md:items-end md:justify-between">
                    <div>
                      <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#736859]"><Sparkles className="h-4 w-4" />貓咪品種小檔案</p>
                      <h2 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">12 種常見貓咪的相處提示</h2>
                    </div>
                    <p className="max-w-xl text-sm leading-6 text-muted-foreground">品種只能提供概括方向，實際性格、健康狀況及生活需要仍要以每隻貓的個體觀察為準。</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {catBreedGuides.map((breed, index) => {
                      const favoriteKey = `breed:${breed.name}`;
                      const isFavorite = favorites.some((entry) => entry.key === favoriteKey);
                      const images = breed.images && breed.images.length > 0 ? breed.images : (breed.image ? [breed.image] : []);
                      const hasValidImages = images.length > 0 && !failedImages[breed.name];
                      const activeImgIndex = activeImageIndices[breed.name] ?? 0;
                      return (
                      <article id={`breed-${index + 1}`} key={breed.name} className="scroll-mt-24 overflow-hidden rounded-3xl border border-[#B88A58]/25 bg-[#FFFDF9] jp-card-shadow shadow-[0_8px_24px_rgba(140,107,83,0.07)] transition-transform duration-200 hover:-translate-y-1">
                        <div className="relative bg-[#FFFDF9] jp-card-shadow border-b border-[#B88A58]/15">
                          {hasValidImages ? (
                            <div className="relative">
                              <div>
                                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#FFFDF9] jp-card-shadow">
                                  <img
                                    src={images[activeImgIndex] ?? images[0]}
                                    alt={`${breed.name} 主圖`}
                                    loading="lazy"
                                    decoding="async"
                                    className="h-full w-full object-cover transition-all duration-300"
                                    onError={(event) => handlePrimaryImageError(breed.name, event)}
                                  />
                                  {images.length > 1 && (
                                    <div className="absolute bottom-2.5 right-3 z-10 rounded-full bg-black/65 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
                                      {activeImgIndex + 1} / {images.length}
                                    </div>
                                  )}
                                </div>
                                {images.length > 1 && (
                                  <div className="horizontal-scroll flex w-full gap-2 overflow-x-auto border-t border-[#B88A58]/15 bg-[#FFFDF9] jp-card-shadow p-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label={`${breed.name} 縮圖列表`}>
                                    {images.map((imgSrc, imgIdx) => (
                                      <button
                                        key={imgIdx}
                                        type="button"
                                        onClick={() => setActiveImageIndices((current) => ({ ...current, [breed.name]: imgIdx }))}
                                        className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border transition-all ${activeImgIndex === imgIdx ? "border-[#B88A58] ring-2 ring-[#B88A58]/30 scale-105" : "border-border/70 opacity-75 hover:opacity-100"}`}
                                        aria-label={`切換至 ${breed.name} 第 ${imgIdx + 1} 張相片`}
                                      >
                                        <img src={imgSrc} alt="" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                                      </button>
                                    ))}
                                  </div>
                                )}
                                {breed.isRealPhoto && breed.photoCredit && breed.sourceUrl && (
                                  <p className="border-t border-[#B88A58]/10 bg-[#FFFDF9] px-3 py-2 text-[10px] leading-4 text-muted-foreground">
                                    圖片來源：<a className="underline underline-offset-2 hover:text-[#736859]" href={breed.sourceUrl} target="_blank" rel="noreferrer" aria-label={`查看 ${breed.name} 圖片來源與授權`}>{breed.photoCredit}</a>
                                  </p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="aspect-[4/3] flex flex-col items-center justify-center p-6 text-center">
                              <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-[#B88A58]/15 text-[#736859]">
                                <PawPrint className="h-7 w-7" />
                              </div>
                              <span className="text-xs font-semibold tracking-wide text-[#736859]">真實圖片準備中</span>
                              <span className="mt-1 text-[10px] text-muted-foreground">嚴選實景拍攝 ‧ 非 AI 生成</span>
                            </div>
                          )}
                        </div>
                        <div className="p-5">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="text-lg font-bold text-[#3E3A37]">{breed.name}</h3>
                            <Heart className={`mt-0.5 h-5 w-5 shrink-0 text-[#B88A58] ${isFavorite ? "fill-[#B88A58]" : ""}`} />
                          </div>
                          <p className="mt-3 text-sm font-semibold leading-6 text-[#736859]">{breed.temperament}</p>
                          <div className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
                            <p><strong className="font-semibold text-foreground">照顧重點：</strong>{breed.care}</p>
                            <p><strong className="font-semibold text-foreground">相處提示：</strong>{breed.note}</p>
                          </div>
                          <div className="mt-5 flex flex-wrap gap-2">
                            <Button type="button" size="sm" variant="outline" onClick={() => toggleFavorite(favoriteKey, breed.name)} className="h-8 rounded-full border-[#B88A58]/55 px-3 text-xs text-[#736859] hover:bg-[#F7F3EE]">
                              <Heart className={`h-3.5 w-3.5 ${isFavorite ? "fill-[#B88A58]" : ""}`} />{isFavorite ? "已收藏" : "加入收藏"}
                            </Button>
                            <Button type="button" size="sm" variant="outline" onClick={() => void shareContent(favoriteKey, `${breed.name}｜Mofu Haven`, `${breed.name} 的品種與照顧提示`, `#breed-${index + 1}`)} className="h-8 rounded-full border-[#B88A58]/55 px-3 text-xs text-[#736859] hover:bg-[#F7F3EE]">
                              {sharedKey === favoriteKey ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}{sharedKey === favoriteKey ? "已複製" : "一鍵分享"}
                            </Button>
                          </div>
                        </div>
                      </article>
                      );
                    })}
                  </div>
                </section>

                <section id="care-guide" className="scroll-mt-20 mt-14 bg-[#F7F3EE] py-14 md:mt-20 md:py-20">
                  <div className="container max-w-5xl">
                    <div className="mb-8 text-center md:mb-10">
                      <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#736859]"><BookOpen className="h-4 w-4" />日常照顧筆記</p>
                      <h2 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">從生活細節開始的飼養指南</h2>
                      <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">以穩定、低壓和可持續的方式陪伴毛孩，逐步建立你們之間舒服的生活節奏。</p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      {catCareGuides.map((guide: { title: string; body: string }, index: number) => {
                        const favoriteKey = `guide:${guide.title}`;
                        const isFavorite = favorites.some((entry) => entry.key === favoriteKey);
                        return (
                        <article id={`guide-${index + 1}`} key={guide.title} className="scroll-mt-24 rounded-3xl border border-border/70 bg-[#FFFDF9] jp-card-shadow p-5 md:p-6">
                          <div className="flex items-start gap-4">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F7F3EE] text-sm font-bold text-[#736859]">{String(index + 1).padStart(2, "0")}</span>
                            <div><h3 className="text-lg font-semibold text-foreground">{guide.title}</h3><p className="mt-2 text-sm leading-7 text-muted-foreground">{guide.body}</p>
                              <div className="mt-4 flex flex-wrap gap-2">
                                <Button type="button" size="sm" variant="outline" onClick={() => toggleFavorite(favoriteKey, guide.title)} className="h-8 rounded-full border-[#B88A58]/55 px-3 text-xs text-[#736859] hover:bg-[#F7F3EE]"><Heart className={`h-3.5 w-3.5 ${isFavorite ? "fill-[#B88A58]" : ""}`} />{isFavorite ? "已收藏" : "加入收藏"}</Button>
                                <Button type="button" size="sm" variant="outline" onClick={() => void shareContent(favoriteKey, `${guide.title}｜Mofu Haven`, guide.body, `#guide-${index + 1}`)} className="h-8 rounded-full border-[#B88A58]/55 px-3 text-xs text-[#736859] hover:bg-[#F7F3EE]"><Share2 className="h-3.5 w-3.5" />一鍵分享</Button>
                              </div>
                            </div>
                          </div>
                        </article>
                        );
                      })}
                    </div>
                    <p className="mx-auto mt-8 max-w-3xl text-center text-xs leading-6 text-muted-foreground">本頁為一般照顧資訊，不能取代獸醫的個別診斷或治療建議。如貓咪出現持續或明顯異常，請盡快向合資格獸醫查詢。</p>
                    <div className="mt-9 flex flex-wrap justify-center gap-3">
                      <Button asChild className="rounded-full bg-[#B88A58] text-white hover:bg-[#A67C52]"><Link href="/products?category=cat">瀏覽貓咪商品</Link></Button>
                      <Button asChild variant="outline" className="rounded-full border-[#B88A58]/60 text-[#736859] hover:bg-[#F7F3EE]"><Link href="/"><ArrowLeft className="h-4 w-4" />返回首頁</Link></Button>
                    </div>
                  </div>
                </section>
              </TabsContent>

              <TabsContent value="dogs" className="mt-8">
                <div className="rounded-3xl border border-dashed border-[#B88A58]/50 bg-[#FFFDF9] jp-card-shadow px-6 py-16 text-center">
                  <PawPrint className="mx-auto h-10 w-10 text-[#B88A58]" />
                  <h2 className="mt-4 text-2xl font-bold text-[#3E3A37]">狗狗專區即將推出</h2>
                  <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-muted-foreground">我們正在整理狗狗品種、日常運動、飲食及居家照顧內容，敬請期待下一個專題更新。</p>
                </div>
              </TabsContent>

              <TabsContent value="small-pets" className="mt-8">
                <div className="rounded-3xl border border-dashed border-[#B88A58]/50 bg-[#FFFDF9] jp-card-shadow px-6 py-16 text-center">
                  <PawPrint className="mx-auto h-10 w-10 text-[#B88A58]" />
                  <h2 className="mt-4 text-2xl font-bold text-[#3E3A37]">小寵物專區即將推出</h2>
                  <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-muted-foreground">倉鼠、兔子及其他小寵物的品種與生活指南正在準備中，稍後會逐步加入更多內容。</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
