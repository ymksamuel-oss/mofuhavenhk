import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, BookOpen, Heart, PawPrint, Sparkles } from "lucide-react";
import { catBreedGuides, catCareGuides } from "@shared/petWorld";

export default function PetWorld() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="relative overflow-hidden bg-[#F3E5D5] py-14 md:py-24">
          <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-white/35 blur-3xl" />
          <div className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-[#D3A87C]/25 blur-3xl" />
          <div className="container relative z-10 max-w-5xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#D3A87C]/50 bg-white/60 px-4 py-2 text-sm font-semibold text-[#8C6B53]">
              <PawPrint className="h-4 w-4" />探索寵物世界
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-tight text-[#6F5645] md:text-6xl">認識貓咪的性格，慢慢找到合適的照顧方式</h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[#6F5645]/80 md:text-lg">
              由品種特徵、互動習慣到日常環境，我們整理一份溫柔而實用的貓咪入門指南。每隻貓都有自己的節奏，以下內容適合作為日常觀察與照顧的起點。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="rounded-full bg-[#D3A87C] text-white hover:bg-[#C2976B]"><a href="#cat-breeds">瀏覽貓咪品種</a></Button>
              <Button asChild variant="outline" className="rounded-full border-[#8C6B53]/40 bg-white/50 text-[#8C6B53] hover:bg-white"><a href="#care-guide"><BookOpen className="h-4 w-4" />日常飼養指南</a></Button>
            </div>
          </div>
        </section>

        <section id="cat-breeds" className="scroll-mt-20 bg-[#FFFDF9] py-14 md:py-20">
          <div className="container max-w-6xl">
            <div className="mb-8 flex flex-col gap-3 md:mb-10 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#8C6B53]"><Sparkles className="h-4 w-4" />貓咪品種小檔案</p>
                <h2 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">12 種常見貓咪的相處提示</h2>
              </div>
              <p className="max-w-xl text-sm leading-6 text-muted-foreground">品種只能提供概括方向，實際性格、健康狀況及生活需要仍要以每隻貓的個體觀察為準。</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {catBreedGuides.map((breed) => (
                <article key={breed.name} className="rounded-3xl border border-[#D3A87C]/25 bg-white p-5 shadow-[0_8px_24px_rgba(140,107,83,0.07)] transition-transform duration-200 hover:-translate-y-1">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-bold text-[#6F5645]">{breed.name}</h3>
                    <Heart className="mt-0.5 h-5 w-5 shrink-0 text-[#D3A87C]" />
                  </div>
                  <p className="mt-3 text-sm font-semibold leading-6 text-[#8C6B53]">{breed.temperament}</p>
                  <div className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
                    <p><strong className="font-semibold text-foreground">照顧重點：</strong>{breed.care}</p>
                    <p><strong className="font-semibold text-foreground">相處提示：</strong>{breed.note}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="care-guide" className="scroll-mt-20 bg-secondary/20 py-14 md:py-20">
          <div className="container max-w-5xl">
            <div className="mb-8 text-center md:mb-10">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#8C6B53]"><BookOpen className="h-4 w-4" />日常照顧筆記</p>
              <h2 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">從生活細節開始的飼養指南</h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">以穩定、低壓和可持續的方式陪伴毛孩，逐步建立你們之間舒服的生活節奏。</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {catCareGuides.map((guide, index) => (
                <article key={guide.title} className="rounded-3xl border border-border/70 bg-[#FFFDF9] p-5 md:p-6">
                  <div className="flex items-start gap-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F3E5D5] text-sm font-bold text-[#8C6B53]">{String(index + 1).padStart(2, "0")}</span>
                    <div><h3 className="text-lg font-semibold text-foreground">{guide.title}</h3><p className="mt-2 text-sm leading-7 text-muted-foreground">{guide.body}</p></div>
                  </div>
                </article>
              ))}
            </div>
            <p className="mx-auto mt-8 max-w-3xl text-center text-xs leading-6 text-muted-foreground">本頁為一般照顧資訊，不能取代獸醫的個別診斷或治療建議。如貓咪出現持續或明顯異常，請盡快向合資格獸醫查詢。</p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Button asChild className="rounded-full bg-[#D3A87C] text-white hover:bg-[#C2976B]"><Link href="/products?category=cats">瀏覽貓咪商品</Link></Button>
              <Button asChild variant="outline" className="rounded-full border-[#D3A87C]/60 text-[#8C6B53] hover:bg-[#F3E5D5]"><Link href="/"><ArrowLeft className="h-4 w-4" />返回首頁</Link></Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
