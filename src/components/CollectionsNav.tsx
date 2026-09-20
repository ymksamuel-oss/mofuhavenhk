"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { COLLECTION_NAV_GROUPS, getCollection, getCollectionLabel } from "@/lib/collections";
import { useI18n } from "@/lib/i18n/I18nProvider";

function Caret({ open = false }: { open?: boolean }) {
  return <span aria-hidden="true" className={`inline-block text-xs transition-transform ${open ? "rotate-180" : ""}`}>⌄</span>;
}

export function CollectionsNav({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const { locale } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const label = locale === "en" ? "Collections" : "商品專區";
  const isActive = pathname.startsWith("/collections/");

  if (mobile) {
    return (
      <li className="block w-full">
        <div className={`flex min-h-11 w-full items-center rounded-xl px-4 py-1 text-base font-medium leading-normal transition ${open || isActive ? "bg-[color:var(--accent-soft)] font-semibold text-[color:var(--ink)]" : "text-[color:var(--muted)] hover:bg-[color:var(--accent-soft)]/70 hover:text-[color:var(--ink)]"}`}>
          <span className="min-w-0 flex-1 py-2.5">{label}</span>
          <button type="button" className="flex h-10 w-10 items-center justify-center" aria-expanded={open} aria-controls="mobile-collections-menu" onClick={() => setOpen((value) => !value)}><Caret open={open} /></button>
        </div>
        {open ? <div id="mobile-collections-menu" className="mx-1 mt-2 grid gap-2 rounded-2xl border border-[color:var(--line)] bg-white/80 p-2 shadow-[0_18px_34px_-28px_rgba(56,40,30,0.5)]">
          {COLLECTION_NAV_GROUPS.map((group) => {
            const groupOpen = openGroup === group.key;
            return <div key={group.key}>
              <button type="button" className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-[color:var(--ink)] hover:bg-[color:var(--accent-soft)]" aria-expanded={groupOpen} onClick={() => setOpenGroup(groupOpen ? null : group.key)}>
                {locale === "en" ? group.title_en : group.title_zh}<Caret open={groupOpen} />
              </button>
              {groupOpen ? <div className="grid gap-1 border-l border-[color:var(--line)] pl-2">{group.slugs.map((slug) => {
                const collection = getCollection(slug);
                if (!collection) return null;
                return <Link key={slug} href={`/collections/${slug}`} className="rounded-lg px-3 py-2 text-sm text-[color:var(--muted)] hover:bg-[color:var(--accent-soft)] hover:text-[color:var(--ink)]" onClick={onNavigate}>{getCollectionLabel(collection, locale)} </Link>;
              })}</div> : null}
            </div>;
          })}
        </div> : null}
      </li>
    );
  }

  return (
    <div className="relative -mb-3 pb-3" onMouseEnter={() => setOpen(true)}>
      <button type="button" className={`relative inline-flex items-center gap-1.5 py-0.5 transition-colors ${open || isActive ? "font-semibold text-[color:var(--ink)]" : "hover:text-[color:var(--ink)]"}`} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((value) => !value)} onFocus={() => setOpen(true)}>
        {label} <Caret open={open} />
      </button>
      {open ? <div role="menu" className="absolute left-[-0.65rem] top-full z-[70] grid min-w-[19rem] gap-2 rounded-2xl border border-[color:var(--line)] bg-[#fffdfb] p-3 shadow-[0_18px_34px_-26px_rgba(62,42,28,0.42)]">
        {COLLECTION_NAV_GROUPS.map((group) => <div key={group.key}>
          <p className="px-3 pb-1 pt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#a36b42]">{locale === "en" ? group.title_en : group.title_zh}</p>
          <div className="grid gap-0.5">{group.slugs.map((slug) => {
            const collection = getCollection(slug);
            if (!collection) return null;
            return <Link key={slug} href={`/collections/${slug}`} role="menuitem" className="rounded-xl px-3 py-2 text-sm text-[color:var(--muted)] hover:bg-[#f1ded1] hover:text-[#583827]" onClick={() => setOpen(false)}>{getCollectionLabel(collection, locale)}</Link>;
          })}</div>
        </div>)}
      </div> : null}
    </div>
  );
}
