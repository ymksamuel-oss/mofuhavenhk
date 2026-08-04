"use client";

import { useState } from "react";

const ZH_WORD = "毛毛港";
const EN_WORD = "Mofu Haven";

type BrandLogoProps = {
  className?: string;
  title?: string;
};

/**
 * Interactive bilingual wordmark for the header / footer / info pages.
 * A tiny cat mascot "walks" the letters by staggering each glyph bounce.
 */
export function BrandLogo({
  className = "",
  title = "毛毛港 Mofu Haven",
}: BrandLogoProps) {
  const [waving, setWaving] = useState(false);
  const zhGlyphs = [...ZH_WORD];

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
      role="img"
      aria-label={title}
    >
      <span className="logo-copy logo-text">
        <span className="logo-cat-row" aria-hidden="true">
          <span className="logo-cat-emoji logo-mark" role="presentation">
            🐱
          </span>
        </span>
        <span className="logo-copy-line logo-copy-line-main">
          {zhGlyphs.map((char, index) => (
            <span
              key={`zh-${char}-${index}`}
              className="logo-letter logo-letter-zh"
              style={{ ["--i" as string]: index }}
            >
              {char}
            </span>
          ))}
          <span className="logo-letter-en">{EN_WORD}</span>
        </span>
      </span>
    </span>
  );
}
