"use client";

import Image from "next/image";
import Link from "next/link";
import { categoryHref } from "@/lib/categories";
import { useI18n } from "@/lib/i18n/I18nProvider";

type BilingualCopy = { zh: string; en: string };

type Chapter = {
  title: BilingualCopy;
  body: BilingualCopy;
  image: string;
  imageAlt: BilingualCopy;
};

const CHAPTERS: Chapter[] = [
  {
    title: {
      zh: "【迎貓回家】新手安全與低壓環境適應指南",
      en: "Welcoming a Cat: Newbie Safety & Low-Stress Adaptation",
    },
    body: {
      zh: "貓咪是領域性強且對環境高度敏感的動物。初到新家時，先不要一次開放全屋。可為牠準備安靜、光線柔和的獨立房間，放置開門的外出籠、舒適軟窩、分開的食水碗、貓抓柱與貓砂盆。讓新成員按自己的節奏主動探索；可預留約 3 至 7 天作低壓適應期，但每隻貓的步調不同，若仍感到不安，就延長時間再逐步開放其他空間。",
      en: "Cats are territorial and sensitive to change. When welcoming a new cat, avoid opening the entire home at once. Prepare a quiet, softly lit room with an open carrier, a cozy bed, separate food and water bowls, a scratching post, and a litter box. Let your companion explore at their own pace. Allow around 3–7 days for a low-stress transition, while remembering that each cat is different and may need longer before exploring more of the home.",
    },
    image: "/images/about/cat-book-01-welcome.jpg",
    imageAlt: {
      zh: "為新來的貓咪準備安靜、安全的迎接空間",
      en: "A quiet, safe welcome space prepared for a new cat",
    },
  },
  {
    title: {
      zh: "【貓咪美味學】純肉食天性、全營養與補水密碼",
      en: "Feline Nutrition: Obligate Carnivore Needs & Hydration Secrets",
    },
    body: {
      zh: "貓咪是絕對肉食性動物，牛磺酸、花生四烯酸和預成維他命 A 等必需營養素，需由完整均衡的飲食提供。部分貓咪飲水量偏少，可透過主食濕糧、在食物中加入適量水分，或於家中不同位置放置多個乾淨水碗和飲水器，鼓勵牠們補充水分。乾糧本身不等於一定會脫水或致病；若貓咪有泌尿或腎臟問題，請向獸醫查詢合適飲食。",
      en: "Cats are obligate carnivores and need a complete, balanced diet that supplies essential nutrients such as taurine, arachidonic acid, and preformed vitamin A. Some cats drink relatively little, so wet food, adding an appropriate amount of water to food, or offering several clean bowls and fountains around the home can help increase moisture intake. Dry food does not automatically cause dehydration or disease. Ask your veterinarian about diet if your cat has urinary or kidney concerns.",
    },
    image: "/images/about/cat-book-02-nutrition.jpg",
    imageAlt: {
      zh: "貓咪享用均衡餐食並補充水分的插圖",
      en: "An illustration of a cat enjoying a balanced meal and fresh water",
    },
  },
  {
    title: {
      zh: "【日常溫柔照護】減壓梳毛、剪甲技巧與砂盆整潔",
      en: "Gentle Daily Care: Low-Stress Grooming, Claw Trimming & Litter Hygiene",
    },
    body: {
      zh: "梳毛能減少打結，也可以成為建立信任的日常儀式。先讓貓咪聞聞毛刷，再順著毛流輕梳；剪指甲時不要強行按壓，可趁牠放鬆時分幾次進行，每次剪少量並給予獎勵。貓砂盆可按「貓咪數量 + 1」準備，每日至少清理兩次；選用低粉塵、無人工香精的貓砂，並讓照護步調配合貓咪的接受程度。",
      en: "Regular brushing can reduce tangles and become a gentle bonding ritual. Let your cat sniff the brush first, then groom softly in the direction of the coat. Avoid forceful restraint for nail trims; work in short sessions while your cat is relaxed and reward each small step. A useful litter-box guideline is one box per cat, plus one. Scoop at least twice daily and consider low-dust, unscented litter, while adapting care to your cat’s comfort.",
    },
    image: "/images/about/cat-book-03-grooming.jpg",
    imageAlt: {
      zh: "以溫和方式替貓咪梳毛和日常照護",
      en: "Gentle grooming and daily care for a cat",
    },
  },
  {
    title: {
      zh: "【瞭解貓咪心事】解讀肢體語言與垂直環境豐富化",
      en: "Understanding Cat Emotions: Body Language & Environmental Enrichment",
    },
    body: {
      zh: "貓咪的尾巴、耳朵與鬍鬚都能提供情緒線索：尾巴豎起、末端微彎常見於友善、自信的互動；快速甩動尾尖可能代表煩躁，飛機耳則可能表示害怕或警戒，仍要配合全身姿勢與當下情境一起觀察。室內生活的貓咪可使用穩固貓樹、窗邊跳台和隱蔽高處，增加垂直空間與安全感。每日安排逗貓棒等互動遊戲，並按年齡和體力調整時間，豐富牠的日常活動。",
      en: "A cat’s tail, ears, and whiskers offer clues to how they feel. An upright tail with a soft hook often appears in friendly, confident greetings; a rapidly twitching tail tip may signal irritation, while flattened ears can indicate fear or alertness. Read these signs alongside the whole posture and situation. Sturdy cat trees, window perches, and safe high places add useful vertical space indoors. Interactive wand play can enrich daily life; adjust the session to your cat’s age and energy.",
    },
    image: "/images/about/cat-book-04-environment.jpg",
    imageAlt: {
      zh: "貓咪在高處觀察環境並自在休息",
      en: "A cat relaxing in an elevated space and observing its surroundings",
    },
  },
  {
    title: {
      zh: "【健康守護線】隱形病號識別與全生命週期防護",
      en: "Health Protection: Detecting Subtle Illness Signs & Lifetime Wellness",
    },
    body: {
      zh: "貓咪可能會隱藏疼痛，因此生病初期的變化有時不明顯。請留意食量或飲水量改變、如廁次數與排便型態變化、突然躲藏或過度舔毛造成禿斑。定期記錄體重，並按獸醫建議安排寄生蟲預防、疫苗接種和健康檢查。中老年貓通常需要更密切追蹤；是否驗血及檢查頻率，應由獸醫按年齡、病史和個別風險建議。",
      en: "Cats may hide signs of pain, so early changes can be subtle. Watch for changes in appetite or water intake, litter-box habits or stool, sudden hiding, or over-grooming that leaves bald patches. Keep regular weight records and follow your veterinarian’s advice on parasite prevention, vaccination, and wellness visits. Senior cats may benefit from closer monitoring; your veterinarian can recommend whether blood tests are appropriate and how often based on age, history, and individual risk.",
    },
    image: "/images/about/cat-book-05-health.jpg",
    imageAlt: {
      zh: "以日常觀察和定期檢查守護貓咪健康",
      en: "Supporting a cat’s health through daily observation and checkups",
    },
  },
];

