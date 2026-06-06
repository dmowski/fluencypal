import { ExamCefrLevel } from './examLevelConfig';
import {
  ExamGrammarItem,
  ExamListeningItem,
  ExamReadingPassage,
} from './examContentTypes';

export const POLISH_READING_PASSAGES: ExamReadingPassage[] = [
  {
    passageText:
      'Kawiarnia „Zielona Herbata” otwiera się o ósmej rano i zamyka o dziesiątej wieczorem. W menu są kawy, herbaty i domowe ciasta. W soboty często grają tam lekka muzyka, a stoliki na tarasie szybko się zapełniają.',
    questions: [
      {
        questionText: 'O której godzinie kawiarnia zamyka się wieczorem?',
        choices: [
          { label: 'O ósmej' },
          { label: 'O dziesiątej', correct: true },
          { label: 'O północy' },
          { label: 'O szóstej' },
        ],
      },
      {
        questionText: 'Co można przeczytać o sobotach?',
        choices: [
          { label: 'Kawiarnia jest zamknięta' },
          { label: 'Często gra tam muzyka', correct: true },
          { label: 'Nie ma ciast' },
          { label: 'Taras jest niedostępny' },
        ],
      },
    ],
  },
  {
    passageText:
      'Autobus numer 12 odjeżdża z przystanku „Ratusz” co piętnaście minut w dni robocze. Bilet jednorazowy kosztuje cztery złote, a bilet dobowy dwanaście złotych. Nocny kurs kursuje tylko w piątki i soboty.',
    questions: [
      {
        questionText: 'Jak często odjeżdża autobus 12 w dni robocze?',
        choices: [
          { label: 'Co godzinę' },
          { label: 'Co piętnaście minut', correct: true },
          { label: 'Co trzy minuty' },
          { label: 'Tylko rano' },
        ],
      },
      {
        questionText: 'Kiedy kursuje nocny autobus?',
        choices: [
          { label: 'Codziennie' },
          { label: 'Tylko w niedzielę' },
          { label: 'W piątki i soboty', correct: true },
          { label: 'W święta państwowe' },
        ],
      },
    ],
  },
  {
    passageText:
      'Ania zaprosiła kolegów na urodziny do swojego mieszkania w sobotę o 18:00. Poprosiła, żeby każdy przyniósł przekąskę. Jej siostra pomoże dekorować salon, a playlistę przygotuje Tomek.',
    questions: [
      {
        questionText: 'Kiedy odbędą się urodziny?',
        choices: [
          { label: 'W piątek rano' },
          { label: 'W sobotę o 18:00', correct: true },
          { label: 'W niedzielę o południu' },
          { label: 'W poniedziałek wieczorem' },
        ],
      },
      {
        questionText: 'Co mają zrobić goście?',
        choices: [
          { label: 'Przynieść przekąskę', correct: true },
          { label: 'Kupić tort' },
          { label: 'Przygotować playlistę' },
          { label: 'Zadzwonić do siostry Ani' },
        ],
      },
    ],
  },
  {
    passageText:
      'Coraz więcej firm pozwala pracownikom pracować zdalnie przez część tygodnia. Zwolennicy mówią, że oszczędza to czas na dojazdy i ułatwia łączenie pracy z życiem rodzinnym. Przeciwnicy obawiają się, że zespół traci kontakt i szybciej pojawiają się nieporozumienia.',
    questions: [
      {
        questionText: 'Jaki argument podają zwolennicy pracy zdalnej?',
        choices: [
          { label: 'Zawsze podnosi pensje' },
          { label: 'Oszczędza czas na dojazdy', correct: true },
          { label: 'Eliminuje spotkania' },
          { label: 'Zamyka biura na stałe' },
        ],
      },
      {
        questionText: 'Czego obawiają się przeciwnicy?',
        choices: [
          { label: 'Braku kontaktu w zespole', correct: true },
          { label: 'Zbyt wielu urlopów' },
          { label: 'Braku komputerów' },
          { label: 'Zbyt niskich kosztów' },
        ],
      },
    ],
  },
];

