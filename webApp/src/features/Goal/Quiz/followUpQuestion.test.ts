import { TextAiContextType } from '@/features/Ai/types';
import {
  buildFollowUpQuestionMessages,
  claimFollowUpQuestion,
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
      generateStrictJson: jest.fn(async () => ({
        parsed: { title: 'Какие случаи вам нужно объяснять пациентам?' },
        rawOutput: '',
      })),
    } as unknown as TextAiContextType;

    await expect(
      generateFollowUpQuestion({
        textAi,
        transcript: 'Я врач и готовлюсь к собеседованию.',
        languageCode: 'ru',
      }),
    ).resolves.toBe('Какие случаи вам нужно объяснять пациентам?');

    const request = (textAi.generateStrictJson as jest.Mock).mock.calls[0][0];
    expect(request.languageCode).toBe('ru');
    expect(request.userMessage).toContain('Я врач и готовлюсь к собеседованию.');
    expect(request.systemMessage).toContain('Russian');
  });
});
