import { normalizeWordsToLearn } from './normalizeWordsToLearn';

describe('normalizeWordsToLearn', () => {
  it('lowercases string arrays', () => {
    expect(normalizeWordsToLearn(['Hello', ' WORLD '])).toEqual(['hello', 'world']);
  });

  it('extracts word fields from objects', () => {
    expect(normalizeWordsToLearn([{ word: 'Cat' }, { text: 'Dog' }])).toEqual(['cat', 'dog']);
  });

  it('drops invalid entries and non-arrays', () => {
    expect(normalizeWordsToLearn([null, {}, 12, 'Ok'])).toEqual(['12', 'ok']);
    expect(normalizeWordsToLearn({ words: ['a'] })).toEqual([]);
  });
});
