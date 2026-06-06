import { getTotalQuestions } from '../session/quizNavigation';
import {
  isDescribePictureVoiceQuestion,
  isFillGapQuestion,
  isListeningQuestion,
  isReadAndAnswerQuestion,
  isWordTranslationQuestion,
} from '../types';
import { ENGLISH_B2_EXAM } from './englishB2Exam';
import { EXAM_LEVEL_CONFIG } from './examLevelConfig';
import {
  EXAM_CATALOG,
  getExamCatalogForTargetLanguage,
} from './examCatalog';
import { getManualExamsForTargetLanguage } from './manualExams';
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
  it('registers English B2 and three Polish levels', () => {
    expect(EXAM_CATALOG).toHaveLength(4);
    expect(getManualExamsForTargetLanguage('en')).toHaveLength(1);
    expect(getManualExamsForTargetLanguage('pl')).toHaveLength(3);
    expect(getManualExamsForTargetLanguage('de')).toHaveLength(0);
  });

  it('filters dashboard catalog by target language', () => {
    expect(getExamCatalogForTargetLanguage('en').map((exam) => exam.title)).toEqual([
      'English B2 exam',
    ]);
    expect(getExamCatalogForTargetLanguage('pl').map((exam) => exam.title)).toEqual([
      'Polish A2 exam',
      'Polish B1 exam',
      'Polish B2 exam',
    ]);
  });

  it('sizes Polish exams by CEFR level', () => {
    expect(getTotalQuestions(POLISH_A2_EXAM)).toBe(23);
    expect(getTotalQuestions(POLISH_B1_EXAM)).toBe(27);
    expect(getTotalQuestions(POLISH_B2_EXAM)).toBe(31);
    expect(POLISH_A2_EXAM.meta.estimatedMinutes).toBe(EXAM_LEVEL_CONFIG.a2.estimatedMinutes);
    expect(POLISH_B1_EXAM.meta.estimatedMinutes).toBe(EXAM_LEVEL_CONFIG.b1.estimatedMinutes);
    expect(POLISH_B2_EXAM.meta.estimatedMinutes).toBe(EXAM_LEVEL_CONFIG.b2.estimatedMinutes);
  });

  it('keeps English and Polish exams language-specific', () => {
    expect(ENGLISH_B2_EXAM.meta.targetLanguageCode).toBe('en');
    expect(POLISH_B2_EXAM.meta.targetLanguageCode).toBe('pl');
    validateExamStructure(ENGLISH_B2_EXAM);
    validateExamStructure(POLISH_B2_EXAM);
  });
});
