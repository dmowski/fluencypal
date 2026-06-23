import {
  POLISH_B1_WRITING_IMAGE_DESCRIPTIONS,
  POLISH_B1_WRITING_IMAGES,
} from './images';
import { PolishB1WritingVariant } from './types';

/**
 * Original writing variants inspired by official B1 exam patterns
 * (short functional text + longer composition). Wording is authored for this app.
 */
export const POLISH_B1_WRITING_VARIANTS: PolishB1WritingVariant[] = [
  {
    variantId: 'v01',
    label: 'Wariant 1',
    inspirationNote: 'birthday wishes + market photo story',
    tasks: [
      {
        promptText:
          'Twoja ciocia Marta mieszka we Wrocławiu i w niedzielę kończy 60 lat. Napisz krótkie życzenia, które wyślesz jej SMS-em z okazji urodzin (ok. 30 słów).',
        minWords: 22,
        maxWords: 40,
        taskGenre: 'zyczenia',
      },
      {
        promptText:
          'Napisz opowiadanie zainspirowane poniższym zdjęciem. Opisz, co się dzieje, kim są postacie i jakie emocje można wyczytać ze sceny (ok. 165 słów).',
        minWords: 145,
        maxWords: 185,
        taskGenre: 'opowiadanie',
        imageUrl: POLISH_B1_WRITING_IMAGES.market,
        imageDescription: POLISH_B1_WRITING_IMAGE_DESCRIPTIONS.market,
      },
    ],
  },
  {
    variantId: 'v02',
    label: 'Wariant 2',
    inspirationNote: 'classified ad + formal complaint email',
    tasks: [
      {
        promptText:
          'Chcesz sprzedać swój rower miejski. Napisz ogłoszenie, które opublikujesz na lokalnej stronie internetowej. Podaj najważniejsze informacje: stan, cena i sposób kontaktu (ok. 35 słów).',
        minWords: 28,
        maxWords: 45,
        taskGenre: 'ogloszenie',
      },
      {
        promptText:
          'Uczestniczysz w wieczornym kursie języka polskiego, ale zajęcia często zaczynają się spóźnione, a sala jest za ciasna. Napisz e-mail do koordynatora kursu z grzeczną skargą i propozycją rozwiązania (ok. 155 słów).',
        minWords: 135,
        maxWords: 175,
        taskGenre: 'email',
      },
    ],
  },
  {
    variantId: 'v03',
    label: 'Wariant 3',
    inspirationNote: 'invitation + hobby essay',
    tasks: [
      {
        promptText:
          'Prowadzisz w bibliotece miejskiej cotygodniowe spotkanie klubu czytelniczego. Napisz zaproszenie dla stałych uczestników na spotkanie z autorką powieści obyczajowej (ok. 40 słów).',
        minWords: 32,
        maxWords: 50,
        taskGenre: 'zaproszenie',
      },
      {
        promptText:
          'Szkoła językowa, w której uczysz się polskiego, zbiera teksty do gazetki uczniowskiej. Napisz esej pt. „Moje ulubione hobby” i wyjaśnij, dlaczego poświęcasz mu wolny czas (ok. 170 słów).',
        minWords: 150,
        maxWords: 190,
        taskGenre: 'esej',
      },
    ],
  },
  {
    variantId: 'v04',
    label: 'Wariant 4',
    inspirationNote: 'travel greetings + workshop report',
    tasks: [
      {
        promptText:
          'Jesteś na tygodniowej wycieczce w górach z grupą międzynarodową. Napisz krótkie pozdrowienia do polskiej koleżanki z pracy (ok. 30 słów).',
        minWords: 22,
        maxWords: 40,
        taskGenre: 'zyczenia',
      },
      {
        promptText:
          'W zeszłą sobotę brałaś / brałeś udział w warsztatach kulinarnych „Smaki świata”. Napisz relację z tego wydarzenia dla bloga szkoły językowej: co robiłaś / robiłeś, co Ci się podobało i czego się nauczyłaś / nauczyłeś (ok. 165 słów).',
        minWords: 145,
        maxWords: 185,
        taskGenre: 'opowiadanie',
      },
    ],
  },
  {
    variantId: 'v05',
    label: 'Wariant 5',
    inspirationNote: 'wedding wishes + story with opening sentence',
    tasks: [
      {
        promptText:
          'Twoi polscy znajomi, Ania i Piotr, w sobotę biorą ślub. Napisz krótkie życzenia, które włożysz do kartki z prezentem (ok. 25 słów).',
        minWords: 18,
        maxWords: 35,
        taskGenre: 'zyczenia',
      },
      {
        promptText:
          'Portal edukacyjny ogłosił konkurs na opowiadanie, które zaczyna się od zdania: „Tej nocy długo nie mogłam / nie mogłem zasnąć”. Napisz swój tekst (ok. 170 słów).',
        minWords: 150,
        maxWords: 190,
        taskGenre: 'opowiadanie',
      },
    ],
  },
  {
    variantId: 'v06',
    label: 'Wariant 6',
    inspirationNote: 'landlord email + character sketch',
    tasks: [
      {
        promptText:
          'W Twoim wynajmowanym mieszkaniu od wczoraj nie działa ogrzewanie. Napisz krótki e-mail do właściciela lokalu z prośbą o szybką interwencję (ok. 50 słów).',
        minWords: 40,
        maxWords: 60,
        taskGenre: 'email',
      },
      {
        promptText:
          'Redakcja szkolnej gazetki prosi o teksty o ważnych ludziach. Napisz charakterystykę osoby, która ma dla Ciebie duże znaczenie — opisz jej cechy, zachowanie i wpływ na Twoje życie (ok. 160 słów).',
        minWords: 140,
        maxWords: 180,
        taskGenre: 'opowiadanie',
      },
    ],
  },
  {
    variantId: 'v07',
    label: 'Wariant 7',
    inspirationNote: 'language exchange ad + city square photo story',
    tasks: [
      {
        promptText:
          'Chcesz wymieniać lekcje: uczysz swojego języka ojczystego, a ktoś uczy Cię polskiego. Napisz ogłoszenie na tablicy szkoły językowej (ok. 35 słów).',
        minWords: 28,
        maxWords: 45,
        taskGenre: 'ogloszenie',
      },
      {
        promptText:
          'Napisz opowiadanie zainspirowane poniższym zdjęciem z placu w centrum miasta. Opisz sytuację, bohaterów i nastrój sceny (ok. 165 słów).',
        minWords: 145,
        maxWords: 185,
        taskGenre: 'opowiadanie',
        imageUrl: POLISH_B1_WRITING_IMAGES.tourists,
        imageDescription: POLISH_B1_WRITING_IMAGE_DESCRIPTIONS.tourists,
      },
    ],
  },
  {
    variantId: 'v08',
    label: 'Wariant 8',
    inspirationNote: 'name-day invitation + film opinion essay',
    tasks: [
      {
        promptText:
          'Organizujesz w piątek wieczorem małe przyjęcie z okazji swoich imienin w restauracji. Napisz zaproszenie dla dwóch polskich kolegów z kursu (ok. 35 słów).',
        minWords: 28,
        maxWords: 45,
        taskGenre: 'zaproszenie',
      },
      {
        promptText:
          'Napisz esej pt. „Film, który ostatnio mnie zaskoczył”. Opisz fabułę w kilku zdaniach, wyjaśnij, co Ci się podobało, i dodaj własną opinię (ok. 170 słów).',
        minWords: 150,
        maxWords: 190,
        taskGenre: 'esej',
      },
    ],
  },
  {
    variantId: 'v09',
    label: 'Wariant 9',
    inspirationNote: 'teacher greetings + moving announcement letter',
    tasks: [
      {
        promptText:
          'Wyjeżdżasz na trzy miesiące na staż za granicę. Napisz pozdrowienia do byłej nauczycielki / byłego nauczyciela języka polskiego (ok. 30 słów).',
        minWords: 22,
        maxWords: 40,
        taskGenre: 'zyczenia',
      },
      {
        promptText:
          'Za dwa miesiące przeprowadzasz się do innego miasta w Polsce. Napisz list e-mail do przyjaciółki / przyjaciela: gdzie jedziesz, dlaczego i jak planujesz utrzymać kontakt (ok. 155 słów).',
        minWords: 135,
        maxWords: 175,
        taskGenre: 'email',
      },
    ],
  },
  {
    variantId: 'v10',
    label: 'Wariant 10',
    inspirationNote: 'New Year wishes + business meeting photo story',
    tasks: [
      {
        promptText:
          'Napisz krótkie życzenia noworoczne dla sąsiadów, którzy pomogli Ci w pierwszych tygodniach w Polsce (ok. 25 słów).',
        minWords: 18,
        maxWords: 35,
        taskGenre: 'zyczenia',
      },
      {
        promptText:
          'Napisz opowiadanie zainspirowane poniższym zdjęciem ze spotkania służbowego. Opisz bohaterów, otoczenie i to, o czym mogą rozmawiać (ok. 175 słów).',
        minWords: 155,
        maxWords: 195,
        taskGenre: 'opowiadanie',
        imageUrl: POLISH_B1_WRITING_IMAGES.handshake,
        imageDescription: POLISH_B1_WRITING_IMAGE_DESCRIPTIONS.handshake,
      },
    ],
  },
  {
    variantId: 'v11',
    label: 'Wariant 11',
    inspirationNote: 'lost item notice + rainy day story opener',
    tasks: [
      {
        promptText:
          'Zgubiłaś / Zgubiłeś wczoraj czarny plecak z laptopem w tramwaju linii 9. Napisz ogłoszenie do rozwieszenia w zajezdni (ok. 35 słów).',
        minWords: 28,
        maxWords: 45,
        taskGenre: 'ogloszenie',
      },
      {
        promptText:
          'Konkurs szkoły językowej wymaga opowiadania zaczynającego się od zdania: „Tego dnia padał deszcz od rana”. Napisz swój tekst (ok. 170 słów).',
        minWords: 150,
        maxWords: 190,
        taskGenre: 'opowiadanie',
      },
    ],
  },
  {
    variantId: 'v12',
    label: 'Wariant 12',
    inspirationNote: 'boss anniversary wishes + apartment description email',
    tasks: [
      {
        promptText:
          'Szefowa / Szef Twojej firmy kończy jubileusz 15 lat pracy. Napisz krótkie życzenia, które wyślesz e-mailem w imieniu zespołu (ok. 30 słów).',
        minWords: 22,
        maxWords: 40,
        taskGenre: 'zyczenia',
      },
      {
        promptText:
          'Właśnie wprowadziłaś / wprowadziłeś się do nowego mieszkania. Napisz e-mail do rodziny w kraju: opisz lokalizację, układ pomieszczeń i pierwsze wrażenia (ok. 160 słów).',
        minWords: 140,
        maxWords: 180,
        taskGenre: 'email',
      },
    ],
  },
  {
    variantId: 'v13',
    label: 'Wariant 13',
    inspirationNote: 'cultural event invitation + travel report',
    tasks: [
      {
        promptText:
          'W domu kultury, w którym pracujesz, w sobotę odbędzie się wieczór poezji. Napisz zaproszenie dla uczestników kursu polskiego (ok. 40 słów).',
        minWords: 32,
        maxWords: 50,
        taskGenre: 'zaproszenie',
      },
      {
        promptText:
          'Polski portal podróżniczy zbiera relacje czytelników. Napisz sprawozdanie z weekendowej wycieczki rowerowej: trasa, atrakcje i wrażenia (ok. 165 słów).',
        minWords: 145,
        maxWords: 185,
        taskGenre: 'opowiadanie',
      },
    ],
  },
  {
    variantId: 'v14',
    label: 'Wariant 14',
    inspirationNote: 'integration trip greetings + dream city essay',
    tasks: [
      {
        promptText:
          'Jesteś na wyjeździe integracyjnym z kolegami z kilku krajów. Napisz pozdrowienia do polskiej rodziny, u której mieszkałaś / mieszkałeś rok temu (ok. 30 słów).',
        minWords: 22,
        maxWords: 40,
        taskGenre: 'zyczenia',
      },
      {
        promptText:
          'Gazetka szkoły językowej ogłosiła konkurs na esej pt. „Moje wymarzone miasto”. Opisz, gdzie chciałabyś / chciałbyś mieszkać i dlaczego (ok. 170 słów).',
        minWords: 150,
        maxWords: 190,
        taskGenre: 'esej',
      },
    ],
  },
  {
    variantId: 'v15',
    label: 'Wariant 15',
    inspirationNote: 'furniture sale ad + family celebration report',
    tasks: [
      {
        promptText:
          'Przeprowadzasz się i chcesz sprzedać używane meble kuchenne. Napisz ogłoszenie na portal OLX z najważniejszymi informacjami (ok. 35 słów).',
        minWords: 28,
        maxWords: 45,
        taskGenre: 'ogloszenie',
      },
      {
        promptText:
          'Napisz relację z rodzinnej uroczystości (np. rocznica ślubu rodziców): gdzie się odbyła, kto uczestniczył i co zapamiętałaś / zapamiętałeś (ok. 175 słów).',
        minWords: 155,
        maxWords: 195,
        taskGenre: 'opowiadanie',
      },
    ],
  },
  {
    variantId: 'v16',
    label: 'Wariant 16',
    inspirationNote: 'farewell party invitation + health habits email',
    tasks: [
      {
        promptText:
          'Odchodzisz z obecnej pracy i organizujesz pożegnalne spotkanie w czwartek po południu. Napisz zaproszenie dla zespołu (ok. 35 słów).',
        minWords: 28,
        maxWords: 45,
        taskGenre: 'zaproszenie',
      },
      {
        promptText:
          'Postanowiłaś / Postanowiłeś więcej dbać o zdrowie. Napisz e-mail do polskiej koleżanki / kolegi: jakie zmiany wprowadzasz i jak Ci idzie (ok. 155 słów).',
        minWords: 135,
        maxWords: 175,
        taskGenre: 'email',
      },
    ],
  },
  {
    variantId: 'v17',
    label: 'Wariant 17',
    inspirationNote: 'Christmas wishes to teacher + city traveler photo story',
    tasks: [
      {
        promptText:
          'Napisz życzenia bożonarodzeniowe dla swojej obecnej nauczycielki / nauczyciela języka polskiego (ok. 25 słów).',
        minWords: 18,
        maxWords: 35,
        taskGenre: 'zyczenia',
      },
      {
        promptText:
          'Napisz opowiadanie zainspirowane poniższym zdjęciem podróżnika w mieście. Opisz sytuację, postacie i atmosferę (ok. 165 słów).',
        minWords: 145,
        maxWords: 185,
        taskGenre: 'opowiadanie',
        imageUrl: POLISH_B1_WRITING_IMAGES.map,
        imageDescription: POLISH_B1_WRITING_IMAGE_DESCRIPTIONS.map,
      },
    ],
  },
  {
    variantId: 'v18',
    label: 'Wariant 18',
    inspirationNote: 'roommate search ad + boss character sketch',
    tasks: [
      {
        promptText:
          'Szukasz współlokatora do dwupokojowego mieszkania blisko centrum. Napisz ogłoszenie z opisem lokalu i oczekiwań (ok. 40 słów).',
        minWords: 32,
        maxWords: 50,
        taskGenre: 'ogloszenie',
      },
      {
        promptText:
          'Portal zawodowy prosi o teksty pt. „Mam dobrą szefową / dobrego szefa”. Napisz charakterystykę swojego przełożonego / przełożonej (ok. 160 słów).',
        minWords: 140,
        maxWords: 180,
        taskGenre: 'opowiadanie',
      },
    ],
  },
  {
    variantId: 'v19',
    label: 'Wariant 19',
    inspirationNote: 'business trip greetings + book opinion essay',
    tasks: [
      {
        promptText:
          'Prowadzisz szkolenie w innym mieście w Polsce. Napisz krótkie pozdrowienia do współpracownika, który został w biurze (ok. 30 słów).',
        minWords: 22,
        maxWords: 40,
        taskGenre: 'zyczenia',
      },
      {
        promptText:
          'Napisz esej pt. „Książka, którą ostatnio przeczytałam / przeczytałem”. Streść fabułę, wyjaśnij, co Cię zainteresowało, i podziel się opinią (ok. 170 słów).',
        minWords: 150,
        maxWords: 190,
        taskGenre: 'esej',
      },
    ],
  },
  {
    variantId: 'v20',
    label: 'Wariant 20',
    inspirationNote: 'children day event invitation + true friend story',
    tasks: [
      {
        promptText:
          'Organizujesz w niedzielę piknik rodzinny z okazji Dnia Dziecka w parku miejskim. Napisz zaproszenie dla sąsiadów z dziećmi (ok. 40 słów).',
        minWords: 32,
        maxWords: 50,
        taskGenre: 'zaproszenie',
      },
      {
        promptText:
          'Szkoła językowa ogłosiła konkurs na opowiadanie pt. „Prawdziwy przyjaciel zawsze pomoże”. Napisz swój tekst (ok. 175 słów).',
        minWords: 155,
        maxWords: 195,
        taskGenre: 'opowiadanie',
      },
    ],
  },
  {
    variantId: 'v21',
    label: 'Wariant 21',
    inspirationNote: 'SMS about apartment swap + cooking course report',
    tasks: [
      {
        promptText:
          'W windzie zobaczyłaś / zobaczyłeś ogłoszenie o zamianie mieszkania. Jesteś zainteresowana / zainteresowany. Napisz SMS z pytaniem o piętro i metraż (ok. 25 słów).',
        minWords: 18,
        maxWords: 35,
        taskGenre: 'email',
      },
      {
        promptText:
          'Uczestniczyłaś / Uczestniczyłeś w kursie gotowania „Kuchnia polska”. Napisz relację dla bloga szkoły: co przygotowywaliście i co Ci się podobało (ok. 165 słów).',
        minWords: 145,
        maxWords: 185,
        taskGenre: 'opowiadanie',
      },
    ],
  },
  {
    variantId: 'v22',
    label: 'Wariant 22',
    inspirationNote: 'wedding apology wishes + renovation email',
    tasks: [
      {
        promptText:
          'Twój przyjaciel z Polski w sobotę bierze ślub, ale nie możesz przyjechać. Napisz życzenia, które dołączysz do przesyłki z prezentem (ok. 30 słów).',
        minWords: 22,
        maxWords: 40,
        taskGenre: 'zyczenia',
      },
      {
        promptText:
          'Właśnie zakończyłaś / zakończyłeś remont salonu. Napisz e-mail do przyjaciółki / przyjaciela z Polski: opisz zmiany i kolory, które wybrałaś / wybrałeś (ok. 155 słów).',
        minWords: 135,
        maxWords: 175,
        taskGenre: 'email',
      },
    ],
  },
  {
    variantId: 'v23',
    label: 'Wariant 23',
    inspirationNote: 'tutor wanted ad + market photo story (alternate)',
    tasks: [
      {
        promptText:
          'Szukasz korepetytora z języka polskiego na dwa spotkania w tygodniu. Napisz ogłoszenie na stronie Naukapolskiego.pl (ok. 35 słów).',
        minWords: 28,
        maxWords: 45,
        taskGenre: 'ogloszenie',
      },
      {
        promptText:
          'Napisz opowiadanie zainspirowane zdjęciem targu. Opisz, co dzieje się na zdjęciu, kim są ludzie i jaki panuje nastrój (ok. 165 słów).',
        minWords: 145,
        maxWords: 185,
        taskGenre: 'opowiadanie',
        imageUrl: POLISH_B1_WRITING_IMAGES.market,
        imageDescription: POLISH_B1_WRITING_IMAGE_DESCRIPTIONS.market,
      },
    ],
  },
  {
    variantId: 'v24',
    label: 'Wariant 24',
    inspirationNote: 'grill party invitation + TV series review essay',
    tasks: [
      {
        promptText:
          'Organizujesz w sobotę grill w ogrodzie dla kolegów z pracy. Napisz zaproszenie z informacją, co mają przynieść (ok. 40 słów).',
        minWords: 32,
        maxWords: 50,
        taskGenre: 'zaproszenie',
      },
      {
        promptText:
          'Napisz esej pt. „Serial, który ostatnio oglądałam / oglądałem”. Opisz bohaterów, fabułę i wyjaśnij, dlaczego polecasz ten serial (ok. 170 słów).',
        minWords: 150,
        maxWords: 190,
        taskGenre: 'esej',
      },
    ],
  },
  {
    variantId: 'v25',
    label: 'Wariant 25',
    inspirationNote: 'ski trip greetings + family member portrait',
    tasks: [
      {
        promptText:
          'Spędzasz ferie zimowe w Bieszczadach. Napisz pozdrowienia do polskiej koleżanki z kursu językowego (ok. 30 słów).',
        minWords: 22,
        maxWords: 40,
        taskGenre: 'zyczenia',
      },
      {
        promptText:
          'Lokalna gazetka zbiera teksty o rodzinie. Napisz charakterystykę członka rodziny, który odgrywa ważną rolę w Twoim życiu (ok. 160 słów).',
        minWords: 140,
        maxWords: 180,
        taskGenre: 'opowiadanie',
      },
    ],
  },
  {
    variantId: 'v26',
    label: 'Wariant 26',
    inspirationNote: 'free piano ad + interesting vacation opener',
    tasks: [
      {
        promptText:
          'Oddajesz za darmo starą pianinę, bo nie masz już miejsca. Napisz ogłoszenie z informacją o odbiorze własnym (ok. 30 słów).',
        minWords: 22,
        maxWords: 40,
        taskGenre: 'ogloszenie',
      },
      {
        promptText:
          'Napisz opowiadanie, które zaczyna się od zdania: „To były naprawdę ciekawe wakacje”. Opisz, co się wydarzyło i jakie wnioski wyciągnęłaś / wyciągnąłeś (ok. 170 słów).',
        minWords: 150,
        maxWords: 190,
        taskGenre: 'opowiadanie',
      },
    ],
  },
  {
    variantId: 'v27',
    label: 'Wariant 27',
    inspirationNote: 'formal complaint to course coordinator + hobby time essay',
    tasks: [
      {
        promptText:
          'Na kursie polskiego brakuje podręczników, a lektor często spóźnia się. Napisz krótki e-mail z uprzejmą skargą do sekretariatu szkoły (ok. 50 słów).',
        minWords: 40,
        maxWords: 60,
        taskGenre: 'email',
      },
      {
        promptText:
          'Napisz esej pt. „Zawsze znajdę czas na moje hobby”. Wyjaśnij, czym się zajmujesz w wolnym czasie i dlaczego to dla Ciebie ważne (ok. 170 słów).',
        minWords: 150,
        maxWords: 190,
        taskGenre: 'esej',
      },
    ],
  },
  {
    variantId: 'v28',
    label: 'Wariant 28',
    inspirationNote: 'moving farewell invitation + city square photo story',
    tasks: [
      {
        promptText:
          'Za miesiąc wyjeżdżasz z Polski. Organizujesz pożegnalną kolację dla polskich znajomych. Napisz zaproszenie (ok. 35 słów).',
        minWords: 28,
        maxWords: 45,
        taskGenre: 'zaproszenie',
      },
      {
        promptText:
          'Napisz opowiadanie zainspirowane zdjęciem z placu w centrum miasta. Opisz scenę, bohaterów i emocje, które można w niej dostrzec (ok. 165 słów).',
        minWords: 145,
        maxWords: 185,
        taskGenre: 'opowiadanie',
        imageUrl: POLISH_B1_WRITING_IMAGES.tourists,
        imageDescription: POLISH_B1_WRITING_IMAGE_DESCRIPTIONS.tourists,
      },
    ],
  },
  {
    variantId: 'v29',
    label: 'Wariant 29',
    inspirationNote: 'name day wishes + concert experience report',
    tasks: [
      {
        promptText:
          'Twoja polska sąsiadka w środę obchodzi imieniny. Napisz krótkie życzenia, które włożysz do skrzynki pocztowej (ok. 25 słów).',
        minWords: 18,
        maxWords: 35,
        taskGenre: 'zyczenia',
      },
      {
        promptText:
          'Byłaś / Byłeś w zeszłym tygodniu na koncercie na żywo. Napisz relację dla portalu „Muzyka”: miejsce, wykonawcy i Twoje wrażenia (ok. 165 słów).',
        minWords: 145,
        maxWords: 185,
        taskGenre: 'opowiadanie',
      },
    ],
  },
  {
    variantId: 'v30',
    label: 'Wariant 30',
    inspirationNote: 'language partner ad + business meeting story',
    tasks: [
      {
        promptText:
          'Chcesz znaleźć partnera do rozmów po polsku dwa razy w tygodniu. Napisz ogłoszenie na tablicy szkoły językowej (ok. 35 słów).',
        minWords: 28,
        maxWords: 45,
        taskGenre: 'ogloszenie',
      },
      {
        promptText:
          'Napisz opowiadanie zainspirowane zdjęciem ze spotkania służbowego. Opisz spotkanie, otoczenie i to, o czym rozmawiają bohaterowie (ok. 175 słów).',
        minWords: 155,
        maxWords: 195,
        taskGenre: 'opowiadanie',
        imageUrl: POLISH_B1_WRITING_IMAGES.handshake,
        imageDescription: POLISH_B1_WRITING_IMAGE_DESCRIPTIONS.handshake,
      },
    ],
  },
];

export const POLISH_B1_WRITING_VARIANT_COUNT = POLISH_B1_WRITING_VARIANTS.length;

export const getPolishB1WritingVariant = (
  variantId: string,
): PolishB1WritingVariant | undefined =>
  POLISH_B1_WRITING_VARIANTS.find((variant) => variant.variantId === variantId);

export const pickRandomPolishB1WritingVariantId = (): string => {
  const index = Math.floor(Math.random() * POLISH_B1_WRITING_VARIANTS.length);
  return POLISH_B1_WRITING_VARIANTS[index].variantId;
};
