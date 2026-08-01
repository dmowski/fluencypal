import { splitIntoSentenceParts } from './splitIntoSentenceParts';

describe('splitIntoSentenceParts', () => {
  it('keeps quoted sentences that end with a period before the closing quote', () => {
    const quoted =
      '“I didn’t use fine-tuning because I didn’t find it very useful for my project.”';

    expect(splitIntoSentenceParts(quoted)).toEqual([quoted]);
  });

  it('splits multiple normal sentences', () => {
    expect(splitIntoSentenceParts('Hello. World.')).toEqual(['Hello. ', 'World.']);
  });

  it('preserves example lines with trailing quoted sentences', () => {
    const text =
      'Example:  “Tokenization helps an AI model process a sentence one token at a time.”';

    expect(splitIntoSentenceParts(text)).toEqual([text]);
  });
});
