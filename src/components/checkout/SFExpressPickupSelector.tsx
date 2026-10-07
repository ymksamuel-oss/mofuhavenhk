"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import {
  SF_PICKUP_POINTS,
  findSfPickupPointByCode,
  getSfPickupSearchText,
  getSfSearchTokens,
  type SfPickupPoint,
  type SfPickupRegion,
  type SfPickupType,
} from "@/lib/sf-pickup-points";

type SFExpressPickupSelectorProps = {
  selectedCode: string;
  disabled?: boolean;
  onSelect: (point: SfPickupPoint) => void;
  onClearSelection: () => void;
};

const REGIONS: Array<{ value: SfPickupRegion; labelKey: string }> = [
  { value: "hong-kong-island", labelKey: "sfPickupRegionHongKongIsland" },
  { value: "kowloon", labelKey: "sfPickupRegionKowloon" },
  { value: "new-territories", labelKey: "sfPickupRegionNewTerritories" },
  { value: "outlying-islands", labelKey: "sfPickupRegionOutlyingIslands" },
];

const TYPES: Array<{ value: SfPickupType; labelKey: string }> = [
  { value: "station", labelKey: "sfPickupTypeStation" },
  { value: "locker", labelKey: "sfPickupTypeLocker" },
  { value: "partner", labelKey: "sfPickupTypePartner" },
];

