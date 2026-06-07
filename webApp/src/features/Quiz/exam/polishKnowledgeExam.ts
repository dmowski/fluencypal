import { buildManualExamDocument } from './buildManualExamDocument';
import { buildMixedExamSections } from './buildMixedExamSections';
import { POLISH_EXAM_SPEAKING_IMAGES } from './examSpeakingImages';
import {
  POLISH_KNOWLEDGE_EXAM_COUNTS,
  POLISH_KNOWLEDGE_EXAM_ESTIMATED_MINUTES,
  POLISH_KNOWLEDGE_GRAMMAR,
  POLISH_KNOWLEDGE_LISTENING,
  POLISH_KNOWLEDGE_READING,
} from './polishKnowledgeExamContent';

export const POLISH_KNOWLEDGE_EXAM_ID = 'exam_pl_knowledge';

const POLISH_KNOWLEDGE_DESCRIPTION = `Ten egzamin diagnozuje Twój aktualny poziom języka polskiego. Zadania z różnych dziedzin — **czytanie**, **słuchanie**, **gramatyka** i **mówienie** — są przeplatane, żeby sprawdzić szeroki zakres umiejętności bez długich serii jednego typu.

**Co otrzymasz po zakończeniu:**
- Szacowany poziom CEFR (A2–B2+)
- Opis mocnych stron i obszarów wymagających poprawy
- Konkretne wskazówki, na czym się skupić w nauce

**Czas:** ok. 2 godziny. Możesz robić przerwy — postęp jest zapisywany automatycznie.`;

const sections = buildMixedExamSections({
  targetLanguageCode: 'pl',
  languageName: 'Polski',
  reading: POLISH_KNOWLEDGE_READING,
  listening: POLISH_KNOWLEDGE_LISTENING,
  grammar: POLISH_KNOWLEDGE_GRAMMAR,
  speakingImages: POLISH_EXAM_SPEAKING_IMAGES,
  counts: POLISH_KNOWLEDGE_EXAM_COUNTS,
  speakingMinWords: 30,
});

export const POLISH_KNOWLEDGE_EXAM = buildManualExamDocument({
  id: POLISH_KNOWLEDGE_EXAM_ID,
  targetLanguageCode: 'pl',
  label: 'Test mojej wiedzy',
  title: 'Test mojej wiedzy',
  description: POLISH_KNOWLEDGE_DESCRIPTION,
  sections,
  estimatedMinutes: POLISH_KNOWLEDGE_EXAM_ESTIMATED_MINUTES,
  passingScorePercent: 0,
  autoRequestDetailedFeedback: true,
  examEvaluationInstruction: `Oceń wyniki egzaminu diagnostycznego z języka {language}. Na podstawie wyników z każdej umiejętności (czytanie, słuchanie, gramatyka, mówienie) określ szacowany poziom CEFR użytkownika (A2, B1, B2 lub wyżej). Podaj szczegółowy opis mocnych stron i obszarów wymagających poprawy. Zasugeruj 3 konkretne kroki nauki skupione na słabszych obszarach.`,
});
