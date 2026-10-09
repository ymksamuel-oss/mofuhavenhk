"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, ChevronDown, ChevronLeft, ChevronRight, Download, Search, Upload, X } from "lucide-react";
import { MAX_FEATURED_PETS } from "@/lib/featured-pets";
import { getBundleComponents } from "@/lib/bundles";
import { BarcodeScanner } from "@/components/admin/BarcodeScanner";
import { calculateFinalSalePrice, calculateSuggestedRetailPrice, DEFAULT_JPY_TO_HKD, DEFAULT_RETAIL_MULTIPLIER } from "@/lib/pricing";

type Row = Record<string, any>;
type Tab = "products" | "draft_products" | "brands" | "categories" | "banners" | "featured_pets" | "coupons" | "orders" | "store_settings";

const PAGE_SIZE = 20;
function isProductTab(tab: Tab) { return tab === "products" || tab === "draft_products"; }
const MAX_PRODUCT_IMAGES = 8;
const DEFAULT_SHIPPING_HKD = 8;
const DEFAULT_MARKUP_MULTIPLIER = DEFAULT_RETAIL_MULTIPLIER;

function pricingPreview(costJpy: unknown, shippingHkd: unknown, price: unknown) {
  const jpy = Number(costJpy) || 0;
  const shipping = Number(shippingHkd) || 0;
  const costHkd = jpy * DEFAULT_JPY_TO_HKD;
  const landedCostHkd = costHkd + shipping;
  const suggestedPrice = calculateSuggestedRetailPrice(jpy);
  const finalSalePrice = calculateFinalSalePrice(suggestedPrice);
  const retailPrice = Number(price) || 0;
  const margin = (sellPrice: number) => sellPrice > 0 ? ((sellPrice - landedCostHkd) / sellPrice) * 100 : 0;
  return { costHkd, suggestedPrice, finalSalePrice, retailPrice, margin };
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
  id?: string;
  tag_en: string;
  title_zh: string;
  title_en: string;
  subtitle_zh: string;
  subtitle_en: string;
  button_text_zh: string;
  button_text_en: string;
  link_url: string;
  bg_type: "product_grid" | "custom_image";
  custom_image_url: string;
  sort_order: number;
  is_active: boolean;
};

function emptyBannerSlot(sortOrder: number): BannerSlot {
  return {
    tag_en: "BEST PARTNER SELECT",
    title_zh: "",
    title_en: "",
    subtitle_zh: "",
    subtitle_en: "",
    button_text_zh: "探索更多 ➔",
    button_text_en: "Explore More ➔",
    link_url: "/collections/all",
    bg_type: "product_grid",
    custom_image_url: "",
    sort_order: sortOrder,
    is_active: true,
  };
}

function toBannerSlots(rows: Row[]): BannerSlot[] {
  return rows.map((row, index) => ({
    id: row.id ? String(row.id) : undefined,
    tag_en: String(row.tag_en || "BEST PARTNER SELECT"),
    title_zh: String(row.title_zh || row.title || ""),
    title_en: String(row.title_en || row.title || ""),
    subtitle_zh: String(row.subtitle_zh || ""),
    subtitle_en: String(row.subtitle_en || ""),
    button_text_zh: String(row.button_text_zh || "探索更多 ➔"),
    button_text_en: String(row.button_text_en || "Explore More ➔"),
    link_url: String(row.link_url || row.link || "/collections/all"),
    bg_type: row.bg_type === "custom_image" ? "custom_image" : "product_grid",
    custom_image_url: String(row.custom_image_url || row.image_url || ""),
    sort_order: Number.isFinite(Number(row.sort_order)) ? Number(row.sort_order) : index,
    is_active: row.is_active !== false,
  }));
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

/** Decode legacy literal Unicode escapes returned by old catalog imports. */
function decodeAdminUnicode(value: string): string {
  return value.replace(/\\u([0-9a-fA-F]{4})/g, (_, code: string) =>
    String.fromCharCode(Number.parseInt(code, 16)),
  );
}

function normalizeAdminValue(value: unknown): unknown {
  if (typeof value === "string") return decodeAdminUnicode(value);
  if (Array.isArray(value)) return value.map(normalizeAdminValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [key, normalizeAdminValue(nested)]),
    );
  }
  return value;
}

function normalizeAdminRows(value: unknown): Row[] {
  return Array.isArray(value)
    ? value.map((row) => normalizeAdminValue(row) as Row)
    : [];
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
  { id: "draft_products", label: "未上架產品" },
  { id: "brands", label: "品牌管理" },
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
  const json = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(json.error || `操作失敗（HTTP ${response.status}）`);
  return json;
}

