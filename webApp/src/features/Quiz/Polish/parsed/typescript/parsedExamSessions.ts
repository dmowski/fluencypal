// Reference index of writing sections from cleaned exam papers.

export interface ParsedWritingTask {
  letter: 'a' | 'b';
  prompt: string;
  wordCount: number | null;
}

export interface ParsedWritingSet {
  setNumber: string;
  tasks: ParsedWritingTask[];
}

export interface ParsedExamSession {
  sessionId: string;
  label: string;
  sourceFile: string;
  writingSets: ParsedWritingSet[];
}

export const PARSED_EXAM_SESSIONS: ParsedExamSession[] = [
  {
    "sessionId": "2022-02-06",
    "label": "6–7 lutego 2022",
    "sourceFile": "exams/2022-02-06/exam-paper.md",
    "writingSets": [
      {
        "setNumber": "I",
        "tasks": [
          {
            "letter": "a",
            "prompt": "Jest Pani/Pan na zagranicznej wycieczce. Proszę napisać pozdrowienia do swojego nauczyciela języka polskiego. 30 słów",
            "wordCount": 30
          },
          {
            "letter": "b",
            "prompt": "Uczestniczyła Pani / Uczestniczył Pan w kursie gotowania „Obiady z całego świata”. Proszę napisać sprawozdanie (relację) dla polskiego portalu internetowego „Lubię Kuchnię”.",
            "wordCount": 170
          }
        ]
      },
      {
        "setNumber": "I",
        "tasks": [
          {
            "letter": "a",
            "prompt": "Pani/Pana kot nie wrócił do domu. Proszę napisać ogłoszenie, które rozwiesi Pani/Pan w okolicy. 30 słów",
            "wordCount": 30
          },
          {
            "letter": "b",
            "prompt": "Spędziła Pani / Spędził Pan wakacje w gospodarstwie agroturystycznym. Proszę napisać opinię na temat tego miejsca, któr ą zamieści Pani/Pan na polskim portalu turystycznym wartotuprzyjechac.pl.",
            "wordCount": 170
          }
        ]
      },
      {
        "setNumber": "I",
        "tasks": [
          {
            "letter": "a",
            "prompt": "Pracuje Pani/Pan w polskiej bibliotece. Proszę napisać zaproszenie dla czytelników na spotkanie z autorem popularnych książek. 40 słów",
            "wordCount": 40
          },
          {
            "letter": "b",
            "prompt": "Pani/Pana firma zmieniła lokalizację, teraz znajduje się w nowym budynku, w centrum miasta. Proszę napisać e-mail do kolegi z Polski i opisać swoje nowe biuro.",
            "wordCount": 160
          }
        ]
      }
    ]
  },
  {
    "sessionId": "2022-03-26",
    "label": "26–27 marca 2022",
    "sourceFile": "exams/2022-03-26/exam-paper.md",
    "writingSets": [
      {
        "setNumber": "I",
        "tasks": [
          {
            "letter": "a",
            "prompt": "Chce Pani/Pan sprzedać używany telefon. Proszę napisać ogłoszenie, które zamieści Pani/Pan na polskiej stronie internetowej.",
            "wordCount": 30
          },
          {
            "letter": "b",
            "prompt": "Razem z koleżankami i kolegami z kursu języka polskiego była Pani / był Pan na spotkaniu ze znaną osobą / na koncercie. Proszę napisać sprawozdanie (relację) do gazetki „Cześć! Co Słychać?”, którą wydaje szkoła językowa.",
            "wordCount": 170
          }
        ]
      },
      {
        "setNumber": "I",
        "tasks": [
          {
            "letter": "a",
            "prompt": "Wyjechała Pani / Wyjechał Pan na kilka miesięcy za granicę. Starsza sąsiadka, obok której mieszka Pani/Pan w Polsce, ma urodziny. Proszę napisać do niej życzenia z tej okazji.",
            "wordCount": 30
          },
          {
            "letter": "b",
            "prompt": "„Zawsze będę o niej/nim pamiętać”. Proszę napisać charakterystykę ważnej dla Pani/Pana osoby. 170 słów",
            "wordCount": 170
          }
        ]
      },
      {
        "setNumber": "I",
        "tasks": [
          {
            "letter": "a",
            "prompt": "Dawno nie widziała Pani / nie widział Pan swoich polskich znajomych. Chce Pani/Pan zorganizować dla nich spotkanie. Proszę napisać zaproszenie. 30 słów",
            "wordCount": 30
          },
          {
            "letter": "b",
            "prompt": "Proszę napisać opowiadanie, które zacznie się od zdania: „To były bardzo ciekawe wakacje”. 170 słów",
            "wordCount": 170
          }
        ]
      }
    ]
  },
  {
    "sessionId": "2022-06-25",
    "label": "25–26 czerwca 2022",
    "sourceFile": "exams/2022-06-25/exam-paper.md",
    "writingSets": [
      {
        "setNumber": "I",
        "tasks": [
          {
            "letter": "a",
            "prompt": "Jest Pani właścicielką / Jest Pan właścicielem klubu „Zabawa dla Całej Rodziny” i z okazji Dnia Dziecka organizuje Pani/Pan piknik. Proszę napisać zaproszenie, które zamieści Pani/Pan przed wejściem do klubu.",
            "wordCount": 30
          },
          {
            "letter": "b",
            "prompt": "Zakończyła Pani / Zakończył Pan remont mieszkania. Proszę napisać list do przyjaciółki/przyjaciela z Polski i opisać, jak teraz wyglądają pokoje, kuchnia i łazienka.",
            "wordCount": 170
          }
        ]
      },
      {
        "setNumber": "I",
        "tasks": [
          {
            "letter": "a",
            "prompt": "Pani/Pana polski kolega żeni się w następną sobotę. Proszę napisać życzenia dla młodej pary. 20 słów",
            "wordCount": 20
          },
          {
            "letter": "b",
            "prompt": "Polskie czasopismo „Poznajemy Świat” czeka na teksty od czytelników o ich najciekawszych wyjazdach. Proszę napisać relację ze szczególnie interesującej podróży.",
            "wordCount": 180
          }
        ]
      },
      {
        "setNumber": "I",
        "tasks": [
          {
            "letter": "a",
            "prompt": "Chce Pani/Pan sprzedać lodówkę. Proszę napisać ogłoszenie, które powiesi Pani/Pan na tablicy z ofertami w supermarkecie. 25 słów",
            "wordCount": 25
          },
          {
            "letter": "b",
            "prompt": "Internetowy p ortal edukacyjny ogłosił konkurs na najlepszą nauczycielkę / najlepszego nauczyciela roku. Zgłasza Pani/Pan osobę, którą Pani/Pan lubi i szanuje. Proszę napisać jej charakterystykę i uzasadnić , dlaczego powina dostać nagrodę.",
            "wordCount": 175
          }
        ]
      }
    ]
  },
  {
    "sessionId": "2022-11-05",
    "label": "5–6 listopada 2022",
    "sourceFile": "exams/2022-11-05/exam-paper.md",
    "writingSets": [
      {
        "setNumber": "I",
        "tasks": [
          {
            "letter": "a",
            "prompt": "Zdała Pani / Zdał Pan ważny egzamin i organizuje Pani/Pan kolację. Proszę zaprosić na nią polskich przyjaciół. 30 słów",
            "wordCount": 30
          },
          {
            "letter": "b",
            "prompt": "Polska firma, w której Pani/Pan teraz pracuje, opłaciła Pani/Panu wyjazd na szkolenie. W e -mailu do dyrektora tej firmy p roszę napisać relację z kursu.",
            "wordCount": 170
          }
        ]
      },
      {
        "setNumber": "I",
        "tasks": [
          {
            "letter": "a",
            "prompt": "Wyjechała Pani / wyjechał Pan na zimowy odpoczynek w góry. Proszę napisać pozdrowienia do kolegi/koleżanki z Polski. 25 słów",
            "wordCount": 25
          },
          {
            "letter": "b",
            "prompt": "Szkoła językowa, w której uczy się Pani/Pan polskiego , przygotowuje gazetkę dla studentów . Współpracuje Pani/Pan z redakcją gazetki. O ciekawych spektaklach, filmach, serialach można przeczytać w dziale: „Każdy powinien to obejrzeć!”. Proszę napisać opinię o filmie, który Panią/Pana zainteresował.",
            "wordCount": 175
          }
        ]
      },
      {
        "setNumber": "I",
        "tasks": [
          {
            "letter": "a",
            "prompt": "Szuka Pani/Pan nauczyciela języka polskiego. Proszę napisać ogłoszenie na stronę Naukapolskiego.pl 25 słów",
            "wordCount": 25
          },
          {
            "letter": "b",
            "prompt": "Pani/Pana nauczyciel języka polskiego ogłosił konkurs na najlepszy tekst pt. „Moje wymarzone miasto”. Bierze Pani/Pan udział w konkursie. Proszę opisać miasto, w którym chciałaby Pani / chciałby Pan mieszkać.",
            "wordCount": 175
          }
        ]
      }
    ]
  },
  {
    "sessionId": "2023-02-05",
    "label": "5–6 lutego 2023",
    "sourceFile": "exams/2023-02-05/exam-paper.md",
    "writingSets": [
      {
        "setNumber": "I",
        "tasks": [
          {
            "letter": "a",
            "prompt": "Wyprowadza się Pani/Pan z mieszkania i chce sprzedać meble. Proszę napisać ogłoszenie, które zamieści Pani/Pan na stronie internetowej „Na Sprzedaż“. 35 słów",
            "wordCount": 35
          },
          {
            "letter": "b",
            "prompt": "Proszę napisać charakterystykę członka rodziny, który zajmuje ważne miejsce w Pani/Pana życiu. Tekst ukaże się w lokalnej gazecie w dziale: „Ludzie ważni w moim życiu“.",
            "wordCount": 165
          }
        ]
      },
      {
        "setNumber": "I",
        "tasks": [
          {
            "letter": "a",
            "prompt": "Jest Pani/Pan na wycieczce integracyjnej, w której uczestniczą osoby z kilku krajów. Proszę napisać pozdrowienia do swojej nauczycielki / swojego nauczyciela języka polskiego.",
            "wordCount": 30
          },
          {
            "letter": "b",
            "prompt": "W e -mailu do koleżanki/kolegi z Polski proszę opisać swoją imprezę urodzinową oraz oryginalny prezent, który Pani otrzymała / Pan otrzymał. 170 słów",
            "wordCount": 170
          }
        ]
      },
      {
        "setNumber": "I",
        "tasks": [
          {
            "letter": "a",
            "prompt": "Dyrektor polskiej firmy, w której Pani/Pan pracuje, obchodzi jubileusz – 10 lat pracy. Proszę napisać dla niego życzenia z tej okazji. 30 słów",
            "wordCount": 30
          },
          {
            "letter": "b",
            "prompt": "Na kursie języka polskiego, w którym bierze Pani/Pan udział, ogłoszono konkurs na najciekawsze opowiadanie. Proszę napisać opowiadanie, które zacznie się od zdania „Tego dnia obudziłam się/obudziłem się z bólem głowy“.",
            "wordCount": 170
          }
        ]
      }
    ]
  },
  {
    "sessionId": "2023-04-15",
    "label": "15–16 kwietnia 2023",
    "sourceFile": "exams/2023-04-15/exam-paper.md",
    "writingSets": [
      {
        "setNumber": "I",
        "tasks": [
          {
            "letter": "a",
            "prompt": "Proszę napisać życzenia, które wyśle Pani/Pan do swojej cioci z Polski z okazji jej 70-tych urodzin. 30 słów",
            "wordCount": 30
          },
          {
            "letter": "b",
            "prompt": "Proszę napisać opowiadanie zainspirowane poniższym zdjęciem. Źródło: pixabay. com/pl",
            "wordCount": 170
          }
        ]
      },
      {
        "setNumber": "I",
        "tasks": [
          {
            "letter": "a",
            "prompt": "Jest Pani/Pan członkiem teatru „Maska”, który działa przy szkole języka polskiego. Proszę napisać zaproszenie dla uczniów tej szkoły na premierę nowego spektaklu.",
            "wordCount": 40
          },
          {
            "letter": "b",
            "prompt": "Proszę napisać esej (wypracowanie szkolne) pt. „Lubię to, co robię“. 160 słów",
            "wordCount": 160
          }
        ]
      },
      {
        "setNumber": "I",
        "tasks": [
          {
            "letter": "a",
            "prompt": "Zgubiła Pani / Zgubił Pan torbę sportową (plecak) w parku w Warszawie. Proszę napisać ogłoszenie, które rozwiesi Pani/Pan w okolicy. 35 słów",
            "wordCount": 35
          },
          {
            "letter": "b",
            "prompt": "Planuje Pani/Pan za kilka miesięcy się przeprowadzić. Proszę napisać do koleżanki /kolegi z Polski e-mail na ten temat. 165 słów",
            "wordCount": 165
          }
        ]
      }
    ]
  },
  {
    "sessionId": "2023-06-24",
    "label": "24–25 czerwca 2023",
    "sourceFile": "exams/2023-06-24/exam-paper.md",
    "writingSets": [
      {
        "setNumber": "I",
        "tasks": [
          {
            "letter": "a",
            "prompt": "Chce Pani/Pan doskonalić swój język polski i w zamian uczyć w Polsce swojego języka. Proszę napisać ogłoszenie na tablicę w szkole językowej. 25 słów",
            "wordCount": 25
          },
          {
            "letter": "b",
            "prompt": "W tym roku postanowiła Pani / postanowił Pan dbać o swoje zdrowie. W e-mailu do polskiej koleżanki / polskiego kolegi proszę napisać, co Pani/Pan robi, by dobrze się czuć i lepiej wyglądać.",
            "wordCount": 175
          }
        ]
      },
      {
        "setNumber": "I",
        "tasks": [
          {
            "letter": "a",
            "prompt": "Proszę napisać pozdrowienia z zagranicznej podróży służbowej do polskiego kolegi lub polskiej koleżanki z pracy. 30 słów",
            "wordCount": 30
          },
          {
            "letter": "b",
            "prompt": "Polski portal budowlany „Zmieniamy i Remontujemy“ ogłosił konkurs na najciekawszy opis domu lub mieszkania pt. „Mój dom wygląda teraz jak nowy“. Chce Pani/Pan wziąć w nim udział. Proszę napisać tekst, w którym opisze Pani/Pan swoje mieszkanie / swój dom po remoncie.",
            "wordCount": 170
          }
        ]
      },
      {
        "setNumber": "I",
        "tasks": [
          {
            "letter": "a",
            "prompt": "Wyprowadza się Pani/Pan z Polski . Proszę napisać zaproszenie dla swoich polskich znajomych na kolację z tej okazji. 30 słów",
            "wordCount": 30
          },
          {
            "letter": "b",
            "prompt": "Proszę napisać opowiadanie pod tytułem : „Prawdziwy przyjaciel zawsze ci pomoże”. 170 słów",
            "wordCount": 170
          }
        ]
      }
    ]
  },
  {
    "sessionId": "2023-11-18",
    "label": "18–19 listopada 2023",
    "sourceFile": "exams/2023-11-18/exam-paper.md",
    "writingSets": [
      {
        "setNumber": "I",
        "tasks": [
          {
            "letter": "a",
            "prompt": "Mama Pani/Pana koleżanki/kolegi z Polski obchodzi urodziny. Proszę napisać do niej e-mail z życzeniami z tej okazji. 40",
            "wordCount": null
          },
          {
            "letter": "b",
            "prompt": "„Zwierzę w domu”. Proszę napisać esej (wypracowanie szkolne) na ten temat. 160",
            "wordCount": null
          }
        ]
      },
      {
        "setNumber": "I",
        "tasks": [
          {
            "letter": "a",
            "prompt": "Śpiewa Pani/Pan w zespole muzycznym „Trio”. Proszę napisać ogłoszenie o koncercie, które zamieści Pani/Pan w internecie. 40",
            "wordCount": null
          },
          {
            "letter": "b",
            "prompt": "„Lubię z nią/nim pracować”. Proszę napisać charakterystykę takiej osoby. 160",
            "wordCount": null
          }
        ]
      },
      {
        "setNumber": "I",
        "tasks": [
          {
            "letter": "a",
            "prompt": "Wyjechała Pani / wyjechał Pan na kilka dni, żeby odpocząć w gospodarstwie agroturystycznym. Proszę napisać pozdrowienia do polskich przyjaciół, które wyśle Pani/Pan pocztą tradycyjną. 30",
            "wordCount": null
          },
          {
            "letter": "b",
            "prompt": "Proszę napisać opowiadanie zaczynające się od słów: „Tego dnia jechałam/jechałem pociągiem …”. 170",
            "wordCount": null
          }
        ]
      }
    ]
  },
  {
    "sessionId": "2024-02-04",
    "label": "4–5 lutego 2024",
    "sourceFile": "exams/2024-02-04/exam-paper.md",
    "writingSets": [
      {
        "setNumber": "I",
        "tasks": [
          {
            "letter": "a",
            "prompt": "Robi Pani/Pan remont kuchni i chce Pani/Pan sprzedać używane meble oraz sprzęty kuchene . Proszę napisać ogłoszenie, które zamieści Pani/Pan w internecie.",
            "wordCount": 30
          },
          {
            "letter": "b",
            "prompt": "Proszę napisać opowiadanie, kt óre zaczyna się od zdania: „Tego dnia padał deszcz.” 170 słów",
            "wordCount": 170
          }
        ]
      },
      {
        "setNumber": "I",
        "tasks": [
          {
            "letter": "a",
            "prompt": "Przeprowadziła się Pani / Przeprowadził się Pan do inego miasta w Polsce . Proszę napisać pozdrowienia z nowego miejsca do polskiej koleżanki/polskiego kolegi.",
            "wordCount": 35
          },
          {
            "letter": "b",
            "prompt": "Była Pani / Był Pan na otwarciu nowego centrum sportowego „Wszystko dla Zdrowia”, w którym znajdują się sklepy i sale do ćwiczeń . Proszę napisać sprawozdanie (relację) z tego wydarzenia do polskiej gazety, z którą Pani/Pan współpracuje.",
            "wordCount": 165
          }
        ]
      },
      {
        "setNumber": "I",
        "tasks": [
          {
            "letter": "a",
            "prompt": "Dyrektorka firmy, w której Pani/Pan pracuje, wychodzi za mąż. Proszę napisać życzenia z tej okazji. 30 słów",
            "wordCount": 30
          },
          {
            "letter": "b",
            "prompt": "Proszę napisać esej (wypracowanie szkolne) pt. „Zawsze znajdę czas na moje hoby”. 170 słów",
            "wordCount": 170
          }
        ]
      }
    ]
  },
  {
    "sessionId": "2024-04-20",
    "label": "20–21 kwietnia 2024",
    "sourceFile": "exams/2024-04-20/exam-paper.md",
    "writingSets": [
      {
        "setNumber": "I",
        "tasks": [
          {
            "letter": "a",
            "prompt": "Pracuje Pani/Pan w domu kultury. Organizuje Pani/Pan spotkanie ze znanym podróżnikiem. Proszę napisać zaproszenie, które opublikuje Pani/Pan na stronie internetowej instytucji.",
            "wordCount": 50
          },
          {
            "letter": "b",
            "prompt": "Nie jest Pani zadowolona / Nie jest Pan zadowolony z kursu językowego, na który Pani/Pan chodzi. Proszę o tym napisać w e-mailu do koleżanki/kolegi z Polski.",
            "wordCount": 150
          }
        ]
      },
      {
        "setNumber": "I",
        "tasks": [
          {
            "letter": "a",
            "prompt": "Pracuje Pani/Pan w małej polskiej firmie . Jest Pani/Pan na urlopie. Proszę napisać pozdrowienia do koleżanki/kolegi z pracy. 25 słów",
            "wordCount": 25
          },
          {
            "letter": "b",
            "prompt": "Pani/Pana szkoła języka polskiego ogłosiła konkurs na najciekawszy tekst pt. „Lubię ją/go. Poznaliśmy się w Polsce” . Proszę napisać charakterystykę tej osoby.",
            "wordCount": 175
          }
        ]
      },
      {
        "setNumber": "I",
        "tasks": [
          {
            "letter": "a",
            "prompt": "Szuka Pani/Pan współlokatora do trzypokojowego mieszkania. Proszę napisać ogłoszenie, które opublikuje Pani/Pan w mediach społecznościowych (proszę napisać, co Pani/Pan akceptuje, a na co się nie zgadza w swoim mieszkaniu).",
            "wordCount": 50
          },
          {
            "letter": "b",
            "prompt": "Współpracuje Pani/Pan ze znanym czasopismem „Muzyka” . Proszę napisać relację z koncertu, na którym ostatnio Pani była / Pan był. 150 słów",
            "wordCount": 150
          }
        ]
      }
    ]
  },
  {
    "sessionId": "2024-06-22",
    "label": "22–23 czerwca 2024",
    "sourceFile": "exams/2024-06-22/exam-paper.md",
    "writingSets": [
      {
        "setNumber": "I",
        "tasks": [
          {
            "letter": "a",
            "prompt": "Wyjechała Pani / Wyjechał Pan za granicę na kurs językowy. Proszę napisać pozdrowienia do profesora, który uczył Panią/Pana języka polskiego. Pozdrowienia wyśle Pani/Pan pocztą tradycyjną.",
            "wordCount": 30
          },
          {
            "letter": "b",
            "prompt": "Chce Pani/Pan zrobić remont pokoju dla dziecka / pokoju do pracy . Proszę napisać e-mail do biura architektonicznego z prośbą o przygotowanie projektu i opisać, jak ma wyglądać ten pokój po remoncie.",
            "wordCount": 170
          }
        ]
      },
      {
        "setNumber": "I",
        "tasks": [
          {
            "letter": "a",
            "prompt": "Chce Pani/Pan sprzedać rower swojego dziecka. Proszę napisać ogłoszenie, które opublikuje Pani/Pan na stronie internetowej „Kupno i Sprzedaż”. 40 słów",
            "wordCount": 40
          },
          {
            "letter": "b",
            "prompt": "Wróciła Pani / Wrócił Pan z wakacji. Proszę napisać e-mail do kuzynki z Polski, w którym opisze Pani/Pan, gdzie Pani była / Pan był i jak Pani spędzała / Pan spędzał czas.",
            "wordCount": 160
          }
        ]
      },
      {
        "setNumber": "I",
        "tasks": [
          {
            "letter": "a",
            "prompt": "Proszę zaprosić polskich znajomych na imprezę, którą Pani/Pan organizuje w następny wekend w swoim nowym mieszkaniu. 40 słów",
            "wordCount": 40
          },
          {
            "letter": "b",
            "prompt": "Szkoła języka polskiego, do której chodzi Pani/Pan na zajęcia, ogłosiła konkurs na najlepszy esej z okazji Dnia Rodziny. Proszę napisać esej (wypracowanie szkolne) pt. „Rodzice to najlepsi nauczyciele”.",
            "wordCount": 160
          }
        ]
      }
    ]
  }
] as const;
