import { TextAiContextType } from '@/features/Ai/types';
import {
  buildFollowUpQuestionMessages,
  claimFollowUpQuestion,
  coerceFollowUpQuestionResponse,
  followUpQuestionHash,
  generateFollowUpQuestion,
  isFollowUpQuestionReady,
  releaseFollowUpQuestion,
  resetFollowUpQuestionClaims,
} from './followUpQuestion';

describe('followUpQuestion', () => {
  beforeEach(() => {
    resetFollowUpQuestionClaims();
  });

  it('asks in the page language about the recording', () => {
    const messages = buildFollowUpQuestionMessages({
      transcript: 'Хочу пройти собеседование врачом.',
      languageName: 'Russian',
    });

    expect(messages.systemMessage).toContain('Russian');
    expect(messages.systemMessage).toContain('concrete detail');
    expect(messages.userMessage).toContain('Хочу пройти собеседование врачом.');
  });

  it('treats the same recording in another language as a new question', () => {
    const transcript = 'I want to pass a job interview. I am a doctor.';
    expect(followUpQuestionHash(transcript, 'en')).not.toBe(followUpQuestionHash(transcript, 'ru'));
    expect(followUpQuestionHash('  ', 'en')).toBe('');
  });

  it('starts one generation and skips it after that question is saved', () => {
    const transcript = 'I want to pass a job interview. I am a doctor.';
    const first = claimFollowUpQuestion(transcript, 'ru', { title: '', hash: '' });
    const second = claimFollowUpQuestion(transcript, 'ru', { title: '', hash: '' });

    expect(first).toEqual(expect.any(String));
    expect(second).toBeNull();

    releaseFollowUpQuestion(first || '');
    expect(
      claimFollowUpQuestion(transcript, 'ru', {
        title: 'Какую работу вы хотите объяснить на собеседовании?',
        hash: first || '',
      }),
    ).toBeNull();
    expect(
      isFollowUpQuestionReady(
        {
          title: 'Какую работу вы хотите объяснить на собеседовании?',
          hash: first || '',
        },
        transcript,
        'ru',
      ),
    ).toBe(true);
  });

  it('returns the question the model wrote for this recording', async () => {
    const textAi = {
      generate: jest.fn(async () =>
        JSON.stringify({ title: 'Какие случаи вам нужно объяснять пациентам?' }),
      ),
    } as unknown as TextAiContextType;

    await expect(
      generateFollowUpQuestion({
        textAi,
        transcript: 'Я врач и готовлюсь к собеседованию.',
        languageCode: 'ru',
      }),
    ).resolves.toBe('Какие случаи вам нужно объяснять пациентам?');

    const request = (textAi.generate as jest.Mock).mock.calls[0][0];
    expect(request.languageCode).toBe('ru');
    expect(request.userMessage).toContain('Я врач и готовлюсь к собеседованию.');
    expect(request.systemMessage).toContain('Russian');
    expect(request.systemMessage).toContain('no question written outside');
  });

  it('uses the question written beside a placeholder JSON object', async () => {
    const textAi = {
      generate: jest.fn(
        async () => `Which meeting, such as a client call, do you want to handle in English?

{ "title": "Follow-up Question" }`,
      ),
    } as unknown as TextAiContextType;

    await expect(
      generateFollowUpQuestion({
        textAi,
        transcript: 'I freeze when a meeting starts.',
        languageCode: 'en',
      }),
    ).resolves.toBe('Which meeting, such as a client call, do you want to handle in English?');
    expect(textAi.generate).toHaveBeenCalledTimes(1);
  });

  it('keeps a valid JSON title when the model also wrote a question', () => {
    const raw = `Which cafe should we visit?\n{"title":"Which meeting do you want to handle?"}`;
    expect(JSON.parse(coerceFollowUpQuestionResponse(raw))).toEqual({
      title: 'Which meeting do you want to handle?',
    });
  });
});
