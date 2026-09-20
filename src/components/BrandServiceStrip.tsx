"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/I18nProvider";

export function BrandServiceStrip({ placement = "top" }: { placement?: "top" | "catalog-bottom" }) {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  if (pathname.startsWith("/product/")) return null;
  if (placement === "top" && (pathname === "/menu" || pathname.startsWith("/categories/"))) return null;
  if (placement === "catalog-bottom" && pathname !== "/menu") return null;

  const labels = locale === "en"
    ? [
        { title: "Delivery Service", body: "Carefully packed and dispatched with care.", image: "/images/mofu-visuals/icons/delivery.jpg", href: "/shipping-policy" },
        { title: "Free Shipping", body: "Enjoy free local shipping on orders from HK$450.", image: "/images/mofu-visuals/icons/free-shipping.jpg", href: "/categories/dogs" },
        { title: "Kind Support", body: "We are here whenever you need a hand.", image: "/images/mofu-visuals/icons/support.jpg", href: "https://wa.me/85298646585" },
      ]
    : [
        { title: t("serviceDeliveryTitle"), body: t("serviceDeliveryBody"), image: "/images/mofu-visuals/icons/delivery.jpg", href: "/shipping-policy" },
        { title: t("serviceFreeShippingTitle"), body: t("serviceFreeShippingBody"), image: "/images/mofu-visuals/icons/free-shipping.jpg", href: "/categories/dogs" },
        { title: t("serviceSupportTitle"), body: t("serviceSupportBody"), image: "/images/mofu-visuals/icons/support.jpg", href: "https://wa.me/85298646585" },
      ];

  return (
    <aside className={`${placement === "catalog-bottom" ? "mt-10 border-y" : "border-y"} border-[#e0cfbf] bg-[#f4e8dc]/75 px-2 py-1.5 sm:px-6 sm:py-4`} aria-label={locale === "en" ? "Mofu Haven service promises" : "Mofu Haven \u670d\u52d9\u627f\u8afe"}>
      <div className="mx-auto grid max-w-6xl grid-cols-3 divide-x divide-[#dfccba] sm:divide-x">
        {labels.map((item) => (
          <Link key={item.title} href={item.href} className="flex min-w-0 items-center justify-center gap-1 px-1 py-1 transition hover:bg-[#fffaf4]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a36b42] sm:gap-3 sm:px-5 sm:py-0">
            <div className="relative h-5 w-5 shrink-0 overflow-hidden rounded-md bg-[#fbf7f2] sm:h-14 sm:w-20 sm:rounded-xl">
              <Image src={item.image} alt="" fill sizes="80px" className="object-cover" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-[family-name:var(--font-display)] text-[10px] font-semibold leading-4 text-[#604434] sm:text-sm">{item.title}</p>
              <p className="mt-0.5 hidden text-xs leading-5 text-[#806759] sm:block">{item.body}</p>
            </div>
          </Link>
        ))}
      </div>
    </aside>
  );
}