export const POLISH_LISTENING_ITEMS: ExamListeningItem[] = [
  {
    audioText:
      'Pociąg do Krakowa odjeżdża z peronu trzeciego za dwanaście minut. Prosimy pasażerów z dużym bagażem o skorzystanie z windy obok kasy biletowej.',
    questionText: 'Skąd odjeżdża pociąg do Krakowa?',
    choices: [
      { label: 'Z peronu pierwszego' },
      { label: 'Z peronu trzeciego', correct: true },
      { label: 'Z peronu piątego' },
      { label: 'Z dworca autobusowego' },
    ],
  },
  {
    audioText:
      'Dziękujemy za telefon do ubezpieczalni Zielony Liść. W sprawach pilnych szkód wybierz dwa, aby połączyć się z doradcą.',
    questionText: 'Jak połączyć się z doradcą w pilnej sprawie?',
    choices: [
      { label: 'Oddzwonić w sobotę rano' },
      { label: 'Wybrać dwa podczas rozmowy', correct: true },
      { label: 'Wysłać list' },
      { label: 'Przyjść bez umówienia' },
    ],
  },
  {
    audioText:
      'Zanim zaczniemy spotkanie, proszę wyciszyć telefony i zgłosić ewentualny konflikt interesów dotyczący umowy.',
    questionText: 'O co proszą uczestników przed spotkaniem?',
    choices: [
      { label: 'O natychmiastowy podpis umowy' },
      { label: 'O wyciszenie telefonów i zgłoszenie konfliktu interesów', correct: true },
      { label: 'O pozostawienie laptopów poza salą' },
      { label: 'O nagranie rozmowy' },
    ],
  },
  {
    audioText:
      'Z powodu silnego wiatru koncert na świeżym powietrzu przeniesiono do hali miejskiej przy ulicy Królewskiej. Bilety zachowują ważność.',
    questionText: 'Dlaczego przeniesiono koncert?',
    choices: [
      { label: 'Zespół odwołał występ' },
      { label: 'Silny wiatr uniemożliwił bezpieczny koncert na zewnątrz', correct: true },
      { label: 'Sprzedano za dużo biletów' },
      { label: 'Hala była tańsza' },
    ],
  },
  {
    audioText:
      'Badacze zauważyli, że osoby śpiące siedem do ośmiu godzin lepiej radziły sobie w testach pamięci niż osoby śpiące krócej niż sześć godzin.',
    questionText: 'Co wynika z badania o śnie?',
    choices: [
      { label: 'Krótki sen poprawia pamięć' },
      { label: 'Siedem do ośmiu godzin snu wspiera pamięć', correct: true },
      { label: 'Sen nie ma znaczenia' },
      { label: 'Dotyczy tylko nastolatków' },
    ],
  },
  {
    audioText:
      'Aby zwrócić produkt, przynieś paragon i opakowanie w ciągu trzydziestu dni. Zwrot trafia na pierwotną metodę płatności.',
    questionText: 'Co trzeba mieć przy zwrocie produktu?',
    choices: [
      { label: 'Tylko pudełko' },
      { label: 'Paragon i opakowanie', correct: true },
      { label: 'Notatkę od managera' },
      { label: 'Nową kartę płatniczą' },
    ],
  },
  {
    audioText:
      'Nowa wystawa w muzeum pokazuje, jak migracje wpłynęły na współczesną kuchnię, prezentując przepisy i historie z czterech kontynentów.',
    questionText: 'Czego dotyczy wystawa?',
    choices: [
      { label: 'Starożytnych narzędzi rolniczych' },
      { label: 'Wpływu migracji na współczesną kuchnię', correct: true },
      { label: 'Sportów tradycyjnych' },
      { label: 'Recenzji restauracji' },
    ],
  },
  {
    audioText:
      'Choć przychody startupu wzrosły w ostatnim kwartale, wyższe koszty dostaw sprawiły, że zysk spadł o osiem procent w porównaniu z rokiem poprzednim.',
    questionText: 'Co stało się ze zyskiem startupu?',
    choices: [
      { label: 'Wzrósł razem z przychodami' },
      { label: 'Spadł o osiem procent mimo wyższych przychodów', correct: true },
      { label: 'Pozostał bez zmian' },
      { label: 'Podwoił się w kwartale' },
    ],
  },
];

