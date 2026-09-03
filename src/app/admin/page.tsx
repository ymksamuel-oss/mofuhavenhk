"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { MAX_FEATURED_PETS } from "@/lib/featured-pets";

type Row = Record<string, any>;
type Tab = "products" | "categories" | "banners" | "featured_pets" | "coupons" | "orders" | "store_settings";

const PAGE_SIZE = 20;
const MAX_PRODUCT_IMAGES = 8;
const BANNER_SLOT_COUNT = 4;

type FeaturedPetSlot = {
  image_url: string;
  title: string;
  title_en: string;
  description: string;
  description_en: string;
  link: string;
  sort_order: number;
  is_published: boolean;
};

function emptyFeaturedPetSlot(sortOrder: number): FeaturedPetSlot {
  return { image_url: "", title: "", title_en: "", description: "", description_en: "", link: "", sort_order: sortOrder, is_published: true };
}

function toFeaturedPetSlots(rows: Row[]): FeaturedPetSlot[] {
  const slots = Array.from({ length: MAX_FEATURED_PETS }, (_, index) => emptyFeaturedPetSlot(index + 1));
  rows.slice(0, MAX_FEATURED_PETS).forEach((row, index) => {
    slots[index] = {
      image_url: String(row.image_url || ""),
      title: String(row.title || ""),
      title_en: String(row.title_en || ""),
      description: String(row.description || ""),
      description_en: String(row.description_en || ""),
      link: String(row.link || ""),
      sort_order: Number.isFinite(Number(row.sort_order)) ? Number(row.sort_order) : index + 1,
      is_published: row.is_published !== false,
    };
  });
  return slots;
}

type BannerSlot = {
  image_url: string;
  mobile_image_url: string;
  link: string;
  title: string;
  sort_order: number;
};

function emptyBannerSlot(sortOrder: number): BannerSlot {
  return { image_url: "", mobile_image_url: "", link: "", title: "", sort_order: sortOrder };
}

function toBannerSlots(rows: Row[]): BannerSlot[] {
  const slots = Array.from({ length: BANNER_SLOT_COUNT }, (_, index) => emptyBannerSlot(index + 1));
  rows.slice(0, BANNER_SLOT_COUNT).forEach((row, index) => {
    slots[index] = {
      image_url: String(row.image_url || ""),
      mobile_image_url: String(row.mobile_image_url || ""),
      link: String(row.link || ""),
      title: String(row.title || ""),
      sort_order: Number.isFinite(Number(row.sort_order)) ? Number(row.sort_order) : index + 1,
    };
  });
  return slots;
}

