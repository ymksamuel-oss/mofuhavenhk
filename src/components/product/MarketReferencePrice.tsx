"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";
import { formatMoney } from "@/lib/i18n/translations";

type MarketReferencePriceProps = {
  price?: number;
  asOf?: string;
  compact?: boolean;
  className?: string;
};

/**
 * Displays an external same-spec market reference. This intentionally uses a
 * neutral information treatment rather than a strikethrough or discount badge,
 * which remain reserved for verified Mofu Haven original prices.
 */
export function MarketReferencePrice({
  price,
  asOf,
  compact = false,
  className = "",
}: MarketReferencePriceProps) {
  const { locale, t } = useI18n();
  if (!price) return null;

  const hint = asOf
    ? t("productMarketReferenceHint").replace("{date}", asOf)
    : t("productMarketReferenceNeutral");

  return (
    <p
      className={`flex flex-wrap items-baseline gap-x-1.5 text-[10px] leading-relaxed text-[color:var(--muted)] ${className}`}
      title={hint}
    >
      <span className={`font-semibold tracking-wide text-[color:var(--accent)] ${compact ? "" : "uppercase"}`}>
        {t("productMarketReferencePrice")}
      </span>
      <span className="tabular-nums">{formatMoney(price, locale)}</span>
      {!compact && asOf ? <span className="opacity-80">· {asOf}</span> : null}
    </p>
  );
}
