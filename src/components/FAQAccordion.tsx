"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { TranslationKey } from "@/lib/i18n/translations";

type FAQItem = {
  question: TranslationKey;
  answer: TranslationKey;
};

const FAQ_ITEMS: FAQItem[] = [
  { question: "faqShippingQuestion", answer: "faqShippingAnswer" },
  { question: "faqDeliveryQuestion", answer: "faqDeliveryAnswer" },
  { question: "faqPaymentQuestion", answer: "faqPaymentAnswer" },
  { question: "faqReturnsQuestion", answer: "faqReturnsAnswer" },
];

export function FAQAccordion() {
  const { t } = useI18n();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleItem = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <section className="my-10 w-full px-4 sm:my-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-3xl border border-[color:var(--line)] bg-white p-4 shadow-[0_20px_44px_-34px_rgba(43,38,35,0.3)] sm:p-8">
        <div className="mb-5 text-center sm:mb-7">
          <span className="mb-2 inline-flex rounded-xl border border-[color:var(--line)] bg-[color:var(--accent-soft)] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--accent)]">
            HELP & FAQ
          </span>
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-[-0.02em] text-[color:var(--ink)] sm:text-3xl">
            {t("faqPageTitle")}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[color:var(--muted)] sm:text-base">
            {t("faqIntro")}
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[color:var(--line)] bg-[color:var(--background)]">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            const answerId = `faq-answer-${index}`;
            return (
              <div
                key={item.question}
                className="border-b border-[color:var(--line)] last:border-b-0"
              >
                <button
                  type="button"
                  onClick={() => toggleItem(index)}
                  className="flex min-h-14 w-full items-center justify-between gap-4 px-4 py-4 text-left text-sm font-semibold text-[color:var(--ink)] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color:var(--accent)] sm:px-5 sm:text-base"
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent-soft)] text-[11px] font-bold text-[color:var(--accent)]">
                      Q{index + 1}
                    </span>
                    <span className="leading-snug">{t(item.question)}</span>
                  </span>
                  <span
                    aria-hidden="true"
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[color:var(--line)] bg-white text-[color:var(--accent)] transition duration-200 ${
                      isOpen ? "rotate-180 bg-[color:var(--accent)] text-white" : ""
                    }`}
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </span>
                </button>

                <div
                  id={answerId}
                  className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <p className="whitespace-pre-line border-t border-[color:var(--line)]/70 px-4 pb-4 pt-3 text-sm leading-relaxed text-[color:var(--muted)] sm:px-5 sm:text-[0.95rem]">
                      {t(item.answer)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 rounded-2xl bg-[color:var(--accent-soft)] px-4 py-3.5 text-center sm:mt-6 sm:px-5 sm:py-4">
          <p className="text-xs leading-relaxed text-[color:var(--muted)] sm:text-sm">
            {t("faqContactHint")}
          </p>
        </div>
      </div>
    </section>
  );
}
