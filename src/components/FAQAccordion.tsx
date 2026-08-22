"use client";

import { useState } from "react";

type FAQItem = {
  question: string;
  answer: string;
};

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "運費點計？幾時有免運費？",
    answer:
      "Mofu Haven 提供香港本地順豐速運配送。全店購物淨額滿 HK$450 即享免運費；若未滿 HK$450，標準運費為 HK$35。系統會在結帳時自動計算。",
  },
  {
    question: "落單後幾耐收貨？",
    answer:
      "現貨商品會在訂單確認並完成付款後 3-5 個工作天內由香港倉庫安排發貨。如遇公眾假期或大型促銷活動可能略有延誤，發貨後會透過電郵或短訊發送順豐追蹤單號。",
  },
  {
    question: "支援乜嘢付款方式？",
    answer:
      "我們支援多種安全便捷的網上付款方式，包括 Visa、Mastercard、Apple Pay，以及香港常用的 AlipayHK（支付寶香港）及 WeChat Pay HK（微信支付香港），所有信用卡交易均經過加密處理，確保安全。",
  },
  {
    question: "收到貨後可以退換貨嗎？",
    answer:
      "我們設有「7日退換貨保障」。如收到的商品有破損或與訂單不符，請於收貨後 7 天內透過 WhatsApp 或電郵聯絡我們，我們將盡快為您安排退換事宜（請保持商品原包裝完整）。",
  },
];

export function FAQAccordion() {
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
            常見問題
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[color:var(--muted)] sm:text-base">
            為您解答關於運費、發貨、付款與退換貨的各項疑問
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
                    <span className="leading-snug">{item.question}</span>
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
                    <p className="border-t border-[color:var(--line)]/70 px-4 pb-4 pt-3 text-sm leading-relaxed text-[color:var(--muted)] sm:px-5 sm:text-[0.95rem]">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 rounded-2xl bg-[color:var(--accent-soft)] px-4 py-3.5 text-center sm:mt-6 sm:px-5 sm:py-4">
          <p className="text-xs leading-relaxed text-[color:var(--muted)] sm:text-sm">
            還有其他疑問？歡迎隨時透過右下角 WhatsApp 按鈕聯絡我們（@MofuHavenHK），專人會為您解答！
          </p>
        </div>
      </div>
    </section>
  );
}