function parseImageUrls(value: unknown): string[] {
  const values = Array.isArray(value) ? value : [value];
  return Array.from(
    new Set(
      values
        .flatMap((item) => (typeof item === "string" ? item.split(/[\r\n,|;]+/) : []))
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ).slice(0, MAX_PRODUCT_IMAGES);
}

function getProductImageUrls(row: Row): string[] {
  for (const value of [row.images, row.image, row.image_url]) {
    const urls = parseImageUrls(value);
    if (urls.length) return urls;
  }
  return [];
}

const tabs: { id: Tab; label: string }[] = [
  { id: "products", label: "產品管理" },
  { id: "categories", label: "分類卡片" },
  { id: "banners", label: "Banner 輪播" },
  { id: "featured_pets", label: "精選寵物專區" },
  { id: "coupons", label: "優惠碼" },
  { id: "orders", label: "訂單管理" },
  { id: "store_settings", label: "系統與 API" },
];

async function call(method: string, body?: Row, table?: string) {
  const response = await fetch("/api/admin" + (method === "GET" ? `?table=${table}` : ""), {
    method,
    headers: { "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || "操作失敗");
  return json;
}

function defaultRow(tab: Tab): Row {
  if (tab === "products") return { name: "", name_en: "", price: 0, original_price: "", stock: 0, description: "", description_en: "", images: [], category_id: "", mofu_sku: "", status: "published", is_published: true, seo_title: "", seo_description: "" };
  if (tab === "categories") return { name: "", name_zh: "", name_en: "", slug: "", parent_id: "", image_url: "", sort_order: 0 };
  if (tab === "coupons") return { code: "", discount_amount: 0, discount_type: "fixed", active: true };
  return { key: "announcement", value: "" };
}

function stringifySearchValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return "";
  }
}

function getProductSearchText(row: Row, categories: Row[]): string {
  const categoryName = categories.find((category) => String(category.id) === String(row.category_id))?.name;
  const fields = [
    "id",
    "name",
    "description",
    "keyword",
    "keywords",
    "sku",
    "mofu_sku",
    "source_product_id",
    "handle",
    "brand",
    "vendor",
    "product_type",
    "productType",
    "tags",
    "category",
    "subcategory",
  ];
  return [...fields.map((field) => stringifySearchValue(row[field])), categoryName || ""].join(" ").toLocaleLowerCase();
}

type CategoryGroup = {
  root: Row;
  entries: Array<{ category: Row; depth: number }>;
};

function categoryGroups(categories: Row[], excludedId = ""): CategoryGroup[] {
  const ids = new Set(categories.map((category) => String(category.id)));
  const childrenByParent = new Map<string, Row[]>();
  const roots: Row[] = [];

  categories.forEach((category) => {
    const id = String(category.id);
    const parentId = category.parent_id ? String(category.parent_id) : "";
    if (!parentId || !ids.has(parentId) || parentId === id) {
      roots.push(category);
      return;
    }
    const children = childrenByParent.get(parentId) || [];
    children.push(category);
    childrenByParent.set(parentId, children);
  });

  const groups: CategoryGroup[] = [];
  roots.forEach((root) => {
    const entries: CategoryGroup["entries"] = [];
    const visit = (category: Row, depth: number, seen: Set<string>) => {
      const id = String(category.id);
      if (seen.has(id) || id === excludedId) return;
      const nextSeen = new Set(seen).add(id);
      entries.push({ category, depth });
      (childrenByParent.get(id) || []).forEach((child) => visit(child, depth + 1, nextSeen));
    };
    visit(root, 0, new Set());
    if (entries.length > 0) groups.push({ root, entries });
  });
  return groups;
}

function categoryOptionLabel(name: unknown, depth: number): string {
  return `${depth > 0 ? `${"　".repeat(depth)}↳ ` : ""}${String(name || "")}`;
}

function getPageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  if (current <= 3) [2, 3, 4].forEach((page) => pages.add(page));
  if (current >= total - 2) [total - 3, total - 2, total - 1].forEach((page) => pages.add(page));
  const sorted = Array.from(pages).filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);
  const result: (number | "ellipsis")[] = [];
  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) result.push("ellipsis");
    result.push(page);
  });
  return result;
}

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("products");
  const [rows, setRows] = useState<Row[]>([]);
  const [categories, setCategories] = useState<Row[]>([]);
  const [form, setForm] = useState<Row | null>(null);
  const [bannerSlots, setBannerSlots] = useState<BannerSlot[]>(() => toBannerSlots([]));
  const [bannerSaving, setBannerSaving] = useState(false);
  const [bannerNotice, setBannerNotice] = useState("");
  const [featuredPetSlots, setFeaturedPetSlots] = useState<FeaturedPetSlot[]>(() => toFeaturedPetSlots([]));
  const [featuredPetSaving, setFeaturedPetSaving] = useState(false);
  const [featuredPetNotice, setFeaturedPetNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [productQuery, setProductQuery] = useState("");
  const [productCategory, setProductCategory] = useState("all");
  const [productPage, setProductPage] = useState(1);
  const [openQuickCategoryProductId, setOpenQuickCategoryProductId] = useState<string | null>(null);
  const [categorySavingProductId, setCategorySavingProductId] = useState<string | null>(null);
  const [categoryQuickError, setCategoryQuickError] = useState<string | null>(null);

  const load = async (selected = tab) => {
    setLoading(true);
    setError("");
    try {
      const result = await call("GET", undefined, selected);
      const loadedRows = result.data || [];
      setRows(loadedRows);
      if (selected === "banners") {
        setBannerSlots(toBannerSlots(loadedRows));
      }
      if (selected === "featured_pets") {
        setFeaturedPetSlots(toFeaturedPetSlots(loadedRows));
      }
      if (selected === "categories") {
        setCategories(result.data || []);
      } else if (selected === "products") {
        const c = await call("GET", undefined, "categories");
        setCategories(c.data || []);
      }
    } catch (e: any) {
      if (e.message === "unauthorized") router.replace("/admin/login");
      else setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(tab);
    setForm(null);
    if (tab !== "products") {
      setProductQuery("");
      setProductCategory("all");
      setProductPage(1);
    }
  }, [tab]);

  const title = useMemo(() => tabs.find((item) => item.id === tab)?.label, [tab]);

  const filteredProductRows = useMemo(() => {
    if (tab !== "products") return [];
    const query = productQuery.trim().toLocaleLowerCase();
    return rows.filter((row) => {
      const matchesQuery = !query || getProductSearchText(row, categories).includes(query);
      const matchesCategory = productCategory === "all" || String(row.category_id || "") === productCategory;
      return matchesQuery && matchesCategory;
    });
  }, [rows, categories, productQuery, productCategory, tab]);

  const productPageCount = Math.max(1, Math.ceil(filteredProductRows.length / PAGE_SIZE));
  const visibleRows = tab === "products"
    ? filteredProductRows.slice((productPage - 1) * PAGE_SIZE, productPage * PAGE_SIZE)
    : rows;
  const firstVisibleProduct = filteredProductRows.length === 0 ? 0 : (productPage - 1) * PAGE_SIZE + 1;
  const lastVisibleProduct = Math.min(productPage * PAGE_SIZE, filteredProductRows.length);

  useEffect(() => {
    setProductPage(1);
  }, [productQuery, productCategory]);

  useEffect(() => {
    if (productPage > productPageCount) setProductPage(productPageCount);
  }, [productPage, productPageCount]);

  async function save() {
    if (!form) return;
    try {
      const normalized = { ...form };
      const replaceExisting = tab === "banners" && !form.id && normalized.replace_existing === true;
      delete normalized.replace_existing;
      if (tab === "products") {
        normalized.images = parseImageUrls(normalized.images);
      }
      if (tab === "categories") {
        normalized.parent_id = normalized.parent_id || null;
        if (normalized.parent_id === normalized.id) {
          setError("分類不可設為自身的父分類");
          return;
        }
      }
      if (form.id) {
        await call("PATCH", { table: tab, id: form.id, row: normalized });
      } else {
        await call("POST", { table: tab, row: normalized, ...(tab === "banners" ? { replaceExisting } : {}) });
      }
      setForm(null);
      await load();
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function saveFeaturedPetBatch() {
    const hasIncompleteSlot = featuredPetSlots.some((slot) => {
      const hasImage = slot.image_url.trim().length > 0;
      const hasOtherContent = Boolean(slot.title.trim() || slot.description.trim() || slot.link.trim());
      return !hasImage && hasOtherContent;
    });
    if (hasIncompleteSlot) {
      setError("如某一個內容槽已填寫標題、描述或連結，必須同時提供圖片。");
      return;
    }

    const pets = featuredPetSlots
      .filter((slot) => slot.image_url.trim())
      .map((slot) => ({
        image_url: slot.image_url.trim(),
        title: slot.title.trim(),
        title_en: slot.title_en.trim(),
        description: slot.description.trim(),
        description_en: slot.description_en.trim(),
        link: slot.link.trim(),
        sort_order: Number.isFinite(slot.sort_order) ? Math.trunc(slot.sort_order) : 0,
        is_published: slot.is_published,
      }));
    const sortOrders = pets.map((pet) => pet.sort_order);
    if (sortOrders.some((sortOrder) => sortOrder < 0) || new Set(sortOrders).size !== sortOrders.length) {
      setError("已填寫的精選寵物內容必須使用不重複且為 0 或以上的整數排序。");
      return;
    }
    if (pets.some((pet) => !pet.title || !pet.description)) {
      setError("每個已填寫圖片的內容槽必須同時提供標題及詳細描述。");
      return;
    }

    setFeaturedPetSaving(true);
    setError("");
    setFeaturedPetNotice("");
    try {
      const result = await call("POST", { action: "replace_featured_pets", pets });
      setFeaturedPetNotice(result.count === 0 ? "已清空精選寵物專區，首頁不會顯示任何寫真。" : `已儲存 ${result.count} 個精選寵物內容，首頁會即時更新。`);
      await load("featured_pets");
    } catch (e: any) {
      setError(e.message || "精選寵物內容儲存失敗");
    } finally {
      setFeaturedPetSaving(false);
    }
  }

  async function saveBannerBatch() {
    const hasIncompleteSlot = bannerSlots.some((slot) => {
      const hasDesktopImage = slot.image_url.trim().length > 0;
      const hasOtherContent = Boolean(slot.mobile_image_url.trim() || slot.link.trim() || slot.title.trim());
      return !hasDesktopImage && hasOtherContent;
    });
    if (hasIncompleteSlot) {
      setError("如某一格已填寫手機圖片、連結或標題，必須同時提供桌面版圖片。");
      return;
    }

    const banners = bannerSlots
      .filter((slot) => slot.image_url.trim())
      .map((slot) => ({
        image_url: slot.image_url.trim(),
        mobile_image_url: slot.mobile_image_url.trim(),
        link: slot.link.trim(),
        title: slot.title.trim(),
        sort_order: Number.isFinite(slot.sort_order) ? Math.trunc(slot.sort_order) : 0,
      }));
    const sortOrders = banners.map((banner) => banner.sort_order);
    if (sortOrders.some((sortOrder) => sortOrder < 0) || new Set(sortOrders).size !== sortOrders.length) {
      setError("已填寫的 Banner 必須使用不重複且為 0 或以上的整數排序。");
      return;
    }

    setBannerSaving(true);
    setError("");
    setBannerNotice("");
    try {
      const result = await call("POST", { action: "replace_banners", banners });
      setBannerNotice(result.count === 0 ? "已清空所有 Banner 資料。" : `已儲存 ${result.count} 組 Banner，前台輪播已依排序更新。`);
      await load("banners");
    } catch (e: any) {
      setError(e.message || "Banner 儲存失敗");
    } finally {
      setBannerSaving(false);
    }
  }

  async function remove(row: Row) {
    if (!row.id || !confirm("確定刪除此項目？")) return;
    try {
      await call("DELETE", { table: tab, id: row.id });
      await load();
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function logout() {
    await call("POST", { action: "logout" });
    router.replace("/admin/login");
  }

  async function updateProductCategory(row: Row, categoryId: string) {
    if (!row.id) return;
    const productId = String(row.id);
    setCategorySavingProductId(productId);
    setCategoryQuickError(null);
    try {
      await call("PATCH", {
        table: "products",
        id: row.id,
        row: { category_id: categoryId || null },
      });
      setRows((current) => current.map((item) => (
        String(item.id) === productId
          ? { ...item, category_id: categoryId || null }
          : item
      )));
      setOpenQuickCategoryProductId(null);
    } catch (e: any) {
      setCategoryQuickError(e.message || "分類更新失敗");
    } finally {
      setCategorySavingProductId(null);
    }
  }

  function categoryName(categoryId: unknown) {
    return categories.find((category) => String(category.id) === String(categoryId))?.name || "未分類";
  }

  return (
    <div className="min-h-screen bg-[#f6f2eb] text-[#27231f]">
      <header className="flex items-center justify-between border-b border-[#e5ddd3] bg-white px-5 py-4 md:px-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#a36b42]">Mofu Haven HK</p>
          <h1 className="text-xl font-semibold">內容管理中心</h1>
        </div>
        <button onClick={logout} className="rounded-lg border border-[#ded5cc] px-3 py-2 text-sm transition hover:bg-[#f6f2eb]">登出</button>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-6 md:flex-row md:px-10">
        <aside className="w-full shrink-0 rounded-2xl bg-[#2f4a3c] p-3 text-white md:w-56 md:self-start">
          {tabs.map((item) => (
            <button key={item.id} onClick={() => setTab(item.id)} className={`mb-1 w-full rounded-xl px-4 py-3 text-left text-sm transition ${tab === item.id ? "bg-white text-[#2f4a3c]" : "text-white/80 hover:bg-white/10"}`}>
              {item.label}
            </button>
          ))}
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm text-[#8b7c70]">網站內容</p>
              <h2 className="text-3xl font-semibold">{title}</h2>
            </div>
            {tab !== "orders" && tab !== "banners" && tab !== "featured_pets" && (
              <button onClick={() => setForm(defaultRow(tab))} className="shrink-0 rounded-xl bg-[#a36b42] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#8f5b37]">新增</button>
            )}
          </div>

          {error && <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          {tab === "products" && (
            <section className="mb-5 rounded-2xl bg-white p-4 shadow-sm md:p-5">
              <div className="flex flex-col gap-3 lg:flex-row">
                <label className="relative min-w-0 flex-1">
                  <span className="sr-only">搜尋產品</span>
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a89587]" />
                  <input
                    value={productQuery}
                    onChange={(event) => setProductQuery(event.target.value)}
                    placeholder="搜尋產品名稱、關鍵字、SKU 或產品 ID…"
                    className="w-full rounded-xl border border-[#ded5cc] bg-[#fffdfa] py-3 pl-10 pr-10 text-sm outline-none transition focus:border-[#a36b42] focus:ring-2 focus:ring-[#a36b42]/10"
                  />
                  {productQuery && <button aria-label="清除搜尋" onClick={() => setProductQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b7c70] hover:text-[#2f4a3c]"><X className="h-4 w-4" /></button>}
                </label>
                <label className="lg:w-56">
                  <span className="sr-only">按分類篩選</span>
                  <select value={productCategory} onChange={(event) => setProductCategory(event.target.value)} className="w-full rounded-xl border border-[#ded5cc] bg-[#fffdfa] px-3 py-3 text-sm outline-none transition focus:border-[#a36b42]">
                    <option value="all">全部分類</option>
                    {categoryGroups(categories).map(({ root, entries }) => (
                      <optgroup key={root.id} label={root.name}>
                        {entries.map(({ category, depth }) => (
                          <option key={category.id} value={category.id}>
                            {depth === 0 ? `${category.name}（全部子分類）` : categoryOptionLabel(category.name, depth)}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </label>
              </div>
              <div className="mb-3 rounded-xl border border-[#eaded5] bg-[#fffaf4] px-4 py-3 text-xs leading-5 text-[#806b5d]">前台只會顯示「狀態 = published」、「已發布」及「庫存大於 0」的產品。要暫停產品，請改為 draft／archived 或取消已發布。</div><div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[#8b7c70]">
                <span>{productQuery || productCategory !== "all" ? `篩選結果：${filteredProductRows.length} 項` : `共 ${rows.length} 項產品`}</span>
                {(productQuery || productCategory !== "all") && <button onClick={() => { setProductQuery(""); setProductCategory("all"); }} className="font-medium text-[#a36b42] hover:underline">清除篩選</button>}
              </div>
            </section>
          )}

          {tab === "banners" ? (
            <BannerBatchEditor
              slots={bannerSlots}
              onChange={setBannerSlots}
              onSave={saveBannerBatch}
              saving={bannerSaving}
              notice={bannerNotice}
            />
          ) : tab === "featured_pets" ? (
            <FeaturedPetBatchEditor
              slots={featuredPetSlots}
              onChange={setFeaturedPetSlots}
              onSave={saveFeaturedPetBatch}
              saving={featuredPetSaving}
              notice={featuredPetNotice}
            />
          ) : form && <Editor tab={tab} form={form} setForm={setForm} categories={categories} onSave={save} onCancel={() => setForm(null)} />}

          {tab !== "featured_pets" && (loading ? (
            <div className="rounded-2xl bg-white p-10 text-center text-[#8b7c70]">載入中…</div>
          ) : visibleRows.length === 0 && !form ? (
            <div className="rounded-2xl bg-white p-10 text-center text-[#8b7c70]">
              {tab === "products" && (productQuery || productCategory !== "all") ? "找不到符合條件的產品。" : "尚未有資料，請按「新增」。"}
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {visibleRows.map((row) => {
                  const thumbnailUrl = tab === "products" ? getProductImageUrls(row)[0] : undefined;
                  return (
                    <div key={row.id || row.key} className="rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="flex min-w-0 items-center gap-4">
                          {tab === "products" && (
                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[#eaded5] bg-[#fffaf4]">
                              {thumbnailUrl ? (
                                <img src={thumbnailUrl} alt={`${row.name || "產品"}縮圖`} className="h-full w-full object-cover" loading="lazy" onError={(event) => { event.currentTarget.style.display = "none"; }} />
                              ) : (
                                <div className="flex h-full items-center justify-center px-1 text-center text-[10px] leading-4 text-[#a89587]">無圖片</div>
                              )}
                            </div>
                          )}
                          {tab === "banners" && (
                            <div data-banner-list="true" className="grid h-16 w-36 shrink-0 grid-cols-2 gap-1 overflow-hidden rounded-xl border border-[#eaded5] bg-[#fffaf4] p-1">
                              <div className="relative overflow-hidden rounded-md bg-[#eaded5]">
                                {row.image_url ? <img src={row.image_url} alt={`${row.title || "Banner"} 桌面版`} className="h-full w-full object-cover" loading="lazy" /> : <span className="flex h-full items-center justify-center text-[9px] text-[#a89587]">桌面版</span>}
                                <span className="absolute inset-x-0 bottom-0 bg-black/55 px-1 py-0.5 text-center text-[8px] text-white">桌面</span>
                              </div>
                              <div className="relative overflow-hidden rounded-md bg-[#eaded5]">
                                {row.mobile_image_url || row.image_url ? <img src={row.mobile_image_url || row.image_url} alt={`${row.title || "Banner"} 手機版`} className="h-full w-full object-cover" loading="lazy" /> : <span className="flex h-full items-center justify-center text-[9px] text-[#a89587]">手機版</span>}
                                <span className="absolute inset-x-0 bottom-0 bg-black/55 px-1 py-0.5 text-center text-[8px] text-white">手機</span>
                              </div>
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold">{tab === "products" ? row.name : tab === "store_settings" ? row.key : row.title || row.name || row.code || row.status}</p>
                            <p className="mt-1 truncate text-sm text-[#8b7c70]">
                              {tab === "products"
                                ? `HK$${row.price ?? 0} · 庫存 ${row.stock ?? 0} · ${categoryName(row.category_id)}`
                                : tab === "orders"
                                  ? `${row.total ?? 0} · ${row.created_at || ""}`
                                  : tab === "store_settings"
                                    ? (String(row.value).length > 20 ? "••••••••" : row.value)
                                    : tab === "banners"
                                      ? `排序 ${row.sort_order ?? 0} · ${row.mobile_image_url ? "桌面／手機圖片已設定" : "手機版沿用桌面版"}`
                                      : row.image_url || row.slug || row.discount_type || ""}
                            </p>
                            {tab === "products" && <><p className="mt-1 truncate text-xs text-[#b09f92]">ID：{row.id}{row.mofu_sku ? ` · SKU：${row.mofu_sku}` : row.sku ? ` · SKU：${row.sku}` : ""}</p><span className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${row.status === "published" && row.is_published !== false ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{row.status === "published" && row.is_published !== false ? "前台顯示中" : `未上架：${row.status || "draft"}`}</span></>}
                          </div>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          {tab === "products" ? (
                            <div className="relative">
                              <div className="flex">
                                <button onClick={() => setForm({ ...row })} className="rounded-l-lg border border-r-0 border-[#ded5cc] px-3 py-2 text-sm transition hover:bg-[#f6f2eb]">編輯</button>
                                <button
                                  type="button"
                                  aria-label={`快速更改 ${row.name || "產品"} 分類`}
                                  aria-expanded={openQuickCategoryProductId === String(row.id)}
                                  onClick={() => {
                                    setCategoryQuickError(null);
                                    setOpenQuickCategoryProductId((current) => current === String(row.id) ? null : String(row.id));
                                  }}
                                  className="rounded-r-lg border border-[#ded5cc] px-2 py-2 text-sm transition hover:bg-[#f6f2eb]"
                                >
                                  <ChevronDown className={`h-4 w-4 transition-transform ${openQuickCategoryProductId === String(row.id) ? "rotate-180" : ""}`} />
                                </button>
                              </div>
                              {openQuickCategoryProductId === String(row.id) && (
                                <div className="absolute right-0 top-full z-20 mt-2 w-72 rounded-xl border border-[#ded5cc] bg-white p-3 text-left shadow-lg">
                                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#8b7c70]">快速更改分類</p>
                                  <select
                                    value={row.category_id || ""}
                                    disabled={categorySavingProductId === String(row.id)}
                                    onChange={(event) => updateProductCategory(row, event.target.value)}
                                    className="w-full rounded-lg border border-[#ded5cc] bg-[#fffdfa] px-3 py-2 text-sm outline-none transition focus:border-[#a36b42] disabled:cursor-wait disabled:opacity-60"
                                  >
                                    <option value="">未分類</option>
                                    {categoryGroups(categories).map(({ root, entries }) => (
                                      <optgroup key={root.id} label={root.name}>
                                        {entries.map(({ category, depth }) => (
                                          <option key={category.id} value={category.id}>
                                            {depth === 0 ? `${category.name}（全部子分類）` : categoryOptionLabel(category.name, depth)}
                                          </option>
                                        ))}
                                      </optgroup>
                                    ))}
                                  </select>
                                  {categorySavingProductId === String(row.id) && <p className="mt-2 text-xs text-[#a36b42]">儲存中…</p>}
                                  {categoryQuickError && <p className="mt-2 text-xs text-red-600">{categoryQuickError}</p>}
                                </div>
                              )}
                            </div>
                          ) : tab === "banners" ? (
                            <span className="rounded-lg border border-[#ded5cc] px-3 py-2 text-sm text-[#8b7c70]">請於上方四格管理</span>
                          ) : (
                            <button onClick={() => setForm({ ...row })} className="rounded-lg border border-[#ded5cc] px-3 py-2 text-sm transition hover:bg-[#f6f2eb]">編輯</button>
                          )}
                          {tab !== "orders" && tab !== "banners" && <button onClick={() => remove(row)} className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 transition hover:bg-red-50">刪除</button>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {tab === "products" && filteredProductRows.length > 0 && productPageCount > 1 && (
                <nav aria-label="產品分頁" className="mt-6 flex flex-wrap items-center justify-center gap-2">
                  <button disabled={productPage === 1} onClick={() => setProductPage((page) => Math.max(1, page - 1))} className="inline-flex items-center gap-1 rounded-lg border border-[#ded5cc] bg-white px-3 py-2 text-sm transition hover:bg-[#f6f2eb] disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft className="h-4 w-4" />上一頁</button>
                  {getPageNumbers(productPage, productPageCount).map((page, index) => page === "ellipsis" ? <span key={`ellipsis-${index}`} className="px-1 text-[#8b7c70]">…</span> : <button key={page} onClick={() => setProductPage(page)} aria-current={page === productPage ? "page" : undefined} className={`min-w-9 rounded-lg px-3 py-2 text-sm transition ${page === productPage ? "bg-[#2f4a3c] text-white" : "border border-[#ded5cc] bg-white hover:bg-[#f6f2eb]"}`}>{page}</button>)}
                  <button disabled={productPage === productPageCount} onClick={() => setProductPage((page) => Math.min(productPageCount, page + 1))} className="inline-flex items-center gap-1 rounded-lg border border-[#ded5cc] bg-white px-3 py-2 text-sm transition hover:bg-[#f6f2eb] disabled:cursor-not-allowed disabled:opacity-40">下一頁<ChevronRight className="h-4 w-4" /></button>
                  <span className="basis-full text-center text-xs text-[#8b7c70]">顯示第 {firstVisibleProduct}–{lastVisibleProduct} 項，共 {filteredProductRows.length} 項</span>
                </nav>
              )}
            </>
          ))}
        </main>
      </div>
    </div>
  );
}

function Editor({ tab, form, setForm, categories, onSave, onCancel }: { tab: Tab; form: Row; setForm: (r: Row) => void; categories: Row[]; onSave: () => void; onCancel: () => void }) {
  const [uploading, setUploading] = useState(false);
  const [uploadNotice, setUploadNotice] = useState("");

  async function uploadFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;

    const current = parseImageUrls(form.images);
    const remaining = MAX_PRODUCT_IMAGES - current.length;
    if (remaining <= 0) {
      setUploadNotice(`產品最多只能設定 ${MAX_PRODUCT_IMAGES} 張圖片，請先移除現有圖片。`);
      return;
    }

    const selectedFiles = files.slice(0, remaining);
    setUploadNotice(files.length > remaining ? `已達上限，只會上傳前 ${remaining} 張圖片。` : "");
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of selectedFiles) {
        const data = new FormData();
        data.append("file", file);
        const response = await fetch("/api/admin/upload", { method: "POST", body: data });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "上傳失敗");
        if (typeof result.url === "string" && result.url.trim()) urls.push(result.url.trim());
      }
      setForm({ ...form, images: parseImageUrls([...current, ...urls]) });
    } catch (error) {
      setUploadNotice(error instanceof Error ? error.message : "圖片上傳失敗，請稍後再試。");
    } finally {
      setUploading(false);
    }
  }

  async function uploadSingle(event: React.ChangeEvent<HTMLInputElement>, key: string) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploadNotice("");
    setUploading(true);
    try {
      const data = new FormData();
      data.append("file", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body: data });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "上傳失敗");
      setForm({ ...form, [key]: result.url });
    } catch (error) {
      setUploadNotice(error instanceof Error ? error.message : "圖片上傳失敗，請稍後再試。");
    } finally {
      setUploading(false);
    }
  }

  function removeProductImage(index: number) {
    const urls = parseImageUrls(form.images).filter((_, urlIndex) => urlIndex !== index);
    setForm({ ...form, images: urls });
  }

  const productImages = parseImageUrls(form.images);

  const field = (key: string, label: string, type = "text") => (
    <label className="block text-sm">
      <span className="mb-1 block font-medium">{label}</span>
      <input type={type} value={Array.isArray(form[key]) ? form[key].join("\n") : (form[key] ?? "")} onChange={(event) => setForm({ ...form, [key]: type === "number" ? Number(event.target.value) : event.target.value })} className="w-full rounded-lg border border-[#ded5cc] bg-white px-3 py-2 outline-none focus:border-[#a36b42]" />
    </label>
  );

  return (
    <section className="mb-5 rounded-2xl bg-white p-5 shadow-sm">
      {tab === "banners" && !form.id && <div className="mb-4 rounded-xl bg-[#f7efe7] px-4 py-3 text-sm text-[#805536]">新增 Banner 預設會加入現有 slider。如要只保留這一張 Banner，請勾選「覆蓋現有 Banner」再儲存。</div>}
      <div className="grid gap-4 md:grid-cols-2">
        {tab === "products" && <>
          {field("name", "產品名稱")}
          {field("mofu_sku", "Mofu SKU")}
          {field("price", "售價", "number")}
          {field("original_price", "原價", "number")}
          {field("stock", "庫存", "number")}
          <div className="md:col-span-2">
            <label className="block text-sm">
              <span className="mb-1 block font-medium">圖片 URL（最多 {MAX_PRODUCT_IMAGES} 張，每行一個）</span>
              <textarea
                rows={4}
                value={Array.isArray(form.images) ? form.images.join("\n") : String(form.images || "")}
                onChange={(event) => setForm({ ...form, images: event.target.value })}
                placeholder="可貼上圖片網址，每行一個"
                className="w-full resize-y rounded-lg border border-[#ded5cc] bg-white px-3 py-2 outline-none focus:border-[#a36b42]"
              />
            </label>
            <div className="mt-2 flex items-center justify-between gap-3 text-xs text-[#8b7c70]">
              <span>已設定 {productImages.length} / {MAX_PRODUCT_IMAGES} 張</span>
              <span>上傳後網址會自動填入上方欄位</span>
            </div>
            {productImages.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {productImages.map((url, index) => (
                  <div key={`${url}-${index}`} className="group relative overflow-hidden rounded-xl border border-[#eaded5] bg-[#fffaf4]">
                    <img src={url} alt={`產品圖片 ${index + 1}`} className="aspect-square w-full object-cover" loading="lazy" />
                    <button type="button" onClick={() => removeProductImage(index)} className="absolute right-1.5 top-1.5 rounded-full bg-white/90 px-2 py-1 text-xs text-red-600 shadow-sm transition hover:bg-white">移除</button>
                    <p className="truncate px-2 py-1.5 text-[10px] text-[#8b7c70]">圖片 {index + 1}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <label className="block text-sm md:col-span-2">
            <span className="mb-1 block font-medium">上傳產品圖片</span>
            <span className="mb-2 block text-xs text-[#8b7c70]">可一次選擇多張圖片，或稍後重複上載；最多 {MAX_PRODUCT_IMAGES} 張，每張上限 8 MB。</span>
            <input type="file" accept="image/*" multiple onChange={uploadFiles} disabled={uploading || productImages.length >= MAX_PRODUCT_IMAGES} className="w-full rounded-lg border border-dashed border-[#c9b8a8] px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50" />
            {uploading && <span className="mt-1 block text-xs text-[#a36b42]">上傳中…</span>}
            {uploadNotice && <span className="mt-1 block text-xs text-[#a36b42]">{uploadNotice}</span>}
          </label>
          {field("description", "產品描述（中文）")}
          {field("name_en", "English product name（英文前台與 Checkout 顯示）")}
          {field("description_en", "English product description（英文前台顯示）")}
          {field("seo_title", "SEO 標題")}
          {field("seo_description", "SEO 描述")}
          <label className="block text-sm"><span className="mb-1 block font-medium">分類</span><select value={form.category_id || ""} onChange={(event) => setForm({ ...form, category_id: event.target.value })} className="w-full rounded-lg border border-[#ded5cc] px-3 py-2"><option value="">未分類</option>{categoryGroups(categories).map(({ root, entries }) => <optgroup key={root.id} label={root.name}>{entries.map(({ category, depth }) => <option key={category.id} value={category.id}>{depth === 0 ? `${category.name}（全部子分類）` : categoryOptionLabel(category.name, depth)}</option>)}</optgroup>)}</select></label>
          <label className="block text-sm"><span className="mb-1 block font-medium">產品狀態</span><select value={form.status || "draft"} onChange={(event) => setForm({ ...form, status: event.target.value })} className="w-full rounded-lg border border-[#ded5cc] px-3 py-2"><option value="published">published（上架）</option><option value="draft">draft（草稿）</option><option value="archived">archived（歸檔）</option></select></label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_published !== false} onChange={(event) => setForm({ ...form, is_published: event.target.checked })} />已發布到前台</label>
        </>}
        {tab === "categories" && <>{field("name", "分類名稱（後台系統名稱）")}{field("name_zh", "中文分類名稱（中文頁面顯示）")}{field("name_en", "English category name（英文頁面顯示）")}{field("slug", "Slug")}          <label className="block text-sm"><span className="mb-1 block font-medium">父分類</span><select value={form.parent_id || ""} onChange={(event) => setForm({ ...form, parent_id: event.target.value })} className="w-full rounded-lg border border-[#ded5cc] px-3 py-2"><option value="">頂層分類</option>{categoryGroups(categories, String(form.id || "")).map(({ root, entries }) => <optgroup key={root.id} label={root.name}>{entries.map(({ category, depth }) => <option key={category.id} value={category.id}>{categoryOptionLabel(category.name, depth + 1)}</option>)}</optgroup>)}</select></label>{field("image_url", "封面圖片 URL")}<label className="block text-sm"><span className="mb-1 block font-medium">上傳封面</span><input type="file" accept="image/*" onChange={(event) => uploadSingle(event, "image_url")} className="w-full rounded-lg border border-dashed border-[#c9b8a8] px-3 py-2 text-sm" />{uploading && <span className="text-xs text-[#a36b42]">上傳中…</span>}</label>{field("sort_order", "排序", "number")}</>}
        {tab === "banners" && <>{field("image_url", "桌面版圖片 URL")}<label className="block text-sm"><span className="mb-1 block font-medium">上傳桌面版 Banner</span><input type="file" accept="image/*" onChange={(event) => uploadSingle(event, "image_url")} className="w-full rounded-lg border border-dashed border-[#c9b8a8] px-3 py-2 text-sm" />{uploading && <span className="text-xs text-[#a36b42]">上傳中…</span>}</label>{field("mobile_image_url", "手機版圖片 URL（選填）")}<label className="block text-sm"><span className="mb-1 block font-medium">上傳手機版 Banner</span><span className="mb-2 block text-xs text-[#8b7c70]">建議直向構圖（約 4:5）；留空時手機會沿用桌面版圖片。</span><input type="file" accept="image/*" onChange={(event) => uploadSingle(event, "mobile_image_url")} className="w-full rounded-lg border border-dashed border-[#c9b8a8] px-3 py-2 text-sm" />{uploading && <span className="text-xs text-[#a36b42]">上傳中…</span>}</label>{field("link", "點擊連結")}{field("title", "標題")}{field("sort_order", "排序", "number")}{!form.id && <label className="flex items-center gap-2 text-sm md:col-span-2"><input type="checkbox" checked={form.replace_existing === true} onChange={(event) => setForm({ ...form, replace_existing: event.target.checked })} />覆蓋現有 Banner（勾選後才會清除舊 slider）</label>}</>}
        {tab === "coupons" && <>{field("code", "優惠碼")}{field("discount_amount", "折扣金額／百分比", "number")}<label className="block text-sm"><span className="mb-1 block font-medium">折扣類型</span><select value={form.discount_type} onChange={(event) => setForm({ ...form, discount_type: event.target.value })} className="w-full rounded-lg border border-[#ded5cc] px-3 py-2"><option value="fixed">固定金額 HKD</option><option value="percentage">百分比</option></select></label><label className="flex items-center gap-2 pt-7 text-sm"><input type="checkbox" checked={Boolean(form.active)} onChange={(event) => setForm({ ...form, active: event.target.checked })} />啟用優惠碼</label></>}
        {tab === "store_settings" && <>{field("key", "設定 Key")}{field("value", "設定值（Secret Key 儲存後會遮罩）")}</>}
        {tab === "orders" && <p className="text-sm">顧客資料：{JSON.stringify(form.customer_info || {})}<br />商品：{JSON.stringify(form.items || [])}<br />狀態：{form.status}</p>}
      </div>
      <div className="mt-5 flex gap-2"><button onClick={onSave} disabled={uploading} className="rounded-lg bg-[#2f4a3c] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#22372d] disabled:opacity-50">儲存</button><button onClick={onCancel} className="rounded-lg border border-[#ded5cc] px-4 py-2 text-sm transition hover:bg-[#f6f2eb]">取消</button></div>
    </section>
  );
}


function BannerBatchEditor({
  slots,
  onChange,
  onSave,
  saving,
  notice,
}: {
  slots: BannerSlot[];
  onChange: (slots: BannerSlot[]) => void;
  onSave: () => void;
  saving: boolean;
  notice: string;
}) {
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState("");

  function updateSlot(index: number, patch: Partial<BannerSlot>) {
    onChange(slots.map((slot, slotIndex) => (slotIndex === index ? { ...slot, ...patch } : slot)));
  }

  async function uploadBannerImage(event: React.ChangeEvent<HTMLInputElement>, index: number, field: "image_url" | "mobile_image_url") {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploadError("");
    setUploadingSlot(`${index}-${field}`);
    try {
      const data = new FormData();
      data.append("file", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body: data });
      const result = await response.json();
      if (!response.ok || typeof result.url !== "string" || !result.url.trim()) {
        throw new Error(result.error || "圖片上傳失敗");
      }
      updateSlot(index, { [field]: result.url.trim() });
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "圖片上傳失敗，請稍後再試。" );
    } finally {
      setUploadingSlot(null);
    }
  }

  return (
    <section className="mb-5 rounded-2xl bg-white p-5 shadow-sm">
      <div className="mb-5 max-w-3xl">
        <p className="text-sm font-semibold text-[#2f4a3c]">四組 Banner 批量管理</p>
        <p className="mt-1 text-sm leading-6 text-[#806b5d]">一次過設定最多四組輪播資料。按「儲存全部 Banner」時，系統會以本頁有桌面版圖片的欄位作為完整新輪播，並清除所有舊資料。至少填寫兩組才會啟用前台自動輪播；四格均留空則會清空所有 Banner。</p>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {slots.map((slot, index) => {
          const desktopUploading = uploadingSlot === `${index}-image_url`;
          const mobileUploading = uploadingSlot === `${index}-mobile_image_url`;
          return (
            <fieldset key={index} className="rounded-2xl border border-[#eaded5] bg-[#fffdfa] p-4">
              <legend className="rounded-full bg-[#2f4a3c] px-3 py-1 text-sm font-semibold text-white">Banner {index + 1}</legend>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">桌面版圖片 <span className="text-red-600">*</span></label>
                  <div className="aspect-[16/9] overflow-hidden rounded-xl border border-dashed border-[#c9b8a8] bg-[#f7efe7]">
                    {slot.image_url ? <img src={slot.image_url} alt={`Banner ${index + 1} 桌面版預覽`} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center px-3 text-center text-xs text-[#a89587]">建議使用 16:9 或更寬的橫向圖片</div>}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => uploadBannerImage(event, index, "image_url")}
                    disabled={Boolean(uploadingSlot)}
                    className="w-full rounded-lg border border-dashed border-[#c9b8a8] px-3 py-2 text-xs disabled:cursor-wait disabled:opacity-60"
                  />
                  {desktopUploading && <p className="text-xs text-[#a36b42]">桌面版上傳中…</p>}
                  <input
                    aria-label={`Banner ${index + 1} 桌面版圖片 URL`}
                    value={slot.image_url}
                    onChange={(event) => updateSlot(index, { image_url: event.target.value })}
                    placeholder="或貼上桌面版圖片 URL"
                    className="w-full rounded-lg border border-[#ded5cc] bg-white px-3 py-2 text-xs outline-none focus:border-[#a36b42]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">手機版圖片 <span className="font-normal text-[#8b7c70]">（選填）</span></label>
                  <div className="aspect-[4/5] max-h-56 overflow-hidden rounded-xl border border-dashed border-[#c9b8a8] bg-[#f7efe7]">
                    {slot.mobile_image_url || slot.image_url ? <img src={slot.mobile_image_url || slot.image_url} alt={`Banner ${index + 1} 手機版預覽`} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center px-3 text-center text-xs text-[#a89587]">建議使用 4:5 直向圖片；留空會沿用桌面版</div>}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => uploadBannerImage(event, index, "mobile_image_url")}
                    disabled={Boolean(uploadingSlot)}
                    className="w-full rounded-lg border border-dashed border-[#c9b8a8] px-3 py-2 text-xs disabled:cursor-wait disabled:opacity-60"
                  />
                  {mobileUploading && <p className="text-xs text-[#a36b42]">手機版上傳中…</p>}
                  <input
                    aria-label={`Banner ${index + 1} 手機版圖片 URL`}
                    value={slot.mobile_image_url}
                    onChange={(event) => updateSlot(index, { mobile_image_url: event.target.value })}
                    placeholder="或貼上手機版圖片 URL"
                    className="w-full rounded-lg border border-[#ded5cc] bg-white px-3 py-2 text-xs outline-none focus:border-[#a36b42]"
                  />
                </div>

                <label className="block text-sm sm:col-span-2">
                  <span className="mb-1 block font-medium">點擊連結 <span className="font-normal text-[#8b7c70]">（選填）</span></span>
                  <input value={slot.link} onChange={(event) => updateSlot(index, { link: event.target.value })} placeholder="例如：/menu 或 https://example.com" className="w-full rounded-lg border border-[#ded5cc] bg-white px-3 py-2 text-sm outline-none focus:border-[#a36b42]" />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-medium">標題 <span className="font-normal text-[#8b7c70]">（選填）</span></span>
                  <input value={slot.title} onChange={(event) => updateSlot(index, { title: event.target.value })} placeholder="供無障礙標示及圖片描述使用" className="w-full rounded-lg border border-[#ded5cc] bg-white px-3 py-2 text-sm outline-none focus:border-[#a36b42]" />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-medium">排序</span>
                  <input type="number" min="0" step="1" value={slot.sort_order} onChange={(event) => updateSlot(index, { sort_order: Number(event.target.value) })} className="w-full rounded-lg border border-[#ded5cc] bg-white px-3 py-2 text-sm outline-none focus:border-[#a36b42]" />
                </label>
              </div>
            </fieldset>
          );
        })}
      </div>

      {uploadError && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{uploadError}</p>}
      {notice && <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</p>}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button onClick={onSave} disabled={saving || Boolean(uploadingSlot)} className="rounded-lg bg-[#2f4a3c] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#22372d] disabled:cursor-wait disabled:opacity-60">{saving ? "儲存中…" : "儲存全部 Banner"}</button>
        <span className="text-xs text-[#8b7c70]">有桌面版圖片的欄位會依「排序」由小至大顯示；已填寫的 Banner 不可使用相同排序。</span>
      </div>
    </section>
  );
}


function FeaturedPetBatchEditor({
  slots,
  onChange,
  onSave,
  saving,
  notice,
}: {
  slots: FeaturedPetSlot[];
  onChange: (slots: FeaturedPetSlot[]) => void;
  onSave: () => void;
  saving: boolean;
  notice: string;
}) {
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState("");

  function updateSlot(index: number, patch: Partial<FeaturedPetSlot>) {
    onChange(slots.map((slot, slotIndex) => (slotIndex === index ? { ...slot, ...patch } : slot)));
  }

  async function uploadPetImage(event: React.ChangeEvent<HTMLInputElement>, index: number) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploadError("");
    setUploadingSlot(index);
    try {
      const data = new FormData();
      data.append("file", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body: data });
      const result = await response.json();
      if (!response.ok || typeof result.url !== "string" || !result.url.trim()) {
        throw new Error(result.error || "圖片上傳失敗");
      }
      updateSlot(index, { image_url: result.url.trim() });
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "圖片上傳失敗，請稍後再試。");
    } finally {
      setUploadingSlot(null);
    }
  }

  return (
    <section className="mb-5 rounded-2xl bg-white p-5 shadow-sm">
      <div className="mb-5 max-w-3xl">
        <p className="text-sm font-semibold text-[#2f4a3c]">精選寵物專區內容管理</p>
        <p className="mt-1 text-sm leading-6 text-[#806b5d]">一次過管理最多 {MAX_FEATURED_PETS} 個首頁內容槽。每個已使用的槽位均需填寫高清圖片、標題及詳細描述；連結及是否顯示則按需要設定。儲存後，首頁「精選寵物專區」會直接使用本頁的內容。</p>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {slots.map((slot, index) => {
          const uploading = uploadingSlot === index;
          return (
            <fieldset key={index} className="rounded-2xl border border-[#eaded5] bg-[#fffdfa] p-4">
              <legend className="rounded-full bg-[#2f4a3c] px-3 py-1 text-sm font-semibold text-white">內容槽 {index + 1}</legend>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">高清寵物圖片 <span className="text-red-600">*</span></label>
                  <div className="aspect-[4/3] overflow-hidden rounded-xl border border-dashed border-[#c9b8a8] bg-[#f7efe7]">
                    {slot.image_url ? <img src={slot.image_url} alt={`內容槽 ${index + 1} 預覽`} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center px-4 text-center text-xs leading-5 text-[#a89587]">建議使用高畫質、寬幅橫向寵物相片</div>}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => uploadPetImage(event, index)}
                    disabled={uploadingSlot !== null}
                    className="w-full rounded-lg border border-dashed border-[#c9b8a8] px-3 py-2 text-xs disabled:cursor-wait disabled:opacity-60"
                  />
                  {uploading && <p className="text-xs text-[#a36b42]">圖片上傳中…</p>}
                  <input
                    aria-label={`內容槽 ${index + 1} 圖片 URL`}
                    value={slot.image_url}
                    onChange={(event) => updateSlot(index, { image_url: event.target.value })}
                    placeholder="或貼上圖片 URL"
                    className="w-full rounded-lg border border-[#ded5cc] bg-white px-3 py-2 text-xs outline-none focus:border-[#a36b42]"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <label className="block text-sm">
                    <span className="mb-1 block font-medium">標題 <span className="text-red-600">*</span></span>
                    <input value={slot.title} onChange={(event) => updateSlot(index, { title: event.target.value })} placeholder="例如：午後陽光下的小夥伴" className="w-full rounded-lg border border-[#ded5cc] bg-white px-3 py-2 text-sm outline-none focus:border-[#a36b42]" />
                  </label>
                  <label className="block text-sm">
                    <span className="mb-1 block font-medium">English title <span className="font-normal text-[#8b7c70]">（選填；英文版顯示）</span></span>
                    <input value={slot.title_en} onChange={(event) => updateSlot(index, { title_en: event.target.value })} placeholder="For example: A gentle afternoon nap" className="w-full rounded-lg border border-[#ded5cc] bg-white px-3 py-2 text-sm outline-none focus:border-[#a36b42]" />
                  </label>
                  <label className="block text-sm">
                    <span className="mb-1 block font-medium">點擊連結 <span className="font-normal text-[#8b7c70]">（選填）</span></span>
                    <input value={slot.link} onChange={(event) => updateSlot(index, { link: event.target.value })} placeholder="例如：/menu 或 https://example.com" className="w-full rounded-lg border border-[#ded5cc] bg-white px-3 py-2 text-sm outline-none focus:border-[#a36b42]" />
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block text-sm">
                      <span className="mb-1 block font-medium">排序</span>
                      <input type="number" min="0" step="1" value={slot.sort_order} onChange={(event) => updateSlot(index, { sort_order: Number(event.target.value) })} className="w-full rounded-lg border border-[#ded5cc] bg-white px-3 py-2 text-sm outline-none focus:border-[#a36b42]" />
                    </label>
                    <label className="flex items-end gap-2 pb-2 text-sm">
                      <input type="checkbox" checked={slot.is_published} onChange={(event) => updateSlot(index, { is_published: event.target.checked })} />
                      前台顯示
                    </label>
                  </div>
                </div>

                <label className="block text-sm sm:col-span-2">
                  <span className="mb-1 block font-medium">詳細描述 <span className="text-red-600">*</span></span>
                  <textarea value={slot.description} onChange={(event) => updateSlot(index, { description: event.target.value })} rows={4} placeholder="寫下這位毛孩的個性、日常或推廣內容…" className="w-full resize-y rounded-lg border border-[#ded5cc] bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-[#a36b42]" />
                </label>
                <label className="block text-sm sm:col-span-2">
                  <span className="mb-1 block font-medium">English description <span className="font-normal text-[#8b7c70]">（選填；英文版顯示）</span></span>
                  <textarea value={slot.description_en} onChange={(event) => updateSlot(index, { description_en: event.target.value })} rows={4} placeholder="Write the English story, personality, or promotion copy…" className="w-full resize-y rounded-lg border border-[#ded5cc] bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-[#a36b42]" />
                </label>
              </div>
            </fieldset>
          );
        })}
      </div>

      {uploadError && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{uploadError}</p>}
      {notice && <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</p>}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button onClick={onSave} disabled={saving || uploadingSlot !== null} className="rounded-lg bg-[#2f4a3c] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#22372d] disabled:cursor-wait disabled:opacity-60">{saving ? "儲存中…" : "儲存所有精選內容"}</button>
        <span className="text-xs text-[#8b7c70]">有圖片的內容槽會依「排序」由小至大展示；清空所有圖片後儲存，即可從首頁移除整個內容集。</span>
      </div>
    </section>
  );
}
