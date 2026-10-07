import Image from "next/image";

type BrandLogoProps = {
  title?: string;
};

/** Shared Mofu Haven logo; its dimensions match the homepage hero standard. */
export function BrandLogo({ title = "Mofu Haven" }: BrandLogoProps) {
  return (
    <span
      className="brand-logo inline-flex h-16 w-auto shrink-0 items-center sm:h-20"
      role="img"
      aria-label={title}
    >
      <Image
        src="/images/brands/mofu-haven-normalized.png"
        alt=""
        width={740}
        height={600}
        className="h-full w-auto object-contain mix-blend-multiply"
        sizes="(max-width: 640px) 79px, 99px"
        priority
      />
    </span>
  );
}
