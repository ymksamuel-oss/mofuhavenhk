type LogoProps = { className?: string };

/** Visa wordmark (#1434CB) — transparent acceptance mark. */
export function VisaLogo({ className = "" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 48 16"
      className={`h-6 w-auto shrink-0 ${className}`}
      aria-label="Visa"
      role="img"
    >
      <path
        fill="#1434CB"
        transform="translate(0 -4.5)"
        d="M9.112 8.262 5.97 15.698H3.92L2.374 9.775c-.094-.368-.175-.503-.461-.658C1.447 8.864.677 8.627 0 8.479l.046-.217h3.3a.904.904 0 0 1 .894.764l.817 4.338 2.018-5.102zm8.063 5.047c.008-2.009-2.778-2.12-2.76-3.018.006-.274.267-.566.84-.641.284-.037 1.068-.067 1.957.345l.349-1.63a5.208 5.208 0 0 0-1.814-.333c-1.92 0-3.273 1.02-3.286 2.482-.016 1.08.963 1.682 1.698 2.042.756.369 1.01.605 1.006.934-.005.504-.602.726-1.16.735-.975.016-1.54-.263-1.993-.473l-.351 1.642c.453.208 1.289.39 2.156.398 2.037 0 3.37-1.006 3.378-2.563m5.071 2.389h1.804l-1.573-7.436h-1.665a.897.897 0 0 0-.838.58l-2.946 6.856h2.06l.41-1.131h2.518zm-2.175-3.004 1.032-2.839.595 2.839zM11.007 8.262l-1.622 7.436H7.44l1.622-7.436z"
      />
    </svg>
  );
}

/** Mastercard interlocking circles — transparent acceptance mark. */
export function MastercardLogo({ className = "" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 38 24"
      className={`h-6 w-auto shrink-0 ${className}`}
      aria-label="Mastercard"
      role="img"
    >
      <circle cx="12" cy="12" r="10" fill="#EB001B" />
      <circle cx="26" cy="12" r="10" fill="#F79E1B" />
      <path
        d="M19 4.35a10 10 0 0 1 0 15.3 10 10 0 0 1 0-15.3z"
        fill="#FF5F00"
      />
    </svg>
  );
}

/**
 * Visa + Mastercard — vector acceptance marks, transparent.
 */
export function CardLogo({ className = "" }: LogoProps) {
  return (
    <span
      className={`inline-flex h-9 w-[4.5rem] shrink-0 items-center justify-start gap-1.5 ${className}`}
      aria-label="Visa and Mastercard"
      role="img"
    >
      <VisaLogo className="h-6" />
      <MastercardLogo className="h-6" />
    </span>
  );
}

/** Apple Pay — black Apple glyph + Pay wordmark (inline SVG). */
export function ApplePayLogo({ className = "" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 104 40"
      className={`h-6 w-auto shrink-0 ${className}`}
      aria-label="Apple Pay"
      role="img"
    >
      <path
        fill="#1A1A1A"
        d="M22.9 10.3c-.9 1.1-2.4 1.9-3.8 1.8-.2-1.5.5-3.1 1.4-4.1.9-1.1 2.5-1.9 3.8-1.9.1 1.5-.4 3-1.4 4.2zm1.4 2.2c-2.2-.1-4.1 1.3-5.1 1.3-1.1 0-2.7-1.2-4.4-1.1-2.2.1-4.3 1.4-5.4 3.4-2.3 4-.6 9.9 1.7 13.1 1.1 1.6 2.4 3.4 4.2 3.3 1.6-.1 2.3-1.1 4.3-1.1s2.6 1.1 4.4 1c1.8-.1 3-1.6 4.1-3.2 1.3-1.9 1.8-3.7 1.8-3.8-.1 0-3.6-1.4-3.6-5.4 0-3.4 2.8-5 2.9-5.1-1.6-2.4-4.1-2.6-4.9-2.7z"
      />
      <path
        fill="#1A1A1A"
        d="M48.2 12.1h3.35c2.86 0 4.78 1.56 4.78 4.02 0 2.52-1.98 4.12-4.9 4.12h-1.58v4.56H48.2V12.1zm3.2 6.52c1.62 0 2.62-.84 2.62-2.42 0-1.54-.98-2.36-2.6-2.36h-1.57v4.78h1.55zm8.02 6.28c-2.34 0-3.9-1.5-3.9-3.66 0-2.18 1.58-3.68 3.98-3.68 1.3 0 2.34.46 3.06 1.26l-1.14 1.22c-.5-.52-1.18-.84-1.96-.84-1.34 0-2.24.9-2.24 2.04s.9 2.04 2.24 2.04c.8 0 1.5-.32 2.02-.88l1.14 1.18c-.76.86-1.86 1.32-3.2 1.32zm9.48.1c-2.46 0-4.12-1.66-4.12-3.76s1.66-3.76 4.12-3.76 4.12 1.66 4.12 3.76-1.66 3.76-4.12 3.76zm0-1.52c1.4 0 2.34-.96 2.34-2.24s-.94-2.24-2.34-2.24-2.34.96-2.34 2.24.94 2.24 2.34 2.24zm6.34 1.32v-9.08h1.66v9.08h-1.66z"
      />
    </svg>
  );
}

