import '@testing-library/jest-dom';
import { splitTextIntoSentences } from './splitTextIntoSentences';

describe('splitTextIntoSentences', () => {
  it('splits provided example into two full sentences without standalone punctuation token', () => {
    const text =
      'In a quiet corner of a great city, there was a library unlike any other. Inside, there was a magnificent ceiling painted with beautiful images.';

    const result = splitTextIntoSentences(text);

    expect(result).toEqual([
      'In a quiet corner of a great city, there was a library unlike any other.',
      'Inside, there was a magnificent ceiling painted with beautiful images.',
    ]);
  });

  it('handles mixed punctuation and extra spaces', () => {
    const result = splitTextIntoSentences('Hello world!   Are you ready? Yes, I am.');

    expect(result).toEqual(['Hello world!', 'Are you ready?', 'Yes, I am.']);
  });

  it('returns empty array for blank text', () => {
    expect(splitTextIntoSentences('   ')).toEqual([]);
  });
});
