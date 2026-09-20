"use client";

import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { useCatalog } from "@/lib/catalog-context";
import { formatMoney } from "@/lib/i18n/translations";
import { getLocalizedProductName } from "@/lib/translateProductName";
import type { Product } from "@/lib/products";
import { useCart } from "@/lib/shop/cart";
import { ProductImage } from "@/components/product/ProductImage";
import QRCode from "qrcode";

export type PetMatcherWizardProps = { variant: "home" | "floating" };
type Pet = "dog" | "cat";
type Age = number;
type Size = "small" | "medium" | "large";
type Need = "chew" | "dental" | "walk" | "sensitive" | "picky-cat" | "urinary";
type SpecialCare = "allergy" | "joints" | "strong-chewer";

type Choice = { zh: string; en: string };

const BREEDS: Record<Pet, Choice[]> = {
  dog: [
    { zh: "柴犬", en: "Shiba Inu" },
    { zh: "玩具貴婦", en: "Toy Poodle" },
    { zh: "松鼠狗", en: "Pomeranian" },
    { zh: "比熊犬", en: "Bichon Frise" },
    { zh: "哥基", en: "Corgi" },
    { zh: "法國鬥牛犬", en: "French Bulldog" },
    { zh: "唐狗／混種犬", en: "Mixed Breed" },
    { zh: "金毛尋回犬", en: "Golden Retriever" },
    { zh: "史納莎", en: "Schnauzer" },
    { zh: "拉布拉多", en: "Labrador Retriever" },
    { zh: "哈士奇", en: "Siberian Husky" },
    { zh: "其他", en: "Other" },
  ],
  cat: [
    { zh: "英國短毛貓", en: "British Shorthair" },
    { zh: "唐貓／家貓", en: "Domestic Shorthair" },
    { zh: "布偶貓", en: "Ragdoll" },
    { zh: "美國短毛貓", en: "American Shorthair" },
    { zh: "異國短毛貓", en: "Exotic Shorthair" },
    { zh: "曼赤肯短腿貓", en: "Munchkin" },
    { zh: "暹羅貓", en: "Siamese" },
    { zh: "緬因貓", en: "Maine Coon" },
    { zh: "其他", en: "Other" },
  ],
};

const QUICK_BREEDS: Record<Pet, Choice[]> = {
  dog: [
    { zh: "柴犬", en: "Shiba Inu" },
    { zh: "貴婦", en: "Toy Poodle" },
    { zh: "哥基", en: "Corgi" },
    { zh: "唐狗", en: "Mixed Breed" },
    { zh: "比熊", en: "Bichon Frise" },
  ],
  cat: [
    { zh: "英短", en: "British Shorthair" },
    { zh: "唐貓", en: "Domestic Shorthair" },
    { zh: "布偶", en: "Ragdoll" },
    { zh: "美短", en: "American Shorthair" },
  ],
};

const NEEDS: Record<Pet, Array<{ id: Need; label: Choice; hint: Choice; keywords: string[] }>> = {
  dog: [
    { id: "chew", label: { zh: "拆家放電・極致耐咬", en: "Power chewing & energy release" }, hint: { zh: "原隻牛蹄／特長牛大筋", en: "Whole hooves and beef tendons" }, keywords: ["hoof", "tendon", "beef", "chew", "牛蹄", "牛大筋", "耐咬"] },
    { id: "dental", label: { zh: "日常口腔護理・物理潔齒", en: "Everyday dental care" }, hint: { zh: "牛肉皮潔齒棒／潔齒圈", en: "Dental sticks and rings" }, keywords: ["dental", "tooth", "oral", "ring", "潔齒", "牙", "口腔"] },
    { id: "walk", label: { zh: "出門暴衝・舒適散步", en: "Comfortable walks without pulling" }, hint: { zh: "Y 型減壓胸背帶／牽引繩", en: "Y-harnesses and pressure-friendly leads" }, keywords: ["harness", "lead", "walk", "outdoor", "walking", "胸背", "牽引", "散步"] },
    { id: "sensitive", label: { zh: "敏感腸胃・挑食毛孩", en: "Sensitive stomachs & picky eaters" }, hint: { zh: "北海道野生鹿肉／低敏馬肉", en: "Hokkaido venison and gentle horse meat" }, keywords: ["venison", "horse", "meat", "sensitive", "鹿肉", "馬肉", "原肉"] },
  ],
  cat: [
    { id: "picky-cat", label: { zh: "挑食胃口差・純肉開胃", en: "Picky appetites & pure-meat treats" }, hint: { zh: "嚴選日本天然原肉，天然肉香激發食慾", en: "Carefully selected Japanese natural meat to gently awaken appetite" }, keywords: ["fish", "seafood", "salmon", "treat", "meat", "魚", "三文魚", "深海", "原肉", "天然雞肉"] },
    { id: "urinary", label: { zh: "下泌尿道健康照護", en: "Lower urinary tract support" }, hint: { zh: "高水分無添加配方，呵護泌尿與腸胃", en: "High-moisture, additive-free recipes for urinary and digestive care" }, keywords: ["urinary", "hydration", "moisture", "digestive", "pouch", "水分", "泌尿", "腸胃"] },
  ],
};

