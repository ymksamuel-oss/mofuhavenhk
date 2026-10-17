"use client";

import Image from "next/image";
import { useState } from "react";
import { normalizeProductImageUrl } from "@/lib/catalog-images";

const CATALOG_PLACEHOLDER = "catalog-placeholder";

type ProductImageProps = {
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
};

/** Renders remote and local catalog images with a stable local fallback. */
export function ProductImage({
  src,
  alt,
  sizes,
  className,
  priority = false,
}: ProductImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const normalizedSrc = src === CATALOG_PLACEHOLDER ? null : normalizeProductImageUrl(src);
  const showPlaceholder = !normalizedSrc || failedSrc === normalizedSrc;
  const useFallback = () => {
    if (normalizedSrc) setFailedSrc(normalizedSrc);
  };

  if (showPlaceholder) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`absolute inset-0 flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#fffaf5] via-[#f7eee7] to-[#efe2d6] text-[#9a806e] ${className ?? ""}`}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-10 w-10 sm:h-12 sm:w-12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.35"
          aria-hidden="true"
        >
          <rect x="3" y="4" width="18" height="16" rx="3" fill="white" fillOpacity="0.72" />
          <path d="M6 16.8 10 13l2.8 2.4 2.1-1.9 3.1 3.3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12.1 8.3c-1 0-1.7.8-2.3 1.4-.6.6-1.2 1.2-1.2 2.1 0 .7.5 1.1 1.2 1.1.5 0 1.1-.3 1.9-.3s1.4.3 1.9.3c.7 0 1.2-.4 1.2-1.1 0-.9-.6-1.5-1.2-2.1-.6-.6-1.3-1.4-2.3-1.4Z" fill="currentColor" stroke="none" />
        </svg>
        <span className="text-[9px] font-semibold tracking-[0.16em] text-[#9a806e]">MOFU HAVEN</span>
      </div>
    );
  }

  return (
    <Image
      src={normalizedSrc ?? ""}
      alt={alt}
      fill
      sizes={sizes ?? "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"}
      className={className}
      priority={priority}
      onError={useFallback}
    />
  );
}
