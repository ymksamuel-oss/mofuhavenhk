"use client";

import Image from "next/image";
import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import {
  AlipayHkLogo,
  ApplePayLogo,
  GooglePayLogo,
  MastercardLogo,
  PayMeLogo,
  VisaLogo,
  WhatsAppLogo,
} from "@/components/icons/PaymentIcons";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { TranslationKey } from "@/lib/i18n/translations";
import { getShopWhatsAppChatUrl } from "@/lib/whatsapp";

const SHOP_EMAIL =
  process.env.NEXT_PUBLIC_SHOP_EMAIL?.trim() || "MofuHavenHK@gmail.com";

type FooterLink = { href: string; labelKey: TranslationKey };

const QUICK_LINKS: FooterLink[] = [
  { href: "/menu", labelKey: "footerShopAll" },
  { href: "/about", labelKey: "footerAbout" },
  { href: "/faq", labelKey: "footerFaq" },
];

const POLICY_LINKS: FooterLink[] = [
  { href: "/shipping-policy", labelKey: "footerShipping" },
  { href: "/returns", labelKey: "footerReturns" },
  { href: "/terms", labelKey: "footerTerms" },
];

function LinkList({ links }: { links: FooterLink[] }) {
  const { t } = useI18n();
  return (
    <ul className="space-y-2.5">
      {links.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className="text-sm leading-relaxed tracking-[0.01em] text-[#62493b] transition hover:text-[#7b4f37]"
          >
            {t(link.labelKey)}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function FooterNavColumn({
  title,
  links,
}: {
  title: string;
  links: FooterLink[];
}) {
  return (
    <div>
      {/* Desktop: always-visible column */}
      <div className="hidden md:block">
        <p className="mb-3 font-[family-name:var(--font-display)] text-sm font-semibold tracking-[0.01em] text-[#4b352a]">
          {title}
        </p>
        <LinkList links={links} />
      </div>

      {/* Mobile: accordion */}
      <details className="group border-b border-[#c69e78] md:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between py-3.5 font-[family-name:var(--font-display)] text-sm font-semibold tracking-[0.01em] text-[#4b352a] [&::-webkit-details-marker]:hidden">
          <span>{title}</span>
          <span
            aria-hidden
            className="text-[#76533d] transition duration-200 group-open:rotate-180"
          >
            ▾
          </span>
        </summary>
        <div className="pb-4">
          <LinkList links={links} />
        </div>
      </details>
    </div>
  );
}

/** Five locally hosted payment marks without decorative frames. */
function FacebookLogo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="#1877F2" />
      <path
        fill="#fff"
        d="M13.5 20v-7h2.35l.35-2.73H13.5V8.53c0-.79.22-1.33 1.36-1.33h1.45V4.76c-.25-.03-1.1-.11-2.1-.11-2.07 0-3.49 1.26-3.49 3.58v2.04H8.38V13h2.34v7h2.78Z"
      />
    </svg>
  );
}

function InstagramLogo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="footer-instagram-gradient" x1="2" x2="22" y1="22" y2="2" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FEDA75" />
          <stop offset="0.38" stopColor="#FA7E1E" />
          <stop offset="0.67" stopColor="#D62976" />
          <stop offset="1" stopColor="#4F5BD5" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="12" fill="url(#footer-instagram-gradient)" />
      <rect x="6.3" y="6.3" width="11.4" height="11.4" rx="3.2" fill="none" stroke="#fff" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="2.7" fill="none" stroke="#fff" strokeWidth="1.6" />
      <circle cx="15.85" cy="8.35" r="0.9" fill="#fff" />
    </svg>
  );
}

function PaymentMarks() {
  const markClassName =
    "flex h-8 w-[6.25rem] shrink-0 items-center justify-center px-1 py-1 sm:w-[6.75rem]";

  return (
    <ul className="flex w-full max-w-full flex-wrap items-center justify-center gap-x-2 gap-y-2 py-2 sm:w-auto sm:justify-end sm:gap-x-3">
      <li className={markClassName}>
        <ApplePayLogo className="!h-6 !w-auto" />
      </li>
      <li className={markClassName}>
        <GooglePayLogo className="!h-6 !w-auto" />
      </li>
      <li className={markClassName}>
        <PayMeLogo className="!h-6 !w-auto" />
      </li>
      <li className={markClassName}>
        <AlipayHkLogo className="!h-5 !w-auto" />
      </li>
      <li className={markClassName}>
        <VisaLogo className="!h-5 !w-auto" />
      </li>
      <li className={markClassName}>
        <MastercardLogo className="!h-8 !w-auto sm:!h-9" />
      </li>
    </ul>
  );
}

/**
 * Site-wide footer — milk-tea palette, 4 columns on desktop,
 * accordion sections on mobile. Payment marks match the checkout allowlist.
 */
