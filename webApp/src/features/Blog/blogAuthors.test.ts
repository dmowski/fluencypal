import { formatBlogAuthorLine, makeEmptyAuthor, sanitizeBlogAuthors } from './blogAuthors';

describe('sanitizeBlogAuthors', () => {
  it('drops empty names and trims fields', () => {
    expect(
      sanitizeBlogAuthors([
        { role: 'author', name: '  Alex Dmowski  ', note: '  ' },
        { role: 'coAuthor', name: '', note: 'ignored' },
        { role: 'coAuthor', name: ' Chat GPT 5.1 ', note: ' Grammar correction and editing ' },
      ]),
    ).toEqual([
      { role: 'author', name: 'Alex Dmowski' },
      { role: 'coAuthor', name: 'Chat GPT 5.1', note: 'Grammar correction and editing' },
    ]);
  });

  it('treats unknown roles as author and missing lists as empty', () => {
    expect(sanitizeBlogAuthors(undefined)).toEqual([]);
    expect(
      sanitizeBlogAuthors([{ role: 'editor' as 'author', name: 'Alex' }]),
    ).toEqual([{ role: 'author', name: 'Alex' }]);
  });
});

describe('formatBlogAuthorLine', () => {
  it('formats author and co-author with an optional note', () => {
    expect(formatBlogAuthorLine({ role: 'author', name: 'Alex Dmowski' })).toBe(
      'Author: Alex Dmowski',
    );
    expect(
      formatBlogAuthorLine({
        role: 'coAuthor',
        name: 'Chat GPT 5.1',
        note: 'Grammar correction and editing',
      }),
    ).toBe('Co-Author: Chat GPT 5.1 (Grammar correction and editing)');
  });
});

describe('makeEmptyAuthor', () => {
  it('defaults to an empty author row', () => {
    expect(makeEmptyAuthor()).toEqual({ role: 'author', name: '', note: '' });
    expect(makeEmptyAuthor('coAuthor').role).toBe('coAuthor');
  });
});
