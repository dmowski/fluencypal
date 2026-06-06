import { buildManualExamSections } from './buildManualExamSections';
import { buildManualExamDocument } from './buildManualExamDocument';
import {
  ENGLISH_C1_GRAMMAR_ITEMS,
  ENGLISH_C1_LISTENING_ITEMS,
  ENGLISH_C1_READING_PASSAGES,
} from './englishC1ExamContent';
import { ENGLISH_EXAM_SPEAKING_IMAGES } from './examSpeakingImages';

export const ENGLISH_C1_EXAM_ID = 'exam_english-c1';

export const ENGLISH_C1_EXAM = buildManualExamDocument({
  id: ENGLISH_C1_EXAM_ID,
  targetLanguageCode: 'en',
  level: 'c1',
  label: 'English C1 exam',
  title: 'English C1 exam',
  description:
    'A full-length C1 practice exam with reading, listening, grammar, and speaking tasks. Content is in English and works for learners with any native language.',
  sections: buildManualExamSections({
    targetLanguageCode: 'en',
    languageName: 'English',
    level: 'c1',
    reading: ENGLISH_C1_READING_PASSAGES,
    listening: ENGLISH_C1_LISTENING_ITEMS,
    grammar: ENGLISH_C1_GRAMMAR_ITEMS,
    speakingImages: ENGLISH_EXAM_SPEAKING_IMAGES,
  }),
  examEvaluationInstruction:
    'Summarise C1 exam performance across reading, listening, grammar, and speaking. Highlight strengths, recurring mistakes, and practical next steps for reaching a solid C1 level.',
});
