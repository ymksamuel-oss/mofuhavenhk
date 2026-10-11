const FAQS = [
  {
    question: "狗狗翻肚皮就代表想人摸？",
    answer:
      "未必。若身體柔軟、眼神放鬆，而且會主動靠近，可能是在邀請互動；若肌肉僵硬、夾尾、縮起身體或眼神游移，可能是在退讓或感到不安。\n\n可以先停手觀察牠是否再次靠近。若牠避開、僵住或發出低吼，就讓牠保有空間；如果碰觸時似乎疼痛，也應停止並詢問獸醫。",
  },
  {
    question: "主人一出門就狂吠、咬爛傢俬，可以點算？",
    answer:
      "這可能與獨處壓力有關，也可能是外界聲音、悶或尚未習慣獨處；不代表狗狗在報復。可用攝影機觀察牠從什麼時候開始不安，並先減少窗外刺激、安排安全的活動。\n\n由牠仍然放鬆的短暫離開開始練習，再慢慢延長時間。避免責罵或讓牠長時間獨自「捱過去」。若牠會自傷、猛烈撞門，或問題持續，請先向獸醫及合資格的行為專業人士求助。",
  },
  {
    question: "點改善狗狗護食（一靠近就發出低吼聲）？",
    answer:
      "低吼是在提醒牠需要空間，不是故意不聽話。先讓牠在安靜的位置吃飯，並用門或圍欄隔開小朋友和其他寵物。不要伸手拿食物、故意靠近測試，也不要責罵低吼；懲罰警告訊號可能令情況更難預測。\n\n如需訓練，請由獸醫或合資格的正向行為專業人士按狗狗狀況安排，循序漸進地建立安全感。若曾撲咬、咬人或護食突然出現，請盡快尋求專業協助。",
  },
  {
    question: "狗狗點解會不停追住自己條尾咬？",
    answer:
      "偶爾追幾圈可能是玩耍或一時興奮；反覆追咬也可能與尾巴痕癢、寄生蟲、疼痛或其他身體不適有關。若牠很難被轉移注意，或已咬到脫毛、紅腫及受傷，就不宜只當成玩。\n\n記下發生時間和情境，必要時拍短片給獸醫參考。若行為突然開始、愈來愈頻密或已自傷，請安排獸醫檢查，不要責罵或硬捉牠制止。",
  },
  {
    question: "狗狗點解鍾意抱住人腿或者玩具狂「騎乘」？",
    answer:
      "騎乘不一定與交配或「爭做老大」有關，也可能出現在玩得太興奮、緊張、想引人注意或形成習慣時；已絕育的狗狗也可能有這種行為。\n\n若只是偶爾發生，可保持冷靜，用熟悉的提示或活動轉移注意，避免打罵或用手硬拉。若突然變得頻密、難以中斷，或伴隨舔咬生殖部位及排尿不適，請向獸醫查詢。",
  },
  {
    question: "狗狗突然對住空氣狂吠，係咪睇到「唔乾淨嘅嘢」？",
    answer:
      "不需要先作這種假設。狗狗可能察覺到人未留意的聲音、氣味或細小動靜，也可能因警戒、害怕或環境刺激而吠叫。可以平靜觀察周圍是否有固定聲源，避免責罵或強迫牠走近。\n\n若吠叫突然出現或持續加劇，尤其伴隨迷惘、作息改變、喘氣或不願活動，請讓獸醫評估身體、感官或年齡相關的變化。",
  },
  {
    question: "狗狗點解鍾意用屁股／背脊對住我坐？",
    answer:
      "很多時只是牠選擇了舒服的位置，並不表示不喜歡你，也不一定代表某種固定訊息。若身體放鬆、自在地留在身邊，通常毋須擔心。\n\n如果牠在你靠近或想摸牠時轉身，並同時縮低身、夾尾、舔嘴或走開，可能是在表示想要空間，先讓牠自行選擇是否靠近。若這姿勢突然改變，並伴隨拱背、起身困難或不願走動，請安排獸醫檢查。",
  },
  {
    question: "散步嗰陣成日停低係咁聞地下，係咪應該拉走佢？",
    answer:
      "通常不用每次都拉走。嗅聞是狗狗探索環境的自然方式，也能提供感官刺激。路面安全、牽繩穩妥時，可以留一點時間讓牠聞完再走，不必把每次散步都變成趕路。\n\n留意車路、垃圾和不明物品，溫和帶牠避開危險處即可。若嗅聞突然變得反覆、難以中斷，或伴隨跛行、疼痛等變化，請向獸醫查詢。",
  },
  {
    question: "明明冇游水／沖涼，點解狗狗成日突然「大動作甩身（震毛）」？",
    answer:
      "全身甩動一下不一定是因為濕了，也不一定代表壓力；有時會出現在玩耍或興奮之後、活動轉換之間。留意是偶爾全身甩一下，還是反覆搖頭、抓耳或持續發抖。\n\n若耳朵發紅、有異味或分泌物，或狗狗持續震動、顯得疼痛及精神不佳，請聯絡獸醫；不要自行替牠滴耳藥。可以記下發生前後的情境，方便說明。",
  },
  {
    question: "狗狗點解會歪頭（斜頭萌望住你）？",
    answer:
      "聽到聲音或你說話時，狗狗偶爾短暫歪頭，可能是被吸引、正在留意聲音或熟悉的訊息；確切原因未必每次都一樣。單憑歪頭也不能判斷牠一定聽懂了什麼。\n\n若頭突然持續歪向一側，或同時失去平衡、跌倒、眼球不自主快速移動及嘔吐，請盡快聯絡獸醫。等候時讓牠待在平坦、安全的位置，避免樓梯和跌落。",
  },
];

export function DogFAQSection() {
  return (
    <section aria-labelledby="dog-faq-title" className="mt-12 sm:mt-16">
      <header className="mb-6 text-center sm:mb-8">
        <p className="text-xs font-semibold tracking-[0.18em] text-[#9A7757]">毛孩日常小問答</p>
        <h2 id="dog-faq-title" className="mt-2 text-2xl font-bold tracking-tight text-[#3E2B20] sm:text-3xl">
          🐶 狗狗心事與日常行為常見疑問
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#67584C]">
          先觀察狗狗的整體狀態，再溫柔回應；若行為突然改變或伴隨不適，請尋求獸醫協助。
        </p>
      </header>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {FAQS.map((faq, index) => (
          <details key={faq.question} className="group rounded-2xl border border-neutral-200/80 bg-[#fbf9f5] shadow-[0_10px_24px_-20px_rgba(74,59,50,0.4)]">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 rounded-2xl p-4 text-left text-sm font-semibold leading-6 text-[#3E2B20] outline-none transition hover:bg-[#f7f2e9] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#9A7757] sm:p-5 [&::-webkit-details-marker]:hidden">
              <span>
                <span className="mr-2 text-xs font-bold tracking-wider text-[#A47A4F]">{String(index + 1).padStart(2, "0")}</span>
                {faq.question}
              </span>
              <span aria-hidden="true" className="shrink-0 text-lg leading-6 text-[#9A7757] transition-transform duration-200 group-open:rotate-45">＋</span>
            </summary>
            <div className="border-t border-neutral-200/70 px-4 pb-5 pt-3 sm:px-5">
              <p className="whitespace-pre-line text-sm leading-7 text-[#67584C]">{faq.answer}</p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
