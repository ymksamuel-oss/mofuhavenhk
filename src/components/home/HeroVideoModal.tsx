"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "@/lib/i18n/I18nProvider";

export function HeroVideoModal() {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const closeModal = useCallback(() => {
    const video = videoRef.current;

    if (video) {
      video.pause();
      video.currentTime = 0;
    }

    setIsOpen(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    void videoRef.current?.play().catch(() => undefined);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [closeModal, isOpen]);

  return (
    <>
      {/* @section: hero-video-trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(true)}
        className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/70 bg-black/25 px-5 py-3.5 text-sm font-semibold text-white shadow-[0_16px_32px_-14px_rgba(0,0,0,0.55)] backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white hover:text-[color:var(--hero-deep)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--hero-deep)]"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls="hero-video-dialog"
      >
        <span
          aria-hidden
          className="text-xs transition-transform group-hover:scale-110"
        >
          ▶
        </span>
        <span>{t("homeVideoTrigger")}</span>
      </button>

      {/* @section: hero-video-dialog */}
      {isOpen &&
        createPortal(
          <div
            id="hero-video-dialog"
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="hero-video-title"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeModal();
            }}
          >
            <div className="relative inline-flex max-h-[88dvh] max-w-[92vw] flex-col overflow-hidden rounded-[1.75rem] bg-black shadow-[0_30px_80px_rgba(0,0,0,0.55)] ring-1 ring-white/20">
              <h2 id="hero-video-title" className="sr-only">
                {t("homeVideoTitle")}
              </h2>

              <button
                ref={closeButtonRef}
                type="button"
                onClick={closeModal}
                className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/65 text-2xl leading-none text-white shadow-lg transition hover:bg-black/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label={t("homeVideoClose")}
              >
                ×
              </button>

              <video
                ref={videoRef}
                className="block aspect-square h-auto max-h-[88dvh] w-auto max-w-[92vw] bg-black object-contain"
                controls
                autoPlay
                playsInline
                preload="metadata"
                poster="/video/hero-short-poster.jpg"
                aria-label={t("homeVideoPlayerLabel")}
              >
                <source src="/video/hero-short.mp4" type="video/mp4" />
                {t("homeVideoUnsupported")}
              </video>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
