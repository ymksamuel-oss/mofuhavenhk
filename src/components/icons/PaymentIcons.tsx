type LogoProps = { className?: string };

/**
 * Visa (#1434CB) + Mastercard (#EB001B / #F79E1B / #FF5F00) acceptance marks.
 * Transparent — no white plate / generic dark card art.
 */
export function CardLogo({ className = "" }: LogoProps) {
  return (
    <span
      className={`inline-flex h-7 items-center gap-1.5 ${className}`}
      aria-label="Visa and Mastercard"
      role="img"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-6 w-auto"
        aria-hidden="true"
      >
        {/* Visa Brand Mark blue (#1434CB) — transparent */}
        <path
          fill="#1434CB"
          d="M9.112 8.262 5.97 15.698H3.92L2.374 9.775c-.094-.368-.175-.503-.461-.658C1.447 8.864.677 8.627 0 8.479l.046-.217h3.3a.904.904 0 0 1 .894.764l.817 4.338 2.018-5.102zm8.063 5.047c.008-2.009-2.778-2.12-2.76-3.018.006-.274.267-.566.84-.641.284-.037 1.068-.067 1.957.345l.349-1.63a5.208 5.208 0 0 0-1.814-.333c-1.92 0-3.273 1.02-3.286 2.482-.016 1.08.963 1.682 1.698 2.042.756.369 1.01.605 1.006.934-.005.504-.602.726-1.16.735-.975.016-1.54-.263-1.993-.473l-.351 1.642c.453.208 1.289.39 2.156.398 2.037 0 3.37-1.006 3.378-2.563m5.071 2.389h1.804l-1.573-7.436h-1.665a.897.897 0 0 0-.838.58l-2.946 6.856h2.06l.41-1.131h2.518zm-2.175-3.004 1.032-2.839.595 2.839zM11.007 8.262l-1.622 7.436H7.44l1.622-7.436z"
        />
      </svg>
      <svg viewBox="0 0 38 24" className="h-6 w-auto" aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="#EB001B" />
        <circle cx="26" cy="12" r="10" fill="#F79E1B" />
        <path
          d="M19 4.35a10 10 0 0 1 0 15.3 10 10 0 0 1 0-15.3z"
          fill="#FF5F00"
        />
      </svg>
    </span>
  );
}

/**
 * Apple Pay + Google Pay marks on transparent background (no black/white plates).
 */
export function ApplePayLogo({ className = "" }: LogoProps) {
  return (
    <span
      className={`inline-flex h-7 items-center gap-2.5 ${className}`}
      aria-label="Apple Pay and Google Pay"
      role="img"
    >
      {/* Apple Pay — black glyph + Pay (light-bg variant, no plate) */}
      <svg
        viewBox="0 0 52 20"
        className="h-[1.2rem] w-auto"
        aria-hidden="true"
      >
        <path
          fill="#000"
          d="M9.55 5.15c-.45.55-1.2.95-1.9.9-.1-.75.25-1.55.7-2.05.45-.55 1.25-.95 1.9-.95.05.75-.2 1.5-.7 2.1zm.7 1.1c-1.1-.05-2.05.65-2.55.65-.55 0-1.35-.6-2.2-.55-1.1.05-2.15.7-2.7 1.7-1.15 2-.3 4.95.85 6.55.55.8 1.2 1.7 2.1 1.65.8-.05 1.15-.55 2.15-.55s1.3.55 2.2.5c.9-.05 1.5-.8 2.05-1.6.65-.95.9-1.85.9-1.9-.05 0-1.8-.7-1.8-2.7 0-1.7 1.4-2.5 1.45-2.55-.8-1.2-2.05-1.3-2.45-1.35z"
        />
        <text
          x="34.5"
          y="15"
          textAnchor="middle"
          fill="#000"
          fontSize="11.5"
          fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif"
          fontWeight="600"
          letterSpacing="0.2"
        >
          Pay
        </text>
      </svg>
      {/* Google Pay — multicolor G + Pay word */}
      <svg
        viewBox="0 0 54 20"
        className="h-[1.2rem] w-auto"
        aria-hidden="true"
      >
        <path
          fill="#4285F4"
          d="M9.8 10v2.15h3.65c-.15 1-.6 1.75-1.25 2.25v1.85h2.05A5.4 5.4 0 0 0 15.2 12c0-.45-.05-.9-.1-1.3H9.8z"
        />
        <path
          fill="#34A853"
          d="M9.8 17c1.6 0 2.95-.55 3.95-1.45l-2.05-1.85c-.55.4-1.3.65-1.9.65-1.45 0-2.7-.95-3.15-2.3H4.5v1.9A6.05 6.05 0 0 0 9.8 17z"
        />
        <path
          fill="#FBBC04"
          d="M6.65 12c-.1-.35-.2-.7-.2-1.05s.05-.7.2-1.05V8H4.5a5.9 5.9 0 0 0 0 5.35L6.65 12z"
        />
        <path
          fill="#EA4335"
          d="M9.8 5.75c.9 0 1.7.3 2.35.9l1.75-1.75C12.65 3.75 11.3 3.2 9.8 3.2c-2.3 0-4.3 1.1-5.3 3.05L6.65 7.95c.45-1.35 1.7-2.2 3.15-2.2z"
        />
        <text
          x="38"
          y="15"
          textAnchor="middle"
          fill="#5F6368"
          fontSize="11.5"
          fontFamily="Product Sans, Google Sans, Roboto, Arial, sans-serif"
          fontWeight="500"
          letterSpacing="0.1"
        >
          Pay
        </text>
      </svg>
    </span>
  );
}

