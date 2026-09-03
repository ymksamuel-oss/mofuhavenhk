"use client";

import Image from "next/image";
import { useI18n } from "@/lib/i18n/I18nProvider";

export function BrandServiceStrip() {
  const { locale } = useI18n();
  const labels = locale === "en"
    ? [
        { title: "Delivery Service", body: "Carefully packed and dispatched with care.", image: "/images/mofu-visuals/icons/delivery.jpg" },
        { title: "Free Shipping", body: "Enjoy free local shipping on orders from HK$450.", image: "/images/mofu-visuals/icons/free-shipping.jpg" },
        { title: "Kind Support", body: "We are here whenever you need a hand.", image: "/images/mofu-visuals/icons/support.jpg" },
      ]
    : [
        { title: "配送服務", body: "細心包裝，安心送到毛孩身邊。", image: "/images/mofu-visuals/icons/delivery.jpg" },
        { title: "滿額免運", body: "全店消費滿 HK$450 即享本地免運。", image: "/images/mofu-visuals/icons/free-shipping.jpg" },
        { title: "貼心客服", body: "有任何需要，隨時陪你解答。", image: "/images/mofu-visuals/icons/support.jpg" },
      ];

  return (
    <aside className="border-y border-[#e0cfbf] bg-[#f4e8dc]/75 px-4 py-4 sm:px-6" aria-label={locale === "en" ? "Mofu Haven service promises" : "Mofu Haven 服務承諾"}>
      <div className="mx-auto grid max-w-6xl divide-y divide-[#dfccba] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {labels.map((item) => (
          <div key={item.title} className="flex items-center gap-3 px-3 py-3 first:pt-0 last:pb-0 sm:justify-center sm:px-5 sm:py-0 sm:first:pt-0 sm:last:pb-0">
            <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-xl bg-[#fbf7f2] shadow-[0_8px_18px_-15px_rgba(61,42,29,0.75)] sm:h-14 sm:w-20">
              <Image src={item.image} alt="" fill sizes="80px" className="object-cover" />
            </div>
            <div>
              <p className="font-[family-name:var(--font-display)] text-sm font-semibold text-[#604434]">{item.title}</p>
              <p className="mt-0.5 text-xs leading-5 text-[#806759]">{item.body}</p>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
