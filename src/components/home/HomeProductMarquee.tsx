"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CategoryNavLink } from "@/components/CategoryNavLink";
import { ProductImage } from "@/components/product/ProductImage";
import { ProductStatusBadges } from "@/components/product/ProductStatusBadges";
import { useCatalog } from "@/lib/catalog-context";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { formatMoney } from "@/lib/i18n/translations";
import { isStorefrontReadyProduct, productHref, type Product } from "@/lib/products";
import styles from "./HomeProductMarquee.module.css";

type ProductRowProps = {
  label: string;
  products: Product[];
};

const AUTO_RESUME_DELAY_MS = 1800;
const AUTO_SCROLL_INTERVAL_MS = 16;
// A shorter cycle divisor creates a clearly noticeable, editorial-style flow.
const AUTO_SCROLL_CYCLE_DIVISOR = 340;

function ProductRow({ label, products }: ProductRowProps) {
  const { locale, t } = useI18n();
  const rowRef = useRef<HTMLDivElement>(null);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const repeatedProducts = [...products, ...products, ...products];

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setPrefersReducedMotion(mediaQuery.matches);
    syncPreference();
    mediaQuery.addEventListener("change", syncPreference);
    return () => mediaQuery.removeEventListener("change", syncPreference);
  }, []);

  const clearResumeTimer = useCallback(() => {
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  }, []);

  const pauseAutoPlay = useCallback(() => {
    clearResumeTimer();
    setIsAutoPlaying(false);
  }, [clearResumeTimer]);

  const resumeAutoPlaySoon = useCallback(() => {
    clearResumeTimer();
    resumeTimerRef.current = setTimeout(() => {
      setIsAutoPlaying(true);
      resumeTimerRef.current = null;
    }, AUTO_RESUME_DELAY_MS);
  }, [clearResumeTimer]);

  const normaliseLoopPosition = useCallback(() => {
    const row = rowRef.current;
    if (!row) return;

    const cycleWidth = row.scrollWidth / 3;
    if (!Number.isFinite(cycleWidth) || cycleWidth <= 0) return;

    if (row.scrollLeft < cycleWidth * 0.18) {
      row.scrollLeft += cycleWidth;
    } else if (row.scrollLeft > cycleWidth * 1.82) {
      row.scrollLeft -= cycleWidth;
    }
  }, []);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;

    const positionAtMiddleCopy = () => {
      if (prefersReducedMotion) {
        row.scrollLeft = 0;
        return;
      }

      const cycleWidth = row.scrollWidth / 3;
      if (Number.isFinite(cycleWidth) && cycleWidth > 0) {
        row.scrollLeft = cycleWidth;
      }
    };

    positionAtMiddleCopy();
    const resizeObserver = new ResizeObserver(positionAtMiddleCopy);
    resizeObserver.observe(row);

    const timer = window.setInterval(() => {
      if (!isAutoPlaying || prefersReducedMotion) return;
      const cycleWidth = row.scrollWidth / 3;
      if (!Number.isFinite(cycleWidth) || cycleWidth <= 0) return;

      row.scrollLeft += Math.max(1.8, cycleWidth / AUTO_SCROLL_CYCLE_DIVISOR);
      normaliseLoopPosition();
    }, AUTO_SCROLL_INTERVAL_MS);

    return () => {
      resizeObserver.disconnect();
      window.clearInterval(timer);
    };
  }, [isAutoPlaying, normaliseLoopPosition, prefersReducedMotion, products.length]);

  useEffect(() => () => clearResumeTimer(), [clearResumeTimer]);

  const moveByCards = (direction: -1 | 1) => {
    const row = rowRef.current;
    if (!row) return;

    pauseAutoPlay();
    const firstCard = row.querySelector<HTMLElement>(`[data-marquee-copy="source"]`);
    const cardWidth = firstCard?.getBoundingClientRect().width ?? 156;
    const distance = Math.max(cardWidth * 1.8, row.clientWidth * 0.62);
    row.scrollBy({ left: direction * distance, behavior: "smooth" });

    if (!prefersReducedMotion) {
      window.setTimeout(normaliseLoopPosition, 420);
      resumeAutoPlaySoon();
    }
  };

  return (
    <div className={styles.rowSection}>
      <div className={styles.rowHeader}>
        <p className={styles.rowLabel}>{label}</p>
        <div className={styles.controls} aria-label={label}>
          <button
            type="button"
            className={styles.controlButton}
            onClick={() => moveByCards(-1)}
            aria-label={t("homeMarqueePrevious")}
            title={t("homeMarqueePrevious")}
          >
            <span aria-hidden>←</span>
          </button>
          <button
            type="button"
            className={styles.controlButton}
            onClick={() => moveByCards(1)}
            aria-label={t("homeMarqueeNext")}
            title={t("homeMarqueeNext")}
          >
            <span aria-hidden>→</span>
          </button>
        </div>
      </div>

      <div
        ref={rowRef}
        className={styles.rowWrap}
        aria-label={label}
        onPointerEnter={pauseAutoPlay}
        onPointerLeave={resumeAutoPlaySoon}
        onPointerDown={pauseAutoPlay}
        onPointerUp={resumeAutoPlaySoon}
        onFocusCapture={pauseAutoPlay}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            resumeAutoPlaySoon();
          }
        }}
      >
        <div className={styles.track} title={t("homeMarqueePause")}>
          {repeatedProducts.map((product, index) => {
            const duplicate = index < products.length || index >= products.length * 2;
            const href = productHref(product.id);
            const discountPercent = product.originalPrice
              ? Math.round((1 - product.price / product.originalPrice) * 100)
              : null;

            return (
              <article
                key={`${product.id}-${index}`}
                aria-hidden={duplicate || undefined}
                data-marquee-copy={duplicate ? "duplicate" : "source"}
                className={styles.card}
              >
                <CategoryNavLink
                  href={href}
                  tabIndex={duplicate ? -1 : undefined}
                  aria-label={`${t("viewProductAria")}: ${product.name[locale]}`}
                  className={styles.cardLink}
                >
                  <div className={styles.imageWrap}>
                    <ProductImage
                      src={product.image}
                      alt={product.name[locale]}
                      sizes="(min-width: 1024px) 210px, (min-width: 640px) 190px, 156px"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.045]"
                    />
                    {discountPercent ? (
                      <span className={styles.discount}>-{discountPercent}%</span>
                    ) : null}
                    <ProductStatusBadges product={product} className={styles.statusBadges} />
                  </div>
                  <div className={styles.cardBody}>
                    <p className={styles.name}>{product.name[locale]}</p>
                    <div className={styles.priceLine}>
                      <span className={styles.price}>{formatMoney(product.price, locale)}</span>
                      {product.originalPrice ? (
                        <span className={styles.originalPrice}>
                          {formatMoney(product.originalPrice, locale)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </CategoryNavLink>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * An editorial two-row product parade. A three-copy loop keeps the middle copy
 * in view, allowing arrow controls and touch input to pause then resume naturally.
 */
export function HomeProductMarquee() {
  const { t } = useI18n();
  const { products: catalogProducts } = useCatalog();
  const activeProducts = catalogProducts.filter(isStorefrontReadyProduct);
  const catProducts = activeProducts.filter((product) => product.categorySlug === "cats").slice(0, 8);
  const dogProducts = activeProducts.filter((product) => product.categorySlug === "dogs").slice(0, 8);

  if (catProducts.length === 0 || dogProducts.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="home-product-marquee-title"
      className="overflow-hidden border-y border-[#d7c0aa]/70 bg-[#f4e9dc] py-12 sm:py-16"
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-12">
        <div className="max-w-2xl">
          <span className="inline-flex rounded-full border border-[#c6a785]/55 bg-[#fffaf4]/80 px-3 py-1 text-[10px] font-bold tracking-[0.18em] text-[#7a543b]">
            {t("homeMarqueeEyebrow")}
          </span>
          <h2
            id="home-product-marquee-title"
            className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[#4b3621] sm:text-4xl"
          >
            {t("homeMarqueeTitle")}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#765d49] sm:text-base">
            {t("homeMarqueeSub")}
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-5 sm:mt-10 sm:space-y-6">
        <ProductRow label={t("homeMarqueeCats")} products={catProducts} />
        <ProductRow label={t("homeMarqueeDogs")} products={dogProducts} />
      </div>
    </section>
  );
}
