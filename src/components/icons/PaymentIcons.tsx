import Image from "next/image";

type LogoProps = { className?: string };

/** Visa wordmark (#1434CB) — transparent acceptance mark. */
export function VisaLogo({ className = "" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-6 w-auto shrink-0 ${className}`}
      aria-label="Visa"
      role="img"
    >
      <path
        fill="#1434CB"
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
      className={`inline-flex h-10 w-12 shrink-0 items-center justify-center gap-1 ${className}`}
      aria-label="Visa and Mastercard"
      role="img"
    >
      <VisaLogo className="h-5" />
      <MastercardLogo className="h-5" />
    </span>
  );
}

/**
 * Apple Pay — black Apple glyph + Pay (no Google Pay).
 * Asset: /public/images/apple-pay-logo.svg
 */
export function ApplePayLogo({ className = "" }: LogoProps) {
  return (
    <span
      className={`relative inline-flex h-10 w-12 shrink-0 items-center justify-center ${className}`}
    >
      <Image
        src="/images/apple-pay-logo.svg"
        alt="Apple Pay"
        width={104}
        height={40}
        className="h-7 w-auto max-w-full object-contain"
        unoptimized
      />
    </span>
  );
}

/**
 * WeChat Pay — official green app mark (bubble + check).
 * Asset: /public/images/wechat-pay-logo.svg
 */
export function WeChatPayLogo({ className = "" }: LogoProps) {
  return (
    <span
      className={`relative inline-flex h-10 w-10 shrink-0 overflow-hidden rounded-[0.65rem] ${className}`}
    >
      <Image
        src="/images/wechat-pay-logo.svg"
        alt="WeChat Pay"
        width={40}
        height={40}
        className="h-full w-full object-cover"
        unoptimized
      />
    </span>
  );
}

/**
 * AlipayHK — official blue app mark with 「支」 (AlipayHK 2019 brand pack).
 * Asset: /public/images/alipayhk-logo.svg
 */
export function AlipayHkLogo({ className = "" }: LogoProps) {
  return (
    <span
      className={`relative inline-flex h-10 w-10 shrink-0 overflow-hidden rounded-[0.65rem] ${className}`}
    >
      <Image
        src="/images/alipayhk-logo.svg"
        alt="AlipayHK"
        width={40}
        height={40}
        className="h-full w-full object-cover"
        unoptimized
      />
    </span>
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
