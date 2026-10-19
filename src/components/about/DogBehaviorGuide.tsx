import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/I18nProvider";

type Bilingual = { zh: string; en: string };

const MYTHS: Array<{ title: Bilingual; body: Bilingual; note: Bilingual }> = [
  {
    title: { zh: "尾巴在搖，未必代表開心", en: "A wagging tail does not always mean happy" },
    body: {
      zh: "高高豎起、短促急速地搖動，若同時伴隨身體繃緊，可能表示高度警覺或緊張；身體放鬆、大幅柔和地左右掃動，才較像愉快招呼。",
      en: "A high, quick, tight wag with a tense body can signal alertness or stress. A loose, sweeping wag with a relaxed body is more consistent with a friendly greeting.",
    },
    note: {
      zh: "別只看尾巴：一起觀察耳朵、眼神、嘴巴和整體姿勢。",
      en: "Read the whole dog: ears, eyes, mouth and posture matter too.",
    },
  },
  {
    title: { zh: "翻肚皮，不一定想討摸", en: "Belly-up does not always mean “rub my belly”" },
    body: {
      zh: "身體柔軟時，翻肚可能是信任或邀請互動；若肌肉僵硬、夾尾、縮起身體或眼神游移，則可能是在安撫、示弱或感到不安。",
      en: "A soft, loose body may be showing trust or inviting contact. A stiff body, tucked tail, crouching or darting eyes can instead signal appeasement or unease.",
    },
    note: {
      zh: "先停手、讓出空間；由狗狗決定要不要繼續互動。",
      en: "Pause and give space. Let the dog choose whether to continue interacting.",
    },
  },
];

const SIGNALS: Array<{ name: Bilingual; description: Bilingual; mark: string }> = [
  {
    mark: "01",
    name: { zh: "打哈欠", en: "Yawning" },
    description: {
      zh: "在不睏的情境反覆出現，可能是緩解壓力的訊號；試著降低刺激。",
      en: "Repeated yawning when a dog is not sleepy can be a stress signal. Reduce the pressure around them.",
    },
  },
  {
    mark: "02",
    name: { zh: "舔鼻、舔唇", en: "Nose or lip licking" },
    description: {
      zh: "有時表示輕度焦慮或友善安撫，也要留意食物、飲水等情境。",
      en: "This can signal mild unease or appeasement, though food and thirst are also part of the context.",
    },
  },
  {
    mark: "03",
    name: { zh: "鯨魚眼", en: "Whale eye" },
    description: {
      zh: "露出眼白時可能感到不安；停止逼近或伸手，讓狗狗可以轉身離開。",
      en: "Visible eye whites can signal discomfort. Stop reaching or closing in, and let the dog move away.",
    },
  },
  {
    mark: "04",
    name: { zh: "邀玩鞠躬", en: "Play bow" },
    description: {
      zh: "前身下伏、臀部抬高；若身體柔軟、動作有彈性，通常是在邀請玩耍。",
      en: "Front end low and rump raised. With a loose, bouncy body, this is often an invitation to play.",
    },
  },
];

const LADDER: Array<{ color: string; label: Bilingual; signs: Bilingual; response: Bilingual }> = [
  {
    color: "border-emerald-200 bg-emerald-50",
    label: { zh: "綠燈｜自在放鬆", en: "GREEN · relaxed" },
    signs: { zh: "身體柔軟、眼神放鬆、願意自在探索。", en: "Loose body, soft eyes and relaxed exploration." },
    response: { zh: "保持溫和，讓互動由牠選擇。", en: "Stay gentle and let the dog choose the interaction." },
  },
  {
    color: "border-amber-200 bg-amber-50",
    label: { zh: "黃燈｜輕聲提醒", en: "YELLOW · early signals" },
    signs: { zh: "打哈欠、舔鼻、眨眼或轉頭避開。", en: "Yawning, lip licking, blinking or turning away." },
    response: { zh: "放慢動作，減少刺激並留出空間。", en: "Slow down, reduce stimulation and give space." },
  },
  {
    color: "border-orange-200 bg-orange-50",
    label: { zh: "橙燈｜明顯不舒服", en: "ORANGE · discomfort" },
    signs: { zh: "僵住、低頭、縮身或試圖迴避。", en: "Freezing, lowering the head, crouching or trying to avoid contact." },
    response: { zh: "停止接觸，讓狗狗退開；不要追上去。", en: "Stop contact and allow the dog to leave. Do not follow." },
  },
  {
    color: "border-rose-200 bg-rose-50",
    label: { zh: "紅燈｜防衛警告", en: "RED · warning" },
    signs: { zh: "低吼、露齒、僵硬凝視或撲咬。", en: "Growling, showing teeth, a stiff stare, lunging or snapping." },
    response: { zh: "保持距離、平靜撤開；切勿責罵或徒手拉扯。", en: "Create distance and calmly disengage. Do not scold or grab the dog." },
  },
];

