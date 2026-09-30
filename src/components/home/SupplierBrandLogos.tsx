import Image from "next/image";

/** Optical alignment for the supplier and storefront marks shown together. */
export function SupplierBrandLogos() {
  return (
    <div className="mb-5 flex items-center justify-center gap-6 sm:gap-10" aria-label="Mofu Haven and Best Partner">
      <div className="flex h-24 w-36 shrink-0 items-center justify-center sm:h-28 sm:w-44">
        <Image
          src="/images/mofu-haven-cat-dog-logo-transparent.png"
          alt="Mofu Haven 毛毛港"
          width={960}
          height={1106}
          className="max-h-full w-auto max-w-full object-contain"
          sizes="176px"
        />
      </div>
      <div className="flex h-24 w-36 shrink-0 items-center justify-center sm:h-28 sm:w-44">
        <Image
          src="/images/brands/best-partner-logo.svg"
          alt="Best Partner Japan"
          width={365}
          height={267}
          className="relative -top-5 max-h-full w-auto max-w-full object-contain md:-top-6"
          sizes="176px"
        />
      </div>
    </div>
  );
}