export const POLISH_GRAMMAR_A2: ExamGrammarItem[] = [
  {
    segments: [
      { kind: 'text', text: 'Wczoraj wieczorem ' },
      { kind: 'gap', gapId: 'g1' },
      { kind: 'text', text: ' do kina z przyjaciółmi.' },
    ],
    gaps: {
      g1: [
        { label: 'idę' },
        { label: 'poszedłem', correct: true },
        { label: 'pójdę' },
        { label: 'chodzę' },
      ],
    },
  },
  {
    segments: [
      { kind: 'text', text: 'To ' },
      { kind: 'gap', gapId: 'g1' },
      { kind: 'text', text: ' moja siostra, nie mój brat.' },
    ],
    gaps: {
      g1: [
        { label: 'są' },
        { label: 'jest', correct: true },
        { label: 'będzie' },
        { label: 'były' },
      ],
    },
  },
  {
    segments: [
      { kind: 'text', text: 'Chcę ' },
      { kind: 'gap', gapId: 'g1' },
      { kind: 'text', text: ' herbatę, nie kawę.' },
    ],
    gaps: {
      g1: [
        { label: 'pić' },
        { label: 'wypić', correct: true },
        { label: 'piję' },
        { label: 'wypiję' },
      ],
    },
  },
  {
    segments: [
      { kind: 'text', text: 'Ona ' },
      { kind: 'gap', gapId: 'g1' },
      { kind: 'text', text: ' w Krakowie od pięciu lat.' },
    ],
    gaps: {
      g1: [
        { label: 'mieszka', correct: true },
        { label: 'mieszkać' },
        { label: 'mieszkał' },
        { label: 'mieszkać będzie' },
      ],
    },
  },
  {
    segments: [
      { kind: 'text', text: 'Nie ' },
      { kind: 'gap', gapId: 'g1' },
      { kind: 'text', text: ' jeszcze śniadania.' },
    ],
    gaps: {
      g1: [
        { label: 'jadłem', correct: true },
        { label: 'jem' },
        { label: 'zjem' },
        { label: 'jeść' },
      ],
    },
  },
  {
    segments: [
      { kind: 'text', text: 'Gdzie ' },
      { kind: 'gap', gapId: 'g1' },
      { kind: 'text', text: ' moje klucze?' },
    ],
    gaps: {
      g1: [
        { label: 'jest' },
        { label: 'są', correct: true },
        { label: 'będzie' },
        { label: 'był' },
      ],
    },
  },
  {
    segments: [
      { kind: 'text', text: 'To jest ' },
      { kind: 'gap', gapId: 'g1' },
      { kind: 'text', text: ' dom.' },
    ],
    gaps: {
      g1: [
        { label: 'duży' },
        { label: 'dużego', correct: true },
        { label: 'duzi' },
        { label: 'duże' },
      ],
    },
  },
  {
    segments: [
      { kind: 'text', text: 'Zawsze ' },
      { kind: 'gap', gapId: 'g1' },
      { kind: 'text', text: ' rower do pracy w ciepłe dni.' },
    ],
    gaps: {
      g1: [
        { label: 'jadę', correct: true },
        { label: 'jechałem' },
        { label: 'pojadę' },
        { label: 'jeżdżę' },
      ],
    },
  },
];