const CAT_DISCONTINUED_TERMS = ["ciao", "churu", "scallop lips", "帆立貝唇", "魚肉條", "fish strips"];

const AGE_OPTIONS: Array<{ value: Age; zh: string; en: string }> = [
  { value: 0, zh: "未滿 1 歲（幼年換牙／發育期）", en: "Under 1 year" },
  ...Array.from({ length: 14 }, (_, index) => {
    const value = index + 1;
    return { value, zh: `${value} 歲`, en: `${value} ${value === 1 ? "year" : "years"} old` };
  }),
  { value: 15, zh: "15 歲以上（高齡長壽寶貝）", en: "15+ years old" },
];

function ageLabel(age: Age | null, locale: "zh" | "en"): string {
  if (age === null) return locale === "zh" ? "未指定" : "Not specified";
  return AGE_OPTIONS.find((option) => option.value === age)?.[locale] ?? (locale === "zh" ? `${age} 歲` : `${age} years old`);
}

function ageResultLabel(age: Age | null, locale: "zh" | "en"): string {
  if (age === null) return locale === "zh" ? "未指定歲數" : "an unspecified age";
  if (locale === "zh") return age === 0 ? "未滿 1 歲" : age === 15 ? "15 歲以上" : `${age} 歲`;
  return age === 0 ? "under 1 year old" : age === 15 ? "15+ years old" : `${age}-year-old`;
}

function ageKeywords(age: Age): string[] {
  if (age === 0) return ["puppy", "kitten", "growth", "soft", "bone", "puppy", "幼犬", "幼貓", "發育", "換牙"];
  if (age <= 6) return ["energy", "protein", "active", "chew", "高蛋白", "活力", "耐咬"];
  return ["senior", "joint", "low fat", "gentle", "高齡", "關節", "低脂", "低負擔"];
}

const SIZE_LABELS: Record<Size, Choice & { keywords: string[] }> = {
  small: { zh: "小型（約 10kg 以下）", en: "Small (under 10kg)", keywords: ["small", "toy", "mini", "small breed", "小型", "迷你", "幼犬", "幼貓"] },
  medium: { zh: "中型（約 10–25kg）", en: "Medium (10–25kg)", keywords: ["medium", "mid-size", "medium breed", "中型"] },
  large: { zh: "大型（約 25kg 以上）", en: "Large (25kg+)", keywords: ["large", "giant", "large breed", "大型"] },
};

const SPECIAL_CARE: Array<{ id: SpecialCare; label: Choice; hint: Choice; keywords: string[] }> = [
  { id: "allergy", label: { zh: "🌿 容易過敏（避開常見禽肉）", en: "🌿 Sensitive / avoid common poultry" }, hint: { zh: "優先鹿肉乾及低敏馬肉", en: "Prioritise venison and gentle horse meat" }, keywords: ["venison", "horse", "鹿肉", "馬肉", "低敏"] },
  { id: "joints", label: { zh: "🦴 關節與骨骼保健", en: "🦴 Joint and bone support" }, hint: { zh: "優先天然軟骨素來源", en: "Prioritise natural chondroitin sources" }, keywords: ["cartilage", "trachea", "joint", "bone", "軟骨", "喉氣管", "關節"] },
  { id: "strong-chewer", label: { zh: "🦷 強烈咬合・防拆家", en: "🦷 Strong chewer / home protection" }, hint: { zh: "優先牛蹄及特長牛大筋", en: "Prioritise hooves and long beef tendons" }, keywords: ["hoof", "tendon", "chew", "牛蹄", "牛大筋", "耐咬"] },
];

