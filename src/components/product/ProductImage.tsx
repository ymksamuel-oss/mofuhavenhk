"use client";

import Image from "next/image";
import { useState } from "react";

const PRODUCT_IMAGE_FALLBACK = "/mofu-haven-website-b.png";

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
  const resolvedSrc =
    !src || failedSrc === src ? PRODUCT_IMAGE_FALLBACK : src;
  const useFallback = () => setFailedSrc(src);

  if (isRemoteImage(resolvedSrc)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={resolvedSrc}
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
      src={resolvedSrc}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      priority={priority}
      onError={useFallback}
    />
  );
}
