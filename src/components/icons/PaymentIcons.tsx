import Image from "next/image";

type LogoProps = { className?: string };

/** Visa acceptance mark used in the card option. */
export function VisaLogo({ className = "" }: LogoProps) {
  return (
    <Image
      src="/payment/visa-brandmark-blue.png"
      width={1920}
      height={622}
      alt="Visa"
      className={`h-6 w-auto shrink-0 object-contain ${className}`}
    />
  );
}

/** Mastercard acceptance mark used in the card option. */
export function MastercardLogo({ className = "" }: LogoProps) {
  return (
    <Image
      src="/payment/mastercard-symbol.png"
      width={185}
      height={129}
      alt="Mastercard"
      className={`h-6 w-auto shrink-0 object-contain ${className}`}
    />
  );
}

/** Visa and Mastercard acceptance marks for the card option. */
export function CardLogo({ className = "" }: LogoProps) {
  return (
    <span
      className={`inline-flex h-9 w-[6.5rem] min-w-[6.5rem] shrink-0 items-center justify-start gap-2 overflow-visible ${className}`}
      aria-hidden="true"
    >
      <VisaLogo className="!h-5 !max-h-5" />
      <MastercardLogo className="!h-5 !max-h-5" />
    </span>
  );
}

/** Official Apple Pay mark supplied by Apple. */
export function ApplePayLogo({ className = "" }: LogoProps) {
  return (
    <Image
      src="/payment/apple-pay-mark.svg"
      width={166}
      height={106}
      alt="Apple Pay"
      className={`h-8 w-auto shrink-0 object-contain ${className}`}
    />
  );
}

/** Official Google Pay acceptance mark supplied by Google. */
export function GooglePayLogo({ className = "" }: LogoProps) {
  return (
    <Image
      src="/payment/google-pay-mark.svg"
      width={1094}
      height={742}
      alt="Google Pay"
      className={`h-8 w-auto shrink-0 object-contain ${className}`}
    />
  );
}

/** Official PayMe by HSBC logo served from the PayMe website. */
export function PayMeLogo({ className = "" }: LogoProps) {
  return (
    <Image
      src="/payment/payme-logo.png"
      width={198}
      height={45}
      alt="PayMe by HSBC"
      className={`h-7 w-auto shrink-0 object-contain ${className}`}
    />
  );
}

/** Official AlipayHK horizontal acceptance mark. */
export function AlipayHkLogo({ className = "" }: LogoProps) {
  return (
    <Image
      src="/payment/alipayhk-logo.svg"
      width={100}
      height={22}
      alt="AlipayHK"
      className={`h-[1.375rem] w-auto shrink-0 object-contain ${className}`}
    />
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
