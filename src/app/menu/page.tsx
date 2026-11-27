import type { Metadata } from "next";
import MenuCatalogClient from "./MenuCatalogClient";
import { INGREDIENT_FILTERS, parseIngredientSelection } from "@/components/menu/IngredientFilterPanel";

const CATEGORY_LABELS: Record<string, string> = {
  cats: "貓咪商品", dogs: "狗狗商品", "small-pets": "小寵物用品", snacks: "寵物零食",
  toys: "寵物玩具", health: "寵物營養保健", cleaning: "寵物清潔用品", deals: "寵物優惠",
  bestsellers: "人氣寵物商品", treats: "寵物零食",
};

type MenuPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: MenuPageProps): Promise<Metadata> {
  const params = await searchParams;
  const single = (key: string) => {
    const value = params[key];
    return typeof value === "string" ? value : "";
  };
  const category = single("category").toLowerCase();
  const audience = single("audience").toLowerCase();
  const ingredientKeys = parseIngredientSelection(single("ingredient"));
  const ingredientLabels = ingredientKeys
    .map((key) => INGREDIENT_FILTERS.find((item) => item.key === key)?.zh)
    .filter((label): label is string => Boolean(label));

  const labels = [
    CATEGORY_LABELS[category],
    audience === "dog" ? "狗狗適用" : audience === "cat" ? "貓咪適用" : "",
    ...ingredientLabels,
  ].filter(Boolean);
  const uniqueLabels = [...new Set(labels)];
  const title = uniqueLabels.length
    ? `${uniqueLabels.join("・")}｜日本直送天然寵物食品及用品`
    : "日本直送天然寵物食品、零食及用品｜毛毛港 Mofu Haven HK";
  const description = uniqueLabels.length
    ? `探索毛毛港 ${uniqueLabels.join("、")}精選，包括日本寵物零食、貓狗天然食品及日常用品，為香港毛孩挑選安心好物。`
    : "瀏覽毛毛港 Mofu Haven HK 日本直送寵物目錄，精選日本寵物零食、貓狗天然食品及日常用品。";

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: "/menu" },
  };
}

export default function MenuPage() {
  return <MenuCatalogClient />;
}
