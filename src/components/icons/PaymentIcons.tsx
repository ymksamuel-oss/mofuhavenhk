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

/** HK Faster Payment System style mark — green FPS + circling blue arrows. */
export function FpsLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 24"
      height={ICON_H}
      className={`h-6 w-auto ${className}`}
      aria-label="FPS 轉數快"
      role="img"
    >
      <circle cx="24" cy="12" r="11" fill="#E8F6E9" />
      {/* Top arrow → */}
      <path
        d="M12 8.2c4.2-3.6 12.8-3.8 18.2-.2"
        fill="none"
        stroke="#4DA3E0"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path d="M29.2 5.6l3.2 3.4-4.4.6z" fill="#4DA3E0" />
      {/* Bottom arrow ← */}
      <path
        d="M36 15.8c-4.2 3.6-12.8 3.8-18.2.2"
        fill="none"
        stroke="#1E6BB8"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path d="M18.8 18.4l-3.2-3.4 4.4-.6z" fill="#1E6BB8" />
      <text
        x="24"
        y="15.2"
        textAnchor="middle"
        fill="#3CA54B"
        fontSize="9.5"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="800"
        fontStyle="italic"
      >
        FPS
      </text>
    </svg>
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
