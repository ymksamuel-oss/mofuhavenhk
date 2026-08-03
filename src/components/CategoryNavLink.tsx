"use client";

import type { MouseEvent, ReactNode } from "react";

type CategoryNavLinkProps = {
  href: string;
  className?: string;
  children?: ReactNode;
  "aria-label"?: string;
};

/**
 * Hard document navigation for catalog / category / product cards.
 * Uses a real <a> so the browser always leaves the current page —
 * avoiding App Router soft-nav freezes / blur traps.
 */
export function CategoryNavLink({
  href,
  className,
  children,
  ...rest
}: CategoryNavLinkProps) {
  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
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
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
    // Prefer assign; fall back to href hard nav if something blocks it.
    try {
      window.location.assign(href);
    } catch {
      window.location.href = href;
    }
  };

  return (
    <a href={href} className={className} onClick={onClick} {...rest}>
      {children}
    </a>
  );
}
