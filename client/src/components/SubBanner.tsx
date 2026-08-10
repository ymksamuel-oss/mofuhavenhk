export default function SubBanner() {
  return (
    <section id="about" className="scroll-mt-24 relative w-full max-w-7xl mx-auto px-4 py-8">
      <div className="relative w-full rounded-2xl overflow-hidden shadow-sm bg-[oklch(0.95_0.01_70)] transition-all duration-300 ease-out hover:shadow-md">

        {/* 副 Banner 圖片：使用 Vite public 內的本地圖片，確保 production 可顯示 */}
        <img
          src="/images/IMG_0383.webp"
          alt="與毛孩的日常治癒"
          className="w-full h-auto object-contain block mx-auto rounded-2xl"
        />

        {/* 文字疊加層 */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none">
          <div className="max-w-xl space-y-3 text-white pointer-events-auto">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
              與毛孩的日常治癒
            </h1>
            <p className="text-sm md:text-base text-white/90">
              精選日本天然寵物用品，陪伴毛孩每一個溫暖時刻
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
