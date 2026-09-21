import { createClient } from "@supabase/supabase-js";
import { writeFile } from "node:fs/promises";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_KEY;
if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_KEY are required");

const supabase = createClient(url, key);
const { data, error } = await supabase
  .from("products")
  .select("id,mofu_sku,name_zh,name_en,price,original_price,stock_quantity,is_published,description_zh,description_en,product_spec,pet_species,feature_tags")
  .neq("is_published", false)
  .limit(500);
if (error) throw error;

const rows = (data ?? []).map((row) => {
  const zh = typeof row.description_zh === "string" ? row.description_zh : "";
  const en = typeof row.description_en === "string" ? row.description_en : "";
  const text = `${zh}\n${en}`;
  const sections = {
    highlights: /核心亮點|商品特色|商品特點|highlights|features/i.test(text),
    feeding: /餵食方法|餵食方式|使用方法|feeding|directions/i.test(text),
    nutrition: /規格與保證營養|保證營養|產品規格|nutrition|specifications/i.test(text),
    notes: /貼心叮嚀|注意事項|保存方法|notes|storage|caution/i.test(text),
    faq: /常見問題|FAQ|問答|frequently asked/i.test(text),
  };
  const medicalClaimFlags = [
    /治療|治癒|根治|救星|改善貧血|改善皮膚|抗炎|消炎|抗焦慮|洗牙費用|不會過敏|安全千倍/i.test(zh),
    /cure|treats?\s+(?:allerg|anemi|dermatitis)|anti-inflammatory|anti-anxiety|guaranteed/i.test(en),
  ].filter(Boolean).length;
  const current = Number(row.price) || 0;
  const original = Number(row.original_price) || 0;
  const stock = Number(row.stock_quantity) || 0;
  const discountValid = original <= 0 || original > current;
  const score = current * Math.max(stock, 1);
  return {
    id: row.id,
    sku: row.mofu_sku,
    name: row.name_zh || row.name_en,
    price: current,
    originalPrice: original || null,
    stock,
    priorityScore: Math.round(score * 100) / 100,
    descriptionLengthZh: zh.length,
    descriptionLengthEn: en.length,
    sections,
    missingSections: Object.entries(sections).filter(([, present]) => !present).map(([name]) => name),
    medicalClaimFlags,
    discountValid,
    needsHumanReview: medicalClaimFlags > 0 || !discountValid || !sections.nutrition,
  };
}).sort((a, b) => b.priorityScore - a.priorityScore);

const report = {
  generatedAt: new Date().toISOString(),
  totalPublishedProducts: rows.length,
  top20: rows.slice(0, 20),
  summary: {
    needsHumanReview: rows.filter((row) => row.needsHumanReview).length,
    missingNutrition: rows.filter((row) => !row.sections.nutrition).length,
    missingFaq: rows.filter((row) => !row.sections.faq).length,
    invalidDiscountData: rows.filter((row) => !row.discountValid).length,
    flaggedMedicalClaims: rows.filter((row) => row.medicalClaimFlags > 0).length,
  },
  all: rows,
};

await writeFile("seo-content-audit.json", JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify({ ...report.summary, top20: report.top20.map(({ sku, name, priorityScore, needsHumanReview }) => ({ sku, name, priorityScore, needsHumanReview })) }, null, 2));
console.log("Wrote seo-content-audit.json");

// Keep this script audit-only. Content and prices must be reviewed before any database write.
// The generated top20 list is the input for a later, approval-gated copywriting pass.
