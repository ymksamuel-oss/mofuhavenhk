"use client";

import {
  type MouseEvent,
  type ReactNode,
  useCallback,
  useTransition,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type TransitionLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
  "aria-label"?: string;
};

const EXIT_MS = 140;

function runExitThen(navigate: () => void) {
  const root = document.querySelector<HTMLElement>("[data-page-transition]");
  if (!root) {
    navigate();
    return;
  }

  root.classList.remove("page-transition--enter");
  root.classList.add("page-transition--exit");

  window.setTimeout(() => {
    navigate();
  }, EXIT_MS);
}

/**
 * Link that plays a short fade/slide exit before Next.js navigation,
 * then the destination enters via PageTransition (total feel ≤ ~300ms).
 */
export function TransitionLink({
  href,
  className,
  children,
  ...rest
}: TransitionLinkProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  const onClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
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

      if (href === pathname) {
        event.preventDefault();
        return;
      }

      event.preventDefault();
      runExitThen(() => {
        startTransition(() => {
          router.push(href);
        });
      });
    },
    [href, pathname, router, startTransition],
  );

  return (
    <Link href={href} className={className} onClick={onClick} {...rest}>
      {children}
    </Link>
  );
}
