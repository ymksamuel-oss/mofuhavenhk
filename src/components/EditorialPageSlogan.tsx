type EditorialPageSloganProps = {
  eyebrow: string;
  title: string;
  body: string;
  className?: string;
};

/** Compact editorial interlude for key content-page headers. */
export function EditorialPageSlogan({
  eyebrow,
  title,
  body,
  className,
}: EditorialPageSloganProps) {
  return (
    <section
      className={`max-w-3xl border-y border-[#cbb09a]/45 py-5 sm:py-6 ${className ?? ""}`}
      aria-label={title}
    >
      <div className="flex items-center gap-3 text-[10px] font-semibold tracking-[0.2em] text-[#7a5d4a]">
        <span>MOFU HAVEN</span>
        <span aria-hidden className="h-px w-8 bg-[#b99476]/65" />
        <span>{eyebrow}</span>
      </div>
      <h2 className="mt-2 font-serif text-2xl italic tracking-[-0.02em] text-[#4b3621] sm:text-[1.75rem]">
        {title}
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-7 text-[#725c45] sm:text-base">
        {body}
      </p>
    </section>
  );
}
