"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { TranslationKey } from "@/lib/i18n/translations";

type AccountAuthCardProps = {
  titleKey: TranslationKey;
  descriptionKey?: TranslationKey;
  children: ReactNode;
};

export function AccountAuthCard({ titleKey, descriptionKey, children }: AccountAuthCardProps) {
  const { t } = useI18n();

  return (
    <main className="mx-auto flex min-h-[65vh] w-full max-w-xl items-center px-4 py-8 sm:px-6 sm:py-12">
      <section className="milk-tea-card w-full space-y-5 p-5 sm:p-8">
        <div className="space-y-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">{t("accountMemberEyebrow")}</p>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[color:var(--ink)] sm:text-3xl">{t(titleKey)}</h1>
          {descriptionKey ? <p className="text-sm leading-6 text-[color:var(--muted)]">{t(descriptionKey)}</p> : null}
        </div>
        {children}
        <p className="text-center text-xs text-[color:var(--muted)]"><Link href="/" className="underline underline-offset-4">{t("accountBackHome")}</Link></p>
      </section>
    </main>
  );
}

export function AccountAuthMessage({ messageKey }: { messageKey: TranslationKey }) {
  const { t } = useI18n();
  return <p role="alert" className="rounded-xl bg-amber-50 px-3.5 py-3 text-sm text-amber-900">{t(messageKey)}</p>;
}

export function AccountAuthLink({ href, labelKey }: { href: string; labelKey: TranslationKey }) {
  const { t } = useI18n();
  return <Link href={href} className="font-medium text-[color:var(--accent)] underline-offset-4 hover:underline">{t(labelKey)}</Link>;
}
