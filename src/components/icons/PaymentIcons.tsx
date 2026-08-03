/** Shared 24px height for all payment marks */
const ICON_H = 24;

export function CardLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 24"
      height={ICON_H}
      className={`h-6 w-auto ${className}`}
      aria-label="Card"
      role="img"
    >
      <rect width="40" height="24" rx="3" fill="#1F3A5F" />
      <rect x="4" y="7" width="14" height="3" rx="1" fill="#F2C94C" />
      <rect x="4" y="14" width="8" height="2" rx="1" fill="#D7E0EA" />
      <rect x="14" y="14" width="6" height="2" rx="1" fill="#D7E0EA" />
    </svg>
  );
}

export function ApplePayLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 24"
      height={ICON_H}
      className={`h-6 w-auto ${className}`}
      aria-label="Apple Pay"
      role="img"
    >
      <rect width="48" height="24" rx="3" fill="#000" />
      <path
        d="M13.6 8.9c-.4.5-1.1.9-1.7.8-.1-.7.2-1.4.6-1.8.4-.5 1.1-.9 1.7-.9.1.7-.2 1.3-.6 1.9zm.6 1c-1-.1-1.8.6-2.3.6-.5 0-1.2-.5-1.9-.5-1 0-1.9.6-2.4 1.4-1 1.8-.3 4.4.7 5.9.5.7 1.1 1.5 1.9 1.5.7 0 1-.5 1.9-.5s1.2.5 1.9.5c.8 0 1.4-.7 1.9-1.5.5-.8.8-1.6.8-1.6-.1 0-1.6-.6-1.6-2.4 0-1.5 1.2-2.2 1.3-2.3-.7-1-1.8-1.1-2.2-1.1z"
        fill="#fff"
      />
      <text
        x="34"
        y="16"
        textAnchor="middle"
        fill="#fff"
        fontSize="9"
        fontFamily="Arial, sans-serif"
        fontWeight="600"
      >
        Pay
      </text>
    </svg>
  );
}

/** WeChat Pay brand mark — official green #09BB07 dual speech bubbles. */
export function WeChatPayLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={32}
      height={32}
      className={`h-8 w-8 ${className}`}
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

/** Official AlipayHK app icon (#00A0E9) from AlipayHK 2019 brand pack. */
export function AlipayHkLogo({ className = "" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- official AlipayHK brand SVG asset
    <img
      src="/images/alipayhk-official-logo.svg"
      alt="AlipayHK"
      width={32}
      height={32}
      className={`h-8 w-8 object-contain ${className}`}
    />
  );
}

export function WhatsAppLogo({ className = "" }: { className?: string }) {
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
