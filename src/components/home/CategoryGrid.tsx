import { CategoryNavLink } from "@/components/CategoryNavLink";
import { useCatalog } from "@/lib/catalog-context";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { StoreCategory } from "@/lib/store-categories";

function renderChildren(parentPath: string, children: StoreCategory[]) {
  return children.map((child) => {
    const childPath = `${parentPath}/${child.slug}`;
    return (
      <li key={child.id}>
        <CategoryNavLink
          href={childPath}
          className="group flex items-center justify-between rounded-xl border border-[color:var(--line)] bg-white px-4 py-3 text-sm text-[color:var(--muted)] transition hover:-translate-y-0.5 hover:border-[color:var(--accent)] hover:bg-[color:var(--accent-soft)] hover:text-[color:var(--ink)]"
        >
          <span>{child.name}</span>
          <span aria-hidden="true" className="text-[color:var(--accent)] transition-transform group-hover:translate-x-1">
            →
          </span>
        </CategoryNavLink>
        {child.children.length > 0 ? (
          <ul className="ml-4 mt-2 grid gap-2 border-l border-[color:var(--line)] pl-3">
            {renderChildren(childPath, child.children)}
          </ul>
        ) : null}
      </li>
    );
  });
}

export function CategoryGrid() {
  const { t } = useI18n();
  const { categories } = useCatalog();
  const topLevelCategories = categories.filter((category) => category.parent_id === null);

  return (
    <section
      aria-labelledby="category-grid-title"
      className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16"
    >
      <div className="mb-8 max-w-2xl">
        <h2
          id="category-grid-title"
          className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-[color:var(--ink)] sm:text-3xl"
        >
          {t("categoryGridTitle")}
        </h2>
        <p className="mt-2 text-sm text-[color:var(--muted)] sm:text-base">
          {t("categoryGridSubtitle")}
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {topLevelCategories.map((category) => {
          const parentPath = `/categories/${category.slug}`;
          return (
            <section
              key={category.id}
              className="rounded-2xl border border-[color:var(--line)] bg-[#fffdfb] p-4 shadow-[0_12px_30px_-24px_rgba(62,42,28,0.5)]"
              aria-labelledby={`category-${category.id}`}
            >
              <CategoryNavLink
                href={parentPath}
                className="group flex items-center justify-between gap-4 rounded-xl px-2 py-2 font-[family-name:var(--font-display)] text-lg font-semibold text-[color:var(--ink)]"
              >
                <span id={`category-${category.id}`}>{category.name}</span>
                <span aria-hidden="true" className="text-[color:var(--accent)] transition-transform group-hover:translate-x-1">
                  →
                </span>
              </CategoryNavLink>
              {category.children.length > 0 ? (
                <ul className="mt-2 grid gap-2">
                  {renderChildren(parentPath, category.children)}
                </ul>
              ) : null}
            </section>
          );
        })}
      </div>
    </section>
  );
}
