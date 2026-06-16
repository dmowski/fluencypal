import { QuizDocument, QUIZ_SCHEMA_VERSION } from '../../types';
import { buildStatePolishB1Sections } from './buildStatePolishB1Sections';
import { PILOT_V01_CONTENT, PILOT_V01_CONTENT_HASH } from './pilotV01Content';
import { STATE_B1_ESTIMATED_MINUTES } from './stateExamConstants';

export const POLISH_B1_STATE_EXAM_V01_ID = 'exam_pl-b1-state_v01';

export const buildPolishB1StateExamV01 = (): QuizDocument => ({
  id: POLISH_B1_STATE_EXAM_V01_ID,
  schemaVersion: QUIZ_SCHEMA_VERSION,
  source: {
    type: 'state-exam',
    level: 'b1',
    variantId: 'v01',
    targetLanguageCode: 'pl',
    contentHash: PILOT_V01_CONTENT_HASH,
    generationPromptVersion: 'hand-authored-pilot-v01',
  },
  meta: {
    title: 'Państwowy egzamin B1 — wersja próbna 1',
    description:
      'Egzamin próbny w formacie państwowego egzaminu certyfikatowego z języka polskiego na poziomie B1 (grupa dorosłych). Składa się z pięciu modułów: słuchanie, czytanie, gramatyka, pisanie i mówienie. Treść jest oryginalna — inspirowana formatem urzędowym, nie skopiowana z arkuszy egzaminacyjnych.\n\nMożesz robić przerwy między modułami i wracać później — postęp zostanie zapisany.',
    targetLanguageCode: 'pl',
    nativeLanguageCode: null,
    estimatedMinutes: STATE_B1_ESTIMATED_MINUTES,
  },
  sections: buildStatePolishB1Sections(PILOT_V01_CONTENT),
  examEvaluation: {
    instruction:
      'Podsumuj wynik egzaminu certyfikatowego B1 z pięciu modułów. Wskaż, które moduły zostały zaliczone (≥50%), gdzie są największe braki i jakie konkretne kroki pomoże kandydatowi przygotować się do prawdziwego egzaminu państwowego.',
    passingScorePercent: 0,
  },
  createdAtIso: '2026-06-16T00:00:00.000Z',
});

export const POLISH_B1_STATE_EXAM_V01 = buildPolishB1StateExamV01();
