import { WritingTaskGenre } from '../../types';
import {
  ExamGrammarItem,
  ExamListeningItem,
  ExamReadingPassage,
  ExamSpeakingImage,
} from '../examContentTypes';

export interface StatePolishB1WritingTask {
  promptText: string;
  minWords: number;
  maxWords: number;
  taskGenre: WritingTaskGenre;
  imageUrl?: string;
  imageDescription?: string;
}

export interface StatePolishB1PilotContent {
  listening: ExamListeningItem[];
  reading: ExamReadingPassage[];
  grammar: ExamGrammarItem[];
  writing: StatePolishB1WritingTask[];
  speaking: ExamSpeakingImage[];
}

const SHARED_IMAGES = {
  market:
    'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1780824634502-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.webp',
  cooking:
    'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1780824624093-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.webp',
  tourists:
    'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1780824586105-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.webp',
} as const;

export const PILOT_V01_CONTENT: StatePolishB1PilotContent = {
  listening: [
    {
      audioText:
        'Dzień dobry, proszę Panią, czy mogę prosić o bilet normalny do centrum? Oczywiście, to będzie sześć złotych. Proszę, tu jest reszta. Dziękuję, miłego dnia.',
      questionText: 'Ta wypowiedź jest typowa:',
      choices: [
        { label: 'w kasie biletowej', correct: true },
        { label: 'w aptece' },
        { label: 'w urzędzie miasta' },
      ],
      maxScore: 6,
    },
    {
      audioText:
        '— Przepraszam, czy ten sweter jest jeszcze dostępny w rozmiarze M?\n— Tak, mamy ostatni egzemplarz na półce z tyłu. Chętnie panu pomożemy.\n— Świetnie, poproszę.',
      questionText: 'Z tego dialogu wynika, że klient:',
      choices: [
        { label: 'rezygnuje z zakupu' },
        { label: 'dostanie pomoc w sklepie', correct: true },
        { label: 'zwraca sweter' },
      ],
      maxScore: 6,
    },
    {
      audioText:
        'Dziś rozmawiamy z Anią, która od trzech lat uczy się polskiego online. Ania mówi, że najtrudniejsze są dla niej przypadki, ale regularna rozmowa z lektorem bardzo pomaga. W weekendy czyta proste artykuły i ogląda filmy z napisami.',
      questionText: 'Z wywiadu wynika, że Ania:',
      choices: [
        { label: 'nie lubi uczyć się polskiego' },
        { label: 'korzysta z różnych form nauki', correct: true },
        { label: 'uczy się tylko z książek' },
      ],
      maxScore: 6,
    },
    {
      audioText:
        'W małym mieszkaniu warto wybierać meble wielofunkcyjne. Sofa z pojemnikiem na pościel oszczędza miejsce. Lustro na ścianie optycznie powiększa pokój. Rośliny dodają przytulności, ale nie powinny zajmować całej parapetu.',
      questionText: 'Zdanie: „Lustro na ścianie optycznie powiększa pokój.” — zgodne z tekstem?',
      choices: [
        { label: 'TAK', correct: true },
        { label: 'NIE' },
      ],
      maxScore: 6,
    },
    {
      audioText:
        'Osoba 1: Nauczycielka zawsze zachęcała nas do mówienia, nawet gdy robiliśmy błędy.\nOsoba 2: Dzięki mojemu profesorowi wybrałem studia filologiczne.\nOsoba 3: Pani od historii miała ogromną wiedzę i ciekawie opowiadała.\nOsoba 4: Po emeryturze wciąż uczę się języków obcych.',
      questionText: 'Kto dzięki nauczycielowi podjął decyzję o studiach?',
      choices: [
        { label: 'Osoba 1' },
        { label: 'Osoba 2', correct: true },
        { label: 'Osoba 3' },
        { label: 'Osoba 4' },
      ],
      maxScore: 6,
    },
  ],
  reading: [
    {
      passageText:
        'Biblioteka miejska „Pod Dębem” od poniedziałku do piątku jest otwarta od 9:00 do 19:00. W soboty czytelnicy mogą korzystać z księgozbioru do 14:00. Od kwietnia biblioteka organizuje bezpłatne warsztaty dla dorosłych uczących się polskiego.',
      questions: [
        {
          questionText: 'Z tekstu wynika, że:',
          choices: [
            { label: 'w soboty biblioteka jest zamknięta' },
            { label: 'w kwietniu startują warsztaty językowe', correct: true },
            { label: 'warsztaty są płatne' },
          ],
          maxScore: 6,
        },
      ],
    },
    {
      passageText:
        'W zeszłym tygodniu w Krakowie odbył się festiwal street food. Organizatorzy zapewnili strefę dla wegetarian i punkt z napojami bez cukru. Wstęp był wolny, ale każdy musiał zabrać własny kubek wielorazowy.',
      questions: [
        {
          questionText: 'Z tekstu wynika, że uczestnicy:',
          choices: [
            { label: 'musieli kupić bilet' },
            { label: 'mogli skorzystać ze strefy wegetariańskiej', correct: true },
            { label: 'dostawali plastikowe kubki' },
          ],
          maxScore: 6,
        },
      ],
    },
    {
      passageText:
        'Coraz więcej firm w Polsce wprowadza pracę zdalną dwa razy w tygodniu. Pracownicy doceniają brak dojazdów, ale część menedżerów obawia się mniejszej integracji zespołu. Eksperci radzą łączyć spotkania online z comiesięcznymi spotkaniami na żywo.',
      questions: [
        {
          questionText: 'Z tekstu wynika, że:',
          choices: [
            { label: 'wszyscy menedżerowie są przeciw pracy zdalnej' },
            { label: 'eksperci proponują mieszany model pracy', correct: true },
            { label: 'praca zdalna jest zakazana' },
          ],
          maxScore: 6,
        },
      ],
    },
    {
      passageText:
        'Psy domowe potrzebują codziennego ruchu i kontaktu z opiekunem. Spacer minimum trzy razy dziennie poprawia ich samopoczucie. W upalne dni lepiej wychodzić rano lub wieczorem. Regularne wizyty u weterynarza pomagają wcześnie wykryć problemy zdrowotne.',
      questions: [
        {
          questionText: 'Zdanie: „W upalne dni spacer najlepiej odbywać w południe.” — zgodne z tekstem?',
          choices: [
            { label: 'TAK' },
            { label: 'NIE', correct: true },
          ],
          maxScore: 6,
        },
      ],
    },
    {
      passageText:
        'Muzeum Sztuki Nowoczesnej w Łodzi przygotowało wystawę młodych artystów z całej Polski. Ekspozycja potrwa do końca maja. W każdą niedzielę o 12:00 odbędą się bezpłatne oprowadzania z przewodnikiem. Bilety można kupić online lub w kasie muzeum.',
      questions: [
        {
          questionText: 'Z tekstu wynika, że:',
          choices: [
            { label: 'wystawa kończy się w maju', correct: true },
            { label: 'oprowadzania są płatne' },
            { label: 'bilet można kupić tylko online' },
          ],
          maxScore: 6,
        },
      ],
    },
  ],
  grammar: [
    {
      segments: [
        { kind: 'text', text: 'W zeszłym roku Marta ' },
        { kind: 'gap', gapId: 'g0' },
        { kind: 'text', text: ' do Wrocławia i ' },
        { kind: 'gap', gapId: 'g1' },
        { kind: 'text', text: ' tam nową pracę.' },
      ],
      gaps: {
        g0: [
          { label: 'przyjechała', correct: true },
          { label: 'przyjedzie' },
          { label: 'przyjeżdżała' },
        ],
        g1: [
          { label: 'znalazła', correct: true },
          { label: 'znajdzie' },
          { label: 'znajdowała' },
        ],
      },
      maxScore: 4,
    },
    {
      segments: [
        { kind: 'text', text: 'Nie mam ' },
        { kind: 'gap', gapId: 'g0' },
        { kind: 'text', text: ' czasu, ' },
        { kind: 'gap', gapId: 'g1' },
        { kind: 'text', text: ' muszę dokończyć projekt.' },
      ],
      gaps: {
        g0: [
          { label: 'wiele' },
          { label: 'dużo', correct: true },
          { label: 'wielu' },
        ],
        g1: [
          { label: 'dlatego', correct: true },
          { label: 'chociaż' },
          { label: 'żeby' },
        ],
      },
      maxScore: 4,
    },
    {
      segments: [
        { kind: 'text', text: 'Ten film jest ' },
        { kind: 'gap', gapId: 'g0' },
        { kind: 'text', text: ' niż poprzedni, ' },
        { kind: 'gap', gapId: 'g1' },
        { kind: 'text', text: ' wciąż wart obejrzenia.' },
      ],
      gaps: {
        g0: [
          { label: 'słabszy', correct: true },
          { label: 'słaby' },
          { label: 'najsłabszy' },
        ],
        g1: [
          { label: 'ale', correct: true },
          { label: 'ponieważ' },
          { label: 'żeby' },
        ],
      },
      maxScore: 4,
    },
    {
      segments: [
        { kind: 'text', text: 'Gdybyśmy ' },
        { kind: 'gap', gapId: 'g0' },
        { kind: 'text', text: ' wcześniej, ' },
        { kind: 'gap', gapId: 'g1' },
        { kind: 'text', text: ' lepsze miejsca.' },
      ],
      gaps: {
        g0: [
          { label: 'wyszli', correct: true },
          { label: 'wyjdziemy' },
          { label: 'wychodzili' },
        ],
        g1: [
          { label: 'mielibyśmy', correct: true },
          { label: 'będziemy mieć' },
          { label: 'mamy' },
        ],
      },
      maxScore: 4,
    },
    {
      segments: [
        { kind: 'text', text: 'Proszę ' },
        { kind: 'gap', gapId: 'g0' },
        { kind: 'text', text: ' okno, bo ' },
        { kind: 'gap', gapId: 'g1' },
        { kind: 'text', text: ' tutaj bardzo gorąco.' },
      ],
      gaps: {
        g0: [
          { label: 'otworzyć', correct: true },
          { label: 'otwierać' },
          { label: 'otworzyła' },
        ],
        g1: [
          { label: 'jest', correct: true },
          { label: 'będzie' },
          { label: 'było' },
        ],
      },
      maxScore: 4,
    },
    {
      segments: [
        { kind: 'text', text: 'Nie wiem, ' },
        { kind: 'gap', gapId: 'g0' },
        { kind: 'text', text: ' on ' },
        { kind: 'gap', gapId: 'g1' },
        { kind: 'text', text: ' jutro na spotkanie.' },
      ],
      gaps: {
        g0: [
          { label: 'czy', correct: true },
          { label: 'kiedy' },
          { label: 'gdzie' },
        ],
        g1: [
          { label: 'przyjdzie', correct: true },
          { label: 'przychodzi' },
          { label: 'przyszedł' },
        ],
      },
      maxScore: 4,
    },
    {
      segments: [
        { kind: 'text', text: 'Zamiast oglądać telewizję, wolę ' },
        { kind: 'gap', gapId: 'g0' },
        { kind: 'text', text: ' książkę.' },
      ],
      gaps: {
        g0: [
          { label: 'czytać', correct: true },
          { label: 'czytam' },
          { label: 'przeczytać' },
        ],
      },
      maxScore: 3,
    },
    {
      segments: [
        { kind: 'text', text: 'Interesuję się sportem, ' },
        { kind: 'gap', gapId: 'g0' },
        { kind: 'text', text: ' mój brat woli sztukę.' },
      ],
      gaps: {
        g0: [
          { label: 'a', correct: true },
          { label: 'i' },
          { label: 'bo' },
        ],
      },
      maxScore: 3,
    },
  ],
  writing: [
    {
      promptText:
        'Twoja ciocia Kasia mieszka w Poznaniu i w sobotę kończy 50 lat. Napisz krótkie życzenia, które wyślesz jej SMS-em z okazji urodzin (ok. 35 słów).',
      minWords: 25,
      maxWords: 45,
      taskGenre: 'zyczenia',
    },
    {
      promptText:
        'Napisz opowiadanie zainspirowane poniższym zdjęciem. Opisz, co się dzieje, kim są postacie i jakie emocje możesz wyczytać ze sceny (ok. 160–170 słów).',
      minWords: 140,
      maxWords: 190,
      taskGenre: 'opowiadanie',
      imageUrl: SHARED_IMAGES.market,
      imageDescription:
        'A busy farmers market stall is filled with colorful produce arranged in wooden crates, including tomatoes, peppers, carrots, leafy greens, apples, oranges, and berries. Two vendors wearing aprons smile and speak with customers standing in front of the display. Canvas awnings cover the stall, while more shoppers and market stands extend along the sunny city street.',
    },
  ],
  speaking: [
    {
      imageUrl: SHARED_IMAGES.cooking,
      imageDescription:
        'A young woman cooks in a modern kitchen, stirring a large pot on a gas stove while holding its handle. Fresh carrots, tomatoes, bell peppers, and leafy greens are arranged on a cutting board in the foreground. Metal utensils and a frying pan hang beside the stove, while warm lighting and potted herbs create a cozy atmosphere.',
      promptText:
        'Opisz zdjęcie. Powiedz, co robi osoba na zdjęciu, gdzie się znajduje i jakie produkty widzisz. Dodaj krótką interpretację sytuacji.',
    },
    {
      imageUrl: SHARED_IMAGES.tourists,
      imageDescription:
        'Four tourists stand beside a large ornate stone fountain in a sunny historic city square. Each person holds up a smartphone to photograph the fountain. The group includes two men and two women, some carrying backpacks and one wearing a straw hat.',
      promptText:
        'Monolog: Opowiedz o swojej ostatniej podróży lub wycieczce. Powiedz, dokąd jechałeś/jechałaś, co robiłeś/robiłaś i co Ci się najbardziej podobało. Mów 2–3 minuty.',
    },
    {
      imageUrl: SHARED_IMAGES.tourists,
      imageDescription: '',
      promptText:
        'Sytuacja komunikacyjna: Jesteś w sklepie odzieżowym. Prosisz sprzedawcę o wymianę bluzki, która jest za mała, na większy rozmiar. Wyjaśnij problem grzecznie i poproś o pomoc.',
    },
  ],
};

export const PILOT_V01_CONTENT_HASH = 'pilot-v01-2026-06';
