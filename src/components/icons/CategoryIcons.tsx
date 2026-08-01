type IconProps = { className?: string };

export function CatIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true" fill="currentColor">
      <path d="M10 14 14 5 18 13Z" />
      <path d="M30 14 26 5 22 13Z" />
      <circle cx="20" cy="22" r="12" />
      <circle cx="15.5" cy="21" r="1.8" fill="var(--category-bg)" />
      <circle cx="24.5" cy="21" r="1.8" fill="var(--category-bg)" />
      <path d="M20 24.5 18.4 26.5 21.6 26.5Z" fill="var(--category-bg)" />
      <g stroke="var(--category-bg)" strokeWidth="1.1" strokeLinecap="round">
        <path d="M9 26h6M9 29h5.3" />
        <path d="M31 26h-6M31 29h-5.3" />
      </g>
    </svg>
  );
}

export function DogIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true" fill="currentColor">
      <path d="M11 12c-5.5-0.5-8 5.6-4.5 10.8L13 19Z" />
      <path d="M29 12c5.5-0.5 8 5.6 4.5 10.8L27 19Z" />
      <circle cx="20" cy="23" r="11" />
      <circle cx="16" cy="22" r="1.7" fill="var(--category-bg)" />
      <circle cx="24" cy="22" r="1.7" fill="var(--category-bg)" />
      <ellipse cx="20" cy="27" rx="2.1" ry="1.5" fill="var(--category-bg)" />
    </svg>
  );
}

export function BoneIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true" fill="currentColor">
      <g transform="rotate(45 20 20)">
        <rect x="14" y="17" width="12" height="6" rx="3" />
        <circle cx="12" cy="16" r="3.2" />
        <circle cx="12" cy="24" r="3.2" />
        <circle cx="28" cy="16" r="3.2" />
        <circle cx="28" cy="24" r="3.2" />
      </g>
    </svg>
  );
}

export function HealthIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <path
        d="M20 30.5C10.5 23.6 6 17.7 6 12.9 6 9 9 6 12.7 6c2.8 0 5.1 1.6 7.3 4.5C22.2 7.6 24.5 6 27.3 6 31 6 34 9 34 12.9c0 4.8-4.5 10.7-14 17.6Z"
        fill="currentColor"
      />
      <rect x="17.4" y="12.5" width="5.2" height="12.5" rx="1.3" fill="var(--category-bg)" />
      <rect x="13" y="16.9" width="14" height="5.2" rx="1.3" fill="var(--category-bg)" />
    </svg>
  );
}

export function CleaningIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true" fill="currentColor">
      <circle cx="15" cy="25" r="7.5" />
      <circle cx="26" cy="18" r="5" />
      <circle cx="28" cy="28" r="3.2" />
      <path d="M14 9 15.4 12.6 19 14 15.4 15.4 14 19 12.6 15.4 9 14 12.6 12.6Z" />
    </svg>
  );
}

export function ClockIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect x="16" y="3" width="8" height="4" rx="2" fill="currentColor" />
      <circle cx="20" cy="22" r="13" fill="currentColor" />
      <path
        d="M20 13v9l6 4"
        stroke="var(--category-bg)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function FireIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <path
        d="M20 3c7 9 10 14.5 10 20.4C30 30.4 25.5 35 20 35S10 30.4 10 23.4C10 17.5 13 12 20 3Z"
        fill="currentColor"
      />
      <path
        d="M20 15c3.4 4.4 5 7.2 5 9.9a5 5 0 0 1-10 0c0-2.7 1.6-5.5 5-9.9Z"
        fill="var(--category-bg)"
        opacity="0.85"
      />
    </svg>
  );
}

export function BagIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <path
        d="M13 14v-2a7 7 0 0 1 14 0v2"
        stroke="currentColor"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M8.5 14h23l-1.8 18a2.2 2.2 0 0 1-2.2 2H12.5a2.2 2.2 0 0 1-2.2-2Z"
        fill="currentColor"
      />
      <circle cx="14.5" cy="18.5" r="1.3" fill="var(--category-bg)" />
      <circle cx="25.5" cy="18.5" r="1.3" fill="var(--category-bg)" />
    </svg>
  );
}
