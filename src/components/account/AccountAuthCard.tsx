import Link from "next/link";
import type { ReactNode } from "react";

export function AccountAuthCard({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-[65vh] w-full max-w-xl items-center px-4 py-8 sm:px-6 sm:py-12">
      <section className="milk-tea-card w-full space-y-5 p-5 sm:p-8">
        <div className="space-y-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">Mofu Haven Member</p>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[color:var(--ink)] sm:text-3xl">{title}</h1>
          {description ? <p className="text-sm leading-6 text-[color:var(--muted)]">{description}</p> : null}
        </div>
        {children}
        <p className="text-center text-xs text-[color:var(--muted)]"><Link href="/" className="underline underline-offset-4">返回毛毛港首頁</Link></p>
      </section>
    </main>
  );
}
