/**
 * Site-wide footer — shows a clear Last Updated stamp for ops / launch checks.
 */
export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-[color:var(--line)] bg-[color:var(--background)]">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-1 px-4 py-5 text-center sm:px-6">
        <p className="font-[family-name:var(--font-display)] text-sm font-semibold tracking-wide text-[color:var(--ink)]">
          Mofu Haven HK
        </p>
        <p className="text-xs tabular-nums text-[color:var(--muted)]">
          Last Updated: 2026-08-03
        </p>
      </div>
    </footer>
  );
}
