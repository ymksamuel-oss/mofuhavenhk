"use client";

import { useState } from "react";

type FAQItem = {
  question: string;
  answer: string;
};

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "運費點計？幾時有免運費？",
    answer: "Mofu Haven 提供香港本地順豐速運配送。全店購物淨額滿 HK$450 即享免運費；若未滿 HK$450，標準運費為 HK$35。系統會在結帳時自動計算。",
  },
  {
    question: "落單後幾耐收貨？",
    answer: "現貨商品會在訂單確認並完成付款後 3-5 個工作天內由香港倉庫安排發貨。如遇公眾假期或大型促銷活動可能略有延誤，發貨後會透過電郵或短訊發送順豐追蹤單號。",
  },
  {
    question: "支援乜嘢付款方式？",
    answer: "我們支援多種安全便捷的網上付款方式，包括 Visa、Mastercard、Apple Pay，以及香港常用的 AlipayHK（支付寶香港）及 WeChat Pay HK（微信支付香港），所有信用卡交易均經過加密處理，確保安全。",
  },
  {
    question: "收到貨後可以退換貨嗎？",
    answer: "我們設有「7日退換貨保障」。如收到的商品有破損或與訂單不符，請於收貨後 7 天內透過 WhatsApp 或電郵聯絡我們，我們將盡快為您安排退換事宜（請保持商品原包裝完整）。",
  },
];

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="my-12 w-full px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-3xl bg-white p-6 sm:p-10 shadow-sm border border-[color:var(--line)]">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-[color:var(--accent)]/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-[color:var(--accent)] uppercase mb-2">
            HELP & FAQ
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[color:var(--ink)] tracking-tight">
            常見問題
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[color:var(--ink-muted)]">
            為您解答關於運費、發貨、付款與退換貨的各項疑問
          </p>
        </div>

        <div className="space-y-4">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-[color:var(--line)] bg-[#FAF8F5] transition-colors duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggleItem(index)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left font-medium text-[color:var(--ink)] hover:bg-[#F3EFEA] transition-colors cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="text-base sm:text-lg flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent)]/15 text-xs font-bold text-[color:var(--accent)]">
                      Q{index + 1}
                    </span>
                    {item.question}
                  </span>
                  <span
                    className={`ml-4 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[color:var(--ink)] shadow-xs transition-transform duration-200 ${
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
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100 pb-4 px-5" : "grid-rows-[0fr] opacity-0 pb-0 px-5"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="text-sm sm:text-base text-[color:var(--ink-muted)] leading-relaxed pt-1 border-t border-[color:var(--line)]/60">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center bg-[#F3EFEA]/60 rounded-2xl p-4 sm:p-5">
          <p className="text-xs sm:text-sm text-[color:var(--ink-muted)]">
            還有其他疑問？歡迎隨時透過右下角 WhatsApp 按鈕聯絡我們（@MofuHavenHK），專人會為您解答！
          </p>
        </div>
      </div>
    </section>
  );
}
