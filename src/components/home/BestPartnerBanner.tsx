import Link from "next/link";

export function BestPartnerBanner() {
  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <Link href="/categories/dogs" className="block overflow-hidden rounded-2xl shadow-sm transition hover:opacity-95">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/best-partner-banner.jpg"
          alt="Best Partner \u56fd\u7523 \u7121\u6dfb\u52a0 \u7121\u7740\u8272"
          className="block h-auto w-full"
        />
      </Link>
    </div>
  );
}