/** Japanese-style picture-book guide for new cat parents. */
export function AboutCatBook() {
  const { t, locale } = useI18n();
  const isEn = locale === "en";
  const copy = (item: BilingualCopy) => (isEn ? item.en : item.zh);

  return (
    <div className="min-h-[70vh] bg-[#fdfbf7] font-sans text-[#2B2623]">
      <div className="mx-auto max-w-5xl bg-[#fdfbf7] px-4 py-10 sm:px-6 sm:py-14">
        <p className="mb-6">
          <Link
            href="/menu"
            className="text-sm font-medium text-[#2B2623]/70 transition hover:text-[#2B2623]"
          >
            ← {t("aboutCatBackToCatalog")}
          </Link>
        </p>

        <header className="mb-12 max-w-2xl animate-[fadeUp_0.55s_ease_both] sm:mb-16">
          <p className="text-sm font-medium tracking-[0.08em] text-[#2B2623]/65">
            {t("aboutCatEyebrow")}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            {t("aboutCatTitle")}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-[#2B2623]/80 sm:text-lg">
            {t("aboutCatSubtitle")}
          </p>
        </header>

        <div className="space-y-8 sm:space-y-10">
          {CHAPTERS.map((chapter, index) => {
            const imageLeft = index % 2 === 0;
            return (
              <section
                key={chapter.image}
                className={`grid items-center gap-6 rounded-3xl border border-neutral-200/80 bg-[#fdfbf7] p-4 shadow-[0_16px_36px_-28px_rgba(74,59,50,0.45)] sm:gap-8 sm:p-6 md:grid-cols-2 md:p-7 ${
                  imageLeft ? "" : "md:[&>*:first-child]:order-2"
                }`}
                style={{
                  animation: "fadeUp 0.6s ease both",
                  animationDelay: `${0.08 * (index + 1)}s`,
                }}
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#f4efe7]">
                  <Image
                    src={chapter.image}
                    alt={copy(chapter.imageAlt)}
                    fill
                    sizes="(min-width: 768px) 40vw, 90vw"
                    className="object-cover"
                  />
                </div>
                <div className="space-y-3 py-2 md:px-2">
                  <p className="text-xs font-semibold tracking-[0.14em] text-[#9A7757]">
                    {isEn ? `CHAPTER ${String(index + 1).padStart(2, "0")}` : `繪本章節 ${String(index + 1).padStart(2, "0")}`}
                  </p>
                  <h2 className="text-2xl font-bold leading-snug tracking-tight text-[#3E2B20] sm:text-[1.7rem]">
                    {copy(chapter.title)}
                  </h2>
                  <p className="text-[0.98rem] leading-8 text-[#51473D] sm:text-base">
                    {copy(chapter.body)}
                  </p>
                </div>
              </section>
            );
          })}
        </div>

        <div
          className="mt-14 flex justify-center sm:mt-20"
          style={{ animation: "fadeUp 0.6s ease both", animationDelay: "0.55s" }}
        >
          <Link
            href={categoryHref("cats")}
            className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[#2B2623]/15 bg-[#2B2623] px-6 py-3 text-sm font-semibold text-[#FBF9F6] shadow-[0_14px_28px_-16px_rgba(74,59,50,0.55)] transition hover:-translate-y-0.5 hover:bg-[#3a2e27] hover:shadow-[0_18px_32px_-14px_rgba(74,59,50,0.6)] active:translate-y-0"
          >
            {t("aboutCatShopCta")}
          </Link>
        </div>
      </div>
    </div>
  );
}
