export type HomepageHeroConfig = { id: string; title: string; subtitle: string; badge: string; ctaText: string; ctaLink: string; featuredSku: string };
export type HomepagePillConfig = { label: string; link: string };
export type HomepageFeaturedProductConfig = { sku: string; badge: string; highlight: string };
export type HomepageFeaturedSectionConfig = { id: string; title: string; subtitle: string; viewAllLink: string; products: HomepageFeaturedProductConfig[] };

export const HOMEPAGE_HERO_BANNERS: HomepageHeroConfig[] = [
  {
    "id": "banner-natural-meat",
    "title": "日本在地嚴選 100% 天然原肉零食",
    "subtitle": "北海道野生鹿肉・極致低敏純馬肉・航天級凍乾｜挑食怪一口入魂",
    "badge": "日本製造・0防腐劑",
    "ctaText": "探索純肉系列",
    "ctaLink": "/collections/natural-meat-treats",
    "featuredSku": "4976064026545"
  },
  {
    "id": "banner-dental-chews",
    "title": "告別拆家！物理刮除牙結石天花板",
    "subtitle": "天然原隻牛蹄・特長牛大筋・高山犛牛芝士棒｜耐啃數週不崩牙",
    "badge": "長效磨牙・潔齒除垢",
    "ctaText": "搶購潔齒系列",
    "ctaLink": "/collections/dental-chews",
    "featuredSku": "4976064025333"
  },
  {
    "id": "banner-seafood",
    "title": "北海道天然海鮮，為毛孩補充純粹鮮味",
    "subtitle": "嚴選黑鮪魚、三文魚與姬鱈魚，日本低溫慢烘，天然蛋白與 Omega-3 一口滿足。",
    "badge": "日本製造・天然魚介",
    "ctaText": "探索天然海鮮系列",
    "ctaLink": "/collections/seafood",
    "featuredSku": "4976064026576"
  }
];

export const HOMEPAGE_QUICK_PILLS: HomepagePillConfig[] = [
  {
    "label": "🐶 狗狗全系列",
    "link": "/collections/dogs"
  },
  {
    "label": "🐱 貓咪專區",
    "link": "/collections/cats"
  },
  {
    "label": "🦷 潔齒耐咬磨牙",
    "link": "/collections/dental-chews"
  },
  {
    "label": "✨ 挑食拌糧神粉",
    "link": "/collections/meal-toppers"
  },
  {
    "label": "🎁 促銷特惠組合",
    "link": "/collections/value-bundles"
  }
];

export const HOMEPAGE_FEATURED_SECTIONS: HomepageFeaturedSectionConfig[] = [
  {
    "id": "bestsellers",
    "title": "🏆 毛拔麻回購熱銷榜（Best Sellers）",
    "subtitle": "全店轉化率第一、回購率最高的台柱級單品",
    "viewAllLink": "/collections/bestsellers",
    "products": [
      {
        "sku": "4976064025791",
        "badge": "熱銷王",
        "highlight": "-40°C真空凍乾 溫水5秒還原鮮肉"
      },
      {
        "sku": "4976064025661",
        "badge": "耐咬神物",
        "highlight": "喜馬拉雅犛牛芝士 啃咬數週"
      },
      {
        "sku": "4976064026545",
        "badge": "極上野味",
        "highlight": "北海道天然野生蝦夷鹿肉 低脂高鐵"
      },
      {
        "sku": "4976064025623",
        "badge": "低敏首選",
        "highlight": "100%純馬肉能量棒 過敏犬救星"
      },
      {
        "sku": "4976064013897",
        "badge": "貓奴瘋搶",
        "highlight": "黃鰭金槍魚柴魚薄片 入口即溶"
      },
      {
        "sku": "4976064025333",
        "badge": "去牙石王",
        "highlight": "天然原隻牛蹄磨牙骨 防拆家必備"
      }
    ]
  },
  {
    "id": "dental_chews",
    "title": "🦷 物理潔齒・耐咬解悶防拆家專區",
    "subtitle": "深入後臼齒齒縫刮除牙斑，釋放毛孩原始咀嚼天性",
    "viewAllLink": "/collections/dental-chews",
    "products": [
      {
        "sku": "4976064026446",
        "badge": "特長20cm",
        "highlight": "天然牛大筋特長大條 3本入"
      },
      {
        "sku": "4976064022301",
        "badge": "鹿兒島產",
        "highlight": "鹿兒島黑豚原隻大豬耳 5枚入"
      },
      {
        "sku": "4976064026392",
        "badge": "海洋膠原",
        "highlight": "天然鯊魚皮耐咬潔齒皮棒 20g"
      },
      {
        "sku": "4976064025012",
        "badge": "40本大裝",
        "highlight": "天然葉綠素潔齒骨棒 S號特惠裝"
      },
      {
        "sku": "4976064024701",
        "badge": "骨肉相連",
        "highlight": "天然牛肋排骨切段 3大塊入"
      },
      {
        "sku": "4976064025685",
        "badge": "大狗專用",
        "highlight": "高山犛牛芝士棒 M號中大型犬"
      }
    ]
  },
  {
    "id": "picky_eaters",
    "title": "✨ 拯救挑嘴・伴糧拌飯誘食神器",
    "subtitle": "純肉碎粒緊緊包裹乾糧，專治換糧挑嘴與不愛喝水",
    "viewAllLink": "/collections/meal-toppers",
    "products": [
      {
        "sku": "4976064024251",
        "badge": "雪花拌糧",
        "highlight": "純雞里肌雪花肉碎 專利不油膩"
      },
      {
        "sku": "4976064024886",
        "badge": "濃香誘食",
        "highlight": "純雞砂肝香脆肉碎 爆發性肉香"
      },
      {
        "sku": "4976064024893",
        "badge": "深海鮮味",
        "highlight": "天然黑鮪魚肉碎 天然牛磺酸"
      },
      {
        "sku": "4976064025272",
        "badge": "蜜之女王",
        "highlight": "鹿兒島安納芋蜜甜甘藷拌糧粉 80g"
      },
      {
        "sku": "4976064024725",
        "badge": "騙水神物",
        "highlight": "貓用無鹽酥脆小魚乾 護腎高鈣"
      },
      {
        "sku": "4976064024275",
        "badge": "頂級起司",
        "highlight": "天然熟成芝士香濃純粉 撒料50g"
      }
    ]
  },
];
