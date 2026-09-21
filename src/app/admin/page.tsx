"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, ChevronDown, ChevronLeft, ChevronRight, Download, Search, Upload, X } from "lucide-react";
import { MAX_FEATURED_PETS } from "@/lib/featured-pets";
import { getBundleComponents } from "@/lib/bundles";

type Row = Record<string, any>;
type Tab = "products" | "draft_products" | "brands" | "categories" | "banners" | "featured_pets" | "coupons" | "orders" | "store_settings";

const PAGE_SIZE = 20;
function isProductTab(tab: Tab) { return tab === "products" || tab === "draft_products"; }
const MAX_PRODUCT_IMAGES = 8;
const BANNER_SLOT_COUNT = 4;
const DEFAULT_JPY_TO_HKD = 0.052;
const DEFAULT_SHIPPING_HKD = 8;
const DEFAULT_MARKUP_MULTIPLIER = 2.2;

function pricingPreview(costJpy: unknown, shippingHkd: unknown, markupMultiplier: unknown, exchangeRate: unknown, price: unknown) {
  const jpy = Number(costJpy) || 0;
  const shipping = Number(shippingHkd) || 0;
  const multiplier = Number(markupMultiplier) || DEFAULT_MARKUP_MULTIPLIER;
  const rate = Number(exchangeRate) || DEFAULT_JPY_TO_HKD;
  const costHkd = jpy * rate + shipping;
  const suggestedPrice = Math.round(costHkd * multiplier);
  const retailPrice = Number(price) || 0;
  const margin = (sellPrice: number) => sellPrice > 0 ? ((sellPrice - costHkd) / sellPrice) * 100 : 0;
  return { costHkd, suggestedPrice, retailPrice, margin };
}

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
  { id: "products", label: "\u7522\u54c1\u7ba1\u7406" },
  { id: "draft_products", label: "\u672a\u4e0a\u67b6\u7522\u54c1" },
  { id: "brands", label: "\u54c1\u724c\u7ba1\u7406" },
  { id: "categories", label: "\u5206\u985e\u5361\u7247" },
  { id: "banners", label: "Banner \u8f2a\u64ad" },
  { id: "featured_pets", label: "\u7cbe\u9078\u5bf5\u7269\u5c08\u5340" },
  { id: "coupons", label: "\u512a\u60e0\u78bc" },
  { id: "orders", label: "\u8a02\u55ae\u7ba1\u7406" },
  { id: "store_settings", label: "\u7cfb\u7d71\u8207 API" },
];

