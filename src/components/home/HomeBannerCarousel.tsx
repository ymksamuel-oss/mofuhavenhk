"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CategoryNavLink } from "@/components/CategoryNavLink";
import { ProductImage } from "@/components/product/ProductImage";
import { useI18n } from "@/lib/i18n/I18nProvider";

type StoreBanner = {
  id?: string | number;
  image_url?: string | null;
  mobile_image_url?: string | null;
  link?: string | null;
  title?: string | null;
  sort_order?: number | null;
};

const AUTO_PLAY_MS = 5000;
const OFFICIAL_POSTER = "/images/best-partner-plain-pack-series.png";

function cleanBanner(banner: StoreBanner) {
  const desktop = typeof banner.image_url === "string" ? banner.image_url.trim() : "";
  const mobile = typeof banner.mobile_image_url === "string" ? banner.mobile_image_url.trim() : "";
  if (!desktop) return null;
  return {
    id: String(banner.id ?? desktop),
    desktop,
    mobile: mobile || desktop,
    href: banner.link?.trim() || "/categories/dogs",
    title: banner.title?.trim() || "Mofu Haven Banner",
  };
}

function BannerArtwork({ src, alt, priority }: { src: string; alt: string; priority: boolean }) {
  return <ProductImage src={src} alt={alt} priority={priority} sizes="100vw" className="object-contain p-0" />;
}

/** Admin-managed hero banners with the official Best Partner poster fallback. */
export function HomeBannerCarousel() {
  const { t } = useI18n();
  const [managedBanners, setManagedBanners] = useState<StoreBanner[]>([]);
  const [autoplayEnabled, setAutoplayEnabled] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<"next" | "previous">("next");
  const timer = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  const banners = useMemo(
    () => managedBanners.map(cleanBanner).filter((banner): banner is NonNullable<ReturnType<typeof cleanBanner>> => Boolean(banner)),
    [managedBanners],
  );
  const visibleBanners = autoplayEnabled ? banners : banners.slice(0, 1);
  const hasManagedBanners = banners.length > 0;
  const activeBanner = visibleBanners[activeIndex] ?? visibleBanners[0] ?? null;

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/store", { cache: "no-store", signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        setManagedBanners(Array.isArray(payload?.banners) ? payload.banners : []);
        setAutoplayEnabled(String(payload?.settings?.banner_autoplay_enabled || "false").toLowerCase() === "true");
        setActiveIndex(0);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setManagedBanners([]);
      });
    return () => controller.abort();
  }, []);

  const goTo = useCallback((index: number) => {
    if (visibleBanners.length <= 1) return;
    setDirection(index >= activeIndex ? "next" : "previous");
    setActiveIndex((index + visibleBanners.length) % visibleBanners.length);
  }, [activeIndex, visibleBanners.length]);

  const goNext = useCallback(() => {
    if (visibleBanners.length <= 1) return;
    setDirection("next");
    setActiveIndex((index) => (index + 1) % visibleBanners.length);
  }, [visibleBanners.length]);

  const goPrevious = useCallback(() => {
    if (visibleBanners.length <= 1) return;
    setDirection("previous");
    setActiveIndex((index) => (index - 1 + visibleBanners.length) % visibleBanners.length);
  }, [visibleBanners.length]);

  const restartAutoplay = useCallback(() => {
    if (timer.current !== null) window.clearInterval(timer.current);
    timer.current = autoplayEnabled && visibleBanners.length > 1 ? window.setInterval(goNext, AUTO_PLAY_MS) : null;
  }, [autoplayEnabled, visibleBanners.length, goNext]);

  useEffect(() => {
    restartAutoplay();
    return () => {
      if (timer.current !== null) window.clearInterval(timer.current);
      timer.current = null;
    };
  }, [restartAutoplay]);

  const handleTouchStart = useCallback((event: React.TouchEvent<HTMLElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }, []);

  const handleTouchEnd = useCallback((event: React.TouchEvent<HTMLElement>) => {
    if (touchStartX.current === null || visibleBanners.length <= 1) return;
    const deltaX = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(deltaX) < 40) return;
    if (deltaX < 0) goNext();
    else goPrevious();
    restartAutoplay();
  }, [visibleBanners.length, goNext, goPrevious, restartAutoplay]);

  const title = activeBanner?.title || "Best Partner PLAIN PACK SERIES";
  const href = activeBanner?.href || "/categories/dogs";
  const desktopImage = activeBanner?.desktop || OFFICIAL_POSTER;
  const mobileImage = activeBanner?.mobile || OFFICIAL_POSTER;
  const slideClass = direction === "next" ? "banner-slide-in-next" : "banner-slide-in-previous";

  return (
    <section aria-label={t("homeBannerAriaLabel")} className="mobile-home-soft-surface relative z-0 bg-[color:var(--background)] px-0 py-4 md:py-6 sm:px-6 lg:px-10">
      <div className="relative mx-auto w-full max-w-7xl overflow-hidden rounded-none border-y border-[#d7b893]/70 bg-[#f7efe4] shadow-[0_22px_52px_-38px_rgba(75,54,33,0.58)] sm:rounded-[1.5rem] sm:border">
        <div className={`relative h-[220px] w-full touch-pan-x sm:h-[260px] md:h-[300px] lg:h-[360px] xl:h-[380px] ${slideClass}`} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          <CategoryNavLink href={href} aria-label={title} className="group absolute inset-0 block touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-inset">
            <div className="relative h-full w-full sm:hidden"><BannerArtwork src={mobileImage} alt={title} priority={!hasManagedBanners || activeIndex === 0} /></div>
            <div className="relative hidden h-full w-full sm:block"><BannerArtwork src={desktopImage} alt={title} priority={!hasManagedBanners || activeIndex === 0} /></div>
          </CategoryNavLink>

          {visibleBanners.length > 1 ? (
            <div className="pointer-events-none absolute inset-0 z-20">
              <button type="button" aria-label={t("homeBannerPrevious")} onClick={() => { goPrevious(); restartAutoplay(); }} className="pointer-events-auto absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-xl text-white shadow-sm transition hover:bg-black/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">‹</button>
              <button type="button" aria-label={t("homeBannerNext")} onClick={() => { goNext(); restartAutoplay(); }} className="pointer-events-auto absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-xl text-white shadow-sm transition hover:bg-black/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">›</button>
              <div className="pointer-events-auto absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2" role="tablist" aria-label={t("homeBannerSelect")}>
                {visibleBanners.map((banner, index) => <button key={banner.id} type="button" role="tab" aria-selected={activeIndex === index} aria-label={t("homeBannerGoTo").replace("{number}", String(index + 1))} onClick={() => { goTo(index); restartAutoplay(); }} className={`h-2.5 rounded-full border border-white/90 transition-all ${activeIndex === index ? "w-8 bg-white" : "w-2.5 bg-white/50"}`} />)}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
