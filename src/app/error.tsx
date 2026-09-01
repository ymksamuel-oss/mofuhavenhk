"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";

export default function Error({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useI18n();

  return (
    <div style={{ padding: "60px 20px", textAlign: "center", fontFamily: "sans-serif" }}>
      <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "8px", color: "#54392D" }}>{t("errorPageTitle")}</h2>
      <p style={{ color: "#756962", marginBottom: "16px", fontSize: "14px" }}>{t("errorPageBody")}</p>
      <button
        type="button"
        onClick={() => reset()}
        style={{ padding: "10px 20px", backgroundColor: "#54392D", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontSize: "14px" }}
      >
        {t("errorPageRetry")}
      </button>
    </div>
  );
}
