"use client";

import Image from "next/image";
import { useState } from "react";
import { normalizeProductImageUrl } from "@/lib/catalog-images";

const CATALOG_PLACEHOLDER = "catalog-placeholder";

type ProductImageProps = {
  src: string | readonly string[];
  alt: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
};

type FailedImageState = {
  sourceKey: string;
  sources: string[];
};

/** Renders catalog images, trying each supplied source before a stable local fallback. */
export function ProductImage({
  src,
  alt,
  sizes,
  className,
  priority = false,
}: ProductImageProps) {
  const normalizedSources = Array.from(new Set(
    (Array.isArray(src) ? src : [src])
      .filter((candidate) => candidate !== CATALOG_PLACEHOLDER)
      .map(normalizeProductImageUrl)
      .filter((candidate): candidate is string => Boolean(candidate)),
  ));
  const sourceKey = normalizedSources.join("\u0000");
  const [failedImages, setFailedImages] = useState<FailedImageState>({ sourceKey: "", sources: [] });
  const failedSources = failedImages.sourceKey === sourceKey ? failedImages.sources : [];
  const activeSrc = normalizedSources.find((candidate) => !failedSources.includes(candidate)) ?? null;

  const handleImageError = () => {
    if (!activeSrc) return;
    setFailedImages((current) => {
      const previousFailures = current.sourceKey === sourceKey ? current.sources : [];
      if (previousFailures.includes(activeSrc)) return current;
      return { sourceKey, sources: [...previousFailures, activeSrc] };
    });
  };

  if (!activeSrc) {
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
      src={activeSrc}
      alt={alt}
      fill
      sizes={sizes ?? "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"}
      unoptimized={false}
      className={className}
      priority={priority}
      loading={priority ? undefined : "lazy"}
      onError={handleImageError}
    />
  );
}