/**
 * WeChat Pay official green rounded mark (#09BB07).
 * Brand color is the icon face itself — no outer white plate.
 */
export function WeChatPayLogo({ className = "" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={32}
      height={32}
      className={`h-8 w-8 shrink-0 ${className}`}
      aria-label="WeChat Pay"
      role="img"
    >
      <rect width="48" height="48" rx="10" fill="#09BB07" />
      <g fill="#FFFFFF">
        <path d="M19.6 14.2c-6.1 0-11 3.9-11 8.7 0 2.7 1.6 5.1 4.1 6.7l-.9 3.1 3.5-1.9c1.3.4 2.7.6 4.3.6.4 0 .8 0 1.2-.1-.3-.8-.4-1.6-.4-2.5 0-5.1 5-9.2 11.1-9.2.3 0 .7 0 1 .1-1.5-3.5-5.6-5.5-10.9-5.5z" />
        <circle cx="15.2" cy="22.2" r="1.25" />
        <circle cx="20.8" cy="22.2" r="1.25" />
        <path d="M35.4 24.6c-5.1 0-9.2 3.3-9.2 7.3 0 2.3 1.4 4.3 3.5 5.6l-.7 2.5 2.9-1.6c1.1.3 2.2.5 3.5.5 5.1 0 9.2-3.3 9.2-7.3s-4.1-7-9.2-7z" />
        <circle cx="32.2" cy="31.4" r="1.05" />
        <circle cx="37.2" cy="31.4" r="1.05" />
      </g>
    </svg>
  );
}

/**
 * AlipayHK official blue mark (#00A0E9) — logo paths only, no white app-icon plate.
 * Cut from AlipayHK 2019 brand pack for transparent checkout use.
 */
export function AlipayHkLogo({ className = "" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={32}
      height={32}
      className={`h-8 w-8 shrink-0 ${className}`}
      aria-label="AlipayHK"
      role="img"
    >
      <path
        fill="#00A0E9"
        d="M36.5625 0C43.5 0 48 4.5 48 11.4375v20.6028c-.45-.115-3.34-.759-9.092-2.69-1.797-.579-4.144-1.458-6.715-2.41 1.528-2.668 2.78-5.77 3.616-9.126h-8.695v-3.099h10.589V12.994H27.115V7.828h-4.305c-.724 0-.77.636-.774.687v4.479H11.36v1.722h10.761v3.099H13.254v1.722h17.132c-.629 2.099-1.463 4.116-2.497 5.94-5.539-1.773-11.485-3.273-15.238-2.325-2.402.552-3.915 1.586-4.821 2.669C3.625 30.84 6.598 38.39 15.406 38.39c5.171 0 10.178-2.844 14.033-7.576 5.348 2.553 16.686 7.21 18.405 7.927C46.99 44.427 42.744 48 36.563 48H11.438C4.5 48 0 43.5 0 36.563V22.858L22.793 0H36.563z"
      />
      <path
        fill="#00A0E9"
        d="M14.545 35.56c-6.806 0-8.843-5.327-5.424-8.201 1.124-1.004 3.161-1.47 4.219-1.554 4.112-.433 7.872 1.119 12.311 3.281-3.081 3.94-7.102 6.474-11.106 6.474"
      />
      <path
        fill="#00A0E9"
        transform="translate(7.56 7.93) rotate(-45) translate(-7.56 -7.93)"
        d="M7.264 10.913H6.522V8.193H3.259v2.72H2.518V4.94h.741v2.583h3.263V4.94h.742v5.973zm1.52 0s-.037 0-.111 0h-.26c-.074 0-.111 0-.111 0V4.94h.742v2.914h.041l2.624-2.914h.935L9.942 7.585l2.661 3.328h-.947L9.427 8.115l-.643.712v2.086z"
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
