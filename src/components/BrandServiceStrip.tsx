"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { trackMetaEvent } from "@/components/MetaPixel";

export function BrandServiceStrip({ placement = "top" }: { placement?: "top" | "catalog-bottom" }) {
  const { locale } = useI18n();
  const pathname = usePathname();

  if (placement === "catalog-bottom" && pathname !== "/menu") return null;

  const labels = locale === "en"
    ? [
        { icon: "🚚", text: "Carefully packed, delivered to your pet's side.", href: "/shipping-policy" },
        { icon: "🎉", text: "Free SF shipping on orders over HK$399.", href: "/collections/value-bundles" },
        { icon: "💬", text: "Friendly support for every pet-parent question.", href: "https://wa.me/85298646585" },
      ]
    : [
        { icon: "🚚", text: "細心包裝，直送毛孩身邊。", href: "/shipping-policy" },
        { icon: "🎉", text: "全店滿 HK$399 享順豐免運。", href: "/collections/value-bundles" },
        { icon: "💬", text: "毛孩日常疑難，隨時為你解答。", href: "https://wa.me/85298646585" },
      ];

  if (placement === "top") {
    return (
      <aside className="h-10 overflow-x-auto border-b border-[#dec9b7] bg-[#f5e9df] text-[#604434] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label={locale === "en" ? "Mofu Haven service announcements" : "毛毛港服務公告"}>
        <div className="mx-auto flex h-full min-w-max items-center justify-center gap-3 px-4 text-[11px] font-medium leading-none sm:gap-5 sm:text-xs">
          {labels.map((item, index) => (
            <span key={item.text} className="flex items-center gap-1.5 whitespace-nowrap">
              <Link href={item.href} className="transition hover:text-[#a36b42] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a36b42]" onClick={() => { if (item.href.startsWith("https://wa.me/")) trackMetaEvent("Contact", { content_name: "WhatsApp service support", content_category: "customer support" }); }}>
                <span aria-hidden="true">{item.icon}</span> {item.text}
              </Link>
              {index < labels.length - 1 ? <span className="text-[#b89275]" aria-hidden="true">｜</span> : null}
            </span>
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside className="mt-10 border-y border-[#e0cfbf] bg-[#f4e8dc]/75 px-2 py-3 sm:px-6" aria-label={locale === "en" ? "Mofu Haven service promises" : "Mofu Haven 服務承諾"}>
      <div className="mx-auto grid max-w-6xl grid-cols-3 divide-x divide-[#dfccba]">
        {labels.map((item) => (
          <Link key={item.text} href={item.href} onClick={() => { if (item.href.startsWith("https://wa.me/")) trackMetaEvent("Contact", { content_name: "WhatsApp service support", content_category: "customer support" }); }} className="flex min-w-0 items-center justify-center gap-2 px-2 py-1 text-center transition hover:bg-[#fffaf4]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a36b42] sm:gap-3 sm:px-5">
            <span className="shrink-0 text-lg sm:text-2xl" aria-hidden="true">{item.icon}</span>
            <span className="text-xs leading-5 text-[#806759] sm:text-sm">{item.text}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
}
