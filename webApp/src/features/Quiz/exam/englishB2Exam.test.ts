import { getTotalQuestions } from '../session/quizNavigation';
import {
  isDescribePictureVoiceQuestion,
  isFillGapQuestion,
  isReadAndAnswerQuestion,
  isListeningQuestion,
  isWordTranslationQuestion,
} from '../types';
import { ENGLISH_B2_EXAM, ENGLISH_B2_EXAM_ID } from './englishB2Exam';
import { ENGLISH_B2_EXAM_IMAGES } from './englishB2ExamImages';
import { EXAM_CATALOG } from './examCatalog';

describe('ENGLISH_B2_EXAM', () => {
  it('defines a manual one-hour B2 exam', () => {
    expect(ENGLISH_B2_EXAM.id).toBe(ENGLISH_B2_EXAM_ID);
    expect(ENGLISH_B2_EXAM.source).toEqual({ type: 'manual', label: 'English B2 exam' });
    expect(ENGLISH_B2_EXAM.meta.targetLanguageCode).toBe('en');
    expect(ENGLISH_B2_EXAM.meta.nativeLanguageCode).toBeNull();
    expect(ENGLISH_B2_EXAM.meta.estimatedMinutes).toBe(60);
  });

  it('includes reading, listening, grammar, and speaking only', () => {
    const sectionTitles = ENGLISH_B2_EXAM.sections.map((section) => section.title);
    expect(sectionTitles).toEqual(['Reading', 'Listening', 'Grammar', 'Speaking']);
    expect(
      ENGLISH_B2_EXAM.sections.every((section) =>
        section.questions.every((question) => !isWordTranslationQuestion(question)),
      ),
    ).toBe(true);
  });

  it('contains 31 tasks with five speaking images', () => {
    expect(getTotalQuestions(ENGLISH_B2_EXAM)).toBe(31);
    const speakingQuestions = ENGLISH_B2_EXAM.sections
      .flatMap((section) => section.questions)
      .filter(isDescribePictureVoiceQuestion);
    expect(speakingQuestions).toHaveLength(5);
    expect(speakingQuestions.map((question) => question.imageUrl)).toEqual(
      ENGLISH_B2_EXAM_IMAGES.map((image) => image.imageUrl),
    );
  });

  it('keeps multiple-choice correct answers aligned with option ids', () => {
    for (const section of ENGLISH_B2_EXAM.sections) {
      for (const question of section.questions) {
        if (
          isReadAndAnswerQuestion(question) ||
          isListeningQuestion(question)
        ) {
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
          expect(question.evaluation.instruction).toContain(question.imageDescription);
        }
      }
    }
  });
});

describe('EXAM_CATALOG', () => {
  it('lists the English B2 exam for the dashboard', () => {
    expect(EXAM_CATALOG).toHaveLength(1);
    expect(EXAM_CATALOG[0]?.title).toBe('English B2 exam');
    expect(EXAM_CATALOG[0]?.quiz.id).toBe(ENGLISH_B2_EXAM_ID);
  });
});
