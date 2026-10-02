"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";

type PageItem = number | "ellipsis";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
};

function getPageNumbers(current: number, total: number): PageItem[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);

  const pages = new Set<number>([1, total, current - 1, current, current + 1]);
  if (current <= 3) [2, 3, 4].forEach((page) => pages.add(page));
  if (current >= total - 2) [total - 3, total - 2, total - 1].forEach((page) => pages.add(page));

  const sorted = Array.from(pages)
    .filter((page) => page >= 1 && page <= total)
    .sort((left, right) => left - right);
  const result: PageItem[] = [];
  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) result.push("ellipsis");
    result.push(page);
  });
  return result;
}

export function Pagination({ currentPage, totalPages, onPageChange, className = "" }: PaginationProps) {
  const { locale, t } = useI18n();
  const page = Math.max(1, Math.min(currentPage, totalPages));
  const isFirstPage = page === 1;
  const isLastPage = page === totalPages;
  const pageItems = getPageNumbers(page, totalPages);
  const goToPage = (nextPage: number) => onPageChange(Math.max(1, Math.min(totalPages, nextPage)));
  const mobilePageLabel = locale === "en" ? `Page ${page} of ${totalPages}` : `第 ${page} 頁 / 共 ${totalPages} 頁`;

  return (
    <nav className={`w-full ${className}`} aria-label={t("productPaginationLabel")}>
      <div className="mx-auto flex w-full max-w-sm items-center justify-between gap-2 px-4 py-6 md:hidden">
        <button
          type="button"
          onClick={() => goToPage(page - 1)}
          disabled={isFirstPage}
          aria-label={t("productPaginationPrevious")}
          className="inline-flex min-h-11 flex-shrink-0 items-center gap-1 whitespace-nowrap rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-2.5 text-sm font-medium text-[color:var(--ink)] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {locale === "en" ? "← Previous" : "← 上一頁"}
        </button>
        <span className="min-w-0 flex-1 text-center text-xs font-medium tabular-nums text-[color:var(--muted)]" aria-live="polite">
          {mobilePageLabel}
        </span>
        <button
          type="button"
          onClick={() => goToPage(page + 1)}
          disabled={isLastPage}
          aria-label={t("productPaginationNext")}
          className="inline-flex min-h-11 flex-shrink-0 items-center gap-1 whitespace-nowrap rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-2.5 text-sm font-medium text-[color:var(--ink)] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {locale === "en" ? "Next →" : "下一頁 →"}
        </button>
      </div>

      <div className="hidden items-center justify-center gap-2 py-8 md:flex">
        <button
          type="button"
          onClick={() => goToPage(page - 1)}
          disabled={isFirstPage}
          aria-label={t("productPaginationPrevious")}
          className="inline-flex h-10 flex-shrink-0 items-center whitespace-nowrap rounded-lg border border-[color:var(--line)] bg-white px-3 text-sm text-[color:var(--ink)] transition hover:bg-[color:var(--surface)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {locale === "en" ? "← Previous" : "← 上一頁"}
        </button>
        {pageItems.map((item, index) =>
          item === "ellipsis" ? (
            <span key={`ellipsis-${index}`} className="flex h-10 w-5 items-center justify-center text-sm text-[color:var(--muted)]" aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => goToPage(item)}
              aria-current={item === page ? "page" : undefined}
              aria-label={t("productPaginationPage").replace("{page}", String(item))}
              className={`inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-sm transition ${
                item === page
                  ? "bg-[#C86A2B] text-white shadow-sm"
                  : "border border-[color:var(--line)] bg-white text-[color:var(--ink)] hover:bg-[color:var(--surface)]"
              }`}
            >
              {item}
            </button>
          ),
        )}
        <button
          type="button"
          onClick={() => goToPage(page + 1)}
          disabled={isLastPage}
          aria-label={t("productPaginationNext")}
          className="inline-flex h-10 flex-shrink-0 items-center whitespace-nowrap rounded-lg border border-[color:var(--line)] bg-white px-3 text-sm text-[color:var(--ink)] transition hover:bg-[color:var(--surface)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {locale === "en" ? "Next →" : "下一頁 →"}
        </button>
      </div>
    </nav>
  );
}
