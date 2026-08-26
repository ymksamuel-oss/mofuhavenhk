"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ProductImage } from "@/components/product/ProductImage";
import { useI18n } from "@/lib/i18n/I18nProvider";

type ProductGalleryProps = {
  images?: string[];
  fallbackImage: string;
  alt: string;
  priority?: boolean;
};

function ArrowIcon({ direction }: { direction: "previous" | "next" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      {direction === "previous" ? <path d="m14.5 5-7 7 7 7" /> : <path d="m9.5 5 7 7-7 7" />}
    </svg>
  );
}

/**
 * Product imagery with desktop thumbnail switching and a mobile-friendly
 * scroll-snap carousel. It accepts a single cover image as a backwards-safe
 * fallback, so legacy products retain their current presentation.
 */
export function ProductGallery({
  images,
  fallbackImage,
  alt,
  priority = false,
}: ProductGalleryProps) {
  const { t } = useI18n();
  const galleryImages = useMemo(() => {
    const unique = Array.from(
      new Set((images ?? []).filter((image) => Boolean(image?.trim()))),
    ).slice(0, 5);
    return unique.length > 0 ? unique : [fallbackImage];
  }, [fallbackImage, images]);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const swipeStartX = useRef<number | null>(null);
  const hasMultipleImages = galleryImages.length > 1;

  useEffect(() => {
    setActiveIndex((current) => Math.min(current, galleryImages.length - 1));
  }, [galleryImages.length]);

  const scrollToIndex = useCallback((index: number, behavior: ScrollBehavior = "smooth") => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const nextIndex = Math.max(0, Math.min(index, galleryImages.length - 1));
    scroller.scrollTo({
      left: nextIndex * scroller.clientWidth,
      behavior,
    });
    setActiveIndex(nextIndex);
  }, [galleryImages.length]);

  const updateActiveFromScroll = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller || scroller.clientWidth === 0) return;
    setActiveIndex(
      Math.max(
        0,
        Math.min(
          Math.round(scroller.scrollLeft / scroller.clientWidth),
          galleryImages.length - 1,
        ),
      ),
    );
  }, [galleryImages.length]);

  const move = (direction: "previous" | "next") => {
    const delta = direction === "previous" ? -1 : 1;
    scrollToIndex((activeIndex + delta + galleryImages.length) % galleryImages.length);
  };

  const onTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    swipeStartX.current = event.touches[0]?.clientX ?? null;
  };

  const onTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const start = swipeStartX.current;
    const end = event.changedTouches[0]?.clientX;
    swipeStartX.current = null;
    if (start === null || end === undefined || Math.abs(start - end) < 42) return;
    move(start > end ? "next" : "previous");
  };

  return (
    <section aria-label={t("productGalleryLabel")} className="relative w-full">
      <div
        ref={scrollerRef}
        onScroll={updateActiveFromScroll}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="scrollbar-none relative flex aspect-square w-full snap-x snap-mandatory overflow-x-auto rounded-3xl bg-white ring-1 ring-[color:var(--line)]"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {galleryImages.map((image, index) => (
          <div
            key={`${image}-${index}`}
            className="relative h-full w-full shrink-0 snap-center overflow-hidden"
            aria-hidden={index !== activeIndex}
          >
            <ProductImage
              src={image}
              alt={`${alt} — ${index + 1}`}
              priority={priority && index === 0}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-contain p-3 sm:p-5"
              />
          </div>
        ))}
      </div>

      {hasMultipleImages ? (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-0 flex aspect-square items-center justify-between px-3 sm:px-4">
            <button
              type="button"
              onClick={() => move("previous")}
              className="pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/80 bg-white/90 text-[color:var(--ink)] shadow-sm transition hover:scale-105 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2"
              aria-label={t("productGalleryPrevious")}
            >
              <ArrowIcon direction="previous" />
            </button>
            <button
              type="button"
              onClick={() => move("next")}
              className="pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/80 bg-white/90 text-[color:var(--ink)] shadow-sm transition hover:scale-105 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2"
              aria-label={t("productGalleryNext")}
            >
              <ArrowIcon direction="next" />
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1 scrollbar-none" role="tablist" aria-label={t("productGalleryThumbnails")}>
              {galleryImages.map((image, index) => {
                const selected = index === activeIndex;
                return (
                  <button
                    key={`thumbnail-${image}-${index}`}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    aria-label={t("productGalleryShowImage")
                      .replace("{index}", String(index + 1))
                      .replace("{total}", String(galleryImages.length))}
                    onClick={() => scrollToIndex(index)}
                    className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 bg-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 sm:h-[4.5rem] sm:w-[4.5rem] ${
                      selected
                        ? "border-[color:var(--accent)] shadow-sm"
                        : "border-transparent opacity-70 hover:border-[color:var(--line)] hover:opacity-100"
                    }`}
                  >
                    <ProductImage
                      src={image}
                      alt={`${alt} thumbnail ${index + 1}`}
                      sizes="72px"
                      className="object-cover"
                    />
                  </button>
                );
              })}
            </div>
            <span className="shrink-0 rounded-full border border-[color:var(--line)] bg-white px-2.5 py-1 text-xs font-semibold tabular-nums text-[color:var(--muted)]" aria-live="polite">
              {activeIndex + 1} / {galleryImages.length}
            </span>
          </div>
        </>
      ) : null}
    </section>
  );
}
