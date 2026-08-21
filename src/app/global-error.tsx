"use client";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * Keep this boundary entirely self-contained. It must not import the root
 * layout, catalog, Stripe, or client providers because it is rendered when
 * those modules are exactly what has failed.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  console.error("Unhandled application error", error);

  return (
    <html lang="zh-HK">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#f8f0e2",
          color: "#3f2b20",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          padding: "24px",
          boxSizing: "border-box",
        }}
      >
        <main style={{ maxWidth: 440, textAlign: "center" }}>
          <p style={{ letterSpacing: "0.12em", fontSize: 12, margin: "0 0 14px" }}>
            MOFU HAVEN HK
          </p>
          <h1 style={{ fontSize: 24, margin: "0 0 12px" }}>暫時未能載入頁面</h1>
          <p style={{ color: "#6b5a50", lineHeight: 1.7, margin: "0 0 24px" }}>
            請重新整理頁面；如問題持續，請透過 WhatsApp 聯絡我們。
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              border: 0,
              borderRadius: 999,
              background: "#5c3a22",
              color: "#fff",
              padding: "12px 22px",
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            重新整理頁面
          </button>
        </main>
      </body>
    </html>
  );
}