const GREETING_STEPS: Array<{ title: Bilingual; body: Bilingual }> = [
  {
    title: { zh: "先問主人", en: "Ask the Owner First" },
    body: {
      zh: "先確認狗狗是否適合被陌生人接近；主人說不方便，就在遠處欣賞。",
      en: "Check whether the dog is comfortable with strangers. If the owner says no, simply admire them from afar.",
    },
  },
  {
    title: { zh: "側身蹲低，保持距離", en: "Crouch Sideways & Keep Distance" },
    body: {
      zh: "避免迎面直走、俯身壓向狗狗；側身放鬆，留下牠可以選擇靠近或離開的空間。",
      en: "Avoid walking straight at the dog or leaning over them. Turn sideways, relax, and leave plenty of room for them to approach or walk away.",
    },
  },
  {
    title: { zh: "放低拳背，讓牠先嗅聞", en: "Offer the Back of Your Hand Low" },
    body: {
      zh: "手放低、拳背自然朝外，不要把手伸到鼻前；讓狗狗自行決定要不要靠近。",
      en: "Hold your hand low with the back of your fist facing out—never thrust your hand right in front of their nose. Let the dog decide whether to come sniff.",
    },
  },
  {
    title: { zh: "放鬆時輕摸胸口或下巴", en: "Gently Pet the Chest or Chin When Relaxed" },
    body: {
      zh: "只有在狗狗主動靠近且身體放鬆時才輕撫，避開頭頂；若牠退開、僵住或舔唇，就立刻停手。",
      en: "Pet only if the dog approaches willingly with a loose body, avoiding the top of the head. Stop immediately if they back away, freeze, or lick their lips.",
    },
  },
];

const CHEWS: Array<{ name: Bilingual; detail: Bilingual }> = [
  {
    name: { zh: "特長牛大筋耐咬棒", en: "Extra-long beef tendon chew" },
    detail: { zh: "適合在旁看顧下慢慢啃咬。", en: "For a supervised, steady chew." },
  },
  {
    name: { zh: "天然原隻牛蹄", en: "Whole natural beef hoof" },
    detail: { zh: "讓耐咬時光多一點探索與專注。", en: "A longer-lasting option for focused chewing." },
  },
  {
    name: { zh: "鯊魚皮潔齒棒", en: "Shark-skin dental chew" },
    detail: { zh: "按狗狗體型與咬合習慣挑選。", en: "Choose with your dog’s size and chewing style in mind." },
  },
];

