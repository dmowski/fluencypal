import { buildExplainAnswerPrompt } from './buildExplainAnswerPrompt';
import { buildVoiceEvaluationPrompt, parseVoiceEvaluationResponse } from './scoreQuestion';

describe('buildExplainAnswerPrompt', () => {
  it('requires Why explanations in the target language', () => {
    const { systemMessage } = buildExplainAnswerPrompt(
      {
        type: 'read-and-answer',
        id: 'q-1',
        passageText: 'Tekst.',
        questionText: 'Pytanie?',
        options: [
          { id: 'opt-0', label: 'A' },
          { id: 'opt-1', label: 'B' },
        ],
        correctOptionId: 'opt-1',
      },
      {
        questionId: 'q-1',
        questionType: 'read-and-answer',
        payload: { kind: 'multiple-choice', selectedOptionId: 'opt-0' },
        updatedAtIso: new Date().toISOString(),
      },
      'pl',
    );

    expect(systemMessage).toContain('Polski (pl)');
    expect(systemMessage).not.toContain('UI language');
    expect(systemMessage).toContain('How to avoid this next time');
    expect(systemMessage).not.toContain('encouraging');
  });

  it('includes selected and correct option labels in the user message', () => {
    const { userMessage } = buildExplainAnswerPrompt(
      {
        type: 'read-and-answer',
        id: 'q-1',
        passageText: 'Tekst.',
        questionText: 'Pytanie?',
        options: [
          { id: 'opt-0', label: 'Wrong choice' },
          { id: 'opt-1', label: 'Right choice' },
        ],
        correctOptionId: 'opt-1',
      },
      {
        questionId: 'q-1',
        questionType: 'read-and-answer',
        payload: { kind: 'multiple-choice', selectedOptionId: 'opt-0' },
        updatedAtIso: new Date().toISOString(),
      },
      'en',
    );

    expect(userMessage).toContain('Wrong choice');
    expect(userMessage).toContain('Right choice');
  });
});

describe('buildVoiceEvaluationPrompt', () => {
  it('requires speaking feedback in the target language', () => {
    const { systemMessage } = buildVoiceEvaluationPrompt(
      {
        type: 'describe-picture-voice',
        id: 'q-voice',
        imageUrl: 'https://example.com/image.jpg',
        imageDescription: 'A rocket.',
        promptText: 'Opisz obraz.',
        evaluation: { instruction: 'Grade the answer.' },
      },
      'To jest rakieta.',
      'pl',
    );

    expect(systemMessage).toContain('Polski (pl)');
    expect(systemMessage).toContain('Feedback:');
  });
});

describe('parseVoiceEvaluationResponse', () => {
  it('returns only the feedback section for display', () => {
    const result = parseVoiceEvaluationResponse(
      'q-voice',
      `Status: partial
Score: 0.5
Feedback: Dobra próba, ale brakuje kilku szczegółów.`,
    );

    expect(result.feedback).toBe('Dobra próba, ale brakuje kilku szczegółów.');
    expect(result.status).toBe('partial');
  });
});
