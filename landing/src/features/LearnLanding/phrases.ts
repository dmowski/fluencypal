import { LearnPageLocale } from './targets';

export interface LearnPhraseSet {
  shareTitle: (name: string) => string;
  /** Large line on the share image and the page heading. */
  headline: (name: string) => string;
  /** Smaller line on the share image. Together with `headline` it reads as `shareTitle`. */
  imageLine2: string;
  description: (name: string) => string;
  heroTitle2: string;
  heroSubtitle: string;
  label: string;
  webcamTitle: string;
  webcamSubtitle: string;
  webcamContent: string;
  howSubtitle: string;
  rolePlayTitle: string;
  rolePlaySubtitle: string;
  ctaTitle: string;
}

const spoken =
  'Real conversations with AI, instant corrections, and the confidence to say it out loud.';

export const learnPhrases: Record<LearnPageLocale, LearnPhraseSet> = {
  en: {
    shareTitle: (name) => `Learn ${name} with FluencyPal`,
    headline: (name) => `Learn ${name}`,
    imageLine2: 'with FluencyPal',
    description: (name) => `Learn ${name} by speaking with AI. ${spoken}`,
    heroTitle2: 'Out loud, not flashcards.',
    heroSubtitle: spoken,
    label: 'Speaking practice',
    webcamTitle: 'Real conversation practice',
    webcamSubtitle: 'You know the words. Now say them.',
    webcamContent:
      'Practice for work, travel, and everyday life. The AI answers, corrects you, and helps you speak without pausing to translate.',
    howSubtitle:
      'Realistic conversation, instant feedback, and a plan built around speaking — not another pile of cards.',
    rolePlayTitle: 'Turn practice into conversation',
    rolePlaySubtitle: 'Interviews, meetings, travel, and the conversations you actually need.',
    ctaTitle: 'Stop studying. Start speaking.',
  },
  ru: {
    shareTitle: (name) => `Изучай ${name} с FluencyPal`,
    headline: (name) => `Изучай ${name}`,
    imageLine2: 'с FluencyPal',
    description: (name) =>
      `Изучай ${name} в разговоре с ИИ. Живая практика, мгновенные исправления и уверенность говорить вслух.`,
    heroTitle2: 'Вслух, а не карточки.',
    heroSubtitle: 'Живые разговоры с ИИ, мгновенные исправления и уверенность сказать это вслух.',
    label: 'Разговорная практика',
    webcamTitle: 'Настоящая разговорная практика',
    webcamSubtitle: 'Слова уже есть. Теперь скажите их.',
    webcamContent:
      'Практика для работы, поездок и обычной жизни. ИИ отвечает, поправляет и помогает говорить без паузы на перевод.',
    howSubtitle:
      'Живые диалоги, мгновенная обратная связь и план, который строится на речи, а не на очередной колоде карточек.',
    rolePlayTitle: 'Превратите практику в разговор',
    rolePlaySubtitle:
      'Собеседования, встречи, поездки и те разговоры, которые вам действительно нужны.',
    ctaTitle: 'Хватит учить. Начните говорить.',
  },
  uk: {
    shareTitle: (name) => `Вивчайте ${name} з FluencyPal`,
    headline: (name) => `Вивчайте ${name}`,
    imageLine2: 'з FluencyPal',
    description: (name) =>
      `Вивчайте ${name} в розмові з ШІ. Жива практика, миттєві виправлення й упевненість говорити вголос.`,
    heroTitle2: 'Уголос, а не картки.',
    heroSubtitle: 'Живі розмови з ШІ, миттєві виправлення й упевненість сказати це вголос.',
    label: 'Розмовна практика',
    webcamTitle: 'Справжня розмовна практика',
    webcamSubtitle: 'Слова вже є. Тепер скажіть їх.',
    webcamContent:
      'Практика для роботи, подорожей і звичайного життя. ШІ відповідає, виправляє й допомагає говорити без паузи на переклад.',
    howSubtitle:
      'Живі діалоги, миттєвий зворотний зв’язок і план, побудований на мовленні, а не на черговій колоді карток.',
    rolePlayTitle: 'Перетворіть практику на розмову',
    rolePlaySubtitle: 'Співбесіди, зустрічі, подорожі й ті розмови, які вам справді потрібні.',
    ctaTitle: 'Годі вчити. Почніть говорити.',
  },
  be: {
    shareTitle: (name) => `Вывучайце ${name} з FluencyPal`,
    headline: (name) => `Вывучайце ${name}`,
    imageLine2: 'з FluencyPal',
    description: (name) =>
      `Вывучайце ${name} ў размове з ШІ. Жывая практыка, імгненныя выпраўленні і ўпэўненасць гаварыць услых.`,
    heroTitle2: 'Услых, а не карткі.',
    heroSubtitle: 'Жывыя размовы з ШІ, імгненныя выпраўленні і ўпэўненасць сказаць гэта ўслых.',
    label: 'Гутарковая практыка',
    webcamTitle: 'Сапраўдная гутарковая практыка',
    webcamSubtitle: 'Словы ўжо ёсць. Цяпер скажыце іх.',
    webcamContent:
      'Практыка для працы, паездак і звычайнага жыцця. ШІ адказвае, выпраўляе і дапамагае гаварыць без паўзы на пераклад.',
    howSubtitle:
      'Жывыя дыялогі, імгненная зваротная сувязь і план, пабудаваны на маўленні, а не на чарговай калодзе картак.',
    rolePlayTitle: 'Ператварыце практыку ў размову',
    rolePlaySubtitle: 'Сумоўі, сустрэчы, паездкі і тыя размовы, якія вам сапраўды патрэбныя.',
    ctaTitle: 'Хопіць вучыць. Пачніце гаварыць.',
  },
  pl: {
    shareTitle: (name) => `Ucz się ${name} z FluencyPal`,
    headline: (name) => `Ucz się ${name}`,
    imageLine2: 'z FluencyPal',
    description: (name) =>
      `Ucz się ${name} w rozmowie z AI. Żywa praktyka, natychmiastowe poprawki i pewność, żeby powiedzieć to na głos.`,
    heroTitle2: 'Na głos, nie fiszki.',
    heroSubtitle:
      'Prawdziwe rozmowy z AI, natychmiastowe poprawki i pewność, żeby powiedzieć to na głos.',
    label: 'Praktyka mówienia',
    webcamTitle: 'Prawdziwa praktyka rozmowy',
    webcamSubtitle: 'Słowa już znasz. Teraz je powiedz.',
    webcamContent:
      'Praktyka do pracy, podróży i zwykłego życia. AI odpowiada, poprawia i pomaga mówić bez pauzy na tłumaczenie.',
    howSubtitle:
      'Żywe dialogi, natychmiastowa informacja zwrotna i plan oparty na mówieniu, a nie na kolejnej talii fiszek.',
    rolePlayTitle: 'Zamień praktykę w rozmowę',
    rolePlaySubtitle:
      'Rozmowy o pracę, spotkania, podróże i te rozmowy, których naprawdę potrzebujesz.',
    ctaTitle: 'Przestań wkuwać. Zacznij mówić.',
  },
  de: {
    shareTitle: (name) => `Lerne ${name} mit FluencyPal`,
    headline: (name) => `Lerne ${name}`,
    imageLine2: 'mit FluencyPal',
    description: (name) =>
      `Lerne ${name}, indem du mit KI sprichst. Echte Gespräche, sofortige Korrekturen und die Sicherheit, es laut zu sagen.`,
    heroTitle2: 'Laut sprechen, keine Karteikarten.',
    heroSubtitle:
      'Echte Gespräche mit KI, sofortige Korrekturen und die Sicherheit, es laut zu sagen.',
    label: 'Sprechtraining',
    webcamTitle: 'Echtes Gesprächstraining',
    webcamSubtitle: 'Die Wörter kennst du. Jetzt sprich sie.',
    webcamContent:
      'Übung für Arbeit, Reisen und den Alltag. Die KI antwortet, korrigiert und hilft dir, ohne Übersetzungspause zu sprechen.',
    howSubtitle:
      'Realistische Gespräche, sofortiges Feedback und ein Plan, der auf Sprechen setzt — nicht auf den nächsten Kartenstapel.',
    rolePlayTitle: 'Aus Übung wird Gespräch',
    rolePlaySubtitle:
      'Vorstellungsgespräche, Meetings, Reisen und die Gespräche, die du wirklich brauchst.',
    ctaTitle: 'Schluss mit Pauken. Fang an zu sprechen.',
  },
  fr: {
    shareTitle: (name) => `Apprenez ${name} avec FluencyPal`,
    headline: (name) => `Apprenez ${name}`,
    imageLine2: 'avec FluencyPal',
    description: (name) =>
      `Apprenez ${name} en parlant avec une IA. De vraies conversations, des corrections immédiates et l’assurance de le dire à voix haute.`,
    heroTitle2: 'À voix haute, pas des cartes.',
    heroSubtitle:
      'De vraies conversations avec une IA, des corrections immédiates et l’assurance de le dire à voix haute.',
    label: 'Pratique orale',
    webcamTitle: 'De vraies conversations',
    webcamSubtitle: 'Vous connaissez les mots. Dites-les.',
    webcamContent:
      'Entraînez-vous pour le travail, les voyages et le quotidien. L’IA répond, corrige et vous aide à parler sans pause pour traduire.',
    howSubtitle:
      'Des conversations réalistes, un retour immédiat et un plan construit sur la parole, pas sur une nouvelle pile de cartes.',
    rolePlayTitle: 'Transformez la pratique en conversation',
    rolePlaySubtitle:
      'Entretiens, réunions, voyages et les conversations dont vous avez vraiment besoin.',
    ctaTitle: 'Arrêtez de réviser. Commencez à parler.',
  },
  es: {
    shareTitle: (name) => `Aprende ${name} con FluencyPal`,
    headline: (name) => `Aprende ${name}`,
    imageLine2: 'con FluencyPal',
    description: (name) =>
      `Aprende ${name} hablando con IA. Conversaciones reales, correcciones al momento y la seguridad de decirlo en voz alta.`,
    heroTitle2: 'En voz alta, no con tarjetas.',
    heroSubtitle:
      'Conversaciones reales con IA, correcciones al momento y la seguridad de decirlo en voz alta.',
    label: 'Práctica oral',
    webcamTitle: 'Práctica de conversación real',
    webcamSubtitle: 'Ya conoces las palabras. Ahora dilas.',
    webcamContent:
      'Práctica para el trabajo, los viajes y el día a día. La IA responde, corrige y te ayuda a hablar sin parar a traducir.',
    howSubtitle:
      'Conversaciones realistas, comentarios al instante y un plan basado en hablar, no en otro montón de tarjetas.',
    rolePlayTitle: 'Convierte la práctica en conversación',
    rolePlaySubtitle:
      'Entrevistas, reuniones, viajes y las conversaciones que de verdad necesitas.',
    ctaTitle: 'Deja de estudiar. Empieza a hablar.',
  },
  it: {
    shareTitle: (name) => `Impara ${name} con FluencyPal`,
    headline: (name) => `Impara ${name}`,
    imageLine2: 'con FluencyPal',
    description: (name) =>
      `Impara ${name} parlando con l’IA. Conversazioni vere, correzioni immediate e la sicurezza di dirlo ad alta voce.`,
    heroTitle2: 'Ad alta voce, non con le flashcard.',
    heroSubtitle:
      'Conversazioni vere con l’IA, correzioni immediate e la sicurezza di dirlo ad alta voce.',
    label: 'Pratica orale',
    webcamTitle: 'Pratica di conversazione vera',
    webcamSubtitle: 'Le parole le conosci. Adesso dille.',
    webcamContent:
      'Pratica per il lavoro, i viaggi e la vita di tutti i giorni. L’IA risponde, corregge e ti aiuta a parlare senza fermarti a tradurre.',
    howSubtitle:
      'Conversazioni realistiche, feedback immediato e un piano costruito sul parlare, non su un altro mazzo di carte.',
    rolePlayTitle: 'Trasforma la pratica in conversazione',
    rolePlaySubtitle: 'Colloqui, riunioni, viaggi e le conversazioni che ti servono davvero.',
    ctaTitle: 'Smetti di studiare. Inizia a parlare.',
  },
  pt: {
    shareTitle: (name) => `Aprenda ${name} com o FluencyPal`,
    headline: (name) => `Aprenda ${name}`,
    imageLine2: 'com o FluencyPal',
    description: (name) =>
      `Aprenda ${name} falando com IA. Conversas de verdade, correções na hora e confiança para dizer em voz alta.`,
    heroTitle2: 'Em voz alta, não com cartões.',
    heroSubtitle:
      'Conversas de verdade com IA, correções na hora e confiança para dizer em voz alta.',
    label: 'Prática de fala',
    webcamTitle: 'Prática de conversa de verdade',
    webcamSubtitle: 'Você já conhece as palavras. Agora diga.',
    webcamContent:
      'Prática para o trabalho, viagens e o dia a dia. A IA responde, corrige e ajuda você a falar sem pausa para traduzir.',
    howSubtitle:
      'Conversas realistas, retorno imediato e um plano feito em torno da fala, não de mais um monte de cartões.',
    rolePlayTitle: 'Transforme a prática em conversa',
    rolePlaySubtitle:
      'Entrevistas, reuniões, viagens e as conversas de que você realmente precisa.',
    ctaTitle: 'Pare de estudar. Comece a falar.',
  },
  sv: {
    shareTitle: (name) => `Lär dig ${name} med FluencyPal`,
    headline: (name) => `Lär dig ${name}`,
    imageLine2: 'med FluencyPal',
    description: (name) =>
      `Lär dig ${name} genom att prata med AI. Riktiga samtal, omedelbara rättningar och modet att säga det högt.`,
    heroTitle2: 'Högt, inte gloskort.',
    heroSubtitle: 'Riktiga samtal med AI, omedelbara rättningar och modet att säga det högt.',
    label: 'Talträning',
    webcamTitle: 'Riktig samtalsträning',
    webcamSubtitle: 'Du kan orden. Säg dem.',
    webcamContent:
      'Öva för jobb, resor och vardag. AI:n svarar, rättar och hjälper dig att prata utan paus för att översätta.',
    howSubtitle:
      'Realistiska samtal, omedelbar återkoppling och en plan som bygger på tal — inte ännu en hög med kort.',
    rolePlayTitle: 'Gör övning till samtal',
    rolePlaySubtitle: 'Intervjuer, möten, resor och samtalen du faktiskt behöver.',
    ctaTitle: 'Sluta plugga. Börja prata.',
  },
  da: {
    shareTitle: (name) => `Lær ${name} med FluencyPal`,
    headline: (name) => `Lær ${name}`,
    imageLine2: 'med FluencyPal',
    description: (name) =>
      `Lær ${name} ved at tale med AI. Rigtige samtaler, øjeblikkelige rettelser og modet til at sige det højt.`,
    heroTitle2: 'Højt, ikke glosekort.',
    heroSubtitle: 'Rigtige samtaler med AI, øjeblikkelige rettelser og modet til at sige det højt.',
    label: 'Taletræning',
    webcamTitle: 'Rigtig samtaletræning',
    webcamSubtitle: 'Du kender ordene. Sig dem.',
    webcamContent:
      'Øv dig til arbejde, rejser og hverdag. AI’en svarer, retter og hjælper dig med at tale uden pause til oversættelse.',
    howSubtitle:
      'Realistiske samtaler, øjeblikkelig feedback og en plan bygget op om tale — ikke endnu en bunke kort.',
    rolePlayTitle: 'Gør øvelse til samtale',
    rolePlaySubtitle: 'Samtaler, møder, rejser og de samtaler, du faktisk har brug for.',
    ctaTitle: 'Stop med at terpe. Begynd at tale.',
  },
  no: {
    shareTitle: (name) => `Lær ${name} med FluencyPal`,
    headline: (name) => `Lær ${name}`,
    imageLine2: 'med FluencyPal',
    description: (name) =>
      `Lær ${name} ved å snakke med AI. Ekte samtaler, umiddelbare rettinger og tryggheten til å si det høyt.`,
    heroTitle2: 'Høyt, ikke glosekort.',
    heroSubtitle: 'Ekte samtaler med AI, umiddelbare rettinger og tryggheten til å si det høyt.',
    label: 'Taletrening',
    webcamTitle: 'Ekte samtaletrening',
    webcamSubtitle: 'Du kan ordene. Si dem.',
    webcamContent:
      'Øv til jobb, reise og hverdag. AI-en svarer, retter og hjelper deg å snakke uten pause for å oversette.',
    howSubtitle:
      'Realistiske samtaler, umiddelbar tilbakemelding og en plan bygget på tale — ikke enda en bunke kort.',
    rolePlayTitle: 'Gjør øving til samtale',
    rolePlaySubtitle: 'Intervjuer, møter, reiser og samtalene du faktisk trenger.',
    ctaTitle: 'Slutt å pugge. Begynn å snakke.',
  },
  id: {
    shareTitle: (name) => `Belajar ${name} dengan FluencyPal`,
    headline: (name) => `Belajar ${name}`,
    imageLine2: 'dengan FluencyPal',
    description: (name) =>
      `Belajar ${name} dengan berbicara bersama AI. Percakapan nyata, koreksi langsung, dan keberanian mengucapkannya.`,
    heroTitle2: 'Diucapkan, bukan kartu.',
    heroSubtitle: 'Percakapan nyata dengan AI, koreksi langsung, dan keberanian mengucapkannya.',
    label: 'Latihan berbicara',
    webcamTitle: 'Latihan percakapan yang nyata',
    webcamSubtitle: 'Kata-katanya sudah ada. Sekarang ucapkan.',
    webcamContent:
      'Latihan untuk kerja, perjalanan, dan kehidupan sehari-hari. AI menjawab, mengoreksi, dan membantu Anda berbicara tanpa berhenti untuk menerjemahkan.',
    howSubtitle:
      'Percakapan yang realistis, masukan langsung, dan rencana yang dibangun dari berbicara — bukan tumpukan kartu lagi.',
    rolePlayTitle: 'Ubah latihan menjadi percakapan',
    rolePlaySubtitle:
      'Wawancara, rapat, perjalanan, dan percakapan yang benar-benar Anda butuhkan.',
    ctaTitle: 'Berhenti menghafal. Mulai berbicara.',
  },
  ms: {
    shareTitle: (name) => `Belajar ${name} dengan FluencyPal`,
    headline: (name) => `Belajar ${name}`,
    imageLine2: 'dengan FluencyPal',
    description: (name) =>
      `Belajar ${name} dengan bercakap bersama AI. Perbualan sebenar, pembetulan segera dan keyakinan untuk mengatakannya.`,
    heroTitle2: 'Disebut, bukan kad.',
    heroSubtitle:
      'Perbualan sebenar dengan AI, pembetulan segera dan keyakinan untuk mengatakannya.',
    label: 'Latihan bertutur',
    webcamTitle: 'Latihan perbualan yang sebenar',
    webcamSubtitle: 'Perkataan sudah ada. Sekarang sebutkannya.',
    webcamContent:
      'Latihan untuk kerja, perjalanan dan kehidupan harian. AI menjawab, membetulkan dan membantu anda bertutur tanpa berhenti untuk menterjemah.',
    howSubtitle:
      'Perbualan yang realistik, maklum balas segera dan pelan yang dibina pada pertuturan — bukan satu lagi timbunan kad.',
    rolePlayTitle: 'Jadikan latihan sebagai perbualan',
    rolePlaySubtitle:
      'Temu duga, mesyuarat, perjalanan dan perbualan yang anda benar-benar perlukan.',
    ctaTitle: 'Berhenti menghafal. Mula bertutur.',
  },
  tr: {
    shareTitle: (name) => `FluencyPal ile ${name} öğrenin`,
    headline: (name) => `${name} öğrenin`,
    imageLine2: 'FluencyPal ile',
    description: (name) =>
      `FluencyPal ile ${name} konuşarak öğrenin. Gerçek sohbetler, anında düzeltmeler ve yüksek sesle söyleme cesareti.`,
    heroTitle2: 'Yüksek sesle, kartlarla değil.',
    heroSubtitle:
      'Yapay zekâyla gerçek sohbetler, anında düzeltmeler ve yüksek sesle söyleme cesareti.',
    label: 'Konuşma pratiği',
    webcamTitle: 'Gerçek konuşma pratiği',
    webcamSubtitle: 'Kelimeleri biliyorsunuz. Şimdi söyleyin.',
    webcamContent:
      'İş, seyahat ve günlük hayat için pratik. Yapay zekâ yanıtlar, düzeltir ve çeviri için durmadan konuşmanıza yardım eder.',
    howSubtitle:
      'Gerçekçi konuşmalar, anında geri bildirim ve konuşmaya dayalı bir plan — bir deste kart daha değil.',
    rolePlayTitle: 'Pratiği sohbete çevirin',
    rolePlaySubtitle: 'Mülakatlar, toplantılar, seyahat ve gerçekten ihtiyacınız olan konuşmalar.',
    ctaTitle: 'Ezberlemeyi bırakın. Konuşmaya başlayın.',
  },
  vi: {
    shareTitle: (name) => `Học ${name} cùng FluencyPal`,
    headline: (name) => `Học ${name}`,
    imageLine2: 'cùng FluencyPal',
    description: (name) =>
      `Học ${name} bằng cách nói chuyện với AI. Hội thoại thật, sửa ngay và sự tự tin để nói thành tiếng.`,
    heroTitle2: 'Nói thành tiếng, không phải thẻ.',
    heroSubtitle: 'Hội thoại thật với AI, sửa ngay và sự tự tin để nói thành tiếng.',
    label: 'Luyện nói',
    webcamTitle: 'Luyện hội thoại thật',
    webcamSubtitle: 'Bạn đã biết từ. Hãy nói chúng.',
    webcamContent:
      'Luyện cho công việc, đi lại và đời thường. AI trả lời, sửa và giúp bạn nói mà không dừng để dịch.',
    howSubtitle:
      'Hội thoại sát thực tế, phản hồi ngay và một lộ trình xây trên việc nói — không phải thêm một chồng thẻ.',
    rolePlayTitle: 'Biến bài luyện thành hội thoại',
    rolePlaySubtitle: 'Phỏng vấn, cuộc họp, đi lại và những cuộc nói chuyện bạn thực sự cần.',
    ctaTitle: 'Đừng chỉ học. Hãy bắt đầu nói.',
  },
  th: {
    shareTitle: (name) => `เรียน${name}กับ FluencyPal`,
    headline: (name) => `เรียน${name}`,
    imageLine2: 'กับ FluencyPal',
    description: (name) =>
      `เรียน${name}ด้วยการพูดกับ AI บทสนทนาจริง การแก้ไขทันที และความมั่นใจที่จะพูดออกเสียง`,
    heroTitle2: 'พูดออกเสียง ไม่ใช่แฟลชการ์ด',
    heroSubtitle: 'บทสนทนาจริงกับ AI การแก้ไขทันที และความมั่นใจที่จะพูดออกเสียง',
    label: 'ฝึกพูด',
    webcamTitle: 'ฝึกสนทนาจริง',
    webcamSubtitle: 'คุณรู้คำศัพท์แล้ว ตอนนี้พูดมัน',
    webcamContent:
      'ฝึกสำหรับงาน การเดินทาง และชีวิตประจำวัน AI ตอบ แก้ไข และช่วยให้คุณพูดโดยไม่ต้องหยุดแปล',
    howSubtitle: 'บทสนทนาสมจริง ข้อเสนอแนะทันที และแผนที่สร้างจากการพูด ไม่ใช่การ์ดอีกกอง',
    rolePlayTitle: 'เปลี่ยนการฝึกให้เป็นการสนทนา',
    rolePlaySubtitle: 'สัมภาษณ์งาน ประชุม เดินทาง และบทสนทนาที่คุณต้องการจริงๆ',
    ctaTitle: 'เลิกท่อง เริ่มพูด',
  },
  ar: {
    shareTitle: (name) => `تعلّم ${name} مع FluencyPal`,
    headline: (name) => `تعلّم ${name}`,
    imageLine2: 'مع FluencyPal',
    description: (name) =>
      `تعلّم ${name} بالتحدّث مع الذكاء الاصطناعي. محادثات حقيقية وتصحيح فوري والثقة لتقوله بصوت عالٍ.`,
    heroTitle2: 'بصوت عالٍ، لا بالبطاقات.',
    heroSubtitle: 'محادثات حقيقية مع الذكاء الاصطناعي، وتصحيح فوري، والثقة لتقوله بصوت عالٍ.',
    label: 'تدريب على التحدّث',
    webcamTitle: 'تدريب على محادثة حقيقية',
    webcamSubtitle: 'الكلمات عندك. الآن قُلها.',
    webcamContent:
      'تدريب للعمل والسفر والحياة اليومية. يجيب الذكاء الاصطناعي ويصحّح ويساعدك على الكلام من غير توقّف للترجمة.',
    howSubtitle: 'محادثات واقعية وملاحظات فورية وخطة مبنية على الكلام، لا على رزمة بطاقات جديدة.',
    rolePlayTitle: 'حوّل التدريب إلى محادثة',
    rolePlaySubtitle: 'مقابلات واجتماعات وسفر والمحادثات التي تحتاجها فعلًا.',
    ctaTitle: 'توقّف عن الحفظ. ابدأ الكلام.',
  },
  ja: {
    shareTitle: (name) => `FluencyPalで${name}を学ぼう`,
    headline: (name) => `${name}を学ぼう`,
    imageLine2: 'FluencyPalで',
    description: (name) =>
      `FluencyPalで${name}を会話で学ぶ。本物の対話、その場の訂正、声に出す自信。`,
    heroTitle2: '声に出す。カードではない。',
    heroSubtitle: 'AIとの本物の会話。その場で直して、声に出す自信がつく。',
    label: '会話の練習',
    webcamTitle: '本物の会話練習',
    webcamSubtitle: '単語は知っている。今度は言う。',
    webcamContent: '仕事、旅行、日常のための練習。AIが答え、直し、翻訳で止まらず話すのを助けます。',
    howSubtitle:
      'リアルな会話、すぐのフィードバック、話すことを軸にしたプラン。カードの山ではありません。',
    rolePlayTitle: '練習を会話に変える',
    rolePlaySubtitle: '面接、会議、旅行、そして本当に必要な会話。',
    ctaTitle: '暗記をやめて、話し始めよう。',
  },
  ko: {
    shareTitle: (name) => `FluencyPal과 함께 ${name}를 배우세요`,
    headline: (name) => `${name}를 배우세요`,
    imageLine2: 'FluencyPal과 함께',
    description: (name) =>
      `FluencyPal과 함께 ${name}를 말하면서 배우세요. 실제 대화, 즉시 교정, 소리 내어 말할 자신감.`,
    heroTitle2: '소리 내어, 카드가 아니라.',
    heroSubtitle: 'AI와 실제 대화하고, 바로 고치고, 소리 내어 말할 자신감을 키우세요.',
    label: '말하기 연습',
    webcamTitle: '실제 대화 연습',
    webcamSubtitle: '단어는 이미 압니다. 이제 말하세요.',
    webcamContent:
      '일, 여행, 일상을 위한 연습. AI가 대답하고 고쳐 주며, 번역하려 멈추지 않고 말하도록 돕습니다.',
    howSubtitle: '현실적인 대화, 즉각적인 피드백, 말하기를 중심으로 한 계획. 카드 더미가 아닙니다.',
    rolePlayTitle: '연습을 대화로 바꾸세요',
    rolePlaySubtitle: '면접, 회의, 여행, 그리고 정말 필요한 대화.',
    ctaTitle: '암기를 멈추고 말하기 시작하세요.',
  },
  zh: {
    shareTitle: (name) => `用 FluencyPal 学习${name}`,
    headline: (name) => `学习${name}`,
    imageLine2: '用 FluencyPal',
    description: (name) =>
      `用 FluencyPal 开口学${name}。真实对话、当场纠正，以及把话说出来的信心。`,
    heroTitle2: '说出来，而不是背卡片。',
    heroSubtitle: '和 AI 进行真实对话，立刻得到纠正，并敢于把话说出来。',
    label: '口语练习',
    webcamTitle: '真实对话练习',
    webcamSubtitle: '单词你已经认识。现在说出来。',
    webcamContent: '为工作、旅行和日常生活练习。AI 会回应、纠正，并帮你说话时不必停下来翻译。',
    howSubtitle: '贴近真实的对话、即时反馈，以及围绕开口说而制定的计划，而不是又一叠卡片。',
    rolePlayTitle: '把练习变成对话',
    rolePlaySubtitle: '面试、会议、旅行，以及你真正需要的那些对话。',
    ctaTitle: '别再死记。开始说。',
  },
  sr: {
    shareTitle: (name) => `Учи ${name} са FluencyPal`,
    headline: (name) => `Учи ${name}`,
    imageLine2: 'са FluencyPal',
    description: (name) =>
      `Учи ${name} у разговору са вештачком интелигенцијом. Жива пракса, тренутне исправке и сигурност да говорите наглас.`,
    heroTitle2: 'Наглас, а не картице.',
    heroSubtitle:
      'Живи разговори са вештачком интелигенцијом, тренутне исправке и сигурност да то кажете наглас.',
    label: 'Говорна пракса',
    webcamTitle: 'Права говорна пракса',
    webcamSubtitle: 'Речи већ постоје. Сад их изговорите.',
    webcamContent:
      'Пракса за посао, путовања и свакодневни живот. Вештачка интелигенција одговара, исправља и помаже да говорите без паузе за превод.',
    howSubtitle:
      'Живи дијалози, тренутна повратна информација и план који се гради на говору, а не на још једном шпилу картица.',
    rolePlayTitle: 'Претворите праксу у разговор',
    rolePlaySubtitle: 'Интервјуи, састанци, путовања и разговори који вам заиста требају.',
    ctaTitle: 'Доста учења. Почните да говорите.',
  },
};
