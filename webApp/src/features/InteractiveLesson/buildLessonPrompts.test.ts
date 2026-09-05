import {
  buildFirstLessonUserPrompt,
  buildLessonSystemPrompt,
  buildNextLessonUserPrompt,
  buildSpeechFeedbackSystemPrompt,
  buildSpeechFeedbackUserPrompt,
} from './buildLessonPrompts';
import { LessonGenerationContext } from './types';

const context = (overrides: Partial<LessonGenerationContext> = {}): LessonGenerationContext => ({
  conversationText: '',
  conversationMessageCount: 0,
  userGoalText: '',
  previousLessonsSummary: '',
  openTalkSummary: '',
  recentFormsSummary: '- This week: present continuous — Use I’m ...-ing for now',
  ...overrides,
});

describe('buildLessonPrompts', () => {
  it('bans recent forms on the next lesson', () => {
    const prompt = buildNextLessonUserPrompt(context());

    expect(prompt).toContain('Already covered (banned)');
    expect(prompt).toContain('This week: present continuous');
    expect(prompt).toContain('close variant');
  });

  it('bans recent forms on the first lesson too', () => {
    const prompt = buildFirstLessonUserPrompt(context());

    expect(prompt).toContain('Already covered (banned)');
    expect(prompt).toContain('This week: present continuous');
  });

  it('asks for a longer how-to explanation and a read-aloud speech part', () => {
    const prompt = buildLessonSystemPrompt({
      targetLanguageName: 'English',
      nativeLanguageName: 'Polish',
    });

    expect(prompt).toContain('4-5 short paragraphs');
    expect(prompt).toContain('READ ALOUD');
    expect(prompt).toContain('200-320 words');
    expect(prompt).toContain('native-language');
    expect(prompt).toContain('SECOND part');
  });

  it('checks read-aloud answers against the passage', () => {
    const system = buildSpeechFeedbackSystemPrompt({
      targetLanguageName: 'English',
      nativeLanguageName: 'Polish',
      isReadAloud: true,
    });
    const user = buildSpeechFeedbackUserPrompt({
      partContentMD: 'Yesterday I visited my friend.',
      userVoiceTranscript: 'Yesterday I visited my friend.',
      isReadAloud: true,
    });

    expect(system).toContain('read-aloud');
    expect(system).not.toContain('This is not a quiz item');
    expect(user).toContain('read this text aloud');
  });
});
