"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFormStatus } from "react-dom";
import { signOutAction } from "@/app/account/actions";
import { useI18n } from "@/lib/i18n/I18nProvider";

function SignOutButton() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} className="min-h-11 rounded-xl border border-[color:var(--line)] px-3 py-2 text-sm font-medium text-[color:var(--muted)] hover:bg-white disabled:opacity-60">{pending ? "登出中…" : "登出"}</button>;
}

export function CustomerPortalShell({
  user,
  displayName,
  children,
}: {
  user: { email: string; avatarUrl: string };
  displayName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { locale } = useI18n();
  const links = [
    { href: "/account", zh: "概覽", en: "Overview" },
    { href: "/account/orders", zh: "我的訂單", en: "Orders" },
    { href: "/account/addresses", zh: "地址簿", en: "Addresses" },
    { href: "/account/pets", zh: "毛孩檔案", en: "Pets" },
    { href: "/account/profile", zh: "個人資料", en: "Profile" },
  ];
  const name = displayName || (locale === "en" ? "Mofu member" : "毛毛港會員");
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[color:var(--line)] bg-white p-4 sm:p-5">
        <div className="flex min-w-0 items-center gap-3">
          {user.avatarUrl ? <img src={user.avatarUrl} alt="" referrerPolicy="no-referrer" className="h-11 w-11 shrink-0 rounded-full border border-[color:var(--line)] object-cover" /> : <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent-soft)] text-lg font-semibold text-[color:var(--ink)]">{name.slice(0, 1)}</span>}
          <div className="min-w-0"><p className="truncate text-sm font-semibold text-[color:var(--ink)]">{name}</p><p className="truncate text-xs text-[color:var(--muted)]">{user.email}</p></div>
        </div>
        <form action={signOutAction}><SignOutButton /></form>
      </header>
      <nav aria-label={locale === "en" ? "Customer account" : "會員中心導覽"} className="mb-6 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        {links.map((link) => {
          const active = link.href === "/account" ? pathname === link.href : pathname === link.href || pathname.startsWith(`${link.href}/`);
          return <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined} className={`flex min-h-11 items-center justify-center rounded-xl border px-3 py-2.5 text-sm font-semibold transition sm:min-w-28 ${active ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-white" : "border-[color:var(--line)] bg-white text-[color:var(--ink)] hover:border-[color:var(--accent)]"}`}>{locale === "en" ? link.en : link.zh}</Link>;
        })}
      </nav>
      {children}
    </main>
  );
}