async function call(method: string, body?: Row, table?: string) {
  const response = await fetch("/api/admin" + (method === "GET" ? `?table=${table}` : ""), {
    method,
    headers: { "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(json.error || `\u64cd\u4f5c\u5931\u6557（HTTP ${response.status}）`);
  return json;
}

function defaultRow(tab: Tab): Row {
  if (tab === "products" || tab === "draft_products") return { name: "", name_en: "", cost_jpy: 0, shipping_hkd: DEFAULT_SHIPPING_HKD, markup_multiplier: DEFAULT_MARKUP_MULTIPLIER, exchange_rate: DEFAULT_JPY_TO_HKD, price: 0, original_price: "", stock: 0, description: "", description_en: "", images: [], category_id: "", brand_id: "", mofu_sku: "", status: "published", is_published: true, seo_title: "", seo_description: "" };
  if (tab === "brands") return { name: "", slug: "", logo_url: "", description: "", sort_order: 0, is_active: true };
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

const ORDER_STATUSES = [["pending", "\u5f85\u8655\u7406"], ["processing", "\u5099\u8ca8\u4e2d"], ["shipped", "\u5df2\u5bc4\u51fa"], ["completed", "\u5df2\u5b8c\u6210"], ["cancelled", "\u5df2\u53d6\u6d88"]] as const;
function parseJsonValue(value: unknown): any { if (typeof value !== "string") return value || {}; try { return JSON.parse(value); } catch { return {}; } }
function orderCustomer(value: unknown): Record<string, any> { const parsed = parseJsonValue(value); return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {}; }
function orderItems(value: unknown): any[] { const parsed = parseJsonValue(value); return Array.isArray(parsed) ? parsed : []; }
function orderDate(value: unknown): string { if (!value) return "—"; const date = new Date(String(value)); if (Number.isNaN(date.getTime())) return String(value); return new Intl.DateTimeFormat("zh-HK", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).format(date).replaceAll("/", "-"); }
function orderMoney(value: unknown): string { return `HK$${(Number(value) || 0).toFixed(2)}`; }

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("products");
  const [rows, setRows] = useState<Row[]>([]);
  const [categories, setCategories] = useState<Row[]>([]);
  const [brands, setBrands] = useState<Row[]>([]);
  const [form, setForm] = useState<Row | null>(null);
  const [bannerSlots, setBannerSlots] = useState<BannerSlot[]>(() => toBannerSlots([]));
  const [bannerSaving, setBannerSaving] = useState(false);
  const [bannerAutoplayEnabled, setBannerAutoplayEnabled] = useState(false);
  const [bannerAutoplaySaving, setBannerAutoplaySaving] = useState(false);
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
  const [openQuickEditProductId, setOpenQuickEditProductId] = useState<string | null>(null);
  const [quickEditDraft, setQuickEditDraft] = useState<Row | null>(null);
  const [quickEditSaving, setQuickEditSaving] = useState(false);
  const [quickEditError, setQuickEditError] = useState<string | null>(null);
  const [csvBusy, setCsvBusy] = useState(false);
  const [csvNotice, setCsvNotice] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [barcodeProduct, setBarcodeProduct] = useState<Row | null>(null);
  const [barcodeDraft, setBarcodeDraft] = useState<Row | null>(null);
  const [barcodeSaving, setBarcodeSaving] = useState(false);
  const [barcodeNotice, setBarcodeNotice] = useState("");

  const load = async (selected = tab) => {
    setLoading(true);
    setError("");
    try {
      const result = await call("GET", undefined, selected === "draft_products" ? "products" : selected);
      const loadedRows = result.data || [];
      setRows(selected === "draft_products" ? loadedRows.filter((row: Row) => row.status !== "published" || row.is_published === false || Number(row.stock) <= 0 || !String(row.name || "").trim() || !String(row.name_en || "").trim() || !String(row.description || "").trim() || !String(row.description_en || "").trim() || !Number(row.price) || !Array.isArray(row.images) || !row.images.some((image: unknown) => typeof image === "string" && /^https?:\/\//i.test(image))) : loadedRows);
      if (selected === "banners") {
        setBannerSlots(toBannerSlots(loadedRows));
        const settings = await call("GET", undefined, "store_settings");
        const autoplay = (settings.data || []).find((row: Row) => row.key === "banner_autoplay_enabled")?.value;
        setBannerAutoplayEnabled(String(autoplay || "false").toLowerCase() === "true");
      }
      if (selected === "featured_pets") {
        setFeaturedPetSlots(toFeaturedPetSlots(loadedRows));
      }
      if (selected === "categories") {
        setCategories(result.data || []);
      } else if (selected === "brands") {
        setBrands(result.data || []);
      } else if (selected === "products" || selected === "draft_products") {
        const c = await call("GET", undefined, "categories");
        setCategories(c.data || []);
        const b = await call("GET", undefined, "brands");
        setBrands(b.data || []);
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
    if (!isProductTab(tab)) {
      setProductQuery("");
      setProductCategory("all");
      setProductPage(1);
    }
  }, [tab]);

  const title = useMemo(() => tabs.find((item) => item.id === tab)?.label, [tab]);

  const filteredProductRows = useMemo(() => {
    if (!isProductTab(tab)) return [];
    const query = productQuery.trim().toLocaleLowerCase();
    return rows.filter((row) => {
      const matchesQuery = !query || getProductSearchText(row, categories).includes(query);
      const matchesCategory = productCategory === "all" || String(row.category_id || "") === productCategory;
      return matchesQuery && matchesCategory;
    });
  }, [rows, categories, productQuery, productCategory, tab]);

  const productPageCount = Math.max(1, Math.ceil(filteredProductRows.length / PAGE_SIZE));
  const visibleRows = isProductTab(tab)
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
    setError("");
    try {
      const normalized = { ...form };
      const replaceExisting = tab === "banners" && !form.id && normalized.replace_existing === true;
      delete normalized.replace_existing;
      if (isProductTab(tab)) {
        normalized.images = parseImageUrls(normalized.images);
      }
      if (tab === "categories") {
        normalized.parent_id = normalized.parent_id || null;
        if (normalized.parent_id === normalized.id) {
          setError("\u5206\u985e\u4e0d\u53ef\u8a2d\u70ba\u81ea\u8eab\u7684\u7236\u5206\u985e");
          return;
        }
      }
      const dataTable = isProductTab(tab) ? "products" : tab;
      if (form.id) {
        await call("PATCH", { table: dataTable, id: form.id, row: normalized });
      } else {
        await call("POST", { table: dataTable, row: normalized, ...(tab === "banners" ? { replaceExisting } : {}) });
      }
      setForm(null);
      await load();
    } catch (e: any) {
      const message = e?.message || "\u5132\u5b58\u5931\u6557，\u8acb\u6aa2\u67e5\u7522\u54c1\u8cc7\u6599\u5f8c\u518d\u8a66。";
      setError(`\u5132\u5b58\u5931\u6557：${message}`);
      window.alert(`\u5132\u5b58\u5931\u6557\n\n${message}`);
    }
  }

  async function exportProductsCsv() {
    setCsvBusy(true);
    setCsvNotice("");
    try {
      const response = await fetch("/api/admin/products/csv");
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || "CSV \u532f\u51fa\u5931\u6557");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `mofu-products-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setCsvNotice(`\u5df2\u532f\u51fa ${rows.length} \u9805\u7522\u54c1`);
    } catch (e: any) {
      setCsvNotice(e.message || "CSV \u532f\u51fa\u5931\u6557");
    } finally {
      setCsvBusy(false);
    }
  }

  async function exportProductsExcel() {
    setCsvBusy(true);
    setCsvNotice("");
    try {
      const response = await fetch("/api/admin/products/csv?format=xlsx");
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || "Excel \u532f\u51fa\u5931\u6557");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `mofu-products-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setCsvNotice(`\u5df2\u4e0b\u8f09 Excel，\u5305\u542b ${rows.length} \u9805\u7522\u54c1，\u53ef\u76f4\u63a5\u4fee\u6539\u5f8c\u91cd\u65b0\u532f\u5165`);
    } catch (e: any) {
      setCsvNotice(e.message || "Excel \u532f\u51fa\u5931\u6557");
    } finally {
      setCsvBusy(false);
    }
  }

  async function importProductsCsv(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!/\.(csv|xlsx|xls)$/i.test(file.name)) {
      setCsvNotice("\u8acb\u9078\u64c7 .csv、.xlsx \u6216 .xls \u6a94\u6848");
      return;
    }
    setCsvBusy(true);
    setCsvNotice("");
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/admin/products/csv", { method: "POST", body });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Excel／CSV \u532f\u5165\u5931\u6557");
      const summary = `\u532f\u5165\u5b8c\u6210：\u65b0\u589e ${result.created} \u9805、\u66f4\u65b0 ${result.updated} \u9805${result.failed ? `、\u5931\u6557 ${result.failed} \u9805` : ""}`;
      setCsvNotice(result.errors?.length ? `${summary}。${result.errors.slice(0, 3).join("；")}` : summary);
      await load("products");
    } catch (e: any) {
      setCsvNotice(e.message || "CSV \u532f\u5165\u5931\u6557");
    } finally {
      setCsvBusy(false);
    }
  }

  async function saveFeaturedPetBatch() {
    const hasIncompleteSlot = featuredPetSlots.some((slot) => {
      const hasImage = slot.image_url.trim().length > 0;
      const hasOtherContent = Boolean(slot.title.trim() || slot.description.trim() || slot.link.trim());
      return !hasImage && hasOtherContent;
    });
    if (hasIncompleteSlot) {
      setError("\u5982\u67d0\u4e00\u500b\u5167\u5bb9\u69fd\u5df2\u586b\u5beb\u6a19\u984c、\u63cf\u8ff0\u6216\u9023\u7d50，\u5fc5\u9808\u540c\u6642\u63d0\u4f9b\u5716\u7247。");
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
      setError("\u5df2\u586b\u5beb\u7684\u7cbe\u9078\u5bf5\u7269\u5167\u5bb9\u5fc5\u9808\u4f7f\u7528\u4e0d\u91cd\u8907\u4e14\u70ba 0 \u6216\u4ee5\u4e0a\u7684\u6574\u6578\u6392\u5e8f。");
      return;
    }
    if (pets.some((pet) => !pet.title || !pet.description)) {
      setError("\u6bcf\u500b\u5df2\u586b\u5beb\u5716\u7247\u7684\u5167\u5bb9\u69fd\u5fc5\u9808\u540c\u6642\u63d0\u4f9b\u6a19\u984c\u53ca\u8a73\u7d30\u63cf\u8ff0。");
      return;
    }

    setFeaturedPetSaving(true);
    setError("");
    setFeaturedPetNotice("");
    try {
      const result = await call("POST", { action: "replace_featured_pets", pets });
      setFeaturedPetNotice(result.count === 0 ? "\u5df2\u6e05\u7a7a\u7cbe\u9078\u5bf5\u7269\u5c08\u5340，\u9996\u9801\u4e0d\u6703\u986f\u793a\u4efb\u4f55\u5beb\u771f。" : `\u5df2\u5132\u5b58 ${result.count} \u500b\u7cbe\u9078\u5bf5\u7269\u5167\u5bb9，\u9996\u9801\u6703\u5373\u6642\u66f4\u65b0。`);
      await load("featured_pets");
    } catch (e: any) {
      setError(e.message || "\u7cbe\u9078\u5bf5\u7269\u5167\u5bb9\u5132\u5b58\u5931\u6557");
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
      setError("\u5982\u67d0\u4e00\u683c\u5df2\u586b\u5beb\u624b\u6a5f\u5716\u7247、\u9023\u7d50\u6216\u6a19\u984c，\u5fc5\u9808\u540c\u6642\u63d0\u4f9b\u684c\u9762\u7248\u5716\u7247。");
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
      setError("\u5df2\u586b\u5beb\u7684 Banner \u5fc5\u9808\u4f7f\u7528\u4e0d\u91cd\u8907\u4e14\u70ba 0 \u6216\u4ee5\u4e0a\u7684\u6574\u6578\u6392\u5e8f。");
      return;
    }

    setBannerSaving(true);
    setError("");
    setBannerNotice("");
    try {
      const result = await call("POST", { action: "replace_banners", banners });
      setBannerNotice(result.count === 0 ? "\u5df2\u6e05\u7a7a\u6240\u6709 Banner \u8cc7\u6599。" : `\u5df2\u5132\u5b58 ${result.count} \u7d44 Banner，\u524d\u53f0\u8f2a\u64ad\u5df2\u4f9d\u6392\u5e8f\u66f4\u65b0。`);
      await load("banners");
    } catch (e: any) {
      setError(e.message || "Banner \u5132\u5b58\u5931\u6557");
    } finally {
      setBannerSaving(false);
    }
  }

  async function saveBannerAutoplay(enabled: boolean) {
    setBannerAutoplaySaving(true);
    setError("");
    try {
      await call("POST", { action: "set_banner_autoplay", enabled });
      setBannerAutoplayEnabled(enabled);
      setBannerNotice(enabled ? "\u5df2\u958b\u555f Banner \u81ea\u52d5\u8f2a\u64ad。" : "\u5df2\u505c\u7528 Banner \u81ea\u52d5\u8f2a\u64ad，\u524d\u53f0\u53ea\u986f\u793a\u7b2c\u4e00\u7d44 Banner。" );
    } catch (e: any) {
      setError(e.message || "Banner \u8f2a\u64ad\u8a2d\u5b9a\u5132\u5b58\u5931\u6557");
    } finally {
      setBannerAutoplaySaving(false);
    }
  }

  async function remove(row: Row) {
    if (!row.id || !confirm("\u78ba\u5b9a\u522a\u9664\u6b64\u9805\u76ee？")) return;
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
      setCategoryQuickError(e.message || "\u5206\u985e\u66f4\u65b0\u5931\u6557");
    } finally {
      setCategorySavingProductId(null);
    }
  }

  function toggleQuickEdit(row: Row) {
    const productId = String(row.id);
    setQuickEditError(null);
    setOpenQuickCategoryProductId(null);
    if (openQuickEditProductId === productId) {
      setOpenQuickEditProductId(null);
      setQuickEditDraft(null);
      return;
    }
    setOpenQuickEditProductId(productId);
    setQuickEditDraft({
      id: row.id,
      cost_jpy: row.cost_jpy ?? "",
      shipping_hkd: row.shipping_hkd ?? DEFAULT_SHIPPING_HKD,
      markup_multiplier: row.markup_multiplier ?? DEFAULT_MARKUP_MULTIPLIER,
      exchange_rate: row.exchange_rate ?? DEFAULT_JPY_TO_HKD,
      price: row.price ?? "",
      original_price: row.original_price ?? "",
      stock: row.stock ?? 0,
      status: row.status === "published" && row.is_published !== false ? "published" : "draft",
      is_published: row.status === "published" && row.is_published !== false,
      pricing_rate_rmb_hkd: row.pricing_rate_rmb_hkd,
    });
  }

  async function saveQuickEdit() {
    if (!quickEditDraft?.id) return;
    const productId = String(quickEditDraft.id);
    setQuickEditSaving(true);
    setQuickEditError(null);
    try {
      const published = quickEditDraft.status === "published";
      const result = await call("PATCH", {
        table: "products",
        id: quickEditDraft.id,
        row: {
          cost_jpy: quickEditDraft.cost_jpy === "" ? 0 : Number(quickEditDraft.cost_jpy),
          shipping_hkd: Number(quickEditDraft.shipping_hkd) || DEFAULT_SHIPPING_HKD,
          markup_multiplier: Number(quickEditDraft.markup_multiplier) || DEFAULT_MARKUP_MULTIPLIER,
          exchange_rate: Number(quickEditDraft.exchange_rate) || DEFAULT_JPY_TO_HKD,
          price: Number(quickEditDraft.price) || 0,
          original_price: quickEditDraft.original_price === "" ? null : Number(quickEditDraft.original_price),
          current_hkd: Number(quickEditDraft.price) || 0,
          stock: Math.max(0, Math.trunc(Number(quickEditDraft.stock) || 0)),
          status: published ? "published" : "draft",
          is_published: published,
        },
      });
      setRows((current) => current.map((item) => (
        String(item.id) === productId
          ? { ...item, ...(result.data || {}), status: published ? "published" : "draft", is_published: published }
          : item
      )));
      setOpenQuickEditProductId(null);
      setQuickEditDraft(null);
    } catch (e: any) {
      setQuickEditError(e.message || "\u5feb\u901f\u5132\u5b58\u5931\u6557");
    } finally {
      setQuickEditSaving(false);
    }
  }

  async function handleBarcode(code: string) {
    const normalized = code.trim();
    if (!normalized) return;
    let match = rows.find((row) => [row.barcode, row.mofu_sku, row.sku, row.store_sku, row.id].some((value) => String(value || "").trim() === normalized));
    if (!match) {
      try {
        const result = await call("GET", undefined, "products");
        match = (result.data || []).find((row: Row) => [row.barcode, row.mofu_sku, row.sku, row.store_sku, row.id].some((value) => String(value || "").trim() === normalized));
      } catch { /* Keep new-product flow available when lookup fails. */ }
    }
    setScannerOpen(false);
    setBarcodeNotice("");
    if (match) {
      setBarcodeProduct(match);
      const legacyCostJpy = Number(match.cost_price_jpy ?? match.cost_jpy ?? match.cost_price_rmb);
      setBarcodeDraft({
        ...match,
        cost_jpy: Number(match.cost_jpy) || (Number.isFinite(legacyCostJpy) ? legacyCostJpy : ""),
        shipping_hkd: Number(match.shipping_hkd) || DEFAULT_SHIPPING_HKD,
        exchange_rate: Number(match.exchange_rate) || DEFAULT_JPY_TO_HKD,
        stock: Number(match.stock) || 0,
        price: Number(match.price) || 0,
      });
      return;
    }
    setTab("products");
    setForm({ ...defaultRow("products"), mofu_sku: normalized });
  }

  async function saveBarcodeProduct() {
    if (!barcodeDraft?.id) return;
    setBarcodeSaving(true);
    setBarcodeNotice("");
    try {
      const result = await call("PATCH", {
        table: "products",
        id: barcodeDraft.id,
        row: {
          cost_jpy: Number(barcodeDraft.cost_jpy) || 0,
          shipping_hkd: Number(barcodeDraft.shipping_hkd) || DEFAULT_SHIPPING_HKD,
          exchange_rate: Number(barcodeDraft.exchange_rate) || DEFAULT_JPY_TO_HKD,
          markup_multiplier: DEFAULT_MARKUP_MULTIPLIER,
          stock: Math.max(0, Math.trunc(Number(barcodeDraft.stock) || 0)),
          price: Number(barcodeDraft.price) || 0,
          current_hkd: Number(barcodeDraft.price) || 0,
        },
      });
      setRows((current) => current.map((row) => String(row.id) === String(barcodeDraft.id) ? {
        ...row,
        ...(result.data || {}),
        cost_jpy: barcodeDraft.cost_jpy,
        shipping_hkd: barcodeDraft.shipping_hkd,
        exchange_rate: barcodeDraft.exchange_rate,
        stock: barcodeDraft.stock,
        price: barcodeDraft.price,
      } : row));
      setBarcodeProduct(null);
      setBarcodeDraft(null);
    } catch (e: any) {
      setBarcodeNotice(e.message || "\u689d\u78bc\u7522\u54c1\u5132\u5b58\u5931\u6557");
    } finally {
      setBarcodeSaving(false);
    }
  }

  function categoryName(categoryId: unknown) {
    return categories.find((category) => String(category.id) === String(categoryId))?.name || "\u672a\u5206\u985e";
  }

  const barcodeTags = barcodeProduct && Array.isArray(barcodeProduct.feature_tags)
    ? barcodeProduct.feature_tags.filter((tag: unknown): tag is string => typeof tag === "string")
    : [];
  const barcodeChineseName = String(barcodeProduct?.name_zh || barcodeProduct?.name || "\u7522\u54c1")
    .split(/[｜|]/)[0]
    .replace(/^\u65e5\u672c\u539f\u88dd\s*Best Partner\s*/i, "")
    .trim();
  const barcodeJapaneseName = String(barcodeProduct?.name || "").split(/[｜|]/).at(-1)?.trim() || "—";
  const barcodeCostJpy = Number(barcodeDraft?.cost_jpy) || 0;
  const barcodeExchangeRate = Number(barcodeDraft?.exchange_rate) || DEFAULT_JPY_TO_HKD;
  const barcodeShippingHkd = Number(barcodeDraft?.shipping_hkd) || DEFAULT_SHIPPING_HKD;
  const barcodeCostHkd = barcodeCostJpy * barcodeExchangeRate + barcodeShippingHkd;
  const barcodePriceHkd = Number(barcodeDraft?.price) || 0;
  const barcodeMargin = barcodePriceHkd > 0 ? ((barcodePriceHkd - barcodeCostHkd) / barcodePriceHkd) * 100 : 0;
  const barcodeAudience = String(barcodeProduct?.pet_species || "").toLowerCase().includes("cat")
    ? "\u8c93\u54aa\u5c08\u5340"
    : String(barcodeProduct?.pet_species || "").toLowerCase().includes("dog") ? "\u72d7\u72d7\u5c08\u5340" : "\u8c93\u72d7\u517c\u7528";
  const barcodeCategory = barcodeProduct?.category_id
    ? categoryName(barcodeProduct.category_id)
    : barcodeTags.filter((tag: string) => tag.startsWith("supplier_category:")).map((tag: string) => tag.split(":")[1]).join("／") || "\u672a\u5206\u985e";
  const barcodeStatus = barcodeProduct?.is_published === false || barcodeProduct?.status === "draft"
    ? "\u96b1\u85cf"
    : Number(barcodeDraft?.stock) > 0 ? "\u5728\u552e\u4e2d" : "\u7f3a\u8ca8\u4e2d";

  return (
    <div className="min-h-screen bg-[#f6f2eb] text-[#27231f]">
      <header className="flex items-center justify-between border-b border-[#e5ddd3] bg-white px-5 py-4 md:px-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#a36b42]">Mofu Haven HK</p>
          <h1 className="text-xl font-semibold">\u5167\u5bb9\u7ba1\u7406\u4e2d\u5fc3</h1>
        </div>
        <button onClick={logout} className="rounded-lg border border-[#ded5cc] px-3 py-2 text-sm transition hover:bg-[#f6f2eb]">\u767b\u51fa</button>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-6 md:flex-row md:px-10">
        <aside className="w-full shrink-0 rounded-2xl bg-[#2f4a3c] p-3 text-white md:w-56 md:self-start">
          {tabs.map((item) => (
            <button key={item.id} onClick={() => setTab(item.id)} className={`mb-1 w-full rounded-xl px-4 py-3 text-left text-sm transition ${tab === item.id ? "bg-white text-[#2f4a3c]" : "text-white/80 hover:bg-white/10"}`}>
              {item.label}
            </button>
          ))}
          <button onClick={() => router.push("/admin/image-ops")} className="mt-3 w-full rounded-xl border border-white/20 px-4 py-3 text-left text-sm text-white/90 transition hover:bg-white/10">\u5716\u7247\u81ea\u52d5\u88dc\u5716</button>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm text-[#8b7c70]">\u7db2\u7ad9\u5167\u5bb9</p>
              <h2 className="text-3xl font-semibold">{title}</h2>
            </div>
            {tab !== "orders" && tab !== "banners" && tab !== "draft_products" && tab !== "featured_pets" && (
              <button onClick={() => setForm(defaultRow(tab))} className="shrink-0 rounded-xl bg-[#a36b42] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#8f5b37]">\u65b0\u589e</button>
            )}
          </div>

          {error && <div role="alert" aria-live="assertive" className="mb-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium leading-6 text-red-800 shadow-sm"><strong className="mr-1">⚠ \u5132\u5b58\u5931\u6557：</strong>{error.replace(/^\u5132\u5b58\u5931\u6557：/, "")}</div>}

          {isProductTab(tab) && (
            <section className="mb-5 rounded-2xl bg-white p-4 shadow-sm md:p-5">
              <div className="flex flex-col gap-3 lg:flex-row">
                <label className="relative min-w-0 flex-1">
                  <span className="sr-only">\u641c\u5c0b\u7522\u54c1</span>
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a89587]" />
                  <input
                    value={productQuery}
                    onChange={(event) => setProductQuery(event.target.value)}
                    onKeyDown={(event) => { if (event.key === "Enter" && /^\d{8,14}$/.test(productQuery.trim())) { event.preventDefault(); void handleBarcode(productQuery); } }}
                    placeholder="\u641c\u5c0b\u7522\u54c1\u540d\u7a31、\u95dc\u9375\u5b57、SKU \u6216\u7522\u54c1 ID…"
                    className="w-full rounded-xl border border-[#ded5cc] bg-[#fffdfa] py-3 pl-10 pr-10 text-sm outline-none transition focus:border-[#a36b42] focus:ring-2 focus:ring-[#a36b42]/10"
                  />
                  {productQuery && <button aria-label="\u6e05\u9664\u641c\u5c0b" onClick={() => setProductQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b7c70] hover:text-[#2f4a3c]"><X className="h-4 w-4" /></button>}
                </label>
                <label className="lg:w-56">
                  <span className="sr-only">\u6309\u5206\u985e\u7be9\u9078</span>
                  <select value={productCategory} onChange={(event) => setProductCategory(event.target.value)} className="w-full rounded-xl border border-[#ded5cc] bg-[#fffdfa] px-3 py-3 text-sm outline-none transition focus:border-[#a36b42]">
                    <option value="all">\u5168\u90e8\u5206\u985e</option>
                    {categoryGroups(categories).map(({ root, entries }) => (
                      <optgroup key={root.id} label={root.name}>
                        {entries.map(({ category, depth }) => (
                          <option key={category.id} value={category.id}>
                            {depth === 0 ? `${category.name}（\u5168\u90e8\u5b50\u5206\u985e）` : categoryOptionLabel(category.name, depth)}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </label>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#eaded5] pt-4">
                <button type="button" onClick={() => setScannerOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-[#2f4a3c] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#22372d]"><Camera className="h-4 w-4" />\u6383\u78bc\u6536\u8ca8／\u67e5\u8ca8</button>
                <button type="button" onClick={exportProductsCsv} disabled={csvBusy} className="inline-flex items-center gap-2 rounded-xl border border-[#2f4a3c] bg-[#f8fbf8] px-3 py-2 text-sm font-semibold text-[#2f4a3c] transition hover:bg-[#edf5ef] disabled:cursor-wait disabled:opacity-60"><Download className="h-4 w-4" />\u532f\u51fa CSV</button>
                <button type="button" onClick={exportProductsExcel} disabled={csvBusy} className="inline-flex items-center gap-2 rounded-xl border border-[#2f4a3c] bg-[#f8fbf8] px-3 py-2 text-sm font-semibold text-[#2f4a3c] transition hover:bg-[#edf5ef] disabled:cursor-wait disabled:opacity-60"><Download className="h-4 w-4" />\u4e0b\u8f09 Excel</button>
                <label className={`inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#a36b42] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#8f5b37] ${csvBusy ? "pointer-events-none opacity-60" : ""}`}><Upload className="h-4 w-4" />\u532f\u5165 Excel／CSV<input type="file" accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" className="sr-only" onChange={importProductsCsv} disabled={csvBusy} /></label>
                <span className="text-xs text-[#806b5d]">\u652f\u63f4 Excel／CSV；\u6b04\u4f4d：\u7522\u54c1\u540d\u7a31／SKU／\u6210\u672c\u50f9 JPY／\u96f6\u552e\u50f9 HKD／\u5716\u7247 URL；\u6210\u672c\u8207\u552e\u50f9\u5206\u958b\u5132\u5b58</span>
              </div>
              {csvNotice && <div className="mt-3 rounded-xl bg-[#f7efe7] px-3 py-2 text-xs leading-5 text-[#805536]" role="status">{csvNotice}</div>}
              <div className="mb-3 rounded-xl border border-[#eaded5] bg-[#fffaf4] px-4 py-3 text-xs leading-5 text-[#806b5d]">\u524d\u53f0\u53ea\u6703\u986f\u793a「\u72c0\u614b = published」、「\u5df2\u767c\u5e03」\u53ca「\u5eab\u5b58\u5927\u65bc 0」\u7684\u7522\u54c1。\u8981\u66ab\u505c\u7522\u54c1，\u8acb\u6539\u70ba draft／archived \u6216\u53d6\u6d88\u5df2\u767c\u5e03。</div><div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[#8b7c70]">
                <span>{productQuery || productCategory !== "all" ? `\u7be9\u9078\u7d50\u679c：${filteredProductRows.length} \u9805` : `\u5171 ${rows.length} \u9805\u7522\u54c1`}</span>
                {(productQuery || productCategory !== "all") && <button onClick={() => { setProductQuery(""); setProductCategory("all"); }} className="font-medium text-[#a36b42] hover:underline">\u6e05\u9664\u7be9\u9078</button>}
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
              autoplayEnabled={bannerAutoplayEnabled}
              autoplaySaving={bannerAutoplaySaving}
              onAutoplayChange={saveBannerAutoplay}
            />
          ) : tab === "featured_pets" ? (
            <FeaturedPetBatchEditor
              slots={featuredPetSlots}
              onChange={setFeaturedPetSlots}
              onSave={saveFeaturedPetBatch}
              saving={featuredPetSaving}
              notice={featuredPetNotice}
            />
          ) : form && <Editor tab={tab} form={form} setForm={setForm} categories={categories} brands={brands} onSave={save} onCancel={() => setForm(null)} />}

          {tab !== "featured_pets" && (loading ? (
            <div className="rounded-2xl bg-white p-10 text-center text-[#8b7c70]">\u8f09\u5165\u4e2d…</div>
          ) : visibleRows.length === 0 && !form ? (
            <div className="rounded-2xl bg-white p-10 text-center text-[#8b7c70]">
              {isProductTab(tab) && (productQuery || productCategory !== "all") ? "\u627e\u4e0d\u5230\u7b26\u5408\u689d\u4ef6\u7684\u7522\u54c1。" : "\u5c1a\u672a\u6709\u8cc7\u6599，\u8acb\u6309「\u65b0\u589e」。"}
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {visibleRows.map((row) => {
                  if (tab === "orders") return <OrderCard key={row.id || row.key} order={row} onSaved={(next) => setRows((current) => current.map((item) => String(item.id) === String(row.id) ? { ...item, ...next } : item))} />;
                  const thumbnailUrl = isProductTab(tab) ? getProductImageUrls(row)[0] : undefined;
                  return (
                    <div key={row.id || row.key} className="rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="flex min-w-0 items-center gap-4">
                          {tab === "brands" && (
                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[#eaded5] bg-[#fffaf4] p-2">
                              {row.logo_url ? <img src={row.logo_url} alt={`${row.name || "\u54c1\u724c"} logo`} className="h-full w-full object-contain" loading="lazy" /> : <span className="flex h-full items-center justify-center text-center text-xs text-[#8b7c70]">\u7121 Logo</span>}
                            </div>
                          )}
                          {isProductTab(tab) && (
                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[#eaded5] bg-[#fffaf4]">
                              {thumbnailUrl ? (
                                <img src={thumbnailUrl} alt={`${row.name || "\u7522\u54c1"}\u7e2e\u5716`} className="h-full w-full object-cover" loading="lazy" onError={(event) => { event.currentTarget.style.display = "none"; }} />
                              ) : (
                                <div className="flex h-full items-center justify-center px-1 text-center text-[10px] leading-4 text-[#a89587]">\u7121\u5716\u7247</div>
                              )}
                            </div>
                          )}
                          {tab === "banners" && (
                            <div data-banner-list="true" className="grid h-16 w-36 shrink-0 grid-cols-2 gap-1 overflow-hidden rounded-xl border border-[#eaded5] bg-[#fffaf4] p-1">
                              <div className="relative overflow-hidden rounded-md bg-[#eaded5]">
                                {row.image_url ? <img src={row.image_url} alt={`${row.title || "Banner"} \u684c\u9762\u7248`} className="h-full w-full object-cover" loading="lazy" /> : <span className="flex h-full items-center justify-center text-[9px] text-[#a89587]">\u684c\u9762\u7248</span>}
                                <span className="absolute inset-x-0 bottom-0 bg-black/55 px-1 py-0.5 text-center text-[8px] text-white">\u684c\u9762</span>
                              </div>
                              <div className="relative overflow-hidden rounded-md bg-[#eaded5]">
                                {row.mobile_image_url || row.image_url ? <img src={row.mobile_image_url || row.image_url} alt={`${row.title || "Banner"} \u624b\u6a5f\u7248`} className="h-full w-full object-cover" loading="lazy" /> : <span className="flex h-full items-center justify-center text-[9px] text-[#a89587]">\u624b\u6a5f\u7248</span>}
                                <span className="absolute inset-x-0 bottom-0 bg-black/55 px-1 py-0.5 text-center text-[8px] text-white">\u624b\u6a5f</span>
                              </div>
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold">{isProductTab(tab) ? row.name : tab === "store_settings" ? row.key : row.title || row.name || row.code || row.status}</p>
                            <p className="mt-1 truncate text-sm text-[#8b7c70]">
                              {tab === "products"
                                ? `HK$${row.price ?? 0} · \u5eab\u5b58 ${row.stock ?? 0} · ${categoryName(row.category_id)}`
                                : tab === "brands"
                                  ? `\u5546\u54c1 ${row.product_count ?? 0} \u9805 · \u6392\u5e8f ${row.sort_order ?? 0} · ${row.is_active ? "\u555f\u7528\u4e2d" : "\u5df2\u505c\u7528"}`
                                : (tab as Tab) === "orders"
                                  ? `${row.total ?? 0} · ${row.created_at || ""}`
                                  : tab === "store_settings"
                                    ? (String(row.value).length > 20 ? "••••••••" : row.value)
                                    : tab === "banners"
                                      ? `\u6392\u5e8f ${row.sort_order ?? 0} · ${row.mobile_image_url ? "\u684c\u9762／\u624b\u6a5f\u5716\u7247\u5df2\u8a2d\u5b9a" : "\u624b\u6a5f\u7248\u6cbf\u7528\u684c\u9762\u7248"}`
                                      : row.image_url || row.slug || row.discount_type || ""}
                            </p>
                            {isProductTab(tab) && <><p className="mt-1 truncate text-xs text-[#b09f92]">ID：{row.id}{row.mofu_sku ? ` · SKU：${row.mofu_sku}` : row.sku ? ` · SKU：${row.sku}` : ""}</p><span className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${row.status === "published" && row.is_published !== false ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{row.status === "published" && row.is_published !== false ? "\u524d\u53f0\u986f\u793a\u4e2d" : `\u672a\u4e0a\u67b6：${row.status || "draft"}`}</span></>}
                          </div>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          {isProductTab(tab) ? (
                            <div className="relative">
                              <div className="flex">
                                  <button onClick={() => setForm({ ...row })} className="rounded-l-lg border border-r-0 border-[#ded5cc] px-3 py-2 text-sm transition hover:bg-[#f6f2eb]">\u5b8c\u6574\u7de8\u8f2f</button>
                                <button
                                  type="button"
                                    aria-label={`\u5feb\u901f\u7de8\u8f2f ${row.name || "\u7522\u54c1"}`}
                                    aria-expanded={openQuickEditProductId === String(row.id)}
                                    onClick={() => toggleQuickEdit(row)}
                                  className="rounded-r-lg border border-[#ded5cc] px-2 py-2 text-sm transition hover:bg-[#f6f2eb]"
                                >
                                    <ChevronDown className={`h-4 w-4 transition-transform ${openQuickEditProductId === String(row.id) ? "rotate-180" : ""}`} />
                                </button>
                              </div>
                            </div>
                          ) : tab === "banners" ? (
                            <span className="rounded-lg border border-[#ded5cc] px-3 py-2 text-sm text-[#8b7c70]">\u8acb\u65bc\u4e0a\u65b9\u56db\u683c\u7ba1\u7406</span>
                          ) : (tab as Tab) === "orders" ? (
                            <span className="rounded-lg border border-[#ded5cc] px-3 py-2 text-sm text-[#8b7c70]">\u53ef\u76f4\u63a5\u65bc\u5361\u7247\u64cd\u4f5c</span>
                          ) : (
                            <button onClick={() => setForm({ ...row })} className="rounded-lg border border-[#ded5cc] px-3 py-2 text-sm transition hover:bg-[#f6f2eb]">\u7de8\u8f2f</button>
                          )}
                          {(tab as Tab) !== "orders" && tab !== "banners" && tab !== "draft_products" && <button onClick={() => remove(row)} className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 transition hover:bg-red-50">\u522a\u9664</button>}
                        </div>
                      </div>
                      {isProductTab(tab) && openQuickEditProductId === String(row.id) && quickEditDraft && (
                        <div className="mt-4 border-t border-[#eaded5] pt-4" role="region" aria-label={`${row.name || "\u7522\u54c1"} \u5feb\u901f\u7de8\u8f2f`}>
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-[#2f4a3c]">\u5feb\u901f\u7de8\u8f2f</p>
                              <p className="mt-0.5 text-xs text-[#8b7c70]">\u4e0d\u96e2\u958b\u7522\u54c1\u5217\u8868\u5373\u53ef\u66f4\u65b0\u6838\u5fc3\u8cc7\u6599</p>
                            </div>
                            <span className="rounded-full bg-[#f7efe7] px-2.5 py-1 text-xs font-medium text-[#805536]">\u5373\u6642\u5132\u5b58</span>
                          </div>
                          <div className="grid gap-3 sm:grid-cols-3">
                            <label className="text-sm"><span className="mb-1 block font-medium">\u6210\u672c\u50f9（JPY）</span><input type="number" min="0" step="1" value={quickEditDraft.cost_jpy ?? ""} onChange={(event) => setQuickEditDraft({ ...quickEditDraft, cost_jpy: event.target.value })} className="w-full rounded-lg border border-[#ded5cc] bg-[#fffdfa] px-3 py-2 outline-none focus:border-[#a36b42]" placeholder="\u4f8b\u5982 380" /></label>
                            <label className="text-sm"><span className="mb-1 block font-medium">\u552e\u50f9（HKD）</span><input type="number" min="0" step="0.01" value={quickEditDraft.price} onChange={(event) => setQuickEditDraft({ ...quickEditDraft, price: event.target.value })} className="w-full rounded-lg border border-[#ded5cc] bg-[#fffdfa] px-3 py-2 outline-none focus:border-[#a36b42]" placeholder="\u624b\u52d5\u8f38\u5165" /></label>
                            <label className="text-sm"><span className="mb-1 block font-medium">\u539f\u50f9（HKD）</span><input type="number" min="0" step="0.01" value={quickEditDraft.original_price} onChange={(event) => setQuickEditDraft({ ...quickEditDraft, original_price: event.target.value })} className="w-full rounded-lg border border-[#ded5cc] bg-[#fffdfa] px-3 py-2 outline-none focus:border-[#a36b42]" placeholder="\u53ef\u9078" /></label>
                            <label className="text-sm"><span className="mb-1 block font-medium">\u5eab\u5b58（Stock）</span><input type="number" min="0" step="1" value={quickEditDraft.stock} onChange={(event) => setQuickEditDraft({ ...quickEditDraft, stock: event.target.value })} className="w-full rounded-lg border border-[#ded5cc] bg-[#fffdfa] px-3 py-2 outline-none focus:border-[#a36b42]" /></label>
                            <label className="text-sm"><span className="mb-1 block font-medium">\u662f\u5426\u5c07\u8ca8\u54c1\u4e0a\u67b6</span><select value={quickEditDraft.status} onChange={(event) => setQuickEditDraft({ ...quickEditDraft, status: event.target.value, is_published: event.target.value === "published" })} className="w-full rounded-lg border border-[#ded5cc] bg-[#fffdfa] px-3 py-2 outline-none focus:border-[#a36b42]"><option value="published">Publish（\u4e0a\u67b6）</option><option value="draft">Draft（\u8349\u7a3f）</option></select></label>
                          </div>
                          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-[#fffaf4] px-3 py-2 text-xs text-[#806b5d]">
                            <span>\u6210\u672c\u8cc7\u6599\u50c5\u9650 Admin；\u5b8c\u6574\u7de8\u8f2f\u53ef\u9032\u884c\u532f\u7387、\u904b\u8cbb、\u500d\u7387\u53ca\u6bdb\u5229\u8a66\u7b97。</span>
                            {quickEditError && <span className="text-red-600">{quickEditError}</span>}
                          </div>
                          <div className="mt-3 flex justify-end"><button type="button" onClick={saveQuickEdit} disabled={quickEditSaving} className="rounded-lg bg-[#2f4a3c] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#22372d] disabled:cursor-wait disabled:opacity-60">{quickEditSaving ? "\u5132\u5b58\u4e2d…" : "\u5373\u6642\u5132\u5b58"}</button></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {isProductTab(tab) && filteredProductRows.length > 0 && productPageCount > 1 && (
                <nav aria-label="\u7522\u54c1\u5206\u9801" className="mt-6 flex flex-wrap items-center justify-center gap-2">
                  <button disabled={productPage === 1} onClick={() => setProductPage((page) => Math.max(1, page - 1))} className="inline-flex items-center gap-1 rounded-lg border border-[#ded5cc] bg-white px-3 py-2 text-sm transition hover:bg-[#f6f2eb] disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft className="h-4 w-4" />\u4e0a\u4e00\u9801</button>
                  {getPageNumbers(productPage, productPageCount).map((page, index) => page === "ellipsis" ? <span key={`ellipsis-${index}`} className="px-1 text-[#8b7c70]">…</span> : <button key={page} onClick={() => setProductPage(page)} aria-current={page === productPage ? "page" : undefined} className={`min-w-9 rounded-lg px-3 py-2 text-sm transition ${page === productPage ? "bg-[#2f4a3c] text-white" : "border border-[#ded5cc] bg-white hover:bg-[#f6f2eb]"}`}>{page}</button>)}
                  <button disabled={productPage === productPageCount} onClick={() => setProductPage((page) => Math.min(productPageCount, page + 1))} className="inline-flex items-center gap-1 rounded-lg border border-[#ded5cc] bg-white px-3 py-2 text-sm transition hover:bg-[#f6f2eb] disabled:cursor-not-allowed disabled:opacity-40">\u4e0b\u4e00\u9801<ChevronRight className="h-4 w-4" /></button>
                  <span className="basis-full text-center text-xs text-[#8b7c70]">\u986f\u793a\u7b2c {firstVisibleProduct}–{lastVisibleProduct} \u9805，\u5171 {filteredProductRows.length} \u9805</span>
                </nav>
              )}
            </>
          ))}
        </main>
      </div>
      {scannerOpen && <BarcodeScanner onDetected={handleBarcode} onClose={() => setScannerOpen(false)} />}
      {barcodeProduct && barcodeDraft && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/45 p-3 sm:items-center">
          <section className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="barcode-product-title">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#a36b42]">\u689d\u78bc\u5339\u914d\u6210\u529f</p>
                <h2 id="barcode-product-title" className="mt-1 text-xl font-semibold">{barcodeChineseName}</h2>
                <p className="mt-1 text-sm text-[#756962]">\u539f\u5ee0\u65e5\u6587：{barcodeJapaneseName}</p>
                <p className="mt-1 text-xs text-[#8b7c70]">JAN／\u5e97\u5167\u8ca8\u865f：{barcodeProduct.barcode || barcodeProduct.mofu_sku || barcodeProduct.sku || "—"}</p>
              </div>
              <button type="button" onClick={() => { setBarcodeProduct(null); setBarcodeDraft(null); }} className="rounded-lg p-2 text-[#8b7c70] hover:bg-[#f6f2eb]" aria-label="\u95dc\u9589"><X className="h-5 w-5" /></button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-full bg-[#e8f3ec] px-3 py-1.5 text-[#2f4a3c]">{barcodeStatus}</span>
              <span className="rounded-full bg-[#f6f2eb] px-3 py-1.5 text-[#756962]">{barcodeAudience}／{barcodeCategory}</span>
              <span className="rounded-full bg-[#f6f2eb] px-3 py-1.5 text-[#756962]">\u898f\u683c：{barcodeProduct.product_spec || "—"}</span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#fffaf4] p-3 text-sm">\u76ee\u524d\u5eab\u5b58<strong className="mt-1 block text-2xl text-[#2f4a3c]">{barcodeDraft.stock}</strong></div>
              <div className="rounded-xl bg-[#fffaf4] p-3 text-sm">\u6298\u5408\u6e2f\u5e63\u6210\u672c<strong className="mt-1 block text-2xl text-[#805536]">HK${barcodeCostHkd.toFixed(2)}</strong><span className="text-xs text-[#8b7c70]">\u532f\u7387 {barcodeExchangeRate}</span></div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <label className="text-sm"><span className="mb-1 block font-medium">\u65e5\u5143\u4f86\u8ca8\u50f9（JPY）</span><input type="number" min="0" step="1" value={barcodeDraft.cost_jpy ?? ""} onChange={(event) => setBarcodeDraft({ ...barcodeDraft, cost_jpy: event.target.value })} className="w-full rounded-xl border border-[#ded5cc] px-3 py-3" placeholder="\u4f8b\u5982 380" /></label>
              <label className="text-sm"><span className="mb-1 block font-medium">\u76ee\u524d\u552e\u50f9（HKD）</span><input type="number" min="0" step="0.01" value={barcodeDraft.price ?? 0} onChange={(event) => setBarcodeDraft({ ...barcodeDraft, price: event.target.value })} className="w-full rounded-xl border border-[#ded5cc] px-3 py-3" /></label>
              <div className="rounded-xl border border-[#ded5cc] bg-[#fffdfa] p-3 text-sm"><span className="block font-medium">\u9810\u4f30\u6bdb\u5229\u7387</span><strong className={`mt-2 block text-xl ${barcodeMargin < 30 ? "text-[#b34d36]" : "text-[#2f4a3c]"}`}>{barcodeMargin.toFixed(1)}%</strong></div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3"><button type="button" onClick={() => setBarcodeDraft({ ...barcodeDraft, stock: Number(barcodeDraft.stock || 0) + 10 })} className="rounded-xl border border-[#2f4a3c] px-4 py-3 font-semibold text-[#2f4a3c]">+10 \u5165\u5eab</button><button type="button" onClick={() => setBarcodeDraft({ ...barcodeDraft, stock: Number(barcodeDraft.stock || 0) + 20 })} className="rounded-xl border border-[#2f4a3c] px-4 py-3 font-semibold text-[#2f4a3c]">+20 \u5165\u5eab</button></div>
            <label className="mt-4 block text-sm"><span className="mb-1 block font-medium">\u8abf\u6574\u5f8c\u5eab\u5b58</span><input type="number" min="0" value={barcodeDraft.stock ?? 0} onChange={(event) => setBarcodeDraft({ ...barcodeDraft, stock: event.target.value })} className="w-full rounded-xl border border-[#ded5cc] px-3 py-3" /></label>
            {barcodeMargin < 30 && <p className="mt-3 rounded-lg bg-[#fff1ed] px-3 py-2 text-sm text-[#b34d36]">\u6298\u5f8c\u5229\u6f64\u904e\u4f4e，\u8acb\u6aa2\u67e5\u65e5\u5143\u6210\u672c\u6216\u552e\u50f9。</p>}
            {barcodeNotice && <p className="mt-3 text-sm text-red-600">{barcodeNotice}</p>}<button type="button" onClick={saveBarcodeProduct} disabled={barcodeSaving} className="mt-5 w-full rounded-xl bg-[#2f4a3c] px-4 py-3 font-semibold text-white disabled:opacity-50">{barcodeSaving ? "\u5132\u5b58\u4e2d…" : "\u5132\u5b58\u5eab\u5b58／\u552e\u50f9／\u65e5\u5143\u6210\u672c"}</button>
          </section>
        </div>
      )}
    </div>
  );
}

type BarcodeDetectorLike = new (options?: { formats?: string[] }) => { detect: (video: HTMLVideoElement) => Promise<Array<{ rawValue?: string }>> };

function BarcodeScanner({ onDetected, onClose }: { onDetected: (code: string) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scannerError, setScannerError] = useState("");
  const [manualCode, setManualCode] = useState("");
  useEffect(() => {
    let active = true;
    let stream: MediaStream | null = null;
    let frame = 0;
    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        const Detector = (window as Window & { BarcodeDetector?: BarcodeDetectorLike }).BarcodeDetector;
        if (!Detector) { setScannerError("\u6b64\u700f\u89bd\u5668\u672a\u652f\u63f4\u539f\u751f\u689d\u78bc\u8fa8\u8b58，\u8acb\u4f7f\u7528\u4e0b\u65b9\u624b\u52d5\u8f38\u5165\u6216\u6383\u78bc\u69cd。"); return; }
        const detector = new Detector({ formats: ["ean_13", "code_128"] });
        const scan = async () => {
          if (!active || !videoRef.current) return;
          try { const results = await detector.detect(videoRef.current); const code = results[0]?.rawValue?.trim(); if (code) { active = false; onDetected(code); return; } } catch { /* Camera frame not ready yet. */ }
          frame = requestAnimationFrame(scan);
        };
        frame = requestAnimationFrame(scan);
      } catch (error) { setScannerError(error instanceof DOMException && error.name === "NotAllowedError" ? "\u8acb\u5141\u8a31\u700f\u89bd\u5668\u4f7f\u7528\u76f8\u6a5f，\u6216\u6539\u7528\u4e0b\u65b9\u624b\u52d5\u8f38\u5165。" : "\u7121\u6cd5\u958b\u555f\u5f8c\u7f6e\u93e1\u982d，\u8acb\u6539\u7528\u624b\u52d5\u8f38\u5165\u6216\u6383\u78bc\u69cd。"); }
    }
    void start();
    return () => { active = false; cancelAnimationFrame(frame); stream?.getTracks().forEach((track) => track.stop()); };
  }, [onDetected]);
  return <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/60 p-3 sm:items-center"><section className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="barcode-scanner-title"><div className="flex items-center justify-between"><h2 id="barcode-scanner-title" className="text-xl font-semibold">\u6383\u63cf JAN／Code 128</h2><button type="button" onClick={onClose} className="rounded-lg p-2 text-[#8b7c70] hover:bg-[#f6f2eb]" aria-label="\u95dc\u9589"><X className="h-5 w-5" /></button></div><div className="mt-4 overflow-hidden rounded-2xl bg-black"><video ref={videoRef} className="aspect-video w-full object-cover" muted playsInline /></div><p className="mt-3 text-sm text-[#806b5d]">\u8acb\u5c07\u689d\u78bc\u653e\u5165\u756b\u9762\u4e2d\u592e，\u624b\u6a5f\u6703\u512a\u5148\u4f7f\u7528\u5f8c\u7f6e\u93e1\u982d。</p>{scannerError && <p className="mt-2 rounded-lg bg-[#fff4ed] p-3 text-sm text-[#a34d32]">{scannerError}</p>}<form className="mt-4 flex gap-2" onSubmit={(event) => { event.preventDefault(); if (manualCode.trim()) onDetected(manualCode); }}><input value={manualCode} onChange={(event) => setManualCode(event.target.value)} inputMode="numeric" placeholder="\u624b\u52d5\u8f38\u5165\u689d\u78bc" className="min-w-0 flex-1 rounded-xl border border-[#ded5cc] px-3 py-3" /><button type="submit" className="rounded-xl bg-[#2f4a3c] px-4 py-3 font-semibold text-white">\u67e5\u8a62</button></form></section></div>;
}

function OrderCard({ order, onSaved }: { order: Row; onSaved: (next: Row) => void }) {
  const customer = orderCustomer(order.customer_info);
  const items = orderItems(order.items);
  const [status, setStatus] = useState(String(order.status || "pending"));
  const [tracking, setTracking] = useState(String(order.tracking_number || customer._admin_tracking_number || ""));
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState(false);
  const total = Number(order.total ?? order.total_hkd ?? 0) || 0;
  const shipping = Number(order.shipping ?? order.shipping_hkd ?? 0) || 0;
  const name = String(customer.name || customer.customerName || "\u672a\u63d0\u4f9b\u59d3\u540d");
  const phone = String(customer.phone || customer.phoneNumber || "\u672a\u63d0\u4f9b\u96fb\u8a71");
  const address = [customer.district, customer.address, customer.addressLine2, customer.sfStationCode ? `\u9806\u8c50\u7ad9／\u667a\u80fd\u6ac3：${customer.sfStationCode}` : ""].filter(Boolean).join("，");
  const statusLabel = ORDER_STATUSES.find(([key]) => key === status)?.[1] || status;
  const saveOrder = async (patch: Row) => {
    if (!order.id) return;
    setSaving(true); setNotice("");
    try { const result = await call("PATCH", { table: "orders", id: order.id, row: patch }); onSaved({ ...patch, ...(result.data || {}) }); }
    catch (error: any) { setNotice(error.message || "\u8a02\u55ae\u66f4\u65b0\u5931\u6557"); }
    finally { setSaving(false); }
  };
  const copyDelivery = async () => {
    try { await navigator.clipboard.writeText([name, phone, address || "\u672a\u63d0\u4f9b\u5730\u5740"].join("\n")); setCopied(true); window.setTimeout(() => setCopied(false), 1800); }
    catch { setNotice("\u7121\u6cd5\u5b58\u53d6\u526a\u8cbc\u7c3f，\u8acb\u624b\u52d5\u9078\u53d6\u6587\u5b57\u8907\u88fd。"); }
  };
  return <article className="rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md md:p-5">
    <header className="flex flex-col gap-3 border-b border-[#eaded5] pb-4 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-semibold">\u8a02\u55ae {order.order_number || order.orderNumber || String(order.id || "").slice(0, 8)}</h3><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status === "cancelled" ? "bg-red-50 text-red-700" : status === "completed" ? "bg-emerald-50 text-emerald-700" : status === "shipped" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"}`}>{statusLabel}</span></div><p className="mt-1 text-sm text-[#8b7c70]">{orderDate(order.created_at || order.createdAt)}</p></div><div className="text-left sm:text-right"><p className="text-xs text-[#8b7c70]">\u8a02\u55ae\u7e3d\u984d</p><p className="text-2xl font-bold text-[#2f4a3c]">{orderMoney(total)}</p></div></header>
    <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)]"><section className="rounded-xl bg-[#fffaf4] p-4"><div className="mb-3 flex items-center justify-between gap-2"><h4 className="font-semibold text-[#2f4a3c]">\u51fa\u8ca8\u8cc7\u6599</h4><button type="button" onClick={copyDelivery} className="rounded-lg border border-[#cdb9a8] px-2.5 py-1.5 text-xs font-medium text-[#805536] hover:bg-white">{copied ? "\u5df2\u8907\u88fd" : "\u8907\u88fd\u9001\u8ca8\u8cc7\u6599"}</button></div><dl className="space-y-2 text-sm"><div><dt className="text-xs text-[#8b7c70]">\u9867\u5ba2\u59d3\u540d</dt><dd className="font-medium">{name}</dd></div><div><dt className="text-xs text-[#8b7c70]">\u806f\u7d61\u96fb\u8a71</dt><dd>{phone}</dd></div><div><dt className="text-xs text-[#8b7c70]">\u914d\u9001\u5730\u5740</dt><dd className="leading-6">{address || "\u672a\u63d0\u4f9b\u5730\u5740"}</dd></div></dl></section><section><h4 className="mb-2 font-semibold text-[#2f4a3c]">\u63c0\u8ca8\u6e05\u55ae</h4><div className="overflow-x-auto rounded-xl border border-[#eaded5]"><table className="w-full min-w-[420px] text-sm"><thead className="bg-[#fffaf4] text-left text-xs text-[#8b7c70]"><tr><th className="px-3 py-2">\u5546\u54c1</th><th className="px-3 py-2 text-center">\u6578\u91cf</th><th className="px-3 py-2 text-right">\u55ae\u50f9</th><th className="px-3 py-2 text-right">\u5c0f\u8a08</th></tr></thead><tbody className="divide-y divide-[#eaded5]">{items.map((item, index) => { const itemName = typeof item.name === "object" ? item.name?.zh || item.name?.en || item.name?.ja : item.name || item.title || "\u672a\u547d\u540d\u5546\u54c1"; const qty = Number(item.qty ?? item.quantity ?? 1) || 1; const price = Number(item.price ?? item.unit_price ?? 0) || 0; const bundle = getBundleComponents(String(item.mofuSku || item.mofu_sku || item.sku || "")); return <Fragment key={`${item.id || itemName}-${index}`}><tr><td className="px-3 py-2.5">{itemName}</td><td className="px-3 py-2.5 text-center font-bold text-[#2f4a3c]">x {qty}</td><td className="px-3 py-2.5 text-right">{orderMoney(price)}</td><td className="px-3 py-2.5 text-right font-medium">{orderMoney(price * qty)}</td></tr>{bundle.length ? <tr key={`${item.id || itemName}-${index}-picking`}><td colSpan={4} className="bg-[#fffaf4] px-3 py-2.5"><p className="font-semibold text-[#805536]">📦 揀貨明細清單｜{String(item.mofuSku || item.mofu_sku || item.sku)} × {qty}</p><ul className="mt-1 space-y-1 text-xs text-[#6d5a4e]">{bundle.map((component) => <li key={component.sku}>・{component.nameZh}｜{component.nameJa}｜{component.weight}｜JAN {component.sku} × {qty}</li>)}</ul></td></tr> : null}</Fragment>; })}</tbody></table></div><div className="mt-3 ml-auto max-w-xs space-y-1 text-sm"><div className="flex justify-between text-[#8b7c70]"><span>\u904b\u8cbb</span><span>{orderMoney(shipping)}</span></div><div className="flex justify-between border-t border-[#eaded5] pt-2 text-base font-bold"><span>\u8a02\u55ae\u7e3d\u984d</span><span className="text-[#2f4a3c]">{orderMoney(total)}</span></div></div></section></div>
    <footer className="mt-4 flex flex-col gap-3 border-t border-[#eaded5] pt-4 sm:flex-row sm:items-end sm:justify-between"><div className="grid w-full gap-3 sm:max-w-xl sm:grid-cols-2"><label className="text-sm"><span className="mb-1 block font-medium">\u8a02\u55ae\u72c0\u614b</span><select value={status} onChange={(event) => { const next = event.target.value; setStatus(next); void saveOrder({ status: next }); }} disabled={saving} className="w-full rounded-lg border border-[#ded5cc] bg-white px-3 py-2"><option value="pending">\u5f85\u8655\u7406</option><option value="processing">\u5099\u8ca8\u4e2d</option><option value="shipped">\u5df2\u5bc4\u51fa</option><option value="completed">\u5df2\u5b8c\u6210</option><option value="cancelled">\u5df2\u53d6\u6d88</option></select></label><label className="text-sm"><span className="mb-1 block font-medium">\u9806\u8c50\u904b\u55ae\u7de8\u865f</span><div className="flex gap-2"><input value={tracking} onChange={(event) => setTracking(event.target.value)} placeholder="\u8f38\u5165 Waybill No." className="min-w-0 flex-1 rounded-lg border border-[#ded5cc] px-3 py-2" /><button type="button" onClick={() => void saveOrder({ customer_info: JSON.stringify({ ...customer, _admin_tracking_number: tracking.trim() }) })} disabled={saving} className="rounded-lg bg-[#2f4a3c] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">\u5132\u5b58</button></div></label></div>{notice && <span className="text-sm text-red-600">{notice}</span>}</footer>
  </article>;
}

function Editor({ tab, form, setForm, categories, brands, onSave, onCancel }: { tab: Tab; form: Row; setForm: (r: Row) => void; categories: Row[]; brands: Row[]; onSave: () => void; onCancel: () => void }) {
  const [uploading, setUploading] = useState(false);
  const [uploadNotice, setUploadNotice] = useState("");

  async function uploadFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;

    const current = parseImageUrls(form.images);
    const remaining = MAX_PRODUCT_IMAGES - current.length;
    if (remaining <= 0) {
      setUploadNotice(`\u7522\u54c1\u6700\u591a\u53ea\u80fd\u8a2d\u5b9a ${MAX_PRODUCT_IMAGES} \u5f35\u5716\u7247，\u8acb\u5148\u79fb\u9664\u73fe\u6709\u5716\u7247。`);
      return;
    }

    const selectedFiles = files.slice(0, remaining);
    setUploadNotice(files.length > remaining ? `\u5df2\u9054\u4e0a\u9650，\u53ea\u6703\u4e0a\u50b3\u524d ${remaining} \u5f35\u5716\u7247。` : "");
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of selectedFiles) {
        const data = new FormData();
        data.append("file", file);
        const response = await fetch("/api/admin/upload", { method: "POST", body: data });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "\u4e0a\u50b3\u5931\u6557");
        if (typeof result.url === "string" && result.url.trim()) urls.push(result.url.trim());
      }
      setForm({ ...form, images: parseImageUrls([...current, ...urls]) });
    } catch (error) {
      setUploadNotice(error instanceof Error ? error.message : "\u5716\u7247\u4e0a\u50b3\u5931\u6557，\u8acb\u7a0d\u5f8c\u518d\u8a66。");
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
      if (!response.ok) throw new Error(result.error || "\u4e0a\u50b3\u5931\u6557");
      setForm({ ...form, [key]: result.url });
    } catch (error) {
      setUploadNotice(error instanceof Error ? error.message : "\u5716\u7247\u4e0a\u50b3\u5931\u6557，\u8acb\u7a0d\u5f8c\u518d\u8a66。");
    } finally {
      setUploading(false);
    }
  }

  function removeProductImage(index: number) {
    const urls = parseImageUrls(form.images).filter((_, urlIndex) => urlIndex !== index);
    setForm({ ...form, images: urls });
  }

  const productImages = parseImageUrls(form.images);
  const preview = pricingPreview(form.cost_jpy, form.shipping_hkd, form.markup_multiplier, form.exchange_rate, form.price);
  const setNumeric = (key: string) => (event: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: event.target.value === "" ? "" : Number(event.target.value) });

  const field = (key: string, label: string, type = "text") => (
    <label className="block text-sm">
      <span className="mb-1 block font-medium">{label}</span>
      <input type={type} value={Array.isArray(form[key]) ? form[key].join("\n") : (form[key] ?? "")} onChange={(event) => setForm({ ...form, [key]: type === "number" ? Number(event.target.value) : event.target.value })} className="w-full rounded-lg border border-[#ded5cc] bg-white px-3 py-2 outline-none focus:border-[#a36b42]" />
    </label>
  );

  return (
    <section className="mb-5 rounded-2xl bg-white p-5 shadow-sm">
      {tab === "banners" && !form.id && <div className="mb-4 rounded-xl bg-[#f7efe7] px-4 py-3 text-sm text-[#805536]">\u65b0\u589e Banner \u9810\u8a2d\u6703\u52a0\u5165\u73fe\u6709 slider。\u5982\u8981\u53ea\u4fdd\u7559\u9019\u4e00\u5f35 Banner，\u8acb\u52fe\u9078「\u8986\u84cb\u73fe\u6709 Banner」\u518d\u5132\u5b58。</div>}
      <div className="grid gap-4 md:grid-cols-2">
        {isProductTab(tab) && <>
          {field("name", "\u7522\u54c1\u540d\u7a31")}
          {field("mofu_sku", "Mofu SKU")}
          <div className="md:col-span-2 rounded-2xl border border-[#d9c4b3] bg-[#fffaf4] p-4">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <div><h3 className="font-semibold text-[#2f4a3c]">\u5b9a\u50f9\u8207\u6210\u672c\u8a66\u7b97</h3><p className="mt-1 text-xs text-[#8b7c70]">\u53ea\u9650 Admin \u67e5\u770b；\u6210\u672c\u6703\u5b58\u653e\u65bc\u53d7\u4fdd\u8b77\u8a2d\u5b9a，\u4e0d\u6703\u9032\u5165\u516c\u958b\u5546\u54c1 API。</p></div>
              <span className="rounded-full bg-[#f0e3d6] px-2.5 py-1 text-xs font-medium text-[#805536]">JPY → HKD</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="text-sm"><span className="mb-1 block font-medium">\u4f86\u8ca8\u6210\u672c（JPY）</span><input type="number" min="0" step="1" value={form.cost_jpy ?? ""} onChange={setNumeric("cost_jpy")} className="w-full rounded-lg border border-[#ded5cc] bg-white px-3 py-2 outline-none focus:border-[#a36b42]" placeholder="\u4f8b\u5982 380" /></label>
              <label className="text-sm"><span className="mb-1 block font-medium">\u5e73\u6524\u904b\u8cbb（HKD）</span><input type="number" min="0" step="0.01" value={form.shipping_hkd ?? DEFAULT_SHIPPING_HKD} onChange={setNumeric("shipping_hkd")} className="w-full rounded-lg border border-[#ded5cc] bg-white px-3 py-2 outline-none focus:border-[#a36b42]" /></label>
              <label className="text-sm"><span className="mb-1 block font-medium">\u5b9a\u50f9\u500d\u7387</span><input type="number" min="0.1" step="0.1" value={form.markup_multiplier ?? DEFAULT_MARKUP_MULTIPLIER} onChange={setNumeric("markup_multiplier")} className="w-full rounded-lg border border-[#ded5cc] bg-white px-3 py-2 outline-none focus:border-[#a36b42]" /></label>
              <label className="text-sm"><span className="mb-1 block font-medium">JPY/HKD \u532f\u7387</span><input type="number" min="0.0001" step="0.0001" value={form.exchange_rate ?? DEFAULT_JPY_TO_HKD} onChange={setNumeric("exchange_rate")} className="w-full rounded-lg border border-[#ded5cc] bg-white px-3 py-2 outline-none focus:border-[#a36b42]" /></label>
            </div>
            <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3"><div className="rounded-lg bg-white px-3 py-2">\u6210\u672c\u6e2f\u5e63：<strong>HK${preview.costHkd.toFixed(2)}</strong></div><div className="rounded-lg bg-white px-3 py-2">\u5efa\u8b70\u96f6\u552e\u50f9：<strong>HK${preview.suggestedPrice.toFixed(0)}</strong></div><button type="button" onClick={() => setForm({ ...form, price: preview.suggestedPrice })} className="rounded-lg bg-[#2f4a3c] px-3 py-2 font-semibold text-white transition hover:bg-[#22372d]">\u4e00\u9375\u5957\u7528\u5efa\u8b70\u552e\u50f9</button></div>
          </div>
          <div className="md:col-span-2 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
            <label className="block text-sm"><span className="mb-1 block font-medium">\u552e\u50f9（HKD）</span><input type="number" min="0" step="0.01" value={form.price ?? ""} onChange={setNumeric("price")} className="w-full rounded-lg border border-[#ded5cc] bg-white px-3 py-2 outline-none focus:border-[#a36b42]" /></label>
            <div className="rounded-xl border border-[#eaded5] bg-[#fffaf4] p-3 text-xs"><p className="mb-2 font-semibold text-[#2f4a3c]">\u6298\u6263\u6bdb\u5229\u8a66\u7b97</p><div className="grid grid-cols-2 gap-2 sm:grid-cols-4"><span>\u55ae\u4ef6<br /><strong>{preview.margin(preview.retailPrice).toFixed(1)}%</strong></span><span>4\u4ef6 95\u6298<br /><strong>{preview.margin(preview.retailPrice * .95).toFixed(1)}%</strong></span><span>8\u4ef6 9\u6298<br /><strong>{preview.margin(preview.retailPrice * .9).toFixed(1)}%</strong></span><span className={preview.margin(preview.retailPrice * .85) < 30 ? "font-bold text-red-600" : ""}>12\u4ef6 85\u6298<br /><strong>{preview.margin(preview.retailPrice * .85).toFixed(1)}%</strong></span></div>{preview.margin(preview.retailPrice * .85) < 30 ? <p className="mt-2 font-semibold text-red-600">\u6298\u5f8c\u5229\u6f64\u904e\u4f4e</p> : null}</div>
          </div>
          {field("original_price", "\u539f\u50f9", "number")}
          {field("stock", "\u5eab\u5b58", "number")}
          <div className="md:col-span-2">
            <label className="block text-sm">
              <span className="mb-1 block font-medium">\u5716\u7247 URL（\u6700\u591a {MAX_PRODUCT_IMAGES} \u5f35，\u6bcf\u884c\u4e00\u500b）</span>
              <textarea
                rows={4}
                value={Array.isArray(form.images) ? form.images.join("\n") : String(form.images || "")}
                onChange={(event) => setForm({ ...form, images: event.target.value })}
                placeholder="\u53ef\u8cbc\u4e0a\u5716\u7247\u7db2\u5740，\u6bcf\u884c\u4e00\u500b"
                className="w-full resize-y rounded-lg border border-[#ded5cc] bg-white px-3 py-2 outline-none focus:border-[#a36b42]"
              />
            </label>
            <div className="mt-2 flex items-center justify-between gap-3 text-xs text-[#8b7c70]">
              <span>\u5df2\u8a2d\u5b9a {productImages.length} / {MAX_PRODUCT_IMAGES} \u5f35</span>
              <span>\u4e0a\u50b3\u5f8c\u7db2\u5740\u6703\u81ea\u52d5\u586b\u5165\u4e0a\u65b9\u6b04\u4f4d</span>
            </div>
            {productImages.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {productImages.map((url, index) => (
                  <div key={`${url}-${index}`} className="group relative overflow-hidden rounded-xl border border-[#eaded5] bg-[#fffaf4]">
                    <img src={url} alt={`\u7522\u54c1\u5716\u7247 ${index + 1}`} className="aspect-square w-full object-cover" loading="lazy" />
                    <button type="button" onClick={() => removeProductImage(index)} className="absolute right-1.5 top-1.5 rounded-full bg-white/90 px-2 py-1 text-xs text-red-600 shadow-sm transition hover:bg-white">\u79fb\u9664</button>
                    <p className="truncate px-2 py-1.5 text-[10px] text-[#8b7c70]">\u5716\u7247 {index + 1}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <label className="block text-sm md:col-span-2">
            <span className="mb-1 block font-medium">\u4e0a\u50b3\u7522\u54c1\u5716\u7247</span>
            <span className="mb-2 block text-xs text-[#8b7c70]">\u53ef\u4e00\u6b21\u9078\u64c7\u591a\u5f35\u5716\u7247，\u6216\u7a0d\u5f8c\u91cd\u8907\u4e0a\u8f09；\u6700\u591a {MAX_PRODUCT_IMAGES} \u5f35，\u6bcf\u5f35\u4e0a\u9650 8 MB。</span>
            <input type="file" accept="image/*" multiple onChange={uploadFiles} disabled={uploading || productImages.length >= MAX_PRODUCT_IMAGES} className="w-full rounded-lg border border-dashed border-[#c9b8a8] px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50" />
            {uploading && <span className="mt-1 block text-xs text-[#a36b42]">\u4e0a\u50b3\u4e2d…</span>}
            {uploadNotice && <span className="mt-1 block text-xs text-[#a36b42]">{uploadNotice}</span>}
          </label>
          {field("description", "\u7522\u54c1\u63cf\u8ff0（\u4e2d\u6587）")}
          {field("name_en", "English product name（\u82f1\u6587\u524d\u53f0\u8207 Checkout \u986f\u793a）")}
          {field("description_en", "English product description（\u82f1\u6587\u524d\u53f0\u986f\u793a）")}
          {field("seo_title", "SEO \u6a19\u984c")}
          {field("seo_description", "SEO \u63cf\u8ff0")}
          <label className="block text-sm"><span className="mb-1 block font-medium">\u5206\u985e</span><select value={form.category_id || ""} onChange={(event) => setForm({ ...form, category_id: event.target.value })} className="w-full rounded-lg border border-[#ded5cc] px-3 py-2"><option value="">\u672a\u5206\u985e</option>{categoryGroups(categories).map(({ root, entries }) => <optgroup key={root.id} label={root.name}>{entries.map(({ category, depth }) => <option key={category.id} value={category.id}>{depth === 0 ? `${category.name}（\u5168\u90e8\u5b50\u5206\u985e）` : categoryOptionLabel(category.name, depth)}</option>)}</optgroup>)}</select></label>
          <label className="block text-sm"><span className="mb-1 block font-medium">\u6240\u5c6c\u54c1\u724c</span><select value={form.brand_id || ""} onChange={(event) => setForm({ ...form, brand_id: event.target.value || null })} className="w-full rounded-lg border border-[#ded5cc] px-3 py-2"><option value="">\u672a\u6307\u5b9a\u54c1\u724c</option>{brands.filter((brand) => brand.is_active || String(brand.id) === String(form.brand_id)).map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}</select></label>
          <label className="block text-sm"><span className="mb-1 block font-medium">\u7522\u54c1\u72c0\u614b</span><select value={form.status || "draft"} onChange={(event) => setForm({ ...form, status: event.target.value })} className="w-full rounded-lg border border-[#ded5cc] px-3 py-2"><option value="published">published（\u4e0a\u67b6）</option><option value="draft">draft（\u8349\u7a3f）</option><option value="archived">archived（\u6b78\u6a94）</option></select></label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_published !== false} onChange={(event) => setForm({ ...form, is_published: event.target.checked })} />\u5df2\u767c\u5e03\u5230\u524d\u53f0</label>
        </>}
        {tab === "brands" && <>{field("name", "\u54c1\u724c\u540d\u7a31")}{field("slug", "Slug")}{field("logo_url", "Logo \u5716\u7247 URL")}{field("description", "\u54c1\u724c\u7c21\u4ecb")}{field("sort_order", "\u6392\u5e8f", "number")}<label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active !== false} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} />\u524d\u53f0\u555f\u7528</label><label className="block text-sm md:col-span-2"><span className="mb-1 block font-medium">\u4e0a\u50b3\u54c1\u724c Logo</span><input type="file" accept="image/*" onChange={(event) => uploadSingle(event, "logo_url")} className="w-full rounded-lg border border-dashed border-[#c9b8a8] px-3 py-2 text-sm" />{uploading && <span className="text-xs text-[#a36b42]">\u4e0a\u50b3\u4e2d…</span>}</label></>}
        {tab === "categories" && <>{field("name", "\u5206\u985e\u540d\u7a31（\u5f8c\u53f0\u7cfb\u7d71\u540d\u7a31）")}{field("name_zh", "\u4e2d\u6587\u5206\u985e\u540d\u7a31（\u4e2d\u6587\u9801\u9762\u986f\u793a）")}{field("name_en", "English category name（\u82f1\u6587\u9801\u9762\u986f\u793a）")}{field("slug", "Slug")}          <label className="block text-sm"><span className="mb-1 block font-medium">\u7236\u5206\u985e</span><select value={form.parent_id || ""} onChange={(event) => setForm({ ...form, parent_id: event.target.value })} className="w-full rounded-lg border border-[#ded5cc] px-3 py-2"><option value="">\u9802\u5c64\u5206\u985e</option>{categoryGroups(categories, String(form.id || "")).map(({ root, entries }) => <optgroup key={root.id} label={root.name}>{entries.map(({ category, depth }) => <option key={category.id} value={category.id}>{categoryOptionLabel(category.name, depth + 1)}</option>)}</optgroup>)}</select></label>{field("image_url", "\u5c01\u9762\u5716\u7247 URL")}<label className="block text-sm"><span className="mb-1 block font-medium">\u4e0a\u50b3\u5c01\u9762</span><input type="file" accept="image/*" onChange={(event) => uploadSingle(event, "image_url")} className="w-full rounded-lg border border-dashed border-[#c9b8a8] px-3 py-2 text-sm" />{uploading && <span className="text-xs text-[#a36b42]">\u4e0a\u50b3\u4e2d…</span>}</label>{field("sort_order", "\u6392\u5e8f", "number")}</>}
        {tab === "banners" && <>{field("image_url", "\u684c\u9762\u7248\u5716\u7247 URL")}<label className="block text-sm"><span className="mb-1 block font-medium">\u4e0a\u50b3\u684c\u9762\u7248 Banner</span><input type="file" accept="image/*" onChange={(event) => uploadSingle(event, "image_url")} className="w-full rounded-lg border border-dashed border-[#c9b8a8] px-3 py-2 text-sm" />{uploading && <span className="text-xs text-[#a36b42]">\u4e0a\u50b3\u4e2d…</span>}</label>{field("mobile_image_url", "\u624b\u6a5f\u7248\u5716\u7247 URL（\u9078\u586b）")}<label className="block text-sm"><span className="mb-1 block font-medium">\u4e0a\u50b3\u624b\u6a5f\u7248 Banner</span><span className="mb-2 block text-xs text-[#8b7c70]">\u5efa\u8b70\u76f4\u5411\u69cb\u5716（\u7d04 4:5）；\u7559\u7a7a\u6642\u624b\u6a5f\u6703\u6cbf\u7528\u684c\u9762\u7248\u5716\u7247。</span><input type="file" accept="image/*" onChange={(event) => uploadSingle(event, "mobile_image_url")} className="w-full rounded-lg border border-dashed border-[#c9b8a8] px-3 py-2 text-sm" />{uploading && <span className="text-xs text-[#a36b42]">\u4e0a\u50b3\u4e2d…</span>}</label>{field("link", "\u9ede\u64ca\u9023\u7d50")}{field("title", "\u6a19\u984c")}{field("sort_order", "\u6392\u5e8f", "number")}{!form.id && <label className="flex items-center gap-2 text-sm md:col-span-2"><input type="checkbox" checked={form.replace_existing === true} onChange={(event) => setForm({ ...form, replace_existing: event.target.checked })} />\u8986\u84cb\u73fe\u6709 Banner（\u52fe\u9078\u5f8c\u624d\u6703\u6e05\u9664\u820a slider）</label>}</>}
        {tab === "coupons" && <>{field("code", "\u512a\u60e0\u78bc")}{field("discount_amount", "\u6298\u6263\u91d1\u984d／\u767e\u5206\u6bd4", "number")}<label className="block text-sm"><span className="mb-1 block font-medium">\u6298\u6263\u985e\u578b</span><select value={form.discount_type} onChange={(event) => setForm({ ...form, discount_type: event.target.value })} className="w-full rounded-lg border border-[#ded5cc] px-3 py-2"><option value="fixed">\u56fa\u5b9a\u91d1\u984d HKD</option><option value="percentage">\u767e\u5206\u6bd4</option></select></label><label className="flex items-center gap-2 pt-7 text-sm"><input type="checkbox" checked={Boolean(form.active)} onChange={(event) => setForm({ ...form, active: event.target.checked })} />\u555f\u7528\u512a\u60e0\u78bc</label></>}
        {tab === "store_settings" && <>{field("key", "\u8a2d\u5b9a Key")}{field("value", "\u8a2d\u5b9a\u503c（Secret Key \u5132\u5b58\u5f8c\u6703\u906e\u7f69）")}</>}
        {tab === "orders" && <p className="rounded-xl bg-[#fffaf4] p-4 text-sm text-[#806b5d]">\u8a02\u55ae\u5df2\u6539\u7528\u7d50\u69cb\u5316\u51fa\u8ca8\u5361\u7247，\u8acb\u76f4\u63a5\u5728\u8a02\u55ae\u5361\u7247\u5167\u66f4\u65b0\u72c0\u614b、\u63c0\u8ca8\u53ca\u9806\u8c50\u904b\u55ae。</p>}
      </div>
      <div className="mt-5 flex gap-2"><button onClick={onSave} disabled={uploading} className="rounded-lg bg-[#2f4a3c] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#22372d] disabled:opacity-50">\u5132\u5b58</button><button onClick={onCancel} className="rounded-lg border border-[#ded5cc] px-4 py-2 text-sm transition hover:bg-[#f6f2eb]">\u53d6\u6d88</button></div>
    </section>
  );
}


function BannerBatchEditor({
  slots,
  onChange,
  onSave,
  saving,
  notice,
  autoplayEnabled,
  autoplaySaving,
  onAutoplayChange,
}: {
  slots: BannerSlot[];
  onChange: (slots: BannerSlot[]) => void;
  onSave: () => void;
  saving: boolean;
  notice: string;
  autoplayEnabled: boolean;
  autoplaySaving: boolean;
  onAutoplayChange: (enabled: boolean) => void;
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
        throw new Error(result.error || "\u5716\u7247\u4e0a\u50b3\u5931\u6557");
      }
      updateSlot(index, { [field]: result.url.trim() });
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "\u5716\u7247\u4e0a\u50b3\u5931\u6557，\u8acb\u7a0d\u5f8c\u518d\u8a66。" );
    } finally {
      setUploadingSlot(null);
    }
  }

  return (
    <section className="mb-5 rounded-2xl bg-white p-5 shadow-sm">
      <div className="mb-5 max-w-3xl">
        <p className="text-sm font-semibold text-[#2f4a3c]">\u56db\u7d44 Banner \u6279\u91cf\u7ba1\u7406</p>
        <p className="mt-1 text-sm leading-6 text-[#806b5d]">\u4e00\u6b21\u904e\u8a2d\u5b9a\u6700\u591a\u56db\u7d44 Banner。\u505c\u7528\u81ea\u52d5\u8f2a\u64ad\u6642，\u524d\u53f0\u53ea\u986f\u793a\u6392\u5e8f\u6700\u524d\u7684\u4e00\u7d44；\u958b\u555f\u5f8c\u624d\u6703\u6309\u8a2d\u5b9a\u81ea\u52d5\u5207\u63db。\u5132\u5b58\u5168\u90e8 Banner \u6703\u4ee5\u672c\u9801\u6709\u684c\u9762\u7248\u5716\u7247\u7684\u6b04\u4f4d\u4f5c\u70ba\u5b8c\u6574\u65b0\u8f2a\u64ad。</p>
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#eaded5] bg-[#fffaf4] px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-[#2f4a3c]">\u524d\u53f0 Banner \u81ea\u52d5\u8f2a\u64ad</p>
          <p className="mt-1 text-xs text-[#8b7c70]">\u76ee\u524d：{autoplayEnabled ? "\u958b\u555f" : "\u95dc\u9589（\u53ea\u986f\u793a\u7b2c\u4e00\u7d44）"}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={autoplayEnabled}
          disabled={autoplaySaving}
          onClick={() => onAutoplayChange(!autoplayEnabled)}
          className={`relative inline-flex h-8 w-14 items-center rounded-full p-1 transition ${autoplayEnabled ? "bg-[#2f4a3c]" : "bg-[#c9b8a8]"} disabled:cursor-wait disabled:opacity-60`}
        >
          <span className={`h-6 w-6 rounded-full bg-white shadow-sm transition ${autoplayEnabled ? "translate-x-6" : "translate-x-0"}`} />
          <span className="sr-only">{autoplayEnabled ? "\u95dc\u9589 Banner \u81ea\u52d5\u8f2a\u64ad" : "\u958b\u555f Banner \u81ea\u52d5\u8f2a\u64ad"}</span>
        </button>
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
                  <label className="block text-sm font-medium">\u684c\u9762\u7248\u5716\u7247 <span className="text-red-600">*</span></label>
                  <div className="aspect-[16/9] overflow-hidden rounded-xl border border-dashed border-[#c9b8a8] bg-[#f7efe7]">
                    {slot.image_url ? <img src={slot.image_url} alt={`Banner ${index + 1} \u684c\u9762\u7248\u9810\u89bd`} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center px-3 text-center text-xs text-[#a89587]">\u5efa\u8b70\u4f7f\u7528 16:9 \u6216\u66f4\u5bec\u7684\u6a6b\u5411\u5716\u7247</div>}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => uploadBannerImage(event, index, "image_url")}
                    disabled={Boolean(uploadingSlot)}
                    className="w-full rounded-lg border border-dashed border-[#c9b8a8] px-3 py-2 text-xs disabled:cursor-wait disabled:opacity-60"
                  />
                  {desktopUploading && <p className="text-xs text-[#a36b42]">\u684c\u9762\u7248\u4e0a\u50b3\u4e2d…</p>}
                  <input
                    aria-label={`Banner ${index + 1} \u684c\u9762\u7248\u5716\u7247 URL`}
                    value={slot.image_url}
                    onChange={(event) => updateSlot(index, { image_url: event.target.value })}
                    placeholder="\u6216\u8cbc\u4e0a\u684c\u9762\u7248\u5716\u7247 URL"
                    className="w-full rounded-lg border border-[#ded5cc] bg-white px-3 py-2 text-xs outline-none focus:border-[#a36b42]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">\u624b\u6a5f\u7248\u5716\u7247 <span className="font-normal text-[#8b7c70]">（\u9078\u586b）</span></label>
                  <div className="aspect-[4/5] max-h-56 overflow-hidden rounded-xl border border-dashed border-[#c9b8a8] bg-[#f7efe7]">
                    {slot.mobile_image_url || slot.image_url ? <img src={slot.mobile_image_url || slot.image_url} alt={`Banner ${index + 1} \u624b\u6a5f\u7248\u9810\u89bd`} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center px-3 text-center text-xs text-[#a89587]">\u5efa\u8b70\u4f7f\u7528 4:5 \u76f4\u5411\u5716\u7247；\u7559\u7a7a\u6703\u6cbf\u7528\u684c\u9762\u7248</div>}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => uploadBannerImage(event, index, "mobile_image_url")}
                    disabled={Boolean(uploadingSlot)}
                    className="w-full rounded-lg border border-dashed border-[#c9b8a8] px-3 py-2 text-xs disabled:cursor-wait disabled:opacity-60"
                  />
                  {mobileUploading && <p className="text-xs text-[#a36b42]">\u624b\u6a5f\u7248\u4e0a\u50b3\u4e2d…</p>}
                  <input
                    aria-label={`Banner ${index + 1} \u624b\u6a5f\u7248\u5716\u7247 URL`}
                    value={slot.mobile_image_url}
                    onChange={(event) => updateSlot(index, { mobile_image_url: event.target.value })}
                    placeholder="\u6216\u8cbc\u4e0a\u624b\u6a5f\u7248\u5716\u7247 URL"
                    className="w-full rounded-lg border border-[#ded5cc] bg-white px-3 py-2 text-xs outline-none focus:border-[#a36b42]"
                  />
                </div>

                <label className="block text-sm sm:col-span-2">
                  <span className="mb-1 block font-medium">\u9ede\u64ca\u9023\u7d50 <span className="font-normal text-[#8b7c70]">（\u9078\u586b）</span></span>
                  <input value={slot.link} onChange={(event) => updateSlot(index, { link: event.target.value })} placeholder="\u4f8b\u5982：/menu \u6216 https://example.com" className="w-full rounded-lg border border-[#ded5cc] bg-white px-3 py-2 text-sm outline-none focus:border-[#a36b42]" />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-medium">\u6a19\u984c <span className="font-normal text-[#8b7c70]">（\u9078\u586b）</span></span>
                  <input value={slot.title} onChange={(event) => updateSlot(index, { title: event.target.value })} placeholder="\u4f9b\u7121\u969c\u7919\u6a19\u793a\u53ca\u5716\u7247\u63cf\u8ff0\u4f7f\u7528" className="w-full rounded-lg border border-[#ded5cc] bg-white px-3 py-2 text-sm outline-none focus:border-[#a36b42]" />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-medium">\u6392\u5e8f</span>
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
        <button onClick={onSave} disabled={saving || Boolean(uploadingSlot)} className="rounded-lg bg-[#2f4a3c] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#22372d] disabled:cursor-wait disabled:opacity-60">{saving ? "\u5132\u5b58\u4e2d…" : "\u5132\u5b58\u5168\u90e8 Banner"}</button>
        <span className="text-xs text-[#8b7c70]">\u6709\u684c\u9762\u7248\u5716\u7247\u7684\u6b04\u4f4d\u6703\u4f9d「\u6392\u5e8f」\u7531\u5c0f\u81f3\u5927\u986f\u793a；\u5df2\u586b\u5beb\u7684 Banner \u4e0d\u53ef\u4f7f\u7528\u76f8\u540c\u6392\u5e8f。</span>
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
        throw new Error(result.error || "\u5716\u7247\u4e0a\u50b3\u5931\u6557");
      }
      updateSlot(index, { image_url: result.url.trim() });
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "\u5716\u7247\u4e0a\u50b3\u5931\u6557，\u8acb\u7a0d\u5f8c\u518d\u8a66。");
    } finally {
      setUploadingSlot(null);
    }
  }

  return (
    <section className="mb-5 rounded-2xl bg-white p-5 shadow-sm">
      <div className="mb-5 max-w-3xl">
        <p className="text-sm font-semibold text-[#2f4a3c]">\u7cbe\u9078\u5bf5\u7269\u5c08\u5340\u5167\u5bb9\u7ba1\u7406</p>
        <p className="mt-1 text-sm leading-6 text-[#806b5d]">\u4e00\u6b21\u904e\u7ba1\u7406\u6700\u591a {MAX_FEATURED_PETS} \u500b\u9996\u9801\u5167\u5bb9\u69fd。\u6bcf\u500b\u5df2\u4f7f\u7528\u7684\u69fd\u4f4d\u5747\u9700\u586b\u5beb\u9ad8\u6e05\u5716\u7247、\u6a19\u984c\u53ca\u8a73\u7d30\u63cf\u8ff0；\u9023\u7d50\u53ca\u662f\u5426\u986f\u793a\u5247\u6309\u9700\u8981\u8a2d\u5b9a。\u5132\u5b58\u5f8c，\u9996\u9801「\u7cbe\u9078\u5bf5\u7269\u5c08\u5340」\u6703\u76f4\u63a5\u4f7f\u7528\u672c\u9801\u7684\u5167\u5bb9。</p>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {slots.map((slot, index) => {
          const uploading = uploadingSlot === index;
          return (
            <fieldset key={index} className="rounded-2xl border border-[#eaded5] bg-[#fffdfa] p-4">
              <legend className="rounded-full bg-[#2f4a3c] px-3 py-1 text-sm font-semibold text-white">\u5167\u5bb9\u69fd {index + 1}</legend>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">\u9ad8\u6e05\u5bf5\u7269\u5716\u7247 <span className="text-red-600">*</span></label>
                  <div className="aspect-[4/3] overflow-hidden rounded-xl border border-dashed border-[#c9b8a8] bg-[#f7efe7]">
                    {slot.image_url ? <img src={slot.image_url} alt={`\u5167\u5bb9\u69fd ${index + 1} \u9810\u89bd`} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center px-4 text-center text-xs leading-5 text-[#a89587]">\u5efa\u8b70\u4f7f\u7528\u9ad8\u756b\u8cea、\u5bec\u5e45\u6a6b\u5411\u5bf5\u7269\u76f8\u7247</div>}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => uploadPetImage(event, index)}
                    disabled={uploadingSlot !== null}
                    className="w-full rounded-lg border border-dashed border-[#c9b8a8] px-3 py-2 text-xs disabled:cursor-wait disabled:opacity-60"
                  />
                  {uploading && <p className="text-xs text-[#a36b42]">\u5716\u7247\u4e0a\u50b3\u4e2d…</p>}
                  <input
                    aria-label={`\u5167\u5bb9\u69fd ${index + 1} \u5716\u7247 URL`}
                    value={slot.image_url}
                    onChange={(event) => updateSlot(index, { image_url: event.target.value })}
                    placeholder="\u6216\u8cbc\u4e0a\u5716\u7247 URL"
                    className="w-full rounded-lg border border-[#ded5cc] bg-white px-3 py-2 text-xs outline-none focus:border-[#a36b42]"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <label className="block text-sm">
                    <span className="mb-1 block font-medium">\u6a19\u984c <span className="text-red-600">*</span></span>
                    <input value={slot.title} onChange={(event) => updateSlot(index, { title: event.target.value })} placeholder="\u4f8b\u5982：\u5348\u5f8c\u967d\u5149\u4e0b\u7684\u5c0f\u5925\u4f34" className="w-full rounded-lg border border-[#ded5cc] bg-white px-3 py-2 text-sm outline-none focus:border-[#a36b42]" />
                  </label>
                  <label className="block text-sm">
                    <span className="mb-1 block font-medium">English title <span className="font-normal text-[#8b7c70]">（\u9078\u586b；\u82f1\u6587\u7248\u986f\u793a）</span></span>
                    <input value={slot.title_en} onChange={(event) => updateSlot(index, { title_en: event.target.value })} placeholder="For example: A gentle afternoon nap" className="w-full rounded-lg border border-[#ded5cc] bg-white px-3 py-2 text-sm outline-none focus:border-[#a36b42]" />
                  </label>
                  <label className="block text-sm">
                    <span className="mb-1 block font-medium">\u9ede\u64ca\u9023\u7d50 <span className="font-normal text-[#8b7c70]">（\u9078\u586b）</span></span>
                    <input value={slot.link} onChange={(event) => updateSlot(index, { link: event.target.value })} placeholder="\u4f8b\u5982：/menu \u6216 https://example.com" className="w-full rounded-lg border border-[#ded5cc] bg-white px-3 py-2 text-sm outline-none focus:border-[#a36b42]" />
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block text-sm">
                      <span className="mb-1 block font-medium">\u6392\u5e8f</span>
                      <input type="number" min="0" step="1" value={slot.sort_order} onChange={(event) => updateSlot(index, { sort_order: Number(event.target.value) })} className="w-full rounded-lg border border-[#ded5cc] bg-white px-3 py-2 text-sm outline-none focus:border-[#a36b42]" />
                    </label>
                    <label className="flex items-end gap-2 pb-2 text-sm">
                      <input type="checkbox" checked={slot.is_published} onChange={(event) => updateSlot(index, { is_published: event.target.checked })} />
                      \u524d\u53f0\u986f\u793a
                    </label>
                  </div>
                </div>

                <label className="block text-sm sm:col-span-2">
                  <span className="mb-1 block font-medium">\u8a73\u7d30\u63cf\u8ff0 <span className="text-red-600">*</span></span>
                  <textarea value={slot.description} onChange={(event) => updateSlot(index, { description: event.target.value })} rows={4} placeholder="\u5beb\u4e0b\u9019\u4f4d\u6bdb\u5b69\u7684\u500b\u6027、\u65e5\u5e38\u6216\u63a8\u5ee3\u5167\u5bb9…" className="w-full resize-y rounded-lg border border-[#ded5cc] bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-[#a36b42]" />
                </label>
                <label className="block text-sm sm:col-span-2">
                  <span className="mb-1 block font-medium">English description <span className="font-normal text-[#8b7c70]">（\u9078\u586b；\u82f1\u6587\u7248\u986f\u793a）</span></span>
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
        <button onClick={onSave} disabled={saving || uploadingSlot !== null} className="rounded-lg bg-[#2f4a3c] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#22372d] disabled:cursor-wait disabled:opacity-60">{saving ? "\u5132\u5b58\u4e2d…" : "\u5132\u5b58\u6240\u6709\u7cbe\u9078\u5167\u5bb9"}</button>
        <span className="text-xs text-[#8b7c70]">\u6709\u5716\u7247\u7684\u5167\u5bb9\u69fd\u6703\u4f9d「\u6392\u5e8f」\u7531\u5c0f\u81f3\u5927\u5c55\u793a；\u6e05\u7a7a\u6240\u6709\u5716\u7247\u5f8c\u5132\u5b58，\u5373\u53ef\u5f9e\u9996\u9801\u79fb\u9664\u6574\u500b\u5167\u5bb9\u96c6。</span>
      </div>
    </section>
  );
}
