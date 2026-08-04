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

/** Apple Pay — Apple glyph + Pay wordmark as pure vector paths (no <text>). */
export function ApplePayLogo({ className = "" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 512 210.2"
      className={`h-6 w-auto shrink-0 ${className}`}
      aria-label="Apple Pay"
      role="img"
    >
      <path
        fill="#1A1A1A"
        d="M93.6 27.1C87.6 34.2 78 39.8 68.4 39c-1.2-9.6 3.5-19.8 9-26.1 6-7.3 16.5-12.5 25-12.9C103.4 10 99.5 19.8 93.6 27.1m8.7 13.8c-13.9-.8-25.8 7.9-32.4 7.9-6.7 0-16.8-7.5-27.8-7.3-14.3.2-27.6 8.3-34.9 21.2-15 25.8-3.9 64 10.6 85 7.1 10.4 15.6 21.8 26.8 21.4 10.6-.4 14.8-6.9 27.6-6.9 12.9 0 16.6 6.9 27.8 6.7 11.6-.2 18.9-10.4 26-20.8 8.1-11.8 11.4-23.3 11.6-23.9-.2-.2-22.4-8.7-22.6-34.3-.2-21.4 17.5-31.6 18.3-32.2-5.1-7.6-20.7-9.2-26.1-9.6M182.6 11.9v155.9h24.2v-53.3h33.5c30.6 0 52.1-21 52.1-51.4 0-30.4-21.1-51.2-51.3-51.2h-58.5zm24.2 20.4h27.9c21 0 33 11.2 33 30.9 0 19.7-12 31-33.1 31h-27.8V32.3zM336.6 169c15.2 0 29.3-7.7 35.7-19.9h.5v18.7h22.4V90.2c0-22.5-18-37-45.7-37-25.7 0-44.7 14.7-45.4 34.9h21.8c1.8-9.6 10.7-15.9 22.9-15.9 14.8 0 23.1 6.9 23.1 19.6v8.6l-30.2 1.8c-28.1 1.7-43.3 13.2-43.3 33.2 0 19.4 15.7 32.8 38.2 32.8zm6.5-18.5c-12.9 0-21.1-6.2-21.1-15.7 0-9.8 7.9-15.5 23-16.4l26.9-1.7v8.8c0 14.4-12.4 24.8-28.8 24.8zM425.1 210.2c23.6 0 34.7-9 44.4-36.3L512 54.7h-24.6l-28.5 92.1h-.5l-28.5-92.1h-25.3l41 113.5-2.2 6.9c-3.7 11.7-9.7 16.2-20.4 16.2-1.9 0-5.6-.2-7.1-.4v18.7c2.5.3 8.5.5 10.3.5z"
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
