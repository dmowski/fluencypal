import { buildParagraphTokenMap, validateParagraphTokenMap } from './paragraphTokenMap';

const expectFullCoverage = (words: string[]) => {
  const map = buildParagraphTokenMap(words);
  expect(validateParagraphTokenMap(map)).toBeNull();
  // Reconstruct paragraphText from token coverage.
  const reconstructed = map.tokens
    .map((t) => map.paragraphText.slice(t.sourceStart, t.sourceEndExclusive))
    .join('');
  expect(reconstructed).toBe(map.paragraphText);
  return map;
};

describe('buildParagraphTokenMap', () => {
  describe('coverage invariants', () => {
    const fixtures: Array<{ name: string; words: string[] }> = [
      {
        name: 'plain text',
        words: ['Whenever', 'you', 'feel', 'like', 'criticizing', 'anyone'],
      },
      { name: 'single word', words: ['hello'] },
      { name: 'bold inline', words: ['I', 'have', '**never**', 'found'] },
      { name: 'italic inline', words: ['He', 'said', '_remember_', 'this'] },
      { name: 'bold with trailing punctuation', words: ['**Title**:', 'Pride'] },
      { name: 'inline link single-word', words: ['Visit', '[here](https://x.io)', 'today'] },
      { name: 'inline image single-word', words: ['![alt](pic.png)'] },
      { name: 'smart quotes & em-dash', words: ['She', 'whispered—', '“just', 'remember,”'] },
      { name: 'em-dash split word (for—)', words: ['hoping', 'for—', 'and', 'what'] },
      { name: 'mixed emphasis run', words: ['**Bold**', 'and', '_italic_', 'mix.'] },
      { name: 'word with leading punctuation', words: ['"Quoted', 'text"', 'ends.'] },
      {
        name: 'gatsby-like opening paragraph',
        words: [
          'Whenever',
          'you',
          'feel',
          'like',
          'criticizing',
          'anyone,',
          'just',
          'remember',
          'that',
          'all',
          'the',
          'people',
          'in',
          'this',
          'world',
          "haven't",
          'had',
          'the',
          'advantages',
          "you've",
          'had.',
        ],
      },
    ];

    fixtures.forEach(({ name, words }) => {
      it(`covers paragraphText exactly once for: ${name}`, () => {
        expectFullCoverage(words);
      });
    });
  });

  describe('token shapes', () => {
    it('emits decorator + word + decorator for **bold**', () => {
      const map = buildParagraphTokenMap(['**bold**']);
      expect(map.tokens).toEqual([
        { kind: 'decorator', markdownChars: '**', sourceStart: 0, sourceEndExclusive: 2 },
        { kind: 'word', text: 'bold', sourceStart: 2, sourceEndExclusive: 6, wordIndex: 0 },
        { kind: 'decorator', markdownChars: '**', sourceStart: 6, sourceEndExclusive: 8 },
      ]);
    });

    it('keeps trailing punctuation as a separate word token after closing decorator', () => {
      const map = buildParagraphTokenMap(['**Title**:']);
      expect(map.tokens).toEqual([
        { kind: 'decorator', markdownChars: '**', sourceStart: 0, sourceEndExclusive: 2 },
        { kind: 'word', text: 'Title', sourceStart: 2, sourceEndExclusive: 7, wordIndex: 0 },
        { kind: 'decorator', markdownChars: '**', sourceStart: 7, sourceEndExclusive: 9 },
        { kind: 'word', text: ':', sourceStart: 9, sourceEndExclusive: 10, wordIndex: 0 },
      ]);
    });

    it('emits a single link token for [text](href)', () => {
      const map = buildParagraphTokenMap(['[click](https://x)']);
      expect(map.tokens).toHaveLength(1);
      const [token] = map.tokens;
      expect(token.kind).toBe('link');
      if (token.kind === 'link') {
        expect(token.visibleText).toBe('click');
        expect(token.href).toBe('https://x');
        expect(token.wordIndex).toBe(0);
      }
    });

    it('emits a single image token for ![alt](src)', () => {
      const map = buildParagraphTokenMap(['![alt](pic.png)']);
      expect(map.tokens).toHaveLength(1);
      const [token] = map.tokens;
      expect(token.kind).toBe('image');
      if (token.kind === 'image') {
        expect(token.visibleText).toBe('alt');
        expect(token.href).toBe('pic.png');
      }
    });

    it('emits a space token between every word', () => {
      const map = buildParagraphTokenMap(['a', 'b', 'c']);
      const spaces = map.tokens.filter((t) => t.kind === 'space');
      expect(spaces).toHaveLength(2);
    });

    it('does not emit a trailing space after the last word', () => {
      const map = buildParagraphTokenMap(['only', 'two']);
      expect(map.tokens[map.tokens.length - 1].kind).not.toBe('space');
    });

    it('strips a leading-only decorator when the closing decorator lives on a later source word', () => {
      // markdown-to-jsx pairs `**` across word boundaries: `**criticizing anyone**,”`
      // renders as bold "criticizing anyone" then `,”`. The leading `**` on the
      // first source word and the trailing `**` on the second must be stripped.
      const map = buildParagraphTokenMap(['**criticizing', 'anyone**,”']);
      const wordTokens = map.tokens.filter((t) => t.kind === 'word');
      expect(wordTokens.map((t) => (t.kind === 'word' ? t.text : ''))).toEqual([
        'criticizing',
        'anyone',
        ',”',
      ]);
      const [criticizing] = wordTokens;
      if (criticizing.kind === 'word') {
        // 'criticizing' starts at offset 2 (after the leading **) in the source word.
        expect(criticizing.sourceStart).toBe(2);
        expect(criticizing.sourceEndExclusive).toBe(2 + 'criticizing'.length);
      }
    });

    it('preserves words[] index across decorator-stripped words', () => {
      const map = buildParagraphTokenMap(['plain', '_italic_', 'after']);
      const wordTokens = map.tokens.filter((t) => t.kind === 'word');
      expect(wordTokens.map((t) => (t.kind === 'word' ? t.wordIndex : -1))).toEqual([0, 1, 2]);
    });
  });

  describe('lookups', () => {
    it('tokenAtSourceOffset returns the correct token for any offset', () => {
      const map = buildParagraphTokenMap(['hi', 'there']);
      // 'hi there' offsets: 0 h, 1 i, 2 space, 3 t, 4 h, 5 e, 6 r, 7 e
      expect(map.tokenAtSourceOffset(0)?.kind).toBe('word');
      expect(map.tokenAtSourceOffset(2)?.kind).toBe('space');
      expect(map.tokenAtSourceOffset(7)?.kind).toBe('word');
      expect(map.tokenAtSourceOffset(8)).toBeNull();
      expect(map.tokenAtSourceOffset(-1)).toBeNull();
    });

    it('sourceRangeForRenderedSlice expands to enclosing token boundaries', () => {
      const map = buildParagraphTokenMap(['hello', 'world']);
      const range = map.sourceRangeForRenderedSlice(1, 4); // inside 'hello'
      expect(range).toEqual({ sourceStart: 0, sourceEndExclusive: 5 });
    });
  });
});
