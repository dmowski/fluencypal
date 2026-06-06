import { QuizDocument } from '../types';
import { getGlobalQuestionNumber, getTotalQuestions } from './quizNavigation';

const sampleQuiz: QuizDocument = {
  id: 'q1',
  schemaVersion: 1,
  source: { type: 'news', newsId: 'n1', complexity: 'middle', articleTitle: 'T' },
  meta: {
    title: 'Quiz',
    targetLanguageCode: 'en',
    nativeLanguageCode: 'pl',
  },
  sections: [
    {
      id: 's0',
      title: 'A',
      questions: [
        { type: 'fill-gap', id: 'q0', segments: [], gaps: {} },
        { type: 'fill-gap', id: 'q1', segments: [], gaps: {} },
      ],
    },
    {
      id: 's1',
      title: 'B',
      questions: [{ type: 'listening', id: 'q2', audioText: '', questionText: '', options: [], correctOptionId: '' }],
    },
  ],
  examEvaluation: { instruction: 'sum' },
  createdAtIso: '2026-01-01',
};

describe('quizNavigation', () => {
  it('counts total questions across sections', () => {
    expect(getTotalQuestions(sampleQuiz)).toBe(3);
  });

  it('returns 1-based global question number', () => {
    expect(getGlobalQuestionNumber(sampleQuiz, 0, 0)).toBe(1);
    expect(getGlobalQuestionNumber(sampleQuiz, 0, 1)).toBe(2);
    expect(getGlobalQuestionNumber(sampleQuiz, 1, 0)).toBe(3);
  });
});
