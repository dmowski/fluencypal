import { getTotalQuestions } from '../session/quizNavigation';
import { isWritingTextQuestion } from '../types';
import {
  POLISH_B1_WRITING_EXAM_GROUP,
  POLISH_B1_WRITING_EXAMS,
  resolvePolishB1WritingExam,
} from './polishB1Writing/polishB1WritingCatalog';
import {
  POLISH_B1_WRITING_ESTIMATED_MINUTES,
  POLISH_B1_WRITING_EXAM_GROUP_ID,
} from './polishB1Writing/polishB1WritingExam';
import { POLISH_B1_WRITING_VARIANT_COUNT } from '../Polish/writing/variants';

describe('Polish B1 writing exam', () => {
  it('registers 30 variants with two writing tasks each', () => {
    expect(POLISH_B1_WRITING_VARIANT_COUNT).toBe(30);
    expect(POLISH_B1_WRITING_EXAMS).toHaveLength(30);

    for (const exam of POLISH_B1_WRITING_EXAMS) {
      expect(exam.meta.targetLanguageCode).toBe('pl');
      expect(exam.sections).toHaveLength(1);
      expect(exam.sections[0].title).toBe('Pisanie');
      expect(exam.sections[0].moduleId).toBe('writing');
      expect(getTotalQuestions(exam)).toBe(2);
      expect(exam.sections[0].questions.every((q) => isWritingTextQuestion(q))).toBe(true);
    }
  });

  it('exposes a dashboard writing group with variant options', () => {
    expect(POLISH_B1_WRITING_EXAM_GROUP.id).toBe(POLISH_B1_WRITING_EXAM_GROUP_ID);
    expect(POLISH_B1_WRITING_EXAM_GROUP.variants).toHaveLength(30);
    expect(POLISH_B1_WRITING_EXAM_GROUP.estimatedMinutes).toBe(POLISH_B1_WRITING_ESTIMATED_MINUTES);
  });

  it('resolves exams by variant id and random flag', () => {
    const byVariant = resolvePolishB1WritingExam('v03');
    expect(byVariant?.id).toBe('exam_pl_b1-writing_v03');

    const randomExam = resolvePolishB1WritingExam('', true);
    expect(randomExam?.id.startsWith('exam_pl_b1-writing_v')).toBe(true);
  });
});
