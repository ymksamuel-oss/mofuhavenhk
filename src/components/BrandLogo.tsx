"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

const CHINESE_WORD = ["毛", "毛", "港"] as const;
const ENGLISH_LETTERS = ["M", "o", "f", "u", "H", "a", "v", "e", "n"] as const;
const TARGET_COUNT = CHINESE_WORD.length + ENGLISH_LETTERS.length;

type BrandLogoProps = {
  className?: string;
  title?: string;
  animateOnMount?: boolean;
};

function centerXWithinRail(
  rail: HTMLElement,
  node: HTMLElement | null,
): number | null {
  if (!node) return null;
  const railBox = rail.getBoundingClientRect();
  const nodeBox = node.getBoundingClientRect();
  return nodeBox.left - railBox.left + nodeBox.width / 2;
}

/**
 * Measurable logo layout so the cat-head mark can hop across each character
 * on first header mount: 毛 -> 毛 -> 港 -> M -> o -> f -> u -> H -> a -> v -> e -> n.
 */
export function BrandLogo({
  className = "",
  title = "Mofu Haven",
  animateOnMount = false,
}: BrandLogoProps) {
  const railRef = useRef<HTMLSpanElement>(null);
  const englishWordRef = useRef<HTMLSpanElement>(null);
  const targetRefs = useRef<Array<HTMLSpanElement | null>>(
    Array.from({ length: TARGET_COUNT }, () => null),
  );
  const animationTimersRef = useRef<number[]>([]);
  const hasAnimatedRef = useRef(false);
  const animationFinishedRef = useRef(!animateOnMount);

  const [iconX, setIconX] = useState<number | null>(null);
  const [hopTick, setHopTick] = useState(0);

  useEffect(() => {
    const clearTimers = () => {
      for (const timer of animationTimersRef.current) {
        window.clearTimeout(timer);
      }
      animationTimersRef.current = [];
    };

    const rail = railRef.current;
    const englishWord = englishWordRef.current;
    if (!rail || !englishWord) return clearTimers;

    const targetPositions = targetRefs.current
      .map((node) => centerXWithinRail(rail, node))
      .filter((value): value is number => value !== null);

    if (targetPositions.length === 0) return clearTimers;

    const finalRestX = centerXWithinRail(rail, englishWord);
    if (finalRestX === null) return clearTimers;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (!animateOnMount || reducedMotion) {
      animationFinishedRef.current = true;
      setIconX(finalRestX);
      return clearTimers;
    }

    if (hasAnimatedRef.current) return clearTimers;
    hasAnimatedRef.current = true;

    setIconX(targetPositions[0]);

    const steps = [...targetPositions, finalRestX];
    const stepDurationMs = 220;

    steps.forEach((targetX, index) => {
      const timer = window.setTimeout(() => {
        setIconX(targetX);
        setHopTick((tick) => tick + 1);
        if (index === steps.length - 1) {
          animationFinishedRef.current = true;
        }
      }, index * stepDurationMs);
      animationTimersRef.current.push(timer);
    });

    return clearTimers;
  }, [animateOnMount]);

  useEffect(() => {
    const updateFinalRestPosition = () => {
      if (!animationFinishedRef.current) return;
      const rail = railRef.current;
      const englishWord = englishWordRef.current;
      if (!rail || !englishWord) return;
      const finalRestX = centerXWithinRail(rail, englishWord);
      if (finalRestX === null) return;
      setIconX(finalRestX);
    };

    if (!animateOnMount) {
      updateFinalRestPosition();
    }
    window.addEventListener("resize", updateFinalRestPosition);
    return () => window.removeEventListener("resize", updateFinalRestPosition);
  }, [animateOnMount]);

  let targetIndex = 0;
  const nextTargetRef = () => targetIndex++;

  return (
    <span
      className={`brand-logo inline-flex ${className}`}
      role="img"
      aria-label={title}
    >
      <span ref={railRef} className="brand-logo__rail">
        <span
          aria-hidden="true"
          className={`brand-logo__icon ${
            hopTick % 2 === 0
              ? "brand-logo__icon--hop-a"
              : "brand-logo__icon--hop-b"
          }`}
          style={
            {
              ["--brand-logo-icon-x" as string]:
                iconX !== null ? `${iconX}px` : "0px",
              opacity: iconX === null ? 0 : 1,
            } as CSSProperties
          }
        >
          <svg
            viewBox="0 0 48 44"
            className="brand-logo__icon-svg"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11 18.5L12.8 6.8c0.2-1.3 1.8-2 2.9-1.2l8.3 6.1 8.3-6.1c1.1-0.8 2.7-0.1 2.9 1.2L37 18.5"
              fill="var(--accent)"
            />
            <path
              d="M24 39.2c-9.6 0-17.2-6.5-17.2-15.2 0-8.5 7.2-15.5 17.2-15.5s17.2 7 17.2 15.5c0 8.7-7.6 15.2-17.2 15.2Z"
              fill="var(--accent)"
            />
            <circle cx="18.3" cy="22.5" r="2" fill="#fffaf1" />
            <circle cx="29.7" cy="22.5" r="2" fill="#fffaf1" />
            <circle cx="18.3" cy="22.5" r="0.9" fill="var(--hero-deep)" />
            <circle cx="29.7" cy="22.5" r="0.9" fill="var(--hero-deep)" />
            <path
              d="M24 24.8l-2 2.3h4l-2-2.3Z"
              fill="var(--hero-deep)"
            />
            <path
              d="M20.1 28.8c1.1 1 2.3 1.5 3.9 1.5s2.8-0.5 3.9-1.5"
              fill="none"
              stroke="var(--hero-deep)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </span>

        <span className="brand-logo__copy" aria-hidden="true">
          <span className="brand-logo__group brand-logo__group--zh">
            {CHINESE_WORD.map((char) => {
              const refIndex = nextTargetRef();
              return (
                <span
                  key={`${char}-${refIndex}`}
                  ref={(node) => {
                    targetRefs.current[refIndex] = node;
                  }}
                  className="brand-logo__target"
                >
                  {char}
                </span>
              );
            })}
          </span>
          <span
            ref={englishWordRef}
            className="brand-logo__group brand-logo__group--en"
          >
            {ENGLISH_LETTERS.map((char, index) => {
              const refIndex = nextTargetRef();
              return (
                <span key={`${char}-${refIndex}`} className="brand-logo__latin">
                  {index === 4 ? (
                    <span className="brand-logo__space" aria-hidden="true" />
                  ) : null}
                  <span
                    ref={(node) => {
                      targetRefs.current[refIndex] = node;
                    }}
                    className="brand-logo__target"
                  >
                    {char}
                  </span>
                </span>
              );
            })}
          </span>
        </span>
      </span>
    </span>
  );
}
