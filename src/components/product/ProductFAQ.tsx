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
      question: "\u9019\u6b3e\u98df\u7897\u9069\u5408\u600e\u6a23\u4f7f\u7528？",
      answer: "\u53ef\u6309\u6bdb\u5b69\u65e5\u5e38\u9700\u8981，\u7528\u4f5c\u76db\u653e\u4e7e\u7ce7、\u6fd5\u7ce7\u6216\u98f2\u6c34。\u5be6\u969b\u4f7f\u7528\u65b9\u5f0f\u8acb\u6309\u6bdb\u5b69\u7fd2\u6163\u53ca\u98fc\u4e3b\u5b89\u6392\u6c7a\u5b9a。",
    },
    {
      question: "\u5c3a\u5bf8、\u6750\u8cea\u53ca\u5bb9\u91cf\u8cc7\u6599\u5728\u54ea\u88e1\u67e5\u770b？",
      answer: "\u76ee\u524d\u5546\u54c1\u5716\u7247\u4e3b\u8981\u7528\u4f5c\u6b3e\u5f0f\u53c3\u8003；\u7531\u65bc\u672a\u6709\u5b8c\u6574\u898f\u683c\u8cc7\u6599，\u5be6\u969b\u5c3a\u5bf8、\u6750\u8cea、\u5bb9\u91cf\u53ca\u5305\u88dd\u5167\u5bb9\u8acb\u4ee5\u6536\u5230\u7684\u5546\u54c1\u70ba\u6e96。",
    },
    {
      question: "\u65e5\u5e38\u61c9\u8a72\u600e\u6a23\u6e05\u6f54？",
      answer: "\u5efa\u8b70\u6bcf\u6b21\u4f7f\u7528\u5f8c\u4ee5\u6e05\u6c34\u6e05\u6d17\u4e26\u5fb9\u5e95\u667e\u4e7e；\u5982\u9700\u4f7f\u7528\u6e05\u6f54\u7528\u54c1，\u8acb\u9078\u64c7\u9069\u5408\u5bf5\u7269\u7528\u54c1\u7684\u7522\u54c1，\u4e26\u6309\u6a19\u7c64\u6307\u793a\u4f7f\u7528。",
    },
    {
      question: "\u73fe\u8ca8\u5546\u54c1\u5e7e\u6642\u53ef\u4ee5\u5bc4\u51fa？",
      answer: "\u6a19\u793a\u73fe\u8ca8\u7684\u5546\u54c1\u4e00\u822c\u6703\u5728\u8a02\u55ae\u78ba\u8a8d\u4e26\u5b8c\u6210\u4ed8\u6b3e\u5f8c 1–2 \u500b\u5de5\u4f5c\u5929\u5167\u5bc4\u51fa；\u9023\u540c\u672c\u5730\u6d3e\u9001，\u901a\u5e38\u65bc\u4e0b\u55ae\u5f8c 5–7 \u500b\u5de5\u4f5c\u5929\u6536\u5230。",
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
  const { locale, t } = useI18n();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const items = PRODUCT_FAQ_ITEMS[locale === "en" ? "en" : "zh"];

  return (
    <section className="my-10 w-full px-4 sm:my-12 sm:px-6 lg:px-8" aria-labelledby="product-faq-title">
      <div className="mx-auto max-w-3xl rounded-3xl border border-[color:var(--line)] bg-white p-4 shadow-[0_20px_44px_-34px_rgba(43,38,35,0.3)] sm:p-8">
        <div className="mb-5 text-center sm:mb-7">
          <span className="mb-2 inline-flex rounded-xl border border-[color:var(--line)] bg-[color:var(--accent-soft)] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--accent)]">
            {t("productFaqEyebrow")}
          </span>
          <h2 id="product-faq-title" className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-[-0.02em] text-[color:var(--ink)] sm:text-3xl">
            {t("productFaqTitle")}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[color:var(--muted)] sm:text-base">
            {t("productFaqSubtitle")}
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
                      {t("productFaqQuestionMark")}
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