function searchableProductText(product: Product): string {
  return [product.name.en, product.name.zh, product.description?.en, product.description?.zh, product.categorySlug, product.metadata?.category, product.metadata?.subcategory, product.brandName, product.brand, ...(product.tags ?? [])].filter(Boolean).join(" ").toLowerCase();
}

function scoreProduct(product: Product, need: Need, pet: Pet, age: Age, size: Size, specialCare: SpecialCare[]): number {
  const text = searchableProductText(product);
  const selectedNeed = NEEDS[pet].find((candidate) => candidate.id === need);
  const keywordScore = selectedNeed?.keywords.reduce((score, keyword) => score + (text.includes(keyword.toLowerCase()) ? 8 : 0), 0) ?? 0;
  const petScore = pet === "cat" && /cat|feline|貓|ciao/.test(text) ? 12 : pet === "dog" && /dog|canine|犬|狗|walk|chew/.test(text) ? 8 : 0;
  const sizeScore = SIZE_LABELS[size].keywords.reduce((score, keyword) => score + (text.includes(keyword.toLowerCase()) ? 5 : 0), 0);
  const ageScore = ageKeywords(age).reduce((score, keyword) => score + (text.includes(keyword.toLowerCase()) ? 4 : 0), 0);
  const inStockScore = product.inStock !== false ? 2 : -100;
  const specialScore = specialCare.reduce((score, careId) => {
    const care = SPECIAL_CARE.find((candidate) => candidate.id === careId);
    return score + (care?.keywords.reduce((careScore, keyword) => careScore + (text.includes(keyword.toLowerCase()) ? 18 : 0), 0) ?? 0);
  }, 0);
  return keywordScore + petScore + sizeScore + ageScore + specialScore + inStockScore;
}

