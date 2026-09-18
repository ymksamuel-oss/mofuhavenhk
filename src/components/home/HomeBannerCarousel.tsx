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

function BannerArtwork({
  src,
  alt,
  priority,
  mobile = false,
}: {
  src: string;
  alt: string;
  priority: boolean;
  mobile?: boolean;
}) {
  return (
    <ProductImage
      src={src}
      alt={alt}
      priority={priority}
      sizes="100vw"
      className={`object-contain ${mobile ? "p-0" : "p-0"}`}
    />
  );
}

/** Admin-managed hero banners with the official Best Partner poster fallback. */
export function HomeBannerCarousel() {
  const { t } = useI18n();
  const [managedBanners, setManagedBanners] = useState<StoreBanner[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<"next" | "previous">("next");
  const timer = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  const banners = useMemo(
    () => managedBanners.map(cleanBanner).filter((banner): banner is NonNullable<ReturnType<typeof cleanBanner>> => Boolean(banner)),
    [managedBanners],
  );
  const hasManagedBanners = banners.length > 0;
  const activeBanner = banners[activeIndex] ?? null;

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/store", { cache: "no-store", signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        setManagedBanners(Array.isArray(payload?.banners) ? payload.banners : []);
        setActiveIndex(0);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setManagedBanners([]);
      });
    return () => controller.abort();
  }, []);

  const goTo = useCallback((index: number) => {
    if (banners.length <= 1) return;
    setDirection(index >= activeIndex ? "next" : "previous");
    setActiveIndex((index + banners.length) % banners.length);
  }, [activeIndex, banners.length]);

  const goNext = useCallback(() => {
    if (banners.length <= 1) return;
    setDirection("next");
    setActiveIndex((index) => (index + 1) % banners.length);
  }, [banners.length]);

  const goPrevious = useCallback(() => {
    if (banners.length <= 1) return;
    setDirection("previous");
    setActiveIndex((index) => (index - 1 + banners.length) % banners.length);
  }, [banners.length]);

  const restartAutoplay = useCallback(() => {
    if (timer.current !== null) window.clearInterval(timer.current);
    timer.current = banners.length > 1 ? window.setInterval(goNext, AUTO_PLAY_MS) : null;
  }, [banners.length, goNext]);

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
    if (touchStartX.current === null || banners.length <= 1) return;
    const deltaX = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(deltaX) < 40) return;
    if (deltaX < 0) goNext();
    else goPrevious();
    restartAutoplay();
  }, [banners.length, goNext, goPrevious, restartAutoplay]);

  const title = activeBanner?.title || "Best Partner PLAIN PACK SERIES";
  const href = activeBanner?.href || "/categories/dogs";
  const desktopImage = activeBanner?.desktop || OFFICIAL_POSTER;
  const mobileImage = activeBanner?.mobile || OFFICIAL_POSTER;
  const slideClass = direction === "next" ? "banner-slide-in-next" : "banner-slide-in-previous";

  return (
    <section
      aria-label={t("homeBannerAriaLabel")}
      className="mobile-home-soft-surface relative z-0 bg-[color:var(--background)] px-0 py-3 sm:px-6 sm:py-6 lg:px-10 lg:py-8"
    >
      <div className="relative mx-auto w-full max-w-7xl overflow-hidden rounded-none border-y border-[#d7b893]/70 bg-[#f7efe4] shadow-[0_22px_52px_-38px_rgba(75,54,33,0.58)] sm:rounded-[1.5rem] sm:border">
        <div
          className={`relative aspect-[4/5] w-full touch-pan-x sm:aspect-[16/9] ${slideClass}`}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <CategoryNavLink
            href={href}
            aria-label={title}
            className="group absolute inset-0 block touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-inset"
          >
            <div className="relative h-full w-full sm:hidden">
              <BannerArtwork src={mobileImage} alt={title} priority={!hasManagedBanners || activeIndex === 0} mobile />
            </div>
            <div className="relative hidden h-full w-full sm:block">
              <BannerArtwork src={desktopImage} alt={title} priority={!hasManagedBanners || activeIndex === 0} />
            </div>
          </CategoryNavLink>

          {banners.length > 1 ? (
            <div className="pointer-events-none absolute inset-0 z-20">
              <button
                type="button"
                aria-label={t("homeBannerPrevious")}
                onClick={() => { goPrevious(); restartAutoplay(); }}
                className="pointer-events-auto absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-xl text-white shadow-sm transition hover:bg-black/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >‹</button>
              <button
                type="button"
                aria-label={t("homeBannerNext")}
                onClick={() => { goNext(); restartAutoplay(); }}
                className="pointer-events-auto absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-xl text-white shadow-sm transition hover:bg-black/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >›</button>
              <div className="pointer-events-auto absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2" role="tablist" aria-label={t("homeBannerSelect")}>
                {banners.map((banner, index) => (
                  <button
                    key={banner.id}
                    type="button"
                    role="tab"
                    aria-selected={activeIndex === index}
                    aria-label={t("homeBannerGoTo").replace("{number}", String(index + 1))}
                    onClick={() => { goTo(index); restartAutoplay(); }}
                    className={`h-2.5 rounded-full border border-white/90 transition-all ${activeIndex === index ? "w-8 bg-white" : "w-2.5 bg-white/50"}`}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
