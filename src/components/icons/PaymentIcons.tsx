import Image from "next/image";

/** Shared 24px height for all payment marks */
const ICON_H = 24;

export function OctopusLogo({ className = "" }: { className?: string }) {
  return (
    <Image
      src="/icons/octopus.svg"
      alt="Octopus"
      width={48}
      height={ICON_H}
      className={`h-6 w-auto ${className}`}
      unoptimized
    />
  );
}

export function FpsLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 24"
      height={ICON_H}
      className={`h-6 w-auto ${className}`}
      aria-label="FPS"
      role="img"
    >
      <rect width="48" height="24" rx="3" fill="#7B2D8E" />
      <text
        x="24"
        y="16"
        textAnchor="middle"
        fill="#fff"
        fontSize="11"
        fontFamily="Arial, sans-serif"
        fontWeight="700"
      >
        FPS
      </text>
    </svg>
  );
}

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

export function PayMeLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 24"
      height={ICON_H}
      className={`h-6 w-auto ${className}`}
      aria-label="PayMe"
      role="img"
    >
      <rect width="48" height="24" rx="3" fill="#E60012" />
      <text
        x="24"
        y="16"
        textAnchor="middle"
        fill="#fff"
        fontSize="10"
        fontFamily="Arial, sans-serif"
        fontWeight="700"
      >
        PayMe
      </text>
    </svg>
  );
}
