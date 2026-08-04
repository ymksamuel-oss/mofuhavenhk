import { NextResponse } from "next/server";

// 貓咪品種完整資料庫
const catDatabase = {
  categories: [
    {
      category_id: "longhair",
      category_name: "長毛 / 中長毛貓 (Longhair & Semi-Longhair)",
      breeds: [
        {
          id: "ragdoll",
          breed_code: "ragd",
          name_cn: "布偶貓",
          name_en: "Ragdoll",
          origin: "美國加州",
          lifespan: "12 - 15 歲（晚熟 3-4 年）",
          weight: "公 6.0-9.0 kg / 母 4.5-7.0 kg",
          body_features: {
            eyes: "Blue（必為藍眼睛，大而橢圓）",
            body_type: "Large（大型貓，骨架粗壯、肌肉發達）",
            maturity: "3-4 年（晚熟型）",
            coat: "Medium-long（中長毛）/ Silky（絲滑）/ Sparse（底毛稀疏，不易打結）",
          },
          patterns: [
            {
              pattern_name: "雙色 (Bicolor)",
              description:
                "臉部有對稱倒V字白斑，下巴、胸腹與四肢為白色，背部有鞍形顏色塊。",
              image_url:
                "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80",
            },
            {
              pattern_name: "手套色 (Mitted)",
              description:
                "前肢白色短手套，後肢白色高筒靴，下巴至腹部有連貫白色帶。",
              image_url:
                "https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?auto=format&fit=crop&w=800&q=80",
            },
            {
              pattern_name: "重點色 (Colorpoint)",
              description:
                "面部、耳朵、四肢與尾巴為深色重點色，軀幹為淺色，無白色斑塊。",
              image_url:
                "https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&w=800&q=80",
            },
            {
              pattern_name: "梵色 (Van)",
              description: "只有頭頂/耳朵與尾巴有顏色，全身絕大部分為雪白色。",
              image_url:
                "https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=800&q=80",
            },
          ],
          common_colors: [
            "海豹色 (Seal)",
            "藍色 (Blue)",
            "巧克力色 (Chocolate)",
            "丁香色 (Lilac)",
            "山貓紋 (Lynx Tabby)",
          ],
          temperament: ["溫和極黏人", "安靜包容", "隨意抱起放鬆", "高適應力"],
          care_points: [
            "玻璃胃需漸進換糧",
            "長毛臀部定期修剪",
            "預防心肌病(HCM)與多囊腎(PKD)",
          ],
        },
        {
          id: "maine_coon",
          breed_code: "mcoo",
          name_cn: "緬因貓",
          name_en: "Maine Coon",
          origin: "美國緬因州",
          lifespan: "12 - 15 歲",
          weight: "公 6.0-11.0 kg / 母 4.5-6.8 kg",
          body_features: {
            eyes: "Green / Gold / Copper（大而微斜）",
            body_type: "Extra Large（巨型長軀幹貓）",
            maturity: "3-5 年（極晚熟）",
            coat: "Long（長毛）/ Water-repellent（防水雙層毛）",
          },
          patterns: [
            {
              pattern_name: "虎斑色 (Classic Tabby)",
              description:
                "經典螺旋虎斑，帶有標誌性的『M』字額頭斑紋與野生感耳端簇毛。",
              image_url:
                "https://images.unsplash.com/photo-1586289883499-f11d28aaf52f?auto=format&fit=crop&w=800&q=80",
            },
          ],
          common_colors: ["棕色虎斑", "銀色虎斑", "純黑色"],
          temperament: ["溫和巨人", "聰明好動", "喜歡玩水"],
          care_points: ["需要充足活動空間", "每天梳理厚重底毛"],
        },
      ],
    },
    {
      category_id: "shorthair",
      category_name: "短毛貓 (Shorthair)",
      breeds: [
        {
          id: "british_shorthair",
          breed_code: "bslo",
          name_cn: "英國短毛貓",
          name_en: "British Shorthair",
          origin: "英國",
          lifespan: "12 - 17 歲",
          weight: "公 5.0-8.0 kg / 母 3.5-5.5 kg",
          body_features: {
            eyes: "Copper / Orange / Green（大而圓）",
            body_type: "Medium to Large（矮胖圓潤型）",
            maturity: "3 年",
            coat: "Short / Very Dense（短而極密）",
          },
          patterns: [
            {
              pattern_name: "純色 (Solid Blue)",
              description: "經典藍貓，全身毛色均勻，質感厚實。",
              image_url:
                "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=800&q=80",
            },
          ],
          common_colors: ["藍色", "藍白", "金漸層", "銀漸層"],
          temperament: ["紳士安靜", "耐孤獨感", "情緒穩定"],
          care_points: ["極易發胖需要控制飲食", "定期清理毛球"],
        },
        {
          id: "russian_blue",
          breed_code: "rblu",
          name_cn: "俄羅斯藍貓",
          name_en: "Russian Blue",
          origin: "俄羅斯阿爾漢格爾斯克",
          lifespan: "15 - 20 歲",
          weight: "公 3.5-5.5 kg / 母 2.5-4.5 kg",
          body_features: {
            eyes: "Vivid Emerald Green（鮮艷翡翠綠）",
            body_type: "Foreign Type（修長優雅肌肉型）",
            maturity: "1-2 年",
            coat: "Short Double Coat（銀光藍灰色雙層短毛）",
          },
          patterns: [
            {
              pattern_name: "銀光藍灰純色 (Silver-tipped Blue)",
              description:
                "獨一無二銀藍色雙層短毛，毛尖帶銀光，配搭翡翠綠眼睛。",
              image_url:
                "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=800&q=80",
            },
          ],
          common_colors: ["銀藍灰色"],
          temperament: ["內向敏感", "聰明忠誠", "極安靜"],
          care_points: ["需要安靜生活環境", "每週梳毛一次即可"],
        },
      ],
    },
    {
      category_id: "special",
      category_name: "特殊 / 無毛 / 捲毛貓種 (Special Breeds)",
      breeds: [
        {
          id: "sphynx",
          breed_code: "sphy",
          name_cn: "加拿大無毛貓",
          name_en: "Sphynx",
          origin: "加拿大",
          lifespan: "12 - 15 歲",
          weight: "公 3.5-5.0 kg / 母 2.5-4.0 kg",
          body_features: {
            eyes: "Lemon Shape（檸檬形大眼）",
            body_type: "Muscular（肌肉發達，肚子圓潤）",
            maturity: "1-2 年",
            coat: "Hairless / Fine Peach Fuzz（水蜜桃胎毛）",
          },
          patterns: [
            {
              pattern_name: "皮膚斑紋 (Skin Pigmentation)",
              description: "皮膚呈現獨特花色色素斑點，觸感如溫暖桃皮。",
              image_url:
                "https://images.unsplash.com/photo-1520315342629-6ea920342047?auto=format&fit=crop&w=800&q=80",
            },
          ],
          common_colors: ["粉紅皮膚", "雙色斑紋"],
          temperament: ["熱情親人", "極度怕冷"],
          care_points: ["定期擦拭油脂與洗澡", "冬天穿衣保暖"],
        },
      ],
    },
  ],
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const breedId = searchParams.get("breed");
  const categoryId = searchParams.get("category");

  // 1. 如果指定了特定品種 (例如 ?breed=ragdoll)
  if (breedId) {
    for (const category of catDatabase.categories) {
      const foundBreed = category.breeds.find(
        (b) =>
          b.id === breedId.toLowerCase() ||
          b.breed_code === breedId.toLowerCase()
      );
      if (foundBreed) {
        return NextResponse.json({ status: 200, data: foundBreed });
      }
    }
    return NextResponse.json(
      { status: 404, message: "Breed not found" },
      { status: 404 }
    );
  }

  // 2. 如果指定了分類 (例如 ?category=longhair)
  if (categoryId) {
    const filteredCategories = catDatabase.categories.filter(
      (c) => c.category_id === categoryId.toLowerCase()
    );
    return NextResponse.json({ status: 200, data: filteredCategories });
  }

  // 3. 預設返回全部數據
  return NextResponse.json({ status: 200, data: catDatabase });
}
