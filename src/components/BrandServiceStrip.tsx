"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { trackMetaEvent } from "@/components/MetaPixel";

export function BrandServiceStrip({ placement = "top" }: { placement?: "top" | "catalog-bottom" }) {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  if (pathname.startsWith("/product/")) return null;
  if (placement === "top" && (pathname === "/menu" || pathname.startsWith("/categories/"))) return null;
  if (placement === "catalog-bottom" && pathname !== "/menu") return null;

  const labels = locale === "en"
    ? [
        { icon: "🚚", title: "Delivery Service", body: "Carefully packed and dispatched with care.", href: "/shipping-policy" },
        { icon: "🎉", title: "Free Shipping", body: "Spend HK$399 storewide for free SF pickup shipping · Original Japanese-imported pet treats", href: "/categories/dogs" },
        { icon: "💬", title: "Kind Support", body: "We are here whenever you need a hand.", href: "https://wa.me/85298646585" },
      ]
    : [
        { icon: "🚚", title: t("serviceDeliveryTitle"), body: t("serviceDeliveryBody"), href: "/shipping-policy" },
        { icon: "🎉", title: t("serviceFreeShippingTitle"), body: t("serviceFreeShippingBody"), href: "/categories/dogs" },
        { icon: "💬", title: t("serviceSupportTitle"), body: t("serviceSupportBody"), href: "https://wa.me/85298646585" },
      ];

  return (
    <aside className={`${placement === "catalog-bottom" ? "mt-10 border-y" : "border-y"} border-[#e0cfbf] bg-[#f4e8dc]/75 px-2 py-1.5 sm:px-6 sm:py-4`} aria-label={locale === "en" ? "Mofu Haven service promises" : "Mofu Haven 服務承諾"}>
      <div className="mx-auto grid max-w-6xl grid-cols-3 divide-x divide-[#dfccba] sm:divide-x">
        {labels.map((item) => (
          <Link key={item.title} href={item.href} onClick={() => { if (item.href.startsWith("https://wa.me/")) trackMetaEvent("Contact", { content_name: "WhatsApp service support", content_category: "customer support" }); }} className="flex min-w-0 items-center justify-center gap-1 px-1 py-1 transition hover:bg-[#fffaf4]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a36b42] sm:gap-3 sm:px-5 sm:py-0">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center text-lg sm:h-14 sm:w-14 sm:text-3xl" aria-hidden>{item.icon}</span>
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
