import { FillGapQuestion, QuizAnswer } from '../types';
import { scoreFillGap, scoreMultipleChoice, scoreQuestion } from './scoreQuestion';

describe('scoreMultipleChoice', () => {
  it('marks correct selection', () => {
    const result = scoreMultipleChoice('q1', 'opt-1', 'opt-1');
    expect(result.status).toBe('correct');
    expect(result.score).toBe(1);
  });

  it('marks incorrect selection', () => {
    const result = scoreMultipleChoice('q1', 'opt-2', 'opt-1');
    expect(result.status).toBe('incorrect');
    expect(result.score).toBe(0);
  });
});

describe('scoreFillGap', () => {
  const question: FillGapQuestion = {
    type: 'fill-gap',
    id: 'q-gap',
    segments: [
      { kind: 'text', text: 'I ' },
      { kind: 'gap', gapId: 'g1' },
      { kind: 'text', text: ' coffee.' },
    ],
    gaps: {
      g1: {
        options: [
          { id: 'a', label: 'like' },
          { id: 'b', label: 'likes' },
        ],
        correctOptionId: 'a',
      },
    },
  };

  it('scores partial when one of multiple gaps is wrong', () => {
    const result = scoreFillGap(question, { g1: 'b' });
    expect(result.status).toBe('incorrect');
  });

  it('scores correct when all gaps match', () => {
    const result = scoreFillGap(question, { g1: 'a' });
    expect(result.status).toBe('correct');
  });
});

describe('scoreQuestion', () => {
  it('scores read-and-answer via multiple choice payload', () => {
    const answer: QuizAnswer = {
      questionId: 'q1',
      questionType: 'read-and-answer',
      payload: { kind: 'multiple-choice', selectedOptionId: 'opt-0' },
      updatedAtIso: new Date().toISOString(),
    };
    const result = scoreQuestion(
      {
        type: 'read-and-answer',
        id: 'q1',
        passageText: 'Text',
        questionText: 'Q?',
        options: [{ id: 'opt-0', label: 'A' }],
        correctOptionId: 'opt-0',
      },
      answer,
    );
    expect(result.status).toBe('correct');
  });
});
