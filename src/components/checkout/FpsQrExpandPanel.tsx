/**
 * Isolated FPS QR expand panel — the ONLY place that renders the checkout QR.
 * Hardcoded white panel + plain QR asset + single caption.
 * Build marker: fps-qr-hardfix-20260803h
 */
export function FpsQrExpandPanel() {
  return (
    <div
      className="bg-white px-4 py-5"
      style={{ backgroundColor: "#ffffff" }}
      data-fps-qr-panel="hardfix-20260803h"
    >
      <div
        className="mx-auto flex w-full max-w-[16rem] flex-col items-center gap-4 bg-white"
        style={{ backgroundColor: "#ffffff" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- plain QR only, no bank chrome */}
        <img
          src="/images/fps-qr-plain.png?v=hardfix-20260803h"
          alt="轉數快 QR Code"
          width={625}
          height={625}
          className="block h-auto w-full bg-white object-contain"
          style={{ backgroundColor: "#ffffff" }}
        />
        <p className="w-full text-center text-sm font-medium text-neutral-800">
          掃描QR code即可付款
        </p>
      </div>
    </div>
  );
}