/** WeChat Pay — green app mark with bubble + check (inline SVG). */
export function WeChatPayLogo({ className = "" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 96 96"
      className={`h-6 w-auto shrink-0 ${className}`}
      aria-label="WeChat Pay"
      role="img"
    >
      <defs>
        <linearGradient
          id="footerWechatPayBg"
          x1="48"
          y1="0"
          x2="48"
          y2="96"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#2BD42B" />
          <stop offset="1" stopColor="#09A809" />
        </linearGradient>
      </defs>
      <rect width="96" height="96" rx="22" fill="url(#footerWechatPayBg)" />
      <path
        fill="#FFFFFF"
        d="M48 18c-15.4 0-27.8 10.2-27.8 22.8 0 7.5 4.4 14.1 11.3 18.2l-2.4 8.4c-.3 1 .7 1.9 1.6 1.4l9.7-5.3c2.4.5 4.9.8 7.6.8 15.4 0 27.8-10.2 27.8-22.8S63.4 18 48 18z"
      />
      <path
        fill="#09A809"
        d="M42.2 48.6 36.8 43.2a2.4 2.4 0 0 0-3.4 3.4l7.1 7.1a2.4 2.4 0 0 0 3.5.1l16.2-15.4a2.4 2.4 0 1 0-3.3-3.5L42.2 48.6z"
      />
    </svg>
  );
}

/** AlipayHK — blue app mark with 「支」(inline SVG). */
export function AlipayHkLogo({ className = "" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 96 96"
      className={`h-6 w-auto shrink-0 ${className}`}
      aria-label="AlipayHK"
      role="img"
    >
      <rect width="96" height="96" rx="22" fill="#00A0E9" />
      <path
        fill="#FFFFFF"
        d="M21.09 28H45.09V20H49.94V28H74.42V32.61H49.94V42.06H68.85V46.18Q64 57.82 54.06 64.61Q62.79 68.48 75.15 70.67L73.21 76Q59.15 73.82 48.73 67.76Q37.33 73.82 22.06 75.76L20.85 71.39Q35.15 69.94 44.36 64.85Q35.64 58.55 29.82 46.67H25.94V42.06H45.09V32.61H21.09ZM34.91 46.67Q41.21 57.58 49.21 62.18Q58.67 56.12 63.27 46.67Z"
      />
    </svg>
  );
}

export function WhatsAppLogo({ className = "" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      height={20}
      className={`h-5 w-auto ${className}`}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="12" fill="#25D366" />
      <path
        d="M16.4 14.1c-.2-.1-1.3-.6-1.5-.7-.2-.1-.3-.1-.5.1-.1.2-.5.7-.6.8-.1.1-.2.1-.4 0-.2-.1-.9-.3-1.7-1.1-.6-.6-1-1.3-1.2-1.5-.1-.2 0-.3.1-.4l.3-.4c.1-.1.1-.2.2-.3.1-.1 0-.2 0-.3 0-.1-.5-1.1-.6-1.5-.2-.4-.3-.3-.5-.3h-.4c-.1 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2 1 2.3c.1.2 1.6 2.5 3.9 3.4.5.2.9.4 1.3.5.5.2 1 .1 1.3 0 .4-.1 1.3-.5 1.4-1 .2-.5.2-.9.1-1z"
        fill="#fff"
      />
    </svg>
  );
}
