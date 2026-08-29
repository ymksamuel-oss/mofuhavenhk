"use client";

import { useState } from "react";

/**
 * Product page style reminder: preserve the Mofu Haven warm editorial system—
 * warm ivory surfaces, deep caramel accents, generous rounded corners, and
 * restrained motion. This section is product-specific and sits below the
 * shared shipping/payment FAQ.
 */

type ProductFaqItem = {
  question: string;
  answer: string;
};

const PRODUCT_FAQ_ITEMS: ProductFaqItem[] = [
  {
    question: "矮腳貓 / 幼貓用呢個食碗會唔會太高？",
    answer:
      "食碗採用傾斜防護角度設計，適合幼貓、短腿貓（如曼赤肯）及短鼻貓種，能減少頸椎負擔並防止進食時沾濕面部。",
  },
  {
    question: "質感點樣？好唔好清洗？每天用濕紙巾擦擦行唔行？",
    answer:
      "採用高溫釉面陶瓷，光滑不沾油，平時使用濕紙巾即可輕鬆擦拭，亦可直接以清水沖洗或放入洗碗機。",
  },
  {
    question: "底部的防滑效果好唔好？主子乾飯時會唔會推走或者打翻？",
    answer:
      "碗身具備加重結構並配備防滑底座，穩定性高，能有效防止寵物進食時推動或打翻。",
  },
  {
    question: "日本直送係現貨定預購？發貨速度快唔快？",
    answer:
      "標示現貨之商品落單後將於 1-2 個工作天內安排發貨，並提供順豐速運單號，包裝均加強防震保護。",
  },
  {
    question: "主糧/零食包裝有封口條嗎？拆封後容易保存嗎？",
    answer:
      "所有日本直送產品包裝袋均配備高密合度密封壓條，拆封後按緊即可有效防潮保鮮。",
  },
];

export function ProductFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      className="my-10 w-full px-4 sm:my-12 sm:px-6 lg:px-8"
      aria-labelledby="product-faq-title"
    >
      <div className="mx-auto max-w-3xl rounded-3xl border border-[color:var(--line)] bg-white p-4 shadow-[0_20px_44px_-34px_rgba(43,38,35,0.3)] sm:p-8">
        <div className="mb-5 text-center sm:mb-7">
          <span className="mb-2 inline-flex rounded-xl border border-[#cfe8f8] bg-[#e8f4ff] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1890ff]">
            OFFICIAL FAQ
          </span>
          <h2
            id="product-faq-title"
            className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-[-0.02em] text-[color:var(--ink)] sm:text-3xl"
          >
            商品常見問題
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[color:var(--muted)] sm:text-base">
            以下內容為本商品及相關配送安排的官方解答。
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[color:var(--line)] bg-[color:var(--background)]">
          {PRODUCT_FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            const answerId = `product-faq-answer-${index}`;
            return (
              <div
                key={item.question}
                className="border-b border-[color:var(--line)] last:border-b-0"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex((current) => (current === index ? null : index))}
                  className="flex min-h-14 w-full items-center justify-between gap-4 px-4 py-4 text-left text-sm font-semibold text-[color:var(--ink)] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color:var(--accent)] sm:px-5 sm:text-base"
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent-soft)] text-[11px] font-bold text-[color:var(--accent)]">
                      問
                    </span>
                    <span className="leading-snug">{item.question}</span>
                  </span>
                  <span
                    aria-hidden="true"
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[color:var(--line)] bg-white text-[color:var(--accent)] transition duration-200 ${
                      isOpen ? "rotate-180 bg-[color:var(--accent)] text-white" : ""
                    }`}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
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
                    <div className="border-t border-[color:var(--line)]/70 px-4 pb-4 pt-3 sm:px-5">
                      <span className="mr-2 inline-flex rounded bg-[#e8f4ff] px-1.5 py-0.5 text-[11px] font-medium text-[#1890ff]">
                        官方解答
                      </span>
                      <p className="mt-2 text-sm leading-relaxed text-[color:var(--muted)] sm:text-[0.95rem]">
                        {item.answer}
                      </p>
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
