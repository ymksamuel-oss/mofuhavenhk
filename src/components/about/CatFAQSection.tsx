"use client";

import Image from "next/image";
import { useI18n } from "@/lib/i18n/I18nProvider";

type Bilingual = { zh: string; en: string };
type FAQ = { question: Bilingual; answer: Bilingual; image: string; alt: Bilingual };

const FAQS: FAQ[] = [
  {
    question: { zh: "貓咪發出「呼嚕聲（Purring）」就一定代表好開心？", en: "Does purring always mean a cat is happy?" },
    answer: {
      zh: "不一定。貓咪放鬆或滿足時常會呼嚕，但在疼痛、不適或緊張時也可能呼嚕。單憑呼嚕無法判斷原因，請一併留意躲藏、食慾或活動改變、跛行、抗拒觸碰或姿勢異常。若呼嚕和平日明顯不同，或伴隨其他不適，請聯絡獸醫；如有呼吸困難、倒下或嚴重受傷等急症表現，應立即求醫。",
      en: "Not necessarily. Cats often purr when relaxed or content, but they may also purr when in pain, uncomfortable, or stressed. Purring alone cannot tell you why; also watch for hiding, changes in appetite or activity, limping, resisting touch, or unusual posture. Contact a veterinarian if the purring is unusual or comes with other signs of discomfort. Difficulty breathing, collapse, or serious injury needs urgent veterinary care.",
    },
    image: "/images/guide/cat-faq/cat-faq-01-purring.jpg",
    alt: { zh: "貓咪安靜呼嚕的手繪插圖", en: "An illustration of a cat purring quietly" },
  },
  {
    question: { zh: "貓咪成日「踩奶／踏踏（Kneading）」，仲吸啜被單？", en: "Why do cats knead blankets or suck on fabric?" },
    answer: {
      zh: "踩奶是常見行為。幼貓吃奶時會用前爪按壓母貓腹部；成貓可能延續這動作來獲得舒適感或安定自己，也可能在準備休息或親近人時踩奶。原因會因貓和情境而異，單憑踩奶不能斷定牠「極度信任」或一定開心。若吸啜布料變得頻繁，請收好容易吞下的布料；若吞食或出現不適，應向獸醫查詢。",
      en: "Kneading is common. Kittens press their paws against their mother while nursing; adults may continue the behaviour for comfort or self-soothing, or knead as they settle down or interact with a person. Reasons vary by cat and context, so kneading alone cannot prove “ultimate trust” or happiness. If fabric-sucking becomes frequent, put away material that could be swallowed; contact a veterinarian if your cat ingests fabric or seems unwell.",
    },
    image: "/images/guide/cat-faq/cat-faq-02-kneading.jpg",
    alt: { zh: "貓咪在柔軟被單上踩踏的手繪插圖", en: "An illustration of a cat kneading a soft blanket" },
  },
  {
    question: { zh: "點解明明主動討摸，摸兩下又突然咬人？", en: "Why does my cat suddenly bite while being petted?" },
    answer: {
      zh: "有可能是貓咪已不想繼續被摸，尤其是重複撫摸一段時間後；但單憑咬人不能確定原因。留意甩尾或尾巴急促擺動、耳朵向後、背部抽動、身體突然僵住、轉頭盯着你的手，或移開身體等不安線索；一看到便停手，讓牠自行離開，不要追摸或懲罰。呼嚕不保證牠想繼續，露肚也不一定是在邀請摸肚。若咬人是新出現、愈來愈頻密或輕觸也會引發，請安排獸醫檢查。",
      en: "Your cat may have had enough of petting, especially after repeated strokes, but a bite alone cannot identify the cause. Watch for a swishing tail, ears turning back, rippling skin, suddenly becoming still, turning to stare at your hand, or moving away. Stop at any sign of discomfort and let your cat leave; do not follow or punish them. Purring does not mean they want petting to continue, and showing the belly is not necessarily an invitation. If biting is new, increasing, or triggered by gentle touch, arrange a veterinary check.",
    },
    image: "/images/guide/cat-faq/cat-faq-03-overstimulation.jpg",
    alt: { zh: "貓咪表現出不想繼續被摸的身體訊號", en: "A cat showing body-language signs that it wants petting to stop" },
  },
  {
    question: { zh: "貓咪成日用頭和臉頰磨蹭主人隻腳或者傢俬？", en: "Why do cats rub their cheeks against furniture or legs?" },
    answer: {
      zh: "貓咪面頰、下巴和頭部周圍有氣味腺體，磨蹭是常見的社交及氣味溝通方式，也可能是在打招呼、邀請互動或尋求注意。單憑磨蹭不能確定牠是在「霸佔」你或表達某一種特定情緒。若磨蹭突然變得用力、反覆，或伴隨搔臉、皮膚不適等變化，請向獸醫查詢。",
      en: "Cats have scent glands around the cheeks, chin, and head. Rubbing is a common form of social and scent communication; it may also be a greeting, an invitation to interact, or a request for attention. Rubbing alone cannot prove that a cat is “claiming” you or expressing one specific emotion. Ask a veterinarian if it suddenly becomes forceful or repetitive, or comes with facial scratching or skin discomfort.",
    },
    image: "/images/guide/cat-faq/cat-faq-04-cheek-rubbing.jpg",
    alt: { zh: "貓咪用臉頰磨蹭熟悉的人或家具", en: "A cat rubbing its cheek against a familiar person or furniture" },
  },
  {
    question: { zh: "貓咪半夜成日突然「跑酷（Night zoomies）」狂奔鬼叫？", en: "Why do cats get midnight zoomies?" },
    answer: {
      zh: "夜間突然奔跑可能只是短暫活動或捕獵式玩耍，也可能受作息和環境影響；單靠這個行為未能確定原因。可安排短而頻密的互動遊戲，讓貓咪追逐和捕捉安全玩具，並按牠的興趣及體能調整。每天玩15分鐘可作試行起點，並非固定療程，也不能保證改善夜間奔跑。若這是新出現或明顯加劇，尤其伴隨夜間叫聲、體重下降、食慾或飲水排尿改變、嘔吐或精神狀態改變，請聯絡獸醫評估。",
      en: "Nighttime bursts of running may be brief activity or prey-like play, and routine or environment may also play a part. The behaviour alone cannot establish the cause. Try short, frequent interactive sessions with a safe toy, letting your cat chase and catch it; adjust to their interest and ability. Fifteen minutes can be a starting point, not a fixed treatment or a guarantee of fewer zoomies. Contact a veterinarian if the behaviour is new or worsening, especially with vocalising, weight loss, changes in appetite or drinking and urination, vomiting, or a change in general condition.",
    },
    image: "/images/guide/cat-faq/cat-faq-05-midnight-zoomies.jpg",
    alt: { zh: "貓咪夜間玩耍奔跑的手繪插圖", en: "An illustration of a cat playing and running at night" },
  },
  {
    question: { zh: "貓咪點解成日「吐毛球」，係咪一定要食化毛膏？", en: "Do all cats need hairball paste?" },
    answer: {
      zh: "貓咪理毛時會吞下毛髮，大部分會隨糞便排出；偶爾吐出毛球未必代表有病。定期梳毛可減少鬆毛被吞下。若反覆吐毛球，或同時痕癢、過度理毛，宜向獸醫查明原因。貓草並非通用排毛療法；不要自行餵食烹調油、牛油、人用瀉劑或灌礦物油。專用產品亦應按獸醫建議使用。若反覆乾嘔卻吐不出、持續嘔吐、精神沉鬱、食慾下降或排出又硬又少的糞便，請盡快聯絡獸醫。",
      en: "Cats swallow hair while grooming, and most passes in the stool; an occasional hairball does not necessarily mean illness. Regular brushing can reduce loose hair they swallow. If hairball vomiting recurs, or your cat is itchy or overgrooming, ask a veterinarian to check for an underlying cause. Grass is not a universal remedy. Do not give cooking oil, butter, human laxatives, or syringe mineral oil. Use a purpose-made product only on veterinary advice. Repeated unproductive retching, ongoing vomiting, lethargy, reduced appetite, or hard, scant stools need prompt veterinary attention.",
    },
    image: "/images/guide/cat-faq/cat-faq-06-hairball-care.jpg",
    alt: { zh: "以溫和梳毛協助減少貓咪吞入鬆毛", en: "Gentle brushing to help reduce loose fur swallowed by a cat" },
  },
  {
    question: { zh: "點解貓咪鍾意「推跌枱面啲嘢（杯、筆）」？", en: "Why do cats knock items off tables?" },
    answer: {
      zh: "貓咪可能是在探索或玩耍，也可能因為物件掉落會引來人的反應而持續；單憑這個動作未能確定牠的動機，不宜說成報復或故意搗亂。把易碎、危險或容易被吞下的物件移離桌邊，並提供安全玩具和合適的互動遊戲。若行為突然改變，或同時有食慾、活動、如廁或日常習慣變化，請向獸醫查詢；如懷疑吞下異物或接觸有毒物質，應盡快求助。",
      en: "A cat may knock objects down while exploring or playing, or may repeat it because it brings a reaction from people. The action alone does not reveal a definite motive and is not evidence of revenge or deliberate mischief. Move fragile, hazardous, or swallowable items away from edges and offer safe toys and suitable interactive play. Ask a veterinarian if the behaviour changes suddenly or comes with changes in appetite, activity, toileting, or routine. Seek prompt advice if you suspect your cat swallowed an object or contacted something toxic.",
    },
    image: "/images/guide/cat-faq/cat-faq-07-knocking-objects.jpg",
    alt: { zh: "貓咪好奇地探索桌面物件", en: "A curious cat exploring objects on a table" },
  },
  {
    question: { zh: "貓咪突然喺貓砂盆外面亂屙尿，係咪報復主人？", en: "Is urinating outside the litter box a form of revenge?" },
    answer: {
      zh: "不是報復。砂盆外排尿可能與排尿疼痛、膀胱或尿道疾病有關，也可能受砂盆清潔、位置、貓砂喜好、行動不便或環境壓力影響；原因可以同時存在，請先盡快聯絡獸醫檢查。若牠反覆蹲下用力卻沒有尿、只有幾滴，尤其是公貓，請立即前往獸醫急診；嘔吐、拒食、嗜睡、虛弱或倒下亦屬緊急警訊。即使仍排到尿，若見尿血、疼痛或頻頻排尿，也應盡快求診。",
      en: "It is not revenge. Urinating outside the box may be related to painful urination or bladder and urethral disease; box cleanliness, location, litter preference, mobility, or environmental stress can also play a part. More than one cause may be present, so contact a veterinarian promptly for an assessment. Repeated straining with no urine or only a few drops—especially in a male cat—is an emergency. Vomiting, refusing food, marked lethargy, weakness, or collapse are urgent warning signs. Even if urine is passing, blood, pain, or frequent attempts warrant prompt veterinary advice.",
    },
    image: "/images/guide/cat-faq/cat-faq-08-litter-hygiene.jpg",
    alt: { zh: "乾淨、安靜且容易進出的貓砂盆環境", en: "A clean, quiet litter-box area that is easy for a cat to access" },
  },
  {
    question: { zh: "貓咪瞳孔放大、屁股扭動（Butt wiggle），跟住向前撲？", en: "Why do cats wiggle their butts before pouncing?" },
    answer: {
      zh: "撲擊前擺臀常見於貓咪低身伏下、盯住目標並準備衝刺或跳撲的捕獵式玩耍。臀部擺動可能是動作準備的一部分，但測試抓地力或預備肌肉等確切用途未有直接研究證實。瞳孔也會隨光線和不同狀態改變，不能單憑瞳孔擴大判斷牠準備撲擊。若兩邊瞳孔突然大小不一，或伴有眼紅、混濁、瞇眼、分泌物或視力改變，請立即聯絡獸醫。",
      en: "A pre-pounce wiggle is often seen when a cat crouches, focuses on a target, and prepares to spring during prey-like play. The movement may be part of getting ready to move, but claims that it specifically tests traction or primes muscles have not been established by direct research. Pupils also change with light and other states, so dilated pupils alone do not prove a pounce is coming. Sudden unequal pupils, redness, cloudiness, squinting, discharge, or a change in vision needs immediate veterinary advice.",
    },
    image: "/images/guide/cat-faq/cat-faq-09-butt-wiggle.jpg",
    alt: { zh: "貓咪伏低身體、準備追逐玩具前擺動臀部", en: "A cat wiggling its hindquarters before chasing a toy" },
  },
  {
    question: { zh: "貓咪慢慢對主人「眨眼（Slow blink）」，代表緊咩？", en: "What does a cat's slow blink mean?" },
    answer: {
      zh: "小型研究發現，貓面對人類慢慢眨眼時，較常回以半眨眼或收窄眼睛；這可能有助友善互動，但不能單憑一次慢眨眼就斷定牠在說「愛你」或一定信任你。要連同耳朵、身體姿勢和情境一起觀察。若貓咪看來放鬆，你可以輕柔地慢眨眼，讓牠自行決定是否回應，不要直瞪或勉強接觸。若持續瞇眼或伴隨眼紅、分泌物等眼部異常，請向獸醫查詢。",
      en: "Small studies found that cats were more likely to half-blink or narrow their eyes after a person slowly blinked at them; this may support friendly interaction. One slow blink cannot prove that a cat is saying “I love you” or definitely trusts you, so read it alongside the ears, posture, and situation. If your cat looks relaxed, you can try a gentle slow blink and let them choose whether to respond; avoid staring or forcing contact. Persistent squinting, redness, or discharge should be checked by a veterinarian.",
    },
    image: "/images/guide/cat-faq/cat-faq-10-slow-blink.jpg",
    alt: { zh: "貓咪以放鬆的眼神輕柔慢眨眼", en: "A relaxed cat giving a gentle slow blink" },
  },
];

