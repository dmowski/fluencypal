import { photoTask } from './images';
import { SPEAKING_VARIANT_PHOTO_KEYS } from './examQuizImageCatalog';
import { PolishB1SpeakingVariant } from './types';

const PHOTO =
  'Opisz fotografię i przedstawioną na niej sytuację. Powiedz, kim są osoby, gdzie się znajdują, co robią i jaki panuje nastrój.';

const variantPhoto = (variantIndex: number, promptText: string = PHOTO) =>
  photoTask(SPEAKING_VARIANT_PHOTO_KEYS[variantIndex], promptText);

/**
 * Original speaking variants inspired by official B1 format:
 * 1) opis ilustracji, 2) monolog, 3) sytuacja komunikacyjna.
 */
export const POLISH_B1_SPEAKING_VARIANTS: PolishB1SpeakingVariant[] = [
  {
    variantId: 'v01',
    label: 'Wariant 1',
    inspirationNote: 'kitchen photo + essentials monologue + bakery order',
    photo: variantPhoto(0),
    monologue: {
      topicPrompt:
        'Monolog: Rzeczy, bez których trudno byłoby mi żyć, to… Opisz dwa–trzy przedmioty, których używasz codziennie, i wyjaśnij, dlaczego są dla Ciebie ważne.',
      minWords: 55,
      maxWords: 160,
    },
    situational: {
      topicPrompt:
        'Sytuacja komunikacyjna: Twoja znajoma ma niedługo urodziny. Dzwonisz do cukierni, żeby zamówić tort. Ustal smak, wielkość, cenę i termin odbioru.',
      minWords: 35,
      maxWords: 110,
    },
  },
  {
    variantId: 'v02',
    label: 'Wariant 2',
    inspirationNote: 'family monologue + PKP inquiry',
    photo: variantPhoto(1),
    monologue: {
      topicPrompt:
        'Monolog: Opisz swoją rodzinę lub rodzinę, o jakiej marzysz. Powiedz, ilu jest członków, kim są i jak spędzacie czas razem.',
      minWords: 55,
      maxWords: 165,
    },
    situational: {
      topicPrompt:
        'Sytuacja komunikacyjna: Jesteś na dworcu PKP i chcesz pojechać do Wrocławia. Zapytaj w kasie o godzinę odjazdu, czas podróży, cenę biletu i możliwość rezerwacji miejsca.',
      minWords: 35,
      maxWords: 110,
    },
  },
  {
    variantId: 'v03',
    label: 'Wariant 3',
    inspirationNote: 'market + last trip + clothing exchange',
    photo: variantPhoto(2),
    monologue: {
      topicPrompt:
        'Monolog: Opowiedz o swojej ostatniej podróży lub wycieczce. Dokąd jechałeś/jechałaś, z kim, co robiłeś/robiłaś i co Ci się najbardziej podobało.',
      minWords: 60,
      maxWords: 170,
    },
    situational: {
      topicPrompt:
        'Sytuacja komunikacyjna: Jesteś w sklepie odzieżowym. Kupiona bluzka jest za mała. Poproś sprzedawcę o wymianę na większy rozmiar i wyjaśnij sytuację grzecznie.',
      minWords: 30,
      maxWords: 100,
    },
  },
  {
    variantId: 'v04',
    label: 'Wariant 4',
    inspirationNote: 'doctor + daily routine + doctor appointment',
    photo: variantPhoto(3),
    monologue: {
      topicPrompt:
        'Monolog: Opisz swój typowy dzień w tygodniu. O której wstajesz, co robisz rano, w pracy lub na studiach i jak spędzasz wieczór.',
      minWords: 55,
      maxWords: 165,
    },
    situational: {
      topicPrompt:
        'Sytuacja komunikacyjna: Źle się czujesz od trzech dni. Dzwonisz do przychodni, żeby umówić wizytę u lekarza. Podaj objawy i zapytaj o najbliższy termin.',
      minWords: 35,
      maxWords: 110,
    },
  },
  {
    variantId: 'v05',
    label: 'Wariant 5',
    inspirationNote: 'classroom + hobby + restaurant reservation',
    photo: variantPhoto(4),
    monologue: {
      topicPrompt:
        'Monolog: Opowiedz o swoim ulubionym hobby. Jak zacząłeś/zaczęłaś, ile czasu poświęcasz i dlaczego to Cię relaksuje.',
      minWords: 55,
      maxWords: 160,
    },
    situational: {
      topicPrompt:
        'Sytuacja komunikacyjna: Chcesz zarezerwować stolik w restauracji na sobotę wieczorem dla sześciu osób. Zadzwoń i ustal godzinę, menu i ewentualne preferencje.',
      minWords: 35,
      maxWords: 105,
    },
  },
  {
    variantId: 'v06',
    label: 'Wariant 6',
    inspirationNote: 'tourists + dream city + hotel complaint',
    photo: variantPhoto(5),
    monologue: {
      topicPrompt:
        'Monolog: Opisz miasto, w którym chciałbyś/chciałabyś mieszkać. Gdzie leży, co można tam robić i dlaczego właśnie tam.',
      minWords: 55,
      maxWords: 165,
    },
    situational: {
      topicPrompt:
        'Sytuacja komunikacyjna: W hotelu hałas z sąsiedniego pokoju nie pozwala Ci spać. Zgłoś problem recepcjonistce i poproś o rozwiązanie.',
      minWords: 35,
      maxWords: 110,
    },
  },
  {
    variantId: 'v07',
    label: 'Wariant 7',
    inspirationNote: 'office handshake + work + internet provider',
    photo: variantPhoto(6),
    monologue: {
      topicPrompt:
        'Monolog: Opowiedz o swojej pracy lub o pracy, którą chciałbyś/chciałabyś wykonywać. Co robisz, co Ci się podoba i co jest trudne.',
      minWords: 55,
      maxWords: 165,
    },
    situational: {
      topicPrompt:
        'Sytuacja komunikacyjna: Internet w mieszkaniu nie działa od wczoraj. Dzwonisz do dostawcy usług i zgłaszasz awarię. Poproś o termin naprawy.',
      minWords: 35,
      maxWords: 110,
    },
  },
  {
    variantId: 'v08',
    label: 'Wariant 8',
    inspirationNote: 'lost tourist + learning Polish + post office',
    photo: variantPhoto(7),
    monologue: {
      topicPrompt:
        'Monolog: Opowiedz, jak uczysz się języka polskiego. Jakie metody stosujesz, co jest łatwe, a z czym masz trudność.',
      minWords: 55,
      maxWords: 165,
    },
    situational: {
      topicPrompt:
        'Sytuacja komunikacyjna: Jesteś na poczcie i chcesz wysłać paczkę do kraju ojczystego. Zapytaj o cenę, czas dostawy i wymagane dokumenty.',
      minWords: 35,
      maxWords: 110,
    },
  },
  {
    variantId: 'v09',
    label: 'Wariant 9',
    inspirationNote: 'café + favorite film + neighbor noise',
    photo: variantPhoto(8),
    monologue: {
      topicPrompt:
        'Monolog: Opowiedz o filmie lub serialu, który ostatnio Ci się podobał. O czym jest, kto gra główne role i dlaczego polecasz.',
      minWords: 55,
      maxWords: 165,
    },
    situational: {
      topicPrompt:
        'Sytuacja komunikacyjna: Sąsiad często robi głośne imprezy po 22:00. Zgłoś problem zarządcy budynku i poproś o interwencję.',
      minWords: 35,
      maxWords: 105,
    },
  },
  {
    variantId: 'v10',
    label: 'Wariant 10',
    inspirationNote: 'train + future plans + library',
    photo: variantPhoto(9),
    monologue: {
      topicPrompt:
        'Monolog: Opowiedz o swoich planach na najbliższe dwa lata — edukacja, praca, podróże lub inne cele.',
      minWords: 55,
      maxWords: 165,
    },
    situational: {
      topicPrompt:
        'Sytuacja komunikacyjna: W bibliotece chcesz przedłużyć termin zwrotu książki, która jest już po terminie. Wyjaśnij sytuację i poproś o prolongatę.',
      minWords: 30,
      maxWords: 100,
    },
  },
  {
    variantId: 'v11',
    label: 'Wariant 11',
    inspirationNote: 'cooking + childhood memory + gym membership',
    photo: variantPhoto(10, 'Opisz bibliotekę na zdjęciu. Kim są ludzie, co robią i jaka panuje atmosfera?'),
    monologue: {
      topicPrompt:
        'Monolog: Opowiedz o ważnym wspomnieniu z dzieciństwa. Gdzie to było, kto uczestniczył i dlaczego pamiętasz ten dzień.',
      minWords: 60,
      maxWords: 170,
    },
    situational: {
      topicPrompt:
        'Sytuacja komunikacyjna: Chcesz wykupić karnet na siłownię. Zapytaj o ceny, godziny otwarcia i czy jest możliwość zajęć z trenerem.',
      minWords: 35,
      maxWords: 110,
    },
  },
  {
    variantId: 'v12',
    label: 'Wariant 12',
    inspirationNote: 'market + healthy lifestyle + pharmacy',
    photo: variantPhoto(11, 'Opisz aptekę na zdjęciu. Kim są osoby i o czym rozmawiają?'),
    monologue: {
      topicPrompt:
        'Monolog: Opowiedz, jak dbasz o zdrowie. Jakie nawyki wprowadziłeś/wprowadziłaś w ostatnim czasie i co Ci pomaga.',
      minWords: 55,
      maxWords: 160,
    },
    situational: {
      topicPrompt:
        'Sytuacja komunikacyjna: W aptece szukasz leku na kaszel dla dziecka. Poproś farmaceutę o poradę i zapytaj o dawkowanie.',
      minWords: 35,
      maxWords: 110,
    },
  },
  {
    variantId: 'v13',
    label: 'Wariant 13',
    inspirationNote: 'tourists + best vacation + museum tickets',
    photo: variantPhoto(12),
    monologue: {
      topicPrompt:
        'Monolog: Opisz najlepsze wakacje, jakie do tej pory miałeś/miałaś. Gdzie byłeś/byłaś, co robiłeś/robiłaś i co zapamiętałeś/zapamiętałaś.',
      minWords: 60,
      maxWords: 175,
    },
    situational: {
      topicPrompt:
        'Sytuacja komunikacyjna: Stoisz w kasie muzeum i chcesz kupić bilety dla dwóch osób dorosłych i jednego ucznia. Zapytaj o cenę i godziny zwiedzania.',
      minWords: 35,
      maxWords: 105,
    },
  },
  {
    variantId: 'v14',
    label: 'Wariant 14',
    inspirationNote: 'doctor + good boss + lost wallet',
    photo: variantPhoto(13, 'Opisz pocztę na zdjęciu. Kim są osoby i co robi klient?'),
    monologue: {
      topicPrompt:
        'Monolog: Opisz swojego szefa lub szefową albo wymarzonego przełożonego. Jakie ma cechy i jak wpływa na atmosferę w pracy.',
      minWords: 55,
      maxWords: 165,
    },
    situational: {
      topicPrompt:
        'Sytuacja komunikacyjna: Zgubiłeś/zgubiłaś portfel w autobusie. Zgłoś to w biurze przewoźnika i podaj trasę oraz przybliżony czas kursu.',
      minWords: 35,
      maxWords: 110,
    },
  },
  {
    variantId: 'v15',
    label: 'Wariant 15',
    inspirationNote: 'classroom + book + language course complaint',
    photo: variantPhoto(14),
    monologue: {
      topicPrompt:
        'Monolog: Opowiedz o książce, którą niedawno czytałeś/czytałaś. O czym jest, co Cię zainteresowało i komu byś ją polecił/poleciła.',
      minWords: 55,
      maxWords: 165,
    },
    situational: {
      topicPrompt:
        'Sytuacja komunikacyjna: Na kursie języka polskiego sala jest za ciasna. Porozmawiaj z koordynatorem i zaproponuj rozwiązanie.',
      minWords: 35,
      maxWords: 110,
    },
  },
  {
    variantId: 'v16',
    label: 'Wariant 16',
    inspirationNote: 'park + weekend + car rental',
    photo: variantPhoto(15, 'Opisz basen i ludzi na zdjęciu. Co robią, jaka jest atmosfera i co widać w tle?'),
    monologue: {
      topicPrompt:
        'Monolog: Opowiedz, jak zwykle spędzasz weekend. Co robisz w sobotę i niedzielę, z kim i dlaczego tak lubisz ten czas.',
      minWords: 55,
      maxWords: 160,
    },
    situational: {
      topicPrompt:
        'Sytuacja komunikacyjna: Chcesz wynająć samochód na trzy dni. Zapytaj w wypożyczalni o cenę, ubezpieczenie i warunki zwrotu.',
      minWords: 35,
      maxWords: 110,
    },
  },
  {
    variantId: 'v17',
    label: 'Wariant 17',
    inspirationNote: 'handshake + colleague + broken heating',
    photo: variantPhoto(16),
    monologue: {
      topicPrompt:
        'Monolog: Opisz kolegę lub koleżankę z pracy, z którą dobrze się dogadujesz. Kim jest, co robi i dlaczego lubisz z nim/nią pracować.',
      minWords: 55,
      maxWords: 160,
    },
    situational: {
      topicPrompt:
        'Sytuacja komunikacyjna: W wynajmowanym mieszkaniu nie działa ogrzewanie. Zadzwoń do właściciela i poproś o szybką naprawę.',
      minWords: 35,
      maxWords: 105,
    },
  },
  {
    variantId: 'v18',
    label: 'Wariant 18',
    inspirationNote: 'map + moving to Poland + furniture delivery',
    photo: variantPhoto(17),
    monologue: {
      topicPrompt:
        'Monolog: Opowiedz, dlaczego mieszkasz w Polsce i jak wyglądało Twoje pierwsze miesiące tutaj.',
      minWords: 55,
      maxWords: 170,
    },
    situational: {
      topicPrompt:
        'Sytuacja komunikacyjna: Zamówiłeś/zamówiłaś meble z dostawą, ale kurier nie przyszedł. Zadzwoń do sklepu i ustal nowy termin.',
      minWords: 35,
      maxWords: 110,
    },
  },
  {
    variantId: 'v19',
    label: 'Wariant 19',
    inspirationNote: 'café + music + dentist',
    photo: variantPhoto(18),
    monologue: {
      topicPrompt:
        'Monolog: Opowiedz o muzyce, którą lubisz słuchać. Jaki to gatunek, kiedy słuchasz i dlaczego Ci odpowiada.',
      minWords: 50,
      maxWords: 155,
    },
    situational: {
      topicPrompt:
        'Sytuacja komunikacyjna: Boli Cię ząb. Zadzwoń do dentysty, opisz ból i umów wizytę na możliwie szybki termin.',
      minWords: 35,
      maxWords: 105,
    },
  },
  {
    variantId: 'v20',
    label: 'Wariant 20',
    inspirationNote: 'train + technology + wrong order',
    photo: variantPhoto(19),
    monologue: {
      topicPrompt:
        'Monolog: Opowiedz, jak technologia pomaga Ci w codziennym życiu. Jakie urządzenia lub aplikacje używasz najczęściej.',
      minWords: 55,
      maxWords: 165,
    },
    situational: {
      topicPrompt:
        'Sytuacja komunikacyjna: W restauracji dostałeś/dostałaś inne danie niż zamówiłeś/zamówiłaś. Grzecznie wyjaśnij problem kelnerowi.',
      minWords: 30,
      maxWords: 100,
    },
  },
  {
    variantId: 'v21',
    label: 'Wariant 21',
    inspirationNote: 'cooking + favorite season + parking fine',
    photo: variantPhoto(20),
    monologue: {
      topicPrompt:
        'Monolog: Opowiedz o swojej ulubionej porze roku. Co wtedy robisz, jak wygląda krajobraz i dlaczego lubisz ten czas.',
      minWords: 55,
      maxWords: 160,
    },
    situational: {
      topicPrompt:
        'Sytuacja komunikacyjna: Znalazłeś/znalazłaś mandat na szybie auta, ale byłeś/byłaś zaparkowany/zaparkowana legalnie. Zadzwoń na infolinię miasta i wyjaśnij sytuację.',
      minWords: 40,
      maxWords: 120,
    },
  },
  {
    variantId: 'v22',
    label: 'Wariant 22',
    inspirationNote: 'market + volunteering + bank account',
    photo: variantPhoto(21),
    monologue: {
      topicPrompt:
        'Monolog: Opowiedz o sytuacji, kiedy pomogłeś/pomogłaś komuś lub ktoś pomógł Tobie. Co się stało i jakie miało to skutki.',
      minWords: 55,
      maxWords: 165,
    },
    situational: {
      topicPrompt:
        'Sytuacja komunikacyjna: Chcesz otworzyć konto bankowe. Zapytaj w banku o wymagane dokumenty, opłaty i kartę debetową.',
      minWords: 35,
      maxWords: 110,
    },
  },
  {
    variantId: 'v23',
    label: 'Wariant 23',
    inspirationNote: 'tourists + festival + delayed flight',
    photo: variantPhoto(22),
    monologue: {
      topicPrompt:
        'Monolog: Opowiedz o festiwalu, koncercie lub innym wydarzeniu kulturalnym, w którym uczestniczyłeś/uczestniczyłaś.',
      minWords: 55,
      maxWords: 165,
    },
    situational: {
      topicPrompt:
        'Sytuacja komunikacyjna: Twój lot jest opóźniony o trzy godziny. Zapytaj pracownika linii lotniczej o przyczynę, posiłek i możliwość przesiadki.',
      minWords: 35,
      maxWords: 115,
    },
  },
  {
    variantId: 'v24',
    label: 'Wariant 24',
    inspirationNote: 'doctor + sport + gym class schedule',
    photo: variantPhoto(23),
    monologue: {
      topicPrompt:
        'Monolog: Opowiedz o sporcie, który uprawiasz lub chciałbyś/chciałabyś uprawiać. Jak zacząłeś/zaczęłaś i co Ci daje.',
      minWords: 55,
      maxWords: 160,
    },
    situational: {
      topicPrompt:
        'Sytuacja komunikacyjna: Chcesz zapisać dziecko na zajęcia pływania. Zapytaj o wiek uczestników, terminy, cenę i sprzęt.',
      minWords: 35,
      maxWords: 110,
    },
  },
  {
    variantId: 'v25',
    label: 'Wariant 25',
    inspirationNote: 'classroom + language exchange + lost keys',
    photo: variantPhoto(24),
    monologue: {
      topicPrompt:
        'Monolog: Opowiedz o najtrudniejszym doświadczeniu związanym z nauką języka obcego i jak sobie z nim poradziłeś/poradziłaś.',
      minWords: 55,
      maxWords: 170,
    },
    situational: {
      topicPrompt:
        'Sytuacja komunikacyjna: Zatrzaśnięte drzwi — klucze zostały w mieszkaniu. Poproś sąsiada o pomoc i wyjaśnij, co się stało.',
      minWords: 30,
      maxWords: 100,
    },
  },
  {
    variantId: 'v26',
    label: 'Wariant 26',
    inspirationNote: 'park + pets + vet visit',
    photo: variantPhoto(25),
    monologue: {
      topicPrompt:
        'Monolog: Opowiedz o zwierzęciu — swoim lub zwierzęciu znajomego. Jak wygląda, jakie ma zwyczaje i dlaczego je lubisz.',
      minWords: 55,
      maxWords: 160,
    },
    situational: {
      topicPrompt:
        'Sytuacja komunikacyjna: Twój kot nie je od dwóch dni. Zadzwoń do weterynarza, opisz objawy i umów wizytę.',
      minWords: 35,
      maxWords: 110,
    },
  },
  {
    variantId: 'v27',
    label: 'Wariant 27',
    inspirationNote: 'handshake + teamwork + job interview',
    photo: variantPhoto(26, 'Opisz mecz piłki nożnej na zdjęciu. Kto gra, co robią i jaka jest atmosfera?'),
    monologue: {
      topicPrompt:
        'Monolog: Opowiedz o pracy zespołowej. Czy lubisz pracować w grupie, jakie masz doświadczenia i co jest najważniejsze.',
      minWords: 55,
      maxWords: 165,
    },
    situational: {
      topicPrompt:
        'Sytuacja komunikacyjna: Jesteś na rozmowie kwalifikacyjnej. Przedstaw się, powiedz, dlaczego chcesz tę pracę i zapytaj o warunki zatrudnienia.',
      minWords: 45,
      maxWords: 130,
    },
  },
  {
    variantId: 'v28',
    label: 'Wariant 28',
    inspirationNote: 'map + public transport + bus pass',
    photo: variantPhoto(27),
    monologue: {
      topicPrompt:
        'Monolog: Opowiedz o komunikacji miejskiej w mieście, w którym mieszkasz. Jak korzystasz z autobusów, tramwajów lub metra.',
      minWords: 55,
      maxWords: 160,
    },
    situational: {
      topicPrompt:
        'Sytuacja komunikacyjna: Chcesz kupić miesięczny bilet komunikacji miejskiej ze zniżką studencką. Zapytaj w kasie o cenę i dokumenty.',
      minWords: 35,
      maxWords: 105,
    },
  },
  {
    variantId: 'v29',
    label: 'Wariant 29',
    inspirationNote: 'café + cooking at home + cooking class',
    photo: variantPhoto(28, 'Opisz targ na zdjęciu. Jakie produkty widzisz, kim są ludzie i co się dzieje?'),
    monologue: {
      topicPrompt:
        'Monolog: Opowiedz, czy lubisz gotować w domu. Jakie potrawy przygotowujesz najczęściej i skąd bierzesz przepisy.',
      minWords: 55,
      maxWords: 160,
    },
    situational: {
      topicPrompt:
        'Sytuacja komunikacyjna: Chcesz zapisać się na warsztaty kulinarne w sobotę. Zapytaj o menu, cenę, liczbę miejsc i co trzeba zabrać.',
      minWords: 35,
      maxWords: 110,
    },
  },
  {
    variantId: 'v30',
    label: 'Wariant 30',
    inspirationNote: 'train + Poland recommendation + taxi ride',
    photo: variantPhoto(29),
    monologue: {
      topicPrompt:
        'Monolog: Poleć obcokrajowcowi trzy miejsca w Polsce, które warto odwiedzić. Wyjaśnij, co można tam zobaczyć.',
      minWords: 60,
      maxWords: 175,
    },
    situational: {
      topicPrompt:
        'Sytuacja komunikacyjna: Wsiadasz do taksówki na lotnisku. Podaj adres hotelu, zapytaj o orientacyjną cenę i czas dojazdu.',
      minWords: 35,
      maxWords: 110,
    },
  },
];

export const POLISH_B1_SPEAKING_VARIANT_COUNT = POLISH_B1_SPEAKING_VARIANTS.length;

export const getPolishB1SpeakingVariant = (
  variantId: string,
): PolishB1SpeakingVariant | undefined =>
  POLISH_B1_SPEAKING_VARIANTS.find((variant) => variant.variantId === variantId);

export const pickRandomPolishB1SpeakingVariantId = (): string => {
  const index = Math.floor(Math.random() * POLISH_B1_SPEAKING_VARIANTS.length);
  return POLISH_B1_SPEAKING_VARIANTS[index].variantId;
};
