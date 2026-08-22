"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type SyntheticEvent,
} from "react";
import { CAT_BREED_IMAGE_FALLBACK } from "@/lib/catBreeds";

export type BreedGallerySlide = {
  tag: string;
  src: string;
  alt: string;
  description: string;
};

/** @deprecated Use BreedGallerySlide */
export type BreedStorySlide = BreedGallerySlide;

type BreedGalleryProps = {
  title: string;
  slides: BreedGallerySlide[];
};

function handleSlideImageError(event: SyntheticEvent<HTMLImageElement>) {
  const image = event.currentTarget;
  if (image.dataset.fallbackApplied === "true") return;
  image.dataset.fallbackApplied = "true";
  image.src = CAT_BREED_IMAGE_FALLBACK;
}

/**
 * Horizontal card-swipe gallery for breed detail photos.
 * Photo frame only — no top segmented progress-bar overlays.
 */
export function BreedGallery({ title, slides }: BreedGalleryProps) {
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const updateActiveFromScroll = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller || slides.length === 0) return;

    const cards = Array.from(scroller.children) as HTMLElement[];
    if (cards.length === 0) return;

    const scrollerCenter = scroller.scrollLeft + scroller.clientWidth / 2;
    let nearest = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    cards.forEach((card, index) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(cardCenter - scrollerCenter);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = index;
      }
    });

    setActiveIndex(nearest);
  }, [slides.length]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    updateActiveFromScroll();
    scroller.addEventListener("scroll", updateActiveFromScroll, {
      passive: true,
    });
    window.addEventListener("resize", updateActiveFromScroll);

    return () => {
      scroller.removeEventListener("scroll", updateActiveFromScroll);
      window.removeEventListener("resize", updateActiveFromScroll);
    };
  }, [updateActiveFromScroll]);

  const scrollToIndex = (index: number) => {
    const scroller = scrollerRef.current;
    const card = scroller?.children[index] as HTMLElement | undefined;
    if (!scroller || !card) return;
    scroller.scrollTo({
      left: card.offsetLeft - (scroller.clientWidth - card.offsetWidth) / 2,
      behavior: "smooth",
    });
  };

  if (slides.length === 0) return null;

  return (
    <section className="mt-10 sm:mt-12" data-breed-gallery="card-swipe">
      <div className="mb-4 flex items-end justify-between gap-3 px-0">
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
        <p className="shrink-0 rounded-full border border-[#2B2623]/15 bg-[#FFFFFF] px-3 py-1 text-xs font-semibold tracking-[0.08em] text-[#2B2623]/65">
          {activeIndex + 1} / {slides.length}
        </p>
      </div>

      <div className="-mx-4 sm:-mx-6">
        <ul
          ref={scrollerRef}
          className="scrollbar-none flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 sm:px-6"
          style={{ WebkitOverflowScrolling: "touch" }}
          aria-label={title}
        >
          {slides.map((slide, index) => (
            <li
              key={slide.tag}
              className="w-[85vw] max-w-[360px] shrink-0 snap-center"
              aria-current={index === activeIndex ? "true" : undefined}
            >
              <article className="overflow-hidden rounded-2xl border border-[#2B2623]/12 bg-[#FFFFFF] shadow-[0_18px_36px_-22px_rgba(74,59,50,0.4)]">
                {/* Image only — intentionally no absolute top progress segments */}
                <div className="relative aspect-[4/5] overflow-hidden bg-[#FBF9F6]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={slide.src || CAT_BREED_IMAGE_FALLBACK}
                    alt={slide.alt}
                    className="absolute inset-0 h-full w-full object-cover"
                    draggable={false}
                    onError={handleSlideImageError}
                  />
                </div>
                <p className="px-4 py-3 text-xs leading-relaxed text-[#2B2623]/75 sm:text-[0.8rem]">
                  {slide.description}
                </p>
              </article>
            </li>
          ))}
        </ul>
      </div>

      <div
        className="mt-4 flex items-center justify-center gap-2"
        role="tablist"
        aria-label={title}
      >
        {slides.map((slide, index) => (
          <button
            key={`dot-${slide.tag}`}
            type="button"
            role="tab"
            aria-label={`${index + 1} / ${slides.length}`}
            aria-selected={index === activeIndex}
            onClick={() => scrollToIndex(index)}
            className={`h-2 rounded-full transition-all ${
              index === activeIndex
                ? "w-5 bg-[#2B2623]"
                : "w-2 bg-[#2B2623]/25 hover:bg-[#2B2623]/45"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

/** @deprecated Use BreedGallery */
export const BreedStoryGallery = BreedGallery;
