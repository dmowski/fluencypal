import { buildNewsDiscussionPrompt } from './buildNewsDiscussionPrompt';
import { NewsItem } from './types';

const baseItem: NewsItem = {
  id: 'n1',
  title: 'Election results announced',
  subTitle: 'Sub',
  titleOrigin: 'Election results announced',
  subTitleOrigin: 'Sub',
  content_origin: 'Original body',
  imageUrl: '',
  sourceImageUrl: '',
  dateIso: '2026-05-16T00:00:00.000Z',
  dayKey: '2026-05-16',
  countryCode: 'us',
  countryName: 'United States',
  languageCode: 'en',
  languageName: 'English',
  sourceUrl: 'https://example.com/x',
  category: 'general',
  tags: ['politics'],
  versions: {
    beginner: 'Beginner body',
    middle: 'Middle body',
    advance: 'Advance body',
  },
  createdAtIso: '2026-05-16T00:00:00.000Z',
};

describe('buildNewsDiscussionPrompt', () => {
  it('includes the title, country, language, and the version for the requested complexity', () => {
    const prompt = buildNewsDiscussionPrompt(baseItem, 'beginner');
    expect(prompt).toContain('Election results announced');
    expect(prompt).toContain('United States');
    expect(prompt).toContain('English');
    expect(prompt).toContain('Beginner body');
    expect(prompt).toContain('Level: Beginner');
  });

  it('falls back to the middle version when the requested one is missing', () => {
    const item: NewsItem = {
      ...baseItem,
      versions: {
        beginner: '',
        middle: 'Fallback middle',
        advance: '',
      },
    };
    const prompt = buildNewsDiscussionPrompt(item, 'advance');
    // `advance` is the empty string -> falsy -> falls back to middle.
    expect(prompt).toContain('Fallback middle');
  });

  it('falls back to content_origin when versions are null', () => {
    const item: NewsItem = { ...baseItem, versions: null };
    const prompt = buildNewsDiscussionPrompt(item, 'middle');
    expect(prompt).toContain('Original body');
  });

  it('instructs the AI not to re-explain the facts and to ask questions', () => {
    const prompt = buildNewsDiscussionPrompt(baseItem, 'middle');
    expect(prompt).toContain('NOT re-explain');
    expect(prompt).toContain('Ask one focused question');
  });
});
