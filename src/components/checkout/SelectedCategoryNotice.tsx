"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { getCategoryLabelKey } from "@/lib/categories";

function SelectedCategoryNoticeInner() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const labelKey = getCategoryLabelKey(searchParams.get("category"));

  if (!labelKey) return null;

  return (
    <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[color:var(--accent-soft)] px-3 py-1 text-xs font-medium text-[color:var(--accent)]">
      {t("categorySelectedPrefix")} {t(labelKey)}
    </p>
  );
}

export function SelectedCategoryNotice() {
  return (
    <Suspense fallback={null}>
      <SelectedCategoryNoticeInner />
    </Suspense>
  );
}
