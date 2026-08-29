import { buildFirstLessonUserPrompt, buildNextLessonUserPrompt } from './buildLessonPrompts';
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
});