function defaultRow(tab: Tab): Row {
  if (tab === "products" || tab === "draft_products") return { name: "", name_en: "", cost_jpy: 0, shipping_hkd: DEFAULT_SHIPPING_HKD, markup_multiplier: DEFAULT_MARKUP_MULTIPLIER, exchange_rate: DEFAULT_JPY_TO_HKD, msrp_price: null, price: 0, original_price: "", stock: 0, description: "", description_en: "", images: [], category_id: "", brand_id: "", mofu_sku: "", status: "published", is_published: true, seo_title: "", seo_description: "" };
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

const ORDER_STATUSES = [["pending", "待處理"], ["processing", "備貨中"], ["shipped", "已寄出"], ["completed", "已完成"], ["cancelled", "已取消"]] as const;
function parseJsonValue(value: unknown): any {
  if (typeof value !== "string") return normalizeAdminValue(value) || {};
  try {
    return normalizeAdminValue(JSON.parse(decodeAdminUnicode(value)));
  } catch {
    return normalizeAdminValue(value) || {};
  }
}
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
  const [productToolsOpen, setProductToolsOpen] = useState(false);
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
      const loadedRows = normalizeAdminRows(result.data);
      setRows(selected === "draft_products" ? loadedRows.filter((row: Row) => row.status !== "published" || row.is_published === false || Number(row.stock) <= 0 || !String(row.name || "").trim() || !String(row.name_en || "").trim() || !String(row.description || "").trim() || !String(row.description_en || "").trim() || !Number(row.price) || !Array.isArray(row.images) || !row.images.some((image: unknown) => typeof image === "string" && /^https?:\/\//i.test(image))) : loadedRows);
      if (selected === "banners") {
        setBannerSlots(toBannerSlots(loadedRows));
      }
      if (selected === "featured_pets") {
        setFeaturedPetSlots(toFeaturedPetSlots(loadedRows));
      }
      if (selected === "categories") {
        setCategories(normalizeAdminRows(result.data));
      } else if (selected === "brands") {
        setBrands(normalizeAdminRows(result.data));
      } else if (selected === "products" || selected === "draft_products") {
        const c = await call("GET", undefined, "categories");
        setCategories(normalizeAdminRows(c.data));
        const b = await call("GET", undefined, "brands");
        setBrands(normalizeAdminRows(b.data));
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
        normalized.markup_multiplier = DEFAULT_MARKUP_MULTIPLIER;
        normalized.exchange_rate = DEFAULT_JPY_TO_HKD;
        normalized.images = parseImageUrls(normalized.images);
        normalized.image_url = normalized.images[0] || null;
      }
      if (tab === "categories") {
        normalized.parent_id = normalized.parent_id || null;
        if (normalized.parent_id === normalized.id) {
          setError("分類不可設為自身的父分類");
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
      const message = e?.message || "儲存失敗，請檢查產品資料後再試。";
      setError(`儲存失敗：${message}`);
      window.alert(`儲存失敗\n\n${message}`);
    }
  }

  async function exportProductsCsv() {
    setCsvBusy(true);
    setCsvNotice("");
    try {
      const response = await fetch("/api/admin/products/csv");
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || "CSV 匯出失敗");
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
      setCsvNotice(`已匯出 ${rows.length} 項產品`);
    } catch (e: any) {
      setCsvNotice(e.message || "CSV 匯出失敗");
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
        throw new Error(result.error || "Excel 匯出失敗");
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
      setCsvNotice(`已下載 Excel，包含 ${rows.length} 項產品，可直接修改後重新匯入`);
    } catch (e: any) {
      setCsvNotice(e.message || "Excel 匯出失敗");
    } finally {
      setCsvBusy(false);
    }
  }

  async function importProductsCsv(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!/\.(csv|xlsx|xls)$/i.test(file.name)) {
      setCsvNotice("請選擇 .csv、.xlsx 或 .xls 檔案");
      return;
    }
    setCsvBusy(true);
    setCsvNotice("");
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/admin/products/csv", { method: "POST", body });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Excel／CSV 匯入失敗");
      const summary = `匯入完成：新增 ${result.created} 項、更新 ${result.updated} 項${result.failed ? `、失敗 ${result.failed} 項` : ""}`;
      setCsvNotice(result.errors?.length ? `${summary}。${result.errors.slice(0, 3).join("；")}` : summary);
      await load("products");
    } catch (e: any) {
      setCsvNotice(e.message || "CSV 匯入失敗");
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
    if (bannerSlots.some((slot) => !slot.title_zh.trim() || !slot.title_en.trim())) {
      setError("每組啟用中的 Banner 必須填寫中文及英文主標題。");
      return;
    }

    const banners = bannerSlots
      .map((slot) => ({
        id: slot.id,
        tag_en: slot.tag_en.trim() || "BEST PARTNER SELECT",
        title_zh: slot.title_zh.trim(),
        title_en: slot.title_en.trim(),
        subtitle_zh: slot.subtitle_zh.trim(),
        subtitle_en: slot.subtitle_en.trim(),
        button_text_zh: slot.button_text_zh.trim() || "探索更多 ➔",
        button_text_en: slot.button_text_en.trim() || "Explore More ➔",
        link_url: slot.link_url.trim() || "/collections/all",
        bg_type: slot.bg_type,
        custom_image_url: slot.custom_image_url.trim(),
        is_active: slot.is_active,
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
      setBannerNotice(result.count === 0 ? "已清空所有 Banner 資料。" : `已儲存 ${result.count} 組 Banner，前台輪播已依排序及上下架狀態更新。`);
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
      setQuickEditError(e.message || "快速儲存失敗");
    } finally {
      setQuickEditSaving(false);
    }
  }

  async function handleBarcode(code: string) {
    const normalized = code.trim();
    if (!normalized) return;
    setProductQuery(normalized);
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
      setBarcodeNotice(e.message || "條碼產品儲存失敗");
    } finally {
      setBarcodeSaving(false);
    }
  }

  function categoryName(categoryId: unknown) {
    return categories.find((category) => String(category.id) === String(categoryId))?.name || "未分類";
  }

  const barcodeTags = barcodeProduct && Array.isArray(barcodeProduct.feature_tags)
    ? barcodeProduct.feature_tags.filter((tag: unknown): tag is string => typeof tag === "string")
    : [];
  const barcodeChineseName = String(barcodeProduct?.name_zh || barcodeProduct?.name || "產品")
    .split(/[｜|]/)[0]
    .replace(/^日本原裝\s*Best Partner\s*/i, "")
    .trim();
  const barcodeJapaneseName = String(barcodeProduct?.name || "").split(/[｜|]/).at(-1)?.trim() || "—";
  const barcodeCostJpy = Number(barcodeDraft?.cost_jpy) || 0;
  const barcodeExchangeRate = Number(barcodeDraft?.exchange_rate) || DEFAULT_JPY_TO_HKD;
  const barcodeShippingHkd = Number(barcodeDraft?.shipping_hkd) || DEFAULT_SHIPPING_HKD;
  const barcodeCostHkd = barcodeCostJpy * barcodeExchangeRate + barcodeShippingHkd;
  const barcodePriceHkd = Number(barcodeDraft?.price) || 0;
  const barcodeMargin = barcodePriceHkd > 0 ? ((barcodePriceHkd - barcodeCostHkd) / barcodePriceHkd) * 100 : 0;
  const barcodeAudience = String(barcodeProduct?.pet_species || "").toLowerCase().includes("cat")
    ? "貓咪專區"
    : String(barcodeProduct?.pet_species || "").toLowerCase().includes("dog") ? "狗狗專區" : "貓狗兼用";
  const barcodeCategory = barcodeProduct?.category_id
    ? categoryName(barcodeProduct.category_id)
    : barcodeTags.filter((tag: string) => tag.startsWith("supplier_category:")).map((tag: string) => tag.split(":")[1]).join("／") || "未分類";
  const barcodeStatus = barcodeProduct?.is_published === false || barcodeProduct?.status === "draft"
    ? "隱藏"
    : Number(barcodeDraft?.stock) > 0 ? "在售中" : "缺貨中";

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#27231f]">
      <header className="flex items-center justify-between border-b border-[#e5ddd3] bg-white px-5 py-4 md:px-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#a36b42]">Mofu Haven HK</p>
          <h1 className="text-xl font-semibold">內容管理中心</h1>
        </div>
        <button onClick={logout} className="rounded-lg border border-[#ded5cc] px-3 py-2 text-sm transition hover:bg-[#FFFFFF]">登出</button>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-6 md:flex-row md:px-10">
        <aside className="w-full shrink-0 rounded-2xl bg-[#2f4a3c] p-3 text-white md:w-56 md:self-start">
          {tabs.map((item) => (
            <button key={item.id} onClick={() => setTab(item.id)} className={`mb-1 w-full rounded-xl px-4 py-3 text-left text-sm transition ${tab === item.id ? "bg-white text-[#2f4a3c]" : "text-white/80 hover:bg-white/10"}`}>
              {item.label}
            </button>
          ))}
          <button onClick={() => router.push("/admin/image-ops")} className="mt-3 w-full rounded-xl border border-white/20 px-4 py-3 text-left text-sm text-white/90 transition hover:bg-white/10">圖片自動補圖</button>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm text-[#8b7c70]">網站內容</p>
              <h2 className="text-3xl font-semibold">{title}</h2>
            </div>
            {tab !== "orders" && tab !== "banners" && tab !== "draft_products" && tab !== "featured_pets" && (
              <button onClick={() => setForm(defaultRow(tab))} className="shrink-0 rounded-xl bg-[#a36b42] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#8f5b37]">新增</button>
            )}
          </div>

          {error && <div role="alert" aria-live="assertive" className="mb-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium leading-6 text-red-800 shadow-sm"><strong className="mr-1">⚠ 儲存失敗：</strong>{error.replace(/^儲存失敗：/, "")}</div>}

          {isProductTab(tab) && (
            <section className="mb-5 rounded-2xl bg-white p-4 shadow-sm md:p-5">
              <div className="flex flex-col gap-3 lg:flex-row">
                <label className="relative min-w-0 flex-1">
                  <span className="sr-only">搜尋產品</span>
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a89587]" />
                  <input
                    value={productQuery}
                    onChange={(event) => setProductQuery(event.target.value)}
                    onKeyDown={(event) => { if (event.key === "Enter" && /^\d{8,14}$/.test(productQuery.trim())) { event.preventDefault(); void handleBarcode(productQuery); } }}
                    placeholder="搜尋產品名稱、關鍵字、SKU 或產品 ID…"
                    className="w-full rounded-xl border border-[#ded5cc] bg-[#FFFFFF] py-3 pl-10 pr-10 text-sm outline-none transition focus:border-[#a36b42] focus:ring-2 focus:ring-[#a36b42]/10"
                  />
                  {productQuery && <button aria-label="清除搜尋" onClick={() => setProductQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b7c70] hover:text-[#2f4a3c]"><X className="h-4 w-4" /></button>}
                </label>
                <label className="lg:w-56">
                  <span className="sr-only">按分類篩選</span>
                  <select value={productCategory} onChange={(event) => setProductCategory(event.target.value)} className="w-full rounded-xl border border-[#ded5cc] bg-[#FFFFFF] px-3 py-3 text-sm outline-none transition focus:border-[#a36b42]">
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
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#F1F1F1] pt-4">
                <button type="button" onClick={() => setScannerOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-[#2f4a3c] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#22372d]"><Camera className="h-4 w-4" />掃碼收貨／查貨</button>
                <div className="relative">
                  <button type="button" onClick={() => setProductToolsOpen((open) => !open)} aria-expanded={productToolsOpen} className="inline-flex items-center gap-2 rounded-xl border border-[#2f4a3c] bg-[#FFFFFF] px-3 py-2 text-sm font-semibold text-[#2f4a3c] transition hover:bg-[#FFFFFF]">
                    <Download className="h-4 w-4" />匯入／匯出 <ChevronDown className={`h-4 w-4 transition-transform ${productToolsOpen ? "rotate-180" : ""}`} />
                  </button>
                  {productToolsOpen && (
                    <div className="absolute left-0 top-full z-20 mt-2 min-w-44 rounded-xl border border-[#ded5cc] bg-white p-1.5 shadow-lg">
                      <button type="button" onClick={() => { setProductToolsOpen(false); void exportProductsCsv(); }} disabled={csvBusy} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[#2f4a3c] hover:bg-[#FFFFFF] disabled:opacity-60"><Download className="h-4 w-4" />匯出 CSV</button>
                      <button type="button" onClick={() => { setProductToolsOpen(false); void exportProductsExcel(); }} disabled={csvBusy} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[#2f4a3c] hover:bg-[#FFFFFF] disabled:opacity-60"><Download className="h-4 w-4" />下載 Excel</button>
                      <label className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#a36b42] hover:bg-[#FFFFFF] ${csvBusy ? "pointer-events-none opacity-60" : ""}`}><Upload className="h-4 w-4" />匯入 Excel／CSV<input type="file" accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" className="sr-only" onChange={(event) => { setProductToolsOpen(false); void importProductsCsv(event); }} disabled={csvBusy} /></label>
                    </div>
                  )}
                </div>
                <details className="basis-full text-xs text-[#806b5d] md:basis-auto">
                  <summary className="inline-flex cursor-pointer select-none items-center gap-1 rounded-lg px-1 py-1 font-medium hover:text-[#2f4a3c]">ⓘ 匯入欄位與發布規則</summary>
                  <div className="mt-2 max-w-2xl rounded-xl bg-[#FFFFFF] px-3 py-2 leading-5">支援 Excel／CSV；欄位：產品名稱／SKU／成本價 JPY／零售價 HKD／圖片 URL。前台只顯示 published、已發布且庫存大於 0 的產品。</div>
                </details>
              </div>
              {csvNotice && <div className="mt-3 rounded-xl bg-[#FFFFFF] px-3 py-2 text-xs leading-5 text-[#805536]" role="status">{csvNotice}</div>}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[#8b7c70]">
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
          ) : form && <Editor tab={tab} form={form} setForm={setForm} categories={categories} brands={brands} onSave={save} onCancel={() => setForm(null)} />}

          {tab !== "featured_pets" && (loading ? (
            <div className="rounded-2xl bg-white p-10 text-center text-[#8b7c70]">載入中…</div>
          ) : visibleRows.length === 0 && !form ? (
            <div className="rounded-2xl bg-white p-10 text-center text-[#8b7c70]">
              {isProductTab(tab) && (productQuery || productCategory !== "all") ? "找不到符合條件的產品。" : "尚未有資料，請按「新增」。"}
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
                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[#F1F1F1] bg-[#FFFFFF] p-2">
                              {row.logo_url ? <img src={row.logo_url} alt={`${row.name || "品牌"} logo`} className="h-full w-full object-contain" loading="lazy" /> : <span className="flex h-full items-center justify-center text-center text-xs text-[#8b7c70]">無 Logo</span>}
                            </div>
                          )}
                          {isProductTab(tab) && (
                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[#F1F1F1] bg-[#FFFFFF]">
                              {thumbnailUrl ? (
                                <img src={thumbnailUrl} alt={`${row.name || "產品"}縮圖`} className="h-full w-full object-cover" loading="lazy" onError={(event) => { event.currentTarget.style.display = "none"; }} />
                              ) : (
                                <div className="flex h-full items-center justify-center px-1 text-center text-[10px] leading-4 text-[#a89587]">無圖片</div>
                              )}
                            </div>
                          )}
                          {tab === "banners" && (
                            <div data-banner-list="true" className="grid h-16 w-36 shrink-0 grid-cols-2 gap-1 overflow-hidden rounded-xl border border-[#F1F1F1] bg-[#FFFFFF] p-1">
                              <div className="relative overflow-hidden rounded-md bg-[#F1F1F1]">
                                {row.image_url ? <img src={row.image_url} alt={`${row.title || "Banner"} 桌面版`} className="h-full w-full object-cover" loading="lazy" /> : <span className="flex h-full items-center justify-center text-[9px] text-[#a89587]">桌面版</span>}
                                <span className="absolute inset-x-0 bottom-0 bg-black/55 px-1 py-0.5 text-center text-[8px] text-white">桌面</span>
                              </div>
                              <div className="relative overflow-hidden rounded-md bg-[#F1F1F1]">
                                {row.mobile_image_url || row.image_url ? <img src={row.mobile_image_url || row.image_url} alt={`${row.title || "Banner"} 手機版`} className="h-full w-full object-cover" loading="lazy" /> : <span className="flex h-full items-center justify-center text-[9px] text-[#a89587]">手機版</span>}
                                <span className="absolute inset-x-0 bottom-0 bg-black/55 px-1 py-0.5 text-center text-[8px] text-white">手機</span>
                              </div>
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold">{isProductTab(tab) ? row.name : tab === "store_settings" ? row.key : row.title || row.name || row.code || row.status}</p>
                            <p className="mt-1 truncate text-sm text-[#8b7c70]">
                              {tab === "products"
                                ? `HK$${row.price ?? 0} · 庫存 ${row.stock ?? 0} · ${categoryName(row.category_id)}`
                                : tab === "brands"
                                  ? `商品 ${row.product_count ?? 0} 項 · 排序 ${row.sort_order ?? 0} · ${row.is_active ? "啟用中" : "已停用"}`
                                : (tab as Tab) === "orders"
                                  ? `${row.total ?? 0} · ${row.created_at || ""}`
                                  : tab === "store_settings"
                                    ? (String(row.value).length > 20 ? "••••••••" : row.value)
                                    : tab === "banners"
                                      ? `排序 ${row.sort_order ?? 0} · ${row.mobile_image_url ? "桌面／手機圖片已設定" : "手機版沿用桌面版"}`
                                      : row.image_url || row.slug || row.discount_type || ""}
                            </p>
                            {isProductTab(tab) && <><p className="mt-1 truncate text-xs text-[#b09f92]">ID：{row.id}{row.mofu_sku ? ` · SKU：${row.mofu_sku}` : row.sku ? ` · SKU：${row.sku}` : ""}</p><span className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${row.status === "published" && row.is_published !== false ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{row.status === "published" && row.is_published !== false ? "前台顯示中" : `未上架：${row.status || "draft"}`}</span></>}
                          </div>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          {isProductTab(tab) ? (
                            <div className="relative">
                              <div className="flex">
                                  <button onClick={() => setForm({ ...row })} className="rounded-l-lg border border-r-0 border-[#ded5cc] px-3 py-2 text-sm transition hover:bg-[#FFFFFF]">完整編輯</button>
                                <button
                                  type="button"
                                    aria-label={`快速編輯 ${row.name || "產品"}`}
                                    aria-expanded={openQuickEditProductId === String(row.id)}
                                    onClick={() => toggleQuickEdit(row)}
                                  className="rounded-r-lg border border-[#ded5cc] px-2 py-2 text-sm transition hover:bg-[#FFFFFF]"
                                >
                                    <ChevronDown className={`h-4 w-4 transition-transform ${openQuickEditProductId === String(row.id) ? "rotate-180" : ""}`} />
                                </button>
                              </div>
                            </div>
                          ) : tab === "banners" ? (
                            <span className="rounded-lg border border-[#ded5cc] px-3 py-2 text-sm text-[#8b7c70]">請於上方四格管理</span>
                          ) : (tab as Tab) === "orders" ? (
                            <span className="rounded-lg border border-[#ded5cc] px-3 py-2 text-sm text-[#8b7c70]">可直接於卡片操作</span>
                          ) : (
                            <button onClick={() => setForm({ ...row })} className="rounded-lg border border-[#ded5cc] px-3 py-2 text-sm transition hover:bg-[#FFFFFF]">編輯</button>
                          )}
                          {(tab as Tab) !== "orders" && tab !== "banners" && tab !== "draft_products" && <button onClick={() => remove(row)} className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 transition hover:bg-red-50">刪除</button>}
                        </div>
                      </div>
                      {isProductTab(tab) && openQuickEditProductId === String(row.id) && quickEditDraft && (
                        <div className="mt-4 border-t border-[#F1F1F1] pt-4" role="region" aria-label={`${row.name || "產品"} 快速編輯`}>
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-[#2f4a3c]">快速編輯</p>
                              <p className="mt-0.5 text-xs text-[#8b7c70]">不離開產品列表即可更新核心資料</p>
                            </div>
                            <span className="rounded-full bg-[#FFFFFF] px-2.5 py-1 text-xs font-medium text-[#805536]">即時儲存</span>
                          </div>
                          <div className="grid gap-3 sm:grid-cols-3">
                            <label className="text-sm"><span className="mb-1 block font-medium">成本價（JPY）</span><input type="number" min="0" step="1" value={quickEditDraft.cost_jpy ?? ""} onChange={(event) => setQuickEditDraft({ ...quickEditDraft, cost_jpy: event.target.value })} className="w-full rounded-lg border border-[#ded5cc] bg-[#FFFFFF] px-3 py-2 outline-none focus:border-[#a36b42]" placeholder="例如 380" /></label>
                            <label className="text-sm"><span className="mb-1 block font-medium">售價（HKD）</span><input type="number" min="0" step="0.01" value={quickEditDraft.price} onChange={(event) => setQuickEditDraft({ ...quickEditDraft, price: event.target.value })} className="w-full rounded-lg border border-[#ded5cc] bg-[#FFFFFF] px-3 py-2 outline-none focus:border-[#a36b42]" placeholder="手動輸入" /></label>
                            <label className="text-sm"><span className="mb-1 block font-medium">原價（HKD）</span><input type="number" min="0" step="0.01" value={quickEditDraft.original_price} onChange={(event) => setQuickEditDraft({ ...quickEditDraft, original_price: event.target.value })} className="w-full rounded-lg border border-[#ded5cc] bg-[#FFFFFF] px-3 py-2 outline-none focus:border-[#a36b42]" placeholder="可選" /></label>
                            <label className="text-sm"><span className="mb-1 block font-medium">庫存（Stock）</span><input type="number" min="0" step="1" value={quickEditDraft.stock} onChange={(event) => setQuickEditDraft({ ...quickEditDraft, stock: event.target.value })} className="w-full rounded-lg border border-[#ded5cc] bg-[#FFFFFF] px-3 py-2 outline-none focus:border-[#a36b42]" /></label>
                            <label className="text-sm"><span className="mb-1 block font-medium">是否將貨品上架</span><select value={quickEditDraft.status} onChange={(event) => setQuickEditDraft({ ...quickEditDraft, status: event.target.value, is_published: event.target.value === "published" })} className="w-full rounded-lg border border-[#ded5cc] bg-[#FFFFFF] px-3 py-2 outline-none focus:border-[#a36b42]"><option value="published">Publish（上架）</option><option value="draft">Draft（草稿）</option></select></label>
                          </div>
                          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-[#FFFFFF] px-3 py-2 text-xs text-[#806b5d]">
                            <span>成本資料僅限 Admin；完整編輯可進行匯率、運費、倍率及毛利試算。</span>
                            {quickEditError && <span className="text-red-600">{quickEditError}</span>}
                          </div>
                          <div className="mt-3 flex justify-end"><button type="button" onClick={saveQuickEdit} disabled={quickEditSaving} className="rounded-lg bg-[#2f4a3c] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#22372d] disabled:cursor-wait disabled:opacity-60">{quickEditSaving ? "儲存中…" : "即時儲存"}</button></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {isProductTab(tab) && filteredProductRows.length > 0 && productPageCount > 1 && (
                <nav aria-label="產品分頁" className="mt-6 flex flex-wrap items-center justify-center gap-2">
                  <button disabled={productPage === 1} onClick={() => setProductPage((page) => Math.max(1, page - 1))} className="inline-flex items-center gap-1 rounded-lg border border-[#ded5cc] bg-white px-3 py-2 text-sm transition hover:bg-[#FFFFFF] disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft className="h-4 w-4" />上一頁</button>
                  {getPageNumbers(productPage, productPageCount).map((page, index) => page === "ellipsis" ? <span key={`ellipsis-${index}`} className="px-1 text-[#8b7c70]">…</span> : <button key={page} onClick={() => setProductPage(page)} aria-current={page === productPage ? "page" : undefined} className={`min-w-9 rounded-lg px-3 py-2 text-sm transition ${page === productPage ? "bg-[#2f4a3c] text-white" : "border border-[#ded5cc] bg-white hover:bg-[#FFFFFF]"}`}>{page}</button>)}
                  <button disabled={productPage === productPageCount} onClick={() => setProductPage((page) => Math.min(productPageCount, page + 1))} className="inline-flex items-center gap-1 rounded-lg border border-[#ded5cc] bg-white px-3 py-2 text-sm transition hover:bg-[#FFFFFF] disabled:cursor-not-allowed disabled:opacity-40">下一頁<ChevronRight className="h-4 w-4" /></button>
                  <span className="basis-full text-center text-xs text-[#8b7c70]">顯示第 {firstVisibleProduct}–{lastVisibleProduct} 項，共 {filteredProductRows.length} 項</span>
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
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#a36b42]">條碼匹配成功</p>
                <h2 id="barcode-product-title" className="mt-1 text-xl font-semibold">{barcodeChineseName}</h2>
                <p className="mt-1 text-sm text-[#756962]">原廠日文：{barcodeJapaneseName}</p>
                <p className="mt-1 text-xs text-[#8b7c70]">JAN／店內貨號：{barcodeProduct.barcode || barcodeProduct.mofu_sku || barcodeProduct.sku || "—"}</p>
              </div>
              <button type="button" onClick={() => { setBarcodeProduct(null); setBarcodeDraft(null); }} className="rounded-lg p-2 text-[#8b7c70] hover:bg-[#FFFFFF]" aria-label="關閉"><X className="h-5 w-5" /></button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-full bg-[#e8f3ec] px-3 py-1.5 text-[#2f4a3c]">{barcodeStatus}</span>
              <span className="rounded-full bg-[#FFFFFF] px-3 py-1.5 text-[#756962]">{barcodeAudience}／{barcodeCategory}</span>
              <span className="rounded-full bg-[#FFFFFF] px-3 py-1.5 text-[#756962]">規格：{barcodeProduct.product_spec || "—"}</span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#FFFFFF] p-3 text-sm">目前庫存<strong className="mt-1 block text-2xl text-[#2f4a3c]">{barcodeDraft.stock}</strong></div>
              <div className="rounded-xl bg-[#FFFFFF] p-3 text-sm">折合港幣成本<strong className="mt-1 block text-2xl text-[#805536]">HK${barcodeCostHkd.toFixed(2)}</strong><span className="text-xs text-[#8b7c70]">匯率 {barcodeExchangeRate}</span></div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <label className="text-sm"><span className="mb-1 block font-medium">日元來貨價（JPY）</span><input type="number" min="0" step="1" value={barcodeDraft.cost_jpy ?? ""} onChange={(event) => setBarcodeDraft({ ...barcodeDraft, cost_jpy: event.target.value })} className="w-full rounded-xl border border-[#ded5cc] px-3 py-3" placeholder="例如 380" /></label>
              <label className="text-sm"><span className="mb-1 block font-medium">目前售價（HKD）</span><input type="number" min="0" step="0.01" value={barcodeDraft.price ?? 0} onChange={(event) => setBarcodeDraft({ ...barcodeDraft, price: event.target.value })} className="w-full rounded-xl border border-[#ded5cc] px-3 py-3" /></label>
              <div className="rounded-xl border border-[#ded5cc] bg-[#FFFFFF] p-3 text-sm"><span className="block font-medium">預估毛利率</span><strong className={`mt-2 block text-xl ${barcodeMargin < 30 ? "text-[#b34d36]" : "text-[#2f4a3c]"}`}>{barcodeMargin.toFixed(1)}%</strong></div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3"><button type="button" onClick={() => setBarcodeDraft({ ...barcodeDraft, stock: Number(barcodeDraft.stock || 0) + 10 })} className="rounded-xl border border-[#2f4a3c] px-4 py-3 font-semibold text-[#2f4a3c]">+10 入庫</button><button type="button" onClick={() => setBarcodeDraft({ ...barcodeDraft, stock: Number(barcodeDraft.stock || 0) + 20 })} className="rounded-xl border border-[#2f4a3c] px-4 py-3 font-semibold text-[#2f4a3c]">+20 入庫</button></div>
            <label className="mt-4 block text-sm"><span className="mb-1 block font-medium">調整後庫存</span><input type="number" min="0" value={barcodeDraft.stock ?? 0} onChange={(event) => setBarcodeDraft({ ...barcodeDraft, stock: event.target.value })} className="w-full rounded-xl border border-[#ded5cc] px-3 py-3" /></label>
            {barcodeMargin < 30 && <p className="mt-3 rounded-lg bg-[#FFFFFF] px-3 py-2 text-sm text-[#b34d36]">折後利潤過低，請檢查日元成本或售價。</p>}
            {barcodeNotice && <p className="mt-3 text-sm text-red-600">{barcodeNotice}</p>}<button type="button" onClick={saveBarcodeProduct} disabled={barcodeSaving} className="mt-5 w-full rounded-xl bg-[#2f4a3c] px-4 py-3 font-semibold text-white disabled:opacity-50">{barcodeSaving ? "儲存中…" : "儲存庫存／售價／日元成本"}</button>
          </section>
        </div>
      )}
    </div>
  );
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
  const name = String(customer.name || customer.customerName || "未提供姓名");
  const phone = String(customer.phone || customer.phoneNumber || "未提供電話");
  const address = [customer.district, customer.address, customer.addressLine2, customer.sfStationCode ? `順豐站／智能櫃：${customer.sfStationCode}` : ""].filter(Boolean).join("，");
  const statusLabel = ORDER_STATUSES.find(([key]) => key === status)?.[1] || status;
  const saveOrder = async (patch: Row) => {
    if (!order.id) return;
    setSaving(true); setNotice("");
    try { const result = await call("PATCH", { table: "orders", id: order.id, row: patch }); onSaved({ ...patch, ...(result.data || {}) }); }
    catch (error: any) { setNotice(error.message || "訂單更新失敗"); }
    finally { setSaving(false); }
  };
  const copyDelivery = async () => {
    try { await navigator.clipboard.writeText([name, phone, address || "未提供地址"].join("\n")); setCopied(true); window.setTimeout(() => setCopied(false), 1800); }
    catch { setNotice("無法存取剪貼簿，請手動選取文字複製。"); }
  };
  return <article className="rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md md:p-5">
    <header className="flex flex-col gap-3 border-b border-[#F1F1F1] pb-4 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-semibold">訂單 {order.order_number || order.orderNumber || String(order.id || "").slice(0, 8)}</h3><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status === "cancelled" ? "bg-red-50 text-red-700" : status === "completed" ? "bg-emerald-50 text-emerald-700" : status === "shipped" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"}`}>{statusLabel}</span></div><p className="mt-1 text-sm text-[#8b7c70]">{orderDate(order.created_at || order.createdAt)}</p></div><div className="text-left sm:text-right"><p className="text-xs text-[#8b7c70]">訂單總額</p><p className="text-2xl font-bold text-[#2f4a3c]">{orderMoney(total)}</p></div></header>
    <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)]"><section className="rounded-xl bg-[#FFFFFF] p-4"><div className="mb-3 flex items-center justify-between gap-2"><h4 className="font-semibold text-[#2f4a3c]">出貨資料</h4><button type="button" onClick={copyDelivery} className="rounded-lg border border-[#F1F1F1] px-2.5 py-1.5 text-xs font-medium text-[#805536] hover:bg-white">{copied ? "已複製" : "複製送貨資料"}</button></div><dl className="space-y-2 text-sm"><div><dt className="text-xs text-[#8b7c70]">顧客姓名</dt><dd className="font-medium">{name}</dd></div><div><dt className="text-xs text-[#8b7c70]">聯絡電話</dt><dd>{phone}</dd></div><div><dt className="text-xs text-[#8b7c70]">配送地址</dt><dd className="leading-6">{address || "未提供地址"}</dd></div></dl></section><section><h4 className="mb-2 font-semibold text-[#2f4a3c]">揀貨清單</h4><div className="overflow-x-auto rounded-xl border border-[#F1F1F1]"><table className="w-full min-w-[560px] table-fixed text-sm"><thead className="bg-[#FFFFFF] text-left text-xs text-[#8b7c70]"><tr><th className="px-3 py-2">商品</th><th className="px-3 py-2 text-center">數量</th><th className="px-3 py-2 text-right">單價</th><th className="px-3 py-2 text-right">小計</th></tr></thead><tbody className="divide-y divide-[#F1F1F1]">{items.map((item, index) => { const itemName = typeof item.name === "object" ? item.name?.zh || item.name?.en || item.name?.ja : item.name || item.title || "未命名商品"; const qty = Number(item.qty ?? item.quantity ?? 1) || 1; const price = Number(item.price ?? item.unit_price ?? 0) || 0; const bundle = getBundleComponents(String(item.mofuSku || item.mofu_sku || item.sku || "")); return <Fragment key={`${item.id || itemName}-${index}`}><tr><td className="max-w-[260px] break-words px-3 py-2.5 align-top leading-5">{itemName}</td><td className="whitespace-nowrap px-3 py-2.5 text-center align-top font-bold text-[#2f4a3c]">x {qty}</td><td className="whitespace-nowrap px-3 py-2.5 text-right align-top">{orderMoney(price)}</td><td className="whitespace-nowrap px-3 py-2.5 text-right align-top font-medium">{orderMoney(price * qty)}</td></tr>{bundle.length ? <tr key={`${item.id || itemName}-${index}-picking`}><td colSpan={4} className="bg-[#FFFFFF] px-3 py-2.5"><p className="break-words font-semibold leading-5 text-[#805536]">📦 揀貨明細清單｜{String(item.mofuSku || item.mofu_sku || item.sku)} × {qty}</p><ul className="mt-1 space-y-1 text-xs text-[#6d5a4e]">{bundle.map((component) => <li key={component.sku} className="break-words leading-5">・{component.nameZh}｜{component.nameJa}｜{component.weight}｜JAN {component.sku} × {qty}</li>)}</ul></td></tr> : null}</Fragment>; })}</tbody></table></div><div className="mt-3 ml-auto max-w-xs space-y-1 text-sm"><div className="flex justify-between text-[#8b7c70]"><span>運費</span><span>{orderMoney(shipping)}</span></div><div className="flex justify-between border-t border-[#F1F1F1] pt-2 text-base font-bold"><span>訂單總額</span><span className="text-[#2f4a3c]">{orderMoney(total)}</span></div></div></section></div>
    <footer className="mt-4 flex flex-col gap-3 border-t border-[#F1F1F1] pt-4 sm:flex-row sm:items-end sm:justify-between"><div className="grid w-full gap-3 sm:max-w-xl sm:grid-cols-2"><label className="text-sm"><span className="mb-1 block font-medium">訂單狀態</span><select value={status} onChange={(event) => { const next = event.target.value; setStatus(next); void saveOrder({ status: next }); }} disabled={saving} className="w-full rounded-lg border border-[#ded5cc] bg-white px-3 py-2"><option value="pending">待處理</option><option value="processing">備貨中</option><option value="shipped">已寄出</option><option value="completed">已完成</option><option value="cancelled">已取消</option></select></label><label className="text-sm"><span className="mb-1 block font-medium">順豐運單編號</span><div className="flex gap-2"><input value={tracking} onChange={(event) => setTracking(event.target.value)} placeholder="輸入 Waybill No." className="min-w-0 flex-1 rounded-lg border border-[#ded5cc] px-3 py-2" /><button type="button" onClick={() => void saveOrder({ customer_info: JSON.stringify({ ...customer, _admin_tracking_number: tracking.trim() }) })} disabled={saving} className="rounded-lg bg-[#2f4a3c] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">儲存</button></div></label></div>{notice && <span className="text-sm text-red-600">{notice}</span>}</footer>
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
        data.append("prefix", String(form.mofu_sku || form.sku || form.id || "product"));
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
    setForm({ ...form, images: urls, image_url: urls[0] || null });
  }

  function setProductImages(value: unknown) {
    const urls = parseImageUrls(value);
    setForm({ ...form, images: urls, image_url: urls[0] || null });
  }

  function moveProductImage(index: number, direction: -1 | 1) {
    const urls = parseImageUrls(form.images);
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= urls.length) return;
    [urls[index], urls[nextIndex]] = [urls[nextIndex], urls[index]];
    setProductImages(urls);
  }

  function makeProductImageCover(index: number) {
    if (index <= 0) return;
    const urls = parseImageUrls(form.images);
    const [cover] = urls.splice(index, 1);
    if (cover) urls.unshift(cover);
    setProductImages(urls);
  }

  const productImages = parseImageUrls(form.images);
  const preview = pricingPreview(form.cost_jpy, form.shipping_hkd, form.price);
  const setNumeric = (key: string) => (event: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: event.target.value === "" ? "" : Number(event.target.value) });

  const field = (key: string, label: string, type = "text") => (
    <label className="block text-sm">
      <span className="mb-1 block font-medium">{label}</span>
      <input type={type} value={Array.isArray(form[key]) ? form[key].join("\n") : (form[key] ?? "")} onChange={(event) => setForm({ ...form, [key]: type === "number" ? Number(event.target.value) : event.target.value })} className="w-full rounded-lg border border-[#ded5cc] bg-white px-3 py-2 outline-none focus:border-[#a36b42]" />
    </label>
  );

  return (
    <section className="mb-5 rounded-2xl bg-white p-5 shadow-sm">
      {tab === "banners" && !form.id && <div className="mb-4 rounded-xl bg-[#FFFFFF] px-4 py-3 text-sm text-[#805536]">新增 Banner 預設會加入現有 slider。如要只保留這一張 Banner，請勾選「覆蓋現有 Banner」再儲存。</div>}
      <div className="grid gap-4 md:grid-cols-2">
        {isProductTab(tab) && <>
          {field("name", "產品名稱")}
          {field("mofu_sku", "Mofu SKU")}
          <div className="md:col-span-2 rounded-2xl border border-[#F1F1F1] bg-[#FFFFFF] p-4">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <div><h3 className="font-semibold text-[#2f4a3c]">定價與成本試算</h3><p className="mt-1 text-xs text-[#8b7c70]">只限 Admin 查看；成本會存放於受保護設定，不會進入公開商品 API。</p></div>
              <span className="rounded-full bg-[#FFFFFF] px-2.5 py-1 text-xs font-medium text-[#805536]">JPY → HKD</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="text-sm"><span className="mb-1 block font-medium">來貨成本（JPY）</span><input type="number" min="0" step="1" value={form.cost_jpy ?? ""} onChange={setNumeric("cost_jpy")} className="w-full rounded-lg border border-[#ded5cc] bg-white px-3 py-2 outline-none focus:border-[#a36b42]" placeholder="例如 380" /></label>
              <label className="text-sm"><span className="mb-1 block font-medium">平攤運費（只供毛利參考）</span><input type="number" min="0" step="0.01" value={form.shipping_hkd ?? DEFAULT_SHIPPING_HKD} onChange={setNumeric("shipping_hkd")} className="w-full rounded-lg border border-[#ded5cc] bg-white px-3 py-2 outline-none focus:border-[#a36b42]" /></label>
              <div className="rounded-lg bg-white px-3 py-2 text-sm">定價倍率（固定）：<strong>{DEFAULT_RETAIL_MULTIPLIER.toFixed(1)}×</strong></div>
              <div className="rounded-lg bg-white px-3 py-2 text-sm">JPY/HKD 匯率（固定）：<strong>{DEFAULT_JPY_TO_HKD.toFixed(3)}</strong></div>
            </div>
            <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4"><div className="rounded-lg bg-white px-3 py-2">成本港幣（未加平攤運費）：<strong>HK${preview.costHkd.toFixed(2)}</strong></div><div className="rounded-lg bg-white px-3 py-2">真・建議零售價 MSRP：<strong>HK${preview.suggestedPrice.toFixed(2)}</strong></div><div className="rounded-lg bg-white px-3 py-2">+12% 最終售價：<strong>HK${preview.finalSalePrice.toFixed(2)}</strong></div><button type="button" onClick={() => setForm({ ...form, markup_multiplier: DEFAULT_RETAIL_MULTIPLIER, exchange_rate: DEFAULT_JPY_TO_HKD, msrp_price: preview.suggestedPrice, price: preview.finalSalePrice, price_hkd: preview.finalSalePrice, current_hkd: preview.finalSalePrice, original_price: null })} className="rounded-lg bg-[#2f4a3c] px-3 py-2 font-semibold text-white transition hover:bg-[#22372d]">套用建議 MSRP 與最終售價</button></div>
          </div>
          <div className="md:col-span-2 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
            <label className="block text-sm"><span className="mb-1 block font-medium">售價（HKD）</span><input type="number" min="0" step="0.01" value={form.price ?? ""} onChange={setNumeric("price")} className="w-full rounded-lg border border-[#ded5cc] bg-white px-3 py-2 outline-none focus:border-[#a36b42]" /></label>
            <div className="rounded-xl border border-[#F1F1F1] bg-[#FFFFFF] p-3 text-xs"><p className="mb-2 font-semibold text-[#2f4a3c]">折扣毛利試算</p><div className="grid grid-cols-2 gap-2 sm:grid-cols-4"><span>單件<br /><strong>{preview.margin(preview.retailPrice).toFixed(1)}%</strong></span><span>6件 9折<br /><strong>{preview.margin(preview.retailPrice * .9).toFixed(1)}%</strong></span><span>9件 85折<br /><strong>{preview.margin(preview.retailPrice * .85).toFixed(1)}%</strong></span><span className={preview.margin(preview.retailPrice * .8) < 30 ? "font-bold text-red-600" : ""}>12件 8折<br /><strong>{preview.margin(preview.retailPrice * .8).toFixed(1)}%</strong></span></div>{preview.margin(preview.retailPrice * .8) < 30 ? <p className="mt-2 font-semibold text-red-600">折後利潤過低</p> : null}</div>
          </div>
          {field("original_price", "原價", "number")}
          {field("stock", "庫存", "number")}
          <div className="md:col-span-2">
            <label className="block text-sm">
              <span className="mb-1 block font-medium">圖片 URL（最多 {MAX_PRODUCT_IMAGES} 張，每行一個）</span>
              <textarea
                rows={4}
                value={productImages.join("\n")}
                onChange={(event) => setProductImages(event.target.value)}
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
                  <div key={`${url}-${index}`} className="group relative overflow-hidden rounded-xl border border-[#F1F1F1] bg-[#FFFFFF]">
                    <img src={url} alt={`產品圖片 ${index + 1}`} className="aspect-square w-full object-cover" loading="lazy" />
                    <button type="button" onClick={() => removeProductImage(index)} className="absolute right-1.5 top-1.5 rounded-full bg-white/90 px-2 py-1 text-xs text-red-600 shadow-sm transition hover:bg-white">移除</button>
                    <p className="truncate px-2 py-1.5 text-[10px] text-[#8b7c70]">{index === 0 ? "圖片 1 · 封面" : `圖片 ${index + 1}`}</p>
                    <div className="flex flex-wrap gap-1.5 border-t border-[#F1F1F1] px-2 pb-2 pt-2">
                      {index > 0 && <button type="button" onClick={() => makeProductImageCover(index)} className="rounded-md bg-[#FFFFFF] px-2 py-1 text-[10px] font-semibold text-[#805536] hover:bg-[#e7d6c6]">★ 設為封面</button>}
                      <button type="button" onClick={() => moveProductImage(index, -1)} disabled={index === 0} className="rounded-md border border-[#ded5cc] px-2 py-1 text-[10px] text-[#6f6258] hover:bg-white disabled:cursor-not-allowed disabled:opacity-40">◀ 向前</button>
                      <button type="button" onClick={() => moveProductImage(index, 1)} disabled={index === productImages.length - 1} className="rounded-md border border-[#ded5cc] px-2 py-1 text-[10px] text-[#6f6258] hover:bg-white disabled:cursor-not-allowed disabled:opacity-40">向後 ▶</button>
                    </div>
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
          <label className="block text-sm"><span className="mb-1 block font-medium">所屬品牌</span><select value={form.brand_id || ""} onChange={(event) => setForm({ ...form, brand_id: event.target.value || null })} className="w-full rounded-lg border border-[#ded5cc] px-3 py-2"><option value="">未指定品牌</option>{brands.filter((brand) => brand.is_active || String(brand.id) === String(form.brand_id)).map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}</select></label>
          <label className="block text-sm"><span className="mb-1 block font-medium">產品狀態</span><select value={form.status || "draft"} onChange={(event) => setForm({ ...form, status: event.target.value })} className="w-full rounded-lg border border-[#ded5cc] px-3 py-2"><option value="published">published（上架）</option><option value="draft">draft（草稿）</option><option value="archived">archived（歸檔）</option></select></label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_published !== false} onChange={(event) => setForm({ ...form, is_published: event.target.checked })} />已發布到前台</label>
        </>}
        {tab === "brands" && <>{field("name", "品牌名稱")}{field("slug", "Slug")}{field("logo_url", "Logo 圖片 URL")}{field("description", "品牌簡介")}{field("sort_order", "排序", "number")}<label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active !== false} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} />前台啟用</label><label className="block text-sm md:col-span-2"><span className="mb-1 block font-medium">上傳品牌 Logo</span><input type="file" accept="image/*" onChange={(event) => uploadSingle(event, "logo_url")} className="w-full rounded-lg border border-dashed border-[#c9b8a8] px-3 py-2 text-sm" />{uploading && <span className="text-xs text-[#a36b42]">上傳中…</span>}</label></>}
        {tab === "categories" && <>{field("name", "分類名稱（後台系統名稱）")}{field("name_zh", "中文分類名稱（中文頁面顯示）")}{field("name_en", "English category name（英文頁面顯示）")}{field("slug", "Slug")}          <label className="block text-sm"><span className="mb-1 block font-medium">父分類</span><select value={form.parent_id || ""} onChange={(event) => setForm({ ...form, parent_id: event.target.value })} className="w-full rounded-lg border border-[#ded5cc] px-3 py-2"><option value="">頂層分類</option>{categoryGroups(categories, String(form.id || "")).map(({ root, entries }) => <optgroup key={root.id} label={root.name}>{entries.map(({ category, depth }) => <option key={category.id} value={category.id}>{categoryOptionLabel(category.name, depth + 1)}</option>)}</optgroup>)}</select></label>{field("image_url", "封面圖片 URL")}<label className="block text-sm"><span className="mb-1 block font-medium">上傳封面</span><input type="file" accept="image/*" onChange={(event) => uploadSingle(event, "image_url")} className="w-full rounded-lg border border-dashed border-[#c9b8a8] px-3 py-2 text-sm" />{uploading && <span className="text-xs text-[#a36b42]">上傳中…</span>}</label>{field("sort_order", "排序", "number")}</>}
        {tab === "banners" && <>{field("image_url", "桌面版圖片 URL")}<label className="block text-sm"><span className="mb-1 block font-medium">上傳桌面版 Banner</span><input type="file" accept="image/*" onChange={(event) => uploadSingle(event, "image_url")} className="w-full rounded-lg border border-dashed border-[#c9b8a8] px-3 py-2 text-sm" />{uploading && <span className="text-xs text-[#a36b42]">上傳中…</span>}</label>{field("mobile_image_url", "手機版圖片 URL（選填）")}<label className="block text-sm"><span className="mb-1 block font-medium">上傳手機版 Banner</span><span className="mb-2 block text-xs text-[#8b7c70]">建議直向構圖（約 4:5）；留空時手機會沿用桌面版圖片。</span><input type="file" accept="image/*" onChange={(event) => uploadSingle(event, "mobile_image_url")} className="w-full rounded-lg border border-dashed border-[#c9b8a8] px-3 py-2 text-sm" />{uploading && <span className="text-xs text-[#a36b42]">上傳中…</span>}</label>{field("link", "點擊連結")}{field("title", "標題")}{field("sort_order", "排序", "number")}{!form.id && <label className="flex items-center gap-2 text-sm md:col-span-2"><input type="checkbox" checked={form.replace_existing === true} onChange={(event) => setForm({ ...form, replace_existing: event.target.checked })} />覆蓋現有 Banner（勾選後才會清除舊 slider）</label>}</>}
        {tab === "coupons" && <>{field("code", "優惠碼")}{field("discount_amount", "折扣金額／百分比", "number")}<label className="block text-sm"><span className="mb-1 block font-medium">折扣類型</span><select value={form.discount_type} onChange={(event) => setForm({ ...form, discount_type: event.target.value })} className="w-full rounded-lg border border-[#ded5cc] px-3 py-2"><option value="fixed">固定金額 HKD</option><option value="percentage">百分比</option></select></label><label className="flex items-center gap-2 pt-7 text-sm"><input type="checkbox" checked={Boolean(form.active)} onChange={(event) => setForm({ ...form, active: event.target.checked })} />啟用優惠碼</label></>}
        {tab === "store_settings" && <>{field("key", "設定 Key")}{field("value", "設定值（Secret Key 儲存後會遮罩）")}</>}
        {tab === "orders" && <p className="rounded-xl bg-[#FFFFFF] p-4 text-sm text-[#806b5d]">訂單已改用結構化出貨卡片，請直接在訂單卡片內更新狀態、揀貨及順豐運單。</p>}
      </div>
      <div className="mt-5 flex gap-2"><button onClick={onSave} disabled={uploading} className="rounded-lg bg-[#2f4a3c] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#22372d] disabled:opacity-50">儲存</button><button onClick={onCancel} className="rounded-lg border border-[#ded5cc] px-4 py-2 text-sm transition hover:bg-[#FFFFFF]">取消</button></div>
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
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState("");

  function updateSlot(index: number, patch: Partial<BannerSlot>) {
    onChange(slots.map((slot, slotIndex) => (slotIndex === index ? { ...slot, ...patch } : slot)));
  }

  function addSlot() {
    onChange([...slots, emptyBannerSlot(slots.length)]);
  }

  function removeSlot(index: number) {
    if (!window.confirm("確定刪除這組 Banner？儲存後才會正式移除。")) return;
    onChange(slots.filter((_, slotIndex) => slotIndex !== index).map((slot, slotIndex) => ({ ...slot, sort_order: slotIndex })));
  }

  function moveSlot(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= slots.length) return;
    const next = [...slots];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    onChange(next.map((slot, slotIndex) => ({ ...slot, sort_order: slotIndex })));
  }

  async function uploadBannerImage(event: React.ChangeEvent<HTMLInputElement>, index: number) {
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
      if (!response.ok || typeof result.url !== "string" || !result.url.trim()) throw new Error(result.error || "圖片上傳失敗");
      updateSlot(index, { custom_image_url: result.url.trim(), bg_type: "custom_image" });
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "圖片上傳失敗，請稍後再試。");
    } finally {
      setUploadingSlot(null);
    }
  }

  return (
    <section className="mb-5 rounded-2xl bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-[#2f4a3c]">首頁 Hero Banner 動態管理</p>
          <p className="mt-1 text-sm leading-6 text-[#806b5d]">Banner 獨立儲存在 banners 表，不會修改任何產品資料。可新增、編輯、刪除、拖曳式上下移排序及上下架；產品矩陣背景會由前台即時載入現有產品圖片。</p>
        </div>
        <button type="button" onClick={addSlot} className="rounded-xl bg-[#a36b42] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#8f5b37]">＋新增 Banner</button>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {slots.map((slot, index) => (
          <fieldset key={slot.id || `new-${index}`} className={`rounded-2xl border p-4 ${slot.is_active ? "border-[#F1F1F1] bg-[#FFFFFF]" : "border-dashed border-[#c9b8a8] bg-[#FFFFFF] opacity-75"}`}>
            <legend className="rounded-full bg-[#2f4a3c] px-3 py-1 text-sm font-semibold text-white">Banner {index + 1}</legend>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-b border-[#F1F1F1] pb-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-[#2f4a3c]"><input type="checkbox" checked={slot.is_active} onChange={(event) => updateSlot(index, { is_active: event.target.checked })} />前台上架</label>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => moveSlot(index, -1)} disabled={index === 0} className="rounded-lg border border-[#ded5cc] px-2 py-1 text-xs disabled:opacity-35">↑ 上移</button>
                <button type="button" onClick={() => moveSlot(index, 1)} disabled={index === slots.length - 1} className="rounded-lg border border-[#ded5cc] px-2 py-1 text-xs disabled:opacity-35">↓ 下移</button>
                <button type="button" onClick={() => removeSlot(index)} className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50">刪除</button>
              </div>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm sm:col-span-2"><span className="mb-1 block font-medium">英文小標 tag_en</span><input value={slot.tag_en} onChange={(event) => updateSlot(index, { tag_en: event.target.value })} placeholder="REASON TO CHOOSE" className="w-full rounded-lg border border-[#ded5cc] px-3 py-2 outline-none focus:border-[#a36b42]" /></label>
              <label className="block text-sm"><span className="mb-1 block font-medium">中文主標題 *</span><textarea value={slot.title_zh} onChange={(event) => updateSlot(index, { title_zh: event.target.value })} rows={2} className="w-full rounded-lg border border-[#ded5cc] px-3 py-2 outline-none focus:border-[#a36b42]" /></label>
              <label className="block text-sm"><span className="mb-1 block font-medium">英文主標題 *</span><textarea value={slot.title_en} onChange={(event) => updateSlot(index, { title_en: event.target.value })} rows={2} className="w-full rounded-lg border border-[#ded5cc] px-3 py-2 outline-none focus:border-[#a36b42]" /></label>
              <label className="block text-sm"><span className="mb-1 block font-medium">中文副標題</span><textarea value={slot.subtitle_zh} onChange={(event) => updateSlot(index, { subtitle_zh: event.target.value })} rows={3} className="w-full rounded-lg border border-[#ded5cc] px-3 py-2 outline-none focus:border-[#a36b42]" /></label>
              <label className="block text-sm"><span className="mb-1 block font-medium">英文副標題</span><textarea value={slot.subtitle_en} onChange={(event) => updateSlot(index, { subtitle_en: event.target.value })} rows={3} className="w-full rounded-lg border border-[#ded5cc] px-3 py-2 outline-none focus:border-[#a36b42]" /></label>
              <label className="block text-sm"><span className="mb-1 block font-medium">中文按鈕文字</span><input value={slot.button_text_zh} onChange={(event) => updateSlot(index, { button_text_zh: event.target.value })} className="w-full rounded-lg border border-[#ded5cc] px-3 py-2 outline-none focus:border-[#a36b42]" /></label>
              <label className="block text-sm"><span className="mb-1 block font-medium">英文按鈕文字</span><input value={slot.button_text_en} onChange={(event) => updateSlot(index, { button_text_en: event.target.value })} className="w-full rounded-lg border border-[#ded5cc] px-3 py-2 outline-none focus:border-[#a36b42]" /></label>
              <label className="block text-sm sm:col-span-2"><span className="mb-1 block font-medium">連結 link_url</span><input value={slot.link_url} onChange={(event) => updateSlot(index, { link_url: event.target.value })} placeholder="/collections/natural-meat-treats" className="w-full rounded-lg border border-[#ded5cc] px-3 py-2 outline-none focus:border-[#a36b42]" /></label>
              <label className="block text-sm"><span className="mb-1 block font-medium">背景模式</span><select value={slot.bg_type} onChange={(event) => updateSlot(index, { bg_type: event.target.value as BannerSlot["bg_type"] })} className="w-full rounded-lg border border-[#ded5cc] bg-white px-3 py-2"><option value="product_grid">產品矩陣＋白霧</option><option value="custom_image">自訂圖片＋白霧</option></select></label>
              <label className="block text-sm"><span className="mb-1 block font-medium">自訂背景圖片 URL</span><input value={slot.custom_image_url} onChange={(event) => updateSlot(index, { custom_image_url: event.target.value })} placeholder="選填" className="w-full rounded-lg border border-[#ded5cc] px-3 py-2 outline-none focus:border-[#a36b42]" /></label>
              <label className="block text-sm sm:col-span-2"><span className="mb-1 block font-medium">上傳自訂背景圖片</span><input type="file" accept="image/*" onChange={(event) => uploadBannerImage(event, index)} disabled={uploadingSlot !== null} className="w-full rounded-lg border border-dashed border-[#c9b8a8] px-3 py-2 text-xs disabled:opacity-60" />{uploadingSlot === index && <span className="mt-1 block text-xs text-[#a36b42]">上傳中…</span>}</label>
            </div>
          </fieldset>
        ))}
      </div>

      {slots.length === 0 && <div className="rounded-xl border border-dashed border-[#c9b8a8] p-8 text-center text-sm text-[#8b7c70]">尚未有 Banner，請按「新增 Banner」。</div>}
      {uploadError && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{uploadError}</p>}
      {notice && <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</p>}
      <div className="mt-5 flex flex-wrap items-center gap-3"><button type="button" onClick={onSave} disabled={saving || uploadingSlot !== null} className="rounded-lg bg-[#2f4a3c] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#22372d] disabled:cursor-wait disabled:opacity-60">{saving ? "儲存中…" : "儲存全部 Banner"}</button><span className="text-xs text-[#8b7c70]">排序會按上移／下移即時調整；只有「前台上架」的 Banner 會在首頁顯示。</span></div>
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
            <fieldset key={index} className="rounded-2xl border border-[#F1F1F1] bg-[#FFFFFF] p-4">
              <legend className="rounded-full bg-[#2f4a3c] px-3 py-1 text-sm font-semibold text-white">內容槽 {index + 1}</legend>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">高清寵物圖片 <span className="text-red-600">*</span></label>
                  <div className="aspect-[4/3] overflow-hidden rounded-xl border border-dashed border-[#c9b8a8] bg-[#FFFFFF]">
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
