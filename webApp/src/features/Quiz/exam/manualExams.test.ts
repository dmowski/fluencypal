import { getTotalQuestions } from '../session/quizNavigation';
import {
  isDescribePictureVoiceQuestion,
  isFillGapQuestion,
  isListeningQuestion,
  isReadAndAnswerQuestion,
  isWordTranslationQuestion,
} from '../types';
import { ENGLISH_B2_EXAM } from './englishB2Exam';
import { ENGLISH_C1_EXAM } from './englishC1Exam';
import { EXAM_LEVEL_CONFIG } from './examLevelConfig';
import {
  EXAM_CATALOG,
  getExamCatalogForTargetLanguage,
} from './examCatalog';
import { getManualExamsForTargetLanguage } from './manualExams';
import { getMaxConsecutiveForCategory } from './buildMixedExamSections';
import { POLISH_KNOWLEDGE_EXAM } from './polishKnowledgeExam';
import { POLISH_KNOWLEDGE_EXAM_COUNTS, POLISH_KNOWLEDGE_EXAM_ESTIMATED_MINUTES } from './polishKnowledgeExamContent';
import { POLISH_A2_EXAM, POLISH_B1_EXAM, POLISH_B2_EXAM } from './polishExams';

const validateExamStructure = (exam: typeof ENGLISH_B2_EXAM) => {
  expect(exam.meta.nativeLanguageCode).toBeNull();
  expect(
    exam.sections.every((section) =>
      section.questions.every((question) => !isWordTranslationQuestion(question)),
    ),
  ).toBe(true);

  for (const section of exam.sections) {
    for (const question of section.questions) {
      if (isReadAndAnswerQuestion(question) || isListeningQuestion(question)) {
        const optionIds = new Set(question.options.map((option) => option.id));
        expect(optionIds.has(question.correctOptionId)).toBe(true);
      }

      if (isFillGapQuestion(question)) {
        for (const gap of Object.values(question.gaps)) {
          const optionIds = new Set(gap.options.map((option) => option.id));
          expect(optionIds.has(gap.correctOptionId)).toBe(true);
        }
      }

      if (isDescribePictureVoiceQuestion(question)) {
        expect(question.imageDescription.length).toBeGreaterThan(80);
      }
    }
  }
};

describe('manual exams', () => {
  it('registers English B2, C1, Polish knowledge test, three Polish levels, and state B1 exam', () => {
    expect(EXAM_CATALOG).toHaveLength(7);
    expect(getManualExamsForTargetLanguage('en')).toHaveLength(2);
    expect(getManualExamsForTargetLanguage('pl')).toHaveLength(4);
    expect(getExamCatalogForTargetLanguage('pl')).toHaveLength(5);
    expect(getExamCatalogForTargetLanguage('de')).toHaveLength(0);
  });

  it('filters dashboard catalog by target language', () => {
    expect(getExamCatalogForTargetLanguage('en').map((exam) => exam.title)).toEqual([
      'English B2 exam',
      'English C1 exam',
    ]);
    expect(getExamCatalogForTargetLanguage('pl').map((exam) => exam.title)).toEqual([
      'Test mojej wiedzy',
      'Polish A2 exam',
      'Polish B1 exam',
      'Polish B2 exam',
      'Państwowy egzamin B1 — wersja próbna 1',
    ]);
  });

  it('builds the Polish knowledge exam as a long mixed diagnostic test', () => {
    const expectedTotal =
      POLISH_KNOWLEDGE_EXAM_COUNTS.reading +
      POLISH_KNOWLEDGE_EXAM_COUNTS.listening +
      POLISH_KNOWLEDGE_EXAM_COUNTS.grammar +
      POLISH_KNOWLEDGE_EXAM_COUNTS.speaking;

    expect(getTotalQuestions(POLISH_KNOWLEDGE_EXAM)).toBe(expectedTotal);
    expect(POLISH_KNOWLEDGE_EXAM.meta.estimatedMinutes).toBe(POLISH_KNOWLEDGE_EXAM_ESTIMATED_MINUTES);
    expect(POLISH_KNOWLEDGE_EXAM.examEvaluation.autoRequestDetailedFeedback).toBe(true);
    expect(getMaxConsecutiveForCategory(POLISH_KNOWLEDGE_EXAM.sections, 'reading')).toBeLessThanOrEqual(2);
    expect(getMaxConsecutiveForCategory(POLISH_KNOWLEDGE_EXAM.sections, 'listening')).toBeLessThanOrEqual(2);
    validateExamStructure(POLISH_KNOWLEDGE_EXAM);
  });

  it('sizes Polish exams by CEFR level', () => {
    expect(getTotalQuestions(POLISH_A2_EXAM)).toBe(23);
    expect(getTotalQuestions(POLISH_B1_EXAM)).toBe(27);
    expect(getTotalQuestions(POLISH_B2_EXAM)).toBe(31);
    expect(POLISH_A2_EXAM.meta.estimatedMinutes).toBe(EXAM_LEVEL_CONFIG.a2.estimatedMinutes);
    expect(POLISH_B1_EXAM.meta.estimatedMinutes).toBe(EXAM_LEVEL_CONFIG.b1.estimatedMinutes);
    expect(POLISH_B2_EXAM.meta.estimatedMinutes).toBe(EXAM_LEVEL_CONFIG.b2.estimatedMinutes);
  });

  it('sizes English C1 exam by CEFR level', () => {
    expect(getTotalQuestions(ENGLISH_C1_EXAM)).toBe(37);
    expect(ENGLISH_C1_EXAM.meta.estimatedMinutes).toBe(EXAM_LEVEL_CONFIG.c1.estimatedMinutes);
  });

  it('keeps English and Polish exams language-specific', () => {
    expect(ENGLISH_B2_EXAM.meta.targetLanguageCode).toBe('en');
    expect(ENGLISH_C1_EXAM.meta.targetLanguageCode).toBe('en');
    expect(POLISH_B2_EXAM.meta.targetLanguageCode).toBe('pl');
    validateExamStructure(ENGLISH_B2_EXAM);
    validateExamStructure(ENGLISH_C1_EXAM);
    validateExamStructure(POLISH_B2_EXAM);
  });
});
