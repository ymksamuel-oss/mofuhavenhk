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
  const enGlyphs = [...EN_WORD];

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
      <span className="logo-copy">
        <span className="logo-copy-line">
          <span className="logo-cat-head logo-mark" aria-hidden="true">
            <span className="logo-cat-ear logo-cat-ear-left" />
            <span className="logo-cat-ear logo-cat-ear-right" />
            <span className="logo-cat-face" />
          </span>
          {zhGlyphs.map((char, index) => (
            <span
              key={`zh-${char}-${index}`}
              className="logo-letter logo-letter-zh"
              style={{ ["--i" as string]: index }}
            >
              {char}
            </span>
          ))}
        </span>
        <span className="logo-copy-line logo-copy-line-en">
          {enGlyphs.map((char, index) => (
            <span
              key={`en-${char}-${index}`}
              className={`logo-letter ${char === " " ? "logo-space" : "logo-letter-en"}`}
              style={{ ["--i" as string]: index + zhGlyphs.length + 1 }}
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </span>
      </span>
    </span>
  );
}
