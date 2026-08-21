'use client';

export default function Error({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ padding: "60px 20px", textAlign: "center", fontFamily: "sans-serif" }}>
      <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "8px", color: "#5c3a22" }}>Mofu Haven HK 系統提示</h2>
      <p style={{ color: "#666", marginBottom: "16px", fontSize: "14px" }}>頁面載入時發生暫時性問題。</p>
      <button
        type="button"
        onClick={() => reset()}
        style={{ padding: "10px 20px", backgroundColor: "#5c3a22", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontSize: "14px" }}
      >
        重新整理頁面
      </button>
    </div>
  );
}