export function SFExpressPickupSelector({
  selectedCode,
  disabled = false,
  onSelect,
  onClearSelection,
}: SFExpressPickupSelectorProps) {
  const { locale, t } = useI18n();
  const initialPoint = findSfPickupPointByCode(selectedCode);
  const [region, setRegion] = useState<SfPickupRegion | "">(
    initialPoint?.region ?? "",
  );
  const [type, setType] = useState<SfPickupType | "">(
    initialPoint?.type ?? "",
  );
  const [query, setQuery] = useState("");
  const selectedPoint = findSfPickupPointByCode(selectedCode);
  const searchTokens = getSfSearchTokens(query);
  const hasActiveSearch = searchTokens.length > 0;
  const hasEnoughToSearch = Boolean(region && type) || hasActiveSearch;
  const showResults = hasEnoughToSearch && (!selectedPoint || hasActiveSearch);

  const results = useMemo(() => {
    if (!hasEnoughToSearch) return [];
    return SF_PICKUP_POINTS
      .filter((point) => {
      // While the customer is actively searching, search the complete point
      // directory. This prevents a previously selected broad region filter
      // from hiding a valid Sha Tin / Ma On Shan result.
      if (!hasActiveSearch && region && point.region !== region) return false;
      if (type && point.type !== type) return false;
      if (!hasActiveSearch) return true;
      const searchable = getSfPickupSearchText(point);
      return searchTokens.every((token) => searchable.includes(token));
      })
      .sort((left, right) => {
        if (!hasActiveSearch) return 0;
        const leftText = getSfPickupSearchText(left);
        const rightText = getSfPickupSearchText(right);
        const leftExact = searchTokens.reduce((score, token) => score + (left.code.toLocaleLowerCase() === token ? 4 : leftText.startsWith(token) ? 2 : 0), 0);
        const rightExact = searchTokens.reduce((score, token) => score + (right.code.toLocaleLowerCase() === token ? 4 : rightText.startsWith(token) ? 2 : 0), 0);
        return rightExact - leftExact;
      })
      .slice(0, 12);
  }, [hasActiveSearch, hasEnoughToSearch, region, searchTokens, type]);

  const changeFilter = (callback: () => void) => {
    if (selectedCode) onClearSelection();
    callback();
  };

  const selectClassName =
    "min-h-12 w-full rounded-xl border border-[color:var(--line)] bg-white px-3.5 py-3 text-base text-[color:var(--ink)] outline-none focus:border-[color:var(--accent)] disabled:opacity-60 sm:text-sm";

  return (
    <div className="space-y-3 rounded-2xl border border-[color:var(--line)] bg-[color:var(--background)] p-3 sm:p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label htmlFor="sf-pickup-region" className="block space-y-1.5">
          <span className="text-sm font-medium text-[color:var(--ink)]">
            {t("sfPickupRegionLabel")}
          </span>
          <select
            id="sf-pickup-region"
            value={region}
            disabled={disabled}
            onChange={(event) =>
              changeFilter(() =>
                setRegion(event.target.value as SfPickupRegion | ""),
              )
            }
            className={selectClassName}
          >
            <option value="">{t("sfPickupRegionPlaceholder")}</option>
            {REGIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {t(option.labelKey as never)}
              </option>
            ))}
          </select>
        </label>

        <label htmlFor="sf-pickup-type" className="block space-y-1.5">
          <span className="text-sm font-medium text-[color:var(--ink)]">
            {t("sfPickupTypeLabel")}
          </span>
          <select
            id="sf-pickup-type"
            value={type}
            disabled={disabled}
            onChange={(event) =>
              changeFilter(() => setType(event.target.value as SfPickupType | ""))
            }
            className={selectClassName}
          >
            <option value="">{t("sfPickupTypePlaceholder")}</option>
            {TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {t(option.labelKey as never)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label htmlFor="sf-pickup-search" className="block space-y-1.5">
        <span className="text-sm font-medium text-[color:var(--ink)]">
          {t("sfPickupSearchLabel")}
        </span>
        <input
          id="sf-pickup-search"
          type="search"
          value={query}
          disabled={disabled}
          onChange={(event) =>
            changeFilter(() => setQuery(event.target.value.slice(0, 80)))
          }
          placeholder={t("sfPickupSearchPlaceholder")}
          autoComplete="off"
          className="min-h-12 w-full rounded-xl border border-[color:var(--line)] bg-white px-3.5 py-3 text-base text-[color:var(--ink)] outline-none placeholder:text-[color:var(--muted)] focus:border-[color:var(--accent)] disabled:opacity-60 sm:text-sm"
        />
      </label>

      {selectedPoint ? (
        <div className="rounded-xl border border-[color:var(--accent)] bg-white p-3" aria-live="polite">
          <p className="text-xs font-bold uppercase tracking-wide text-[color:var(--muted)]">
            {t("sfPickupSelected")}
          </p>
          <p className="mt-1 text-sm font-semibold text-[color:var(--ink)]">
            {selectedPoint.area} · {selectedPoint.name}
          </p>
          <p className="mt-1 font-mono text-xs font-bold text-[color:var(--ink)]">
            {selectedPoint.code}
          </p>
          <p className="mt-1 break-words text-sm leading-5 text-[color:var(--muted)]">
            {selectedPoint.address}
          </p>
          {selectedPoint.note ? (
            <p className="mt-2 rounded-lg bg-amber-50 px-2.5 py-2 text-xs leading-5 text-amber-900">
              {t("sfPickupRemoteFeeNotice")}
            </p>
          ) : null}
        </div>
      ) : null}

      {showResults ? (
        results.length ? (
          <div className="max-h-64 space-y-2 overflow-y-auto overscroll-contain pr-1" aria-label={t("sfPickupSearchLabel")}>
            {results.map((point) => (
              <button
                key={`${point.type}:${point.code}`}
                type="button"
                disabled={disabled}
                onClick={() => {
                  onSelect(point);
                  setQuery("");
                }}
                aria-pressed={selectedCode === point.code}
                className={`min-h-[4.25rem] w-full rounded-xl border bg-white px-3 py-2.5 text-left transition disabled:opacity-60 ${
                  selectedCode === point.code
                    ? "border-[color:var(--accent)] ring-1 ring-[color:var(--accent)]"
                    : "border-[color:var(--line)] hover:border-stone-400"
                }`}
              >
                <span className="flex items-start justify-between gap-2">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-[color:var(--ink)]">
                      {point.area} · {point.name}
                    </span>
                    <span className="mt-0.5 block break-words text-xs leading-4 text-[color:var(--muted)]">
                      {point.address}
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-xs font-bold text-[color:var(--ink)]">
                    {point.code}
                  </span>
                </span>
                {point.note ? (
                  <span className="mt-1 block text-xs font-medium text-amber-800">
                    {locale === "en"
                      ? "Remote-area surcharge may apply"
                      : "可能收取偏遠自取附加費"}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        ) : (
          <p className="rounded-xl bg-white px-3 py-3 text-sm text-[color:var(--muted)]">
            {t("sfPickupNoResults")}
          </p>
        )
      ) : (
        <p className="rounded-xl bg-white px-3 py-3 text-sm leading-5 text-[color:var(--muted)]">
          {t("sfPickupSelectHint")}
        </p>
      )}
    </div>
  );
}
