import { buildManualExamSections } from './buildManualExamSections';
import { buildManualExamDocument } from './buildManualExamDocument';
import { ExamCefrLevel } from './examLevelConfig';

type PolishExamLevel = Exclude<ExamCefrLevel, 'c1'>;
import { POLISH_EXAM_SPEAKING_IMAGES } from './examSpeakingImages';
import {
  getPolishGrammarContent,
  POLISH_LISTENING_ITEMS,
  POLISH_READING_PASSAGES,
} from './polishExamContent';

const POLISH_LEVEL_LABELS: Record<PolishExamLevel, string> = {
  a2: 'Polish A2 exam',
  b1: 'Polish B1 exam',
  b2: 'Polish B2 exam',
};

const buildPolishExam = (level: PolishExamLevel) => {
  const label = POLISH_LEVEL_LABELS[level];
  const sections = buildManualExamSections({
    targetLanguageCode: 'pl',
    languageName: 'Polski',
    level,
    reading: POLISH_READING_PASSAGES,
    listening: POLISH_LISTENING_ITEMS,
    grammar: getPolishGrammarContent(level),
    speakingImages: POLISH_EXAM_SPEAKING_IMAGES,
  });

  return buildManualExamDocument({
    targetLanguageCode: 'pl',
    level,
    label,
    title: label,
    description:
      'Pełny egzamin próbny po polsku z czytaniem, słuchaniem, gramatyką i mówieniem. Treść jest po polsku i działa dla uczących się z dowolnym językiem ojczystym.',
    sections,
    examEvaluationInstruction:
      'Podsumuj wynik egzaminu {language} z sekcji czytanie, słuchanie, gramatyka i mówienie. Wskaż mocne strony, powtarzające się błędy i praktyczne kroki do poprawy na tym poziomie.',
  });
};

export const POLISH_A2_EXAM_ID = 'exam_pl_a2';
export const POLISH_B1_EXAM_ID = 'exam_pl_b1';
export const POLISH_B2_EXAM_ID = 'exam_pl_b2';

export const POLISH_A2_EXAM = buildPolishExam('a2');
export const POLISH_B1_EXAM = buildPolishExam('b1');
export const POLISH_B2_EXAM = buildPolishExam('b2');