export function CatFAQSection() {
  const { locale } = useI18n();
  const isEn = locale === "en";
  const copy = (item: Bilingual) => (isEn ? item.en : item.zh);

  return (
    <section aria-labelledby="cat-faq-title" className="mt-16 sm:mt-20">
      <header className="mb-8 text-center sm:mb-10">
        <p className="text-xs font-semibold tracking-[0.18em] text-[#9A7757]">
          {isEn ? "A LITTLE FIELD GUIDE · FELINE BEHAVIOUR" : "貓咪日常觀察小冊"}
        </p>
        <h2 id="cat-faq-title" className="mt-2 text-2xl font-bold tracking-tight text-[#3E2B20] sm:text-3xl">
          {isEn ? "Cat behaviour, decoded" : "貓咪常見行為 Q&A"}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#67584C] sm:text-base">
          {isEn
            ? "Small behaviours can have more than one explanation. Read the whole picture, and ask a veterinarian when health changes are involved."
            : "同一個動作可能有不同原因；觀察整體狀態與生活變化，如有健康疑慮請向獸醫查詢。"}
        </p>
      </header>

      <div className="flex flex-col gap-5 sm:gap-6">
        {FAQS.map((faq, index) => (
          <article
            key={faq.image}
            className={`flex flex-col overflow-hidden rounded-3xl border border-neutral-200/80 bg-[#fdfbf7] shadow-[0_16px_36px_-28px_rgba(74,59,50,0.45)] md:min-h-[320px] ${
              index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
            }`}
          >
            <div className="relative aspect-[4/3] w-full shrink-0 bg-[#f4efe7] md:aspect-auto md:w-[42%]">
              <Image
                src={faq.image}
                alt={copy(faq.alt)}
                fill
                sizes="(min-width: 768px) 42vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-center p-5 sm:p-7 md:p-8">
              <p className="text-xs font-semibold tracking-[0.16em] text-[#A47A4F]">
                {isEn ? "CAT NOTES" : "貓咪小問答"}
              </p>
              <h3 className="mt-2 text-lg font-bold leading-snug text-[#3E2B20] sm:text-xl">
                {`Q${index + 1}: ${copy(faq.question)}`}
              </h3>
              <p className="mt-4 text-sm leading-7 text-[#67584C] sm:text-base sm:leading-8">
                {copy(faq.answer)}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
