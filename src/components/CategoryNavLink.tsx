"use client";

import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";

type CategoryNavLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
  onNavigate?: () => void;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className" | "children">;

/**
 * Hard document navigation for catalog / category chips.
 * Uses a real <a> so the browser always leaves the current page —
 * avoiding App Router soft-nav freezes / blur traps.
 */
export function CategoryNavLink({
  href,
  className,
  children,
  onNavigate,
  onClick,
  ...rest
}: CategoryNavLinkProps) {
  const { locale } = useI18n();
  const targetHref =
    !href.includes("#") && (href.startsWith("/menu") || href.startsWith("/categories"))
      ? `${href}#products`
      : href;
  const [pathAndQuery, hash] = targetHref.split("#", 2);
  const localizedPath =
    locale === "en" && pathAndQuery.startsWith("/categories")
      ? `${pathAndQuery}${pathAndQuery.includes("?") ? "&" : "?"}lang=en`
      : pathAndQuery;
  const localizedHref = hash ? `${localizedPath}#${hash}` : localizedPath;

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    // Force a full navigation even if a framework interceptor interferes.
    event.preventDefault();
    onNavigate?.();
    document.body.style.overflow = "";
    window.location.assign(localizedHref);
  };

  return (
    <a href={localizedHref} className={className} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