export function Footer() {
  const { t } = useI18n();
  const waUrl = getShopWhatsAppChatUrl(
    `${t("brand")} — ${t("footerWhatsapp")}`,
  );

  return (
    <footer id="site-footer-root"
      className="mt-2 border-t border-[#c69e78] bg-[#e8c9a9] text-[#4b352a]"
      aria-labelledby="site-footer-heading"
    >
      <h2 id="site-footer-heading" className="sr-only">
        {t("brand")}
      </h2>

      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="grid gap-1 md:grid-cols-4 md:gap-8 lg:gap-10">
          {/* Brand */}
          <div className="space-y-3 border-b border-[#c69e78] pb-6 md:border-0 md:pb-0">
            <Link
              href="/"
              className="brand-logo-link inline-flex rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2"
              aria-label={t("brand")}
            >
              <BrandLogo
                title={t("brand")}
                className="h-24 sm:h-28"
              />
            </Link>
            <p className="max-w-xs text-sm leading-relaxed tracking-[0.01em] text-[#62493b]">
              {t("footerTagline")}
            </p>
          </div>

          <FooterNavColumn title={t("footerQuickLinks")} links={QUICK_LINKS} />
          <FooterNavColumn title={t("footerPolicies")} links={POLICY_LINKS} />

          {/* Contact */}
          <div>
            <div className="hidden md:block">
              <p className="mb-3 font-[family-name:var(--font-display)] text-sm font-semibold tracking-[0.01em] text-[#4b352a]">
                {t("footerContact")}
              </p>
              <ContactBlock waUrl={waUrl} email={SHOP_EMAIL} />
            </div>

            <details className="group border-b border-[#c69e78] md:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between py-3.5 font-[family-name:var(--font-display)] text-sm font-semibold tracking-[0.01em] text-[#4b352a] [&::-webkit-details-marker]:hidden">
                <span>{t("footerContact")}</span>
                <span
                  aria-hidden
                  className="text-[#76533d] transition duration-200 group-open:rotate-180"
                >
                  ▾
                </span>
              </summary>
              <div className="pb-4">
                <ContactBlock waUrl={waUrl} email={SHOP_EMAIL} />
              </div>
            </details>
          </div>
        </div>
      </div>

      <div className="border-t border-[#c69e78] bg-[#ddb88f]/45">
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
          <nav
            aria-label="Social media"
            className="flex items-center justify-center gap-3 py-4"
          >
            <a
              href="https://www.facebook.com/profile.php?id=61593577262255"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7b4f37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#ddb88f]/45 sm:h-9 sm:w-9"
              aria-label="Facebook"
              title="Facebook"
            >
              <FacebookLogo className="h-full w-full" />
            </a>
            <a
              href="https://www.instagram.com/mofuhaven?igsh=MWR2MnJwZ2N5b2p2Zg%3D%3D&utm_source=qr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7b4f37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#ddb88f]/45 sm:h-9 sm:w-9"
              aria-label="Instagram"
              title="Instagram"
            >
              <InstagramLogo className="h-full w-full" />
            </a>
            <a
              href={waUrl ?? "https://wa.me/85298646585"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7b4f37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#ddb88f]/45 sm:h-9 sm:w-9"
              aria-label={t("footerWhatsapp")}
              title={t("footerWhatsapp")}
            >
              <WhatsAppLogo className="h-full w-full" />
            </a>
          </nav>

          <div className="footer-payment-safe-area flex w-full flex-col items-center gap-3 border-t border-[#c69e78] pt-3 sm:flex-row sm:justify-between sm:gap-4 sm:py-3.5">
            <p className="text-center text-xs tracking-[0.01em] text-[#62493b] sm:text-left">
              {t("footerCopyright")}
            </p>
            <div
              className="w-full max-w-full sm:w-auto"
              aria-label={t("footerPayments")}
            >
              <PaymentMarks />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function ContactBlock({
  waUrl,
  email,
}: {
  waUrl: string | null;
  email: string;
}) {
  const { t } = useI18n();

  return (
    <ul className="space-y-3">
      <li className="flex items-center gap-2 pb-1">
        <span className="relative h-9 w-12 shrink-0 overflow-hidden rounded-lg bg-[#f5e9dc]/70">
          <Image src="/images/mofu-visuals/icons/support.jpg" alt="" fill sizes="48px" className="object-cover" />
        </span>
        <span className="text-xs font-medium tracking-[0.04em] text-[#72533f]">{t("footerContact")}</span>
      </li>
      <li>
        {waUrl ? (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm tracking-[0.01em] text-[#62493b] transition hover:text-[#7b4f37]"
          >
            <WhatsAppLogo />
            <span>{t("footerWhatsapp")}</span>
          </a>
        ) : (
          <span className="text-sm text-[#62493b]">
            {t("footerWhatsapp")}
          </span>
        )}
      </li>
      <li className="text-sm leading-relaxed tracking-[0.01em] text-[#62493b]">
        <span className="mb-0.5 block text-[11px] font-medium uppercase tracking-[0.06em] text-[#72533f]">
          {t("footerEmail")}
        </span>
        <a
          href={`mailto:${email}`}
          className="transition hover:text-[color:var(--accent)]"
        >
          {email}
        </a>
      </li>
      <li className="text-sm leading-relaxed tracking-[0.01em] text-[#62493b]">
        <span className="mb-0.5 block text-[11px] font-medium uppercase tracking-[0.06em] text-[#72533f]">
          {t("footerHoursLabel")}
        </span>
        {t("footerHours")}
      </li>
    </ul>
  );
}
