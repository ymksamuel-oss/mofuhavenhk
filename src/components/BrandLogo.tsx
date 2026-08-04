"use client";

import { useState } from "react";

const WORD = "Mofu Haven";

type BrandLogoProps = {
  className?: string;
  title?: string;
};

/**
 * Interactive SVG wordmark for the header. Each glyph is a separate
 * `<tspan>` so hover / click can run a staggered wave animation.
 *
 * Note: If you have a custom logo SVG, replace the markup inside
 * `.brand-logo` — keep the `logo-letter` class + `--i` index for the wave.
 */
export function BrandLogo({
  className = "",
  title = "Mofu Haven",
}: BrandLogoProps) {
  const [waving, setWaving] = useState(false);

  const triggerWave = () => {
    setWaving(false);
    // Restart CSS animation by reflowing the class.
    requestAnimationFrame(() => setWaving(true));
    window.setTimeout(() => setWaving(false), 900);
  };

  return (
    <span
      className={`brand-logo inline-flex items-center ${waving ? "is-waving" : ""} ${className}`}
      onMouseEnter={triggerWave}
      onClick={triggerWave}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          triggerWave();
        }
      }}
    >
      <svg
        className="h-8 w-auto"
        viewBox="0 0 168 28"
        role="img"
        aria-label={title}
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>{title}</title>
        {/* Soft accent mark — small paw / blob beside the wordmark */}
        <g className="logo-mark" aria-hidden="true">
          <circle cx="10" cy="14" r="7" fill="var(--accent)" />
          <circle cx="5.5" cy="8.5" r="2.2" fill="var(--accent)" />
          <circle cx="14.5" cy="8.5" r="2.2" fill="var(--accent)" />
          <circle cx="3.8" cy="13.5" r="1.8" fill="var(--accent)" />
          <circle cx="16.2" cy="13.5" r="1.8" fill="var(--accent)" />
        </g>
        <text
          x="24"
          y="20"
          fill="var(--ink)"
          fontFamily="var(--font-display), 'Noto Sans HK', -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
          fontSize="18"
          fontWeight="600"
          letterSpacing="0.02em"
        >
          {WORD.split("").map((char, index) => (
            <tspan
              key={`${char}-${index}`}
              className="logo-letter"
              style={{ ["--i" as string]: index }}
              dx={index === 0 ? 0 : char === " " ? 5 : 0.2}
            >
              {char === " " ? "\u00A0" : char}
            </tspan>
          ))}
        </text>
      </svg>
    </span>
  );
}
