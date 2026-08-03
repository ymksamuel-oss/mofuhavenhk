"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

/**
 * Light enter-only fade for route changes.
 * No exit / pointer-events lock — that previously froze category navigation.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div
      key={pathname}
      data-page-transition=""
      className="page-transition page-transition--enter"
    >
      {children}
    </div>
  );
}
