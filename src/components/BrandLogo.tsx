import Image from "next/image";

type BrandLogoProps = {
  className?: string;
  title?: string;
  /** Kept for callers of the previous animated wordmark. */
  animateOnMount?: boolean;
};

/** Shared Mofu Haven cat-and-dog logo used throughout the site shell. */
export function BrandLogo({
  className = "",
  title = "Mofu Haven",
}: BrandLogoProps) {
  return (
    <span
      className={`brand-logo inline-flex h-10 w-auto shrink-0 items-center ${className}`}
      role="img"
      aria-label={title}
    >
      <Image
        src="/images/mofu-haven-cat-dog-logo-transparent.png"
        alt=""
        width={960}
        height={1106}
        className="h-full w-auto object-contain"
        sizes="(max-width: 640px) 112px, 160px"
        priority
      />
    </span>
  );
}
