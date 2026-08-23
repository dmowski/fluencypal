jest.mock('@/appRouterI18n', () => ({
  getI18nInstance: (lang: string) => ({ _: (s: string) => s }),
}));

import { formatBlogAuthorLine } from './BlogAuthors';

const i18n = { _: (s: string) => s };

describe('formatBlogAuthorLine', () => {
  it('formats author and co-author with an optional note', () => {
    expect(formatBlogAuthorLine({ role: 'author', name: 'Alex Dmowski' }, i18n)).toBe(
      'Author: Alex Dmowski',
    );
    expect(
      formatBlogAuthorLine(
        {
          role: 'coAuthor',
          name: 'Chat GPT 5.1',
          note: 'Grammar correction and editing',
        },
        i18n,
      ),
    ).toBe('Co-Author: Chat GPT 5.1 (Grammar correction and editing)');
  });
});
