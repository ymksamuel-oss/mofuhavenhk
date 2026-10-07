"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { getShopWhatsAppChatUrl } from "@/lib/whatsapp";

type BrandHarmonyBannerProps = {
  imageSrc?: string;
  imageAlt?: { zh: string; en: string };
};

export function BrandHarmonyBanner({ imageSrc = "/images/home-pet-companionship.webp", imageAlt }: BrandHarmonyBannerProps) {
  const { locale } = useI18n();
  const isEn = locale === "en";
  const whatsappUrl = getShopWhatsAppChatUrl(
    isEn
      ? "Hello Mofu Haven, please recommend suitable treats for my pet."
      : "你好，想請店長為我的毛孩推薦合適的天然零食。",
  );

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10" aria-labelledby="brand-harmony-title">
      <div className="min-w-0 overflow-hidden rounded-2xl border border-stone-100 bg-[#FAF8F5] shadow-sm">
        <div className="grid min-w-0 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
          <div className="relative aspect-[4/3] min-w-0 overflow-hidden sm:aspect-video lg:aspect-auto lg:h-full lg:min-h-[310px]">
            <Image
              src={imageSrc}
              alt={isEn ? imageAlt?.en ?? "Pets sharing a warm moment together" : imageAlt?.zh ?? "貓狗在溫柔日常中互相陪伴"}
              fill
              sizes="(min-width: 1024px) 52vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="min-w-0 px-5 py-7 sm:px-8 sm:py-9 lg:px-9 lg:py-10">
            <p className="text-[10px] font-semibold tracking-[0.2em] text-stone-500 sm:text-xs">MOFU HAVEN · PET COMPANIONSHIP</p>
            <h2 id="brand-harmony-title" className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight tracking-tight text-[#2D2926] sm:text-3xl">
              {isEn ? "We care deeply, so every pet can keep smiling." : "用心守護，只為看見毛孩最純真的笑容。"}
            </h2>
            <p className="mt-4 text-sm leading-7 text-stone-600 sm:text-base sm:leading-8">
              {isEn
                ? "Carefully selected 100% Japanese natural meat, made without chemical preservatives. Every meal and treat becomes a gentle everyday ritual your pet looks forward to."
                : "嚴選 100% 日本在地天然原肉，堅持 0 化學防腐劑。讓每一頓餐食與點心，都成為毛孩最期待的溫柔日常。"}
            </p>
            <div className="mt-6 grid gap-2.5 sm:flex sm:flex-wrap">
              <Link href="/matcher" className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#111111] px-5 py-3 text-center text-xs font-semibold text-white transition hover:bg-black active:scale-[0.98] sm:text-sm">
                {isEn ? "🐾 30-second pet match" : "🐾 30秒毛孩專屬配對"}
              </Link>
              <a href={whatsappUrl ?? "https://wa.me/85298646585"} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center rounded-full border border-stone-300 bg-white px-5 py-3 text-center text-xs font-semibold text-stone-800 transition hover:border-stone-500 active:scale-[0.98] sm:text-sm">
                {isEn ? "💬 Ask our WhatsApp pet concierge" : "💬 聯絡 WhatsApp 店長推薦"}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
