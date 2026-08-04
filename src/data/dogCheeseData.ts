/**
 * WT Japan 狗芝士 — curated for Mofu Haven.
 * Reuses WT collection「狗芝士」.
 * Source: https://www.wt-japan.com/collections/狗芝士
 * Storefront: /categories/dogs/dog-cheese
 */

export const DOG_CHEESE_CATEGORY = "狗狗商品" as const;
export const DOG_CHEESE_CATEGORY_SLUG = "dogs" as const;

export type WtJapanDogCheeseProduct = {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  sourceImageUrl: string;
  description: string;
  vendor: string;
  category: typeof DOG_CHEESE_CATEGORY;
  categorySlug: typeof DOG_CHEESE_CATEGORY_SLUG;
  subcategory: "狗芝士";
  tags: string[];
  handle: string;
  productType: string;
  sourceUrl: string;
};

export const WT_JAPAN_DOG_CHEESE_PRODUCTS: WtJapanDogCheeseProduct[] = [
  {
    id: "wt-dog-cheese-1",
    title: "Sunrise 贅沢肉條 - 黑和牛肉+北海道芝士 140g x3",
    price: 88.0,
    imageUrl: "/images/products/wt-dog-cheese-1.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/4DFE1EDC-DCB9-460B-85F6-9993B3D22B98.jpg?v=1589081279",
    description:
      "140g 一袋共3袋 做用日本黑和毛牛肉配北海道芝士 7個月後起食用 原産地 日本",
    vendor: "WT",
    category: "狗狗商品",
    categorySlug: "dogs",
    subcategory: "狗芝士",
    tags: ["北海道芝士", "狗狗小食", "狗芝士", "肉條", "黑和毛牛", "狗用"],
    handle: "sunrise-贅沢肉條-黑和牛肉-北海道芝士-140g-x3",
    productType: "狗狗小食",
    sourceUrl: "https://www.wt-japan.com/products/sunrise-%E8%B4%85%E6%B2%A2%E8%82%89%E6%A2%9D-%E9%BB%91%E5%92%8C%E7%89%9B%E8%82%89-%E5%8C%97%E6%B5%B7%E9%81%93%E8%8A%9D%E5%A3%AB-140g-x3",
  },
  {
    id: "wt-dog-cheese-2",
    title: "Sunrise 芝士雞卷10條 x6",
    price: 155.0,
    imageUrl: "/images/products/wt-dog-cheese-2.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/9ED05881-4C37-4612-BDB4-CF7179669DAD.jpg?v=1596990885",
    description:
      "日本寵物小食「Sunrise 芝士雞卷10條 x6」。適合狗狗日常獎勵或訓練使用。",
    vendor: "WT",
    category: "狗狗商品",
    categorySlug: "dogs",
    subcategory: "狗芝士",
    tags: ["狗狗小食", "狗芝士", "肉條", "雞肉", "狗用"],
    handle: "sunrise-芝士雞卷10條-x6",
    productType: "狗狗小食",
    sourceUrl: "https://www.wt-japan.com/products/sunrise-%E8%8A%9D%E5%A3%AB%E9%9B%9E%E5%8D%B710%E6%A2%9D-x6",
  },
  {
    id: "wt-dog-cheese-3",
    title: "狗狗零食 - Sunrise 方塊芝士 110g x 6袋",
    price: 180.0,
    imageUrl: "/images/products/wt-dog-cheese-3.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/D14650A5-73DE-4E30-A8E4-8F281ABB3B1F.jpg?v=1587752512",
    description:
      "使用北海道產芝士 低塩份、狗狗的健康小食 110g 一袋共6袋",
    vendor: "WT",
    category: "狗狗商品",
    categorySlug: "dogs",
    subcategory: "狗芝士",
    tags: ["狗狗小食", "狗芝士", "狗用"],
    handle: "狗狗零食-sunrise-方塊芝士-110g-x-6袋",
    productType: "狗狗小食",
    sourceUrl: "https://www.wt-japan.com/products/%E7%8B%97%E7%8B%97%E9%9B%B6%E9%A3%9F-sunrise-%E6%96%B9%E5%A1%8A%E8%8A%9D%E5%A3%AB-110g-x-6%E8%A2%8B",
  },
  {
    id: "wt-dog-cheese-4",
    title: "Petio 狗狗小食 - 乳酸菌雞味芝士條 170g x6",
    price: 227.0,
    imageUrl: "/images/products/wt-dog-cheese-4.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/4903588114816.jpg?v=1604835736",
    description:
      "日本寵物小食「Petio 狗狗小食 - 乳酸菌雞味芝士條 170g x6」。適合狗狗日常獎勵或訓練使用。",
    vendor: "Petio",
    category: "狗狗商品",
    categorySlug: "dogs",
    subcategory: "狗芝士",
    tags: ["乳酸菌", "狗狗小食", "狗芝士", "雞肉", "狗用"],
    handle: "petio-狗狗小食-乳酸菌雞味芝士條-170g-x6",
    productType: "狗狗小食",
    sourceUrl: "https://www.wt-japan.com/products/petio-%E7%8B%97%E7%8B%97%E5%B0%8F%E9%A3%9F-%E4%B9%B3%E9%85%B8%E8%8F%8C%E9%9B%9E%E5%91%B3%E8%8A%9D%E5%A3%AB%E6%A2%9D-170g-x6",
  },
  {
    id: "wt-dog-cheese-5",
    title: "Doggyman 狗狗零食 - 雞肉味芝士粒 50g x6袋",
    price: 132.0,
    imageUrl: "/images/products/wt-dog-cheese-5.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/9E92E897-C142-4867-A66D-B63AB611EBB3.jpg?v=1587751832",
    description:
      "日本寵物小食「Doggyman 狗狗零食 - 雞肉味芝士粒 50g x6袋」。適合狗狗日常獎勵或訓練使用。",
    vendor: "WT",
    category: "狗狗商品",
    categorySlug: "dogs",
    subcategory: "狗芝士",
    tags: ["狗狗小食", "狗芝士", "芝士", "雞肉", "狗用"],
    handle: "doggyman-狗狗零食-雞肉味芝士粒-50g-x6袋",
    productType: "狗狗小食",
    sourceUrl: "https://www.wt-japan.com/products/doggyman-%E7%8B%97%E7%8B%97%E9%9B%B6%E9%A3%9F-%E9%9B%9E%E8%82%89%E5%91%B3%E8%8A%9D%E5%A3%AB%E7%B2%92-50g-x6%E8%A2%8B",
  },
  {
    id: "wt-dog-cheese-6",
    title: "Petzroute 狗狗芝士 - 雞肉味 x6",
    price: 216.0,
    imageUrl: "/images/products/wt-dog-cheese-6.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/4984937687618.jpg?v=1637067471",
    description:
      "日本寵物小食「Petzroute 狗狗芝士 - 雞肉味 x6」。適合狗狗日常獎勵或訓練使用。",
    vendor: "WT",
    category: "狗狗商品",
    categorySlug: "dogs",
    subcategory: "狗芝士",
    tags: ["狗狗小食", "狗芝士", "芝士", "狗用"],
    handle: "petzroute-狗狗芝士-胵肉味-x6",
    productType: "狗狗小食",
    sourceUrl: "https://www.wt-japan.com/products/petzroute-%E7%8B%97%E7%8B%97%E8%8A%9D%E5%A3%AB-%E8%83%B5%E8%82%89%E5%91%B3-x6",
  },
  {
    id: "wt-dog-cheese-7",
    title: "Sunrise 狗狗零食 - 日本高鈣雞胸芝士肉條 170g x6",
    price: 221.0,
    imageUrl: "/images/products/wt-dog-cheese-7.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/4973321940880.jpg?v=1625731963",
    description:
      "日本寵物小食「Sunrise 狗狗零食 - 日本高鈣雞胸芝士肉條 170g x6」。適合狗狗日常獎勵或訓練使用。",
    vendor: "WT",
    category: "狗狗商品",
    categorySlug: "dogs",
    subcategory: "狗芝士",
    tags: ["狗狗小食", "狗芝士", "肉條", "狗用"],
    handle: "sunrise-狗狗零食-日本高鈣雞胸芝士肉條-170g-x6",
    productType: "狗狗小食",
    sourceUrl: "https://www.wt-japan.com/products/sunrise-%E7%8B%97%E7%8B%97%E9%9B%B6%E9%A3%9F-%E6%97%A5%E6%9C%AC%E9%AB%98%E9%88%A3%E9%9B%9E%E8%83%B8%E8%8A%9D%E5%A3%AB%E8%82%89%E6%A2%9D-170g-x6",
  },
  {
    id: "wt-dog-cheese-8",
    title: "FORCANS 咬咬乳酪條 - 香蕉味 14條 x6",
    price: 276.0,
    imageUrl: "/images/products/wt-dog-cheese-8.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/8809058115443.jpg?v=1623944421",
    description:
      "韓國製 有效去除牙石口臭, 彈力有口感 賞味期限24個月",
    vendor: "WT",
    category: "狗狗商品",
    categorySlug: "dogs",
    subcategory: "狗芝士",
    tags: ["乳酸菌", "狗狗小食", "狗芝士", "狗用"],
    handle: "forcans-咬咬乳酪條-香蕉味-14條-x6",
    productType: "狗狗小食",
    sourceUrl: "https://www.wt-japan.com/products/forcans-%E5%92%AC%E5%92%AC%E4%B9%B3%E9%85%AA%E6%A2%9D-%E9%A6%99%E8%95%89%E5%91%B3-14%E6%A2%9D-x6",
  },
  {
    id: "wt-dog-cheese-9",
    title: "FORCANS 咬咬乳酪條 - 士多啤梨味 14條 x6",
    price: 276.0,
    imageUrl: "/images/products/wt-dog-cheese-9.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/8809058115429.jpg?v=1623944262",
    description:
      "韓國製 有效去除牙石口臭, 彈力有口感 賞味期限24個月",
    vendor: "WT",
    category: "狗狗商品",
    categorySlug: "dogs",
    subcategory: "狗芝士",
    tags: ["乳酸菌", "狗狗小食", "狗芝士", "狗用"],
    handle: "forcans-咬咬乳酪條-士多啤梨味-14條-x6",
    productType: "狗狗小食",
    sourceUrl: "https://www.wt-japan.com/products/forcans-%E5%92%AC%E5%92%AC%E4%B9%B3%E9%85%AA%E6%A2%9D-%E5%A3%AB%E5%A4%9A%E5%95%A4%E6%A2%A8%E5%91%B3-14%E6%A2%9D-x6",
  },
  {
    id: "wt-dog-cheese-10",
    title: "FORCANS 咬咬乳酪條 - 青蘋果味 14條 x6",
    price: 276.0,
    imageUrl: "/images/products/wt-dog-cheese-10.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/8809058115436.jpg?v=1623944323",
    description:
      "韓國製 有效去除牙石口臭, 彈力有口感 賞味期限24個月",
    vendor: "WT",
    category: "狗狗商品",
    categorySlug: "dogs",
    subcategory: "狗芝士",
    tags: ["乳酸菌", "狗狗小食", "狗芝士", "狗用"],
    handle: "forcans-咬咬乳酪條-青蘋果味-14條-x6",
    productType: "狗狗小食",
    sourceUrl: "https://www.wt-japan.com/products/forcans-%E5%92%AC%E5%92%AC%E4%B9%B3%E9%85%AA%E6%A2%9D-%E9%9D%92%E8%98%8B%E6%9E%9C%E5%91%B3-14%E6%A2%9D-x6",
  },
  {
    id: "wt-dog-cheese-11",
    title: "Petzroute 狗狗小食 - 蒙古芝士骨 (S) x 6",
    price: 345.0,
    imageUrl: "/images/products/wt-dog-cheese-11.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/A4BAF1C1-52D6-40A1-88EB-4916F4FBAD9B.jpg?v=1615052323",
    description:
      "賞味期限19個月 最後咬淨下的芝士塊可狗熱變軟後當小食",
    vendor: "WT",
    category: "狗狗商品",
    categorySlug: "dogs",
    subcategory: "狗芝士",
    tags: ["狗狗小食", "狗芝士", "肉條", "狗用"],
    handle: "petzroute-狗狗小食-蒙古芝士骨-s-x-6",
    productType: "狗狗小食",
    sourceUrl: "https://www.wt-japan.com/products/petzroute-%E7%8B%97%E7%8B%97%E5%B0%8F%E9%A3%9F-%E8%92%99%E5%8F%A4%E8%8A%9D%E5%A3%AB%E9%AA%A8-s-x-6",
  },
  {
    id: "wt-dog-cheese-12",
    title: "Petzroute 狗狗零食 - 蒙古濃芝士骨 (M) 2條 x 3",
    price: 469.0,
    imageUrl: "/images/products/wt-dog-cheese-12.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/4984937682903.jpg?v=1628052020",
    description:
      "在蒙古高原手工製作芝士骨，採用傳統方法製作。使用慢乾法，質地結實，可以長時間咀嚼。低鹽、低乳糖、對身體溫和、不含防腐劑、著色劑、著色劑、抗氧化劑等添加劑的天然乾芝士骨。賞味期限19個月",
    vendor: "WT",
    category: "狗狗商品",
    categorySlug: "dogs",
    subcategory: "狗芝士",
    tags: ["狗狗小食", "狗芝士", "狗用"],
    handle: "petzroute-狗狗零食-蒙古濃芝士骨-m-2條-x-3",
    productType: "狗狗小食",
    sourceUrl: "https://www.wt-japan.com/products/petzroute-%E7%8B%97%E7%8B%97%E9%9B%B6%E9%A3%9F-%E8%92%99%E5%8F%A4%E6%BF%83%E8%8A%9D%E5%A3%AB%E9%AA%A8-m-2%E6%A2%9D-x-3",
  },
  {
    id: "wt-dog-cheese-13",
    title: "Petzroute 狗狗零食 - 蒙古濃芝士骨 (S) 3條 x 3",
    price: 423.0,
    imageUrl: "/images/products/wt-dog-cheese-13.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/4984937682897.jpg?v=1628051889",
    description:
      "在蒙古高原手工製作芝士骨，採用傳統方法製作。使用慢乾法，質地結實，可以長時間咀嚼。低鹽、低乳糖、對身體溫和、不含防腐劑、著色劑、著色劑、抗氧化劑等添加劑的天然乾芝士骨。賞味期限19個月",
    vendor: "WT",
    category: "狗狗商品",
    categorySlug: "dogs",
    subcategory: "狗芝士",
    tags: ["狗狗小食", "狗芝士", "狗用"],
    handle: "petzroute-狗狗零食-蒙古濃芝士骨-s-3條-x-3",
    productType: "狗狗小食",
    sourceUrl: "https://www.wt-japan.com/products/petzroute-%E7%8B%97%E7%8B%97%E9%9B%B6%E9%A3%9F-%E8%92%99%E5%8F%A4%E6%BF%83%E8%8A%9D%E5%A3%AB%E9%AA%A8-s-3%E6%A2%9D-x-3",
  },
  {
    id: "wt-dog-cheese-14",
    title: "Petzroute 狗狗小食 - 蒙古芝士骨 (L) x 6",
    price: 1068.0,
    imageUrl: "/images/products/wt-dog-cheese-14.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/91B7C0D6-D32C-4F1F-8CF9-26604256209F.jpg?v=1615052139",
    description:
      "賞味期限19個月 (H)320×(W)130×(D)40mm 160g 最後咬淨下的芝士塊可狗熱變軟後當小食",
    vendor: "WT",
    category: "狗狗商品",
    categorySlug: "dogs",
    subcategory: "狗芝士",
    tags: ["狗狗小食", "狗芝士", "肉條", "狗用"],
    handle: "petzroute-狗狗小食-蒙古芝士骨-l-x-6",
    productType: "狗狗小食",
    sourceUrl: "https://www.wt-japan.com/products/petzroute-%E7%8B%97%E7%8B%97%E5%B0%8F%E9%A3%9F-%E8%92%99%E5%8F%A4%E8%8A%9D%E5%A3%AB%E9%AA%A8-l-x-6",
  },
  {
    id: "wt-dog-cheese-15",
    title: "狗狗小食 - doggyman 狗狗乳酸菌芝士牛肉條 70g x 6",
    price: 168.0,
    imageUrl: "/images/products/wt-dog-cheese-15.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/4976555810530.jpg?v=1599015169",
    description:
      "日本寵物小食「狗狗小食 - doggyman 狗狗乳酸菌芝士牛肉條 70g x 6」。適合狗狗日常獎勵或訓練使用。",
    vendor: "WT",
    category: "狗狗商品",
    categorySlug: "dogs",
    subcategory: "狗芝士",
    tags: ["牛肉", "狗狗小食", "狗芝士", "肉條", "狗用"],
    handle: "狗狗小食-doggyman-狗狗乳酸菌芝士牛肉條-70g-x-6",
    productType: "狗狗小食",
    sourceUrl: "https://www.wt-japan.com/products/%E7%8B%97%E7%8B%97%E5%B0%8F%E9%A3%9F-doggyman-%E7%8B%97%E7%8B%97%E4%B9%B3%E9%85%B8%E8%8F%8C%E8%8A%9D%E5%A3%AB%E7%89%9B%E8%82%89%E6%A2%9D-70g-x-6",
  },
];
