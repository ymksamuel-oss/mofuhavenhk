"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
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
  const imageRef = useRef<HTMLImageElement>(null);
  const normalizedSrc = src === CATALOG_PLACEHOLDER ? null : normalizeProductImageUrl(src);
  const showPlaceholder = !normalizedSrc || failedSrc === normalizedSrc;
  const useFallback = () => {
    if (normalizedSrc) setFailedSrc(normalizedSrc);
  };

  useEffect(() => {
    if (!normalizedSrc) return;
    const timeout = window.setTimeout(() => {
      const image = imageRef.current;
      if (image?.complete && image.naturalWidth > 0) return;
      setFailedSrc(normalizedSrc);
    }, 1800);
    return () => window.clearTimeout(timeout);
  }, [normalizedSrc]);

  if (showPlaceholder) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`absolute inset-0 flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#fffaf5] via-[#f7eee7] to-[#efe2d6] text-[#9a806e] ${className ?? ""}`}
      >
        <Image
          src="/images/catalog-placeholder.svg"
          alt=""
          fill
          sizes={sizes ?? "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"}
          className="object-contain p-1"
          aria-hidden="true"
          unoptimized
        />
      </div>
    );
  }

  return (
    <Image
      src={normalizedSrc ?? ""}
      ref={imageRef}
      alt={alt}
      fill
      sizes={sizes ?? "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"}
      className={className}
      priority={priority}
      onError={useFallback}
    />
  );
}
