"use client";

import Image from "next/image";
import {
  useDeferredValue,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { CategoryNavLink } from "@/components/CategoryNavLink";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { formatMoney } from "@/lib/i18n/translations";
import { productHref } from "@/lib/products";
import {
  searchWtJapanProducts,
  type ProductSearchHit,
} from "@/lib/searchProducts";

export function SearchGlyph({ className = "" }: { className?: string }) {
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

function CloseGlyph({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

type SearchFieldProps = {
  listId: string;
  query: string;
  setQuery: (value: string) => void;
  setSuggestionsOpen: (value: boolean) => void;
  activeIndex: number;
  setActiveIndex: (value: number | ((prev: number) => number)) => void;
  hits: ProductSearchHit[];
  showPanel: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  size: "compact" | "comfortable";
  autoFocus?: boolean;
  onEscape?: () => void;
  onNavigateAway?: () => void;
  panelClassName?: string;
};

function SearchField({
  listId,
  query,
  setQuery,
  setSuggestionsOpen,
  activeIndex,
  setActiveIndex,
  hits,
  showPanel,
  inputRef,
  size,
  autoFocus = false,
  onEscape,
  onNavigateAway,
  panelClassName = "",
}: SearchFieldProps) {
  const { locale, t } = useI18n();
  const comfortable = size === "comfortable";

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (hits.length > 0) {
      const target = hits[Math.max(0, activeIndex)] ?? hits[0];
      onNavigateAway?.();
      window.location.assign(productHref(target.id));
    }
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setSuggestionsOpen(false);
      onEscape?.();
      return;
    }
    if (!showPanel) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, Math.max(hits.length - 1, 0)));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    }
  };

  return (
    <>
      <form
        role="search"
        onSubmit={onSubmit}
        className={
          comfortable
            ? "group flex items-center gap-3 rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-3 shadow-[0_18px_36px_-28px_rgba(74,54,38,0.55)] ring-1 ring-[color:var(--accent)]/10 transition focus-within:border-[color:var(--accent)] focus-within:ring-[color:var(--accent)]/25"
            : "group flex items-center gap-2 rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-1.5 shadow-sm transition focus-within:border-[color:var(--accent)] focus-within:ring-2 focus-within:ring-[color:var(--accent)]/20"
        }
      >
        <SearchGlyph
          className={
            comfortable
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
            comfortable
              ? "min-w-0 flex-1 bg-transparent text-sm text-[color:var(--ink)] outline-none placeholder:text-[color:var(--muted)] sm:text-base"
              : "min-w-0 flex-1 bg-transparent text-xs text-[color:var(--ink)] outline-none placeholder:text-[color:var(--muted)] sm:text-sm"
          }
          onChange={(event) => {
            setQuery(event.target.value);
            setSuggestionsOpen(true);
          }}
          onFocus={() => setSuggestionsOpen(true)}
          onKeyDown={onKeyDown}
        />
        {query ? (
          <button
            type="button"
            className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium text-[color:var(--muted)] transition hover:bg-[color:var(--accent-soft)] hover:text-[color:var(--ink)]"
            aria-label={t("productSearchClear")}
            onClick={() => {
              setQuery("");
              setSuggestionsOpen(true);
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
          className={`overflow-hidden rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] shadow-[0_24px_48px_-28px_rgba(74,54,38,0.65)] ${panelClassName}`}
        >
          {hits.length === 0 ? (
            <p className="px-4 py-4 text-sm leading-relaxed text-[color:var(--muted)]">
              {t("productSearchEmpty")}
            </p>
          ) : (
            <ul className="max-h-[min(60vh,22rem)] overflow-y-auto py-1.5">
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
                      onNavigate={() => {
                        setSuggestionsOpen(false);
                        onNavigateAway?.();
                      }}
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
    </>
  );
}

type ProductSearchProps = {
  variant?: "header" | "home";
  className?: string;
  autoFocus?: boolean;
};

/**
 * Homepage: always-visible search bar with dropdown suggestions.
 * Header: always-visible compact input on `sm+`; magnifier opens a modal on xs.
 */
export function ProductSearch({
  variant = "header",
  className = "",
  autoFocus = false,
}: ProductSearchProps) {
  const { t } = useI18n();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalInputRef = useRef<HTMLInputElement>(null);

  const [portalReady, setPortalReady] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const deferredQuery = useDeferredValue(query);
  const hits =
    deferredQuery.trim().length > 0
      ? searchWtJapanProducts(deferredQuery, 5)
      : [];
  const showPanel = suggestionsOpen && deferredQuery.trim().length > 0;

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    setActiveIndex(-1);
  }, [deferredQuery]);

  useEffect(() => {
    if (!suggestionsOpen || variant !== "header") return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setSuggestionsOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [suggestionsOpen, variant]);

  useEffect(() => {
    if (!modalOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => modalInputRef.current?.focus(), 30);
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setModalOpen(false);
        setSuggestionsOpen(false);
        setQuery("");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
    };
  }, [modalOpen]);

  const closeModal = () => {
    setModalOpen(false);
    setSuggestionsOpen(false);
    setQuery("");
  };

  if (variant === "home") {
    return (
      <div ref={rootRef} className={`relative w-full ${className}`}>
        <SearchField
          listId={listId}
          query={query}
          setQuery={setQuery}
          setSuggestionsOpen={setSuggestionsOpen}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
          hits={hits}
          showPanel={showPanel}
          inputRef={inputRef}
          size="comfortable"
          autoFocus={autoFocus}
          panelClassName="absolute left-0 right-0 z-50 mt-2"
        />
      </div>
    );
  }

  const modal =
    modalOpen && portalReady
      ? createPortal(
          <div
            className="fixed inset-0 z-[110] flex items-start justify-center bg-[color:var(--ink)]/45 px-3 pb-8 pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur-[2px] sm:items-center sm:px-6"
            role="dialog"
            aria-modal="true"
            aria-label={t("productSearchLabel")}
          >
            <button
              type="button"
              className="absolute inset-0 cursor-default"
              aria-label={t("productSearchClose")}
              onClick={closeModal}
            />
            <div
              className="relative z-[111] w-full max-w-lg rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface)] p-4 shadow-[0_28px_56px_-24px_rgba(74,54,38,0.7)] sm:p-5"
              style={{
                background:
                  "linear-gradient(180deg, #fffaf1 0%, #fdf8ef 55%, #f8f0e2 100%)",
              }}
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="font-[family-name:var(--font-display)] text-base font-semibold text-[color:var(--ink)]">
                  {t("productSearchLabel")}
                </p>
                <button
                  type="button"
                  className="flex h-10 w-10 touch-manipulation items-center justify-center rounded-full border border-[color:var(--line)] bg-[color:var(--background)] text-[color:var(--ink)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
                  aria-label={t("productSearchClose")}
                  onClick={closeModal}
                >
                  <CloseGlyph className="h-4 w-4" />
                </button>
              </div>
              <div className="relative">
                <SearchField
                  listId={`${listId}-modal`}
                  query={query}
                  setQuery={setQuery}
                  setSuggestionsOpen={setSuggestionsOpen}
                  activeIndex={activeIndex}
                  setActiveIndex={setActiveIndex}
                  hits={hits}
                  showPanel={showPanel}
                  inputRef={modalInputRef}
                  size="comfortable"
                  autoFocus
                  onEscape={closeModal}
                  onNavigateAway={closeModal}
                  panelClassName="mt-3"
                />
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <div
        ref={rootRef}
        className={`relative flex items-center ${className}`}
        data-testid="header-product-search"
      >
        {/* Always-visible search input between checkout nav and cart (sm+) */}
        <div className="relative hidden w-[min(42vw,15.5rem)] sm:block md:w-[min(36vw,17.5rem)] lg:w-[min(28vw,18.5rem)]">
          <SearchField
            listId={listId}
            query={query}
            setQuery={setQuery}
            setSuggestionsOpen={setSuggestionsOpen}
            activeIndex={activeIndex}
            setActiveIndex={setActiveIndex}
            hits={hits}
            showPanel={showPanel}
            inputRef={inputRef}
            size="compact"
            panelClassName="absolute right-0 z-50 mt-2 w-[min(90vw,22rem)]"
          />
        </div>

        {/* xs: magnifier opens full search modal */}
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--line)] bg-[color:var(--background)] text-[color:var(--ink)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] sm:hidden"
          aria-label={t("productSearchOpen")}
          aria-expanded={modalOpen}
          data-testid="header-product-search-icon"
          onClick={() => {
            setModalOpen(true);
            setSuggestionsOpen(true);
          }}
        >
          <SearchGlyph className="h-5 w-5" />
        </button>
      </div>
      {modal}
    </>
  );
}