function drawWrappedText(context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number {
  const words = Array.from(text);
  let line = "";
  for (const word of words) {
    const next = `${line}${word}`;
    if (context.measureText(next).width > maxWidth && line) {
      context.fillText(line, x, y);
      y += lineHeight;
      line = word;
    } else {
      line = next;
    }
  }
  if (line) {
    context.fillText(line, x, y);
    y += lineHeight;
  }
  return y;
}

function localize(choice: Choice, locale: "zh" | "en") {
  return choice[locale];
}

export function PetMatcherWizard({ variant }: PetMatcherWizardProps) {
  const { locale } = useI18n();
  const { products } = useCatalog();
  const { lines, addItem } = useCart();
  const isZh = locale === "zh";
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [pet, setPet] = useState<Pet | null>(null);
  const [age, setAge] = useState<Age | null>(null);
  const [size, setSize] = useState<Size | null>(null);
  const [breed, setBreed] = useState<Choice | null>(null);
  const [need, setNeed] = useState<Need | null>(null);
  const [specialCare, setSpecialCare] = useState<SpecialCare[]>([]);
  const [addedIds, setAddedIds] = useState<string[]>([]);
  const [shareNotice, setShareNotice] = useState("");

  const recommendations = useMemo(() => {
    if (!pet || !need) return [];
    const excluded = new Set(lines.map((line) => line.id));
    return products
      .filter((product) => {
        if (product.inStock === false || excluded.has(product.id)) return false;
        if (pet === "cat") {
          const text = searchableProductText(product);
          return !CAT_DISCONTINUED_TERMS.some((term) => text.includes(term));
        }
        return true;
      })
      .sort((a, b) => scoreProduct(b, need, pet, age ?? 1, size ?? "medium", specialCare) - scoreProduct(a, need, pet, age ?? 1, size ?? "medium", specialCare) || a.price - b.price)
      .slice(0, 3);
  }, [age, lines, need, pet, products, size, specialCare]);

  const total = recommendations.reduce((sum, product) => sum + product.price, 0);
  const openWizard = () => {
    setOpen(true);
    setStep(1);
    setAddedIds([]);
  };
  const closeWizard = () => setOpen(false);
  const reset = () => {
    setStep(1);
    setPet(null);
    setAge(null);
    setSize(null);
    setBreed(null);
    setNeed(null);
    setSpecialCare([]);
    setAddedIds([]);
    setShareNotice("");
  };
  const canContinue = step === 1 ? Boolean(pet) : step === 2 ? Boolean(age && size) : step === 3 ? Boolean(breed) : Boolean(need);
  const next = () => {
    if (!canContinue) return;
    if (step < 4) setStep((current) => current + 1);
    else setStep(5);
  };
  const addOne = (product: Product) => {
    addItem(product.id);
    setAddedIds((current) => [...new Set([...current, product.id])]);
  };
  const addBundle = () => {
    recommendations.forEach((product) => addItem(product.id));
    setAddedIds(recommendations.map((product) => product.id));
    window.setTimeout(() => window.dispatchEvent(new Event("mofu:open-cart")), 80);
  };
  const toggleSpecialCare = (careId: SpecialCare) => {
    setSpecialCare((current) => current.includes(careId) ? current.filter((item) => item !== careId) : [...current, careId]);
  };
  const shareProposal = async (mode: "download" | "instagram" = "download") => {
    if (!pet || !need) return;
    const shareUrl = `${window.location.origin}/?matcher=${encodeURIComponent([pet, age ?? "", size ?? "", breed?.en ?? "", need, ...specialCare].join("|"))}`;
    const shareText = isZh ? "我剛完成 Mofu Haven 毛孩專屬選品配對！" : "I just found a tailored Mofu Haven pet-care match!";
    const qrDataUrl = await QRCode.toDataURL(shareUrl, { width: 180, margin: 1, color: { dark: "#704525", light: "#FAF7F2" } });
    const canvas = document.createElement("canvas");
    canvas.width = 900;
    canvas.height = 1180;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.fillStyle = "#FAF7F2";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#8A5836";
    context.fillRect(0, 0, canvas.width, 18);
    context.fillStyle = "#704525";
    context.font = "bold 42px sans-serif";
    context.fillText("Mofu Haven HK", 70, 105);
    context.font = "24px sans-serif";
    context.fillStyle = "#A36B42";
    context.fillText(isZh ? "毛孩專屬日系好物配對" : "A tailored Japanese pet-care match", 72, 145);
    let y = 225;
    context.fillStyle = "#3f342d";
    context.font = "bold 34px sans-serif";
    y = drawWrappedText(context, isZh ? `為你的${breed?.zh ?? "毛孩"}推薦` : `Recommended for your ${breed?.en ?? "companion"}`, 72, y, 750, 48);
    context.font = "24px sans-serif";
    context.fillStyle = "#6f6258";
    y = drawWrappedText(context, isZh ? `年齡：${ageLabel(age, "zh")}` : `Age: ${ageLabel(age, "en")}`, 72, y + 12, 750, 34);
    y = drawWrappedText(context, isZh ? `體型：${size ? SIZE_LABELS[size].zh : "未指定"}` : `Size: ${size ? SIZE_LABELS[size].en : "Not specified"}`, 72, y, 750, 34);
    const careLabels = specialCare.map((careId) => SPECIAL_CARE.find((care) => care.id === careId)).filter(Boolean).map((care) => localize(care!.label, locale)).join(isZh ? "、" : ", ");
    if (careLabels) y = drawWrappedText(context, isZh ? `特別關注：${careLabels}` : `Special care: ${careLabels}`, 72, y + 12, 750, 34);
    y += 28;
    context.font = "bold 26px sans-serif";
    context.fillStyle = "#704525";
    context.fillText(isZh ? "推薦好物" : "Recommended essentials", 72, y);
    y += 45;
    context.font = "22px sans-serif";
    context.fillStyle = "#3f342d";
    recommendations.forEach((product, index) => {
      y = drawWrappedText(context, `${index + 1}. ${getLocalizedProductName(product, locale)}  ·  ${formatMoney(product.price, locale)}`, 82, y, 700, 32) + 10;
    });
    const qrImage = new Image();
    qrImage.src = qrDataUrl;
    await new Promise<void>((resolve) => { qrImage.onload = () => resolve(); qrImage.onerror = () => resolve(); });
    if (qrImage.complete) context.drawImage(qrImage, 640, 850, 180, 180);
    context.font = "20px sans-serif";
    context.fillStyle = "#A36B42";
    context.fillText(isZh ? "為毛孩挑選 100% 日本天然好物" : "100% natural Japanese essentials for your pet", 72, 925);
    context.font = "18px sans-serif";
    context.fillStyle = "#8f8175";
    context.fillText("mofuhavenhk.vercel.app", 72, 970);
    context.fillText(isZh ? "掃描 QR Code 分享你的專屬提案" : "Scan to share your tailored proposal", 72, 1010);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) return;
    if (mode === "instagram") {
      const file = new File([blob], "mofu-haven-pet-match.png", { type: "image/png" });
      if (typeof navigator.share === "function" && typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: isZh ? "Mofu Haven 毛孩專屬提案" : "Mofu Haven pet-care proposal", text: shareText });
          setShareNotice(isZh ? "已開啟分享選單，請選擇 Instagram 動態。" : "Share sheet opened — choose Instagram Stories.");
          return;
        } catch {
          // The user may dismiss the native share sheet; fall through to a local download.
        }
      }
    }
    const downloadUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = downloadUrl;
    anchor.download = "mofu-haven-pet-match.png";
    anchor.click();
    URL.revokeObjectURL(downloadUrl);
    try { await navigator.clipboard.writeText(shareUrl); } catch { /* clipboard permissions are optional */ }
    setShareNotice(mode === "instagram"
      ? (isZh ? "已下載分享卡片並複製連結，請在 Instagram 動態加入圖片。" : "Card downloaded and link copied — add the image to Instagram Stories.")
      : (isZh ? "分享卡片已下載，連結亦已複製。" : "Card downloaded and proposal link copied."));
  };
  const shareToWhatsApp = () => {
    if (!pet || !need) return;
    const shareUrl = `${window.location.origin}/?matcher=${encodeURIComponent([pet, age ?? "", size ?? "", breed?.en ?? "", need, ...specialCare].join("|"))}`;
    const text = isZh ? `我剛完成 Mofu Haven 毛孩專屬選品配對！\n${shareUrl}` : `I just found a tailored Mofu Haven pet-care match!\n${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    setShareNotice(isZh ? "已開啟 WhatsApp 分享。" : "WhatsApp sharing opened.");
  };

  useEffect(() => {
    if (!open) return undefined;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = originalOverflow; };
  }, [open]);

  const title = isZh ? "30秒毛孩智能選品配對精靈" : "30-Second Pet Matcher";
  const stepTitle = step === 1 ? (isZh ? "先認識一下你的毛孩" : "Tell us about your companion") : step === 2 ? (isZh ? "毛孩的年齡與體型？" : "What are their age and size?") : step === 3 ? (isZh ? "牠是甚麼品種？" : "What breed are they?") : step === 4 ? (isZh ? "目前最想改善甚麼？" : "What would help most right now?") : (isZh ? "這是為毛孩度身訂造的提案" : "A tailored proposal for your companion");

  return (
    <>
      {variant === "home" ? (
        <section className="mx-auto my-5 max-w-6xl px-3 sm:px-6 lg:px-10">
          <div className="flex flex-col items-start justify-between gap-4 rounded-3xl border border-[#ead8c8] bg-[#FAF7F2] p-5 shadow-[0_18px_40px_-30px_rgba(73,48,31,0.5)] sm:flex-row sm:items-center sm:p-6">
            <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a36b42]">{isZh ? "MOFU HAVEN CARE MATCH" : "MOFU HAVEN CARE MATCH"}</p><h2 className="mt-1 text-xl font-bold tracking-tight text-stone-800 sm:text-2xl">{isZh ? "🐾 不知道買什麼？30 秒測出毛孩專屬日系好物" : "🐾 Not sure what to choose? Find their Japanese essentials in 30 seconds"}</h2><p className="mt-1 text-sm text-stone-500">{isZh ? "告訴我們毛孩的品種與需求，為牠量身定制照護組合" : "Tell us their breed and needs for a tailored care bundle."}</p></div>
            <button type="button" onClick={openWizard} className="shrink-0 rounded-full bg-[#8a5836] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#a66d46] active:scale-[0.97]">{isZh ? "開始配對 →" : "Start matching →"}</button>
          </div>
        </section>
      ) : (
        <button type="button" onClick={openWizard} className="fixed bottom-5 right-4 z-40 flex items-center gap-2 rounded-full border border-white/70 bg-[#8a5836] px-3.5 py-2.5 text-xs font-bold text-white shadow-[0_12px_30px_-12px_rgba(73,48,31,0.75)] transition hover:bg-[#a66d46] active:scale-[0.97] sm:bottom-6 sm:right-6"><span className="text-base">🐾</span><span>{isZh ? "30秒配對" : "Pet Matcher"}</span></button>
      )}

      {open ? <div className="fixed inset-0 z-[100] flex items-end justify-center bg-stone-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="pet-matcher-title" onMouseDown={(event) => { if (event.target === event.currentTarget) closeWizard(); }}>
        <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-3xl border border-[#ead8c8] bg-[#FAF7F2] shadow-2xl sm:rounded-3xl">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#ead8c8] bg-[#FAF7F2]/95 px-5 py-4 backdrop-blur"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a36b42]">Mofu Haven</p><h2 id="pet-matcher-title" className="text-lg font-bold text-stone-800">{title}</h2></div><button type="button" onClick={closeWizard} aria-label={isZh ? "關閉配對" : "Close matcher"} className="rounded-full p-2 text-xl text-stone-500 hover:bg-white">×</button></div>
          <div className="px-5 pb-6 pt-4 sm:px-7">
            {step < 5 ? <><div className="mb-5 flex items-center gap-1.5" aria-label={isZh ? `第 ${step} 步，共 4 步` : `Step ${step} of 4`}>{[1, 2, 3, 4].map((item) => <span key={item} className={`h-1.5 flex-1 rounded-full ${item <= step ? "bg-[#8a5836]" : "bg-[#ead8c8]"}`} />)}</div><p className="text-xs font-semibold text-[#a36b42]">{isZh ? `第 ${step} 步／4` : `Step ${step} of 4`}</p><h3 className="mt-2 text-xl font-bold leading-tight text-stone-800">{stepTitle}</h3>
              {step === 1 ? <div className="mt-5 grid grid-cols-2 gap-3">{(["cat", "dog"] as Pet[]).map((item) => <button key={item} type="button" onClick={() => setPet(item)} className={`flex min-h-28 flex-col items-center justify-center rounded-2xl border-2 bg-white text-3xl transition ${pet === item ? "border-[#8a5836] bg-[#fff5e9]" : "border-transparent"}`}><span>{item === "cat" ? "🐱" : "🐶"}</span><span className="mt-2 text-sm font-bold text-stone-700">{item === "cat" ? (isZh ? "貓咪" : "Cat") : (isZh ? "狗狗" : "Dog")}</span>{pet === item ? <span className="text-xs text-[#8a5836]">✓</span> : null}</button>)}</div> : null}
              {step === 2 ? <div className="mt-5 grid gap-3"><label htmlFor="pet-matcher-age" className="text-xs font-bold uppercase tracking-[0.14em] text-stone-400">{isZh ? "毛孩歲數" : "Pet age"}</label><div className="relative"><select id="pet-matcher-age" value={age === null ? "" : String(age)} onChange={(event) => setAge(event.target.value === "" ? null : Number(event.target.value))} className="h-11 w-full appearance-none rounded-xl border border-stone-200 bg-[#FAF7F2] px-3.5 pr-10 text-sm font-semibold text-stone-700 outline-none transition focus:border-[#8a5836] focus:ring-2 focus:ring-[#8a5836]/15"><option value="" disabled>{isZh ? "請選擇毛孩歲數..." : "Select pet age..."}</option>{AGE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{isZh ? option.zh : option.en}</option>)}</select><span aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-stone-400">⌄</span></div><p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-stone-400">{isZh ? "寵物體型" : "Pet size"}</p><div className="grid grid-cols-3 gap-2">{(Object.keys(SIZE_LABELS) as Size[]).map((item) => <button key={item} type="button" onClick={() => setSize(item)} className={`rounded-full border px-2.5 py-2 text-center text-xs font-semibold transition sm:text-sm ${size === item ? "border-[#8a5836] bg-[#fff5e9] text-[#704525]" : "border-stone-200 bg-white text-stone-700"}`}>{localize(SIZE_LABELS[item], locale)}</button>)}</div></div> : null}
              {step === 3 && pet ? <div className="mt-5"><label htmlFor="pet-matcher-breed" className="sr-only">{isZh ? "選擇品種" : "Select a breed"}</label><div className="relative"><select id="pet-matcher-breed" value={breed?.en ?? ""} onChange={(event) => setBreed(BREEDS[pet].find((item) => item.en === event.target.value) ?? null)} className="h-11 w-full appearance-none rounded-xl border border-stone-200 bg-white px-4 pr-10 text-sm font-semibold text-stone-700 outline-none transition focus:border-[#8a5836] focus:ring-2 focus:ring-[#8a5836]/15"><option value="" disabled>{isZh ? "請選擇品種..." : "Select a breed..."}</option>{BREEDS[pet].map((item) => <option key={item.en} value={item.en}>{localize(item, locale)}</option>)}</select><span aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-stone-400">⌄</span></div><p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">{isZh ? "熱門品種" : "Popular breeds"}</p><div className="mt-2 flex flex-wrap gap-2">{QUICK_BREEDS[pet].map((item) => <button key={item.en} type="button" onClick={() => setBreed(BREEDS[pet].find((candidate) => candidate.en === item.en) ?? item)} className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${breed?.en === item.en ? "border-[#8a5836] bg-[#fff5e9] text-[#704525]" : "border-white bg-white text-stone-700 hover:border-[#d7b394]"}`}>{localize(item, locale)}</button>)}</div></div> : null}
              {step === 4 && pet ? <div className="mt-5 grid gap-3">{NEEDS[pet].map((item) => <button key={item.id} type="button" onClick={() => setNeed(item.id)} className={`rounded-2xl border-2 bg-white p-4 text-left transition ${need === item.id ? "border-[#8a5836] bg-[#fff5e9]" : "border-transparent"}`}><span className="block text-sm font-bold text-stone-800">{localize(item.label, locale)}</span><span className="mt-1 block text-xs text-stone-500">{localize(item.hint, locale)}</span></button>)}<div className="mt-2 rounded-2xl border border-[#ead8c8] bg-white/70 p-4"><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#a36b42]">{isZh ? "特殊照護關注（可多選）" : "Special care focus (choose all that apply)"}</p><div className="mt-3 flex flex-wrap gap-2">{SPECIAL_CARE.map((item) => <button key={item.id} type="button" onClick={() => toggleSpecialCare(item.id)} aria-pressed={specialCare.includes(item.id)} className={`rounded-full border px-3 py-2 text-left text-xs font-semibold transition ${specialCare.includes(item.id) ? "border-[#8a5836] bg-[#fff5e9] text-[#704525]" : "border-stone-200 bg-white text-stone-700 hover:border-[#d7b394]"}`}>{localize(item.label, locale)}</button>)}</div><p className="mt-2 text-xs text-stone-500">{isZh ? "我們會優先配對店內王牌商品。" : "We will prioritise the strongest matches from our catalog."}</p></div></div> : null}
              <div className="mt-7 flex justify-between gap-3"><button type="button" onClick={() => setStep((current) => Math.max(1, current - 1))} disabled={step === 1} className="rounded-full px-4 py-2.5 text-sm font-semibold text-stone-500 disabled:invisible">{isZh ? "返回" : "Back"}</button><button type="button" onClick={next} disabled={!canContinue} className="rounded-full bg-[#8a5836] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#a66d46] disabled:cursor-not-allowed disabled:opacity-40">{step === 4 ? (isZh ? "🎯 立即配對專屬提案 →" : "🎯 Show my proposal →") : (isZh ? "下一步 →" : "Next →")}</button></div></> : <>
              <div className="mt-4 rounded-2xl bg-[#ead8c8]/55 p-4 text-sm leading-6 text-stone-700">{isZh ? `為你 ${ageResultLabel(age, "zh")} 的 ${breed?.zh ?? "毛孩"} 量身定制的日系提案${size ? `（${SIZE_LABELS[size].zh}）` : ""}：${need === "walk" ? "出門散步建議搭配 Y 型胸背帶，分散拉扯受力，減少勒喉不適。" : need === "sensitive" ? "低敏單一肉源適合用作日常獎勵，溫柔照顧挑食及敏感腸胃。" : age === 0 ? "幼年期優先選擇易消化、適合發育及換牙需要的溫和好物。" : age !== null && age >= 7 ? "熟齡期優先選擇低脂低負擔、兼顧關節保護的日常好物。" : "成年期配搭高蛋白及適度耐咬好物，讓毛孩吃得開心、玩得安心。"}` : `Tailored Japanese plan for your ${ageResultLabel(age, "en")} ${breed?.en ?? "companion"}${size ? ` (${SIZE_LABELS[size].en.toLowerCase()})` : ""}: ${need === "walk" ? "pair a pressure-friendly Y-harness with everyday walks for a more comfortable fit." : need === "sensitive" ? "choose gentle single-protein treats for a calmer routine and happier appetites." : age === 0 ? "choose easy-to-digest essentials suited to growth and teething." : age !== null && age >= 7 ? "prioritise gentle, lower-fat essentials with thoughtful joint support." : "a thoughtful mix of high-protein and active-lifestyle essentials for happier everyday moments."}`}</div>
              <div className="mt-4 grid gap-3">{recommendations.length ? recommendations.map((product) => <article key={product.id} className="flex items-center gap-3 rounded-2xl border border-white bg-white p-3"><div className="relative h-16 w-16 min-w-[64px] shrink-0 overflow-hidden rounded-xl bg-[#FAF7F2] p-1"><ProductImage src={product.images?.[0] ?? product.image ?? "catalog-placeholder"} alt={getLocalizedProductName(product, locale)} sizes="64px" className="h-full w-full object-contain mix-blend-multiply" /></div><div className="min-w-0 flex-1"><p className="line-clamp-2 text-sm font-semibold text-stone-800">{getLocalizedProductName(product, locale)}</p><p className="mt-1 text-sm font-bold text-[#8a5836]">{formatMoney(product.price, locale)}</p></div><button type="button" onClick={() => addOne(product)} disabled={addedIds.includes(product.id)} className="shrink-0 rounded-full bg-[#8a5836] px-3 py-2 text-xs font-bold text-white disabled:bg-emerald-700">{addedIds.includes(product.id) ? "✓" : isZh ? "+ 加購" : "+ Add"}</button></article>) : <p className="rounded-2xl bg-white p-4 text-sm text-stone-500">{isZh ? "商品目錄更新中，請稍後再試。" : "The product catalog is updating. Please try again shortly."}</p>}</div>
              {recommendations.length ? <button type="button" onClick={addBundle} className="mt-5 w-full rounded-2xl bg-[#8a5836] px-4 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#a66d46]">{isZh ? `🛒 一鍵打包加入購物車（共 ${formatMoney(total, locale)}）` : `🛒 Add the bundle to cart (${formatMoney(total, locale)})`}</button> : null}{recommendations.length ? <button type="button" onClick={() => { void shareProposal(); }} className="mt-3 w-full rounded-2xl border border-[#d7b394] bg-white px-4 py-3 text-sm font-semibold text-[#704525] transition hover:bg-[#fff5e9]">{isZh ? "📤 儲存／分享專屬提案卡片" : "📤 Save / share my proposal card"}</button> : null}{recommendations.length ? <div className="mt-3 grid grid-cols-2 gap-2"><button type="button" onClick={shareToWhatsApp} className="rounded-2xl bg-[#25D366] px-3 py-3 text-xs font-bold text-white transition hover:brightness-95">{isZh ? "WhatsApp 分享" : "Share to WhatsApp"}</button><button type="button" onClick={() => { void shareProposal("instagram"); }} className="rounded-2xl bg-gradient-to-r from-[#833AB4] via-[#E1306C] to-[#F77737] px-3 py-3 text-xs font-bold text-white transition hover:brightness-105">{isZh ? "Instagram 動態" : "Instagram Stories"}</button></div> : null}{shareNotice ? <p className="mt-3 rounded-xl bg-[#ead8c8]/55 px-3 py-2 text-center text-xs text-[#704525]" role="status">{shareNotice}</p> : null}<button type="button" onClick={reset} className="mt-3 w-full rounded-full border border-[#d7b394] bg-white px-4 py-2.5 text-sm font-semibold text-stone-700">{isZh ? "重新測試" : "Retake"}</button></>}
          </div>
        </div>
      </div> : null}
    </>
  );
}
