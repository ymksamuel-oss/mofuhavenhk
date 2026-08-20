type LogoProps = { className?: string };

export function VisaLogo({ className = "" }: LogoProps) {
  return (
    <img
      src="/payment/visa-brandmark-blue.png"
      alt="Visa"
      className={`h-5 w-auto object-contain ${className}`}
    />
  );
}

export function MastercardLogo({ className = "" }: LogoProps) {
  return (
    <img
      src="/payment/mastercard-symbol.png"
      alt="Mastercard"
      className={`h-5 w-auto object-contain ${className}`}
    />
  );
}

export function ApplePayLogo({ className = "" }: LogoProps) {
  return (
    <span className={`inline-flex items-center text-xs font-semibold ${className}`}>
      Apple Pay
    </span>
  );
}

export function WeChatPayLogo({ className = "" }: LogoProps) {
  return (
    <img
      src="/payment/wechat-pay-logo.png"
      alt="WeChat Pay"
      className={`h-5 w-auto object-contain ${className}`}
    />
  );
}

export function AlipayHkLogo({ className = "" }: LogoProps) {
  return (
    <img
      src="/payment/alipayhk-logo.svg"
      alt="AlipayHK"
      className={`h-5 w-auto object-contain ${className}`}
    />
  );
}
