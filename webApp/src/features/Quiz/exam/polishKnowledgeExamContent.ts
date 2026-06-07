import {
  ExamGrammarItem,
  ExamListeningItem,
  ExamReadingPassage,
} from './examContentTypes';
import {
  POLISH_GRAMMAR_A2,
  POLISH_GRAMMAR_B1,
  POLISH_GRAMMAR_B2,
  POLISH_LISTENING_ITEMS,
  POLISH_READING_PASSAGES,
} from './polishExamContent';

export const POLISH_KNOWLEDGE_EXTRA_READING: ExamReadingPassage[] = [
  {
    passageText:
      'W ubiegłym roku miasto zainwestowało w nową ścieżkę rowerową wzdłuż rzeki. Mieszkańcy chwalą bezpieczniejszy dojazd do centrum, choć część kierowców narzeka, że przy głównej ulicy jest mniej miejsc parkingowych.',
    questions: [
      {
        questionText: 'Co mieszkańcy uważają za zaletę inwestycji?',
        choices: [
          { label: 'Więcej miejsc parkingowych' },
          { label: 'Bezpieczniejszy dojazd do centrum', correct: true },
          { label: 'Szybszy ruch samochodowy' },
          { label: 'Zamknięcie ścieżki zimą' },
        ],
      },
      {
        questionText: 'Jaki problem zgłaszają niektórzy kierowcy?',
        choices: [
          { label: 'Brak ścieżki rowerowej' },
          { label: 'Mniej miejsc parkingowych', correct: true },
          { label: 'Wyższe mandaty' },
          { label: 'Zamknięcie centrum' },
        ],
      },
    ],
  },
  {
    passageText:
      'Biblioteka miejska przedłużyła godziny otwarcia do 21:00 od poniedziałku do czwartku. W piątki pozostaje otwarta do 19:00, a w weekendy do 17:00. Czytelnicy mogą też rezerwować książki online i odebrać je przy ladzie bez czekania w kolejce.',
    questions: [
      {
        questionText: 'Do której godziny biblioteka jest otwarta w czwartek?',
        choices: [
          { label: 'Do 17:00' },
          { label: 'Do 19:00' },
          { label: 'Do 21:00', correct: true },
          { label: 'Do północy' },
        ],
      },
      {
        questionText: 'Co można zrobić online według tekstu?',
        choices: [
          { label: 'Zarezerwować książki', correct: true },
          { label: 'Wypożyczyć e-book bez limitu' },
          { label: 'Umówić się na wykład' },
          { label: 'Zapłacić mandat' },
        ],
      },
    ],
  },
  {
    passageText:
      'Lokalny festiwal filmowy zapowiedział program z 40 seansami, w tym pokazami debiutów reżyserów z Polski i Czech. Bilety na otwarcie wyprzedały się w jeden dzień, dlatego organizatorzy dodali drugi termin dla mieszkańców regionu.',
    questions: [
      {
        questionText: 'Ile seansów zaplanowano na festiwalu?',
        choices: [
          { label: '20' },
          { label: '30' },
          { label: '40', correct: true },
          { label: '60' },
        ],
      },
      {
        questionText: 'Dlaczego dodano drugi termin otwarcia?',
        choices: [
          { label: 'Bilety szybko się wyprzedały', correct: true },
          { label: 'Odwołano część filmów' },
          { label: 'Zmieniono lokalizację' },
          { label: 'Brakowało tłumaczy' },
        ],
      },
    ],
  },
  {
    passageText:
      'Zespół badawczy porównał dwie metody nauki słownictwa: fiszki papierowe i aplikację z powtórkami rozłożonymi w czasie. Po ośmiu tygodniach uczestnicy korzystający z aplikacji pamiętali średnio o 18% więcej słów, ale deklarowali też większe zmęczenie ekranowe.',
    questions: [
      {
        questionText: 'Jaki był wynik badania po ośmiu tygodniach?',
        choices: [
          { label: 'Fiszki papierowe okazały się skuteczniejsze' },
          { label: 'Aplikacja dała lepsze wyniki pamięciowe', correct: true },
          { label: 'Obie metody dały identyczny wynik' },
          { label: 'Badanie zostało przerwane' },
        ],
      },
      {
        questionText: 'Co zgłaszali użytkownicy aplikacji?',
        choices: [
          { label: 'Brak postępów' },
          { label: 'Większe zmęczenie ekranowe', correct: true },
          { label: 'Problemy z logowaniem' },
          { label: 'Brak motywacji' },
        ],
      },
    ],
  },
];

