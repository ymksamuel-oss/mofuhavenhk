'use client';

export const dynamic = "force-dynamic";

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="zh-HK">
      <body>
        <div style={{ textAlign: "center", marginTop: "100px", fontFamily: "sans-serif" }}>
          <h2>Mofu Haven HK 系統提示</h2>
          <p>頁面載入發生異常，請點擊下方按鈕重新嘗試。</p>
          <button onClick={() => reset()} style={{ padding: "10px 20px", marginTop: "16px", cursor: "pointer" }}>
            重新整理
          </button>
        </div>
      </body>
    </html>
  );
}
