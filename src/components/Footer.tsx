"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import {
  AlipayHkLogo,
  ApplePayLogo,
  MastercardLogo,
  VisaLogo,
  WeChatPayLogo,
  WhatsAppLogo,
} from "@/components/icons/PaymentIcons";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { TranslationKey } from "@/lib/i18n/translations";
import { getShopWhatsAppChatUrl } from "@/lib/whatsapp";

const SHOP_EMAIL =
  process.env.NEXT_PUBLIC_SHOP_EMAIL?.trim() || "hello@mofuhavenhk.com";

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
            className="text-sm leading-relaxed tracking-[0.01em] text-[#756962] transition hover:text-[color:var(--accent)]"
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
        <p className="mb-3 font-[family-name:var(--font-display)] text-sm font-semibold tracking-[0.01em] text-[#F5EBE6]">
          {title}
        </p>
        <LinkList links={links} />
      </div>

      {/* Mobile: accordion */}
      <details className="group border-b border-[#524c46] md:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between py-3.5 font-[family-name:var(--font-display)] text-sm font-semibold tracking-[0.01em] text-[#F5EBE6] [&::-webkit-details-marker]:hidden">
          <span>{title}</span>
          <span
            aria-hidden
            className="text-[#756962] transition duration-200 group-open:rotate-180"
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
function PaymentMarks() {
  const markClassName =
    "flex min-w-0 items-center justify-center px-1 py-1 sm:px-1.5";

  return (
    <ul className="flex w-full max-w-full flex-wrap items-center justify-center gap-x-4 gap-y-3 py-2 sm:w-auto sm:justify-end sm:gap-x-5">
      <li className={markClassName}>
        <ApplePayLogo className="h-5 w-auto" />
      </li>
      <li className={markClassName}>
        <WeChatPayLogo className="!h-[1.125rem] max-w-full !w-auto sm:!h-5" />
      </li>
      <li className={markClassName}>
        <AlipayHkLogo className="!h-[1.125rem] max-w-full !w-auto sm:!h-5" />
      </li>
      <li className={markClassName}>
        <VisaLogo className="!h-5 w-auto" />
      </li>
      <li className={markClassName}>
        <MastercardLogo className="!h-5 w-auto" />
      </li>
    </ul>
  );
}

/**
 * Site-wide footer — milk-tea palette, 4 columns on desktop,
 * accordion sections on mobile. No Google Pay marks.
 */
export function Footer() {
  const { t } = useI18n();
  const waUrl = getShopWhatsAppChatUrl(
    `${t("brand")} — ${t("footerWhatsapp")}`,
  );

  return (
    <footer
      className="mt-2 border-t border-[#4d4843] bg-[#3C3834] text-[#F5EBE6]"
      aria-labelledby="site-footer-heading"
    >
      <h2 id="site-footer-heading" className="sr-only">
        {t("brand")}
      </h2>

      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="grid gap-1 md:grid-cols-4 md:gap-8 lg:gap-10">
          {/* Brand */}
          <div className="space-y-3 border-b border-[#524c46] pb-6 md:border-0 md:pb-0">
            <Link
              href="/"
              className="brand-logo-link inline-flex rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2"
              aria-label={t("brand")}
            >
              <BrandLogo
                title={t("brand")}
                className="text-[0.95rem] sm:text-[1.05rem]"
              />
            </Link>
            <p className="max-w-xs text-sm leading-relaxed tracking-[0.01em] text-[#756962]">
              {t("footerTagline")}
            </p>
          </div>

          <FooterNavColumn title={t("footerQuickLinks")} links={QUICK_LINKS} />
          <FooterNavColumn title={t("footerPolicies")} links={POLICY_LINKS} />

          {/* Contact */}
          <div>
            <div className="hidden md:block">
              <p className="mb-3 font-[family-name:var(--font-display)] text-sm font-semibold tracking-[0.01em] text-[#F5EBE6]">
                {t("footerContact")}
              </p>
              <ContactBlock waUrl={waUrl} email={SHOP_EMAIL} />
            </div>

            <details className="group border-b border-[#524c46] md:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between py-3.5 font-[family-name:var(--font-display)] text-sm font-semibold tracking-[0.01em] text-[#F5EBE6] [&::-webkit-details-marker]:hidden">
                <span>{t("footerContact")}</span>
                <span
                  aria-hidden
                  className="text-[#756962] transition duration-200 group-open:rotate-180"
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

      <div className="border-t border-[#524c46]/80 bg-[color:var(--hero-deep)]/8">
        <div className="footer-payment-safe-area mx-auto flex w-full max-w-5xl flex-col items-center gap-3 px-4 pt-4 sm:flex-row sm:justify-between sm:gap-4 sm:px-6 sm:py-3.5">
          <p className="text-center text-xs tracking-[0.01em] text-[#756962] sm:text-left">
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
      <li>
        {waUrl ? (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm tracking-[0.01em] text-[#756962] transition hover:text-[color:var(--accent)]"
          >
            <WhatsAppLogo />
            <span>{t("footerWhatsapp")}</span>
          </a>
        ) : (
          <span className="text-sm text-[#756962]">
            {t("footerWhatsapp")}
          </span>
        )}
      </li>
      <li className="text-sm leading-relaxed tracking-[0.01em] text-[#756962]">
        <span className="mb-0.5 block text-[11px] font-medium uppercase tracking-[0.06em] text-[#F5EBE6]/70">
          {t("footerEmail")}
        </span>
        <a
          href={`mailto:${email}`}
          className="transition hover:text-[color:var(--accent)]"
        >
          {email}
        </a>
      </li>
      <li className="text-sm leading-relaxed tracking-[0.01em] text-[#756962]">
        <span className="mb-0.5 block text-[11px] font-medium uppercase tracking-[0.06em] text-[#F5EBE6]/70">
          {t("footerHoursLabel")}
        </span>
        {t("footerHours")}
      </li>
    </ul>
  );
}
