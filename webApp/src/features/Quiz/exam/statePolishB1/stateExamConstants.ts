export const STATE_B1_MODULE_MAX_SCORE = {
  listening: 30,
  reading: 30,
  grammar: 30,
  writing: 30,
  speaking: 40,
} as const;

export const STATE_B1_MODULE_TIME_MINUTES = {
  listening: 30,
  reading: 40,
  grammar: 45,
  writing: 75,
  speaking: 15,
} as const;

export const STATE_B1_ESTIMATED_MINUTES = 205;

export const WRITING_EVALUATION_INSTRUCTION = `Oceń wypowiedź pisemną na poziomie B1 według oficjalnych kryteriów egzaminu certyfikatowego:
1. Wykonanie zadania (treść, forma, objętość) — czy odpowiedź spełnia polecenie, ma właściwą formę i mieści się w wymaganej liczbie słów.
2. Środki językowe (leksyka, frazeologia, składnia, styl) — czy słownictwo i konstrukcje są adekwatne do poziomu B1 i typu tekstu.
3. Poprawność językowa (gramatyka, ortografia, interpunkcja) — toleruj drobne błędy typowe dla B1, ale obniż ocenę przy powtarzających się błędach.

Przyznaj łącznie 0–10 punktów (możesz używać połówek). W Feedback podaj krótkie uzasadnienie po polsku z wskazaniem mocnych stron i 1–2 rzeczy do poprawy.`;

export const MONOLOGUE_EVALUATION_INSTRUCTION = `Oceń monolog ustny na poziomie B1. Sprawdź:
- czy wypowiedź dotyczy tematu i ma sensowną strukturę (wstęp, rozwinięcie, zakończenie),
- płynność i spójność,
- zakres słownictwa i poprawność gramatyczną adekwatną do B1.

Przyznaj 0–10 punktów. W Feedback napisz 2–4 zdania po polsku z konkretną radą.`;

export const PICTURE_SPEAKING_EVALUATION_INSTRUCTION = `Oceń opis ilustracji na poziomie B1. Sprawdź, czy kandydat:
- opisuje to, co widać na zdjęciu,
- interpretuje sytuację,
- używa połączonych zdań i słownictwa na poziomie B1.

Przyznaj 0–10 punktów. W Feedback napisz 2–4 zdania po polsku.`;

export const SITUATIONAL_SPEAKING_EVALUATION_INSTRUCTION = `Oceń wypowiedź w sytuacji komunikacyjnej na poziomie B1. Sprawdź, czy kandydat:
- wykonuje zadanie zgodnie z instrukcją (np. prośba, reklamacja, pytanie),
- używa odpowiedniego rejestru i form grzecznościowych,
- mówi płynnie i zrozumiale.

Przyznaj 0–10 punktów. W Feedback napisz 2–4 zdania po polsku.`;