export const POLISH_GRAMMAR_B1: ExamGrammarItem[] = [
  ...POLISH_GRAMMAR_A2.slice(0, 2),
  {
    segments: [
      { kind: 'text', text: 'Gdybym ' },
      { kind: 'gap', gapId: 'g1' },
      { kind: 'text', text: ' więcej czasu, pojechałbym nad morze.' },
    ],
    gaps: {
      g1: [
        { label: 'mam' },
        { label: 'miałem', correct: true },
        { label: 'będę miał' },
        { label: 'miałbym' },
      ],
    },
  },
  {
    segments: [
      { kind: 'text', text: 'Film, ' },
      { kind: 'gap', gapId: 'g1' },
      { kind: 'text', text: ' widzieliśmy wczoraj, był naprawdę dobry.' },
    ],
    gaps: {
      g1: [
        { label: 'który', correct: true },
        { label: 'kto' },
        { label: 'gdzie' },
        { label: 'którego' },
      ],
    },
  },
  {
    segments: [
      { kind: 'text', text: 'Kiedy przyjechałem, ona już ' },
      { kind: 'gap', gapId: 'g1' },
      { kind: 'text', text: ' obiad.' },
    ],
    gaps: {
      g1: [
        { label: 'gotuje' },
        { label: 'ugotowała', correct: true },
        { label: 'gotowała' },
        { label: 'ugotuje' },
      ],
    },
  },
  {
    segments: [
      { kind: 'text', text: 'Musimy ' },
      { kind: 'gap', gapId: 'g1' },
      { kind: 'text', text: ' raport do piątku.' },
    ],
    gaps: {
      g1: [
        { label: 'skończyć', correct: true },
        { label: 'kończyć' },
        { label: 'skończyli' },
        { label: 'kończy' },
      ],
    },
  },
  {
    segments: [
      { kind: 'text', text: 'Nie sądzę, żeby on ' },
      { kind: 'gap', gapId: 'g1' },
      { kind: 'text', text: ' już tę wiadomość.' },
    ],
    gaps: {
      g1: [
        { label: 'zna', correct: true },
        { label: 'znał' },
        { label: 'będzie znał' },
        { label: 'znać' },
      ],
    },
  },
  {
    segments: [
      { kind: 'text', text: 'To zadanie jest ' },
      { kind: 'gap', gapId: 'g1' },
      { kind: 'text', text: ' trudne niż poprzednie.' },
    ],
    gaps: {
      g1: [
        { label: 'bardziej', correct: true },
        { label: 'najbardziej' },
        { label: 'dużo' },
        { label: 'tak' },
      ],
    },
  },
  {
    segments: [
      { kind: 'text', text: 'Zanim wyszedłem, ' },
      { kind: 'gap', gapId: 'g1' },
      { kind: 'text', text: ' okna.' },
    ],
    gaps: {
      g1: [
        { label: 'zamknąłem', correct: true },
        { label: 'zamykam' },
        { label: 'zamknę' },
        { label: 'zamykałem' },
      ],
    },
  },
];

export const POLISH_GRAMMAR_B2: ExamGrammarItem[] = [
  ...POLISH_GRAMMAR_B1,
  {
    segments: [
      { kind: 'text', text: 'Gdyby komisja ' },
      { kind: 'gap', gapId: 'g1' },
      { kind: 'text', text: ' wniosek wczoraj, dziś przygotowywalibyśmy start.' },
    ],
    gaps: {
      g1: [
        { label: 'zatwierdza' },
        { label: 'zatwierdziła', correct: true },
        { label: 'zatwierdzi' },
        { label: 'zatwierdzała' },
      ],
    },
  },
  {
    segments: [
      { kind: 'text', text: 'Raport, ' },
      { kind: 'gap', gapId: 'g1' },
      { kind: 'text', text: ' opublikowano w zeszłym miesiącu, już wpłynął na decyzje lokalne.' },
    ],
    gaps: {
      g1: [
        { label: 'który' },
        { label: 'jaki' },
        { label: 'który został', correct: true },
        { label: 'gdzie' },
      ],
    },
  },
  {
    segments: [
      { kind: 'text', text: 'Projekt udałby się ' },
      { kind: 'gap', gapId: 'g1' },
      { kind: 'text', text: ' lepszej komunikacji między zespołami.' },
    ],
    gaps: {
      g1: [
        { label: 'przy', correct: true },
        { label: 'bez' },
        { label: 'mimo' },
        { label: 'pod' },
      ],
    },
  },
];

export const getPolishGrammarContent = (level: ExamCefrLevel): ExamGrammarItem[] => {
  if (level === 'a2') return POLISH_GRAMMAR_A2;
  if (level === 'b1') return POLISH_GRAMMAR_B1;
  return POLISH_GRAMMAR_B2;
};
