import Image from "next/image";

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

/**
 * Product images are controlled by the Google Sheet catalog. Local public
 * paths keep Next.js image optimization, while remote HTTP(S) URLs use the
 * browser directly so future Sheet image hosts do not require a deploy-time
 * next.config allow-list update.
 *
 * The parent must be positioned and have a stable width/height or aspect ratio.
 */
export function ProductImage({
  src,
  alt,
  sizes,
  className,
  priority = false,
}: ProductImageProps) {
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
    />
  );
}
