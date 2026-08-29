"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";

type ProductFaqItem = {
  question: string;
  answer: string;
};

const PRODUCT_FAQ_ITEMS: Record<"zh" | "en", ProductFaqItem[]> = {
  zh: [
    {
      question: "這款食碗適合怎樣使用？",
      answer: "可按毛孩日常需要，用作盛放乾糧、濕糧或飲水。實際使用方式請按毛孩習慣及飼主安排決定。",
    },
    {
      question: "尺寸、材質及容量資料在哪裡查看？",
      answer: "目前商品圖片主要用作款式參考；由於未有完整規格資料，實際尺寸、材質、容量及包裝內容請以收到的商品為準。",
    },
    {
      question: "日常應該怎樣清潔？",
      answer: "建議每次使用後以清水清洗並徹底晾乾；如需使用清潔用品，請選擇適合寵物用品的產品，並按標籤指示使用。",
    },
    {
      question: "現貨商品幾時可以寄出？",
      answer: "標示現貨的商品一般會在訂單確認並完成付款後 1–2 個工作天內寄出；連同本地派送，通常於下單後 5–7 個工作天收到。",
    },
  ],
  en: [
    {
      question: "How can this bowl be used?",
      answer: "It can be used for dry food, wet food or water according to your pet’s daily routine. The exact use is up to the pet owner and the pet’s habits.",
    },
    {
      question: "Where can I check the size, material and capacity?",
      answer: "The product image is primarily a style reference. As complete specifications are not currently available, please refer to the received item for exact size, material, capacity and pack contents.",
    },
    {
      question: "How should it be cleaned?",
      answer: "We recommend washing it with clean water after each use and drying it thoroughly. If a cleaning product is needed, use one suitable for pet items and follow its label instructions.",
    },
    {
      question: "When will an in-stock item be dispatched?",
      answer: "In-stock items are generally dispatched within 1–2 business days after the order is confirmed and paid. Including local delivery, orders usually arrive within 5–7 business days.",
    },
  ],
};

export function ProductFAQ() {
  const { locale } = useI18n();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const items = PRODUCT_FAQ_ITEMS[locale === "en" ? "en" : "zh"];
  const isEnglish = locale === "en";

  return (
    <section className="my-10 w-full px-4 sm:my-12 sm:px-6 lg:px-8" aria-labelledby="product-faq-title">
      <div className="mx-auto max-w-3xl rounded-3xl border border-[color:var(--line)] bg-white p-4 shadow-[0_20px_44px_-34px_rgba(43,38,35,0.3)] sm:p-8">
        <div className="mb-5 text-center sm:mb-7">
          <span className="mb-2 inline-flex rounded-xl border border-[color:var(--line)] bg-[color:var(--accent-soft)] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--accent)]">
            {isEnglish ? "PRODUCT FAQ" : "商品常見問題"}
          </span>
          <h2 id="product-faq-title" className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-[-0.02em] text-[color:var(--ink)] sm:text-3xl">
            {isEnglish ? "Product questions" : "商品常見問題"}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[color:var(--muted)] sm:text-base">
            {isEnglish ? "Practical information for everyday use and delivery." : "提供日常使用及配送安排的實用資料。"}
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[color:var(--line)] bg-[color:var(--background)]">
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            const answerId = `product-faq-answer-${index}`;
            return (
              <div key={item.question} className="border-b border-[color:var(--line)] last:border-b-0">
                <button
                  type="button"
                  onClick={() => setOpenIndex((current) => (current === index ? null : index))}
                  className="flex min-h-14 w-full items-center justify-between gap-4 px-4 py-4 text-left text-sm font-semibold text-[color:var(--ink)] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color:var(--accent)] sm:px-5 sm:text-base"
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent-soft)] text-[11px] font-bold text-[color:var(--accent)]">
                      {isEnglish ? "Q" : "問"}
                    </span>
                    <span className="leading-snug">{item.question}</span>
                  </span>
                  <span aria-hidden="true" className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[color:var(--line)] bg-white text-[color:var(--accent)] transition duration-200 ${isOpen ? "rotate-180 bg-[color:var(--accent)] text-white" : ""}`}>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>
                <div id={answerId} className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="min-h-0 overflow-hidden">
                    <div className="border-t border-[color:var(--line)]/70 px-4 pb-4 pt-3 sm:px-5">
                      <p className="text-sm leading-relaxed text-[color:var(--muted)] sm:text-[0.95rem]">{item.answer}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