export const POLISH_KNOWLEDGE_EXTRA_LISTENING: ExamListeningItem[] = [
  {
    audioText:
      'Przypominamy, że jutrzejsze zajęcia z języka polskiego odbędą się online o 17:30. Link do lekcji znajdziecie w wiadomości e-mail wysłanej rano.',
    questionText: 'O której godzinie są jutrzejsze zajęcia?',
    choices: [
      { label: 'O 16:00' },
      { label: 'O 17:30', correct: true },
      { label: 'O 19:00' },
      { label: 'O 20:30' },
    ],
  },
  {
    audioText:
      'W związku z remontem windy prosimy osoby z wózkami inwalidzkimi o korzystanie z wejścia od strony parkingu B do piątku włącznie.',
    questionText: 'Do kogo jest skierowany komunikat?',
    choices: [
      { label: 'Do wszystkich pracowników biura' },
      { label: 'Do osób korzystających z wózków inwalidzkich', correct: true },
      { label: 'Do klientów sklepu na parterze' },
      { label: 'Do dostawców jedzenia' },
    ],
  },
  {
    audioText:
      'Prognoza na weekend zapowiada umiarkowane opady w sobotę i pogodne niebo w niedzielę, dlatego organizatorzy przenieśli piknik rodzinny na niedzielę po południu.',
    questionText: 'Kiedy odbędzie się piknik rodzinny?',
    choices: [
      { label: 'W sobotę rano' },
      { label: 'W sobotę wieczorem' },
      { label: 'W niedzielę po południu', correct: true },
      { label: 'W poniedziałek' },
    ],
  },
  {
    audioText:
      'Aby odebrać paczkę z automatu, wpisz kod z wiadomości SMS i potwierdź zielonym przyciskiem. Masz na to trzydzieści minut od momentu dostarczenia przesyłki.',
    questionText: 'Ile czasu ma odbiorca na odebranie paczki?',
    choices: [
      { label: 'Pięć minut' },
      { label: 'Piętnaście minut' },
      { label: 'Trzydzieści minut', correct: true },
      { label: 'Dwie godziny' },
    ],
  },
  {
    audioText:
      'Choć firma zwiększyła budżet marketingowy, sprzedaż w segmencie premium spadła, ponieważ konkurencja wprowadziła tańszą wersję produktu z podobnymi funkcjami.',
    questionText: 'Dlaczego spadła sprzedaż w segmencie premium?',
    choices: [
      { label: 'Brakowało pracowników magazynu' },
      { label: 'Konkurencja wprowadziła tańszą alternatywę', correct: true },
      { label: 'Produkt został wycofany' },
      { label: 'Sklep był zamknięty' },
    ],
  },
];

export const POLISH_KNOWLEDGE_READING: ExamReadingPassage[] = [
  ...POLISH_READING_PASSAGES,
  ...POLISH_KNOWLEDGE_EXTRA_READING,
];

export const POLISH_KNOWLEDGE_LISTENING: ExamListeningItem[] = [
  ...POLISH_LISTENING_ITEMS,
  ...POLISH_KNOWLEDGE_EXTRA_LISTENING,
];

export const POLISH_KNOWLEDGE_GRAMMAR: ExamGrammarItem[] = [
  ...POLISH_GRAMMAR_A2,
  ...POLISH_GRAMMAR_B1.slice(2),
  ...POLISH_GRAMMAR_B2.slice(POLISH_GRAMMAR_B1.length),
];

export const POLISH_KNOWLEDGE_EXAM_COUNTS = {
  reading: 16,
  listening: 13,
  grammar: 18,
  speaking: 5,
} as const;

export const POLISH_KNOWLEDGE_EXAM_ESTIMATED_MINUTES = 120;