export function DogBehaviorGuide() {
  const { locale } = useI18n();
  const isEn = locale === "en";
  const copy = (item: Bilingual) => (isEn ? item.en : item.zh);

  return (
    <section
      aria-labelledby="dog-behavior-guide-title"
      className="mt-16 border-t border-[#E9DFD1] pt-12 sm:mt-20 sm:pt-16"
    >
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 text-center sm:mb-10">
          <p className="text-xs font-semibold tracking-[0.2em] text-[#9A7757]">
            {isEn ? "A LITTLE FIELD GUIDE · DOG BODY LANGUAGE" : "毛孩觀察小冊 · 讀懂狗狗身體語言"}
          </p>
          <h2 id="dog-behavior-guide-title" className="mt-3 text-2xl font-bold tracking-tight text-[#3E2B20] sm:text-3xl">
            {isEn ? "Dog behavior, decoded" : "狗狗行為解密與安心社交"}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#67584C] sm:text-base">
            {isEn
              ? "Small signals are a conversation. Read the whole body and the moment around it; one gesture alone cannot tell the whole story."
              : "細微動作都是溝通的一部分。讀訊號時，要一起看全身姿勢與當下情境；單一動作並不能說明全部。"}
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          {MYTHS.map((myth, index) => (
            <article key={myth.title.en} className="rounded-2xl border border-[#E9DFD1] bg-[#FCF9F2] p-5 sm:p-6">
              <p className="text-xs font-semibold tracking-[0.16em] text-[#A47A4F]">
                {isEn ? `MYTH ${index + 1}` : `常見迷思 ${String(index + 1).padStart(2, "0")}`}
              </p>
              <h3 className="mt-2 text-lg font-bold leading-snug text-[#3E2B20]">{copy(myth.title)}</h3>
              <p className="mt-3 text-sm leading-7 text-[#67584C]">{copy(myth.body)}</p>
              <p className="mt-4 rounded-xl bg-white/80 px-3 py-2.5 text-xs leading-6 text-[#805C3D]">{copy(myth.note)}</p>
            </article>
          ))}
        </div>

        <section aria-labelledby="dog-signals-title" className="mt-12 sm:mt-16">
          <div className="mb-5">
            <p className="text-xs font-semibold tracking-[0.16em] text-[#A47A4F]">{isEn ? "LOOK A LITTLE CLOSER" : "微表情速查"}</p>
            <h3 id="dog-signals-title" className="mt-1 text-xl font-bold text-[#3E2B20] sm:text-2xl">
              {isEn ? "Four small signals worth noticing" : "四個值得留意的細微訊號"}
            </h3>
          </div>
          <div className="grid items-center gap-5 md:grid-cols-[1.05fr_0.95fr] md:gap-7">
            <figure className={`overflow-hidden rounded-2xl border border-[#E9DFD1] bg-[#FCF9F2] shadow-[0_18px_36px_-28px_rgba(74,59,50,0.5)] ${isEn ? "hidden" : ""}`}>
              <Image
                src="/images/guide/dog-body-language.jpg"
                alt={isEn ? "Illustrated dog body-language examples, including a relaxed dog, a curious dog, a play bow and a yawn" : "狗狗微表情插圖：放鬆、好奇、邀玩鞠躬與打哈欠"}
                width={1376}
                height={768}
                sizes="(min-width: 768px) 44vw, 100vw"
                className="h-auto w-full"
              />
              <figcaption className="px-4 py-3 text-xs leading-5 text-[#766453]">
                {isEn ? "A picture-book reminder: posture and context belong together." : "圖文小提醒：把姿勢放回情境裡一起看。"}
              </figcaption>
            </figure>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
              {SIGNALS.map((signal) => (
                <article key={signal.mark} className="flex gap-3 rounded-2xl border border-[#EEE6DA] bg-white p-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F3E9D8] text-xs font-bold text-[#805C3D]">{signal.mark}</span>
                  <div>
                    <h4 className="font-bold text-[#3E2B20]">{copy(signal.name)}</h4>
                    <p className="mt-1 text-xs leading-6 text-[#67584C]">{copy(signal.description)}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="dog-emotion-ladder-title" className="mt-12 rounded-3xl bg-[#F8F4EB] p-5 sm:mt-16 sm:p-7">
          <p className="text-xs font-semibold tracking-[0.16em] text-[#A47A4F]">{isEn ? "NOTICE EARLY · RESPOND GENTLY" : "及早察覺 · 溫柔回應"}</p>
          <h3 id="dog-emotion-ladder-title" className="mt-1 text-xl font-bold text-[#3E2B20] sm:text-2xl">
            {isEn ? "A simple ladder of rising discomfort" : "情緒升級階梯：從低聲提醒到防衛警告"}
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#67584C]">
            {isEn
              ? "This is a guide, not a fixed sequence: dogs may skip signals or show them differently. Give space as soon as you notice discomfort."
              : "這是一個觀察工具，不是固定流程：狗狗可能跳過某些訊號，或以不同方式表達。一看見不舒服，就先尊重界線、拉開空間。"}
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {LADDER.map((rung) => (
              <article key={rung.label.en} className={`rounded-2xl border p-4 ${rung.color}`}>
                <h4 className="font-bold text-[#3E2B20]">{copy(rung.label)}</h4>
                <p className="mt-2 text-sm leading-6 text-[#51473D]">{copy(rung.signs)}</p>
                <p className="mt-3 border-t border-black/10 pt-2 text-xs font-medium leading-5 text-[#51473D]">{copy(rung.response)}</p>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="dog-greeting-title" className="mt-12 sm:mt-16">
          <div className="mb-5">
            <p className="text-xs font-semibold tracking-[0.16em] text-[#A47A4F]">{isEn ? "Greet Dogs in a Way That Feels Safe to Them" : "用狗狗舒服的方式打招呼"}</p>
            <h3 id="dog-greeting-title" className="mt-1 text-xl font-bold text-[#3E2B20] sm:text-2xl">
              {isEn ? "4 Golden Steps to Safely Greet an Unfamiliar Dog" : "安全接近陌生狗狗的四大黃金步驟"}
            </h3>
          </div>
          <figure className={`overflow-hidden rounded-2xl border border-[#E9DFD1] bg-[#FCF9F2] shadow-[0_18px_36px_-28px_rgba(74,59,50,0.5)] ${isEn ? "hidden" : ""}`}>
            <Image
              src="/images/guide/dog-greeting-steps.jpg"
              alt={isEn ? "Illustrated four-step guide to greeting a dog safely: ask first, crouch sideways at a distance, let the dog sniff, then pet the chest or chin" : "安全接近狗狗四步插圖：先詢問、側身保持距離、讓狗狗嗅聞，再輕撫胸口或下巴"}
              width={1376}
              height={768}
              sizes="(min-width: 768px) 85vw, 100vw"
              className="h-auto w-full"
            />
          </figure>
          <ol className="mt-4 grid gap-3 sm:grid-cols-2">
            {GREETING_STEPS.map((step, index) => (
              <li key={step.title.en} className="flex gap-3 rounded-2xl border border-[#EEE6DA] bg-white p-4 sm:p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EBDCC4] text-lg font-bold text-[#5B3924]">{index + 1}</span>
                <div>
                  <h4 className="font-bold text-[#3E2B20]">{copy(step.title)}</h4>
                  <p className="mt-1 text-sm leading-6 text-[#67584C]">{copy(step.body)}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-3 rounded-xl bg-[#FFF8EA] px-4 py-3 text-xs leading-6 text-[#735B40]">
            {isEn
              ? "If a dog freezes, growls, turns away, or is tightly restrained on a leash, do not reach out. Step back calmly and follow the owner’s lead."
              : "若狗狗僵住、低吼、轉身避開，或正被牽繩限制，請勿伸手接觸；平靜退開，聽從主人安排。"}
          </p>
        </section>

        <section aria-labelledby="dog-chewing-title" className="mt-12 rounded-3xl border border-[#E9DFD1] bg-[#FCF9F2] p-5 sm:mt-16 sm:p-7">
          <p className="text-xs font-semibold tracking-[0.16em] text-[#A47A4F]">{isEn ? "A CALMING ROUTINE, NOT A CURE" : "日常咀嚼小儀式，不是治療"}</p>
          <h3 id="dog-chewing-title" className="mt-1 text-xl font-bold text-[#3E2B20] sm:text-2xl">
            {isEn ? "Chewing can be enriching" : "咀嚼解壓：讓天性有安心出口"}
          </h3>
          <p className="mt-3 text-sm leading-7 text-[#67584C] sm:text-base">
            {isEn
              ? "Safe, supervised chewing can offer focus and a satisfying enrichment activity. Reward-related pathways—including dopamine and endorphin systems—may be involved, but research supports a possible aid to arousal and emotional regulation, not a guaranteed chemical effect or treatment for anxiety."
              : "在安全看顧下咀嚼，能讓狗狗專注啃咬、獲得滿足感，成為日常豐富化活動。獎賞相關路徑可能參與其中，包括多巴胺與內啡肽系統；研究支持咀嚼或有助調節喚醒程度與情緒，但不代表每款零食都會固定釋放特定物質，也不能替代焦慮治療。"}
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {CHEWS.map((chew) => (
              <Link
                key={chew.name.en}
                href="/collections/dogs"
                className="group rounded-2xl border border-[#E9DFD1] bg-white p-4 transition hover:-translate-y-0.5 hover:border-[#C9A47B] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9A7757]"
              >
                <span className="block text-xs font-semibold tracking-[0.12em] text-[#9A7757]">BEST PARTNER · JAPAN</span>
                <span className="mt-2 block font-bold text-[#3E2B20]">{copy(chew.name)}</span>
                <span className="mt-1 block text-xs leading-5 text-[#766453]">{copy(chew.detail)}</span>
                <span className="mt-3 inline-block text-xs font-semibold text-[#805C3D] group-hover:underline">
                  {isEn ? "Explore dog chews →" : "逛逛狗狗天然耐咬系列 →"}
                </span>
              </Link>
            ))}
          </div>
          <p className="mt-4 text-xs leading-5 text-[#766453]">
            {isEn
              ? "Choose a size and texture that suit your dog, supervise chewing and remove small pieces. If stress is frequent or severe, ask a qualified behavior professional or veterinarian."
              : "請按體型與咬力挑選合適尺寸，並在旁看顧；咀嚼物變小時適時收走。若焦慮頻繁或嚴重，請向合資格的行為專業人士或獸醫求助。"}
          </p>
        </section>
      </div>
    </section>
  );
}
