import type { Product } from "@/lib/products";

/**
 * Recent product records committed to Git alongside their source manifests.
 * These remain browsable when the live Stripe catalog cannot be read.
 */
export const RECENT_FALLBACK_PRODUCTS: Product[] = [
  {
    id: "ceramic-pet-bowl-illustration-series-20260830",
    priceId: "price_1U9u3oRyM6dRKLtZ8OADS69r",
    categorySlug: "lifestyle",
    subcategory: "食具及餵食",
    image: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663882010321/mOSJOXIskfjwFxxj.png",
    images: [
      "https://files.manuscdn.com/user_upload_by_module/session_file/310519663882010321/mOSJOXIskfjwFxxj.png",
      "https://files.manuscdn.com/user_upload_by_module/session_file/310519663882010321/DUEywcisTYtzYDVy.png",
      "https://files.manuscdn.com/user_upload_by_module/session_file/310519663882010321/sbWSNilbcnJFnQkO.png",
    ],
    name: { zh: "趣味插畫陶瓷寵物食碗系列", en: "Illustrated Ceramic Pet Bowl Series" },
    price: 69.9,
    variants: [
      { key: "illustration-mice-music", priceId: "price_1U9u3oRyM6dRKLtZ8OADS69r", price: 69.9, label: { zh: "老鼠音符圖案", en: "Mice and music pattern" }, image: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663882010321/mOSJOXIskfjwFxxj.png" },
      { key: "illustration-bears-cookies", priceId: "price_1U9u42RyM6dRKLtZ2xmrOxwf", price: 69.9, label: { zh: "熊仔曲奇圖案", en: "Bears and cookies pattern" }, image: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663882010321/DUEywcisTYtzYDVy.png" },
      { key: "illustration-rainbow-raincoat", priceId: "price_1U9u4ERyM6dRKLtZIB68KYCR", price: 69.9, label: { zh: "彩虹雨天圖案", en: "Rainbow rainy-day pattern" }, image: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663882010321/sbWSNilbcnJFnQkO.png" },
    ],
    icon: "cat",
    description: { zh: "米白釉面陶瓷寵物食碗，同系列提供三款趣味插畫圖案；請按毛孩需要及實際尺寸選擇。", en: "An ivory glazed ceramic pet bowl series with three playful illustrated patterns; choose according to your pet's needs and the actual product dimensions." },
    specs: [{ zh: "分類：食具及餵食", en: "Collection: Feeding" }, { zh: "三款插畫圖案可選", en: "Three illustrated patterns" }],
    tags: ["cats", "lifestyle", "食具及餵食", "陶瓷", "cat bowl"],
    inStock: true,
    brand: "Mofu Haven",
    vendor: "Mofu Haven",
  },
  {
    id: "warm-flower-pet-bed-green-45cm-20260830",
    priceId: "price_1U9vIGRyM6dRKLtZb0QAYDAm",
    categorySlug: "lifestyle",
    subcategory: "睡窩及家居",
    image: "https://izqhlo06ahamwwho.public.blob.vercel-storage.com/%E8%B2%93%E7%AA%A9/IMG_1465.JPG",
    images: [
      "https://izqhlo06ahamwwho.public.blob.vercel-storage.com/%E8%B2%93%E7%AA%A9/IMG_1465.JPG",
      "https://izqhlo06ahamwwho.public.blob.vercel-storage.com/%E8%B2%93%E7%AA%A9/IMG_1466.JPG",
      "https://izqhlo06ahamwwho.public.blob.vercel-storage.com/%E8%B2%93%E7%AA%A9/IMG_1467.JPG",
      "https://izqhlo06ahamwwho.public.blob.vercel-storage.com/%E8%B2%93%E7%AA%A9/IMG_1468.JPG",
      "https://izqhlo06ahamwwho.public.blob.vercel-storage.com/%E8%B2%93%E7%AA%A9/IMG_1469.JPG",
      "https://izqhlo06ahamwwho.public.blob.vercel-storage.com/%E8%B2%93%E7%AA%A9/IMG_1470.JPG",
    ],
    name: { zh: "保暖花朵寵物窩（綠色 45cm）", en: "Warm Flower Pet Bed (Green 45cm)" },
    price: 56.9,
    icon: "cat",
    description: { zh: "柔軟保暖花朵寵物窩，直徑 45cm，適合 5kg 內毛孩。", en: "A soft warm flower pet bed, 45cm diameter, suitable for pets up to 5kg." },
    specs: [{ zh: "尺寸：直徑 45cm", en: "Size: 45cm diameter" }, { zh: "建議體重：5kg 內", en: "Recommended weight: up to 5kg" }],
    tags: ["cats", "dogs", "lifestyle", "睡窩及家居", "pet bed"],
    inStock: true,
    brand: "Mofu Haven",
    vendor: "Mofu Haven",
  },
];
