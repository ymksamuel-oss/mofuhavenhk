"use client";

import Image from "next/image";
import { useState } from "react";

const CATALOG_PLACEHOLDER = "catalog-placeholder";

type ProductImageProps = {
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
};

function isRemoteImage(src: string): boolean {
  return /^https?:\/\//i.test(src);
}

/** Renders remote and local catalog images with a stable local fallback. */
export function ProductImage({
  src,
  alt,
  sizes,
  className,
  priority = false,
}: ProductImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showPlaceholder =
    !src || src === CATALOG_PLACEHOLDER || failedSrc === src;
  const useFallback = () => setFailedSrc(src);

  if (showPlaceholder) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`absolute inset-0 flex h-full w-full items-center justify-center bg-[#edf0ee] text-[#9aa39d] ${className ?? ""}`}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-9 w-9 sm:h-11 sm:w-11"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          aria-hidden="true"
        >
          <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
          <circle cx="8.3" cy="9" r="1.3" />
          <path d="m5.5 17 4.6-4.5 3.2 3 2.1-2 3.1 3.5" />
        </svg>
      </div>
    );
  }

  if (isRemoteImage(src)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={`absolute inset-0 h-full w-full ${className ?? ""}`}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        onError={useFallback}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      priority={priority}
      onError={useFallback}
    />
  );
}
