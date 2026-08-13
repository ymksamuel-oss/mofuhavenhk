export default function HeroBanner() {
  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 py-8">
      <div className="relative w-full rounded-2xl overflow-hidden shadow-sm bg-[oklch(0.95_0.01_70)] transition-all duration-300 ease-out hover:shadow-md">

        {/* 主 Banner 圖片：使用系統認得嘅正確檔名，保證完整顯示、不被裁剪 */}
        <img
          src="/mofu-haven-website-b.png.png"
          alt="Mofu Haven 毛毛港 日系質感寵物選物主視覺"
          className="w-full h-auto object-contain block mx-auto rounded-2xl"
        />

        {/* 文字疊加層 */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none">
          <div className="max-w-xl space-y-3 text-white pointer-events-auto">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
              日本嚴選寵物用品
            </h1>
            <p className="text-sm md:text-base text-white/90">
              用溫暖陪伴毛孩每一刻
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
