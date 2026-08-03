"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

/**
 * Re-mounts on route change so catalog / category pages fade+slide in
 * under 300ms. Header / cart chrome stay outside this wrapper.
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
