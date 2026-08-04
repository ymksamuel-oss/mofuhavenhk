"use client";

import Image from "next/image";
import {
  useDeferredValue,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { CategoryNavLink } from "@/components/CategoryNavLink";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { formatMoney } from "@/lib/i18n/translations";
import { productHref } from "@/lib/products";
import {
  searchWtJapanProducts,
  type ProductSearchHit,
} from "@/lib/searchProducts";

function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="11"
        cy="11"
        r="6.25"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M16.2 16.2L20 20"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

type ProductSearchProps = {
  /** Compact bar for the sticky header vs. a roomier homepage block. */
  variant?: "header" | "home";
  className?: string;
  /** Auto-focus the input (homepage). */
  autoFocus?: boolean;
};

export function ProductSearch({
  variant = "header",
  className = "",
  autoFocus = false,
}: ProductSearchProps) {
  const { locale, t } = useI18n();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const deferredQuery = useDeferredValue(query);

  const hits: ProductSearchHit[] =
    deferredQuery.trim().length > 0
      ? searchWtJapanProducts(deferredQuery, 5)
      : [];
  const showPanel = open && deferredQuery.trim().length > 0;
  const isHome = variant === "home";

  useEffect(() => {
    setActiveIndex(-1);
  }, [deferredQuery]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (hits.length > 0) {
      // Prefer keyboard-highlighted row; otherwise first hit.
      const target = hits[Math.max(0, activeIndex)] ?? hits[0];
      window.location.assign(productHref(target.id));
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!showPanel) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, Math.max(hits.length - 1, 0)));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (event.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div
      ref={rootRef}
      className={`relative ${isHome ? "w-full" : "min-w-0 flex-1"} ${className}`}
    >
      <form
        role="search"
        onSubmit={onSubmit}
        className={
          isHome
            ? "group flex items-center gap-3 rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-3 shadow-[0_18px_36px_-28px_rgba(74,54,38,0.55)] ring-1 ring-[color:var(--accent)]/10 transition focus-within:border-[color:var(--accent)] focus-within:ring-[color:var(--accent)]/25"
            : "group flex items-center gap-2 rounded-full border border-[color:var(--line)] bg-[color:var(--surface)]/90 px-3 py-1.5 shadow-sm transition focus-within:border-[color:var(--accent)] focus-within:ring-2 focus-within:ring-[color:var(--accent)]/20"
        }
      >
        <SearchIcon
          className={
            isHome
              ? "h-5 w-5 shrink-0 text-[color:var(--accent)]"
              : "h-4 w-4 shrink-0 text-[color:var(--muted)] group-focus-within:text-[color:var(--accent)]"
          }
        />
        <input
          ref={inputRef}
          type="search"
          autoComplete="off"
          autoFocus={autoFocus}
          enterKeyHint="search"
          value={query}
          aria-label={t("productSearchLabel")}
          aria-controls={listId}
          aria-expanded={showPanel}
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined
          }
          placeholder={t("productSearchPlaceholder")}
          className={
            isHome
              ? "min-w-0 flex-1 bg-transparent text-sm text-[color:var(--ink)] outline-none placeholder:text-[color:var(--muted)] sm:text-base"
              : "min-w-0 flex-1 bg-transparent text-xs text-[color:var(--ink)] outline-none placeholder:text-[color:var(--muted)] sm:text-sm"
          }
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
        {query ? (
          <button
            type="button"
            className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium text-[color:var(--muted)] transition hover:bg-[color:var(--accent-soft)] hover:text-[color:var(--ink)]"
            aria-label={t("productSearchClear")}
            onClick={() => {
              setQuery("");
              setOpen(false);
              inputRef.current?.focus();
            }}
          >
            {t("productSearchClear")}
          </button>
        ) : null}
      </form>

      {showPanel ? (
        <div
          id={listId}
          role="listbox"
          aria-label={t("productSearchResults")}
          className={`absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] shadow-[0_24px_48px_-28px_rgba(74,54,38,0.65)] ${
            isHome ? "" : "min-w-[min(100vw-1.5rem,22rem)] sm:min-w-[22rem] sm:right-auto"
          }`}
        >
          {hits.length === 0 ? (
            <p className="px-4 py-4 text-sm leading-relaxed text-[color:var(--muted)]">
              {t("productSearchEmpty")}
            </p>
          ) : (
            <ul className="max-h-[min(70vh,22rem)] overflow-y-auto py-1.5">
              {hits.map((hit, index) => {
                const active = index === activeIndex;
                return (
                  <li key={hit.id} role="option" aria-selected={active}>
                    <CategoryNavLink
                      id={`${listId}-option-${index}`}
                      href={productHref(hit.id)}
                      className={`flex items-center gap-3 px-3 py-2.5 transition ${
                        active
                          ? "bg-[color:var(--accent-soft)]"
                          : "hover:bg-[color:var(--accent-soft)]/70"
                      }`}
                      onMouseEnter={() => setActiveIndex(index)}
                      onNavigate={() => setOpen(false)}
                    >
                      <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[color:var(--background)] ring-1 ring-[color:var(--line)]">
                        <Image
                          src={hit.imageUrl}
                          alt=""
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-[color:var(--ink)]">
                          {hit.title}
                        </span>
                        <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[color:var(--muted)]">
                          <span className="font-semibold tabular-nums text-[color:var(--accent)]">
                            {formatMoney(hit.price, locale)}
                          </span>
                          {hit.vendor ? <span>{hit.vendor}</span> : null}
                        </span>
                      </span>
                    </CategoryNavLink>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
