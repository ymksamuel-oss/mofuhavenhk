"use client";

import { useCallback, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface FloatingPageNavProps {
  currentPage: number;
  totalPages: number;
  /** Use the parent component's local pagination when supplied. */
  onPageChange?: (page: number) => void;
}

export default function FloatingPageNav({ currentPage, totalPages, onPageChange }: FloatingPageNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const goToPage = useCallback((page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;

    if (onPageChange) {
      onPageChange(page);
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage, onPageChange, pathname, router, searchParams, totalPages]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;

      if (event.key === "ArrowLeft") {
        goToPage(currentPage - 1);
      } else if (event.key === "ArrowRight") {
        goToPage(currentPage + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, goToPage]);

  return (
    <>
      {currentPage > 1 ? (
        <button
          type="button"
          onClick={() => goToPage(currentPage - 1)}
          aria-label={`上一頁產品（第 ${currentPage - 1} 頁）`}
          className="group fixed left-2 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[color:var(--line)] bg-white/85 text-[color:var(--ink)] shadow-lg backdrop-blur-sm transition hover:scale-110 hover:bg-white active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] md:left-6 md:h-12 md:w-12"
        >
          <ChevronLeft className="h-6 w-6 transition-transform group-hover:-translate-x-0.5 md:h-7 md:w-7" aria-hidden="true" />
          <span className="absolute left-full ml-2 hidden whitespace-nowrap rounded bg-[color:var(--ink)] px-2 py-1 text-xs text-white shadow lg:group-hover:block">
            上一頁（第 {currentPage - 1} 頁）
          </span>
        </button>
      ) : null}

      {currentPage < totalPages ? (
        <button
          type="button"
          onClick={() => goToPage(currentPage + 1)}
          aria-label={`下一頁產品（第 ${currentPage + 1} 頁）`}
          className="group fixed right-2 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[color:var(--line)] bg-white/85 text-[color:var(--ink)] shadow-lg backdrop-blur-sm transition hover:scale-110 hover:bg-white active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] md:right-6 md:h-12 md:w-12"
        >
          <ChevronRight className="h-6 w-6 transition-transform group-hover:translate-x-0.5 md:h-7 md:w-7" aria-hidden="true" />
          <span className="absolute right-full mr-2 hidden whitespace-nowrap rounded bg-[color:var(--ink)] px-2 py-1 text-xs text-white shadow lg:group-hover:block">
            下一頁（第 {currentPage + 1} 頁）
          </span>
        </button>
      ) : null}
    </>
  );
}
